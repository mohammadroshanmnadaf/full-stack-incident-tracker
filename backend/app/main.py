from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes.incidents import router as incidents_router
import app.models  # noqa: F401

app = FastAPI(
    title="Incident Tracker API",
    description="REST API for managing production incidents.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


app.include_router(incidents_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "incident-tracker-api"}
