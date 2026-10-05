'use strict';

/* =========================================================
   PyQuiz — Revisão de Lógica em Python
   Banco de questões, motor do quiz e gamificação
   ========================================================= */

const TOPIC_LABELS = {
  algoritmo: 'Algoritmo & Fluxograma',
  variaveis: 'Variáveis, Tipos & Operadores',
  io: 'Entrada & Saída de Dados'
};

// Banco com as 30 questões exigidas na revisão.
const QUESTIONS = [
  // ---- Algoritmo / fluxograma (3) ----
  {
    topic: 'algoritmo', type: 'mc',
    question: 'O que é um algoritmo?',
    options: [
      'Uma sequência finita e ordenada de passos para resolver um problema',
      'Um tipo de variável usada em Python',
      'Um erro que trava o programa',
      'Um símbolo exclusivo de fluxogramas'
    ],
    correct: 'Uma sequência finita e ordenada de passos para resolver um problema',
    explanation: 'Algoritmo é a descrição lógica e finita dos passos necessários para resolver um problema, antes mesmo de virar código.'
  },
  {
    topic: 'algoritmo', type: 'mc',
    question: 'Em um fluxograma, qual símbolo é usado para representar uma decisão (condição)?',
    options: ['Retângulo', 'Círculo', 'Losango', 'Seta'],
    correct: 'Losango',
    explanation: 'O losango (diamante) representa pontos de decisão, como estruturas "se... então" no fluxograma.'
  },
  {
    topic: 'algoritmo', type: 'tf',
    question: 'Um bom algoritmo pode ter uma quantidade infinita de passos, desde que resolva o problema.',
    options: ['Verdadeiro', 'Falso'],
    correct: 'Falso',
    explanation: 'Um algoritmo precisa ser finito: deve terminar após um número limitado de passos.'
  },

  // ---- Variáveis, tipos e operadores (15) ----
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual símbolo é usado para atribuir um valor a uma variável em Python?',
    options: ['==', '=', ':=', '~'],
    correct: '=',
    explanation: 'O sinal de igual (=) é o operador de atribuição em Python; "==" é usado para comparação.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Complete: no código nome = "Ana", o valor "Ana" é armazenado na variável ____.',
    options: ['nome', 'Ana', 'valor', 'dado'],
    correct: 'nome',
    explanation: 'O identificador à esquerda do sinal de igual é a variável que recebe o valor.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual é o tipo de dado do valor 3.14 em Python?',
    options: ['int', 'float', 'str', 'bool'],
    correct: 'float',
    explanation: 'Números com casas decimais são representados pelo tipo float em Python.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual é o tipo de dado do valor True em Python?',
    options: ['bool', 'int', 'str', 'float'],
    correct: 'bool',
    explanation: 'True e False são valores do tipo booleano (bool), usados em lógica condicional.'
  },
  {
    topic: 'variaveis', type: 'tf',
    question: 'Em Python, a expressão 10 // 3 resulta em 3.33.',
    options: ['Verdadeiro', 'Falso'],
    correct: 'Falso',
    explanation: 'O operador // é a divisão inteira (floor division); 10 // 3 resulta em 3, sem casas decimais.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual operador é usado para verificar se dois valores são iguais em Python?',
    options: ['=', '==', '!=', '<>'],
    correct: '==',
    explanation: 'O operador "==" compara dois valores; o "=" é usado apenas para atribuição.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual o resultado da expressão 5 % 2 em Python?',
    options: ['2', '2.5', '1', '0'],
    correct: '1',
    explanation: 'O operador % retorna o resto da divisão; 5 dividido por 2 tem resto 1.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual função em Python é usada para descobrir o tipo de uma variável?',
    options: ['type()', 'typeof()', 'var()', 'class()'],
    correct: 'type()',
    explanation: 'A função type() retorna o tipo do valor armazenado em uma variável.'
  },
  {
    topic: 'variaveis', type: 'tf',
    question: 'Assim como em C, em Python é obrigatório declarar o tipo da variável antes de usá-la (ex.: int x).',
    options: ['Verdadeiro', 'Falso'],
    correct: 'Falso',
    explanation: 'Python tem tipagem dinâmica: o tipo é definido automaticamente pelo valor atribuído.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'O que o operador lógico "and" representa em Python?',
    options: ['Ou lógico (disjunção)', 'Negação lógica', 'E lógico (conjunção)', 'Comparação de igualdade'],
    correct: 'E lógico (conjunção)',
    explanation: '"and" retorna True somente quando todas as condições envolvidas forem verdadeiras.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual das opções é um nome de variável válido em Python?',
    options: ['2valor', 'valor_2', 'valor-2', 'valor 2'],
    correct: 'valor_2',
    explanation: 'Nomes de variáveis não podem começar com número nem conter espaços ou hífens; o underline (_) é permitido.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Complete: em Python, o operador ** representa a operação de ____.',
    options: ['potência', 'multiplicação', 'divisão', 'módulo'],
    correct: 'potência',
    explanation: 'O operador ** eleva um número a uma potência; por exemplo, 2 ** 3 resulta em 8.'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual é o tipo de dado retornado por type("10")?',
    options: ['int', 'str', 'float', 'bool'],
    correct: 'str',
    explanation: 'Mesmo parecendo um número, "10" está entre aspas, portanto é uma string (str).'
  },
  {
    topic: 'variaveis', type: 'mc',
    question: 'Qual operador relacional representa "diferente de" em Python?',
    options: ['==', '!=', '<>', '<='],
    correct: '!=',
    explanation: 'O operador "!=" verifica se dois valores são diferentes entre si.'
  },
  {
    topic: 'variaveis', type: 'tf',
    question: 'O operador lógico "or" retorna True se pelo menos uma das condições for verdadeira.',
    options: ['Verdadeiro', 'Falso'],
    correct: 'Verdadeiro',
    explanation: '"or" só retorna False quando todas as condições envolvidas forem falsas.'
  },

  // ---- Entrada e saída de dados (12) ----
  {
    topic: 'io', type: 'mc',
    question: 'Qual função é usada para exibir uma mensagem na tela em Python?',
    options: ['print()', 'input()', 'show()', 'display()'],
    correct: 'print()',
    explanation: 'A função print() envia texto e valores para a saída padrão (a tela).'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Qual função é usada para receber dados digitados pelo usuário em Python?',
    options: ['read()', 'input()', 'get()', 'scan()'],
    correct: 'input()',
    explanation: 'input() pausa o programa e aguarda o usuário digitar algo pelo teclado.'
  },
  {
    topic: 'io', type: 'tf',
    question: 'A função input() sempre retorna um valor do tipo string, mesmo que o usuário digite números.',
    options: ['Verdadeiro', 'Falso'],
    correct: 'Verdadeiro',
    explanation: 'Tudo que input() recebe é tratado como texto (str); é preciso converter com int() ou float() se necessário.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Para converter a entrada do usuário em um número inteiro, qual função deve envolver o input()?',
    options: ['int()', 'str()', 'bool()', 'list()'],
    correct: 'int()',
    explanation: 'int(input()) converte o texto digitado em um número inteiro.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Complete: qual comando exibe corretamente a palavra Python na tela?',
    options: ['print("Python")', 'print(Python)', 'echo("Python")', 'print(Python();)'],
    correct: 'print("Python")',
    explanation: 'Strings devem ficar entre aspas dentro do print(); sem aspas, o Python tentaria interpretar Python como uma variável.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'O que o código nome = input("Digite seu nome: ") faz?',
    options: [
      'Exibe a mensagem e armazena o texto digitado na variável nome',
      'Apenas exibe a mensagem, sem guardar nada',
      'Gera um erro de sintaxe',
      'Armazena automaticamente um número inteiro'
    ],
    correct: 'Exibe a mensagem e armazena o texto digitado na variável nome',
    explanation: 'input() exibe o texto entre parênteses como prompt e retorna o que o usuário digitar, guardando na variável.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Qual é a saída do comando print("Idade:", 20)?',
    options: ['Idade: 20', 'Idade:20', 'Erro de sintaxe', '20: Idade'],
    correct: 'Idade: 20',
    explanation: 'O print() insere automaticamente um espaço entre os argumentos separados por vírgula.'
  },
  {
    topic: 'io', type: 'tf',
    question: 'É possível formatar strings com f-strings, como em f"Olá, {nome}".',
    options: ['Verdadeiro', 'Falso'],
    correct: 'Verdadeiro',
    explanation: 'F-strings (f"...") permitem inserir valores de variáveis diretamente dentro do texto.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Se o usuário digitar 25 e usarmos apenas idade = input("Idade: "), qual o tipo de idade?',
    options: ['int', 'str', 'float', 'bool'],
    correct: 'str',
    explanation: 'Sem conversão explícita, input() sempre devolve uma string, mesmo que pareça um número.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Qual comando permite exibir múltiplos valores separados por vírgula na função print()?',
    options: ['print(a; b)', 'print(a, b)', 'print(a & b)', 'print(a . b)'],
    correct: 'print(a, b)',
    explanation: 'print() aceita múltiplos argumentos separados por vírgula, exibindo-os com espaço entre eles.'
  },
  {
    topic: 'io', type: 'mc',
    question: 'Complete: para converter uma string em número decimal usamos a função ____().',
    options: ['float', 'int', 'str', 'bool'],
    correct: 'float',
    explanation: 'float() converte um texto numérico (como "3.5") em um número de ponto flutuante.'
  },
  {
    topic: 'io', type: 'mc',
    question: "Qual será o resultado de idade = int(input()) se o usuário digitar 'abc'?",
    options: ['0', 'Erro (ValueError)', 'None', "'abc'"],
    correct: 'Erro (ValueError)',
    explanation: 'int() não consegue converter texto não numérico, gerando um ValueError.'
  }
];

