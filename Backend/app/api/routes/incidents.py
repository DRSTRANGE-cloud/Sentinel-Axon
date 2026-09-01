from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.application import Application
from app.models.incident import Incident
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentListResponse,
)


router = APIRouter(
    prefix="/v1/incidents",
    tags=["Incidents"]
)


@router.post("", response_model=IncidentResponse)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db)
):
    # Make sure the application exists
    application = (
        db.query(Application)
        .filter(Application.id == incident_data.application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    incident = Incident(
        application_id=incident_data.application_id,
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        risk_score=incident_data.risk_score,
        recommendation=incident_data.recommendation,
        incident_metadata=incident_data.incident_metadata,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


@router.get("", response_model=IncidentListResponse)
def get_incidents(
    application_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)

    if application_id:
        query = query.filter(
            Incident.application_id == application_id
        )

    incidents = (
        query
        .order_by(Incident.created_at.desc())
        .all()
    )

    return IncidentListResponse(
        incidents=incidents,
        total=len(incidents)
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
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