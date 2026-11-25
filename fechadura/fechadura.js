/*
  fechadura.js: o simulador da fechadura eletrônica (desafio final de Lógica com Python).
  versão 3 · 2026-11-22 · manual do fabricante (caixa com a explicação do conceito, quando a missão tem)

  O simulador é o hardware; o aluno escreve o "programa da placa".
  A cada ação (OK, mensagem do app, crachá, relógio), o simulador chama a função do aluno no
  fechadura-worker.js e obedece ao que ela devolve. O Red Team roda os testes de missoes.js;
  a entrega soma o melhor resultado de cada missão e vai para o Placa-Mãe pelo CONTA.registrarTentativa.
  Modo demonstração: fechadura/?demo (sem login, nada é registrado).
*/
(function () {
  "use strict";

  var DEMO = new URLSearchParams(location.search).has("demo");
  var ATIVIDADE = "fechadura-eletronica";
  var TEMPO_LIMITE = 4000;
  // as salas que cada perfil abre (missão 4)
  var SALAS = {
    visitante: ["recepcao"],
    funcionario: ["recepcao", "escritorio"],
    ti: ["recepcao", "escritorio", "servidores"],
    diretoria: ["recepcao", "escritorio", "diretoria"]
  };

  // no modo demonstração a área da missão não pede login (precisa rodar antes do conta.js)
  if (DEMO) {
    document.querySelectorAll("[data-exige-login]").forEach(function (area) { area.removeAttribute("data-exige-login"); });
  }

  var $ = function (id) { return document.getElementById(id); };
  var raiz = document.documentElement;
  var missao = window.MISSOES[0];
  var email = "";
  var segredo = null;
  var gravados = {};
  var digitado = "";
  var erros = 0;
  var travado = false;
  var somLigado = true;
  var melhor = {};

  /* ---------- guardar no navegador (pode falhar em aba anônima: tudo continua funcionando) ---------- */
  function ler(chave) {
    try { return localStorage.getItem("fechadura:" + email + ":" + chave); } catch (e) { return null; }
  }
  function gravar(chave, valor) {
    try { localStorage.setItem("fechadura:" + email + ":" + chave, valor); } catch (e) { /* sem espaço: segue */ }
  }

  /* ---------- o segredo de cada aluno, sorteado pelo e-mail ---------- */
  function sortear(texto) {
    var h = 5381;
    for (var i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
    return h;
  }
  var PROIBIDAS = ["0000", "1234", "2580", "1111", "4321", "1212"];
  function senhaDe(semente) {
    var n = 1000 + (semente % 9000);
    var s = String(n);
    while (PROIBIDAS.indexOf(s) >= 0 || /^(\d)\1+$/.test(s)) {
      n = 1000 + ((n + 1379) % 9000);
      s = String(n);
    }
    return s;
  }
  function crachasDe(semente) {
    // 4 números de 3 dígitos, diferentes entre si (e nunca 999, o crachá clonado do Red Team)
    var usados = [];
    var n = semente;
    ["visitante", "funcionario", "ti", "diretoria"].forEach(function () {
      var c;
      do {
        n = (n * 1103515245 + 12345) >>> 0;
        c = 100 + (n % 899);
      } while (usados.indexOf(c) >= 0);
      usados.push(c);
    });
    return { visitante: usados[0], funcionario: usados[1], ti: usados[2], diretoria: usados[3] };
  }
  function prepararAluno(endereco) {
    email = (endereco || "demo@edu.df.senac.br").toLowerCase();
    var semente = sortear(email);
    var senha = senhaDe(semente);
    var outra = senhaDe(semente * 7 + 13);
    if (outra === senha) outra = senhaDe(semente + 4242);
    segredo = {
      senha: senha,
      outra: outra,
      limite: 3 + (semente % 3),
      crachas: crachasDe(semente),
      inicio: 7 + (semente % 2),
      fim: 18 + ((semente >>> 3) % 3)
    };
    try { melhor = JSON.parse(ler("melhor") || "{}"); } catch (e) { melhor = {}; }
    gravados = {};
    montarAbas();
    var ultima = Number(ler("missao") || 0);
    abrirMissao(window.MISSOES[ultima] ? ultima : 0);
    atualizarResumo();
  }

  /* ---------- o Python, num trabalhador separado ---------- */
  var trabalhador = null;
  var pendentes = {};
  var proximoId = 1;
  var pythonPronto = false;
  var status = $("status-python");

  function criarTrabalhador() {
    trabalhador = new Worker("fechadura-worker.js?v=1");
    trabalhador.onmessage = function (e) {
      if (e.data.tipo === "pronto") {
        pythonPronto = true;
        status.textContent = "Python pronto! A fechadura está ligada.";
        status.className = "status-python pronto";
        return;
      }
      var pedido = pendentes[e.data.id];
      if (!pedido) return;
      clearTimeout(pedido.relogio);
      delete pendentes[e.data.id];
      pedido.resolver(e.data.dados);
    };
    trabalhador.onerror = function () {
      status.textContent = "Não deu para carregar o Python. Confira a internet e recarregue a página.";
      status.className = "status-python erro";
    };
  }

  function chamar(codigo, funcao, chamadas) {
    return new Promise(function (resolver) {
      var id = proximoId++;
      var relogio = setTimeout(function () {
        // travou (laço infinito?): desliga o trabalhador e liga outro
        delete pendentes[id];
        pythonPronto = false;
        trabalhador.terminate();
        status.textContent = "Reiniciando o Python...";
        status.className = "status-python carregando";
        criarTrabalhador();
        resolver({ erro: "A placa travou: o código demorou demais para responder. Tem algum laço que nunca termina?" });
      }, pythonPronto ? TEMPO_LIMITE : 40000); // enquanto o Python carrega, espera mais
      pendentes[id] = { resolver: resolver, relogio: relogio };
      trabalhador.postMessage({ id: id, codigo: codigo, funcao: funcao, chamadas: chamadas });
    });
  }

  /* ---------- som (Web Audio), sempre com o botão para desligar ---------- */
  var audio = null;
  function bipe(freq, ms, tipo, atraso) {
    if (!somLigado) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var osc = audio.createOscillator();
      var vol = audio.createGain();
      var comeco = audio.currentTime + (atraso || 0) / 1000;
      osc.type = tipo || "square";
      osc.frequency.value = freq;
      vol.gain.value = 0.04;
      osc.connect(vol);
      vol.connect(audio.destination);
      osc.start(comeco);
      osc.stop(comeco + ms / 1000);
    } catch (e) { /* sem som: segue */ }
  }
  function sirene() {
    for (var i = 0; i < 6; i++) bipe(i % 2 ? 620 : 880, 220, "sawtooth", i * 240);
  }

  /* ---------- peças do hardware ---------- */
  function lcd(linha1, linha2) {
    var tela = $("fe-lcd");
    tela.children[0].textContent = linha1;
    tela.children[1].textContent = linha2 || "";
  }
  function acender(cor) {
    ["verde", "amarelo", "vermelho"].forEach(function (c) { $("fe-led-" + c).classList.toggle("aceso", c === cor); });
  }
  function mostrarChip() {
    var gravado = gravados[missao.id];
    $("fe-chip-funcao").textContent = gravado ? missao.funcao + "()" : "vazia";
    $("fe-placa").classList.toggle("gravada", Boolean(gravado));
  }
  function pulsar() {
    var placa = $("fe-placa");
    placa.classList.remove("pulso");
    void placa.offsetWidth;
    placa.classList.add("pulso");
  }
  function abrirPorta() {
    var porta = $("fe-porta");
    porta.classList.add("aberta");
    $("fe-trava").textContent = "🔓";
    setTimeout(function () {
      porta.classList.remove("aberta");
      $("fe-trava").textContent = "🔒";
    }, 2600);
  }
  function acenderSalas(lista) {
    document.querySelectorAll(".fe-salas [data-sala]").forEach(function (sala) {
      sala.classList.toggle("aberta", lista.indexOf(sala.dataset.sala) >= 0);
    });
  }
  function registrar(texto, tipo) {
    var item = document.createElement("li");
    item.className = tipo || "";
    item.textContent = new Date().toLocaleTimeString("pt-BR") + " · " + texto;
    var log = $("fe-log");
    log.prepend(item);
    while (log.children.length > 8) log.lastChild.remove();
  }
  function consoleDaPlaca(texto, erro) {
    var c = $("fe-console");
    c.textContent = texto;
    c.classList.toggle("erro", Boolean(erro));
  }
  function desligarSirene() {
    travado = false;
    $("fe-caixa").classList.remove("sirene");
    $("fe-destravar").hidden = true;
  }

  /* ---------- explica uma resposta que a fechadura não entende ---------- */
  function lista(respostas) {
    return respostas.map(function (x) { return "\"" + x + "\""; }).join(", ");
  }
  function explicar(r) {
    if (r.erro) return r.erro;
    if (r.tipo === "NoneType") return "A função não devolveu nada (None). Faltou o return? O print() só mostra no console, não responde à fechadura.";
    if (r.tipo !== "str") return "A fechadura esperava um texto (" + lista(missao.respostas) + ") e recebeu " + r.tipo + ": " + r.valor + ".";
    return "A fechadura só entende " + lista(missao.respostas) + ", e recebeu \"" + r.valor + "\". Confira as letras, igualzinho, sem acento.";
  }
  function saidaDoPrint(r) {
    return r && r.saida ? "\nprint() da placa:\n" + r.saida : "";
  }
  function entende(r) {
    return !r.erro && r.tipo === "str" && missao.respostas.indexOf(r.valor) >= 0;
  }

  /* ---------- trocar de missão ---------- */
  function montarAbas() {
    var abas = $("fe-abas");
    abas.innerHTML = "";
    window.MISSOES.forEach(function (m, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.dataset.indice = i;
      b.innerHTML = "<span>M" + m.numero + "</span><strong></strong><small></small>";
      b.querySelector("strong").textContent = m.titulo;
      b.addEventListener("click", function () { abrirMissao(i); });
      abas.appendChild(b);
    });
    marcarAbas();
  }
  function marcarAbas() {
    document.querySelectorAll("#fe-abas [role=tab]").forEach(function (b) {
      var m = window.MISSOES[Number(b.dataset.indice)];
      var ativa = m === missao;
      var placar = melhor[m.id];
      b.setAttribute("aria-selected", String(ativa));
      b.tabIndex = ativa ? 0 : -1;
      b.querySelector("small").textContent = placar ? placar.acertos + "/" + placar.total : "—";
      b.classList.toggle("completa", Boolean(placar && placar.acertos === placar.total));
    });
  }
  function abrirMissao(i) {
    // guarda o código da missão que estava aberta antes de trocar
    if (segredo && $("fe-editor").dataset.missao) gravar($("fe-editor").dataset.missao + ":codigo", $("fe-editor").value);
    missao = window.MISSOES[i];
    gravar("missao", String(i));
    $("fe-olho").textContent = "M" + missao.numero + " · missão " + missao.numero + " de " + window.MISSOES.length;
    $("fe-titulo").textContent = missao.titulo;
    $("fe-enunciado").innerHTML = missao.enunciado(segredo);
    $("fe-bilhete").innerHTML = missao.bilhete(segredo);
    // manual do fabricante: só nas missões que têm (try/except e match/case)
    $("fe-manual").hidden = !missao.manual;
    $("fe-manual-corpo").innerHTML = missao.manual || "";
    var salvo = ler(missao.id + ":codigo");
    $("fe-editor").value = salvo !== null ? salvo : missao.inicial;
    $("fe-editor").dataset.missao = missao.id;
    $("fe-hardware").dataset.modo = missao.modo;
    $("fe-rt-titulo").textContent = "Hora do ataque: missão " + missao.numero;
    $("fe-placar").hidden = true;
    digitado = "";
    erros = 0;
    desligarSirene();
    acender(null);
    acenderSalas([]);
    mostrarChip();
    if (gravados[missao.id]) lcd(prontoLcd(), "");
    else lcd("PLACA VAZIA", "GRAVE O CODIGO");
    consoleDaPlaca(gravados[missao.id] ? "Programa da missão " + missao.numero + " gravado." : "A placa está vazia. Escreva o código e clique em Gravar na placa.");
    marcarAbas();
  }
  function prontoLcd() {
    return { teclado: "DIGITE A SENHA", alarme: "DIGITE A SENHA", app: "AGUARDANDO APP", cracha: "APROXIME O CRACHA", relogio: "PASSE O CRACHA" }[missao.modo];
  }

  /* ---------- gravar na placa ---------- */
  function codigoAtual() { return $("fe-editor").value; }

  function gravarNaPlaca() {
    var codigo = codigoAtual();
    var m = missao;
    gravar(m.id + ":codigo", codigo);
    consoleDaPlaca("Gravando...");
    return chamar(codigo, m.funcao, []).then(function (dados) {
      if (m !== missao) return false;
      if (dados.erro) {
        delete gravados[m.id];
        mostrarChip();
        acender("amarelo");
        lcd("ERRO NA GRAVACAO", "VEJA O CONSOLE");
        consoleDaPlaca(dados.erro + saidaDoPrint(dados), true);
        registrar("missão " + m.numero + ": gravação falhou", "falha");
        bipe(180, 300);
        return false;
      }
      gravados[m.id] = codigo;
      mostrarChip();
      acender(null);
      digitado = "";
      lcd(prontoLcd(), "");
      consoleDaPlaca("Gravado! Agora use a fechadura." + saidaDoPrint(dados));
      registrar("missão " + m.numero + ": programa gravado na placa", "info");
      bipe(880, 90, "sine");
      return true;
    });
  }

  // chama a função gravada com uma lista de argumentos e devolve a resposta (ou null se a placa está vazia)
  function perguntarPlaca(args) {
    var codigo = gravados[missao.id];
    if (!codigo) {
      acender("amarelo");
      lcd("PLACA VAZIA", "GRAVE O CODIGO");
      bipe(180, 250);
      return Promise.resolve(null);
    }
    pulsar();
    var m = missao;
    return chamar(codigo, m.funcao, [args]).then(function (dados) {
      if (m !== missao) return null;
      var r = dados.erro ? { erro: dados.erro } : dados.resultados[0];
      if (!entende(r)) {
        acender("amarelo");
        lcd("ERRO NA PLACA", "VEJA O CONSOLE");
        bipe(180, 300);
        registrar("resposta que a fechadura não entende", "falha");
        consoleDaPlaca(explicar(r) + saidaDoPrint(r), true);
        return null;
      }
      consoleDaPlaca("A placa respondeu \"" + r.valor + "\"." + saidaDoPrint(r));
      return r.valor;
    });
  }

  function liberou(texto1, texto2, log) {
    acender("verde");
    lcd(texto1, texto2);
    abrirPorta();
    bipe(660, 120, "sine");
    bipe(990, 160, "sine", 130);
    registrar(log, "ok");
  }
  function negou(texto1, texto2, log) {
    acender("vermelho");
    lcd(texto1, texto2);
    bipe(160, 450);
    registrar(log, "falha");
  }

  /* ---------- missões 1 e 3: o teclado ---------- */
  function apertar(tecla) {
    if (!segredo) return;
    if (travado) {
      lcd("TECLADO TRAVADO", "CHAME A SEGURANCA");
      return;
    }
    if (tecla === "apagar") {
      digitado = digitado.slice(0, -1);
    } else if (tecla === "ok") {
      confirmar();
      return;
    } else if (digitado.length < 8) {
      digitado += tecla;
      bipe(1200, 35);
    }
    lcd("SENHA:", "*".repeat(digitado.length));
  }

  function confirmar() {
    var tentativa = digitado;
    var estrelas = "*".repeat(tentativa.length);
    digitado = "";
    if (missao.modo === "teclado") {
      perguntarPlaca([tentativa, segredo.senha]).then(function (v) {
        if (v === "abrir") liberou("ACESSO LIBERADO", "BEM-VINDO(A)!", "senha " + estrelas + " · LIBERADO");
        else if (v === "negado") negou("ACESSO NEGADO", "", "senha " + estrelas + " · NEGADO");
      });
      return;
    }
    // missão 3: a parte da senha já está pronta; o aluno decide o que fazer com os erros
    if (!gravados[missao.id]) {
      perguntarPlaca([0]);
      return;
    }
    if (tentativa === segredo.senha) {
      erros = 0;
      liberou("ACESSO LIBERADO", "ERROS ZERADOS", "senha certa · LIBERADO · erros zerados");
      return;
    }
    erros++;
    perguntarPlaca([erros]).then(function (v) {
      if (v === "normal") {
        negou("SENHA ERRADA", "ERROS: " + erros, "senha errada · " + erros + " erro(s) · normal");
      } else if (v === "aviso") {
        acender("amarelo");
        lcd("ATENCAO!", "ERROS: " + erros);
        bipe(440, 200);
        bipe(440, 200, "square", 260);
        registrar("senha errada · " + erros + " erros · AVISO", "info");
      } else if (v === "alarme") {
        travado = true;
        acender("vermelho");
        lcd("ALARME! INVASAO", "TECLADO TRAVADO");
        $("fe-caixa").classList.add("sirene");
        $("fe-destravar").hidden = false;
        sirene();
        registrar("senha errada · " + erros + " erros · ALARME", "falha");
      }
    });
  }

  /* ---------- missão 2: o app do celular ---------- */
  function enviarPeloApp() {
    var texto = $("fe-app-texto").value;
    perguntarPlaca([texto]).then(function (v) {
      var mostra = texto === "" ? "(vazio)" : texto.slice(0, 16);
      if (v === "ok") liberou("CODIGO OK", mostra, "app: \"" + mostra + "\" · ok");
      else if (v === "nao e numero") negou("NAO E NUMERO", mostra, "app: \"" + mostra + "\" · não é número");
      else if (v === "fora da faixa") negou("FORA DA FAIXA", mostra, "app: \"" + mostra + "\" · fora da faixa");
    });
  }

  /* ---------- missão 4: os crachás ---------- */
  function montarCrachas() {
    var caixa = $("fe-crachas");
    caixa.innerHTML = "";
    var c = segredo.crachas;
    [["👤", "Visitante", c.visitante], ["👩‍💼", "Funcionária", c.funcionario], ["🧑‍💻", "TI", c.ti], ["👔", "Diretora", c.diretoria], ["🕵️", "Clonado", 999]].forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "fe-cracha";
      b.innerHTML = "<span aria-hidden=\"true\">" + d[0] + "</span><strong></strong><small></small>";
      b.querySelector("strong").textContent = d[1];
      b.querySelector("small").textContent = "nº " + d[2];
      b.addEventListener("click", function () { passarCracha(d[2], d[1]); });
      caixa.appendChild(b);
    });
  }
  function passarCracha(codigo, nome) {
    acenderSalas([]);
    perguntarPlaca([codigo]).then(function (v) {
      if (!v) return;
      if (v === "desconhecido") {
        negou("CRACHA RECUSADO", "Nº " + codigo, "crachá " + codigo + " (" + nome + ") · DESCONHECIDO");
        return;
      }
      acenderSalas(SALAS[v]);
      if (SALAS[v].indexOf("servidores") >= 0) liberou("PERFIL: " + v.toUpperCase(), "SERVIDORES OK", "crachá " + codigo + " · " + v + " · entra nos servidores");
      else {
        acender("amarelo");
        lcd("PERFIL: " + v.toUpperCase(), "SEM SERVIDORES");
        bipe(700, 90, "sine");
        registrar("crachá " + codigo + " · " + v + " · não entra nos servidores", "info");
      }
    });
  }

  /* ---------- missão 5: o relógio ---------- */
  function passarNoHorario() {
    var hora = Number($("fe-hora").value);
    var perfil = $("fe-perfil").value;
    perguntarPlaca([hora, perfil]).then(function (v) {
      if (v === "liberado") liberou("LIBERADO", hora + "H · " + perfil.toUpperCase(), hora + "h · " + perfil + " · liberado");
      else if (v === "bloqueado") negou("FORA DO HORARIO", hora + "H · " + perfil.toUpperCase(), hora + "h · " + perfil + " · bloqueado");
    });
  }

  /* ---------- Red Team ---------- */
  function chamarRedTeam() {
    var botao = $("fe-chamar");
    var m = missao;
    botao.disabled = true;
    var testes = m.testes(segredo);
    var codigo = codigoAtual();
    gravar(m.id + ":codigo", codigo);
    $("fe-placar").hidden = false;
    $("fe-placar-numero").textContent = "O Red Team está atacando a missão " + m.numero + "...";
    var lista = $("fe-ataques");
    lista.innerHTML = "";
    chamar(codigo, m.funcao, testes.map(function (t) { return t.args; })).then(function (dados) {
      var resultados = testes.map(function (t, i) {
        var r = dados.erro ? { erro: dados.erro } : dados.resultados[i];
        return { teste: t, r: r, passou: !r.erro && r.tipo === "str" && r.valor === t.espera };
      });
      // responder sempre a mesma coisa não é decidir: sem if, sem pontos
      var primeira = resultados[0].r;
      var sempreIgual = !primeira.erro && primeira.tipo === "str" &&
        resultados.every(function (x) { return !x.r.erro && x.r.tipo === "str" && x.r.valor === primeira.valor; });
      var naoGravou = Boolean(dados.erro);
      var semReturn = !naoGravou && resultados.every(function (x) { return !x.r.erro && x.r.tipo === "NoneType"; });
      if (sempreIgual) {
        resultados.forEach(function (x) { x.passou = false; });
      }
      var acertos = resultados.filter(function (x) { return x.passou; }).length;
      var pausado = raiz.classList.contains("pausado");
      resultados.forEach(function (x, i) {
        setTimeout(function () {
          var item = document.createElement("li");
          item.className = x.passou ? "ok" : "falha";
          var esperado = "esperado: \"" + x.teste.espera + "\"";
          var veio = x.r.erro ? "erro" : x.r.tipo === "str" ? "\"" + x.r.valor + "\"" : x.r.tipo === "NoneType" ? "None" : String(x.r.valor);
          item.innerHTML = "<strong></strong><span></span>";
          item.querySelector("strong").textContent = (x.passou ? "✅ " : "❌ ") + x.teste.fala;
          item.querySelector("span").textContent = x.passou
            ? "A placa respondeu " + veio + "."
            : sempreIgual
            ? "A placa respondeu " + veio + ", igual para todos os ataques."
            : naoGravou && i > 0
            ? "A placa não gravou (erro no código)."
            : x.r.tipo === "NoneType"
            ? esperado + " · a placa não respondeu nada (None). Faltou o return?"
            : esperado + " · a placa respondeu " + veio + ". " + (entende(x.r) ? "" : explicar(x.r));
          lista.appendChild(item);
          bipe(x.passou ? 880 : 200, 70);
          if (i === resultados.length - 1) fim();
        }, pausado ? 0 : 380 * i);
      });
      function fim() {
        var total = resultados.length;
        $("fe-placar-numero").textContent = naoGravou
          ? "0 de " + total + ". A placa nem gravou: tem um erro no código. Veja o primeiro ataque para saber onde."
          : semReturn
          ? "0 de " + total + ". A placa não respondeu nada para ninguém: faltou o return? O print() não responde à fechadura."
          : sempreIgual
          ? "0 de " + total + ". A placa respondeu \"" + primeira.valor + "\" para todo mundo: isso não é decidir! Sem if, sem pontos."
          : acertos === total
          ? "Placa blindada! " + acertos + " de " + total + ". Compilou de primeira! 🛡️"
          : acertos + " de " + total + ". Curto-circuito em " + (total - acertos) + (total - acertos === 1 ? " ataque" : " ataques") + ": confere a trilha e tenta de novo.";
        var antes = melhor[m.id];
        if (!antes || acertos >= antes.acertos) {
          melhor[m.id] = { acertos: acertos, total: total, codigo: codigo };
          gravar("melhor", JSON.stringify(melhor));
        }
        registrar("Red Team na missão " + m.numero + ": " + acertos + " de " + total, acertos === total ? "ok" : "falha");
        atualizarResumo();
        marcarAbas();
        botao.disabled = false;
      }
    });
  }

  /* ---------- entrega ---------- */
  function contas() {
    var acertos = 0;
    var total = 0;
    window.MISSOES.forEach(function (m) {
      total += m.testes(segredo).length;
      if (melhor[m.id]) acertos += melhor[m.id].acertos;
    });
    return { acertos: acertos, total: total };
  }
  function atualizarResumo() {
    if (!segredo) return;
    var caixa = $("fe-resumo");
    caixa.innerHTML = "";
    window.MISSOES.forEach(function (m) {
      var b = melhor[m.id];
      var linha = document.createElement("p");
      linha.textContent = (b && b.acertos === b.total ? "✅ " : "▫️ ") + "Missão " + m.numero + " · " + m.titulo + ": " +
        (b ? b.acertos + " de " + b.total : "o Red Team ainda não atacou");
      caixa.appendChild(linha);
    });
    var c = contas();
    var soma = document.createElement("p");
    soma.className = "fe-total";
    soma.textContent = "Total: " + c.acertos + " de " + c.total + " ataques barrados";
    caixa.appendChild(soma);
  }
  function entregar() {
    var aviso = $("fe-comprovante");
    if (DEMO || !window.CONTA || !CONTA.daFaculdade()) {
      aviso.textContent = "A entrega só vale com o login da faculdade (@edu.df.senac.br). Clique em Entrar, no alto da página.";
      return;
    }
    var c = contas();
    aviso.textContent = "Enviando...";
    CONTA.registrarTentativa({
      atividade: ATIVIDADE,
      titulo: "Desafio final: fechadura eletrônica",
      acertos: c.acertos,
      total: c.total,
      detalhes: { versao: 2, missoes: melhor }
    }).then(function (registro) {
      if (!registro) {
        aviso.textContent = "Não deu para enviar. Confira o login e a internet e tente de novo.";
        return;
      }
      var quando = new Date(registro.feito_em).toLocaleString("pt-BR");
      aviso.textContent = "Entregue! " + c.acertos + " de " + c.total + " · " + quando + " · código de verificação " + registro.codigo + ".";
      registrar("entrega enviada à professora", "ok");
    });
  }

  /* ---------- ligar tudo ---------- */
  criarTrabalhador();

  $("fe-teclado").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tecla]");
    if (b) apertar(b.dataset.tecla);
  });
  // teclado do computador também funciona com o foco no teclado da fechadura
  $("fe-teclado").addEventListener("keydown", function (e) {
    if (/^[0-9]$/.test(e.key)) { apertar(e.key); e.preventDefault(); }
    else if (e.key === "Backspace") { apertar("apagar"); e.preventDefault(); }
  });
  $("fe-destravar").addEventListener("click", function () {
    erros = 0;
    desligarSirene();
    acender(null);
    lcd("DESTRAVADO", "ERROS ZERADOS");
    registrar("a segurança destravou o teclado", "info");
  });
  $("fe-app-enviar").addEventListener("click", enviarPeloApp);
  $("fe-app-texto").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); enviarPeloApp(); }
  });
  $("fe-hora").addEventListener("input", function () { $("fe-hora-valor").textContent = this.value + "h"; });
  $("fe-passar").addEventListener("click", passarNoHorario);

  $("fe-gravar").addEventListener("click", gravarNaPlaca);
  $("fe-recomecar").addEventListener("click", function () {
    if (!confirm("Apagar o seu código desta missão e voltar ao começo?")) return;
    $("fe-editor").value = missao.inicial;
    gravar(missao.id + ":codigo", missao.inicial);
  });
  $("fe-chamar").addEventListener("click", chamarRedTeam);
  $("fe-entregar").addEventListener("click", entregar);
  $("fe-som").addEventListener("click", function () {
    somLigado = !somLigado;
    this.setAttribute("aria-pressed", String(somLigado));
    this.textContent = somLigado ? "🔊 Som ligado" : "🔇 Som desligado";
  });
  // setas trocam de missão nas abas
  $("fe-abas").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = window.MISSOES.indexOf(missao);
    var n = window.MISSOES.length;
    var proxima = (i + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
    abrirMissao(proxima);
    $("fe-abas").children[proxima].focus();
  });

  // editor: Tab põe 4 espaços; o código é salvo enquanto o aluno digita
  var espera = null;
  $("fe-editor").addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || e.shiftKey) return;
    e.preventDefault();
    var ed = this;
    var ini = ed.selectionStart;
    ed.value = ed.value.slice(0, ini) + "    " + ed.value.slice(ed.selectionEnd);
    ed.selectionStart = ed.selectionEnd = ini + 4;
  });
  $("fe-editor").addEventListener("input", function () {
    clearTimeout(espera);
    var valor = this.value;
    var id = this.dataset.missao;
    espera = setTimeout(function () { gravar(id + ":codigo", valor); }, 400);
  });

  // o aluno: no modo demonstração, um e-mail de exemplo; senão, o do login
  function comecar(endereco) {
    prepararAluno(endereco);
    montarCrachas();
  }
  if (DEMO) {
    comecar("");
  } else {
    window.addEventListener("load", function () {
      if (window.CONTA) CONTA.aoMudar(function (u) { if (u) comecar(u.email); });
    });
  }
})();
