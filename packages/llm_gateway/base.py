from abc import ABC, abstractmethod


class LLMAdapter(ABC):
    """Abstract base class for LLM provider adapters."""

    @abstractmethod
    async def complete(self, prompt: str, **kwargs) -> str:
        """Send a prompt and return the completion text."""
        ...

    @abstractmethod
    async def stream(self, prompt: str, **kwargs):
        """Send a prompt and yield completion chunks."""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider identifier (e.g. 'gemini', 'openai', 'anthropic')."""
        ...

    @property
    def model_name(self) -> str:
        """Return the model identifier. Override in subclasses."""
        return "unknown"
