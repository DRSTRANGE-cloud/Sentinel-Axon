from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.application import Application
from app.models.incident import Incident
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentListResponse,
)
from app.services.incident_report import build_incident_report_pdf


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
        attack_type=incident_data.attack_type,
        severity=incident_data.severity,
        risk_score=incident_data.risk_score,
        status=incident_data.status,
        attack_chain=incident_data.incident_metadata.get("attack_chain"),
        evidence={
            **incident_data.incident_metadata,
            **({"recommendation": incident_data.recommendation} if incident_data.recommendation else {}),
        },
        ai_summary=incident_data.description,
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


@router.post("/{incident_id}/report")
def generate_incident_report(
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

    pdf_bytes = build_incident_report_pdf(db, incident)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="sentinel-incident-{incident.id}.pdf"'
        },
    )
