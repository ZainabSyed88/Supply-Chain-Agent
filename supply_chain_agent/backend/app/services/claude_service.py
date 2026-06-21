from __future__ import annotations
import os
import httpx

from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT


class LLMService:
    def __init__(self):
        self.nvidia_api_key = os.getenv("NVIDIA_API_KEY", "")
        self.nvidia_model = os.getenv("NVIDIA_MODEL", "nvidia/omni-gpt")
        self.nvidia_base_url = os.getenv("NVIDIA_BASE_URL", "https://api.nvidia.ai")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3.5-mini")

        if self.nvidia_api_key:
            self.provider = "nvidia"
        elif self.anthropic_api_key:
            self.provider = "anthropic"
        else:
            raise RuntimeError("No LLM provider configured. Set NVIDIA_API_KEY or ANTHROPIC_API_KEY.")

        if self.provider == "anthropic":
            self.client = Anthropic(api_key=self.anthropic_api_key)

    async def send_message(self, message: str) -> str:
        if self.provider == "nvidia":
            return await self._send_nvidia(message)
        return await self._send_anthropic(message)

    async def _send_nvidia(self, message: str) -> str:
        url = f"{self.nvidia_base_url}/v1/models/{self.nvidia_model}:predict"
        payload = {
            "input": message,
            "parameters": {
                "temperature": 0.2,
                "max_output_tokens": 512,
            },
        }
        headers = {
            "Authorization": f"Bearer {self.nvidia_api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("output", {}).get("text", "")

    async def _send_anthropic(self, message: str) -> str:
        response = self.client.create(
            model=self.anthropic_model,
            prompt=f"{HUMAN_PROMPT} {message} {AI_PROMPT}",
            max_tokens_to_sample=500,
            temperature=0.2,
        )
        return response["completion"]
