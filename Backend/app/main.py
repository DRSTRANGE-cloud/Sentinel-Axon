from fastapi import FastAPI

from app.api.routes.events import router as events_router
from app.api.routes.applications import router as applications_router
from app.api.routes.incidents import router as incidents_router
app = FastAPI(
    title="Sentinel AI Backend",
    description="AI-powered cybersecurity monitoring backend",
    version="1.0.0",
)

app.include_router(applications_router)
app.include_router(events_router)
app.include_router(incidents_router)


@app.get("/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "sentinel-ai-backend",
    }


app.include_router(events_router)