const TOTAL_QUESTIONS = QUESTIONS.length;

// ---------- Estado ----------
const state = {
  studentName: '',
  questions: [],
  index: 0,
  score: 0,
  correctCount: 0,
  streak: 0,
  maxStreak: 0,
  answered: false
};

// ---------- Referências DOM ----------
const gateScreen = document.getElementById('gate-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const gateForm = document.getElementById('gate-form');
const studentNameInput = document.getElementById('student-name');
const nameError = document.getElementById('name-error');

const playerNameEl = document.getElementById('player-name');
const questionCounterEl = document.getElementById('question-counter');
const scoreDisplayEl = document.getElementById('score-display');
const streakDisplayEl = document.getElementById('streak-display');

const progressTrack = document.querySelector('.progress-track');
const progressFill = document.getElementById('progress-fill');
const topicBadge = document.getElementById('topic-badge');

const questionForm = document.getElementById('question-form');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackMessage = document.getElementById('feedback-message');
const confirmBtn = document.getElementById('confirm-btn');
const nextBtn = document.getElementById('next-btn');

const resultEmoji = document.getElementById('result-emoji');
const resultName = document.getElementById('result-name');
const resultMessage = document.getElementById('result-message');
const resultCorrect = document.getElementById('result-correct');
const resultTotal = document.getElementById('result-total');
const resultPercentage = document.getElementById('result-percentage');
const resultStreak = document.getElementById('result-streak');
const restartBtn = document.getElementById('restart-btn');
const saveBtn = document.getElementById('save-btn');

const themeToggle = document.getElementById('theme-toggle');

// ---------- Utilidades ----------
function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestionSet() {
  return shuffle(QUESTIONS).map((q) => ({ ...q, options: shuffle(q.options) }));
}

function showScreen(screen) {
  [gateScreen, quizScreen, resultsScreen].forEach((s) => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// ---------- Tela de identificação ----------
gateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const rawName = studentNameInput.value.trim();
  const words = rawName.split(/\s+/).filter(Boolean);

  if (words.length < 2 || rawName.length < 3) {
    nameError.textContent = 'Digite seu nome completo (nome e sobrenome) para liberar o quiz.';
    studentNameInput.focus();
    return;
  }

  nameError.textContent = '';
  state.studentName = rawName;
  startQuiz();
});

// ---------- Motor do quiz ----------
function startQuiz() {
  state.questions = buildQuestionSet();
  state.index = 0;
  state.score = 0;
  state.correctCount = 0;
  state.streak = 0;
  state.maxStreak = 0;

  playerNameEl.textContent = state.studentName;
  resultTotal.textContent = TOTAL_QUESTIONS;
  progressTrack.setAttribute('aria-valuenow', '0');

  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  const q = state.questions[state.index];
  const position = state.index + 1;

  questionCounterEl.textContent = `${position} / ${TOTAL_QUESTIONS}`;
  scoreDisplayEl.textContent = state.score;
  streakDisplayEl.textContent = `🔥 ${state.streak}`;
  topicBadge.textContent = TOPIC_LABELS[q.topic] || q.topic;

  const progressPercent = Math.round((state.index / TOTAL_QUESTIONS) * 100);
  progressFill.style.width = `${progressPercent}%`;
  progressTrack.setAttribute('aria-valuenow', String(progressPercent));

  questionText.textContent = q.question;
  optionsContainer.innerHTML = '';
  feedbackMessage.textContent = '';
  feedbackMessage.className = 'feedback-message';

  confirmBtn.classList.remove('hidden');
  confirmBtn.disabled = false;
  nextBtn.classList.add('hidden');

  q.options.forEach((optionText, idx) => {
    const label = document.createElement('label');
    label.className = 'option-label';
    label.setAttribute('for', `option-${idx}`);

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'question-option';
    input.id = `option-${idx}`;
    input.value = optionText;

    const span = document.createElement('span');
    span.textContent = optionText;

    label.appendChild(input);
    label.appendChild(span);
    optionsContainer.appendChild(label);
  });

  const firstInput = optionsContainer.querySelector('input');
  if (firstInput) firstInput.focus();
}

questionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (state.answered) return;

  const q = state.questions[state.index];

  const checked = optionsContainer.querySelector('input:checked');
  if (!checked) {
    feedbackMessage.textContent = 'Selecione uma alternativa antes de confirmar.';
    feedbackMessage.className = 'feedback-message incorrect';
    return;
  }
  const isCorrect = checked.value === q.correct;

  // Realça visualmente a alternativa correta e a escolhida.
  optionsContainer.querySelectorAll('.option-label').forEach((label) => {
    const input = label.querySelector('input');
    input.disabled = true;
    if (input.value === q.correct) {
      label.classList.add('is-correct');
    } else if (input.checked) {
      label.classList.add('is-incorrect');
    }
  });

  state.answered = true;

  if (isCorrect) {
    state.score += 10;
    state.correctCount += 1;
    state.streak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    feedbackMessage.textContent = `✅ Correto! ${q.explanation}`;
    feedbackMessage.className = 'feedback-message correct';
  } else {
    state.streak = 0;
    feedbackMessage.textContent = `❌ Quase! A resposta certa é "${q.correct}". ${q.explanation}`;
    feedbackMessage.className = 'feedback-message incorrect';
  }

  scoreDisplayEl.textContent = state.score;
  streakDisplayEl.textContent = `🔥 ${state.streak}`;

  const progressPercent = Math.round(((state.index + 1) / TOTAL_QUESTIONS) * 100);
  progressFill.style.width = `${progressPercent}%`;
  progressTrack.setAttribute('aria-valuenow', String(progressPercent));

  confirmBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');
  nextBtn.textContent = state.index + 1 >= TOTAL_QUESTIONS ? 'Ver Resultado >>' : 'Próxima >>';
  nextBtn.focus();
});

