from pydantic import BaseModel
from typing import Optional


class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None


class Topic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
