import sqlite3

import pytest
from fastapi.testclient import TestClient

import main
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


@pytest.fixture
def cliente_isolado(tmp_path, monkeypatch):
    caminho = str(tmp_path / "teste.db")
    conexao = sqlite3.connect(caminho)
    conexao.execute(
        "CREATE TABLE sites (id INTEGER PRIMARY KEY, name TEXT, url TEXT UNIQUE)"
    )
    conexao.commit()
    conexao.close()
    monkeypatch.setattr(main, "DB_PATH", caminho)
    return TestClient(app)


def test_post_site_repetido_retorna_409(cliente_isolado):
    corpo = {"name": "Teste", "url": "https://teste.com"}
    primeira = cliente_isolado.post("/sites", json=corpo)
    assert primeira.status_code == 201
    segunda = cliente_isolado.post("/sites", json=corpo)
    assert segunda.status_code == 409