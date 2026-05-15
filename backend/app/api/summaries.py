from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import LearningInputModel, TopicModel
from app.schemas.summary import TopicSummary
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/topics/{topic_id}/summary", tags=["summaries"])


@router.post("", response_model=TopicSummary)
def generate_topic_summary(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(TopicModel).filter(TopicModel.id == topic_id).first()

    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    topic_inputs = (
        db.query(LearningInputModel)
        .filter(LearningInputModel.topic_id == topic_id)
        .order_by(LearningInputModel.created_at.asc())
        .all()
    )

    ai_provider = get_ai_provider()
    summary = ai_provider.generate_topic_summary(
        topic_title=topic.title,
        learning_inputs=topic_inputs,
    )

    topic.summary = summary
    db.commit()
    db.refresh(topic)

    return TopicSummary(
        topic_id=topic_id,
        summary=topic.summary or "",
    )


@router.get("", response_model=TopicSummary)
def get_topic_summary(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(TopicModel).filter(TopicModel.id == topic_id).first()

    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    return TopicSummary(
        topic_id=topic_id,
        summary=topic.summary or "",
    )