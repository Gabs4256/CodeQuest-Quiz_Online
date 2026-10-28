-- ============================================================
-- CodeQuest | Quiz Online - Testes (SELECTs)
-- Rode depois do DDL e do DML:
--   psql -d codequest -f codequest_testes.sql
-- Parte 1: confere se a carga entrou certa.
-- Parte 2: confere a integridade dos relacionamentos.
--          Cada consulta lista o que está ERRADO, então o
--          resultado esperado é 0 linhas.
-- Parte 3: consultas que o site usa.
-- Parte 4: regras que o banco tem que barrar (comentadas).
-- ============================================================


-- ============================================================
-- PARTE 1 - Quantidade de registros
-- ============================================================

-- T01. Total de linhas em cada tabela.
-- Resultado esperado: pergunta 10 | resposta 40 | partida 5 | ranking 50
SELECT 'pergunta' AS tabela, COUNT(*) AS total FROM pergunta
UNION ALL
SELECT 'resposta', COUNT(*) FROM resposta
UNION ALL
SELECT 'partida',  COUNT(*) FROM partida
UNION ALL
SELECT 'ranking',  COUNT(*) FROM ranking;


-- ============================================================
-- PARTE 2 - Integridade (resultado esperado: 0 linhas)
-- ============================================================

-- T02. Perguntas que não têm exatamente 4 respostas.
SELECT p.codigo, COUNT(r.codigo) AS qtd_respostas
FROM pergunta p
LEFT JOIN resposta r ON r.cod_pergunta = p.codigo
GROUP BY p.codigo
HAVING COUNT(r.codigo) <> 4;

-- T03. Perguntas que não têm exatamente 1 resposta correta.
SELECT p.codigo, COUNT(r.codigo) FILTER (WHERE r.correta) AS qtd_corretas
FROM pergunta p
LEFT JOIN resposta r ON r.cod_pergunta = p.codigo
GROUP BY p.codigo
HAVING COUNT(r.codigo) FILTER (WHERE r.correta) <> 1;

-- T04. Respostas apontando para pergunta que não existe.
SELECT r.codigo, r.cod_pergunta
FROM resposta r
LEFT JOIN pergunta p ON p.codigo = r.cod_pergunta
WHERE p.codigo IS NULL;

-- T05. Linhas do ranking com partida ou pergunta inexistente.
SELECT rk.codigo, rk.cod_partida, rk.cod_pergunta
FROM ranking rk
LEFT JOIN partida  pa ON pa.codigo = rk.cod_partida
LEFT JOIN pergunta pe ON pe.codigo = rk.cod_pergunta
WHERE pa.codigo IS NULL OR pe.codigo IS NULL;

-- T06. Pontos do ranking diferentes de 0 (errou) ou do valor
--      da pergunta (acertou).
SELECT rk.codigo, rk.cod_partida, rk.cod_pergunta, rk.pontos, pe.pontuacao
FROM ranking rk
JOIN pergunta pe ON pe.codigo = rk.cod_pergunta
WHERE rk.pontos NOT IN (0, pe.pontuacao);

-- T07. Partidas cujo total (partida.ponto) não bate com a soma
--      dos pontos no ranking.
SELECT pa.codigo, pa.nome, pa.ponto, COALESCE(SUM(rk.pontos), 0) AS soma_ranking
FROM partida pa
LEFT JOIN ranking rk ON rk.cod_partida = pa.codigo
GROUP BY pa.codigo, pa.nome, pa.ponto
HAVING pa.ponto <> COALESCE(SUM(rk.pontos), 0);

-- T08. Partidas que não responderam todas as perguntas.
SELECT pa.codigo, pa.nome, COUNT(rk.codigo) AS respondidas
FROM partida pa
LEFT JOIN ranking rk ON rk.cod_partida = pa.codigo
GROUP BY pa.codigo, pa.nome
HAVING COUNT(rk.codigo) <> (SELECT COUNT(*) FROM pergunta);

-- T09. Respostas com texto vazio ou nulo.
SELECT codigo, cod_pergunta
FROM resposta
WHERE texto IS NULL OR TRIM(texto) = '';


-- ============================================================
-- PARTE 3 - Consultas do site
-- ============================================================

-- T10. Perguntas com as alternativas (rota /api/perguntas).
-- Resultado esperado: 40 linhas, 4 por pergunta.
SELECT p.codigo AS cod_pergunta, p.enunciado, p.pontuacao,
       r.codigo AS cod_resposta, r.texto, r.correta
FROM pergunta p
JOIN resposta r ON r.cod_pergunta = p.codigo
ORDER BY p.codigo, r.codigo;

-- T11. Gabarito: a resposta correta de cada pergunta.
-- Resultado esperado: 10 linhas
--   1 JavaScript | 2 HyperText Markup Language | 3 SELECT | 4 color
--   5 "object" | 6 Pilha | 7 Ada Lovelace | 8 POST | 9 === | 10 O(log n)
SELECT p.codigo, p.enunciado, r.texto AS resposta_correta
FROM pergunta p
JOIN resposta r ON r.cod_pergunta = p.codigo
WHERE r.correta = TRUE
ORDER BY p.codigo;

