from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import cv, jd, email, chat
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="AutoApply Agent Backend API"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cv.router, prefix="/api/v1/cv", tags=["CV Processing"])
app.include_router(jd.router, prefix="/api/v1/jd", tags=["JD Analysis"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat & Review"])
app.include_router(email.router, prefix="/api/v1/email", tags=["Email & Discovery"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AutoApply Agent API"}
