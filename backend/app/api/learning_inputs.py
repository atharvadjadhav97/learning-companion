from fastapi import APIRouter, HTTPException
from app.schemas.learning_input import LearningInput, LearningInputCreate

router = APIRouter(prefix="/topics/{topic_id}/inputs", tags=["learning-inputs"])

learning_inputs: list[LearningInput] = []
next_input_id = 1


@router.get("", response_model=list[LearningInput])
def get_learning_inputs(topic_id: int):
    return [
        learning_input
        for learning_input in learning_inputs
        if learning_input.topic_id == topic_id
    ]


@router.post("", response_model=LearningInput)
def create_learning_input(topic_id: int, input_data: LearningInputCreate):
    global next_input_id

    if not input_data.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")

    learning_input = LearningInput(
        id=next_input_id,
        topic_id=topic_id,
        input_type=input_data.input_type,
        content=input_data.content.strip(),
    )

    learning_inputs.append(learning_input)
    next_input_id += 1

    return learning_input
