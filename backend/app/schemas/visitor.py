# app/schemas/visitor.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class VisitorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: str = Field(..., max_length=20)

    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=15)

    address: str = Field(..., min_length=5, max_length=255)
    purpose: str = Field(..., min_length=3, max_length=255)

    person_to_meet: str = Field(..., min_length=2, max_length=100)
    person_email: EmailStr
    person_phone: str = Field(..., min_length=8, max_length=15)

    location: str = Field(..., min_length=3, max_length=100)
