# Passos 5 e 6 — Modelo lógico, normalização e dicionário

Marco M2. A entrega do passo 5 é o modelo lógico: o desenho em `entregas/03-logico.pdf` (ou `.png`) e este texto em `entregas/03-logico.md`.

O desenho parte do modelo conceitual e mostra tabelas, colunas, chave primária e chaves estrangeiras. Não é outro DER. Pode ser feito no brModelo (modelo lógico) ou no Visual Paradigm Online. Se a normalização achar violação, corrijam o desenho e o texto.

## 5. Modelo lógico

| Relacionamento no DER | Cardinalidade | Vira | Onde fica a FK ou a tabela associativa |
| --- | --- | --- | --- |
| Jogador joga Partidas | 1:1 | FK com restrição UNIQUE | `Partidas.cod_jogador` referencia `Jogador.Codigo` e é UNIQUE |

N:N vira tabela associativa. 1:N vira chave estrangeira no lado N.

No relacionamento 1:1, cada jogador está ligado a uma única partida, e cada partida pertence a um único jogador. A chave estrangeira fica em `Partidas`, conforme o DER, e recebe a restrição `UNIQUE` para impedir que o mesmo jogador apareça em mais de uma partida. Não há relacionamento N:N, então não existe tabela associativa.

### Normalização

Dependências no formato `determinante → dependente`, com o requisito que sustenta.

| ID | Dependência | Requisito |
| --- | --- | --- |
| DF1 | `Jogador.Codigo → nome` | Cada jogador é identificado por um código e tem um nome. |
| DF2 | `Partidas.Codigo → cod_jogador, pontos, total, data` | Cada partida tem um código e registra quem jogou, quantos pontos fez, o total possível e quando ocorreu. |
| DF3 | `Partidas.cod_jogador → Codigo, pontos, total, data` | Como a relação é 1:1, cada jogador tem uma única partida, então `cod_jogador` também identifica a partida (chave candidata). |

| Forma | Por que o esquema atende | Tabela em que isso aparece |
| --- | --- | --- |
| 1FN | Todos os valores são atômicos: `nome` guarda um só nome, `data` guarda um só instante, `pontos` e `total` guardam um só número. Não há grupo multivalorado. | `Jogador` e `Partidas` |
| 2FN | As duas tabelas têm chave primária simples (`Codigo`), sem chave composta. Sem chave composta, não existe dependência parcial. | `Jogador` e `Partidas` |
| 3FN | Em `Jogador`, o único atributo não chave é `nome`. Em `Partidas`, `pontos`, `total` e `data` dependem só da chave (`Codigo`, ou `cod_jogador`, que é chave candidata por ser UNIQUE), e nenhum deles determina outro. O dado do jogador (`nome`) está em `Jogador`, e `Partidas` guarda só a FK. Não há dependência transitiva. | `Jogador` e `Partidas` |

Se alguma forma falhar: o que mudou neste dicionário.

Nenhuma forma falhou, então não houve mudança neste dicionário.

## 6. Dicionário de dados

Repitam o bloco para cada tabela. A descrição diz o que a coluna guarda, em uma linha.

### Tabela: Jogador

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| Codigo | int | NOT NULL | PK | Identificador único do jogador. |
| nome | varchar(50) | NOT NULL | — | Nome do jogador. |

### Tabela: Partidas

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| Codigo | int | NOT NULL | PK | Identificador único da partida. |
| cod_jogador | int | NOT NULL | FK → Jogador.Codigo, UNIQUE | Jogador que disputou a partida (um por partida, e uma partida por jogador). |
| pontos | int | NOT NULL | CHECK (pontos >= 0 AND pontos <= total) | Pontos feitos pelo jogador na partida. |
| total | int | NOT NULL | CHECK (total > 0) | Total de pontos possíveis na partida. |
| data | datetime | NOT NULL | DEFAULT CURRENT_TIMESTAMP | Data e hora em que a partida foi jogada. |
