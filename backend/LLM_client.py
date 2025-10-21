import requests
import json
from dotenv import load_dotenv
import os
import time
from typing import Any, Dict, Optional

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL")
OPEN_ROUTER_MODEL = os.getenv("OPEN_ROUTER_MODEL")
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))


class LLMerror(Exception):
    pass

class LLMClient:
    
    def __init__(self,
        ref : Optional[str] = None,
        api_key = OPENROUTER_API_KEY,
        base_url = OPENROUTER_BASE_URL,
        model = OPEN_ROUTER_MODEL,
        timeout = LLM_TIMEOUT,
        temperature = LLM_TEMPERATURE,
        app_name = "FinanceAI",
        
    ):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.timeout = timeout
        self.temperature = temperature
        self.app_name = app_name
        self.ref = ref
        if not self.api_key or not self.base_url or not self.model:
            raise LLMerror("Missing OpenRouter configuration in environment variables.")
    
    def header(self):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-Title": self.app_name
        }
    def _post_char(self,payload):
        url=f"{self.base_url}/chat/completions"
        backoff = 0.8
        for attempt in range(3):
            try:
                response = requests.post(
                    url,
                    headers=self.header(),
                    data=json.dumps(payload),
                    timeout=self.timeout
                )
                if response.status_code in (429, 500, 502, 503, 504):
                    if attempt < 2:
                        time.sleep(backoff)
                        backoff *= 2
                        continue
                    else:
                        raise LLMerror(f"LLM service error after retries: {response.status_code} - {response.text}")
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                if attempt == 2:
                    raise LLMerror(f"LLM request failed: {str(e)}")
                time.sleep(backoff)
                backoff *= 2
        raise LLMerror("LLM request failed after retries.")
    def ask_text(self,
                 user_prompt: str,
                 system_prompt: Optional[str] = None,
                 temperature: Optional[float] = None,
                 max_tokens: Optional[int] = None
                 ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})
        payload = {
            'model': self.model,
            'messages': messages,
            'temperature': temperature if temperature is not None else self.temperature,
        }
        if max_tokens:
            payload['max_tokens'] = max_tokens
        response_json = self._post_char(payload)
        try:
            return response_json['choices'][0]['message']['content']
        except (KeyError, IndexError) as e:
            raise LLMerror(f"Unexpected response format: {str(e)}")
                 

    def ask_json(self,
                 user_prompt: str,
                 system_prompt: Optional[str] = None,
                 temperature: Optional[float] = None,
                 max_tokens: Optional[int] = None,
                 response_require_keys: Optional[Dict[str, Any]] = None
                 ) -> Dict[str, Any]:
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})
        payload = {
            'model': self.model,
            'messages': messages,
            'temperature': temperature if temperature is not None else self.temperature,
            'response_format': {'type': 'json_object'}
        }
        if max_tokens:
            payload['max_tokens'] = max_tokens
        response_json = self._post_char(payload)
        try:
            content = response_json['choices'][0]['message']['content']
            result = json.loads(content)
            if response_require_keys:
                for key in response_require_keys:
                    if key not in result:
                        raise LLMerror(f"Missing required response key: {key}")
            return result
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            raise LLMerror(f"Unexpected response format: {str(e)}")
    
