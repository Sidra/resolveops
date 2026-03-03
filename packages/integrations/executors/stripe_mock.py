"""Mock Stripe executor — simulates refund processing."""

import uuid

from .base import ActionExecutor, ExecutionResult


class StripeMockExecutor(ActionExecutor):

    @property
    def provider_name(self) -> str:
        return "stripe-mock"

    async def execute(self, action_type: str, amount: float | None, currency: str, **kwargs) -> ExecutionResult:
        refund_id = f"re_{uuid.uuid4().hex[:16]}"
        return ExecutionResult(
            success=True,
            external_id=refund_id,
            provider=self.provider_name,
            details={
                "refund_id": refund_id,
                "amount": amount,
                "currency": currency,
                "status": "succeeded",
            },
        )
