from __future__ import annotations

from pathlib import Path

import requests

from app.core.config import settings


class TelegramService:
    def __init__(self, token: str | None = None):
        self.token = token or settings.telegram_bot_token
        self.base_url = f"https://api.telegram.org/bot{self.token}" if self.token else ""

    @property
    def is_configured(self) -> bool:
        return bool(self.token)

    def send_message(self, chat_id: str, text: str) -> None:
        if not self.is_configured:
            return
        requests.post(
            f"{self.base_url}/sendMessage",
            json={"chat_id": chat_id, "text": text},
            timeout=20,
        )

    def send_document(self, chat_id: str, file_path_or_url: str) -> None:
        if not self.is_configured:
            return
        if file_path_or_url.startswith("http"):
            requests.post(
                f"{self.base_url}/sendDocument",
                json={"chat_id": chat_id, "document": file_path_or_url},
                timeout=30,
            )
            return

        path = Path(file_path_or_url)
        if not path.exists():
            self.send_message(chat_id, file_path_or_url)
            return
        with path.open("rb") as document:
            requests.post(
                f"{self.base_url}/sendDocument",
                data={"chat_id": chat_id},
                files={"document": document},
                timeout=60,
            )

    def get_file_url(self, file_id: str) -> str:
        if not self.is_configured:
            raise RuntimeError("Telegram bot token is not configured.")
        response = requests.get(f"{self.base_url}/getFile", params={"file_id": file_id}, timeout=20)
        response.raise_for_status()
        payload = response.json()
        file_path = payload.get("result", {}).get("file_path")
        if not file_path:
            raise RuntimeError("Telegram file path was not returned.")
        return f"https://api.telegram.org/file/bot{self.token}/{file_path}"

    def download_file(self, file_id: str, save_path: str | Path) -> str:
        file_url = self.get_file_url(file_id)
        path = Path(save_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        response = requests.get(file_url, timeout=60)
        response.raise_for_status()
        path.write_bytes(response.content)
        return str(path)

    def set_webhook(self, webhook_url: str) -> dict:
        if not self.is_configured:
            raise RuntimeError("Telegram bot token is not configured.")
        response = requests.post(f"{self.base_url}/setWebhook", json={"url": webhook_url}, timeout=20)
        response.raise_for_status()
        return response.json()
