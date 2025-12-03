import bcrypt
import jwt
import time
from typing import Optional
import logging

SECRET_KEY = "super-secret-key-change-this-in-production"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    try:
        pwd_bytes = password.encode("utf-8")
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode("utf-8")
    except Exception as e:
        logging.exception(f"Error hashing password: {e}")
        raise


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        logging.exception(f"Error verifying password: {e}")
        return False


def create_access_token(data: dict, expires_delta: int = 3600 * 24 * 7) -> str:
    """Create a JWT access token. Default expiry: 7 days."""
    try:
        to_encode = data.copy()
        expire = time.time() + expires_delta
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logging.exception(f"Error creating token: {e}")
        return ""


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token."""
    try:
        decoded_jwt = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_jwt
    except Exception as e:
        logging.exception(f"Error decoding token: {e}")
        return None