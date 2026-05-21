from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import LearningInputModel, TopicModel
from app.schemas.learning_input import LearningInput, LearningInputCreate

router = APIRouter(prefix="/topics/{topic_id}/inputs", tags=["learning-inputs"])


@router.get("", response_model=list[LearningInput])
def get_learning_inputs(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(TopicModel).filter(TopicModel.id == topic_id).first()

    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    return (
        db.query(LearningInputModel)
        .filter(LearningInputModel.topic_id == topic_id)
        .order_by(LearningInputModel.created_at.desc())
        .all()
    )


@router.post("", response_model=LearningInput)
def create_learning_input(
    topic_id: int,
    input_data: LearningInputCreate,
    db: Session = Depends(get_db),
):
    topic = db.query(TopicModel).filter(TopicModel.id == topic_id).first()

    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    if not input_data.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")

    learning_input = LearningInputModel(
        topic_id=topic_id,
        input_type=input_data.input_type,
        content=input_data.content.strip(),
    )

    db.add(learning_input)
    db.commit()
    db.refresh(learning_input)

    return learning_input