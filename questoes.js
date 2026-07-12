const DADOS_SIMULADO = {
  titulo: "Banco pessoal de questões",
  identificador: "banco-pessoal-questoes-v1",
  questoes: []
};

(() => {
  const estilo = document.createElement("link");
  estilo.rel = "stylesheet";
  estilo.href = "gestor-questoes.css";
  document.head.appendChild(estilo);

  const script = document.createElement("script");
  script.src = "gestor-questoes.js";
  script.defer = true;
  document.head.appendChild(script);
})();