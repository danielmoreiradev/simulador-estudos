const DADOS_SIMULADO = {
  titulo: "Banco pessoal de questões",
  identificador: "banco-pessoal-questoes-v1",
  questoes: []
};

window.addEventListener("DOMContentLoaded", () => {
  const complemento = document.createElement("script");
  complemento.src = "gestor-questoes-complemento.js";
  document.body.appendChild(complemento);
});