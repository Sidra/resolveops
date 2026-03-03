from .base import LLMAdapter


class AnthropicAdapter(LLMAdapter):
    """Adapter for Anthropic Claude models."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    @property
    def provider_name(self) -> str:
        return "anthropic"

    async def complete(self, prompt: str, **kwargs) -> str:
        # TODO: Implement Anthropic API call
        raise NotImplementedError("Anthropic adapter not yet implemented")

    async def stream(self, prompt: str, **kwargs):
        # TODO: Implement Anthropic streaming
        raise NotImplementedError("Anthropic streaming not yet implemented")
