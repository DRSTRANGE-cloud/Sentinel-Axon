from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.event import Event
from app.models.application import Application
from app.schemas.event import EventCreate, EventResponse, EventListResponse
from typing import Optional
from uuid import UUID

router = APIRouter(
    prefix="/v1/events",
    tags=["Events"]
)


@router.post("", response_model=EventResponse)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db)
):
    # Check whether application exists
    application = (
        db.query(Application)
        .filter(Application.id == event_data.application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    # Basic risk scoring
    risk_points = 0

    if event_data.event_type == "LOGIN_FAILED":
        risk_points = 10

    elif event_data.event_type == "MFA_FAILED":
        risk_points = 15

    elif event_data.event_type == "PASSWORD_RESET":
        risk_points = 5

    # Create event
    event = Event(
        application_id=event_data.application_id,
        event_type=event_data.event_type,
        user_identifier=event_data.user_identifier,
        ip_address=event_data.ip_address,
        user_agent=event_data.user_agent,
        device_name=event_data.device_name,
        location=event_data.location,
        event_metadata=event_data.event_metadata,
        risk_points=risk_points
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


@router.get("", response_model=EventListResponse)
def get_events(
    application_id: Optional[UUID] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Event)

    # Optional application filter
    if application_id:
        query = query.filter(
            Event.application_id == application_id
        )

    # Newest events first
    events = (
        query
        .order_by(Event.created_at.desc())
        .limit(limit)
        .all()
    )

    return EventListResponse(
        events=events,
        total=len(events)
    )