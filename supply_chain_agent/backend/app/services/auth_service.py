from __future__ import annotations

import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.models.db_models import User, UserRole

ALGORITHM = "HS256"
BCRYPT_SHA256_PREFIX = "bcrypt_sha256$v=1$"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _password_bytes(password: str) -> bytes:
    return password.encode("utf-8")


def _prehash_password(password: str) -> bytes:
    digest = hashlib.sha256(_password_bytes(password)).digest()
    return base64.b64encode(digest)


def hash_password(password: str) -> str:
    hashed_password = bcrypt.hashpw(_prehash_password(password), bcrypt.gensalt()).decode("utf-8")
    return f"{BCRYPT_SHA256_PREFIX}{hashed_password}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    encoded_hash = hashed_password.encode("utf-8")
    try:
        if hashed_password.startswith(BCRYPT_SHA256_PREFIX):
            stored_hash = encoded_hash[len(BCRYPT_SHA256_PREFIX) :]
            return bcrypt.checkpw(_prehash_password(plain_password), stored_hash)
        if hashed_password.startswith("$2"):
            return bcrypt.checkpw(_password_bytes(plain_password), encoded_hash)
        return False
    except ValueError:
        return False


def create_access_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    expires_at = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "type": "access",
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    payload = {"sub": subject, "type": "refresh", "exp": expires_at}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def authenticate_user(db: Session, username_or_email: str, password: str) -> User | None:
    normalized = username_or_email.strip().lower()
    user = (
        db.query(User)
        .filter(or_(User.username == username_or_email.strip(), User.email == normalized))
        .first()
    )
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(
    db: Session,
    *,
    username: str,
    email: str,
    full_name: str,
    password: str,
    role: UserRole = UserRole.analyst,
) -> User:
    normalized_username = username.strip()
    normalized_email = email.strip().lower()
    if get_user_by_username(db, normalized_username):
        raise HTTPException(status_code=400, detail=f"Username '{normalized_username}' already exists")
    if get_user_by_email(db, normalized_email):
        raise HTTPException(status_code=400, detail=f"Email '{normalized_email}' already exists")

    user = User(
        username=normalized_username,
        email=normalized_email,
        full_name=full_name.strip(),
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(*roles: UserRole):
    async def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return dependency


require_admin = require_role(UserRole.admin)
require_analyst = require_role(UserRole.admin, UserRole.analyst)
require_viewer = require_role(UserRole.admin, UserRole.analyst, UserRole.viewer)
