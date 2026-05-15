from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class TaskListCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TaskList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None


class TaskCreate(BaseModel):
    title: str


class Task(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_list_id: int
    title: str
    is_done: int
    created_at: Optional[datetime] = None