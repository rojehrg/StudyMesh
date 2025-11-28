import reflex as rx
from typing import Optional
from sqlmodel import select, or_, delete
import random
import string
import logging
import itertools
from app.models import Class, ClassMember, User, Profile, CompatibilityScore
from app.states.auth_state import AuthState
from app.utils.matching import calculate_compatibility
import reflex_enterprise as rxe
from reflex_enterprise.components.flow.types import Edge, Node
import math


class ScoreBreakdown(rx.Base):
    style: int
    time: int
    strengths: int
    goals: int
    reliability: int
    location: int
    availability: int
    final: int


class RecommendedPartner(rx.Base):
    partner_name: str
    partner_email: str
    score: int
    breakdown: ScoreBreakdown
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
    is_calculating_matches: bool = False
    graph_nodes: list[Node] = []
    graph_edges: list[Edge] = []
    selected_student_id: int = -1
    selected_student_details: Optional[dict] = None
    show_student_modal: bool = False
    micro_group_suggestions: list[MicroGroupSuggestion] = []

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
            return rx.toast.error("Class name and school are required.")
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
            member = ClassMember(class_id=new_class.id, user_id=auth_state.user_id)
            session.add(member)
            session.commit()
            self.new_class_name = ""
            self.new_class_professor = ""
            self.new_class_term = ""
            self.new_class_school = ""
        return [rx.toast.success(f"Class created! Code: {code}"), rx.redirect("/")]

    @rx.event
    async def join_class(self):
        """Join an existing class."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return rx.toast.error("Unauthorized")
        if not self.join_class_code:
            return rx.toast.error("Please enter a class code.")
        code = self.join_class_code.strip().upper()
        with rx.session() as session:
            class_obj = session.exec(
                select(Class).where(Class.class_code == code)
            ).first()
            if not class_obj:
                return rx.toast.error("Class not found. Please check the code.")
            existing_member = session.exec(
                select(ClassMember).where(
                    ClassMember.class_id == class_obj.id,
                    ClassMember.user_id == auth_state.user_id,
                )
            ).first()
            if existing_member:
                return rx.toast.info("You are already a member of this class.")
            member = ClassMember(class_id=class_obj.id, user_id=auth_state.user_id)
            session.add(member)
            session.commit()
            self.join_class_code = ""
        return [
            rx.toast.success("Successfully joined class!"),
            rx.redirect(f"/classes/{class_obj.id}"),
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
                    result = calculate_compatibility(profile_a, profile_b)
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
        for i, member in enumerate(self.current_class_members):
            angle = 2 * math.pi * i / (member_count if member_count > 0 else 1)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            profile = member_profiles.get(member.id)
            style_color = "#E0E7FF"
            if profile:
                if profile.study_style == "Visual":
                    style_color = "#DBEAFE"
                elif profile.study_style == "Practice-based":
                    style_color = "#DCFCE7"
                elif profile.study_style == "Discussion-based":
                    style_color = "#FEF3C7"
                elif profile.study_style == "Memorization":
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
                        name=f"Study Group {len(suggestions) + 1}",
                        members=member_names,
                        avg_score=int(
                            group_score_sum / (1 if len(group_members) == 2 else 3)
                        ),
                        reason="High compatibility in study styles and goals",
                    )
                )
                if len(suggestions) >= 3:
                    break
        self.micro_group_suggestions = suggestions

    @rx.event
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
                        "reliability": profile.reliability,
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
                    recommendations.append(
                        RecommendedPartner(
                            partner_name=partner.name,
                            partner_email=partner.email,
                            score=score.score,
                            breakdown=ScoreBreakdown(**score.score_breakdown),
                            partner_id=partner.id,
                        )
                    )
            self.recommended_partners = recommendations

    @rx.event
    async def delete_class(self):
        """Delete the current class (Creator only)."""
        auth_state = await self.get_state(AuthState)
        if not self.current_class:
            return
        if self.current_class.created_by != auth_state.user_id:
            return rx.toast.error("Unauthorized")
        with rx.session() as session:
            session.exec(delete(Class).where(Class.id == self.current_class.id))
            session.commit()
        return [rx.toast.success("Class deleted."), rx.redirect("/")]