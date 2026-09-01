import uuid
from datetime import datetime

from sqlalchemy import DateTime,ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    api_key: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    environment: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'production'"),
    )

    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'active'"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )