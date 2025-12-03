import reflex as rx
from typing import Optional
from datetime import datetime
from sqlalchemy import Column, JSON, DateTime
from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    """User account model."""

    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    name: str
    profile_complete: bool = Field(default=False)
    # Google OAuth fields
    google_id: Optional[str] = None
    google_email: Optional[str] = None
    avatar_url: Optional[str] = None
    oauth_provider: Optional[str] = Field(default="email")  # 'google' | 'email'
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), default=datetime.utcnow),
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), onupdate=datetime.utcnow),
    )
    profile: Optional["Profile"] = Relationship(back_populates="user")
    class_memberships: list["ClassMember"] = Relationship(back_populates="user")
    micro_group_memberships: list["MicroGroupMember"] = Relationship(
        back_populates="user"
    )
    sent_notifications: list["Notification"] = Relationship(
        back_populates="sender", sa_relationship_kwargs={"foreign_keys": "Notification.sender_id"}
    )
    received_notifications: list["Notification"] = Relationship(
        back_populates="recipient", sa_relationship_kwargs={"foreign_keys": "Notification.recipient_id"}
    )


class Profile(SQLModel, table=True):
    """Employee enablement profile details."""

    __tablename__ = "profile"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="profile")
    study_style: str
    study_time_preference: str
    strengths: list[str] = Field(default=[], sa_column=Column(JSON))  # Legacy - maps to expertise_skills
    expertise_skills: list[str] = Field(default=[], sa_column=Column(JSON))  # Skills employee can teach
    growth_skills: list[str] = Field(default=[], sa_column=Column(JSON))  # Skills employee wants to learn
    academic_goal: str
    reliability: int
    location_preference: str
    collaboration_preference: str = Field(default="hybrid")  # async, live, hybrid
    department: Optional[str] = None
    preferred_group_size: int
    availability: dict = Field(default={}, sa_column=Column(JSON))
    major: Optional[str] = None
    bio: Optional[str] = None
    current_projects: list[str] = Field(default=[], sa_column=Column(JSON))


class Class(SQLModel, table=True):
    """Enablement pod model."""

    __tablename__ = "class"
    id: Optional[int] = Field(default=None, primary_key=True)
    class_code: str = Field(unique=True, index=True)
    class_name: str
    school: str
    professor: str
    term: str
    created_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True))
    )
    members: list["ClassMember"] = Relationship(back_populates="class_instance")
    micro_groups: list["MicroGroup"] = Relationship(back_populates="class_instance")
    compatibility_scores: list["CompatibilityScore"] = Relationship(
        back_populates="class_instance"
    )


class ClassMember(SQLModel, table=True):
    """Association between a teammate and a pod."""

    __tablename__ = "class_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    class_id: int = Field(foreign_key="class.id")
    user_id: int = Field(foreign_key="user.id")
    joined_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True))
    )
    class_instance: Optional[Class] = Relationship(back_populates="members")
    user: Optional[User] = Relationship(back_populates="class_memberships")


class CompatibilityScore(SQLModel, table=True):
    """Calculated compatibility between two users in a class."""

    __tablename__ = "compatibility_score"
    id: Optional[int] = Field(default=None, primary_key=True)
    class_id: int = Field(foreign_key="class.id")
    class_instance: Optional[Class] = Relationship(
        back_populates="compatibility_scores"
    )
    user_a_id: int = Field(foreign_key="user.id")
    user_b_id: int = Field(foreign_key="user.id")
    score: int
    score_breakdown: dict[str, int] = Field(default={}, sa_column=Column(JSON))


class MicroGroup(SQLModel, table=True):
    """Working circles within a pod."""

    __tablename__ = "microgroup"
    id: Optional[int] = Field(default=None, primary_key=True)
    class_id: int = Field(foreign_key="class.id")
    class_instance: Optional[Class] = Relationship(back_populates="micro_groups")
    name: str
    group_code: str = Field(unique=True, index=True)
    description: Optional[str] = None
    created_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True))
    )
    members: list["MicroGroupMember"] = Relationship(back_populates="group")


class MicroGroupMember(SQLModel, table=True):
    """Association between a teammate and a working circle."""

    __tablename__ = "micro_group_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="microgroup.id")
    user_id: int = Field(foreign_key="user.id")
    group: Optional[MicroGroup] = Relationship(back_populates="members")
    user: Optional[User] = Relationship(back_populates="micro_group_memberships")


class SessionLog(SQLModel, table=True):
    """Enablement session logging - Phase 5 feature."""

    __tablename__ = "session_log"
    id: Optional[int] = Field(default=None, primary_key=True)
    circle_id: Optional[int] = Field(default=None, foreign_key="microgroup.id")
    pod_id: Optional[int] = Field(default=None, foreign_key="class.id")
    facilitator_id: int = Field(foreign_key="user.id")
    date: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True)),
    )
    summary: str
    topics: list[str] = Field(default=[], sa_column=Column(JSON))
    attendees: list[int] = Field(default=[], sa_column=Column(JSON))  # user_ids
    action_items: list[dict] = Field(default=[], sa_column=Column(JSON))  # [{"task": "...", "owner": user_id, "due": "..."}]
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True)),
    )


class SupportOffer(SQLModel, table=True):
    """Support offers with meeting location/zoom links."""

    __tablename__ = "support_offer"
    id: Optional[int] = Field(default=None, primary_key=True)
    pod_id: int = Field(foreign_key="class.id")
    offerer_id: int = Field(foreign_key="user.id")
    recipient_id: int = Field(foreign_key="user.id")
    skill_offered: str
    meeting_type: str = Field(default="zoom")  # 'zoom' | 'office' | 'hybrid'
    zoom_link: Optional[str] = None
    office_building: Optional[str] = None
    office_room: Optional[str] = None
    status: str = Field(default="pending")  # 'pending' | 'accepted' | 'completed' | 'cancelled'
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True)),
    )


class Notification(SQLModel, table=True):
    """User notifications."""

    __tablename__ = "notification"
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id")
    recipient_id: int = Field(foreign_key="user.id")
    type: str = Field(default="nudge")  # 'nudge' | 'system'
    content: str
    read: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True)),
    )
    
    sender: Optional[User] = Relationship(
        back_populates="sent_notifications", sa_relationship_kwargs={"foreign_keys": "Notification.sender_id"}
    )
    recipient: Optional[User] = Relationship(
        back_populates="received_notifications", sa_relationship_kwargs={"foreign_keys": "Notification.recipient_id"}
    )
