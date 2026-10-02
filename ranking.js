const CHAVE_RANKING = "codequestRanking";

const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");
const botaoLimpar = document.getElementById("limpar");


function lerRanking() {

    try {

        const dados = JSON.parse(localStorage.getItem(CHAVE_RANKING));

        if (!Array.isArray(dados)) {
            return [];
        }

        return dados.filter(item => item && typeof item.pontos === "number");

    } catch (erro) {

        return [];

    }

}


function mostrarRanking() {

    lista.innerHTML = "";

    const ranking = lerRanking()
        .sort((a, b) => b.pontos - a.pontos || a.data - b.data)
        .slice(0, 10);


    vazio.hidden = ranking.length > 0;
    botaoLimpar.hidden = ranking.length === 0;


    ranking.forEach((item, indice) => {

        const linha = document.createElement("li");

        const posicao = document.createElement("span");
        posicao.className = "posicao";
        posicao.textContent = indice + 1;

        const nome = document.createElement("span");
        nome.className = "nome-jogador";
        nome.textContent = item.nome || "Jogador";

        const pontos = document.createElement("span");
        pontos.className = "pontos-jogador";
        pontos.textContent = item.pontos;

        const total = document.createElement("small");
        total.textContent = `/${item.total || 10}`;
        pontos.appendChild(total);

        linha.append(posicao, nome, pontos);
        lista.appendChild(linha);

    });

}


botaoLimpar.addEventListener("click", () => {

    if (confirm("Apagar todo o ranking?")) {

        localStorage.removeItem(CHAVE_RANKING);
        mostrarRanking();

    }

});


mostrarRanking();