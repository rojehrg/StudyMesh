import reflex as rx
import logging
from typing import Any
from sqlmodel import select
from app.models import Profile, User
from app.states.auth_state import AuthState


class ProfileState(rx.State):
    """State management for user profile."""

    study_style: str = "Product Enablement"
    study_time_preference: str = "Morning Huddles"
    strengths: list[str] = []  # Legacy - maps to expertise_skills
    expertise_skills: list[str] = []  # Skills I can teach/mentor
    growth_skills: list[str] = []  # Skills I want to learn
    academic_goal: str = ""
    reliability: int = 0
    location_preference: str = "In-person"
    collaboration_preference: str = "hybrid"  # async, live, hybrid
    department: str = ""
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
    timezone: str = ""
    current_projects: list[str] = []
    study_style_options: list[str] = [
        "Product Enablement",
        "Revenue Operations",
        "Customer Success",
        "Platform Implementation",
    ]
    study_time_options: list[str] = [
        "Morning Huddles",
        "Midday Sessions",
        "Late-Day Reviews",
        "On-demand / Async",
    ]
    strength_options: list[str] = [
        "Product Launch Kits",
        "Process Automation",
        "Executive Briefings",
        "Change Management",
        "Customer Playbooks",
        "Data Insights",
        "Compliance Training",
    ]
    academic_goal_options: list[str] = [
        "Lead Initiative",
        "Co-own Deliverable",
        "Upskill Quickly",
        "Shadow & Support",
    ]
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
    collaboration_options: list[str] = ["async", "live", "hybrid"]
    
    # Input fields for tag functionality
    expertise_input: str = ""
    growth_input: str = ""

    @rx.event
    def set_study_style(self, value: str):
        """Set primary expertise area."""
        self.study_style = value

    @rx.event
    def set_expertise_input(self, value: str):
        """Set expertise input value."""
        self.expertise_input = value

    @rx.event
    def add_expertise_skill(self):
        """Add current expertise input to list."""
        if self.expertise_input and self.expertise_input.strip():
            val = self.expertise_input.strip()
            if val not in self.expertise_skills:
                self.expertise_skills.append(val)
            self.expertise_input = ""

    @rx.event
    def remove_expertise_skill(self, skill: str):
        """Remove an expertise skill from list."""
        if skill in self.expertise_skills:
            self.expertise_skills.remove(skill)

    @rx.event
    def set_growth_input(self, value: str):
        """Set growth input value."""
        self.growth_input = value

    @rx.event
    def add_growth_skill(self):
        """Add current growth input to list."""
        if self.growth_input and self.growth_input.strip():
            val = self.growth_input.strip()
            if val not in self.growth_skills:
                self.growth_skills.append(val)
            self.growth_input = ""

    @rx.event
    def remove_growth_skill(self, skill: str):
        """Remove a growth skill from list."""
        if skill in self.growth_skills:
            self.growth_skills.remove(skill)

    def toggle_expertise_skill(self, skill: str):
        """Toggle an expertise skill in the list."""
        if skill in self.expertise_skills:
            self.expertise_skills.remove(skill)
        else:
            self.expertise_skills.append(skill)
    
    def toggle_growth_skill(self, skill: str):
        """Toggle a growth skill in the list."""
        if skill in self.growth_skills:
            self.growth_skills.remove(skill)
        else:
            self.growth_skills.append(skill)

    @rx.event
    def set_reliability(self, value: str):
        """Set reliability score (1-5)."""
        try:
            self.reliability = int(value)
        except (ValueError, TypeError):
            self.reliability = 0

    @rx.event
    def set_current_projects(self, value: str):
        """Parse comma-separated projects string into list."""
        if not value:
            self.current_projects = []
        else:
            self.current_projects = [
                p.strip() for p in value.split(",") if p.strip()
            ]

    @rx.var
    def current_projects_str(self) -> str:
        """Convert current_projects list to comma-separated string."""
        if not self.current_projects:
            return ""
        return ", ".join(self.current_projects) if isinstance(self.current_projects, list) else ""

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

    def reset_defaults(self):
        """Reset all profile fields to default values."""
        self.study_style = "Product Enablement"
        self.study_time_preference = "Morning Huddles"
        self.strengths = []
        self.expertise_skills = []
        self.growth_skills = []
        self.academic_goal = ""
        self.reliability = 0
        self.location_preference = "In-person"
        self.collaboration_preference = "hybrid"
        self.department = ""
        self.preferred_group_size = "3-4"
        self.availability = {day: [] for day in self.days_of_week}
        self.major = ""
        self.bio = ""
        self.current_projects = []
        self.expertise_input = ""
        self.growth_input = ""

    @rx.event
    async def load_profile(self):
        """Load profile data from database."""
        # Always reset to defaults first to prevent data leakage
        self.reset_defaults()
        
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
                self.strengths = list(profile.strengths) if profile.strengths else []
                # Ensure expertise_skills and growth_skills are loaded as lists
                self.expertise_skills = list(profile.expertise_skills) if profile.expertise_skills else (list(profile.strengths) if profile.strengths else [])
                self.growth_skills = list(profile.growth_skills) if profile.growth_skills else []
                self.academic_goal = profile.academic_goal
                self.reliability = profile.reliability or 0
                self.location_preference = profile.location_preference
                self.collaboration_preference = profile.collaboration_preference or "hybrid"
                self.department = profile.department or ""
                
                # Map integer group size back to string option
                size = profile.preferred_group_size
                if size <= 2:
                    self.preferred_group_size = "1-2"
                elif size >= 5:
                    self.preferred_group_size = "4+"
                else:
                    self.preferred_group_size = "3-4"
                    
                loaded_avail = dict(profile.availability) if profile.availability else {}
                for day in self.days_of_week:
                    if day not in loaded_avail:
                        loaded_avail[day] = []
                self.availability = loaded_avail
                self.major = profile.major or ""
                self.bio = profile.bio or ""
                self.current_projects = list(profile.current_projects) if profile.current_projects else []

    @rx.event
    async def save_profile(self):
        """Save profile to database."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return rx.toast.error("You must be logged in to save profile.")
        
        # Update user name if it's still "Google User" or generic
        with rx.session() as session:
            from app.models import User
            user = session.get(User, auth_state.user_id)
            if user and (not user.name or user.name == "Google User" or user.name.startswith("Google")):
                # Try to extract name from email or use a default
                if self.major:  # Using major field as name if available
                    user.name = self.major
                elif auth_state.user_email:
                    # Extract name from email
                    email_name = auth_state.user_email.split("@")[0]
                    user.name = email_name.replace(".", " ").title()
                session.add(user)
                session.commit()
                auth_state.user_name = user.name
        
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
                    expertise_skills=self.expertise_skills or self.strengths,
                    growth_skills=self.growth_skills,
                    academic_goal=self.academic_goal,
                    reliability=self.reliability,
                    location_preference=self.location_preference,
                    collaboration_preference=self.collaboration_preference,
                    department=self.department,
                    preferred_group_size=group_size_int,
                    availability=self.availability,
                    major=self.major,
                    bio=self.bio,
                    current_projects=self.current_projects,
                )
                session.add(profile)
            else:
                profile.study_style = self.study_style
                profile.study_time_preference = self.study_time_preference
                profile.strengths = self.strengths
                profile.expertise_skills = self.expertise_skills or self.strengths
                profile.growth_skills = self.growth_skills
                profile.academic_goal = self.academic_goal
                profile.reliability = self.reliability
                profile.location_preference = self.location_preference
                profile.collaboration_preference = self.collaboration_preference
                profile.department = self.department
                profile.preferred_group_size = group_size_int
                profile.availability = self.availability
                profile.major = self.major
                profile.bio = self.bio
                profile.current_projects = self.current_projects
                session.add(profile)
            user = session.exec(
                select(User).where(User.id == auth_state.user_id)
            ).first()
            if user:
                user.profile_complete = True
                session.add(user)
                auth_state.user_profile_complete = True
            session.commit()
        return [rx.toast.success("Profile saved successfully!"), rx.redirect("/dashboard")]