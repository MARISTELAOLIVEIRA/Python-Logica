# 🐍💻 PyQuiz — Revisão de Lógica em Python

> _"Wake up, aluno(a)... a prova está chegando."_ 🕶️

Um quiz interativo, estilo **hacker/cyberpunk**, criado para ajudar a turma de **Tecnologia em Segurança da Informação** a revisar os conceitos da primeira avaliação de Lógica de Programação em Python. Sem instalar nada, sem servidor, sem complicação — é só abrir e jogar. 🎮

---

## ✨ O que esse quiz tem de especial?

| Recurso | Descrição |
|---|---|
| 🕵️ **Identificação do agente** | O aluno digita o nome completo antes de liberar a missão |
| 🔀 **Perguntas embaralhadas** | 30 questões e alternativas sorteadas a cada tentativa — ninguém decora gabarito! |
| ⚡ **Feedback instantâneo** | Cada resposta já vem com explicação, na hora |
| 📊 **Barra de progresso gamificada** | Acompanhe o avanço e a sequência de acertos (streak 🔥) em tempo real |
| 🏆 **Resultado divertido** | Emojis, mensagens e confete (sim, confete!) de acordo com o desempenho |
| 🖼️ **Salvar resultado** | Baixe seu resultado final como imagem PNG para guardar ou enviar à professora |
| 🌗 **Modo claro e escuro** | Escuro por padrão (afinal, hackers não gostam de luz), mas dá pra trocar |
| 💊 **Chuva Matrix** | Uma cortina de `0`s e `1`s caindo no plano de fundo, porque por que não? |
| ♿ **Acessível e responsivo** | Funciona bem no celular, no notebook, com teclado ou leitor de tela |

---

## 🎯 Conceitos cobrados nas 30 questões

```
📐 Algoritmo & Fluxograma ............... 3 questões
🔢 Variáveis, Tipos & Operadores ....... 15 questões
⌨️  Entrada & Saída de Dados ............ 12 questões
```

As perguntas variam entre **múltipla escolha**, **certo ou errado** e **complete a lacuna** (também em formato de alternativas) — tudo pensado para simular o clima da prova.

---

## 🚀 Como jogar

Não precisa de instalação, build, `npm install` ou qualquer mágica. É só HTML, CSS e JavaScript puro:

1. Baixe ou clone este repositório.
2. Abra o arquivo [`index.html`](index.html) no navegador (duplo clique já resolve).
3. Digite seu nome completo e clique em **"Iniciar Quiz_"**.
4. Responda, revise, aprenda e divirta-se! 🎉

> 💡 Dica de professora: usar a extensão **Live Server** no VS Code deixa a experiência ainda mais redonda durante o desenvolvimento.

---

## 🌐 Publicando no GitHub Pages

Como o projeto é 100% estático, publicar é rapidinho:

1. Suba este repositório para o GitHub.
2. Vá em **Settings → Pages**.
3. Em **Branch**, selecione `main` (ou `master`) e a pasta `/root`.
4. Salve e aguarde o link ser gerado. Pronto, seu quiz está no ar! 🚀

---

## 🗂️ Estrutura do projeto

```
Logia-python/
├── index.html     # Estrutura das telas (identificação, quiz e resultado)
├── style.css      # Tema cyberpunk, modo claro/escuro, responsividade
├── script.js      # Banco de questões, motor do quiz e efeitos visuais
├── leia.txt       # Especificação original do projeto
└── README.md      # Você está aqui 👋
```

---

## 🛠️ Tecnologias

- **HTML5** semântico e acessível
- **CSS3** (variáveis, grid, animações, `prefers-reduced-motion`)
- **JavaScript** puro (vanilla), sem frameworks ou dependências externas

---

## ➕ Quer adicionar mais perguntas?

O banco de questões vive no início do arquivo [`script.js`](script.js), dentro da constante `QUESTIONS`. Basta seguir o padrão de um dos tipos existentes:

```js
{
  topic: 'variaveis', type: 'mc',
  question: 'Sua pergunta aqui?',
  options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
  correct: 'Alternativa A',
  explanation: 'Explicação curta sobre a resposta certa.'
}
```

Tipos disponíveis: `mc` (múltipla escolha) e `tf` (certo ou errado, com `options: ['Verdadeiro', 'Falso']`).

---

## 👩‍🏫 Autoria

Desenvolvido para fins educacionais por **Profª Maristela**, para a turma do Curso Superior em Tecnologia de Segurança da Informação.

Bons estudos e boa sorte na prova! 🍀🔐
