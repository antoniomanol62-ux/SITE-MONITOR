from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    resposta = client.get("/health")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}

def test_post_sem_url_retorna_422():
    resposta = client.post("/sites", json={"name": "Sem url"})
    assert resposta.status_code == 422


def test_listar_sites():
    resposta = client.get("/sites")
    assert resposta.status_code == 200
    assert isinstance(resposta.json(), list)
    