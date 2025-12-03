import reflex as rx
from typing import Optional
from sqlmodel import select, delete
import random
import string
import logging
from datetime import datetime
from app.models import (
    MicroGroup,
    MicroGroupMember,
    User,
    Class,
    CompatibilityScore,
    Profile,
)
from app.states.auth_state import AuthState
from app.utils.matching import calculate_compatibility


class MicroGroupState(rx.State):
    """State management for micro groups."""

    user_groups: list[MicroGroup] = []
    current_group: Optional[MicroGroup] = None
    current_group_members: list[User] = []
    available_classmates: list[User] = []
    selected_classmate_ids: list[int] = []
    new_group_name: str = ""
    new_group_description: str = ""
    target_class_id: int = -1
    join_group_code: str = ""
    intro_message_template: str = "Casual"
    generated_intro_message: str = ""
    avg_compatibility: int = 0
    common_strengths: list[str] = []
    common_availability: list[str] = []

    def _generate_group_code(self) -> str:
        """Generate a unique 6-character group code."""
        chars = string.ascii_uppercase + string.digits
        return "".join((random.choice(chars) for _ in range(6)))

    @rx.event
    async def load_user_groups(self):
        """Load all groups the user is a member of."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        with rx.session() as session:
            groups = session.exec(
                select(MicroGroup)
                .join(MicroGroupMember)
                .where(MicroGroupMember.user_id == auth_state.user_id)
                .order_by(MicroGroup.created_at.desc())
            ).all()
            self.user_groups = groups

    @rx.event
    async def prepare_creation(self, class_id: int):
        """Prepare state for creating a new group in a specific class."""
        self.target_class_id = class_id
        self.selected_classmate_ids = []
        self.new_group_name = ""
        auth_state = await self.get_state(AuthState)
        with rx.session() as session:
            from app.models import ClassMember

            members = session.exec(
                select(User)
                .join(ClassMember)
                .where(ClassMember.class_id == class_id, User.id != auth_state.user_id)
            ).all()
            self.available_classmates = members

    @rx.event
    def toggle_classmate_selection(self, user_id: int):
        """Toggle selection of a classmate for group creation."""
        if user_id in self.selected_classmate_ids:
            self.selected_classmate_ids.remove(user_id)
        elif len(self.selected_classmate_ids) < 4:
            self.selected_classmate_ids.append(user_id)
        else:
            rx.toast.warning("Maximum 4 members allowed (plus yourself).")

    @rx.event
    async def create_group(self):
        """Create the micro group."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        if not self.new_group_name:
            return rx.toast.error("Group name is required.")
        if self.target_class_id == -1:
            return rx.toast.error("Invalid class context.")
        with rx.session() as session:
            code = self._generate_group_code()
            while session.exec(
                select(MicroGroup).where(MicroGroup.group_code == code)
            ).first():
                code = self._generate_group_code()
            new_group = MicroGroup(
                name=self.new_group_name,
                group_code=code,
                description=self.new_group_description,
                class_id=self.target_class_id,
                created_by=auth_state.user_id,
            )
            session.add(new_group)
            session.commit()
            session.refresh(new_group)
            creator_member = MicroGroupMember(
                group_id=new_group.id, user_id=auth_state.user_id
            )
            session.add(creator_member)
            for uid in self.selected_classmate_ids:
                member = MicroGroupMember(group_id=new_group.id, user_id=uid)
                session.add(member)
            session.commit()
        return [
            rx.toast.success("Circle created successfully!"),
            rx.redirect(f"/groups/{new_group.id}"),
        ]

    @rx.event
    async def join_group(self):
        """Join a group via code."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        code = self.join_group_code.strip().upper()
        if not code:
            return rx.toast.error("Please enter a code.")
        with rx.session() as session:
            group = session.exec(
                select(MicroGroup).where(MicroGroup.group_code == code)
            ).first()
            if not group:
                return rx.toast.error("Circle not found.")
            existing = session.exec(
                select(MicroGroupMember).where(
                    MicroGroupMember.group_id == group.id,
                    MicroGroupMember.user_id == auth_state.user_id,
                )
            ).first()
            if existing:
                return rx.toast.info("You are already part of this circle.")
            new_member = MicroGroupMember(group_id=group.id, user_id=auth_state.user_id)
            session.add(new_member)
            session.commit()
            self.join_group_code = ""
        return [rx.toast.success("Joined circle!"), rx.redirect(f"/groups/{group.id}")]

    @rx.event
    async def load_group_details(self):
        """Load details for a specific group."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        group_id_str = self.router.page.params.get("group_id")
        if not group_id_str:
            return
        try:
            group_id = int(group_id_str)
        except ValueError as e:
            logging.exception(f"Error parsing group_id: {e}")
            return
        with rx.session() as session:
            self.current_group = session.get(MicroGroup, group_id)
            if self.current_group:
                members_stmt = (
                    select(User)
                    .join(MicroGroupMember)
                    .where(MicroGroupMember.group_id == group_id)
                )
                self.current_group_members = session.exec(members_stmt).all()
                self.calculate_group_stats(session)
                self.generate_intro_message()

    @rx.event
    def calculate_group_stats(self, session):
        """Calculate stats for the current group."""
        if not self.current_group_members:
            return
        member_ids = [u.id for u in self.current_group_members]
        profiles = session.exec(
            select(Profile).where(Profile.user_id.in_(member_ids))
        ).all()
        if not profiles:
            return
        all_strengths = []
        for p in profiles:
            all_strengths.extend(p.strengths)
        strength_counts = {}
        for s in all_strengths:
            strength_counts[s] = strength_counts.get(s, 0) + 1
        threshold = len(member_ids) / 2
        self.common_strengths = [
            s for s, c in strength_counts.items() if c >= threshold
        ]
        total_score = 0
        pair_count = 0
        scores = session.exec(
            select(CompatibilityScore).where(
                CompatibilityScore.class_id == self.current_group.class_id,
                CompatibilityScore.user_a_id.in_(member_ids),
                CompatibilityScore.user_b_id.in_(member_ids),
            )
        ).all()
        if scores:
            total_score = sum((s.score for s in scores))
            pair_count = len(scores)
            self.avg_compatibility = (
                int(total_score / pair_count) if pair_count > 0 else 0
            )
        else:
            self.avg_compatibility = 0
        common_days = set(profiles[0].availability.keys())
        for p in profiles:
            has_avail_days = {d for d, times in p.availability.items() if times}
            common_days.intersection_update(has_avail_days)
        self.common_availability = list(common_days)

    @rx.event
    def update_intro_template(self, template: str):
        self.intro_message_template = template
        self.generate_intro_message()

    @rx.event
    def generate_intro_message(self):
        """Generate a static intro message based on template."""
        if not self.current_group:
            return
        class_name = "our pod"
        if self.current_group.class_instance:
            class_name = self.current_group.class_instance.class_name
        link = f"Join here: /groups/{self.current_group.id}"
        if self.intro_message_template == "Quick Win":
            self.generated_intro_message = (
                f"Hey team! 👋 I spun up a working circle called '{self.current_group.name}' "
                f"for {class_name}. Let's swarm this blocker together. {link}"
            )
        elif self.intro_message_template == "Deep Dive":
            self.generated_intro_message = (
                f"Hi all—'{self.current_group.name}' is now live to tackle our tougher enablement work for {class_name}. "
                f"Bring your insights so we can document best practices. {link}"
            )
        elif self.intro_message_template == "Shadowing":
            self.generated_intro_message = (
                f"Shadowing circle '{self.current_group.name}' is open for {class_name}. "
                f"Join if you’d like to pair up and learn hands-on. {link}"
            )
        else:
            self.generated_intro_message = (
                f"Join '{self.current_group.name}' to collaborate on {class_name}. {link}"
            )

    @rx.event
    async def remove_member(self, user_id: int):
        """Remove a member from the group."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated or not self.current_group:
            return
        if (
            self.current_group.created_by != auth_state.user_id
            and auth_state.user_id != user_id
        ):
            return rx.toast.error("Only the circle organizer can remove members.")
        with rx.session() as session:
            member = session.exec(
                select(MicroGroupMember).where(
                    MicroGroupMember.group_id == self.current_group.id,
                    MicroGroupMember.user_id == user_id,
                )
            ).first()
            if member:
                session.delete(member)
                session.commit()
                if user_id == auth_state.user_id:
                    return rx.redirect("/groups")
                else:
                    return [
                        rx.toast.success("Collaborator removed."),
                        MicroGroupState.load_group_details,
                    ]

    @rx.event
    def copy_group_code(self):
        """Copy circle code to clipboard."""
        if self.current_group:
            return rx.set_clipboard(self.current_group.group_code)

    @rx.event
    def create_from_suggestion(self, name: str, member_names: list[str], class_id: int):
        """Pre-fill creation form from suggestion."""
        self.new_group_name = name
        self.target_class_id = class_id
        return rx.redirect(f"/groups/create?class_id={class_id}")