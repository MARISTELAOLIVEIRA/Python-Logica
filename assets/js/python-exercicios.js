/*
  python-exercicios.js: exercícios de Python que rodam e se corrigem no próprio site.
  versão 1 · 2026-10-05

  Cada exercício é um <article class="exercicio" data-id="..."> com:
    - um <textarea class="editor"> com o código inicial
    - um <textarea class="entradas"> para o aluno testar com as entradas que quiser (uma por linha)
    - botões .executar e .verificar e uma área .resultado
  Os testes de cada exercício ficam em window.TESTES (arquivo exercicios.js da atividade).

  O código e os exercícios concluídos ficam salvos no navegador do aluno.
*/
(function () {

  const CHAVE = "pyatividade:" + location.pathname;
  const LIMITE_MS = 4000;   // tempo máximo de execução (laço infinito não trava a página)

  // ---------- armazenamento no navegador ----------

  function ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || { codigos: {}, concluidos: [] };
    } catch (erro) {
      return { codigos: {}, concluidos: [] };
    }
  }

  function gravar(dados) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch (erro) {
      // sem armazenamento: tudo funciona, só não fica salvo
    }
  }

  const estado = ler();


  // ---------- o trabalhador que roda o Python ----------

  const aviso = document.getElementById("status-python");
  let trabalhador = null;
  let pronto = false;
  let proximoId = 1;
  const esperando = {};

  function mostraStatus(texto, classe) {
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.className = "status-python " + (classe || "");
  }

  function criaTrabalhador() {
    pronto = false;
    mostraStatus("Soldando os componentes... (carregando o Python, leva alguns segundos)", "carregando");
    trabalhador = new Worker(SCRIPT_WORKER);
    trabalhador.onmessage = function (evento) {
      const msg = evento.data;
      if (msg.tipo === "pronto") {
        pronto = true;
        mostraStatus("Python pronto! Pode executar e verificar.", "pronto");
        return;
      }
      const promessa = esperando[msg.id];
      if (promessa) {
        clearTimeout(promessa.relogio);
        delete esperando[msg.id];
        promessa.resolve({ saida: msg.saida, erro: msg.erro });
      }
    };
    trabalhador.onerror = function () {
      mostraStatus("Não foi possível carregar o Python. Confira a internet e recarregue a página.", "erro");
    };
  }

  // caminho do worker: ao lado deste arquivo
  const SCRIPT_WORKER = (function () {
    const atual = document.querySelector('script[src$="python-exercicios.js"]');
    return atual.src.replace("python-exercicios.js", "python-worker.js");
  })();

  function rodar(codigo, entradas) {
    return new Promise(function (resolve) {
      const id = proximoId++;
      const relogio = setTimeout(function () {
        // demorou demais: encerra o trabalhador e cria outro
        delete esperando[id];
        trabalhador.terminate();
        criaTrabalhador();
        resolve({ saida: "", erro: "O código demorou demais para terminar. Será que tem um laço que nunca acaba?" });
      }, pronto ? LIMITE_MS : LIMITE_MS + 30000);
      esperando[id] = { resolve: resolve, relogio: relogio };
      trabalhador.postMessage({ id: id, codigo: codigo, entradas: entradas });
    });
  }


  // ---------- comparação da saída ----------

  // compara sem diferenciar maiúsculas, acentos e espaços sobrando
  function normaliza(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split("\n")
      .map(function (linha) { return linha.trim().replace(/\s+/g, " "); })
      .filter(function (linha) { return linha !== ""; })
      .join("\n");
  }


  // ---------- cada exercício ----------

  function escapa(texto) {
    return texto.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function ligaExercicio(cartao) {
    const id = cartao.dataset.id;
    const editor = cartao.querySelector(".editor");
    const entradas = cartao.querySelector(".entradas");
    const resultado = cartao.querySelector(".resultado");
    const testes = (window.TESTES || {})[id] || [];

    // código salvo antes
    if (estado.codigos[id]) {
      editor.value = estado.codigos[id];
    }
    if (estado.concluidos.indexOf(id) !== -1) {
      cartao.classList.add("concluido");
    }

    editor.addEventListener("input", function () {
      estado.codigos[id] = editor.value;
      gravar(estado);
    });

    // Tab insere 4 espaços em vez de sair do editor (Esc e depois Tab saem, para quem usa teclado)
    let escapou = false;
    editor.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") {
        escapou = true;
        return;
      }
      if (evento.key === "Tab" && !evento.shiftKey && !escapou) {
        evento.preventDefault();
        const inicio = editor.selectionStart;
        editor.setRangeText("    ", inicio, editor.selectionEnd, "end");
        editor.dispatchEvent(new Event("input"));
      }
      escapou = false;
    });

    cartao.querySelector(".executar").addEventListener("click", async function () {
      resultado.innerHTML = '<p class="rodando">Executando...</p>';
      const linhas = entradas.value.split("\n").filter(function (l) { return l !== ""; });
      const r = await rodar(editor.value, linhas);
      let html = "<h4>Saída</h4><pre>" + (escapa(r.saida) || "(nada foi mostrado com print)") + "</pre>";
      if (r.erro) {
        html += '<p class="falhou">' + escapa(r.erro).replace(/\n/g, "<br>") + "</p>";
      }
      resultado.innerHTML = html;
    });

    cartao.querySelector(".verificar").addEventListener("click", async function () {
      resultado.innerHTML = '<p class="rodando">Testando com ' + testes.length + " entradas diferentes...</p>";
      const linhas = [];
      let acertos = 0;
      for (const teste of testes) {
        const r = await rodar(editor.value, teste.entradas);
        const ok = !r.erro && normaliza(r.saida) === normaliza(teste.saida);
        if (ok) acertos++;
        linhas.push(
          '<li class="' + (ok ? "ok" : "erro") + '">' +
          "<strong>" + (ok ? "✓" : "✗") + "</strong> " +
          "entrada <code>" + escapa(teste.entradas.join(" / ")) + "</code>: " +
          "esperado <code>" + escapa(teste.saida) + "</code>" +
          (ok ? "" : ", veio <code>" + escapa(r.erro ? "erro" : (r.saida.trim() || "nada")) + "</code>") +
          (r.erro && !ok ? '<br><span class="falhou">' + escapa(r.erro).replace(/\n/g, "<br>") + "</span>" : "") +
          "</li>"
        );
      }
      const passou = acertos === testes.length;
      const titulo = passou
        ? '<p class="passou">Compilou de primeira! Todos os ' + testes.length + " testes passaram.</p>"
        : '<p class="falhou">Curto-circuito. ' + acertos + " de " + testes.length + " testes passaram. Confere a trilha e tenta de novo.</p>";
      resultado.innerHTML = titulo + '<ul class="testes">' + linhas.join("") + "</ul>";

      const posicao = estado.concluidos.indexOf(id);
      if (passou && posicao === -1) estado.concluidos.push(id);
      if (!passou && posicao !== -1) estado.concluidos.splice(posicao, 1);
      cartao.classList.toggle("concluido", passou);
      gravar(estado);
      atualizaProgresso();
    });
  }


  // ---------- progresso e comprovante ----------

  const cartoes = Array.from(document.querySelectorAll(".exercicio[data-id]"));

  function atualizaProgresso() {
    const feitos = cartoes.filter(function (c) { return c.classList.contains("concluido"); }).length;
    document.querySelectorAll(".progresso-exercicios").forEach(function (barra) {
      barra.querySelector(".contagem").textContent = feitos + " de " + cartoes.length;
      barra.querySelector(".barra-progresso span").style.width = (feitos / cartoes.length * 100) + "%";
    });
  }

  // código simples para conferência (não é criptografia: só dificulta inventar o comprovante)
  function codigo(texto) {
    let h = 5381;
    for (let i = 0; i < texto.length; i++) {
      h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
    }
    const s = h.toString(36).toUpperCase().padStart(7, "0");
    return s.slice(0, 4) + "-" + s.slice(4);
  }

  const botaoComprovante = document.getElementById("gerar-comprovante");
  if (botaoComprovante) {
    botaoComprovante.addEventListener("click", function () {
      const nome = document.getElementById("nome-aluno").value.trim();
      const caixa = document.getElementById("comprovante");
      if (nome.split(" ").length < 2) {
        caixa.hidden = false;
        caixa.textContent = "Digite o seu nome completo para gerar o comprovante.";
        return;
      }
      const feitos = cartoes
        .filter(function (c) { return c.classList.contains("concluido"); })
        .map(function (c) { return c.dataset.numero; });
      const agora = new Date();
      const quando = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const texto =
        document.title.split(" · ")[0] + "\n" +
        "Aluno(a): " + nome + "\n" +
        "Exercícios concluídos: " + feitos.length + " de " + cartoes.length +
        (feitos.length ? " (" + feitos.join(", ") + ")" : "") + "\n" +
        "Gerado em: " + quando + "\n" +
        "Código de conferência: " + codigo(nome.toLowerCase() + "|" + feitos.join(",") + "|" + agora.toLocaleDateString("pt-BR"));
      caixa.hidden = false;
      caixa.textContent = texto;
      const copiar = document.getElementById("copiar-comprovante");
      copiar.hidden = false;
      copiar.onclick = function () {
        navigator.clipboard.writeText(texto).then(function () {
          copiar.textContent = "Copiado!";
          setTimeout(function () { copiar.textContent = "Copiar comprovante"; }, 2000);
        });
      };
    });
  }

  cartoes.forEach(ligaExercicio);
  atualizaProgresso();
  criaTrabalhador();

})();
