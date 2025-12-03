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
    # Use DATABASE_URL if available (Production), otherwise fallback to local sqlite
    db_url = os.getenv("DATABASE_URL") or os.getenv("REFLEX_DB_URL", "sqlite:///reflex.db")
    
    # Ensure it starts with postgresql:// if it's a postgres url (sometimes it's postgres://)
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    try:
        engine = create_engine(db_url, echo=False)
        SQLModel.metadata.create_all(engine)
        logging.info(f"Database tables initialized successfully.")
    except Exception as e:
        logging.exception(f"Error initializing database tables: {e}")
