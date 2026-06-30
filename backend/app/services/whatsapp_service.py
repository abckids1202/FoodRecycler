from __future__ import annotations

from pathlib import Path

import requests

from app.core.config import settings


class WhatsAppService:
    graph_base_url = "https://graph.facebook.com/v20.0"

    @property
    def is_configured(self) -> bool:
        return bool(settings.whatsapp_access_token and settings.whatsapp_phone_number_id)

    def send_text(self, to: str, text: str) -> None:
        if not self.is_configured:
            return
        requests.post(
            f"{self.graph_base_url}/{settings.whatsapp_phone_number_id}/messages",
            headers=self._headers(),
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"preview_url": False, "body": text},
            },
            timeout=20,
        )

    def send_document(self, to: str, document_url: str) -> None:
        if not self.is_configured:
            self.send_text(to, document_url)
            return
        requests.post(
            f"{self.graph_base_url}/{settings.whatsapp_phone_number_id}/messages",
            headers=self._headers(),
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "type": "document",
                "document": {"link": document_url, "filename": "foodloop-recipe.pdf"},
            },
            timeout=30,
        )

    def get_media_url(self, media_id: str) -> str:
        response = requests.get(
            f"{self.graph_base_url}/{media_id}",
            headers=self._headers(),
            timeout=20,
        )
        response.raise_for_status()
        media_url = response.json().get("url")
        if not media_url:
            raise RuntimeError("WhatsApp media URL was not returned.")
        return media_url

    def download_media(self, media_id: str, save_path: str | Path) -> str:
        media_url = self.get_media_url(media_id)
        path = Path(save_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        response = requests.get(media_url, headers=self._headers(), timeout=60)
        response.raise_for_status()
        path.write_bytes(response.content)
        return str(path)

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {settings.whatsapp_access_token}"}
