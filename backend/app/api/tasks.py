from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.db.models import TaskListModel, TaskModel
from app.schemas.task import (
    Task,
    TaskCreate,
    TaskList,
    TaskListCreate,
    TaskListUpdate,
    TaskNotesUpdate,
    TaskUpdate,
)
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

@router.patch("/task-lists/{task_list_id}", response_model=TaskList)
def update_task_list(
    task_list_id: int,
    task_list_data: TaskListUpdate,
    db: Session = Depends(get_db),
):
    task_list = (
        db.query(TaskListModel)
        .filter(TaskListModel.id == task_list_id)
        .first()
    )

    if task_list is None:
        raise HTTPException(status_code=404, detail="Task list not found")

    if not task_list_data.name.strip():
        raise HTTPException(status_code=400, detail="Task list name is required")

    task_list.name = task_list_data.name.strip()
    task_list.description = (
        task_list_data.description.strip()
        if task_list_data.description
        else None
    )

    db.commit()
    db.refresh(task_list)

    return task_list


@router.delete("/task-lists/{task_list_id}")
def delete_task_list(task_list_id: int, db: Session = Depends(get_db)):
    task_list = (
        db.query(TaskListModel)
        .filter(TaskListModel.id == task_list_id)
        .first()
    )

    if task_list is None:
        raise HTTPException(status_code=404, detail="Task list not found")

    db.delete(task_list)
    db.commit()

    return {
        "status": "ok",
        "message": "Task list deleted successfully",
    }
    
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

    if task.is_done:
        task.is_done = 0
        task.completed_at = None
    else:
        task.is_done = 1
        task.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return task

@router.patch("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task_data.title.strip():
        raise HTTPException(status_code=400, detail="Task title is required")

    task.title = task_data.title.strip()

    db.commit()
    db.refresh(task)

    return task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {
        "status": "ok",
        "message": "Task deleted successfully",
    }

@router.patch("/tasks/{task_id}/today", response_model=Task)
def toggle_task_today(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_today = 0 if task.is_today else 1

    db.commit()
    db.refresh(task)

    return task

@router.patch("/tasks/{task_id}/notes", response_model=Task)
def update_task_notes(
    task_id: int,
    task_notes_data: TaskNotesUpdate,
    db: Session = Depends(get_db),
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task.notes = (
        task_notes_data.notes.strip()
        if task_notes_data.notes
        else None
    )

    db.commit()
    db.refresh(task)

    return task