from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.db.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    application_id = Column(
        UUID(as_uuid=True),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    attack_type = Column(
        String,
        nullable=True
    )

    severity = Column(
        String,
        nullable=False
    )

    risk_score = Column(
        Integer,
        nullable=False,
        default=0
    )

    status = Column(
        String,
        nullable=False,
        default="open"
    )

    attack_chain = Column(
        JSONB,
        nullable=True
    )

    evidence = Column(
        JSONB,
        nullable=True
    )

    ai_summary = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )