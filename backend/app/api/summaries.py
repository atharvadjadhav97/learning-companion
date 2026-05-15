from fastapi import APIRouter, HTTPException

from app.api.learning_inputs import learning_inputs
from app.api.topics import topics
from app.schemas.summary import TopicSummary
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/topics/{topic_id}/summary", tags=["summaries"])

topic_summaries: dict[int, str] = {}


@router.post("", response_model=TopicSummary)
def generate_topic_summary(topic_id: int):
    topic = next((topic for topic in topics if topic.id == topic_id), None)

    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    topic_inputs = [
        learning_input
        for learning_input in learning_inputs
        if learning_input.topic_id == topic_id
    ]

    ai_provider = get_ai_provider()
    summary = ai_provider.generate_topic_summary(
        topic_title=topic.title,
        learning_inputs=topic_inputs,
    )

    topic_summaries[topic_id] = summary

    return TopicSummary(
        topic_id=topic_id,
        summary=summary,
    )


@router.get("", response_model=TopicSummary)
def get_topic_summary(topic_id: int):
    topic = next((topic for topic in topics if topic.id == topic_id), None)

    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    summary = topic_summaries.get(topic_id, "")

    return TopicSummary(
        topic_id=topic_id,
        summary=summary,
    )