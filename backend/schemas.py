from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import datetime
import re

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None


# --- Project Images ---
class ProjectImageBase(BaseModel):
    s3_url: str = Field(..., max_length=1000)
    caption: Optional[str] = Field(None, max_length=200)

class ProjectImageCreate(ProjectImageBase):
    pass

class ProjectImage(ProjectImageBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True


# --- Comments ---
class CommentBase(BaseModel):
    author_name: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1, max_length=2000)

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    project_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Projects ---
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    tags: Optional[str] = Field(None, max_length=500)
    github_url: Optional[str] = Field(None, max_length=500)
    demo_url: Optional[str] = Field(None, max_length=500)
    powerbi_url: Optional[str] = Field(None, max_length=500)
    thumbnail_s3: Optional[str] = Field(None, max_length=1000)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    tags: Optional[str] = Field(None, max_length=500)
    github_url: Optional[str] = Field(None, max_length=500)
    demo_url: Optional[str] = Field(None, max_length=500)
    powerbi_url: Optional[str] = Field(None, max_length=500)
    thumbnail_s3: Optional[str] = Field(None, max_length=1000)

class Project(ProjectBase):
    id: int
    published_at: datetime.datetime
    
    images: List[ProjectImage] = []
    comments: List[Comment] = []

    class Config:
        from_attributes = True


# --- Likes ---
class LikeCreate(BaseModel):
    target_type: str = Field(..., pattern="^(project|photo)$")  # whitelist strict
    target_id: int = Field(..., ge=1)


# --- Messages (Contact form) ---
class MessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., max_length=200)
    subject: str = Field(..., min_length=1, max_length=300)
    content: str = Field(..., min_length=1, max_length=5000)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$"
        if not re.match(pattern, v):
            raise ValueError("Email invalide")
        return v

class Message(MessageCreate):
    id: int
    sent_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Analytics ---
class AnalyticsCreate(BaseModel):
    event_type: str = Field(..., max_length=100, pattern="^[a-zA-Z0-9_]+$")  # alphanumeric only
    target_id: Optional[int] = Field(None, ge=1)

class Analytics(AnalyticsCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
