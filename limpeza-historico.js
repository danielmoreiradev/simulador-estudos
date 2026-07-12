(() => {
  "use strict";

  const URL_SERVICO = "https://otvnhahpwblgxevzrsra.supabase.co";
  const CHAVE_PUBLICA = "sb_publishable_OpslVSpJubk6OCLQzand-A_KkeLfQ6r";

  if (!window.supabase?.createClient) return;

  const db = window.supabase.createClient(URL_SERVICO, CHAVE_PUBLICA, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "simulador_sessao"
    }
  });

  const $ = (seletor) => document.querySelector(seletor);
  const modal = $("#modal-limpeza-historico");
  const abrir = $("#abrir-limpeza-historico");
  const formulario = $("#form-limpeza-historico");
  const periodo = $("#periodo-limpeza");
  const datas = $("#datas-personalizadas");
  const dataInicial = $("#data-inicial-limpeza");
  const dataFinal = $("#data-final-limpeza");
  const confirmacao = $("#confirmar-limpeza");
  const mensagem = $("#mensagem-limpeza");
  const executar = $("#executar-limpeza");

  if (!modal || !abrir || !formulario) return;

  function abrirModal() {
    formulario.reset();
    periodo.value = "30";
    datas.hidden = true;
    mensagem.textContent = "";
    mensagem.className = "mensagem-limpeza";
    modal.hidden = false;
    document.body.classList.add("modal-aberto");
    setTimeout(() => periodo.focus(), 50);
  }

  function fecharModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-aberto");
  }

  function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem-limpeza ${tipo}`.trim();
  }

  function fimDoDia(valor) {
    const data = new Date(`${valor}T23:59:59.999`);
    return data.toISOString();
  }

  function inicioDoDia(valor) {
    const data = new Date(`${valor}T00:00:00.000`);
    return data.toISOString();
  }

  function calcularIntervalo() {
    const escolha = periodo.value;

    if (escolha === "tudo") return { tudo: true, rotulo: "todo o histórico" };

    if (escolha === "personalizado") {
      if (!dataInicial.value || !dataFinal.value) {
        throw new Error("Informe a data inicial e a data final.");
      }
      if (dataInicial.value > dataFinal.value) {
        throw new Error("A data inicial não pode ser posterior à data final.");
      }
      return {
        inicio: inicioDoDia(dataInicial.value),
        fim: fimDoDia(dataFinal.value),
        rotulo: `o período de ${dataInicial.value.split("-").reverse().join("/")} a ${dataFinal.value.split("-").reverse().join("/")}`
      };
    }

    const dias = Number(escolha);
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - dias + 1);
    return {
      inicio: inicio.toISOString(),
      fim: new Date().toISOString(),
      rotulo: `os últimos ${dias} dias`
    };
  }

  async function excluirTabelaPorPeriodo(tabela, coluna, intervalo) {
    let consulta = db.from(tabela).delete();
    if (!intervalo.tudo) {
      consulta = consulta.gte(coluna, intervalo.inicio).lte(coluna, intervalo.fim);
    } else {
      consulta = consulta.not("id", "is", null);
    }
    const { error } = await consulta;
    if (error) throw error;
  }

  function limparMarcadoresLocais() {
    Object.keys(localStorage)
      .filter((chave) => chave.startsWith("tentativa_"))
      .forEach((chave) => localStorage.removeItem(chave));
  }

  async function limparHistorico(evento) {
    evento.preventDefault();

    if (!confirmacao.checked) {
      mostrarMensagem("Confirme que entende que a exclusão é permanente.", "erro");
      return;
    }

    let intervalo;
    try {
      intervalo = calcularIntervalo();
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
      return;
    }

    const confirmacaoFinal = window.confirm(
      `Tem certeza de que deseja apagar ${intervalo.rotulo}?\n\nEssa ação não poderá ser desfeita.`
    );
    if (!confirmacaoFinal) return;

    executar.disabled = true;
    periodo.disabled = true;
    dataInicial.disabled = true;
    dataFinal.disabled = true;
    mostrarMensagem("Apagando os registros selecionados...");

    try {
      const { data: sessao, error: erroSessao } = await db.auth.getSession();
      if (erroSessao || !sessao.session?.user) {
        throw new Error("Sua sessão expirou. Entre novamente antes de limpar o histórico.");
      }

      await excluirTabelaPorPeriodo("tentativas_simulado", "concluido_em", intervalo);

      // Remove registros da estrutura anterior, quando existirem no mesmo período.
      await excluirTabelaPorPeriodo("resultados_simulado", "concluido_em", intervalo);

      limparMarcadoresLocais();
      mostrarMensagem("Histórico apagado com sucesso.", "sucesso");
      window.dispatchEvent(new CustomEvent("dashboard:carregar"));
      window.dispatchEvent(new CustomEvent("historico:carregar"));
      setTimeout(fecharModal, 900);
    } catch (erro) {
      console.error("Falha ao limpar histórico:", erro);
      mostrarMensagem(
        erro?.message?.includes("sessão") ? erro.message : "Não foi possível apagar o histórico. Nenhum progresso atual foi removido.",
        "erro"
      );
    } finally {
      executar.disabled = false;
      periodo.disabled = false;
      dataInicial.disabled = false;
      dataFinal.disabled = false;
    }
  }

  abrir.addEventListener("click", abrirModal);
  formulario.addEventListener("submit", limparHistorico);
  periodo.addEventListener("change", () => {
    datas.hidden = periodo.value !== "personalizado";
    dataInicial.required = periodo.value === "personalizado";
    dataFinal.required = periodo.value === "personalizado";
  });
  modal.querySelectorAll("[data-fechar-limpeza]").forEach((elemento) => {
    elemento.addEventListener("click", fecharModal);
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modal.hidden) fecharModal();
  });
})();