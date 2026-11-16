/*
  imc.js: abas do código no exemplo resolvido da calculadora de IMC.
  versão 1 · 2026-11-16
*/
(function () {
  var abas = Array.prototype.slice.call(document.querySelectorAll('.imc-abas [role="tab"]'));

  function escolher(aba) {
    abas.forEach(function (outra) {
      var ativa = outra === aba;
      outra.setAttribute("aria-selected", String(ativa));
      outra.tabIndex = ativa ? 0 : -1;
      document.getElementById(outra.getAttribute("aria-controls")).hidden = !ativa;
    });
  }

  abas.forEach(function (aba, i) {
    aba.addEventListener("click", function () { escolher(aba); });
    // setas do teclado trocam de aba
    aba.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var proxima = abas[(i + (e.key === "ArrowRight" ? 1 : abas.length - 1)) % abas.length];
      escolher(proxima);
      proxima.focus();
    });
  });
})();
