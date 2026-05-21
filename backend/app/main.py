from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.learning_inputs import router as learning_inputs_router
from app.api.summaries import router as summaries_router
from app.api.topics import router as topics_router
from app.db.database import Base, engine
from app.db import models
from app.api.tasks import router as tasks_router
from app.api.brain_dumps import router as brain_dumps_router

Base.metadata.create_all(bind=engine)

def ensure_task_columns():
    with engine.connect() as connection:
        existing_columns = connection.execute(
            text("PRAGMA table_info(tasks)")
        ).fetchall()

        column_names = [column[1] for column in existing_columns]

        if "is_today" not in column_names:
            connection.execute(
                text("ALTER TABLE tasks ADD COLUMN is_today INTEGER NOT NULL DEFAULT 0")
            )

        if "completed_at" not in column_names:
            connection.execute(
                text("ALTER TABLE tasks ADD COLUMN completed_at DATETIME")
            )

        if "notes" not in column_names:
            connection.execute(
                text("ALTER TABLE tasks ADD COLUMN notes TEXT")
            )
        connection.commit()


ensure_task_columns()

app = FastAPI(title="Learning Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics_router)
app.include_router(learning_inputs_router)
app.include_router(summaries_router)
app.include_router(tasks_router)
app.include_router(brain_dumps_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Learning Companion API is running",
    }