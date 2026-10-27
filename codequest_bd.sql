CREATE TABLE partida (
    codigo SERIAL,
    nome VARCHAR(50) NOT NULL,
    ponto INTEGER,
    CONSTRAINT pk_partida PRIMARY KEY (codigo)
);

CREATE TABLE pergunta(
	codigo SERIAL,
	enunciado VARCHAR(255) NOT NULL,
	pontuacao INTEGER,
	CONSTRAINT pk_pergunta PRIMARY KEY (codigo)
);

CREATE TABLE resposta(
	codigo SERIAL,
	cod_pergunta INTEGER NOT NULL,
	texto VARCHAR(255),
	correta BOOLEAN NOT NULL,
	CONSTRAINT pk_resposta PRIMARY KEY(codigo),
	CONSTRAINT fk_resposta_pergunta FOREIGN KEY (cod_pergunta)
		REFERENCES pergunta(codigo)
);

CREATE TABLE ranking(
	codigo SERIAL,
	cod_partida INT NOT NULL,
	cod_pergunta INT NOT NULL,
	pontos INT NOT NULL,
	CONSTRAINT pk_ranking PRIMARY KEY (codigo),
	CONSTRAINT fk_ranking_partida FOREIGN KEY (cod_partida)
		REFERENCES partida (codigo),
	CONSTRAINT fk_ranking_pergunta FOREIGN KEY (cod_pergunta)
		REFERENCES pergunta (codigo),
	CONSTRAINT uq_ranking_partida_pergunta UNIQUE (cod_partida, cod_pergunta)
);
