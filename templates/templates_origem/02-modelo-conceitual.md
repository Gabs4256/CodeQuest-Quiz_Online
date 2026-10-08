# Passo 4 — Modelo conceitual

Marco M1. A entrega deste passo é o modelo conceitual: o desenho em `entregas/02-conceitual.pdf` (ou `.png`) e as tabelas abaixo.

É um DER na notação de Chen, no brModelo ou no Visual Paradigm Online. Entidades, atributos, relacionamentos e cardinalidades. Ainda não aparecem tabela, chave estrangeira nem tipo de coluna: isso é o modelo lógico, no passo 5.

## Entidades

| Entidade |               Atributos                   | Identificador  |
| jogador  | codigo /unique/ nome                      | codigo jogador |
| partida  | codigo/ cod_jogador/ pontos / total/ data | codigo partida |

## Relacionamentos

Uma frase por linha, ligada a um requisito. Cardinalidade dos dois lados, mínimo e máximo.
jogador
1 jogador pode jogar 1 partida.
partida
1 partida pode estar relacionada a 1 jogador

| Relacionamento | Cardinalidade | Justificativa | Requisito |
| --- | --- | --- | --- |
| Jogador — Partidas | 1 : 1 | Cada partida é registrada para um único jogador, identificado pela FK cod_jogador em Partidas, 
que referencia Jogador.Codigo. Pelo diagrama, cada jogador também está associado a uma única partida. | RD11 |


O diagrama e esta tabela descrevem o mesmo modelo. Toda entidade do desenho está na tabela.
