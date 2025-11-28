import reflex as rx
from sqlmodel import SQLModel, create_engine
import os
import logging
from app.models import (
    User,
    Profile,
    Class,
    ClassMember,
    CompatibilityScore,
    MicroGroup,
    MicroGroupMember,
)


def init_db():
    """Initialize the database by creating all tables defined in SQLModel models."""
    db_url = os.getenv("REFLEX_DB_URL", "sqlite:///reflex.db")
    try:
        engine = create_engine(db_url, echo=False)
        SQLModel.metadata.create_all(engine)
        logging.info(f"Database tables initialized successfully at {db_url}")
    except Exception as e:
        logging.exception(f"Error initializing database tables: {e}")