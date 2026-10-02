const parametros = new URLSearchParams(window.location.search);

const nomeJogador = parametros.get("nomeJogador");

if (nomeJogador) {
    localStorage.setItem("nomeJogador", nomeJogador);
}

const perguntas = [
    {
        pergunta: "Qual estrutura é utilizada para executar um bloco de código somente quando uma condição é verdadeira?",
        alternativas: ["for", "if", "print", "while"],
        resposta: 1
    },
    {
        pergunta: "O que é um algoritmo?",
        alternativas: [
            "Um tipo de computador usado para programar",
            "Uma sequência de passos para solucionar um problema",
            "Um erro encontrado em um programa",
            "Uma linguagem de programação"
        ],
        resposta: 1
    },
    {
        pergunta: "Observe: idade = 20; if idade >= 18: print('Maior de idade'). O que será exibido?",
        alternativas: [
            "Menor de idade",
            "18",
            "Maior de idade",
            "Nada"
        ],
        resposta: 2
    },
    {
        pergunta: "No código 'if idade >= 18' qual é o erro de sintaxe?",
        alternativas: [
            "A variável idade está errada",
            "Falta : após a condição do if",
            "O número 18 deveria ser 20",
            "O print deveria vir antes do if"
        ],
        resposta: 1
    },
    {
        pergunta: "Um programa deveria somar dois números, mas possui 'resultado = a - b'. O que deve ser feito?",
        alternativas: [
            "Trocar - por +",
            "Trocar a por b",
            "Remover o print",
            "Trocar resultado por a"
        ],
        resposta: 0
    },
    {
        pergunta: "Qual estrutura pode ser utilizada para repetir um bloco de código enquanto uma condição for verdadeira?",
        alternativas: [
            "if",
            "else",
            "while",
            "input"
        ],
        resposta: 2
    },
    {
        pergunta: "Qual sequência representa melhor um algoritmo para calcular a média de duas notas?",
        alternativas: [
            "Exibir → calcular → receber notas",
            "Receber notas → calcular média → exibir resultado",
            "Calcular média → receber notas → finalizar",
            "Exibir resultado → finalizar → receber notas"
        ],
        resposta: 1
    },
    {
        pergunta: "No código 'print(nome' qual é o problema?",
        alternativas: [
            "A variável deveria se chamar aluno",
            "Faltou fechar o parêntese do print",
            "O texto deveria estar sem aspas",
            "O print não pode receber variáveis"
        ],
        resposta: 1
    },
    {
        pergunta: "Um programa verifica se uma pessoa é maior de idade usando 'if idade < 18: print(\"Maior de idade\")'. Qual é o erro?",
        alternativas: [
            "O print está errado",
            "A variável deveria ser idade = 18",
            "A condição está invertida",
            "O else deve ser removido"
        ],
        resposta: 2
    },
    {
        pergunta: "Qual será o resultado? numero = 10; if numero > 5: print('A') else: print('B')",
        alternativas: [
            "A",
            "B",
            "10",
            "Nada"
        ],
        resposta: 0
    }
];

let perguntaAtual = 0;
let pontuacao = 0;
let respostaSelecionada = false;


// Elementos da página
const tituloPergunta = document.querySelector(".pergunta h1");
const textoPergunta = document.querySelector(".pergunta p");
const contador = document.querySelector(".contador");
const alternativas = document.querySelectorAll(".alternativa");
const botaoProxima = document.querySelector(".proxima");


// Carrega a pergunta
function carregarPergunta() {

    const pergunta = perguntas[perguntaAtual];

    contador.textContent = `${perguntaAtual + 1}/${perguntas.length}`;

    tituloPergunta.textContent = `Pergunta ${perguntaAtual + 1}`;

    textoPergunta.textContent = pergunta.pergunta;

    alternativas.forEach((botao, indice) => {
        botao.textContent = pergunta.alternativas[indice];

        botao.disabled = false;

        botao.classList.remove("correta");
        botao.classList.remove("errada");
    });

    respostaSelecionada = false;

    botaoProxima.disabled = true;
}


// Seleciona uma alternativa
alternativas.forEach((botao, indice) => {

    botao.addEventListener("click", () => {

        if (respostaSelecionada) {
            return;
        }

        respostaSelecionada = true;

        const pergunta = perguntas[perguntaAtual];

        if (indice === pergunta.resposta) {

            botao.classList.add("correta");
            pontuacao++;

        } else {

            botao.classList.add("errada");

            alternativas[pergunta.resposta].classList.add("correta");
        }

        alternativas.forEach(botao => {
            botao.disabled = true;
        });

        botaoProxima.disabled = false;
    });

});


// Próxima pergunta
botaoProxima.addEventListener("click", () => {

    perguntaAtual++;

    if (perguntaAtual < perguntas.length) {

        carregarPergunta();

    } else {
        localStorage.setItem("pontuacao", pontuacao);
        localStorage.setItem("totalPerguntas", perguntas.length);

        window.location.href = "resultado.html";
    }

});


// Inicia o quiz
carregarPergunta();
