/*
  missoes.js: as 5 missões do desafio final (fechadura eletrônica).
  versão 3 · 2026-11-22 · manual do fabricante nas missões 2 (try/except) e 4 (match/case)

  Cada missão diz:
    funcao     o nome da função que o aluno escreve (a fechadura chama por esse nome)
    modo       o hardware que aparece: teclado, app, alarme, cracha ou relogio (fechadura.js)
    respostas  os únicos textos que a fechadura entende
    enunciado(s), bilhete(s)  textos da missão (HTML), com o segredo do aluno
    inicial    o código que já vem no editor
    testes(s)  os ataques do Red Team: { fala, args, espera }
  O segredo "s" é sorteado pelo e-mail do aluno (fechadura.js): o código de um não passa no do outro.
*/
window.MISSOES = [
  {
    id: "m1",
    numero: 1,
    titulo: "A senha",
    funcao: "conferir_senha",
    modo: "teclado",
    respostas: ["abrir", "negado"],
    enunciado: function () {
      return 'Quando alguém aperta <strong>OK</strong>, a fechadura chama <code>conferir_senha(digitada, correta)</code>. ' +
        'Devolva <code>"abrir"</code> se as duas forem iguais e <code>"negado"</code> se não forem.';
    },
    bilhete: function (s) {
      return '📌 Senha da sala dos servidores: <strong>' + s.senha + '</strong><br><small>(colada no monitor… quem nunca? 🙈)</small>';
    },
    inicial: [
      "# Missão 1: a senha",
      "# A fechadura chama esta função quando alguém aperta OK.",
      "#   digitada: o que foi digitado no teclado (texto)",
      "#   correta:  a senha da sala (texto)",
      "# Devolva \"abrir\" ou \"negado\".",
      "",
      "def conferir_senha(digitada, correta):",
      "    # escreva aqui o seu if",
      "    return \"negado\"",
      ""
    ].join("\n"),
    testes: function (s) {
      return [
        { fala: "A gerente digita a senha certa.", args: [s.senha, s.senha], espera: "abrir" },
        { fala: "Chute clássico: 0000.", args: ["0000", s.senha], espera: "negado" },
        { fala: "Chute clássico: 1234.", args: ["1234", s.senha], espera: "negado" },
        { fala: "Só os 3 primeiros dígitos.", args: [s.senha.slice(0, 3), s.senha], espera: "negado" },
        { fala: "Um dígito a mais no fim.", args: [s.senha + "0", s.senha], espera: "negado" },
        { fala: "Aperta OK sem digitar nada.", args: ["", s.senha], espera: "negado" },
        { fala: "A TI trocou a senha para " + s.outra + ", e a gerente digita a nova.", args: [s.outra, s.outra], espera: "abrir" },
        { fala: "Alguém tenta a senha antiga depois da troca.", args: [s.senha, s.outra], espera: "negado" }
      ];
    }
  },

  {
    id: "m2",
    numero: 2,
    titulo: "O app blindado",
    funcao: "validar_codigo",
    modo: "app",
    respostas: ["ok", "nao e numero", "fora da faixa"],
    enunciado: function () {
      return 'A fechadura ganhou um <strong>app de celular</strong>: o código chega como texto, e qualquer um pode mandar qualquer coisa. ' +
        'Os códigos da empresa vão de <strong>1000 a 9999</strong>. A fechadura chama <code>validar_codigo(texto)</code>. Devolva ' +
        '<code>"ok"</code> se for um número nessa faixa, <code>"nao e numero"</code> se o <code>int()</code> não conseguir converter ' +
        'e <code>"fora da faixa"</code> se for número, mas fora da faixa.';
    },
    bilhete: function () {
      return '📌 Lembrete da TI: <strong>nunca confie no que chega pelo app</strong>.<br><small>(É a validação da calculadora de IMC, lembra?)</small>';
    },
    manual:
      '<p><strong>try/except: o segurança da placa.</strong> O <code>int()</code> só converte texto que é número. Recebeu <code>"abc"</code>? ' +
      'Ele dá um <code>ValueError</code>, e o programa <strong>quebra</strong>: a fechadura trava. O <code>try</code> é a tentativa; ' +
      'se a conversão der errado, o <code>except</code> segura o erro e o programa segue, com calma.</p>' +
      '<pre class="fe-manual-codigo"><code># exemplo: a idade que chegou de um formulário\n' +
      'texto = "vinte"\n' +
      'try:\n' +
      '    idade = int(texto)        # tenta converter\n' +
      '    print("Idade:", idade)\n' +
      'except ValueError:            # não deu? não quebra: cai aqui\n' +
      '    print("Isso não é número!")</code></pre>' +
      '<p><strong>Dentro de uma função</strong>, o <code>except</code> pode responder com <code>return</code>. Depois do <code>try</code>, você já tem um número de verdade e pode usar o <code>if</code>:</p>' +
      '<pre class="fe-manual-codigo"><code>def conferir_idade(texto):\n' +
      '    try:\n' +
      '        idade = int(texto)\n' +
      '    except ValueError:\n' +
      '        return "isso nao e idade"\n' +
      '    # daqui para baixo, idade é um número\n' +
      '    if idade &lt; 0 or idade &gt; 120:\n' +
      '        return "idade impossivel"\n' +
      '    return "ok"</code></pre>' +
      '<ul class="fe-manual-lista">' +
      '<li>🧪 <code>int("abc")</code>, <code>int("")</code>, <code>int("12a4")</code> e <code>int("4.5")</code>: <strong>todos</strong> dão <code>ValueError</code>.</li>' +
      '<li>✅ <code>int("-500")</code> funciona: é número, só que fora da faixa. Quem barra é o <code>if</code>.</li>' +
      '<li>🔁 Adapte para a missão: as respostas são <code>"ok"</code>, <code>"nao e numero"</code> e <code>"fora da faixa"</code>, e a faixa vai de 1000 a 9999.</li>' +
      '</ul>',
    inicial: [
      "# Missão 2: o app blindado",
      "# A fechadura chama esta função quando chega um código pelo app.",
      "#   texto: o que a pessoa mandou (texto, pode ser QUALQUER coisa)",
      "# Devolva \"ok\", \"nao e numero\" ou \"fora da faixa\".",
      "",
      "def validar_codigo(texto):",
      "    # 1. tente converter com int() dentro de um try",
      "    # 2. deu ValueError? devolva \"nao e numero\"",
      "    # 3. confira a faixa (1000 a 9999) com if",
      "    return \"ok\"",
      ""
    ].join("\n"),
    testes: function (s) {
      return [
        { fala: "A gerente manda a senha dela pelo app.", args: [s.senha], espera: "ok" },
        { fala: "O menor código da faixa: 1000.", args: ["1000"], espera: "ok" },
        { fala: "O maior código da faixa: 9999.", args: ["9999"], espera: "ok" },
        { fala: "Manda letras: abc.", args: ["abc"], espera: "nao e numero" },
        { fala: "Manda a mensagem vazia.", args: [""], espera: "nao e numero" },
        { fala: "Esconde uma letra no meio: 12a4.", args: ["12a4"], espera: "nao e numero" },
        { fala: "Manda um número quebrado: 4.5.", args: ["4.5"], espera: "nao e numero" },
        { fala: "Só três dígitos: 999.", args: ["999"], espera: "fora da faixa" },
        { fala: "Cinco dígitos: 10000.", args: ["10000"], espera: "fora da faixa" },
        { fala: "Número negativo: -500.", args: ["-500"], espera: "fora da faixa" }
      ];
    }
  },

  {
    id: "m3",
    numero: 3,
    titulo: "O alarme",
    funcao: "decidir",
    modo: "alarme",
    respostas: ["normal", "aviso", "alarme"],
    enunciado: function (s) {
      return 'Alguém está chutando senhas! A cada senha errada, a fechadura conta os erros seguidos e chama <code>decidir(erros)</code>. ' +
        'Na política da sua empresa, com <strong>' + s.limite + ' erros ou mais</strong> a sirene toca e o teclado trava: devolva <code>"alarme"</code>. ' +
        'Com <strong>' + (s.limite - 1) + '</strong> erros, devolva <code>"aviso"</code> (LED amarelo). Com menos, <code>"normal"</code>.';
    },
    bilhete: function (s) {
      return '📌 Política de segurança: alarme a partir de <strong>' + s.limite + ' erros</strong>.<br><small>(A senha da sala continua ' + s.senha + ': teste errando de propósito.)</small>';
    },
    inicial: [
      "# Missão 3: o alarme",
      "# A fechadura chama esta função a cada senha errada.",
      "#   erros: quantos erros seguidos já aconteceram (número inteiro)",
      "# Devolva \"normal\", \"aviso\" ou \"alarme\".",
      "",
      "def decidir(erros):",
      "    # use if, elif e else",
      "    return \"normal\"",
      ""
    ].join("\n"),
    testes: function (s) {
      var l = s.limite;
      return [
        { fala: "Ninguém errou ainda: 0 erros.", args: [0], espera: "normal" },
        { fala: "Errou uma vez: dedo gordo acontece.", args: [1], espera: "normal" },
        { fala: (l - 1) + " erros: hora de avisar.", args: [l - 1], espera: "aviso" },
        { fala: l + " erros: chegou no limite.", args: [l], espera: "alarme" },
        { fala: (l + 2) + " erros: o invasor insiste.", args: [l + 2], espera: "alarme" },
        { fala: "Um robô tenta 50 vezes.", args: [50], espera: "alarme" }
      ];
    }
  },

  {
    id: "m4",
    numero: 4,
    titulo: "O crachá",
    funcao: "nivel_do_cracha",
    modo: "cracha",
    respostas: ["visitante", "funcionario", "ti", "diretoria", "desconhecido"],
    enunciado: function () {
      return 'A empresa instalou um <strong>leitor de crachá</strong>. Ele lê o número do crachá e chama <code>nivel_do_cracha(codigo)</code>. ' +
        'Use <code>match/case</code> (ou <code>if/elif</code>, se preferir) para devolver <code>"visitante"</code>, <code>"funcionario"</code>, <code>"ti"</code> ou <code>"diretoria"</code>, ' +
        'conforme a lista do bilhete. Qualquer outro número é <code>"desconhecido"</code> (crachá clonado!).';
    },
    bilhete: function (s) {
      var c = s.crachas;
      return '📌 Crachás cadastrados: visitante <strong>' + c.visitante + '</strong> · funcionario <strong>' + c.funcionario +
        '</strong> · ti <strong>' + c.ti + '</strong> · diretoria <strong>' + c.diretoria + '</strong>';
    },
    manual:
      '<p><strong>match/case: a recepcionista com a lista na mão.</strong> O <code>match</code> olha o valor (o número do crachá) e ' +
      'procura na lista, de cima para baixo: cada <code>case</code> é uma linha da lista. Achou? Faz o que está embaixo dele. ' +
      'O <code>case _</code> é o "nenhum dos anteriores": quem não está na lista.</p>' +
      '<pre class="fe-manual-codigo"><code># exemplo: o número do dia da semana vira o nome\n' +
      'def nome_do_dia(numero):\n' +
      '    match numero:\n' +
      '        case 1:\n' +
      '            return "domingo"\n' +
      '        case 2:\n' +
      '            return "segunda"\n' +
      '        case _:\n' +
      '            return "nao existe"</code></pre>' +
      '<p><strong>Também vale com if/elif.</strong> O Red Team só confere a resposta, não o jeito. O <code>match</code> é só mais organizado quando a lista é grande:</p>' +
      '<pre class="fe-manual-codigo"><code>def nome_do_dia(numero):\n' +
      '    if numero == 1:\n' +
      '        return "domingo"\n' +
      '    elif numero == 2:\n' +
      '        return "segunda"\n' +
      '    else:\n' +
      '        return "nao existe"</code></pre>' +
      '<ul class="fe-manual-lista">' +
      '<li>🔢 Use os números do <strong>seu</strong> bilhete: o crachá do colega é outro.</li>' +
      '<li>✋ Número vai sem aspas: <code>case 123:</code>, e não <code>case "123":</code> (o leitor manda número, não texto).</li>' +
      '<li>⬇️ O <code>case _</code> vai sempre <strong>por último</strong>: se vier antes, ele pega todo mundo.</li>' +
      '</ul>',
    inicial: [
      "# Missão 4: o crachá",
      "# O leitor chama esta função quando alguém aproxima o crachá.",
      "#   codigo: o número do crachá (número inteiro)",
      "# Devolva \"visitante\", \"funcionario\", \"ti\", \"diretoria\" ou \"desconhecido\".",
      "",
      "def nivel_do_cracha(codigo):",
      "    match codigo:",
      "        case 0:",
      "            return \"visitante\"",
      "        case _:",
      "            return \"desconhecido\"",
      ""
    ].join("\n"),
    testes: function (s) {
      var c = s.crachas;
      return [
        { fala: "Chega um visitante.", args: [c.visitante], espera: "visitante" },
        { fala: "Uma funcionária vai trabalhar.", args: [c.funcionario], espera: "funcionario" },
        { fala: "O pessoal da TI vai ao servidor.", args: [c.ti], espera: "ti" },
        { fala: "A diretora chega.", args: [c.diretoria], espera: "diretoria" },
        { fala: "Crachá clonado: 999.", args: [999], espera: "desconhecido" },
        { fala: "Crachá zerado: 0.", args: [0], espera: "desconhecido" }
      ];
    }
  },

  {
    id: "m5",
    numero: 5,
    titulo: "O expediente",
    funcao: "acesso_no_horario",
    modo: "relogio",
    respostas: ["liberado", "bloqueado"],
    enunciado: function (s) {
      return 'Fora do expediente, a porta fica trancada para quase todo mundo. A fechadura chama <code>acesso_no_horario(hora, perfil)</code>. ' +
        'Na sua filial, o expediente vai das <strong>' + s.inicio + 'h</strong> até antes das <strong>' + s.fim + 'h</strong>. ' +
        'Devolva <code>"liberado"</code> se o perfil for <code>"ti"</code> (a TI entra a qualquer hora) <strong>ou</strong> se a hora estiver dentro do expediente. ' +
        'Senão, <code>"bloqueado"</code>. Dica: <code>and</code> e <code>or</code>.';
    },
    bilhete: function (s) {
      return '📌 Expediente da filial: das <strong>' + s.inicio + 'h</strong> até antes das <strong>' + s.fim + 'h</strong>.<br><small>(Às ' + s.fim + 'h em ponto já está fechado.)</small>';
    },
    inicial: [
      "# Missão 5: o expediente",
      "# A fechadura chama esta função quando alguém passa o crachá.",
      "#   hora:   a hora do relógio (número inteiro de 0 a 23)",
      "#   perfil: \"visitante\", \"funcionario\", \"ti\" ou \"diretoria\"",
      "# Devolva \"liberado\" ou \"bloqueado\".",
      "",
      "def acesso_no_horario(hora, perfil):",
      "    # use if com and/or",
      "    return \"bloqueado\"",
      ""
    ].join("\n"),
    testes: function (s) {
      return [
        { fala: "Funcionária chega na hora que abre (" + s.inicio + "h).", args: [s.inicio, "funcionario"], espera: "liberado" },
        { fala: "Funcionária sai na última hora (" + (s.fim - 1) + "h).", args: [s.fim - 1, "funcionario"], espera: "liberado" },
        { fala: "Funcionária volta às " + s.fim + "h em ponto.", args: [s.fim, "funcionario"], espera: "bloqueado" },
        { fala: "Funcionário madrugador (" + (s.inicio - 1) + "h).", args: [s.inicio - 1, "funcionario"], espera: "bloqueado" },
        { fala: "Visitante ao meio-dia.", args: [12, "visitante"], espera: "liberado" },
        { fala: "Visitante às 23h.", args: [23, "visitante"], espera: "bloqueado" },
        { fala: "Diretoria às 3h da manhã.", args: [3, "diretoria"], espera: "bloqueado" },
        { fala: "TI às 3h da manhã (servidor caiu!).", args: [3, "ti"], espera: "liberado" },
        { fala: "TI às 14h.", args: [14, "ti"], espera: "liberado" }
      ];
    }
  }
];
