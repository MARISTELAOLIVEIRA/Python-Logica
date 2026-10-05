/*
  python-worker.js: roda o código Python do aluno num "trabalhador" separado da página.
  versão 1 · 2026-10-05

  Por que separado? Se o código do aluno travar (um laço infinito, por exemplo),
  a página continua respondendo e o python-exercicios.js pode encerrar este trabalhador.

  O Python roda no próprio navegador graças ao Pyodide (Python compilado para WebAssembly).
*/
importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");

// funções em Python que executam o código do aluno com entradas simuladas
const PREPARO = `
import sys, io, builtins, traceback

DICAS = {
    "NameError": "uma variável ou função foi usada sem existir. Confira se o nome está escrito igualzinho.",
    "TypeError": "tipos que não combinam, como somar texto com número. Lembre de converter com int() ou float().",
    "ValueError": "não deu para converter o valor. Confira se a entrada é mesmo um número.",
    "SyntaxError": "erro de escrita do código: dois-pontos, parênteses ou aspas faltando?",
    "IndentationError": "a indentação (os espaços no começo da linha) está errada. Dentro do if, use 4 espaços.",
    "ZeroDivisionError": "divisão por zero não existe nem no Python.",
    "EOFError": "o programa pediu mais input() do que este exercício fornece.",
}

def traduz(erro):
    tipo = type(erro).__name__
    linha = None
    if isinstance(erro, SyntaxError):
        linha = erro.lineno
    else:
        for quadro in traceback.extract_tb(erro.__traceback__):
            if quadro.filename == "seu_codigo.py":
                linha = quadro.lineno
    onde = f" na linha {linha}" if linha else ""
    dica = DICAS.get(tipo, "")
    return f"{tipo}{onde}: {erro}" + (f"\\nDica: {dica}" if dica else "")

def executar(codigo, entradas):
    fila = [str(x) for x in entradas]
    saida = io.StringIO()
    stdout_original = sys.stdout
    input_original = builtins.input

    def input_simulado(mensagem=""):
        # a mensagem do input() não entra na saída: só o que o print() mostra é comparado
        if not fila:
            raise EOFError("o programa pediu mais entradas do que o teste fornece")
        return fila.pop(0)

    sys.stdout = saida
    builtins.input = input_simulado
    erro = ""
    try:
        exec(compile(codigo, "seu_codigo.py", "exec"), {"__name__": "__main__"})
    except BaseException as e:
        erro = traduz(e)
    finally:
        sys.stdout = stdout_original
        builtins.input = input_original
    return {"saida": saida.getvalue(), "erro": erro}
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
  pyodide.globals.set("entradas_teste", pyodide.toPy(pedido.entradas));
  const resultado = await pyodide.runPythonAsync("executar(codigo_aluno, entradas_teste)");
  const dados = resultado.toJs({ dict_converter: Object.fromEntries });
  resultado.destroy();
  self.postMessage({ tipo: "resultado", id: pedido.id, saida: dados.saida, erro: dados.erro });
};
