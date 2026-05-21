from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import BrainDumpModel
from app.schemas.brain_dump import BrainDump, BrainDumpCreate

router = APIRouter(prefix="/brain-dumps", tags=["brain-dumps"])


@router.get("", response_model=list[BrainDump])
def get_brain_dumps(db: Session = Depends(get_db)):
    return (
        db.query(BrainDumpModel)
        .order_by(BrainDumpModel.created_at.desc())
        .all()
    )


@router.post("", response_model=BrainDump)
def create_brain_dump(
    brain_dump_data: BrainDumpCreate,
    db: Session = Depends(get_db),
):
    if not brain_dump_data.content.strip():
        raise HTTPException(status_code=400, detail="Brain dump content is required")

    brain_dump = BrainDumpModel(
        content=brain_dump_data.content.strip(),
    )

    db.add(brain_dump)
    db.commit()
    db.refresh(brain_dump)

    return brain_dump


@router.delete("/{brain_dump_id}")
def delete_brain_dump(
    brain_dump_id: int,
    db: Session = Depends(get_db),
):
    brain_dump = (
        db.query(BrainDumpModel)
        .filter(BrainDumpModel.id == brain_dump_id)
        .first()
    )

    if brain_dump is None:
        raise HTTPException(status_code=404, detail="Brain dump not found")

    db.delete(brain_dump)
    db.commit()

    return {
        "status": "ok",
        "message": "Brain dump deleted successfully",
    }