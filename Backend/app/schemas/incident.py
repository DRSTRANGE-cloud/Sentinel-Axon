from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    application_id: UUID
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    attack_type: Optional[str] = None
    severity: str = Field(..., max_length=20)
    risk_score: int = Field(0, ge=0, le=100)
    status: str = "open"
    recommendation: Optional[str] = None
    incident_metadata: Dict[str, Any] = Field(default_factory=dict)


class IncidentResponse(BaseModel):
    id: UUID
    application_id: UUID
    title: str
    description: Optional[str]
    attack_type: Optional[str]
    severity: str
    risk_score: int
    status: Optional[str]
    recommendation: Optional[str]
    incident_metadata: Dict[str, Any]
    attack_chain: list[Any] | Dict[str, Any] | None = None
    evidence: Dict[str, Any] | list[Any] | None = None
    ai_summary: Optional[str] = None

    class Config:
        from_attributes = True


class IncidentListResponse(BaseModel):
    incidents: list[IncidentResponse]
    total: int
