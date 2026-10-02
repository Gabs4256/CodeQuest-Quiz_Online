const nome = localStorage.getItem("nomeJogador");
const pontuacao = localStorage.getItem("pontuacao");
const total = localStorage.getItem("totalPerguntas");

const nomeResultado = document.querySelector("#nomeResultado");
const pontuacaoElemento = document.querySelector("#pontuacao");
const mensagemResultado = document.querySelector("#mensagemResultado");

nomeResultado.textContent = `Parabéns, ${nome}!`;

pontuacaoElemento.textContent = `${pontuacao}/${total}`;

if (pontuacao >= 8) {
    mensagemResultado.textContent = "Excelente! Você mandou muito bem! 🚀";
} else if (pontuacao >= 5) {
    mensagemResultado.textContent = "Muito bom! Continue praticando! 💪";
} else {
    mensagemResultado.textContent = "Não desanime! A prática leva à evolução! 📚";
}


document.querySelector("#jogarNovamente").addEventListener("click", () => {

    window.location.href = "quiz.html";

});


document.querySelector("#verRanking").addEventListener("click", () => {

    window.location.href = "ranking.html";

});
