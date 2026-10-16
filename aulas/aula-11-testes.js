/*
  Testes dos exercícios do tutorial da aula 11 (Lógica de Programação com Python).
  Cada teste: as entradas que o input() recebe, na ordem, e a saída esperada do print().
  As saídas foram geradas rodando uma solução de referência em Python.
*/
window.TESTES = {
  "tabuada": [
    {
      "entradas": [
        "7"
      ],
      "saida": "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70"
    },
    {
      "entradas": [
        "3"
      ],
      "saida": "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30"
    },
    {
      "entradas": [
        "10"
      ],
      "saida": "10 x 1 = 10\n10 x 2 = 20\n10 x 3 = 30\n10 x 4 = 40\n10 x 5 = 50\n10 x 6 = 60\n10 x 7 = 70\n10 x 8 = 80\n10 x 9 = 90\n10 x 10 = 100"
    },
    {
      "entradas": [
        "0"
      ],
      "saida": "0 x 1 = 0\n0 x 2 = 0\n0 x 3 = 0\n0 x 4 = 0\n0 x 5 = 0\n0 x 6 = 0\n0 x 7 = 0\n0 x 8 = 0\n0 x 9 = 0\n0 x 10 = 0"
    }
  ],
  "soma100": [
    {
      "entradas": [],
      "saida": "A soma de 1 a 100 é 5050"
    }
  ],
  "media5": [
    {
      "entradas": [
        "8",
        "6.5",
        "9",
        "7",
        "5"
      ],
      "saida": "Soma: 35.5\nMédia: 7.1"
    },
    {
      "entradas": [
        "10",
        "10",
        "10",
        "10",
        "10"
      ],
      "saida": "Soma: 50.0\nMédia: 10.0"
    },
    {
      "entradas": [
        "0",
        "1",
        "2",
        "3",
        "4"
      ],
      "saida": "Soma: 10.0\nMédia: 2.0"
    }
  ],
  "maiormenor": [
    {
      "entradas": [
        "4",
        "9",
        "-2",
        "7",
        "0"
      ],
      "saida": "Maior: 9\nMenor: -2"
    },
    {
      "entradas": [
        "5",
        "5",
        "5",
        "5",
        "5"
      ],
      "saida": "Maior: 5\nMenor: 5"
    },
    {
      "entradas": [
        "-1",
        "-8",
        "-3",
        "-20",
        "-4"
      ],
      "saida": "Maior: -1\nMenor: -20"
    },
    {
      "entradas": [
        "100",
        "1",
        "2",
        "3",
        "4"
      ],
      "saida": "Maior: 100\nMenor: 1"
    }
  ],
  "loginfor": [
    {
      "entradas": [
        "Py@2026"
      ],
      "saida": "Bem-vindo! Você usou 1 tentativa(s)."
    },
    {
      "entradas": [
        "abc",
        "Py@2026"
      ],
      "saida": "Senha errada. Restam 2 tentativa(s).\nBem-vindo! Você usou 2 tentativa(s)."
    },
    {
      "entradas": [
        "a",
        "b",
        "Py@2026"
      ],
      "saida": "Senha errada. Restam 2 tentativa(s).\nSenha errada. Restam 1 tentativa(s).\nBem-vindo! Você usou 3 tentativa(s)."
    },
    {
      "entradas": [
        "a",
        "b",
        "c"
      ],
      "saida": "Senha errada. Restam 2 tentativa(s).\nSenha errada. Restam 1 tentativa(s).\nSenha errada. Restam 0 tentativa(s).\nConta bloqueada."
    },
    {
      "entradas": [
        "py@2026",
        "PY@2026",
        "Py@2025"
      ],
      "saida": "Senha errada. Restam 2 tentativa(s).\nSenha errada. Restam 1 tentativa(s).\nSenha errada. Restam 0 tentativa(s).\nConta bloqueada."
    }
  ],
  "portas": [
    {
      "entradas": [
        "20",
        "25"
      ],
      "saida": "Porta 22 aberta\nPortas testadas: 4"
    },
    {
      "entradas": [
        "78",
        "82"
      ],
      "saida": "Porta 80 aberta\nPortas testadas: 5"
    },
    {
      "entradas": [
        "440",
        "445"
      ],
      "saida": "Porta 443 aberta\nPortas testadas: 6"
    },
    {
      "entradas": [
        "3385",
        "3395"
      ],
      "saida": "Porta 3389 aberta\nPorta crítica! Teste interrompido.\nPortas testadas: 5"
    },
    {
      "entradas": [
        "21",
        "23"
      ],
      "saida": "Porta 22 aberta\nPortas testadas: 1"
    }
  ]
};
