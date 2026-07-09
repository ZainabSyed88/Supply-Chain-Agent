from __future__ import annotations

import asyncio
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import User, UserRole
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
    decode_token,
    get_current_active_user,
    get_user_by_identifier,
    get_user_by_id,
    hash_password,
    require_admin,
    verify_password,
)
from app.services.email_service import password_reset_email_template, send_email, welcome_email_template

router = APIRouter()
PASSWORD_RESET_CODES: dict[str, tuple[str, datetime]] = {}
RESET_CODE_TTL_MINUTES = 15


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    email_alerts: bool | None = None
    alert_threshold: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=100)


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=120)


class ResetPasswordRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=120)
    reset_code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=100)
    confirm_password: str | None = Field(default=None, min_length=8, max_length=100)


class RoleUpdateRequest(BaseModel):
    role: UserRole


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "name": user.full_name,
        "role": user.role.value,
        "avatar_url": user.avatar_url,
        "email_alerts": user.email_alerts,
        "alert_threshold": user.alert_threshold,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


def _prune_expired_reset_codes() -> None:
    now = datetime.utcnow()
    expired_user_ids = [user_id for user_id, (_, expires_at) in PASSWORD_RESET_CODES.items() if expires_at <= now]
    for user_id in expired_user_ids:
        PASSWORD_RESET_CODES.pop(user_id, None)


def _generate_reset_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    user = create_user(
        db,
        username=body.username,
        email=body.email,
        full_name=body.full_name,
        password=body.password,
        role=UserRole.analyst,
    )
    asyncio.create_task(
        send_email(
            to_email=user.email,
            subject="Welcome to ChainPulse",
            html_body=welcome_email_template(user.full_name, user.username),
        )
    )
    return {
        "message": "Account created successfully",
        "user_id": user.id,
        "username": user.username,
    }


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.last_login = datetime.utcnow()
    db.commit()
    return LoginResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
        user=serialize_user(user),
    )


@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = get_user_by_id(db, payload.get("sub"))
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "access_token": create_access_token(user.id, user.role.value),
        "token_type": "bearer",
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_active_user)):
    return serialize_user(current_user)


@router.put("/me")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if body.full_name is not None:
        current_user.full_name = body.full_name
    if body.email is not None:
        current_user.email = str(body.email).lower()
    if body.email_alerts is not None:
        current_user.email_alerts = body.email_alerts
    if body.alert_threshold is not None:
        current_user.alert_threshold = body.alert_threshold
    db.commit()
    db.refresh(current_user)
    return serialize_user(current_user)


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    _prune_expired_reset_codes()
    user = get_user_by_identifier(db, body.identifier)
    generic_message = "If an account exists for that username or email, a reset code has been prepared."

    if user is None or not user.is_active:
        return {"message": generic_message}

    reset_code = _generate_reset_code()
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_CODE_TTL_MINUTES)
    PASSWORD_RESET_CODES[user.id] = (reset_code, expires_at)

    email_sent = await send_email(
        to_email=user.email,
        subject="ChainPulse password reset code",
        html_body=password_reset_email_template(user_name=user.full_name, reset_code=reset_code),
    )

    response = {
        "message": generic_message,
        "delivery": "email" if email_sent else "preview",
        "expires_at": expires_at.isoformat() + "Z",
    }
    if not email_sent:
        response["reset_code"] = reset_code
    return response


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    _prune_expired_reset_codes()

    if body.confirm_password is not None and body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    user = get_user_by_identifier(db, body.identifier)
    if user is None or not user.is_active:
        raise HTTPException(status_code=400, detail="Invalid reset request")

    reset_record = PASSWORD_RESET_CODES.get(user.id)
    if reset_record is None:
        raise HTTPException(status_code=400, detail="Reset code not found or expired")

    expected_code, expires_at = reset_record
    if expires_at <= datetime.utcnow():
        PASSWORD_RESET_CODES.pop(user.id, None)
        raise HTTPException(status_code=400, detail="Reset code not found or expired")
    if body.reset_code.strip() != expected_code:
        raise HTTPException(status_code=400, detail="Reset code is incorrect")

    user.hashed_password = hash_password(body.new_password)
    db.commit()
    PASSWORD_RESET_CODES.pop(user.id, None)
    return {"message": "Password reset successfully. Sign in with your new password."}


@router.post("/signout")
async def sign_out():
    return {"message": "Signed out successfully."}


@router.get("/users", dependencies=[Depends(require_admin)])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [serialize_user(user) for user in users]


@router.put("/users/{user_id}/role", dependencies=[Depends(require_admin)])
async def update_user_role(user_id: str, body: RoleUpdateRequest, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = body.role
    db.commit()
    db.refresh(user)
    return serialize_user(user)
