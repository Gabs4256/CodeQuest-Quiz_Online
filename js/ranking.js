const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");

// Guarda a mensagem original de "ranking vazio" para poder restaurar depois
const htmlVazio = vazio.innerHTML;

// Busca o ranking no servidor. Devolve null se der erro.
async function lerRanking() {
  try {
    const resposta = await fetch(`${API_BASE_URL}/api/ranking`);

    if (!resposta.ok) {
      return null;
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      return null;
    }

    return dados.filter((item) => item && typeof item.pontos === "number");
  } catch (erro) {
    return null;
  }
}

async function mostrarRanking() {
  lista.innerHTML = "";

  // O servidor já devolve ordenado e limitado ao top 10
  const ranking = await lerRanking();

  if (ranking === null) {
    vazio.textContent =
      "Não foi possível carregar o ranking. Verifique se o servidor está rodando.";
    vazio.hidden = false;
    return;
  }

  vazio.innerHTML = htmlVazio;
  vazio.hidden = ranking.length > 0;

  ranking.forEach((item, indice) => {
    const linha = document.createElement("li");

    const posicao = document.createElement("span");
    posicao.className = "posicao";
    posicao.textContent = indice + 1;

    const nome = document.createElement("span");
    nome.className = "nome-jogador";
    nome.textContent = item.nome || "Jogador";

    const pontos = document.createElement("span");
    pontos.className = "pontos-jogador";
    pontos.textContent = item.pontos;

    const total = document.createElement("small");
    total.textContent = `/${item.total || 10}`;

    pontos.appendChild(total);
    linha.append(posicao, nome, pontos);
    lista.appendChild(linha);
  });
}

mostrarRanking();
