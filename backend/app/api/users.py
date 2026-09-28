from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from bson import ObjectId
import bcrypt
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer

from backend.app.database.mongo import get_mongo_db
from backend.app.utils.security import decode_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str

@router.get("", response_model=List[UserResponse])
def get_users(db = Depends(get_mongo_db), current_user = Depends(get_current_user)):
    users = list(db["users"].find({}))
    result = []
    for u in users:
        result.append(UserResponse(
            id=str(u.get("_id", "")),
            name=u.get("name", u.get("full_name", "")),
            email=u.get("email", ""),
            role=u.get("role", "viewer"),
            created_at=u.get("created_at", datetime.utcnow().isoformat())
        ))
    return result

@router.post("", response_model=UserResponse)
def create_user(user: UserCreate, db = Depends(get_mongo_db), current_user = Depends(get_current_user)):
    if db["users"].find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')
    new_user = {
        "name": user.name,
        "full_name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "created_at": datetime.utcnow().isoformat(),
        "is_active": True
    }
    res = db["users"].insert_one(new_user)
    new_user["id"] = str(res.inserted_id)
    return UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        created_at=new_user["created_at"]
    )

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_update: UserUpdate, db = Depends(get_mongo_db), current_user = Depends(get_current_user)):
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
        update_data["full_name"] = user_update.name
    if user_update.role is not None:
        update_data["role"] = user_update.role
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    res = db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    updated_user = db["users"].find_one({"_id": ObjectId(user_id)})
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user.get("name", updated_user.get("full_name", "")),
        email=updated_user.get("email", ""),
        role=updated_user.get("role", "viewer"),
        created_at=updated_user.get("created_at", datetime.utcnow().isoformat())
    )

@router.delete("/{user_id}")
def delete_user(user_id: str, db = Depends(get_mongo_db), current_user = Depends(get_current_user)):
    res = db["users"].delete_one({"_id": ObjectId(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "User deleted"}
