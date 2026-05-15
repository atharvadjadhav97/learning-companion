from fastapi import APIRouter
from app.schemas.topic import Topic, TopicCreate

router = APIRouter(prefix="/topics", tags=["topics"])

topics: list[Topic] = []
next_topic_id = 1


@router.get("", response_model=list[Topic])
def get_topics():
    return topics


@router.post("", response_model=Topic)
def create_topic(topic_data: TopicCreate):
    global next_topic_id

    topic = Topic(
        id=next_topic_id,
        title=topic_data.title,
        description=topic_data.description,
    )

    topics.append(topic)
    next_topic_id += 1

    return topic
