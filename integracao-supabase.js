(() => {
  "use strict";

  const URL_SERVICO = "https://otvnhahpwblgxevzrsra.supabase.co";
  const CHAVE_PUBLICA = "sb_publishable_OpslVSpJubk6OCLQzand-A_KkeLfQ6r";
  const CHAVE_PROGRESSO = `simulador_${DADOS_SIMULADO.identificador}`;
  const INTERVALO_SINCRONIZACAO = 5000;

  if (!window.supabase?.createClient) {
    console.error("Serviço de autenticação indisponível.");
    return;
  }

  const cliente = window.supabase.createClient(URL_SERVICO, CHAVE_PUBLICA, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "simulador_sessao"
    }
  });

  const elementos = {
    conteudo: document.querySelector("#conteudo-aplicacao"),
    modal: document.querySelector("#modal-conta"),
    botaoConta: document.querySelector("#botao-conta"),
    formulario: document.querySelector("#formulario-conta"),
    email: document.querySelector("#email-conta"),
    senha: document.querySelector("#senha-conta"),
    sair: document.querySelector("#botao-sair"),
    areaLogin: document.querySelector("#area-login"),
    areaUsuario: document.querySelector("#area-usuario"),
    emailUsuario: document.querySelector("#email-usuario"),
    mensagem: document.querySelector("#mensagem-conta"),
    status: document.querySelector("#status-sincronizacao")
  };

  let usuarioAtual = null;
  let sincronizando = false;
  let ultimoConteudoEnviado = null;

  function definirAcesso(usuario) {
    usuarioAtual = usuario || null;
    const conectado = Boolean(usuarioAtual);

    elementos.conteudo.hidden = !conectado;
    elementos.modal.hidden = conectado;
    elementos.areaLogin.hidden = conectado;
    elementos.areaUsuario.hidden = !conectado;
    elementos.botaoConta.hidden = !conectado;
    elementos.emailUsuario.textContent = conectado ? usuarioAtual.email || "Usuário autorizado" : "";
    elementos.status.textContent = conectado ? "Conectado com segurança" : "Acesso protegido";
    elementos.status.classList.toggle("conectado", conectado);
    document.body.classList.toggle("modal-aberto", !conectado);

    if (!conectado) {
      elementos.formulario.reset();
      setTimeout(() => elementos.email.focus(), 50);
    }
  }

  function mostrarConta() {
    if (!usuarioAtual) return;
    elementos.modal.hidden = false;
    elementos.areaLogin.hidden = true;
    elementos.areaUsuario.hidden = false;
    document.body.classList.add("modal-aberto");
  }

  function fecharConta() {
    if (!usuarioAtual) return;
    elementos.modal.hidden = true;
    document.body.classList.remove("modal-aberto");
  }

  function mensagem(texto, tipo = "") {
    elementos.mensagem.textContent = texto;
    elementos.mensagem.className = `mensagem-conta ${tipo}`.trim();
  }

  async function entrar(evento) {
    evento.preventDefault();

    const email = elementos.email.value.trim().toLowerCase();
    const senha = elementos.senha.value;
    if (!email || senha.length < 8) {
      mensagem("Verifique o e-mail e a senha.", "erro");
      return;
    }

    const botao = elementos.formulario.querySelector("button[type='submit']");
    botao.disabled = true;
    mensagem("Verificando acesso...");

    try {
      const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha });
      if (error || !data.user) {
        mensagem("Não foi possível entrar. Verifique os dados.", "erro");
        return;
      }

      elementos.formulario.reset();
      mensagem("");
      definirAcesso(data.user);
      await sincronizarAoEntrar();
    } catch (erro) {
      console.error("Falha de autenticação:", erro);
      mensagem("Serviço temporariamente indisponível.", "erro");
    } finally {
      botao.disabled = false;
    }
  }

  async function sair() {
    const { error } = await cliente.auth.signOut({ scope: "local" });
    if (error) {
      mensagem("Não foi possível encerrar a sessão.", "erro");
      return;
    }
    fecharConta();
    definirAcesso(null);
  }

  function lerLocal() {
    try {
      const conteudo = localStorage.getItem(CHAVE_PROGRESSO);
      return conteudo ? JSON.parse(conteudo) : null;
    } catch {
      localStorage.removeItem(CHAVE_PROGRESSO);
      return null;
    }
  }

  function questoesPadrao() {
    return DADOS_SIMULADO.questoes.map((questao) => ({
      ...questao,
      alternativas: questao.alternativas.map((texto, original) => ({ texto, original }))
    }));
  }

  async function carregarRemoto() {
    const { data: progresso, error: erroProgresso } = await cliente
      .from("progressos_simulado")
      .select("indice_atual, modo, segundos_decorridos, finalizado, marcadas")
      .eq("simulado_id", DADOS_SIMULADO.identificador)
      .maybeSingle();

    if (erroProgresso) throw erroProgresso;
    if (!progresso) return null;

    const { data: respostas, error: erroRespostas } = await cliente
      .from("respostas_questoes")
      .select("questao_id, alternativa_marcada, marcada_revisao")
      .eq("simulado_id", DADOS_SIMULADO.identificador);

    if (erroRespostas) throw erroRespostas;

    const mapa = {};
    const marcadas = new Set((progresso.marcadas || []).map(String));
    (respostas || []).forEach((item) => {
      if (item.alternativa_marcada !== null) mapa[item.questao_id] = item.alternativa_marcada;
      if (item.marcada_revisao) marcadas.add(String(item.questao_id));
    });

    return {
      questoes: questoesPadrao(),
      indice: progresso.indice_atual,
      respostas: mapa,
      marcadas: [...marcadas],
      modo: progresso.modo,
      segundos: progresso.segundos_decorridos,
      finalizado: progresso.finalizado
    };
  }

  function combinar(local, remoto) {
    if (!local) return remoto;
    if (!remoto) return local;
    return {
      ...remoto,
      ...local,
      respostas: { ...(remoto.respostas || {}), ...(local.respostas || {}) },
      marcadas: [...new Set([...(remoto.marcadas || []), ...(local.marcadas || [])].map(String))],
      segundos: Math.max(Number(local.segundos || 0), Number(remoto.segundos || 0)),
      finalizado: Boolean(local.finalizado || remoto.finalizado),
      questoes: local.questoes?.length ? local.questoes : remoto.questoes
    };
  }

  async function sincronizarAoEntrar() {
    if (!usuarioAtual) return;
    elementos.status.textContent = "Sincronizando...";

    try {
      const combinado = combinar(lerLocal(), await carregarRemoto());
      if (combinado) localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(combinado));
      ultimoConteudoEnviado = null;
      await sincronizarAgora();
      elementos.status.textContent = "Sincronizado com segurança";
    } catch (erro) {
      console.error("Falha ao recuperar progresso:", erro);
      elementos.status.textContent = "Sincronização pendente";
    }
  }

  async function salvarProgresso(progresso) {
    const { error } = await cliente.from("progressos_simulado").upsert({
      usuario_id: usuarioAtual.id,
      simulado_id: DADOS_SIMULADO.identificador,
      indice_atual: Math.max(0, Number(progresso.indice || 0)),
      modo: progresso.modo === "prova" ? "prova" : "estudo",
      segundos_decorridos: Math.max(0, Number(progresso.segundos || 0)),
      finalizado: Boolean(progresso.finalizado),
      marcadas: Array.isArray(progresso.marcadas) ? progresso.marcadas.map(String) : [],
      atualizado_em: new Date().toISOString()
    }, { onConflict: "usuario_id,simulado_id" });
    if (error) throw error;
  }

  async function salvarRespostas(progresso) {
    const questoes = Array.isArray(progresso.questoes) ? progresso.questoes : [];
    const marcadas = new Set((progresso.marcadas || []).map(String));
    const linhas = questoes.map((questao) => {
      const resposta = progresso.respostas?.[questao.id];
      return {
        usuario_id: usuarioAtual.id,
        simulado_id: DADOS_SIMULADO.identificador,
        questao_id: String(questao.id),
        alternativa_marcada: resposta === undefined ? null : Number(resposta),
        correta: resposta === undefined ? null : Number(resposta) === Number(questao.respostaCorreta),
        marcada_revisao: marcadas.has(String(questao.id)),
        atualizado_em: new Date().toISOString()
      };
    });

    if (!linhas.length) return;
    const { error } = await cliente.from("respostas_questoes").upsert(linhas, {
      onConflict: "usuario_id,simulado_id,questao_id"
    });
    if (error) throw error;
  }

  async function salvarResultado(progresso) {
    const chave = `resultado_enviado_${usuarioAtual.id}_${DADOS_SIMULADO.identificador}`;
    if (localStorage.getItem(chave)) return;

    let acertos = 0;
    let erros = 0;
    let emBranco = 0;
    const questoes = progresso.questoes || [];
    questoes.forEach((questao) => {
      const resposta = progresso.respostas?.[questao.id];
      if (resposta === undefined) emBranco += 1;
      else if (Number(resposta) === Number(questao.respostaCorreta)) acertos += 1;
      else erros += 1;
    });

    const total = questoes.length;
    const { error } = await cliente.from("resultados_simulado").insert({
      usuario_id: usuarioAtual.id,
      simulado_id: DADOS_SIMULADO.identificador,
      titulo_simulado: String(DADOS_SIMULADO.titulo).slice(0, 200),
      total,
      acertos,
      erros,
      em_branco: emBranco,
      percentual: total ? Math.round((acertos / total) * 100) : 0,
      tempo_segundos: Math.max(0, Number(progresso.segundos || 0))
    });

    if (error) throw error;
    localStorage.setItem(chave, "1");
  }

  async function sincronizarAgora() {
    if (!usuarioAtual || sincronizando || !navigator.onLine) return;
    const conteudo = localStorage.getItem(CHAVE_PROGRESSO);
    if (!conteudo || conteudo === ultimoConteudoEnviado) return;

    sincronizando = true;
    elementos.status.textContent = "Sincronizando...";
    try {
      const progresso = JSON.parse(conteudo);
      await salvarProgresso(progresso);
      await salvarRespostas(progresso);
      if (progresso.finalizado) await salvarResultado(progresso);
      ultimoConteudoEnviado = conteudo;
      elementos.status.textContent = "Sincronizado com segurança";
    } catch (erro) {
      console.error("Falha de sincronização:", erro);
      elementos.status.textContent = "Sincronização pendente";
    } finally {
      sincronizando = false;
    }
  }

  elementos.formulario.addEventListener("submit", entrar);
  elementos.sair.addEventListener("click", sair);
  elementos.botaoConta.addEventListener("click", mostrarConta);
  elementos.modal.addEventListener("click", (evento) => {
    if (usuarioAtual && evento.target.classList.contains("modal__fundo")) fecharConta();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && usuarioAtual && !elementos.modal.hidden) fecharConta();
  });

  cliente.auth.onAuthStateChange((_evento, sessao) => {
    const novoUsuario = sessao?.user || null;
    definirAcesso(novoUsuario);
    if (novoUsuario) setTimeout(sincronizarAoEntrar, 0);
  });

  cliente.auth.getSession().then(({ data, error }) => {
    if (error) console.error("Falha ao validar sessão:", error);
    definirAcesso(data?.session?.user || null);
  });

  window.addEventListener("online", sincronizarAgora);
  window.addEventListener("beforeunload", sincronizarAgora);
  setInterval(sincronizarAgora, INTERVALO_SINCRONIZACAO);
})();