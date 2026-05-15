from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional


class LearningInputCreate(BaseModel):
    input_type: Literal["quick_note", "pasted_text", "youtube_url"]
    content: str


class LearningInput(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic_id: int
    input_type: Literal["quick_note", "pasted_text", "youtube_url"]
    content: str
    created_at: Optional[datetime] = None