from uuid import uuid4

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from app.db.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    application_id = Column(
        UUID(as_uuid=True),
        ForeignKey("applications.id"),
        nullable=False
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    severity = Column(
        String(20),
        nullable=False
    )

    risk_score = Column(
        Integer,
        nullable=False,
        default=0
    )

    recommendation = Column(
        Text,
        nullable=True
    )

    # Database column is named "metadata".
    # Python attribute cannot be called metadata because
    # SQLAlchemy reserves that name.
    incident_metadata = Column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )