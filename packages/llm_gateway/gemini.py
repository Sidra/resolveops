from google import genai
from google.genai import types

from .base import LLMAdapter


class GeminiAdapter(LLMAdapter):
    """Adapter for Google Gemini models (default for local dev)."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is required. Set it in .env.local."
            )
        self._client = genai.Client(api_key=api_key)
        self._model = model

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, prompt: str, **kwargs) -> str:
        config = types.GenerateContentConfig(
            temperature=kwargs.get("temperature", 0.7),
            max_output_tokens=kwargs.get("max_tokens", 1024),
            system_instruction=kwargs.get("system_prompt"),
        )
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=prompt,
            config=config,
        )
        return response.text or ""

    async def stream(self, prompt: str, **kwargs):
        config = types.GenerateContentConfig(
            temperature=kwargs.get("temperature", 0.7),
            max_output_tokens=kwargs.get("max_tokens", 1024),
            system_instruction=kwargs.get("system_prompt"),
        )
        stream = await self._client.aio.models.generate_content_stream(
            model=self._model,
            contents=prompt,
            config=config,
        )
        async for chunk in stream:
            if chunk.text:
                yield chunk.text
