from pydantic import BaseModel
from typing import Optional, Any, Union
from datetime import datetime
from uuid import UUID

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "viewer"

class UserResponse(BaseModel):
    id: Union[UUID, str]
    email: str
    full_name: Optional[str] = None
    role: str = "viewer"
    is_active: bool = True
    created_at: Optional[Union[datetime, str]] = None
