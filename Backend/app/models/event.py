from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.sql import func
from app.db.database import Base
import uuid


class Event(Base):
    __tablename__ = "events"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    application_id = Column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False
    )

    event_type = Column(
        String(50),
        nullable=False
    )

    user_identifier = Column(
        String(100)
    )

    ip_address = Column(
        INET
    )

    user_agent = Column(
        Text
    )

    device_name = Column(
        String(100)
    )

    location = Column(
        String(100)
    )

    event_metadata = Column(
        "metadata",
        JSONB,
        default=dict
    )

    risk_points = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        server_default=func.current_timestamp()
    )