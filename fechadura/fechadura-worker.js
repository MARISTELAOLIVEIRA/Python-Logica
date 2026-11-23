/*
  fechadura-worker.js: roda o "programa da placa" do aluno num trabalhador separado da página.
  versão 1 · 2026-11-16

  Diferente do python-worker.js (que roda o programa inteiro com input()), aqui a fechadura
  CHAMA uma função do aluno com valores, como o hardware chama o firmware, e lê o que ela devolve.
  Se o código travar, o fechadura.js encerra este trabalhador e cria outro.
*/
importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");

const PREPARO = `
import sys, io, json, builtins, traceback

DICAS = {
    "NameError": "uma variável ou função foi usada sem existir. Confira se o nome está escrito igualzinho.",
    "TypeError": "tipos que não combinam, ou a função recebeu parâmetros a mais ou a menos.",
    "ValueError": "não deu para converter o valor. Confira se é mesmo um número.",
    "SyntaxError": "erro de escrita do código: dois-pontos, parênteses ou aspas faltando?",
    "IndentationError": "a indentação (os espaços no começo da linha) está errada. Dentro do def e do if, 4 espaços.",
    "ZeroDivisionError": "divisão por zero não existe nem no Python.",
}

def traduz(erro):
    tipo = type(erro).__name__
    linha = None
    if isinstance(erro, SyntaxError):
        linha = erro.lineno
    else:
        for quadro in traceback.extract_tb(erro.__traceback__):
            if quadro.filename == "placa.py":
                linha = quadro.lineno
    onde = f" na linha {linha}" if linha else ""
    dica = DICAS.get(tipo, "")
    return f"{tipo}{onde}: {erro}" + (f"\\nDica: {dica}" if dica else "")

def sem_teclado(*args):
    raise RuntimeError("a fechadura não tem teclado de computador: use os parâmetros da função, não o input()")

def com_saida(funcao):
    # roda guardando o que o print() mostrou
    saida = io.StringIO()
    antigo_out, antigo_in = sys.stdout, builtins.input
    sys.stdout, builtins.input = saida, sem_teclado
    try:
        return funcao(), "", saida.getvalue()
    except BaseException as e:
        return None, traduz(e), saida.getvalue()
    finally:
        sys.stdout, builtins.input = antigo_out, antigo_in

def descreve(valor):
    # o que a função devolveu, de um jeito que o JavaScript entende
    if valor is None or isinstance(valor, (str, bool, int)):
        return {"tipo": type(valor).__name__, "valor": valor}
    return {"tipo": type(valor).__name__, "valor": repr(valor)}

def chamar(codigo, funcao, chamadas):
    espaco = {"__name__": "placa"}
    _, erro, saida = com_saida(lambda: exec(compile(codigo, "placa.py", "exec"), espaco))
    if erro:
        return json.dumps({"erro": erro, "saida": saida})
    alvo = espaco.get(funcao)
    if not callable(alvo):
        return json.dumps({"erro": f"Não achei a função {funcao}(). Confira o nome depois do def, igualzinho.", "saida": saida})
    resultados = []
    for argumentos in chamadas:
        valor, erro, saida = com_saida(lambda: alvo(*argumentos))
        item = {"erro": erro, "saida": saida}
        if not erro:
            item.update(descreve(valor))
        resultados.append(item)
    return json.dumps({"erro": "", "resultados": resultados})
`;

const pronto = loadPyodide().then(async function (pyodide) {
  await pyodide.runPythonAsync(PREPARO);
  self.postMessage({ tipo: "pronto" });
  return pyodide;
});

self.onmessage = async function (evento) {
  const pedido = evento.data;
  const pyodide = await pronto;
  pyodide.globals.set("codigo_aluno", pedido.codigo);
  pyodide.globals.set("funcao_aluno", pedido.funcao);
  pyodide.globals.set("chamadas_json", JSON.stringify(pedido.chamadas));
  const texto = await pyodide.runPythonAsync("chamar(codigo_aluno, funcao_aluno, json.loads(chamadas_json))");
  self.postMessage({ tipo: "resultado", id: pedido.id, dados: JSON.parse(texto) });
};
