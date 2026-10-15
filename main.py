import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Site Monitor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class SiteNovo(BaseModel):
    name: str
    url: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/sites")
def listar_sites():
    conexao = sqlite3.connect("sites.db")
    cursor = conexao.cursor()
    cursor.execute("SELECT id, name, url FROM sites")
    linhas = cursor.fetchall()
    conexao.close()

    resultado = []
    for linha in linhas:
        resultado.append({"id": linha[0], "name": linha[1], "url": linha[2]})
    return resultado


@app.post("/sites", status_code=201)
def criar_site(site: SiteNovo):
    conexao = sqlite3.connect("sites.db")
    cursor = conexao.cursor()
    try:
        cursor.execute("INSERT INTO sites (name, url) VALUES (?, ?)", (site.name, site.url))
        conexao.commit()
    except sqlite3.IntegrityError:
        conexao.close()
        raise HTTPException(status_code=409, detail="Site já cadastrado")
    novo_id = cursor.lastrowid
    conexao.close()
    return {"id": novo_id, "name": site.name, "url": site.url}