from datetime import datetime
from typing import Dict, Any, Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    application_id: UUID
    event_type: str = Field(..., max_length=50)
    user_identifier: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_name: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    event_metadata: Dict[str, Any] = Field(default_factory=dict)


class EventResponse(BaseModel):
    id: UUID
    application_id: UUID
    event_type: str
    created_at: datetime
    user_identifier: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    device_name: Optional[str]
    location: Optional[str]
    event_metadata: Dict[str, Any]
    risk_points: int

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    events: List[EventResponse]
    total: int
