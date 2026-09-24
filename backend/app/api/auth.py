from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse
from backend.app.services.auth_service import authenticate_user, create_user
from backend.app.services.audit_service import log_action
from backend.app.utils.security import create_access_token, get_current_user

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user["email"], "role": user.get("role", "viewer")})
    log_action(user.get("id"), "LOGIN", "user", user.get("id"))
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.get("id", "0000"),
            email=user["email"],
            full_name=user.get("full_name", "User"),
            role=user.get("role", "viewer"),
            is_active=user.get("is_active", True),
            created_at=user.get("created_at")
        )
    )

@router.post("/register", response_model=UserResponse)
async def register(request: UserCreate, current_user: dict = Depends(get_current_user)):
    user = create_user(request)
    log_action(current_user.get("email"), "REGISTER_USER", "user", user.get("email"))
    return UserResponse(
        id=user.get("id", "0000"),
        email=user["email"],
        full_name=user.get("full_name", "User"),
        role=user.get("role", "viewer"),
        is_active=user.get("is_active", True),
        created_at=user.get("created_at")
    )

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
