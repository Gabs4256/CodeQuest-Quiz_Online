const pontos = Number(localStorage.getItem("pontuacao")) || 0;
const total = Number(localStorage.getItem("totalPerguntas")) || 10;
const nome = localStorage.getItem("nomeJogador") || "Jogador";


let emoji;
let mensagem;

if (pontos >= 9) {
    emoji = "🏆";
    mensagem = "Incrível! Você domina a lógica de programação!";
} else if (pontos >= 7) {
    emoji = "🎉";
    mensagem = "Muito bem! Você está no caminho certo!";
} else if (pontos >= 5) {
    emoji = "👏";
    mensagem = "Bom trabalho! Mais um pouco de prática e você chega lá.";
} else {
    emoji = "📚";
    mensagem = "Não desanime! A prática leva à evolução!";
}


document.getElementById("emoji").textContent = emoji;
document.getElementById("nome").textContent = `Parabéns, ${nome}!`;
document.getElementById("pontos").textContent = pontos;
document.getElementById("total").textContent = total;
document.getElementById("mensagem").textContent = mensagem;