nextBtn.addEventListener('click', () => {
  state.index += 1;
  if (state.index >= TOTAL_QUESTIONS) {
    showResults();
  } else {
    renderQuestion();
  }
});

// ---------- Resultados ----------
function showResults() {
  const percentage = Math.round((state.correctCount / TOTAL_QUESTIONS) * 100);

  resultName.textContent = state.studentName;
  resultCorrect.textContent = state.correctCount;
  resultPercentage.textContent = `${percentage}%`;
  resultStreak.textContent = state.maxStreak;

  let emoji;
  let message;

  if (percentage >= 90) {
    emoji = '🏆';
    message = 'Mestre Hacker! Você dominou a lógica em Python! 👑';
  } else if (percentage >= 70) {
    emoji = '💻';
    message = 'Muito bem! Você está pronto(a) para a prova, só revise alguns pontos.';
  } else if (percentage >= 50) {
    emoji = '🔧';
    message = 'Quase lá! Revise os conceitos antes da avaliação.';
  } else {
    emoji = '📚';
    message = 'Bora estudar mais um pouco! Releia o material e tente novamente.';
  }

  resultEmoji.textContent = emoji;
  resultMessage.textContent = message;

  showScreen(resultsScreen);

  if (percentage >= 90) {
    celebrate();
  }
}

