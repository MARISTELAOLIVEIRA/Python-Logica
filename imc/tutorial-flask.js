/*
  tutorial-flask.js: mostra os arquivos de um projeto Flask como no VS Code (abas, números de linha e cores),
  com botão para copiar cada arquivo e a prévia do que o navegador mostra.
  versão 1 · 2026-11-16 · veio do tutorial-php.js (prog-web-php), com cores para Python, HTML (e o {{ }}) e CSS

  Uso, dentro de <div class="tutorial-projeto" data-pasta="calculadora-imc">:
    <script type="text/plain" data-arquivo="app.py" data-estado="novo">...código...</script>
    <script type="text/plain" data-previa="Primeira visita">...HTML que o Flask gerou...</script>
  data-estado: "novo", "mudou" ou "igual" (aparece como etiqueta na aba).
*/
(function () {
  "use strict";

  function escapar(texto) {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // cores do tema escuro do VS Code, uma lista de regras por tipo de arquivo: [expressão, classe]
  var REGRAS = {
    py: [
      [/#[^\n]*/, "com"],
      [/f?"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/, "txt"],
      [/@[\w.]+/, "fun"],
      [/\b(?:from|import|def|return|if|elif|else|match|case|try|except|or|and|not|as|in|None|True|False)\b/, "pal"],
      [/\b[A-Za-z_]\w*(?=\()/, "fun"],
      [/\b\d+(?:\.\d+)?\b/, "num"]
    ],
    html: [
      [/<!--[\s\S]*?-->/, "com"],
      [/\{\{[\s\S]*?\}\}/, "jin"],
      [/"[^"\n]*"/, "txt"],
      [/<\/?[A-Za-z][\w-]*|\/?>/, "tag"]
    ],
    css: [
      [/\/\*[\s\S]*?\*\//, "com"],
      [/#[0-9a-fA-F]{3,6}\b/, "num"],
      [/[a-z-]+(?=\s*:)/, "var"],
      [/-?\b\d+(?:\.\d+)?(?:px|rem|em|%)?/, "num"]
    ]
  };

  function colorir(codigo, nome) {
    var tipo = /\.css$/.test(nome) ? "css" : /\.html$/.test(nome) ? "html" : "py";
    var regras = REGRAS[tipo];
    var padrao = new RegExp(regras.map(function (r) { return "(" + r[0].source + ")"; }).join("|"), "g");
    var saida = "";
    var ultimo = 0;
    var achado;
    while ((achado = padrao.exec(codigo)) !== null) {
      if (achado[0] === "") {
        padrao.lastIndex++;
        continue;
      }
      var grupo = 1;
      while (achado[grupo] === undefined) grupo++;
      saida += escapar(codigo.slice(ultimo, achado.index));
      saida += '<span class="tp-' + regras[grupo - 1][1] + '">' + escapar(achado[0]) + "</span>";
      ultimo = padrao.lastIndex;
    }
    return saida + escapar(codigo.slice(ultimo));
  }

  function limpar(texto) {
    return texto.replace(/^\n/, "").replace(/\s+$/, "") + "\n";
  }

  var contador = 0;

  function montar(caixa) {
    contador++;
    var id = "tp" + contador;
    var pasta = caixa.dataset.pasta || "projeto";
    var arquivos = [];
    var previas = [];
    caixa.querySelectorAll("script[type='text/plain']").forEach(function (s) {
      if (s.dataset.arquivo) {
        arquivos.push({ nome: s.dataset.arquivo, estado: s.dataset.estado || "", codigo: limpar(s.textContent) });
      } else if (s.dataset.previa) {
        previas.push({ nome: s.dataset.previa, html: s.textContent });
      }
    });

    var janela = document.createElement("div");
    janela.className = "tp-janela";
    janela.innerHTML =
      '<div class="tp-barra"><span class="semaforo" aria-hidden="true"><i></i><i></i><i></i></span><span class="tp-titulo"></span></div>' +
      '<div class="tp-abas" role="tablist" aria-label="Arquivos de ' + escapar(pasta) + '"></div>' +
      '<div class="tp-arquivos"></div>';
    var abas = janela.querySelector(".tp-abas");
    var paineis = janela.querySelector(".tp-arquivos");
    var titulo = janela.querySelector(".tp-titulo");

    arquivos.forEach(function (arq, n) {
      var aba = document.createElement("button");
      aba.type = "button";
      aba.className = "tp-aba";
      aba.id = id + "-aba-" + n;
      aba.setAttribute("role", "tab");
      aba.setAttribute("aria-controls", id + "-arq-" + n);
      aba.textContent = arq.nome;
      if (arq.estado) {
        var etq = document.createElement("span");
        etq.className = "tp-estado tp-" + arq.estado;
        etq.textContent = arq.estado;
        aba.appendChild(etq);
      }
      abas.appendChild(aba);

      var painel = document.createElement("div");
      painel.className = "tp-arquivo";
      painel.id = id + "-arq-" + n;
      painel.setAttribute("role", "tabpanel");
      painel.setAttribute("aria-labelledby", aba.id);
      var linhas = arq.codigo.replace(/\n$/, "").split("\n");
      var numeros = linhas.map(function (_, k) { return k + 1; }).join("\n");
      painel.innerHTML =
        '<div class="tp-codigo"><pre class="tp-linhas" aria-hidden="true">' + numeros + "</pre>" +
        '<pre class="tp-texto"><code>' + colorir(arq.codigo.replace(/\n$/, ""), arq.nome) + "</code></pre></div>" +
        '<div class="tp-acoes"><button type="button" class="tp-copiar">Copiar ' + escapar(arq.nome) + '</button><span class="tp-aviso" aria-live="polite"></span></div>';
      painel.querySelector(".tp-copiar").addEventListener("click", function () {
        var aviso = painel.querySelector(".tp-aviso");
        function ok() { aviso.textContent = "Copiado! Agora é colar no VS Code."; }
        function falhou() {
          var faixa = document.createRange();
          faixa.selectNodeContents(painel.querySelector(".tp-texto"));
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(faixa);
          aviso.textContent = "Código selecionado: aperte Ctrl + C (ou Cmd + C).";
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(arq.codigo).then(ok, falhou);
        } else {
          falhou();
        }
      });
      paineis.appendChild(painel);
      aba.addEventListener("click", function () { mostrar(n); });
    });

    abas.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var atual = Number(janela.dataset.ativo || 0);
      var proxima = (atual + (e.key === "ArrowRight" ? 1 : arquivos.length - 1)) % arquivos.length;
      mostrar(proxima);
      abas.children[proxima].focus();
    });

    function mostrar(n) {
      janela.dataset.ativo = n;
      arquivos.forEach(function (arq, k) {
        var ativa = k === n;
        abas.children[k].setAttribute("aria-selected", String(ativa));
        abas.children[k].tabIndex = ativa ? 0 : -1;
        paineis.children[k].hidden = !ativa;
      });
      titulo.textContent = arquivos[n].nome + " — " + pasta;
    }
    mostrar(0);
    caixa.appendChild(janela);

    if (previas.length) {
      var area = document.createElement("div");
      area.className = "tp-previa";
      area.innerHTML = '<p class="tp-rotulo">Veja no navegador <small>(o HTML de verdade que o Flask gerou)</small></p><div class="tp-botoes-previa"></div><iframe class="tp-tela" sandbox="allow-same-origin"></iframe>';
      var botoes = area.querySelector(".tp-botoes-previa");
      var tela = area.querySelector(".tp-tela");
      previas.forEach(function (p, k) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = p.nome;
        b.addEventListener("click", function () { mostrarPrevia(k); });
        botoes.appendChild(b);
      });
      function mostrarPrevia(k) {
        previas.forEach(function (_, j) { botoes.children[j].setAttribute("aria-pressed", String(j === k)); });
        tela.title = "Prévia: " + previas[k].nome;
        tela.srcdoc = previas[k].html;
      }
      mostrarPrevia(0);
      caixa.appendChild(area);
    }
  }

  document.querySelectorAll(".tutorial-projeto").forEach(montar);
})();
