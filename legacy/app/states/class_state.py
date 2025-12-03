import reflex as rx
from typing import Optional
from sqlmodel import select, or_, delete
import random
import string
import logging
import itertools
from app.models import Class, ClassMember, User, Profile, CompatibilityScore, Notification
from app.states.auth_state import AuthState
from app.utils.matching import calculate_compatibility
import reflex_enterprise as rxe
from reflex_enterprise.components.flow.types import Edge, Node
import math


class ScoreBreakdown(rx.Base):
    skill_gap: int
    department_diversity: int
    initiative_alignment: int
    availability: int
    collaboration_style: int
    business_unit: int
    soft_match: int
    reliability: int = 0
    final: int
    details: Optional[dict] = None


class RecommendedPartner(rx.Base):
    partner_name: str
    partner_email: str
    score: int
    breakdown: ScoreBreakdown
    match_reasons: list[str] = []
    partner_id: int


class MicroGroupSuggestion(rx.Base):
    name: str
    members: list[str]
    avg_score: int
    reason: str


class ClassState(rx.State):
    """State management for classes."""

    new_class_name: str = ""
    new_class_professor: str = ""
    new_class_term: str = ""
    new_class_school: str = ""
    join_class_code: str = ""
    user_classes: list[Class] = []
    current_class: Optional[Class] = None
    current_class_members: list[User] = []
    recommended_partners: list[RecommendedPartner] = []
    offer_support_queue: list[RecommendedPartner] = []  # People who can mentor me
    request_support_queue: list[RecommendedPartner] = []  # People I can mentor
    is_calculating_matches: bool = False
    graph_nodes: list[Node] = []
    graph_edges: list[Edge] = []
    selected_student_id: int = -1
    selected_student_details: Optional[dict] = None
    show_student_modal: bool = False
    micro_group_suggestions: list[MicroGroupSuggestion] = []
    # Support offer state
    show_offer_modal: bool = False
    offer_recipient_id: int = -1
    offer_recipient_name: str = ""
    offer_meeting_type: str = "zoom"  # 'zoom' | 'office' | 'hybrid'
    offer_zoom_link: str = ""
    offer_office_building: str = ""
    offer_office_room: str = ""
    offer_skill: str = ""

    def _generate_class_code(self) -> str:
        """Generate a unique 8-character class code."""
        chars = string.ascii_uppercase + string.digits
        return "".join((random.choice(chars) for _ in range(8)))

    @rx.event
    async def create_class(self):
        """Create a new class."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return rx.toast.error("Unauthorized")
        if not self.new_class_name or not self.new_class_school:
            return rx.toast.error("Pod name and business unit are required.")
        
        new_class_id = None
        new_class_code = None
        
        with rx.session() as session:
            code = self._generate_class_code()
            while session.exec(select(Class).where(Class.class_code == code)).first():
                code = self._generate_class_code()
            new_class = Class(
                class_code=code,
                class_name=self.new_class_name,
                school=self.new_class_school,
                professor=self.new_class_professor,
                term=self.new_class_term,
                created_by=auth_state.user_id,
            )
            session.add(new_class)
            session.commit()
            session.refresh(new_class)
            
            # Capture ID and Code immediately while attached and fresh
            new_class_id = new_class.id
            new_class_code = new_class.class_code
            
            member = ClassMember(class_id=new_class.id, user_id=auth_state.user_id)
            session.add(member)
            session.commit()
            
            self.new_class_name = ""
            self.new_class_professor = ""
            self.new_class_term = ""
            self.new_class_school = ""
            
        return [
            rx.toast.success(f"Pod created! Code: {new_class_code}"),
            rx.redirect(f"/classes/{new_class_id}"),
        ]

    @rx.event
    async def join_class(self):
        """Join an existing class."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return rx.toast.error("Unauthorized")
        if not self.join_class_code:
            return rx.toast.error("Please enter a pod code.")
        
        code = self.join_class_code.strip().upper()
        joined_class_id = None
        
        with rx.session() as session:
            class_obj = session.exec(
                select(Class).where(Class.class_code == code)
            ).first()
            if not class_obj:
                return rx.toast.error("Pod not found. Please check the code.")
            
            # Capture ID immediately
            joined_class_id = class_obj.id
            
            existing_member = session.exec(
                select(ClassMember).where(
                    ClassMember.class_id == class_obj.id,
                    ClassMember.user_id == auth_state.user_id,
                )
            ).first()
            if existing_member:
                return rx.toast.info("You are already part of this pod.")
            
            member = ClassMember(class_id=class_obj.id, user_id=auth_state.user_id)
            session.add(member)
            session.commit()
            self.join_class_code = ""
            
        return [
            rx.toast.success("Successfully joined pod!"),
            rx.redirect(f"/classes/{joined_class_id}"),
        ]

    @rx.event
    async def load_user_classes(self):
        """Load classes for the current user."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        with rx.session() as session:
            statement = (
                select(Class)
                .join(ClassMember)
                .where(ClassMember.user_id == auth_state.user_id)
            )
            self.user_classes = session.exec(statement).all()

    @rx.event
    async def load_class_details(self):
        """Load details for a specific class based on URL param."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        class_id_str = self.router.page.params.get("class_id")
        if not class_id_str:
            return
        try:
            class_id = int(class_id_str)
        except ValueError as e:
            logging.exception(f"Error parsing class_id: {e}")
            return
        with rx.session() as session:
            self.current_class = session.get(Class, class_id)
            if self.current_class:
                members_stmt = (
                    select(User)
                    .join(ClassMember)
                    .where(ClassMember.class_id == class_id)
                )
                self.current_class_members = session.exec(members_stmt).all()
        return ClassState.load_recommended_partners

    @rx.event
    async def calculate_class_matches(self):
        """Run matching algorithm for the entire class."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated or not self.current_class:
            return
        self.is_calculating_matches = True
        yield
        try:
            with rx.session() as session:
                member_ids = [u.id for u in self.current_class_members]
                profiles = session.exec(
                    select(Profile).where(Profile.user_id.in_(member_ids))
                ).all()
                profile_map = {p.user_id: p for p in profiles}
                session.exec(
                    delete(CompatibilityScore).where(
                        CompatibilityScore.class_id == self.current_class.id
                    )
                )
                for id_a, id_b in itertools.combinations(member_ids, 2):
                    profile_a = profile_map.get(id_a)
                    profile_b = profile_map.get(id_b)
                    if not profile_a or not profile_b:
                        continue
                    result = calculate_compatibility(profile_a, profile_b, self.current_class)
                    user_a, user_b = (id_a, id_b) if id_a < id_b else (id_b, id_a)
                    score_record = CompatibilityScore(
                        class_id=self.current_class.id,
                        user_a_id=user_a,
                        user_b_id=user_b,
                        score=result["final"],
                        score_breakdown=result,
                    )
                    session.add(score_record)
                session.commit()
        except Exception as e:
            logging.exception(f"Error calculating matches: {e}")
            yield rx.toast.error("Failed to calculate matches.")
        self.is_calculating_matches = False
        yield [
            rx.toast.success("Matches calculated!"),
            ClassState.load_recommended_partners,
            ClassState.generate_graph_data,
        ]

    @rx.event
    def generate_graph_data(self):
        """Generate nodes and edges for the class graph."""
        if not self.current_class:
            return
        nodes = []
        edges = []
        center_x = 400
        center_y = 300
        radius = 250
        member_count = len(self.current_class_members)
        member_profiles = {}
        with rx.session() as session:
            member_ids = [u.id for u in self.current_class_members]
            profiles = session.exec(
                select(Profile).where(Profile.user_id.in_(member_ids))
            ).all()
            member_profiles = {p.user_id: p for p in profiles}
            
        # Adjust radius based on number of members to keep them closer if few
        if member_count <= 1:
            radius = 0
        elif member_count <= 3:
            radius = 120
        elif member_count <= 6:
            radius = 180
        else:
            radius = 250
            
        for i, member in enumerate(self.current_class_members):
            angle = 2 * math.pi * i / (member_count if member_count > 0 else 1)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            profile = member_profiles.get(member.id)
            style_color = "#E0E7FF"
            if profile:
                if profile.study_style == "Product Enablement":
                    style_color = "#DBEAFE"
                elif profile.study_style == "Revenue Operations":
                    style_color = "#DCFCE7"
                elif profile.study_style == "Customer Success":
                    style_color = "#FEF3C7"
                elif profile.study_style == "Platform Implementation":
                    style_color = "#FCE7F3"
            nodes.append(
                {
                    "id": str(member.id),
                    "type": "studentNode",
                    "position": {"x": x, "y": y},
                    "data": {
                        "label": member.name,
                        "email": member.email,
                        "study_style": profile.study_style if profile else "Unknown",
                        "color": style_color,
                        "profile_complete": member.profile_complete,
                    },
                }
            )
        with rx.session() as session:
            scores = session.exec(
                select(CompatibilityScore)
                .where(CompatibilityScore.class_id == self.current_class.id)
                .where(CompatibilityScore.score > 50)
            ).all()
            for score in scores:
                opacity = (score.score - 50) / 50
                if opacity < 0.1:
                    opacity = 0.1
                edges.append(
                    {
                        "id": f"e{score.user_a_id}-{score.user_b_id}",
                        "source": str(score.user_a_id),
                        "target": str(score.user_b_id),
                        "style": {
                            "strokeWidth": max(1, int(score.score / 15)),
                            "stroke": "#6366F1",
                            "opacity": opacity,
                        },
                        "data": {"score": score.score},
                    }
                )
        self.graph_nodes = nodes
        self.graph_edges = edges
        self._generate_micro_groups()

    def _generate_micro_groups(self):
        """Generate micro group suggestions."""
        if not self.current_class:
            return
        suggestions = []
        with rx.session() as session:
            scores = session.exec(
                select(CompatibilityScore)
                .where(CompatibilityScore.class_id == self.current_class.id)
                .order_by(CompatibilityScore.score.desc())
            ).all()
            used_users = set()
            for score in scores:
                if score.user_a_id in used_users or score.user_b_id in used_users:
                    continue
                if score.score < 70:
                    continue
                group_members = [score.user_a_id, score.user_b_id]
                group_score_sum = score.score
                used_users.add(score.user_a_id)
                used_users.add(score.user_b_id)
                best_3rd = None
                best_3rd_avg = 0
                candidates = [
                    u.id for u in self.current_class_members if u.id not in used_users
                ]
                for cand_id in candidates:
                    score_a = session.exec(
                        select(CompatibilityScore).where(
                            CompatibilityScore.class_id == self.current_class.id,
                            or_(
                                (CompatibilityScore.user_a_id == cand_id)
                                & (CompatibilityScore.user_b_id == group_members[0]),
                                (CompatibilityScore.user_a_id == group_members[0])
                                & (CompatibilityScore.user_b_id == cand_id),
                            ),
                        )
                    ).first()
                    score_b = session.exec(
                        select(CompatibilityScore).where(
                            CompatibilityScore.class_id == self.current_class.id,
                            or_(
                                (CompatibilityScore.user_a_id == cand_id)
                                & (CompatibilityScore.user_b_id == group_members[1]),
                                (CompatibilityScore.user_a_id == group_members[1])
                                & (CompatibilityScore.user_b_id == cand_id),
                            ),
                        )
                    ).first()
                    if score_a and score_b:
                        avg = (score_a.score + score_b.score) / 2
                        if avg > 60 and avg > best_3rd_avg:
                            best_3rd = cand_id
                            best_3rd_avg = avg
                if best_3rd:
                    group_members.append(best_3rd)
                    group_score_sum += best_3rd_avg * 2
                    used_users.add(best_3rd)
                member_names = []
                for uid in group_members:
                    user = session.get(User, uid)
                    if user:
                        member_names.append(user.name)
                suggestions.append(
                    MicroGroupSuggestion(
                        name=f"Working Circle {len(suggestions) + 1}",
                        members=member_names,
                        avg_score=int(
                            group_score_sum / (1 if len(group_members) == 2 else 3)
                        ),
                        reason="Strong skill coverage and shared initiatives",
                    )
                )
                if len(suggestions) >= 3:
                    break
        self.micro_group_suggestions = suggestions

    @rx.event
    def set_show_offer_modal(self, show: bool):
        """Show/hide support offer modal."""
        self.show_offer_modal = show
        if not show:
            # Reset form when closing
            self.offer_recipient_id = -1
            self.offer_recipient_name = ""
            self.offer_meeting_type = "zoom"
            self.offer_zoom_link = ""
            self.offer_office_building = ""
            self.offer_office_room = ""
            self.offer_skill = ""

    @rx.event
    def set_offer_meeting_type(self, meeting_type: str):
        """Set meeting type for support offer."""
        self.offer_meeting_type = meeting_type

    @rx.event
    def set_offer_zoom_link(self, link: str):
        """Set zoom link for support offer."""
        self.offer_zoom_link = link

    @rx.event
    def set_offer_office_building(self, building: str):
        """Set office building for support offer."""
        self.offer_office_building = building

    @rx.event
    def set_offer_office_room(self, room: str):
        """Set office room for support offer."""
        self.offer_office_room = room

    @rx.event
    def set_offer_skill(self, skill: str):
        """Set skill being offered."""
        self.offer_skill = skill

    @rx.event
    def open_offer_modal(self, recipient_id: int, recipient_name: str):
        """Open support offer modal for a specific recipient."""
        self.offer_recipient_id = recipient_id
        self.offer_recipient_name = recipient_name
        self.show_offer_modal = True

    @rx.event
    async def create_support_offer(self):
        """Create a support offer with meeting details."""
        from app.models import SupportOffer
        
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated or not self.current_class:
            return rx.toast.error("Unauthorized")
        if not self.offer_skill:
            return rx.toast.error("Please specify the skill you're offering.")
        if self.offer_meeting_type in ["zoom", "hybrid"] and not self.offer_zoom_link:
            return rx.toast.error("Please provide a Zoom link.")
        if self.offer_meeting_type in ["office", "hybrid"] and not self.offer_office_building:
            return rx.toast.error("Please provide office building and room.")
        
        with rx.session() as session:
            offer = SupportOffer(
                pod_id=self.current_class.id,
                offerer_id=auth_state.user_id,
                recipient_id=self.offer_recipient_id,
                skill_offered=self.offer_skill,
                meeting_type=self.offer_meeting_type,
                zoom_link=self.offer_zoom_link if self.offer_meeting_type in ["zoom", "hybrid"] else None,
                office_building=self.offer_office_building if self.offer_meeting_type in ["office", "hybrid"] else None,
                office_room=self.offer_office_room if self.offer_meeting_type in ["office", "hybrid"] else None,
            )
            session.add(offer)
            session.commit()
        
        return [
            rx.toast.success(f"Support offer sent to {self.offer_recipient_name}!"),
            self.set_show_offer_modal(False),
        ]

    def select_student(self, node_id: str):
        """Handle node click to show student details."""
        try:
            uid = int(node_id)
            self.selected_student_id = uid
            with rx.session() as session:
                user = session.get(User, uid)
                profile = session.exec(
                    select(Profile).where(Profile.user_id == uid)
                ).first()
                if user and profile:
                    self.selected_student_details = {
                        "name": user.name,
                        "email": user.email,
                        "study_style": profile.study_style,
                        "goals": profile.academic_goal,
                        "strengths": ", ".join(profile.strengths),
                        "bio": profile.bio or "No bio provided.",
                    }
                    self.show_student_modal = True
        except ValueError as e:
            logging.exception(f"Error parsing node_id: {e}")

    @rx.event
    def close_student_modal(self):
        self.show_student_modal = False
        self.selected_student_details = None

    @rx.event
    async def load_recommended_partners(self):
        """Load top matches for the current user in this class."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated or not self.current_class:
            return
        with rx.session() as session:
            current_user_id = auth_state.user_id
            scores = session.exec(
                select(CompatibilityScore)
                .where(CompatibilityScore.class_id == self.current_class.id)
                .where(
                    or_(
                        CompatibilityScore.user_a_id == current_user_id,
                        CompatibilityScore.user_b_id == current_user_id,
                    )
                )
                .order_by(CompatibilityScore.score.desc())
                .limit(10)
            ).all()
            recommendations = []
            for score in scores:
                partner_id = (
                    score.user_b_id
                    if score.user_a_id == current_user_id
                    else score.user_a_id
                )
                partner = session.get(User, partner_id)
                if partner:
                    breakdown_data = dict(score.score_breakdown or {})
                    # Ensure all required fields exist with defaults
                    breakdown_data.setdefault("skill_gap", 0)
                    breakdown_data.setdefault("department_diversity", 0)
                    breakdown_data.setdefault("initiative_alignment", 0)
                    breakdown_data.setdefault("availability", 0)
                    breakdown_data.setdefault("collaboration_style", 0)
                    breakdown_data.setdefault("business_unit", 0)
                    breakdown_data.setdefault("soft_match", 0)
                    breakdown_data.setdefault("reliability", 0)
                    breakdown_data.setdefault("final", score.score)
                    
                    # Generate smart reasons
                    reasons = []
                    details = breakdown_data.get("details", {})
                    
                    if details:
                        # Smart structure
                        skills = details.get("skills", {})
                        a_mentors_b = skills.get("a_mentors_b", [])
                        b_mentors_a = skills.get("b_mentors_a", [])
                        
                        if current_user_id == score.user_a_id:
                            # I am A
                            for s in a_mentors_b: reasons.append(f"Offer help: {s}")
                            for s in b_mentors_a: reasons.append(f"Ask for help: {s}")
                        else:
                            # I am B
                            for s in a_mentors_b: reasons.append(f"Ask for help: {s}")
                            for s in b_mentors_a: reasons.append(f"Offer help: {s}")
                            
                        for p in details.get("projects", []): reasons.append(p)
                        if details.get("dept_diversity"): reasons.append("Cross-Department")
                        if details.get("high_availability"): reasons.append("Schedule Match")
                        
                    elif "reasons" in breakdown_data:
                        # Legacy fallback
                        reasons = breakdown_data["reasons"]
                    else:
                        # Basic fallback
                        if breakdown_data.get("skill_gap", 0) > 0: reasons.append("Complementary Skills")
                    
                    recommendations.append(
                        RecommendedPartner(
                            partner_name=partner.name,
                            partner_email=partner.email,
                            score=score.score,
                            breakdown=ScoreBreakdown(**breakdown_data),
                            match_reasons=reasons,
                            partner_id=partner.id,
                        )
                    )
            self.recommended_partners = recommendations
            # Also load Offer Support and Request Support queues
            await self.load_support_queues()

    @rx.event
    async def load_support_queues(self):
        """Load Offer Support (can mentor me) and Request Support (I can mentor) queues."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated or not self.current_class:
            return
        with rx.session() as session:
            current_user_id = auth_state.user_id
            current_profile = session.exec(
                select(Profile).where(Profile.user_id == current_user_id)
            ).first()
            if not current_profile:
                return
            
            # Get all compatibility scores for current user
            scores = session.exec(
                select(CompatibilityScore)
                .where(CompatibilityScore.class_id == self.current_class.id)
                .where(
                    or_(
                        CompatibilityScore.user_a_id == current_user_id,
                        CompatibilityScore.user_b_id == current_user_id,
                    )
                )
            ).all()
            
            offer_support = []  # People who can mentor me (they have expertise I need)
            request_support = []  # People I can mentor (I have expertise they need)
            
            current_growth = set(current_profile.growth_skills or [])
            current_expertise = set(current_profile.expertise_skills or current_profile.strengths or [])
            
            for score in scores:
                partner_id = (
                    score.user_b_id
                    if score.user_a_id == current_user_id
                    else score.user_a_id
                )
                partner = session.get(User, partner_id)
                partner_profile = session.exec(
                    select(Profile).where(Profile.user_id == partner_id)
                ).first()
                
                if not partner or not partner_profile:
                    continue
                
                breakdown_data = dict(score.score_breakdown or {})
                breakdown_data.setdefault("skill_gap", 0)
                breakdown_data.setdefault("department_diversity", 0)
                breakdown_data.setdefault("initiative_alignment", 0)
                breakdown_data.setdefault("availability", 0)
                breakdown_data.setdefault("collaboration_style", 0)
                breakdown_data.setdefault("business_unit", 0)
                breakdown_data.setdefault("soft_match", 0)
                breakdown_data.setdefault("reliability", 0)
                breakdown_data.setdefault("final", score.score)
                
                # We can't easily parse direction here without smart logic, 
                # but these queues are already direction-specific by definition
                reasons = [] 
                
                partner_data = RecommendedPartner(
                    partner_name=partner.name,
                    partner_email=partner.email,
                    score=score.score,
                    breakdown=ScoreBreakdown(**breakdown_data),
                    match_reasons=reasons,
                    partner_id=partner.id,
                )
                
                # Check if partner can mentor me (they have expertise in my growth areas)
                # Use fuzzy match here too if possible, but for queues we stick to simple overlap for speed
                # or import utility. 
                # For now keeping legacy set intersection for queues as it's just sorting
                partner_expertise = set(partner_profile.expertise_skills or partner_profile.strengths or [])
                if partner_expertise.intersection(current_growth):
                    offer_support.append(partner_data)
                
                # Check if I can mentor partner (I have expertise in their growth areas)
                partner_growth = set(partner_profile.growth_skills or [])
                if current_expertise.intersection(partner_growth):
                    request_support.append(partner_data)
            
            # Sort by skill gap score (highest first)
            offer_support.sort(key=lambda x: x.breakdown.skill_gap, reverse=True)
            request_support.sort(key=lambda x: x.breakdown.skill_gap, reverse=True)
            
            self.offer_support_queue = offer_support[:10]  # Top 10
            self.request_support_queue = request_support[:10]  # Top 10

    @rx.event
    async def delete_class(self):
        """Delete the current class (Creator only)."""
        auth_state = await self.get_state(AuthState)
        if not self.current_class:
            return
        if self.current_class.created_by != auth_state.user_id:
            return rx.toast.error("Unauthorized")
            
        class_id = self.current_class.id
        
        try:
            with rx.session() as session:
                # 1. Delete Support Offers
                from app.models import SupportOffer
                session.exec(delete(SupportOffer).where(SupportOffer.pod_id == class_id))
                
                # 2. Delete Compatibility Scores
                session.exec(delete(CompatibilityScore).where(CompatibilityScore.class_id == class_id))
                
                # 3. Delete MicroGroup Members and MicroGroups
                from app.models import MicroGroup, MicroGroupMember
                # Find all microgroups in this class
                groups = session.exec(select(MicroGroup).where(MicroGroup.class_id == class_id)).all()
                group_ids = [g.id for g in groups]
                
                if group_ids:
                    session.exec(delete(MicroGroupMember).where(MicroGroupMember.group_id.in_(group_ids)))
                    session.exec(delete(MicroGroup).where(MicroGroup.id.in_(group_ids)))
                
                # 4. Delete Class Members
                session.exec(delete(ClassMember).where(ClassMember.class_id == class_id))
                
                # 5. Delete Class
                session.exec(delete(Class).where(Class.id == class_id))
                
                session.commit()
                
            return [rx.toast.success("Pod archived."), rx.redirect("/dashboard")]
        except Exception as e:
            logging.exception(f"Error archiving pod: {e}")
            return rx.toast.error(f"Failed to archive pod: {str(e)}")

    @rx.event
    async def nudge_partner(self, partner_id: int):
        """Nudge a recommended partner with context."""
        # Find partner in recommendations
        partner = next((p for p in self.recommended_partners if p.partner_id == partner_id), None)
        context = ""
        if partner and partner.match_reasons:
            context = partner.match_reasons[0]
        
        return await self.nudge_user(partner_id, context)

    @rx.event
    async def nudge_user(self, recipient_id: int, context: str = ""):
        """Send a nudge notification to a user."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return rx.toast.error("Unauthorized")
            
        recipient_name = ""
        with rx.session() as session:
            recipient = session.get(User, recipient_id)
            if not recipient:
                return rx.toast.error("User not found.")
            
            recipient_name = recipient.name
            
            msg = f"{auth_state.user_name} nudged you to connect!"
            if context:
                msg = f"{auth_state.user_name} wants to connect: {context}"
                
            notification = Notification(
                sender_id=auth_state.user_id,
                recipient_id=recipient_id,
                type="nudge",
                content=msg,
            )
            session.add(notification)
            session.commit()
            
        return rx.toast.success(f"Nudged {recipient_name}!")
