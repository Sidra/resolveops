from fastapi import FastAPI
import uvicorn

from config import settings

app = FastAPI(title="ResolveOps Worker", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "worker", "version": "0.1.0"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.WORKER_PORT,
        reload=True,
    )