-- T12. Conferir se uma alternativa escolhida está certa.
-- Pergunta 3, resposta 11 (SELECT) -> acertou = true
-- Pergunta 3, resposta 9  (INSERT) -> acertou = false
SELECT codigo, texto, correta AS acertou
FROM resposta
WHERE cod_pergunta = 3 AND codigo IN (11, 9)
ORDER BY codigo DESC;

-- T13. Ranking (rota /api/ranking): mais pontos primeiro,
--      empate vai para quem jogou antes (menor código); top 10.
-- Resultado esperado:
--   1 Carla 10 | 2 Ana 9 | 3 Bruno 7 | 4 Elisa 7 | 5 Diego 5
SELECT ROW_NUMBER() OVER (ORDER BY pa.ponto DESC, pa.codigo ASC) AS posicao,
       pa.nome,
       pa.ponto,
       (SELECT COUNT(*) FROM pergunta) AS total_perguntas
FROM partida pa
ORDER BY pa.ponto DESC, pa.codigo ASC
LIMIT 10;

-- T14. Desempenho de uma partida, pergunta a pergunta.
-- Resultado esperado (Bruno): 10 linhas, erros nas perguntas 3, 7 e 9.
SELECT pa.nome, pe.codigo AS cod_pergunta, pe.enunciado,
       rk.pontos,
       CASE WHEN rk.pontos > 0 THEN 'acertou' ELSE 'errou' END AS situacao
FROM ranking rk
JOIN partida  pa ON pa.codigo = rk.cod_partida
JOIN pergunta pe ON pe.codigo = rk.cod_pergunta
WHERE pa.nome = 'Bruno'
ORDER BY pe.codigo;

-- T15. Taxa de acerto de cada pergunta (da mais difícil para a
--      mais fácil).
-- Resultado esperado: perguntas 7 e 9 são as mais erradas (60% de
-- acerto, 3 de 5); todas as outras têm 80% (4 de 5).
SELECT pe.codigo, pe.enunciado,
       COUNT(*) FILTER (WHERE rk.pontos > 0) AS acertos,
       COUNT(*)                                AS respostas,
       ROUND(100.0 * COUNT(*) FILTER (WHERE rk.pontos > 0) / COUNT(*), 1) AS pct_acerto
FROM pergunta pe
JOIN ranking rk ON rk.cod_pergunta = pe.codigo
GROUP BY pe.codigo, pe.enunciado
ORDER BY pct_acerto ASC, pe.codigo;

-- T16. Média, maior e menor pontuação entre as partidas.
-- Resultado esperado: media 7.60 | maior 10 | menor 5
SELECT ROUND(AVG(ponto), 2) AS media,
       MAX(ponto)           AS maior,
       MIN(ponto)           AS menor
FROM partida;


-- ============================================================
-- PARTE 4 - Regras de negócio (cada bloco deve FALHAR)
-- Tire o comentário de um por vez para testar.
-- ============================================================

-- R01. Pergunta sem enunciado não entra.
-- Resultado: ERROR:  null value in column "enunciado" of relation "pergunta" violates not-null constraint
-- INSERT INTO pergunta (enunciado, pontuacao) VALUES (NULL, 1);

-- R02. Resposta precisa apontar para uma pergunta que existe.
-- Resultado: ERROR:  insert or update on table "resposta" violates foreign key constraint "fk_resposta_pergunta"
-- INSERT INTO resposta (cod_pergunta, texto, correta) VALUES (999, 'Teste', FALSE);

-- R03. Resposta precisa dizer se é correta ou não.
-- Resultado: ERROR:  null value in column "correta" of relation "resposta" violates not-null constraint
-- INSERT INTO resposta (cod_pergunta, texto, correta) VALUES (1, 'Teste', NULL);

-- R04. Partida sem nome de jogador não entra.
-- Resultado: ERROR:  null value in column "nome" of relation "partida" violates not-null constraint
-- INSERT INTO partida (nome, ponto) VALUES (NULL, 0);

-- R05. A mesma partida não pontua duas vezes na mesma pergunta.
-- Resultado: ERROR:  duplicate key value violates unique constraint "uq_ranking_partida_pergunta"
-- INSERT INTO ranking (cod_partida, cod_pergunta, pontos) VALUES (1, 1, 1);

-- R06. Ranking precisa de uma partida que existe.
-- Resultado: ERROR:  insert or update on table "ranking" violates foreign key constraint "fk_ranking_partida"
-- INSERT INTO ranking (cod_partida, cod_pergunta, pontos) VALUES (999, 1, 1);

-- R07. Não dá para apagar uma pergunta que já tem respostas.
-- Resultado: ERROR:  update or delete on table "pergunta" violates foreign key constraint "fk_resposta_pergunta" on table "resposta"
-- DELETE FROM pergunta WHERE codigo = 1;
