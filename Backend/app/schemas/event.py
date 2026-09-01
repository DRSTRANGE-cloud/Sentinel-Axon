from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID


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
    user_identifier: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    device_name: Optional[str]
    location: Optional[str]
    event_metadata: Dict[str, Any]
    risk_points: int

    class Config:
        from_attributes = True