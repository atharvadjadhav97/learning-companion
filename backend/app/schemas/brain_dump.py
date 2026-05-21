from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class BrainDumpCreate(BaseModel):
    content: str


class BrainDump(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    created_at: Optional[datetime] = None