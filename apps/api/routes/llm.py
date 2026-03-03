import json
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from llm_gateway import create_adapter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/llm", tags=["llm"])


class LLMRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=100_000)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1024, ge=1, le=8192)


class LLMResponse(BaseModel):
    text: str
    provider: str
    model: str


@router.post("/complete", response_model=LLMResponse)
async def complete(req: LLMRequest):
    try:
        adapter = create_adapter()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    try:
        text = await adapter.complete(
            req.prompt,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
        )
    except Exception as e:
        logger.exception("LLM complete error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return LLMResponse(
        text=text,
        provider=adapter.provider_name,
        model=adapter.model_name,
    )


@router.post("/stream")
async def stream(req: LLMRequest):
    try:
        adapter = create_adapter()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    async def event_generator():
        try:
            async for chunk in adapter.stream(
                req.prompt,
                temperature=req.temperature,
                max_tokens=req.max_tokens,
            ):
                yield {"data": json.dumps({"chunk": chunk})}
            yield {"data": json.dumps({"done": True})}
        except Exception as e:
            logger.exception("LLM stream error")
            yield {"data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
