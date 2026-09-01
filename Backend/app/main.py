from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.events import router as events_router
from app.api.routes.applications import router as applications_router
from app.api.routes.incidents import router as incidents_router
<<<<<<< HEAD


def register_router_routes(router):
    """Register APIRouter routes explicitly for the current FastAPI runtime."""
    for route in router.routes:
        app.router.routes.append(route)


=======
from app.api.routes.agent import router as agent_router
>>>>>>> origin/main
app = FastAPI(
    title="Sentinel AI Backend",
    description="AI-powered cybersecurity monitoring backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
register_router_routes(applications_router)
register_router_routes(events_router)
register_router_routes(incidents_router)

=======
app.include_router(applications_router)
app.include_router(events_router)
app.include_router(incidents_router)
app.include_router(agent_router)
>>>>>>> origin/main

@app.get("/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "sentinel-ai-backend",
    }

