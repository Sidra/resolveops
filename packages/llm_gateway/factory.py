import os
from .base import LLMAdapter
from .gemini import GeminiAdapter
from .openai_adapter import OpenAIAdapter
from .anthropic_adapter import AnthropicAdapter

_ADAPTERS = {
    "gemini": lambda: GeminiAdapter(
        api_key=os.environ.get("GEMINI_API_KEY", ""),
        model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
    ),
    "openai": lambda: OpenAIAdapter(api_key=os.environ.get("OPENAI_API_KEY", "")),
    "anthropic": lambda: AnthropicAdapter(api_key=os.environ.get("ANTHROPIC_API_KEY", "")),
}


def create_adapter(provider: str | None = None) -> LLMAdapter:
    """Create an LLM adapter based on provider name or LLM_PROVIDER env var.

    Args:
        provider: One of 'gemini', 'openai', 'anthropic'.
                  Falls back to LLM_PROVIDER env var, then 'gemini'.
    """
    provider = provider or os.environ.get("LLM_PROVIDER", "gemini")
    factory = _ADAPTERS.get(provider)
    if factory is None:
        raise ValueError(
            f"Unknown LLM provider: {provider!r}. "
            f"Supported: {', '.join(_ADAPTERS.keys())}"
        )
    return factory()
