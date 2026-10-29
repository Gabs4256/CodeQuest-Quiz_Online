-- ============================================================
-- CodeQuest | Quiz Online - DML (carga de dados)
-- Rode depois do DDL (codequest_bd.sql), num banco vazio:
--   psql -d codequest -v ON_ERROR_STOP=1 -f codequest_bd.sql
--   psql -d codequest -v ON_ERROR_STOP=1 -f codequest_dml.sql
-- Ordem dos INSERTs (por causa das FKs):
--   pergunta -> resposta -> partida -> ranking
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- PERGUNTA
-- 10 perguntas de tech trivia. Cada acerto vale 1 ponto, igual
-- ao quiz.js (pontuacao++), então a nota máxima é 10, que é a
-- escala usada no resultado.js (9, 7, 5...).
-- ------------------------------------------------------------
INSERT INTO pergunta (codigo, enunciado, pontuacao) VALUES
 (1,  'Qual linguagem de programação é executada nativamente pelos navegadores web?', 1),
 (2,  'O que significa a sigla HTML?', 1),
 (3,  'Qual comando SQL é usado para consultar dados de uma tabela?', 1),
 (4,  'Em CSS, qual propriedade altera a cor do texto de um elemento?', 1),
 (5,  'Qual é o resultado de typeof null em JavaScript?', 1),
 (6,  'Qual estrutura de dados segue o princípio LIFO (último a entrar, primeiro a sair)?', 1),
 (7,  'Quem é considerada a primeira pessoa programadora da história?', 1),
 (8,  'Qual método HTTP é normalmente usado para enviar os dados de um formulário ao servidor?', 1),
 (9,  'Em JavaScript, qual operador compara valor e tipo ao mesmo tempo?', 1),
 (10, 'Qual é a complexidade de tempo da busca binária em um vetor ordenado?', 1);

-- ------------------------------------------------------------
-- RESPOSTA
-- 4 alternativas por pergunta, exatamente 1 correta.
-- Códigos: pergunta N usa as respostas (N-1)*4+1 até N*4.
-- ------------------------------------------------------------
INSERT INTO resposta (codigo, cod_pergunta, texto, correta) VALUES
 -- 1
 (1,  1, 'Java',       FALSE),
 (2,  1, 'Python',     FALSE),
 (3,  1, 'JavaScript', TRUE),
 (4,  1, 'C#',         FALSE),
 -- 2
 (5,  2, 'HyperText Markup Language',             TRUE),
 (6,  2, 'High Tech Modern Language',             FALSE),
 (7,  2, 'Hyperlink and Text Management Language', FALSE),
 (8,  2, 'Home Tool Markup Language',             FALSE),
 -- 3
 (9,  3, 'INSERT', FALSE),
 (10, 3, 'UPDATE', FALSE),
 (11, 3, 'SELECT', TRUE),
 (12, 3, 'DELETE', FALSE),
 -- 4
 (13, 4, 'background-color', FALSE),
 (14, 4, 'color',            TRUE),
 (15, 4, 'font-style',       FALSE),
 (16, 4, 'text-color',       FALSE),
 -- 5
 (17, 5, '"null"',      FALSE),
 (18, 5, '"undefined"', FALSE),
 (19, 5, '"object"',    TRUE),
 (20, 5, '"number"',    FALSE),
 -- 6
 (21, 6, 'Fila',   FALSE),
 (22, 6, 'Pilha',  TRUE),
 (23, 6, 'Árvore', FALSE),
 (24, 6, 'Grafo',  FALSE),
 -- 7
 (25, 7, 'Alan Turing',      FALSE),
 (26, 7, 'Ada Lovelace',     TRUE),
 (27, 7, 'Grace Hopper',     FALSE),
 (28, 7, 'Charles Babbage',  FALSE),
 -- 8
 (29, 8, 'GET',     FALSE),
 (30, 8, 'POST',    TRUE),
 (31, 8, 'HEAD',    FALSE),
 (32, 8, 'OPTIONS', FALSE),
 -- 9
 (33, 9, '==',  FALSE),
 (34, 9, '=',   FALSE),
 (35, 9, '===', TRUE),
 (36, 9, '!=',  FALSE),
 -- 10
 (37, 10, 'O(n)',     FALSE),
 (38, 10, 'O(n²)',    FALSE),
 (39, 10, 'O(log n)', TRUE),
 (40, 10, 'O(1)',     FALSE);

-- ------------------------------------------------------------
-- PARTIDA
-- 5 partidas de exemplo. "ponto" é o total da partida e tem
-- que bater com a soma dos pontos dela na tabela ranking.
-- Bruno e Elisa empatam com 7 para testar o desempate.
-- ------------------------------------------------------------
INSERT INTO partida (codigo, nome, ponto) VALUES
 (1, 'Ana',   9),
 (2, 'Bruno', 7),
 (3, 'Carla', 10),
 (4, 'Diego', 5),
 (5, 'Elisa', 7);

-- ------------------------------------------------------------
-- RANKING
-- Pontos de cada partida em cada pergunta:
-- valor de pergunta.pontuacao se acertou, 0 se errou.
-- ------------------------------------------------------------
INSERT INTO ranking (cod_partida, cod_pergunta, pontos) VALUES
 -- Ana (9): errou a 7
 (1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 1),
 (1, 6, 1), (1, 7, 0), (1, 8, 1), (1, 9, 1), (1, 10, 1),
 -- Bruno (7): errou 3, 7 e 9
 (2, 1, 1), (2, 2, 1), (2, 3, 0), (2, 4, 1), (2, 5, 1),
 (2, 6, 1), (2, 7, 0), (2, 8, 1), (2, 9, 0), (2, 10, 1),
 -- Carla (10): acertou todas
 (3, 1, 1), (3, 2, 1), (3, 3, 1), (3, 4, 1), (3, 5, 1),
 (3, 6, 1), (3, 7, 1), (3, 8, 1), (3, 9, 1), (3, 10, 1),
 -- Diego (5): errou 2, 4, 6, 8 e 10
 (4, 1, 1), (4, 2, 0), (4, 3, 1), (4, 4, 0), (4, 5, 1),
 (4, 6, 0), (4, 7, 1), (4, 8, 0), (4, 9, 1), (4, 10, 0),
 -- Elisa (7): errou 1, 5 e 9
 (5, 1, 0), (5, 2, 1), (5, 3, 1), (5, 4, 1), (5, 5, 0),
 (5, 6, 1), (5, 7, 1), (5, 8, 1), (5, 9, 0), (5, 10, 1);

-- Como os códigos acima foram informados à mão, ajusta os
-- contadores SERIAL para os próximos INSERTs continuarem dali.
SELECT setval(pg_get_serial_sequence('pergunta', 'codigo'), (SELECT MAX(codigo) FROM pergunta));
SELECT setval(pg_get_serial_sequence('resposta', 'codigo'), (SELECT MAX(codigo) FROM resposta));
SELECT setval(pg_get_serial_sequence('partida',  'codigo'), (SELECT MAX(codigo) FROM partida));

COMMIT;
