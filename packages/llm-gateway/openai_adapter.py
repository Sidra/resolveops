from .base import LLMAdapter


class OpenAIAdapter(LLMAdapter):
    """Adapter for OpenAI models."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    @property
    def provider_name(self) -> str:
        return "openai"

    async def complete(self, prompt: str, **kwargs) -> str:
        # TODO: Implement OpenAI API call
        raise NotImplementedError("OpenAI adapter not yet implemented")

    async def stream(self, prompt: str, **kwargs):
        # TODO: Implement OpenAI streaming
        raise NotImplementedError("OpenAI streaming not yet implemented")
