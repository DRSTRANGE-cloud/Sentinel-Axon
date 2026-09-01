from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.event import Event
from app.models.incident import Incident
from app.services.agent import analyze_events


router = APIRouter(
    prefix="/v1/agent",
    tags=["Agent"]
)


@router.post("/analyze")
def analyze_recent_events(
    db: Session = Depends(get_db)
):
    # Get the latest 20 events
    events = (
        db.query(Event)
        .order_by(Event.created_at.desc())
        .limit(20)
        .all()
    )

    # No events available
    if not events:
        return {
            "events_analyzed": 0,
            "message": "No events available for analysis"
        }

    # Convert database events into data for the AI agent
    event_data = []

    for event in events:
        event_data.append({
            "id": str(event.id),
            "application_id": str(event.application_id),
            "event_type": event.event_type,
            "user_identifier": event.user_identifier,
            "ip_address": event.ip_address,
            "user_agent": event.user_agent,
            "device_name": event.device_name,
            "location": event.location,
            "risk_points": event.risk_points,
            "metadata": event.event_metadata,
            "created_at": str(event.created_at)
        })

    # Send events to AI agent
    result = analyze_events(event_data)

    # Create an incident only when AI detects a threat
    if result.get("is_threat"):

        incident = Incident(
            application_id=events[0].application_id,

            title=result.get(
                "title",
                "Security Threat Detected"
            ),

            attack_type=result.get(
                "attack_type",
                "Unknown"
            ),

            severity=result.get(
                "severity",
                "MEDIUM"
            ),

            risk_score=result.get(
                "risk_score",
                0
            ),

            status="open",

            attack_chain={
                "events": [
                    str(event.id)
                    for event in events
                ]
            },

            evidence={
                "events_analyzed": len(events),
                "source": "ai_agent",
                "event_ids": [
                    str(event.id)
                    for event in events
                ]
            },

            ai_summary=result.get(
                "description",
                result.get(
                    "summary",
                    "AI detected a potential security threat."
                )
            )
        )

        # Store incident in database
        db.add(incident)
        db.commit()
        db.refresh(incident)

        return {
            "events_analyzed": len(events),
            "analysis": result,
            "incident_created": True,
            "incident_id": str(incident.id)
        }

    # No threat detected
    return {
        "events_analyzed": len(events),
        "analysis": result,
        "incident_created": False,
        "incident_id": None
    }