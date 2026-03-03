"""Mock Shopify executor — simulates reship / fulfillment."""

import uuid
import random
import string

from .base import ActionExecutor, ExecutionResult


class ShopifyMockExecutor(ActionExecutor):

    @property
    def provider_name(self) -> str:
        return "shopify-mock"

    async def execute(self, action_type: str, amount: float | None, currency: str, **kwargs) -> ExecutionResult:
        fulfillment_id = f"ful_{uuid.uuid4().hex[:12]}"
        tracking_number = "1Z" + "".join(random.choices(string.digits, k=16))
        return ExecutionResult(
            success=True,
            external_id=fulfillment_id,
            provider=self.provider_name,
            details={
                "fulfillment_id": fulfillment_id,
                "tracking_number": tracking_number,
                "carrier": "UPS",
                "status": "shipped",
            },
        )
