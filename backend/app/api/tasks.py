from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TaskListModel, TaskModel
from app.schemas.task import Task, TaskCreate, TaskList, TaskListCreate

router = APIRouter(tags=["tasks"])


@router.get("/task-lists", response_model=list[TaskList])
def get_task_lists(db: Session = Depends(get_db)):
    return db.query(TaskListModel).order_by(TaskListModel.created_at.desc()).all()


@router.post("/task-lists", response_model=TaskList)
def create_task_list(
    task_list_data: TaskListCreate,
    db: Session = Depends(get_db),
):
    if not task_list_data.name.strip():
        raise HTTPException(status_code=400, detail="Task list name is required")

    task_list = TaskListModel(
        name=task_list_data.name.strip(),
        description=task_list_data.description.strip()
        if task_list_data.description
        else None,
    )

    db.add(task_list)
    db.commit()
    db.refresh(task_list)

    return task_list


@router.get("/task-lists/{task_list_id}/tasks", response_model=list[Task])
def get_tasks(task_list_id: int, db: Session = Depends(get_db)):
    task_list = (
        db.query(TaskListModel)
        .filter(TaskListModel.id == task_list_id)
        .first()
    )

    if task_list is None:
        raise HTTPException(status_code=404, detail="Task list not found")

    return (
        db.query(TaskModel)
        .filter(TaskModel.task_list_id == task_list_id)
        .order_by(TaskModel.created_at.desc())
        .all()
    )


@router.post("/task-lists/{task_list_id}/tasks", response_model=Task)
def create_task(
    task_list_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
):
    task_list = (
        db.query(TaskListModel)
        .filter(TaskListModel.id == task_list_id)
        .first()
    )

    if task_list is None:
        raise HTTPException(status_code=404, detail="Task list not found")

    if not task_data.title.strip():
        raise HTTPException(status_code=400, detail="Task title is required")

    task = TaskModel(
        task_list_id=task_list_id,
        title=task_data.title.strip(),
        is_done=0,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.patch("/tasks/{task_id}/toggle", response_model=Task)
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_done = 0 if task.is_done else 1

    db.commit()
    db.refresh(task)

    return task