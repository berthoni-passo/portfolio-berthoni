from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None


# --- Project Images ---
class ProjectImageBase(BaseModel):
    s3_url: str
    caption: Optional[str] = None

class ProjectImageCreate(ProjectImageBase):
    pass

class ProjectImage(ProjectImageBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True


# --- Comments ---
class CommentBase(BaseModel):
    author_name: str
    content: str

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
    title: str
    description: str
    tags: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    powerbi_url: Optional[str] = None
    thumbnail_s3: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    published_at: datetime.datetime
    
    images: List[ProjectImage] = []
    comments: List[Comment] = []

    class Config:
        from_attributes = True


# --- Likes ---
class LikeCreate(BaseModel):
    target_type: str  # 'project' or 'photo'
    target_id: int


# --- Messages (Contact form) ---
class MessageCreate(BaseModel):
    name: str
    email: str
    subject: str
    content: str

class Message(MessageCreate):
    id: int
    sent_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Analytics ---
class AnalyticsCreate(BaseModel):
    event_type: str
    target_id: Optional[int] = None

class Analytics(AnalyticsCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
