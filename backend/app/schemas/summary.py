from pydantic import BaseModel


class TopicSummary(BaseModel):
    topic_id: int
    summary: str