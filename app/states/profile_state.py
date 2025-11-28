import reflex as rx
import logging
from typing import Any
from sqlmodel import select
from app.models import Profile, User
from app.states.auth_state import AuthState


class ProfileState(rx.State):
    """State management for user profile."""

    study_style: str = "Visual"
    study_time_preference: str = "Morning"
    strengths: list[str] = []
    academic_goal: str = "A"
    reliability: int = 3
    location_preference: str = "In-person"
    preferred_group_size: str = "3-4"
    availability: dict[str, list[str]] = {
        "Monday": [],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": [],
        "Sunday": [],
    }
    major: str = ""
    bio: str = ""
    timezone: str = "UTC"
    study_style_options: list[str] = [
        "Visual",
        "Practice-based",
        "Discussion-based",
        "Memorization",
    ]
    study_time_options: list[str] = ["Morning", "Afternoon", "Night", "Last Minute"]
    strength_options: list[str] = [
        "Writing",
        "Memorization",
        "Math",
        "Organization",
        "Research",
        "Slides",
        "Communication",
    ]
    academic_goal_options: list[str] = ["A", "B", "Pass", "Survival"]
    group_size_options: list[str] = ["1-2", "3-4", "4+"]
    days_of_week: list[str] = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]
    time_blocks: list[str] = ["Morning", "Afternoon", "Evening", "Night"]

    @rx.var
    def completion_percentage(self) -> int:
        """Calculate profile completeness percentage."""
        score = 0
        total_weight = 100
        if self.study_style:
            score += 10
        if self.study_time_preference:
            score += 10
        if self.strengths:
            score += 10
        if self.academic_goal:
            score += 10
        if self.reliability > 0:
            score += 10
        if self.location_preference:
            score += 10
        if self.major:
            score += 10
        if self.bio:
            score += 10
        has_avail = any(self.availability.values())
        if has_avail:
            score += 20
        return min(100, score)

    @rx.event
    def set_reliability_value(self, value: str):
        """Set reliability from string input."""
        try:
            self.reliability = int(float(value))
        except ValueError as e:
            logging.exception(f"Error parsing reliability value: {e}")

    @rx.event
    def toggle_strength(self, strength: str):
        """Toggle a strength in the list."""
        if strength in self.strengths:
            self.strengths.remove(strength)
        else:
            self.strengths.append(strength)

    @rx.event
    def set_availability(self, day: str, time_block: str, checked: bool):
        """Update availability grid."""
        current = self.availability.get(day, [])
        if checked:
            if time_block not in current:
                current.append(time_block)
        elif time_block in current:
            current.remove(time_block)
        self.availability[day] = current

    @rx.event
    async def load_profile(self):
        """Load profile data from database."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
        with rx.session() as session:
            profile = session.exec(
                select(Profile).where(Profile.user_id == auth_state.user_id)
            ).first()
            if profile:
                self.study_style = profile.study_style
                self.study_time_preference = profile.study_time_preference
                self.strengths = profile.strengths
                self.academic_goal = profile.academic_goal
                self.reliability = profile.reliability
                self.location_preference = profile.location_preference
                self.preferred_group_size = str(profile.preferred_group_size)
                loaded_avail = profile.availability or {}
                for day in self.days_of_week:
                    if day not in loaded_avail:
                        loaded_avail[day] = []
                self.availability = loaded_avail
                self.major = profile.major or ""
                self.bio = profile.bio or ""

    @rx.event
    async def save_profile(self):
        """Save profile to database."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return rx.toast.error("You must be logged in to save profile.")
        if not self.study_style or not self.study_time_preference:
            return rx.toast.error("Please fill in all required fields.")
        group_size_int = 3
        if self.preferred_group_size == "1-2":
            group_size_int = 2
        elif self.preferred_group_size == "3-4":
            group_size_int = 4
        elif self.preferred_group_size == "4+":
            group_size_int = 5
        with rx.session() as session:
            profile = session.exec(
                select(Profile).where(Profile.user_id == auth_state.user_id)
            ).first()
            if not profile:
                profile = Profile(
                    user_id=auth_state.user_id,
                    study_style=self.study_style,
                    study_time_preference=self.study_time_preference,
                    strengths=self.strengths,
                    academic_goal=self.academic_goal,
                    reliability=self.reliability,
                    location_preference=self.location_preference,
                    preferred_group_size=group_size_int,
                    availability=self.availability,
                    major=self.major,
                    bio=self.bio,
                )
                session.add(profile)
            else:
                profile.study_style = self.study_style
                profile.study_time_preference = self.study_time_preference
                profile.strengths = self.strengths
                profile.academic_goal = self.academic_goal
                profile.reliability = self.reliability
                profile.location_preference = self.location_preference
                profile.preferred_group_size = group_size_int
                profile.availability = self.availability
                profile.major = self.major
                profile.bio = self.bio
                session.add(profile)
            user = session.exec(
                select(User).where(User.id == auth_state.user_id)
            ).first()
            if user:
                user.profile_complete = True
                session.add(user)
                auth_state.user_profile_complete = True
            session.commit()
        return [rx.toast.success("Profile saved successfully!"), rx.redirect("/")]