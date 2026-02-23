from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint, Identity
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="user") # 'admin', 'user'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, Identity(), primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(String(200)) # comma separated tags
    github_url = Column(String(255))
    demo_url = Column(String(255))
    powerbi_url = Column(String(500))
    thumbnail_s3 = Column(String(255))
    published_at = Column(DateTime, default=datetime.datetime.utcnow)

    images = relationship("ProjectImage", back_populates="project")
    comments = relationship("Comment", back_populates="project")

class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(Integer, Identity(), primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    s3_url = Column(String(255), nullable=False)
    caption = Column(String(100))

    project = relationship("Project", back_populates="images")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, Identity(), primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    author_name = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="comments")

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, Identity(), primary_key=True)
    target_type = Column(String(20), nullable=False) # 'project' or 'photo'
    target_id = Column(Integer, nullable=False)
    ip_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('target_type', 'target_id', 'ip_hash', name='uq_like'),
    )

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, Identity(), primary_key=True)
    event_type = Column(String(50), nullable=False) # 'page_view', 'cv_download', etc.
    target_id = Column(Integer) # e.g. project_id or photo_id if applicable
    ip_hash = Column(String(64))
    user_agent = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(100))
    email = Column(String(100))
    subject = Column(String(100))
    content = Column(Text)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

# Note: The RAG Portfolio table usually needs specific Vector Data Types 
# depending on Oracle's specific implementation of Vectors.
# In Oracle 23ai, it is usually handled directly by SQL or specific type declarations.
class RagPortfolio(Base):
    __tablename__ = "rag_portfolio"

    id = Column(Integer, Identity(), primary_key=True)
    source = Column(String(100)) # e.g. 'cv', 'project_1'
    content = Column(Text)
    # The actual vector column might require a raw SQL migration to define it as VECTOR(1536)
    # in SQLAlchemy, we may map it dynamically or just ignore the column in the simple class
    # and query it raw.
