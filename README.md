# site-monitor

API REST em Python (FastAPI) para monitorar a disponibilidade de sites. Evolução do [uptime-alert-slack](https://github.com/antoniomanol62-ux/uptime-alert-slack), que começou como um script em Bash.

> Em desenvolvimento.

## Como rodar

```bash
git clone https://github.com/antoniomanol62-ux/site-monitor.git
cd site-monitor
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python criar_banco.py
python popular_banco.py
uvicorn main:app --reload
```

`criar_banco.py` cria a tabela `sites` e `popular_banco.py` insere dois sites de exemplo (rode uma vez só).

A documentação interativa (Swagger) fica em `http://localhost:8000/docs`.

## Endpoints

- `GET /health`: verifica se a API está no ar
- `GET /sites`: lista os sites cadastrados no banco
- `POST /sites`: cadastra um site (`name` e `url`). Devolve **201** com o `id`, **409** se a `url` já existe e **422** se faltar algum campo

## Como o banco funciona

Os dados ficam num banco SQLite (`sites.db`). A coluna `url` é `UNIQUE`, então o banco recusa site repetido e a API responde 409. As consultas usam `?` para separar o comando SQL do dado do usuário, evitando SQL injection.

## Roadmap

- [x] API mínima com FastAPI
- [x] Banco SQLite e cadastro de sites (`POST /sites`)
- [ ] Verificador em segundo plano com retry e alerta no Slack
- [x] Página web que consome a API
- [ ] Testes com pytest e CI no GitHub Actions
- [ ] Docker Compose
