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
<<<<<<< HEAD
        String(100),
=======
        String,
>>>>>>> origin/main
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
<<<<<<< HEAD
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

=======
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

>>>>>>> origin/main
    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    resolved_at = Column(
<<<<<<< HEAD
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
=======
        DateTime,
        nullable=True
    )
>>>>>>> origin/main
