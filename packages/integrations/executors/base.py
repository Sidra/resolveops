"""Base action executor interface."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class ExecutionResult:
    success: bool
    external_id: str
    provider: str
    details: dict = field(default_factory=dict)
    executed_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ActionExecutor(ABC):
    """Abstract base class for action executors (Stripe, Shopify, etc.)."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        ...

    @abstractmethod
    async def execute(self, action_type: str, amount: float | None, currency: str, **kwargs) -> ExecutionResult:
        ...
