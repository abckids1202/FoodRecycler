from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

health = client.get("/api/health")
config = client.get("/api/config/status")

print("health:", health.status_code, health.json())
print("config:", config.status_code, config.json())