function celebrate() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const emojis = ['🎉', '✨', '💾', '⚡', '🐍'];
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';

  for (let i = 0; i < 18; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    layer.appendChild(piece);
  }

  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4500);
}

restartBtn.addEventListener('click', () => {
  startQuiz();
});

saveBtn.addEventListener('click', () => {
  saveResultAsImage();
});

// Desenha o card de resultado em um canvas e baixa como PNG.
function saveResultAsImage() {
  const width = 900;
  const height = 520;
  const scale = 2; // resolução maior para a imagem ficar nítida

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const styles = getComputedStyle(document.documentElement);
  const colorSurface = styles.getPropertyValue('--surface').trim() || '#0c1118';
  const colorGreen = styles.getPropertyValue('--neon-green').trim() || '#39ff14';
  const colorOrange = styles.getPropertyValue('--neon-orange').trim() || '#ff8c1a';
  const colorText = styles.getPropertyValue('--text').trim() || '#d8fbe9';
  const colorDim = styles.getPropertyValue('--text-dim').trim() || '#8fa89c';

  ctx.fillStyle = colorSurface;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = colorGreen;
  ctx.lineWidth = 4;
  ctx.shadowColor = colorGreen;
  ctx.shadowBlur = 20;
  ctx.strokeRect(12, 12, width - 24, height - 24);
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';

  ctx.fillStyle = colorOrange;
  ctx.font = 'bold 26px "Share Tech Mono", monospace';
  ctx.fillText('<PyQuiz/> — Resultado da Revisão', width / 2, 70);

  ctx.font = '80px sans-serif';
  ctx.fillText(resultEmoji.textContent, width / 2, 175);

  ctx.fillStyle = colorGreen;
  ctx.font = 'bold 28px "Share Tech Mono", monospace';
  ctx.fillText(state.studentName || 'Aluno(a)', width / 2, 225);

  ctx.fillStyle = colorText;
  ctx.font = '20px "Share Tech Mono", monospace';
  drawWrappedText(ctx, resultMessage.textContent, width / 2, 265, width - 140, 28);

  ctx.font = '22px "Share Tech Mono", monospace';
  const statsY = 360;
  ctx.fillText(`Acertos: ${resultCorrect.textContent} / ${resultTotal.textContent}`, width / 2, statsY);
  ctx.fillText(`Aproveitamento: ${resultPercentage.textContent}`, width / 2, statsY + 34);
  ctx.fillText(`Maior sequência: ${resultStreak.textContent} 🔥`, width / 2, statsY + 68);

  ctx.fillStyle = colorDim;
  ctx.font = '16px "Share Tech Mono", monospace';
  ctx.fillText('Profª Maristela — Tecnologia em Segurança da Informação', width / 2, height - 30);

  const safeName = (state.studentName || 'aluno')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'aluno';

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `pyquiz-resultado-${safeName}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Quebra o texto em múltiplas linhas para caber na largura máxima do canvas.
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  words.forEach((word, idx) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
    if (idx === words.length - 1) {
      ctx.fillText(line, x, currentY);
    }
  });
}

// ---------- Efeito Matrix (chuva de 0 e 1) no plano de fundo ----------
const matrixCanvas = document.getElementById('matrix-rain');
const matrixCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
const MATRIX_FONT_SIZE = 16;
let matrixDrops = [];
let matrixBgColor = '#04060a';
let matrixGreenColor = '#39ff14';

function hexToRgba(hex, alpha) {
  let clean = hex.trim().replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateMatrixColors() {
  const styles = getComputedStyle(document.documentElement);
  matrixBgColor = styles.getPropertyValue('--bg').trim() || matrixBgColor;
  matrixGreenColor = styles.getPropertyValue('--neon-green').trim() || matrixGreenColor;
}

function resizeMatrixCanvas() {
  if (!matrixCanvas) return;
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const columns = Math.floor(matrixCanvas.width / MATRIX_FONT_SIZE);
  matrixDrops = new Array(columns).fill(1);
}

function drawMatrixFrame() {
  matrixCtx.fillStyle = hexToRgba(matrixBgColor, 0.08);
  matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

  matrixCtx.fillStyle = matrixGreenColor;
  matrixCtx.font = `${MATRIX_FONT_SIZE}px monospace`;

  matrixDrops.forEach((y, i) => {
    const char = Math.random() > 0.5 ? '1' : '0';
    const x = i * MATRIX_FONT_SIZE;
    matrixCtx.fillText(char, x, y * MATRIX_FONT_SIZE);

    if (y * MATRIX_FONT_SIZE > matrixCanvas.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i] += 1;
  });

  requestAnimationFrame(drawMatrixFrame);
}

function startMatrixEffect() {
  if (!matrixCanvas || !matrixCtx) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  resizeMatrixCanvas();
  updateMatrixColors();
  window.addEventListener('resize', resizeMatrixCanvas);
  requestAnimationFrame(drawMatrixFrame);
}

// ---------- Tema claro/escuro ----------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  themeToggle.setAttribute('aria-label', theme === 'light' ? 'Alternar para modo escuro' : 'Alternar para modo claro');
  localStorage.setItem('pyquiz-theme', theme);
  updateMatrixColors();
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'light' ? 'dark' : 'light');
});

(function initTheme() {
  const saved = localStorage.getItem('pyquiz-theme');
  applyTheme(saved === 'light' ? 'light' : 'dark');
})();

startMatrixEffect();
