from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.topics import router as topics_router
from app.api.learning_inputs import router as learning_inputs_router
from app.api.summaries import router as summaries_router

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


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Learning Companion API is running"
    }