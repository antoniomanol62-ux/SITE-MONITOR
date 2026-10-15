// Endereço da sua API FastAPI (o uvicorn precisa estar rodando)
const API = "http://127.0.0.1:8000";

// Elementos da página (o DOM que o JavaScript vai manipular)
const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");
const contagem = document.getElementById("contagem");
const busca = document.getElementById("busca");
const form = document.getElementById("form");
const campoNome = document.getElementById("nome");
const campoUrl = document.getElementById("url");
const botao = document.getElementById("botao");
const mensagem = document.getElementById("mensagem");
const status = document.getElementById("status");
const statusTexto = document.getElementById("status-texto");

// Estado: a lista de sites que veio da API
let sites = [];

// ---------- status da API ----------
async function verificarApi() {
  try {
    const resposta = await fetch(`${API}/health`);
    if (!resposta.ok) throw new Error("API respondeu com erro");
    status.className = "status online";
    statusTexto.textContent = "API no ar";
    return true;
  } catch (erro) {
    status.className = "status offline";
    statusTexto.textContent = "API fora do ar";
    return false;
  }
}

// ---------- GET /sites ----------
async function carregarSites() {
  const noAr = await verificarApi();
  if (!noAr) {
    sites = [];
    desenhar();
    mostrarVazio("Não foi possível falar com a API. Rode `uvicorn main:app --reload` na pasta do site-monitor e recarregue a página.");
    return;
  }
  try {
    const resposta = await fetch(`${API}/sites`);
    sites = await resposta.json();
    desenhar();
  } catch (erro) {
    mostrarVazio("A API respondeu, mas a lista não pôde ser lida.");
  }
}

// ---------- desenhar a lista na tela ----------
function desenhar(idNovo = null) {
  const termo = busca.value.trim().toLowerCase();
  const filtrados = sites.filter(
    (s) => s.name.toLowerCase().includes(termo) || s.url.toLowerCase().includes(termo)
  );

  lista.replaceChildren();
  contagem.textContent = filtrados.length;

  for (const site of filtrados) {
    const item = document.createElement("li");
    item.className = "item";
    if (site.id === idNovo) item.classList.add("novo");

    const id = document.createElement("span");
    id.className = "item-id";
    id.textContent = "#" + site.id;

    const corpo = document.createElement("div");

    const nome = document.createElement("p");
    nome.className = "item-nome";
    nome.textContent = site.name; // textContent evita injetar HTML vindo do usuário

    const link = document.createElement("a");
    link.className = "item-url";
    link.textContent = site.url;
    link.href = site.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    corpo.append(nome, link);
    item.append(id, corpo);
    lista.appendChild(item);
  }

  if (filtrados.length === 0 && sites.length > 0) {
    mostrarVazio("Nenhum site encontrado para essa busca.");
  } else if (sites.length === 0) {
    mostrarVazio("Nenhum site cadastrado ainda. Use o formulário ao lado.");
  } else {
    vazio.hidden = true;
  }
}

function mostrarVazio(texto) {
  vazio.textContent = texto;
  vazio.hidden = false;
}

// ---------- mensagens do formulário ----------
function avisar(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem " + tipo;
  mensagem.hidden = false;
}

// ---------- POST /sites ----------
async function cadastrar(evento) {
  evento.preventDefault();
  mensagem.hidden = true;

  const name = campoNome.value.trim();
  const url = campoUrl.value.trim();

  if (!name || !url) {
    avisar("Preencha o nome e a URL.", "aviso");
    return;
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    avisar("A URL precisa começar com http:// ou https://", "aviso");
    return;
  }

  botao.disabled = true;
  try {
    const resposta = await fetch(`${API}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url }),
    });

    if (resposta.status === 201) {
      const novo = await resposta.json();
      sites.push(novo);
      busca.value = "";
      desenhar(novo.id);
      form.reset();
      avisar("Site cadastrado.", "ok");
    } else if (resposta.status === 409) {
      avisar("Esse site já está cadastrado.", "aviso");
    } else if (resposta.status === 422) {
      avisar("A API recusou os dados. Confira nome e URL.", "erro");
    } else {
      avisar("Erro inesperado da API (código " + resposta.status + ").", "erro");
    }
  } catch (erro) {
    avisar("Não foi possível falar com a API. Ela está rodando?", "erro");
    verificarApi();
  } finally {
    botao.disabled = false;
  }
}

// ---------- ligar tudo ----------
form.addEventListener("submit", cadastrar);
busca.addEventListener("input", () => desenhar());
carregarSites();