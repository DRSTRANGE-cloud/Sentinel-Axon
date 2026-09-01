from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.incident import Incident


router = APIRouter(
    prefix="/v1/incidents",
    tags=["Incidents"]
)


@router.get("")
def get_incidents(
    db: Session = Depends(get_db)
):
    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return {
        "incidents": incidents,
        "total": len(incidents)
    }


@router.get("/{incident_id}")
def get_incident(
    incident_id: UUID,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident