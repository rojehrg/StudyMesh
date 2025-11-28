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


class Profile(SQLModel, table=True):
    """Student profile details."""

    __tablename__ = "profile"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="profile")
    study_style: str
    study_time_preference: str
    strengths: list[str] = Field(default=[], sa_column=Column(JSON))
    academic_goal: str
    reliability: int
    location_preference: str
    preferred_group_size: int
    availability: dict = Field(default={}, sa_column=Column(JSON))
    major: Optional[str] = None
    bio: Optional[str] = None


class Class(SQLModel, table=True):
    """Academic class/course model."""

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
    """Association between User and Class."""

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
    """Small study groups within a class."""

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
    """Association between User and MicroGroup."""

    __tablename__ = "micro_group_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="microgroup.id")
    user_id: int = Field(foreign_key="user.id")
    group: Optional[MicroGroup] = Relationship(back_populates="members")
    user: Optional[User] = Relationship(back_populates="micro_group_memberships")