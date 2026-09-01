from fastapi import FastAPI

app = FastAPI(
    title="Sentinel AI Backend",
    description="AI-powered cybersecurity monitoring backend",
    version="1.0.0"
)


@app.get("/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "sentinel-ai-backend"
    }