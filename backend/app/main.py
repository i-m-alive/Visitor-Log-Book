from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import scan

app = FastAPI(
    title="AI Visitor Logbook",
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/scan", tags=["Scan"])
