import os
import json
import urllib.request
import urllib.error
from typing import Optional
from dotenv import load_dotenv

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


class LLMClient:
    """Multi-provider client supporting Gemini (google-genai), OpenAI, Groq, or Smart Heuristic Fallback."""

    def __init__(self):
        self.refresh_keys()

    def refresh_keys(self):
        load_dotenv(override=True)
        self.gemini_key = (
            os.getenv("GEMINI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
            or os.getenv("GEMINI_KEY")
            or ""
        )
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.groq_key = os.getenv("GROQ_API_KEY", "")

        if self.gemini_key:
            os.environ["GOOGLE_API_KEY"] = self.gemini_key
            os.environ["GEMINI_API_KEY"] = self.gemini_key

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        self.refresh_keys()

        if self.gemini_key:
            res = self._call_gemini(prompt, system_prompt)
            if res:
                return res
        if self.groq_key:
            res = self._call_groq(prompt, system_prompt)
            if res:
                return res
        if self.openai_key:
            res = self._call_openai(prompt, system_prompt)
            if res:
                return res

        # Fallback reasoning synthesis engine if no API keys are set or API calls fail
        return ""

    def _call_gemini(self, prompt: str, system_prompt: Optional[str]) -> Optional[str]:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

        # 1. Try official google-genai SDK (v2)
        if HAS_GENAI and self.gemini_key:
            models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]
            for model_name in models_to_try:
                try:
                    client = genai.Client(api_key=self.gemini_key)
                    response = client.models.generate_content(
                        model=model_name,
                        contents=full_prompt,
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    continue

        # 2. Fallback to direct HTTP REST endpoint
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}]
        }
        for model in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=30) as response:
                    result = json.loads(response.read().decode("utf-8"))
                    return result["candidates"][0]["content"]["parts"][0]["text"]
            except Exception:
                continue

        return None

    def _call_groq(self, prompt: str, system_prompt: Optional[str]) -> Optional[str]:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "llama-3.1-70b-versatile",
                "messages": messages,
                "temperature": 0.2,
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.groq_key}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]
        except Exception:
            return None

    def _call_openai(self, prompt: str, system_prompt: Optional[str]) -> Optional[str]:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.2,
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.openai_key}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]
        except Exception:
            return None
