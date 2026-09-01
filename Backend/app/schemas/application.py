from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    workspace_id: str
    environment: str = "production"


class ApplicationResponse(BaseModel):
    id: str
    name: str
    api_key: str
    environment: str
    status: str