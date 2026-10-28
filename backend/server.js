require("dotenv").config();
const http = require("http");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

// Cabeçalhos de CORS: dizem ao navegador quem pode chamar a API e com quais métodos
function cabecalhosCors() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function enviarJSON(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...cabecalhosCors(),
  });
  res.end(JSON.stringify(payload));
}

// Lê o corpo de um POST e converte de JSON (devolve null se vier inválido)
function lerCorpoJSON(req) {
  return new Promise((resolve, reject) => {
    let corpo = "";

    req.on("data", (pedaco) => {
      corpo += pedaco;
      if (corpo.length > 10000) {
        reject(new Error("Corpo da requisição grande demais"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(corpo));
      } catch {
        resolve(null);
      }
    });

    req.on("error", reject);
  });
}

// GET /api/perguntas -> formato do quiz.js: {id, pergunta, alternativas, resposta}
async function listarPerguntas(res) {
  const { data, error } = await supabase
    .from("pergunta")
    .select("codigo, enunciado, resposta(codigo, texto, correta)")
    .order("codigo")
    .order("codigo", { referencedTable: "resposta" });

  if (error) throw error;

  const perguntas = data.map((p) => ({
    id: p.codigo,
    pergunta: p.enunciado,
    alternativas: p.resposta.map((r) => r.texto),
    resposta: p.resposta.findIndex((r) => r.correta),
  }));

  return enviarJSON(res, 200, perguntas);
}

// GET /api/ranking -> top 10, empate vai para quem jogou antes
async function verRanking(res) {
  const { data, error } = await supabase
    .from("partida")
    .select("nome, ponto")
    .order("ponto", { ascending: false })
    .order("codigo", { ascending: true })
    .limit(10);

  if (error) throw error;

  return enviarJSON(
    res,
    200,
    data.map((p) => ({ nome: p.nome, pontos: p.ponto, total: 10 })),
  );
}

// POST /api/partidas -> recebe {nome, respostas: [{pergunta_id, ordem}]}
// A pontuação é calculada aqui no servidor; não confiamos no navegador.
async function salvarPartida(req, res) {
  const dados = await lerCorpoJSON(req);

  if (!dados || !Array.isArray(dados.respostas)) {
    return enviarJSON(res, 400, { erro: "Envie {nome, respostas}." });
  }

  // partida.nome é VARCHAR(50)
  const nome =
    String(dados.nome ?? "")
      .trim()
      .slice(0, 50) || "Jogador";

  const { data: perguntas, error } = await supabase
    .from("pergunta")
    .select("codigo, pontuacao, resposta(codigo, correta)")
    .order("codigo")
    .order("codigo", { referencedTable: "resposta" });

  if (error) throw error;

  // Alternativa marcada em cada pergunta, ex.: {1: 2, 2: 0, ...}
  const escolhidas = {};
  for (const r of dados.respostas) {
    escolhidas[r.pergunta_id] = r.ordem;
  }

  // Uma linha do ranking por pergunta: valor da pergunta se acertou, 0 se errou
  const linhasRanking = [];
  for (const p of perguntas) {
    const alternativa = p.resposta[escolhidas[p.codigo]];

    if (!alternativa) {
      return enviarJSON(res, 400, {
        erro: "Responda todas as perguntas do quiz.",
      });
    }

    linhasRanking.push({
      cod_pergunta: p.codigo,
      pontos: alternativa.correta ? p.pontuacao : 0,
    });
  }

  const pontos = linhasRanking.reduce((soma, l) => soma + l.pontos, 0);
  const total = perguntas.reduce((soma, p) => soma + p.pontuacao, 0);

  const { data: partida, error: erroPartida } = await supabase
    .from("partida")
    .insert({ nome, ponto: pontos })
    .select("codigo")
    .single();

  if (erroPartida) throw erroPartida;

  const { error: erroRanking } = await supabase
    .from("ranking")
    .insert(linhasRanking.map((l) => ({ ...l, cod_partida: partida.codigo })));

  if (erroRanking) throw erroRanking;

  return enviarJSON(res, 201, { partida_id: partida.codigo, pontos, total });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rota = `${req.method} ${url.pathname}`;

  // Pré-verificação que o navegador faz antes de um POST com JSON
  if (req.method === "OPTIONS") {
    res.writeHead(204, cabecalhosCors());
    return res.end();
  }

  try {
    if (rota === "GET /api/perguntas") return await listarPerguntas(res);
    if (rota === "GET /api/ranking") return await verRanking(res);
    if (rota === "POST /api/partidas") return await salvarPartida(req, res);

    return enviarJSON(res, 404, { erro: "Rota não encontrada." });
  } catch (err) {
    console.error("Erro ao consultar o Supabase:", err.message);
    return enviarJSON(res, 500, {
      erro: "Erro interno ao consultar o banco de dados.",
    });
  }
});

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
