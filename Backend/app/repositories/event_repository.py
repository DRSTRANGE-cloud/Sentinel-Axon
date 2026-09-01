from sqlalchemy.orm import Session

from app.models.event import Event
from app.schemas.event import EventCreate


def create_event(
    db: Session,
    event_data: EventCreate,
) -> Event:
    event = Event(
        application_id=event_data.application_id,
        event_type=event_data.event_type,
        user_identifier=event_data.user_identifier,
        ip_address=event_data.ip_address,
        user_agent=event_data.user_agent,
        device_name=event_data.device_name,
        location=event_data.location,
        event_metadata=event_data.metadata,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event