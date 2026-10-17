"""
CodeQuest | Quiz Online - Backend (Flask + PostgreSQL)

Como rodar:  python app.py   e abrir  http://localhost:5000
"""
import os
from contextlib import contextmanager
from pathlib import Path

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, redirect, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Configuração do banco (vem do arquivo .env; veja .env.example)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME", "codequest"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

# Só estes tipos de arquivo, e só da pasta principal, são entregues ao navegador.
# Assim o app.py e o .env nunca ficam acessíveis pelo site.
EXTENSOES_PUBLICAS = {".html", ".css", ".js", ".svg"}

app = Flask(__name__, static_folder=None)
app.json.ensure_ascii = False


@contextmanager
def conexao():
    """Abre uma conexão, entrega um cursor e faz commit (ou rollback se der erro)."""
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
    finally:
        conn.close()


def erro(mensagem, codigo=400):
    return jsonify({"erro": mensagem}), codigo


def eh_inteiro(valor):
    # bool também é int em Python, por isso a checagem extra
    return isinstance(valor, int) and not isinstance(valor, bool)


@app.errorhandler(psycopg2.Error)
def erro_banco(e):
    app.logger.error("Erro no banco de dados: %s", e)
    return erro("Erro ao acessar o banco de dados.", 500)


# ---------------------------------------------------------------
# API
# ---------------------------------------------------------------
@app.get("/api/perguntas")
def listar_perguntas():
    """Perguntas ativas, no mesmo formato que o quiz.js usava:
    {id, pergunta, alternativas: [...], resposta: indice_da_correta}"""
    with conexao() as cur:
        cur.execute(
            """
            SELECT p.id, p.enunciado, a.ordem, a.texto, a.correta
            FROM perguntas p
            JOIN alternativas a ON a.pergunta_id = p.id
            WHERE p.ativa
            ORDER BY p.id, a.ordem
            """
        )
        linhas = cur.fetchall()

    perguntas = {}
    for linha in linhas:
        item = perguntas.setdefault(
            linha["id"],
            {"id": linha["id"], "pergunta": linha["enunciado"], "alternativas": [], "resposta": None},
        )
        item["alternativas"].append(linha["texto"])
        if linha["correta"]:
            item["resposta"] = linha["ordem"]
    return jsonify(list(perguntas.values()))


@app.post("/api/partidas")
def salvar_partida():
    """Recebe {nome, respostas: [{pergunta_id, ordem}]}.
    A pontuação é calculada aqui no servidor, não vem do navegador."""
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return erro("Envie os dados em JSON.")

    nome = str(dados.get("nome") or "").strip()[:60] or "Jogador"

    respostas = dados.get("respostas")
    if not isinstance(respostas, list) or not respostas:
        return erro("Envie a lista de respostas.")

    escolhidas = {}  # pergunta_id -> ordem da alternativa marcada (0 a 3)
    for item in respostas:
        if (
            not isinstance(item, dict)
            or not eh_inteiro(item.get("pergunta_id"))
            or not eh_inteiro(item.get("ordem"))
            or not 0 <= item["ordem"] <= 3
        ):
            return erro("Resposta inválida.")
        if item["pergunta_id"] in escolhidas:
            return erro("Pergunta repetida nas respostas.")
        escolhidas[item["pergunta_id"]] = item["ordem"]

    with conexao() as cur:
        cur.execute("SELECT id FROM perguntas WHERE ativa")
        ativas = {linha["id"] for linha in cur.fetchall()}
        if set(escolhidas) != ativas:
            return erro("Responda todas as perguntas do quiz.")

        cur.execute(
            "SELECT id, pergunta_id, ordem, correta FROM alternativas WHERE pergunta_id = ANY(%s)",
            (list(ativas),),
        )
        alternativas = {(l["pergunta_id"], l["ordem"]): l for l in cur.fetchall()}

        pontos = 0
        linhas_respostas = []
        for pergunta_id, ordem in escolhidas.items():
            alt = alternativas.get((pergunta_id, ordem))
            if alt is None:
                return erro("Alternativa inexistente.")
            pontos += alt["correta"]
            linhas_respostas.append((pergunta_id, alt["id"], alt["correta"]))
        total = len(ativas)

        # Reaproveita o jogador se já existir um com o mesmo nome
        cur.execute("SELECT id FROM jogadores WHERE nome = %s ORDER BY id LIMIT 1", (nome,))
        achado = cur.fetchone()
        if achado:
            jogador_id = achado["id"]
        else:
            cur.execute("INSERT INTO jogadores (nome) VALUES (%s) RETURNING id", (nome,))
            jogador_id = cur.fetchone()["id"]

        cur.execute(
            "INSERT INTO partidas (jogador_id, pontos, total_perguntas) VALUES (%s, %s, %s) RETURNING id",
            (jogador_id, pontos, total),
        )
        partida_id = cur.fetchone()["id"]

        psycopg2.extras.execute_values(
            cur,
            "INSERT INTO respostas_partida (partida_id, pergunta_id, alternativa_escolhida_id, acertou) VALUES %s",
            [(partida_id, *linha) for linha in linhas_respostas],
        )

    return jsonify({"partida_id": partida_id, "pontos": pontos, "total": total}), 201


@app.get("/api/ranking")
def ver_ranking():
    with conexao() as cur:
        cur.execute("SELECT nome, pontos, total_perguntas AS total FROM vw_ranking")
        return jsonify(cur.fetchall())


@app.delete("/api/ranking")
def limpar_ranking():
    """Botão 'limpar' da tela de ranking. Apaga as partidas (e as respostas delas)."""
    with conexao() as cur:
        cur.execute("DELETE FROM partidas")
    return "", 204


# ---------------------------------------------------------------
# Páginas do site (login.html, quiz.html, ranking.html, ...)
# ---------------------------------------------------------------
@app.get("/")
def inicio():
    return redirect("/login.html")


@app.get("/<path:nome>")
def arquivo(nome):
    caminho = Path(nome)
    if len(caminho.parts) != 1 or caminho.suffix.lower() not in EXTENSOES_PUBLICAS:
        abort(404)
    return send_from_directory(BASE_DIR, nome)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=os.getenv("FLASK_DEBUG", "1") == "1")
