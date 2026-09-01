from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.application import Application
from app.models.workspace import Workspace
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.core.security import generate_api_key


router = APIRouter(
    prefix="/v1/applications",
    tags=["Applications"]
)


@router.post("", response_model=ApplicationResponse)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db)
):
    # Check workspace exists
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == data.workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found"
        )

    # Generate API key
    api_key = generate_api_key()

    # Create application
    application = Application(
        workspace_id=workspace.id,
        name=data.name,
        api_key=api_key,
        environment=data.environment,
        status="active"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return ApplicationResponse(
        id=str(application.id),
        name=application.name,
        api_key=application.api_key,
        environment=application.environment,
        status=application.status
    )