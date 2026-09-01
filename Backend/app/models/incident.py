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

    attack_type = Column(
        String(100),
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

    status = Column(
        String(30),
        nullable=True
    )

    attack_chain = Column(
        JSONB,
        nullable=True,
        default=list
    )

    evidence = Column(
        JSONB,
        nullable=True,
        default=dict
    )

    ai_summary = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    @property
    def description(self):
        return self.ai_summary

    @property
    def recommendation(self):
        if isinstance(self.evidence, dict):
            value = self.evidence.get("recommendation") or self.evidence.get("recommendations")
            return str(value) if value else None
        return None

    @property
    def incident_metadata(self):
        return {
            "status": self.status,
            "attack_type": self.attack_type,
            "attack_chain": self.attack_chain,
            "evidence": self.evidence,
        }
