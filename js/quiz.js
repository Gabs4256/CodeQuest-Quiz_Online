const parametros = new URLSearchParams(window.location.search);

const nomeJogador = parametros.get("nomeJogador");

if (nomeJogador) {
  localStorage.setItem("nomeJogador", nomeJogador);
}

// As perguntas agora vêm do banco de dados (rota /api/perguntas)
let perguntas = [];

let perguntaAtual = 0;
let pontuacao = 0;
let respostaSelecionada = false;

// Guarda o que o jogador marcou, para enviar ao servidor no final
const respostasDadas = [];

const tituloPergunta = document.querySelector(".pergunta h1");
const textoPergunta = document.querySelector(".pergunta h2");
const numeroPergunta = document.querySelector(".numero-pergunta");
const contador = document.querySelector(".contador");
const barraProgresso = document.querySelector(".barra-progresso");
const alternativas = document.querySelectorAll(".alternativa");
const botaoProxima = document.querySelector(".proxima");

async function carregarPerguntas() {
  try {
    const resposta = await fetch(`${API_BASE_URL}/api/perguntas`);

    if (!resposta.ok) {
      throw new Error("Falha ao buscar as perguntas");
    }

    perguntas = await resposta.json();

    if (!Array.isArray(perguntas) || perguntas.length === 0) {
      throw new Error("Nenhuma pergunta cadastrada");
    }

    carregarPergunta();
  } catch (erro) {
    textoPergunta.textContent =
      "Não foi possível carregar as perguntas. Verifique se o servidor está rodando.";

    alternativas.forEach(botao => {
      botao.disabled = true;
    });

    botaoProxima.disabled = true;
  }
}

function carregarPergunta() {
  const pergunta = perguntas[perguntaAtual];

  contador.textContent =
    `${perguntaAtual + 1}/${perguntas.length}`;

  numeroPergunta.textContent =
    `QUESTÃO ${String(perguntaAtual + 1).padStart(2, "0")}`;

  tituloPergunta.textContent =
    `Pergunta ${perguntaAtual + 1}`;

  textoPergunta.textContent =
    pergunta.pergunta;

  alternativas.forEach((botao, indice) => {
    // Só troca o texto; a letra (A, B, C, D) já está no HTML
    botao.querySelector(".texto-alternativa").textContent =
      pergunta.alternativas[indice];

    botao.disabled = false;
    botao.classList.remove("correta");
    botao.classList.remove("errada");
  });

  // Barra de progresso avança a cada pergunta
  barraProgresso.style.width =
    `${((perguntaAtual + 1) / perguntas.length) * 100}%`;

  respostaSelecionada = false;
  botaoProxima.disabled = true;
}

alternativas.forEach((botao, indice) => {
  botao.addEventListener("click", () => {
    if (respostaSelecionada || perguntas.length === 0) {
      return;
    }

    respostaSelecionada = true;

    const pergunta = perguntas[perguntaAtual];

    respostasDadas.push({
      pergunta_id: pergunta.id,
      ordem: indice
    });

    if (indice === pergunta.resposta) {
      botao.classList.add("correta");
      pontuacao++;
    } else {
      botao.classList.add("errada");

      alternativas[pergunta.resposta]
        .classList.add("correta");
    }

    alternativas.forEach(botao => {
      botao.disabled = true;
    });

    botaoProxima.disabled = false;
  });
});

botaoProxima.addEventListener("click", async () => {
  perguntaAtual++;

  if (perguntaAtual < perguntas.length) {
    carregarPergunta();
    return;
  }

  // Fim do quiz: envia as respostas para o servidor salvar no banco.
  // A pontuação oficial é a calculada pelo servidor.
  botaoProxima.disabled = true;

  let pontosFinais = pontuacao;
  let totalFinal = perguntas.length;

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/partidas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: localStorage.getItem("nomeJogador") || "Jogador",
        respostas: respostasDadas,
      }),
    });

    if (!resposta.ok) {
      throw new Error("Falha ao salvar a partida");
    }

    const dados = await resposta.json();
    pontosFinais = dados.pontos;
    totalFinal = dados.total;
  } catch (erro) {
    alert("Não foi possível salvar sua pontuação no ranking. Verifique se o servidor está rodando.");
  }

  // O resultado.js continua lendo daqui
  localStorage.setItem("pontuacao", pontosFinais);
  localStorage.setItem("totalPerguntas", totalFinal);

  window.location.href = "resultado.html";
});

carregarPerguntas();
