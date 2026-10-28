const http = require("http");

const PORT = process.env.PORT || 3000;

// Dados fictícios, só para testar a rota e o formato.
// Depois isso será trocado pela consulta ao Supabase.
const perguntasMock = [
  {
    id: 1,
    pergunta: "Qual linguagem é executada nativamente pelos navegadores?",
    alternativas: ["Java", "Python", "JavaScript", "C#"],
    resposta: 2,
  },
  {
    id: 2,
    pergunta: "O que significa a sigla HTML?",
    alternativas: [
      "HyperText Markup Language",
      "High Tech Modern Language",
      "Hyperlink and Text Management Language",
      "Home Tool Markup Language",
    ],
    resposta: 0,
  },
];

function enviarJSON(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method !== "GET") {
    return enviarJSON(res, 405, { erro: "Método não permitido." });
  }

  if (url.pathname === "/api/perguntas") {
    return enviarJSON(res, 200, perguntasMock);
  }

  return enviarJSON(res, 404, { erro: "Rota não encontrada." });
});

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
