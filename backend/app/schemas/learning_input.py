from pydantic import BaseModel
from typing import Literal


class LearningInputCreate(BaseModel):
    input_type: Literal["quick_note", "pasted_text", "youtube_url"]
    content: str


class LearningInput(BaseModel):
    id: int
    topic_id: int
    input_type: Literal["quick_note", "pasted_text", "youtube_url"]
    content: str
