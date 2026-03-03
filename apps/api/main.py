import os
import sys
from contextlib import asynccontextmanager

# Add packages/ to Python path so llm_gateway can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "packages")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import uvicorn

from config import settings
from db import engine
from routes.llm import router as llm_router
from routes.audit import router as audit_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify DB connection
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("Database connected")
    except Exception as e:
        print(f"Database connection failed: {e}")
    yield
    # Shutdown: dispose engine
    await engine.dispose()


app = FastAPI(title="ResolveOps API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3100",
        "http://192.168.1.167:3100",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(llm_router)
app.include_router(audit_router)


@app.get("/health")
async def health():
    db_status = "disconnected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        pass
    return {"status": "ok", "service": "api", "version": "0.1.0", "database": db_status}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=True,
    )
