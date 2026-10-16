/*
  Testes dos exercícios do tutorial da aula 12 (Lógica de Programação com Python).
  Cada teste: as entradas que o input() recebe, na ordem, e a saída esperada do print().
  As saídas foram geradas rodando uma solução de referência em Python.
*/
window.TESTES = {
  "usuario": [
    {
      "entradas": [
        "stela2026"
      ],
      "saida": "Primeira: s\nÚltima: 6\nTrês primeiras: ste\nTamanho: 9"
    },
    {
      "entradas": [
        "ana"
      ],
      "saida": "Primeira: a\nÚltima: a\nTrês primeiras: ana\nTamanho: 3"
    },
    {
      "entradas": [
        "joao.silva"
      ],
      "saida": "Primeira: j\nÚltima: a\nTrês primeiras: joa\nTamanho: 10"
    }
  ],
  "email": [
    {
      "entradas": [
        "   Ana.Souza@EDU.DF.Senac.BR  "
      ],
      "saida": "E-mail: ana.souza@edu.df.senac.br\nUsuário: ana.souza\nDomínio: edu.df.senac.br"
    },
    {
      "entradas": [
        "bruno@gmail.com"
      ],
      "saida": "E-mail: bruno@gmail.com\nUsuário: bruno\nDomínio: gmail.com"
    },
    {
      "entradas": [
        " CAIO.LIMA@Outlook.com"
      ],
      "saida": "E-mail: caio.lima@outlook.com\nUsuário: caio.lima\nDomínio: outlook.com"
    }
  ],
  "forca": [
    {
      "entradas": [
        "Senha123"
      ],
      "saida": "Regras cumpridas: 4 de 5\nSenha média"
    },
    {
      "entradas": [
        "123456"
      ],
      "saida": "Regras cumpridas: 1 de 5\nSenha fraca"
    },
    {
      "entradas": [
        "Py@2026!x"
      ],
      "saida": "Regras cumpridas: 5 de 5\nSenha forte"
    },
    {
      "entradas": [
        "abc"
      ],
      "saida": "Regras cumpridas: 1 de 5\nSenha fraca"
    },
    {
      "entradas": [
        "SENHA-FORTE-2026"
      ],
      "saida": "Regras cumpridas: 4 de 5\nSenha média"
    }
  ],
  "cifrar": [
    {
      "entradas": [
        "ATAQUE AO AMANHECER",
        "3"
      ],
      "saida": "Cifrada: DWDTXH DR DPDQKHFHU"
    },
    {
      "entradas": [
        "xyz",
        "3"
      ],
      "saida": "Cifrada: abc"
    },
    {
      "entradas": [
        "Senha 123!",
        "5"
      ],
      "saida": "Cifrada: Xjsmf 123!"
    },
    {
      "entradas": [
        "Python",
        "13"
      ],
      "saida": "Cifrada: Clguba"
    }
  ],
  "decifrar": [
    {
      "entradas": [
        "DWDTXH DR DPDQKHFHU",
        "3"
      ],
      "saida": "Original: ATAQUE AO AMANHECER"
    },
    {
      "entradas": [
        "abc",
        "3"
      ],
      "saida": "Original: xyz"
    },
    {
      "entradas": [
        "Xjsmf 123!",
        "5"
      ],
      "saida": "Original: Senha 123!"
    },
    {
      "entradas": [
        "Clguba",
        "13"
      ],
      "saida": "Original: Python"
    }
  ]
};
