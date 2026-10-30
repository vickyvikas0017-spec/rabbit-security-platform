import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database.connection import engine, Base, STORAGE_DIR, BASE_DIR
from .api.endpoints import router as api_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Rabbit Security Assessment Platform API",
    description="Backend service for Rabbit Pvt. Ltd. Cybersecurity Assessment Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount storage directory for uploaded evidence files
evidence_storage = os.path.join(STORAGE_DIR, "evidence")
os.makedirs(evidence_storage, exist_ok=True)
app.mount("/storage/evidence", StaticFiles(directory=evidence_storage), name="evidence")

# Include API Router
app.include_router(api_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Mount frontend production build if available
frontend_dist = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Serve static file if exists
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Default to index.html for SPA client-side routing
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "Rabbit Security Assessment Platform",
            "status": "operational",
            "documentation": "/docs"
        }
