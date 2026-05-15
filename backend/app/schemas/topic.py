from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None


class Topic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None