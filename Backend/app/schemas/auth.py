from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.user import UserOut


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    company_name: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Usman Tariq",
                    "email": "usman@example.com",
                    "password": "Demo1234!",
                    "role": "student",
                }
            ]
        }
    }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = {
        "json_schema_extra": {
            "examples": [{"email": "usman@example.com", "password": "Demo1234!"}]
        }
    }


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
