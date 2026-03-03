from .base import LLMAdapter


class GeminiAdapter(LLMAdapter):
    """Adapter for Google Gemini 3.1 (default for local dev)."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    @property
    def provider_name(self) -> str:
        return "gemini"

    async def complete(self, prompt: str, **kwargs) -> str:
        # TODO: Implement Gemini API call
        raise NotImplementedError("Gemini adapter not yet implemented")

    async def stream(self, prompt: str, **kwargs):
        # TODO: Implement Gemini streaming
        raise NotImplementedError("Gemini streaming not yet implemented")
