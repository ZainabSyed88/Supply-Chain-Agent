from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


Role = Literal["admin", "user", "demo"]


class AuthUser(BaseModel):
    user_id: str
    name: str
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    role: Role
    created_at: datetime


class StoredUser(AuthUser):
    password_hash: str
    reset_code: str | None = None
    reset_expires_at: datetime | None = None


class StoredSession(BaseModel):
    token: str
    user_id: str
    created_at: datetime


class AuthStore(BaseModel):
    users: list[StoredUser] = Field(default_factory=list)
    sessions: dict[str, StoredSession] = Field(default_factory=dict)


class SignUpRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)
    role: Literal["user", "demo"] = "user"


class SignInRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ResetPasswordRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    reset_code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    token: str
    user: AuthUser


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_code: str
    expires_at: datetime
