"""
Thin wrapper around the OpenAI-compatible OpenRouter API.
All functions return empty string / default on any error so callers
can always fall back gracefully without crashing.
"""

import re
from openai import OpenAI
from app.core.config import settings

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )
    return _client


def chat(prompt: str, max_tokens: int = 120, timeout: float = 25.0) -> str:
    """Send a prompt and return the text response. Returns '' on any failure."""
    try:
        resp = _get_client().chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
            timeout=timeout,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception:
        return ""


def parse_score(raw: str, default: float = 75.0) -> float:
    """Extract the first integer 0–100 from a raw LLM response."""
    if not raw:
        return default
    m = re.search(r"\b(\d{1,3})\b", raw)
    if m:
        return float(max(0, min(100, int(m.group(1)))))
    return default
