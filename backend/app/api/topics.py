from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TopicModel
from app.schemas.topic import Topic, TopicCreate

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", response_model=list[Topic])
def get_topics(db: Session = Depends(get_db)):
    return db.query(TopicModel).order_by(TopicModel.created_at.desc()).all()


@router.post("", response_model=Topic)
def create_topic(topic_data: TopicCreate, db: Session = Depends(get_db)):
    if not topic_data.title.strip():
        raise HTTPException(status_code=400, detail="Topic title is required")

    topic = TopicModel(
        title=topic_data.title.strip(),
        description=topic_data.description.strip()
        if topic_data.description
        else None,
    )

    db.add(topic)
    db.commit()
    db.refresh(topic)

    return topic