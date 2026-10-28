require("dotenv").config();
const http = require("http");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function enviarJSON(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  });
  res.end(JSON.stringify(payload));
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method !== "GET") {
    return enviarJSON(res, 405, { erro: "Método não permitido." });
  }

  try {
    if (url.pathname === "/api/perguntas") return await listarPerguntas(res);
    if (url.pathname === "/api/ranking") return await verRanking(res);

    return enviarJSON(res, 404, { erro: "Rota não encontrada." });
  } catch (err) {
    console.error("Erro ao consultar o Supabase:", err.message);
    return enviarJSON(res, 500, {
      erro: "Erro interno ao consultar o banco de dados.",
    });
  }
});

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
