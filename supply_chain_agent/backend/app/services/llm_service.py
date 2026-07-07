from __future__ import annotations

from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from app.core.config import settings


class LLMService:
    def __init__(self):
        self.openai_api_key = settings.openai_api_key
        self.openai_model = settings.openai_model

        if not self.openai_api_key:
            raise RuntimeError("No LLM provider configured. Set OPENAI_API_KEY.")

        self.client = AsyncOpenAI(api_key=self.openai_api_key)

    async def send_message(self, message: str) -> str:
        result = await self.send_chat(
            system_prompt="You are an expert supply chain consultant. Provide concise, actionable, data-focused advice.",
            messages=[{"role": "user", "content": message}],
            temperature=0.2,
            max_tokens=500,
        )
        return result["content"]

    async def send_chat(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 700,
    ) -> dict[str, str]:
        response = await self.client.chat.completions.create(
            model=self.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return {
            "content": (response.choices[0].message.content or "").strip(),
            "model_used": getattr(response, "model", None) or self.openai_model,
        }

    async def stream_chat(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 700,
    ) -> AsyncIterator[str]:
        stream = await self.client.chat.completions.create(
            model=self.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield delta
