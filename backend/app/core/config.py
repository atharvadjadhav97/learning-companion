import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock").lower()

    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-5.2")
    OPENAI_MAX_OUTPUT_TOKENS: int = int(
        os.getenv("OPENAI_MAX_OUTPUT_TOKENS", "700")
    )

    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    OLLAMA_BASE_URL: str = os.getenv(
        "OLLAMA_BASE_URL",
        "http://localhost:11434",
    )


settings = Settings()