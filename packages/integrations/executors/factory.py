"""Factory for creating action executors based on action type."""

from .base import ActionExecutor
from .stripe_mock import StripeMockExecutor
from .shopify_mock import ShopifyMockExecutor

_EXECUTOR_MAP: dict[str, type[ActionExecutor]] = {
    "refund": StripeMockExecutor,
    "discount": StripeMockExecutor,
    "reship": ShopifyMockExecutor,
    "cancel": ShopifyMockExecutor,
}


def create_executor(action_type: str) -> ActionExecutor:
    """Create the appropriate executor for the given action type."""
    cls = _EXECUTOR_MAP.get(action_type)
    if cls is None:
        raise ValueError(f"No executor registered for action type: {action_type}")
    return cls()
