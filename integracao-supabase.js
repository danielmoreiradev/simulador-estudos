(() => {
  "use strict";

  const URL_SUPABASE = "https://otvnhahpwblgxevzrsra.supabase.co";
  const CHAVE_PUBLICA = "sb_publishable_OpslVSpJubk6OCLQzand-A_KkeLfQ6r";
  const CHAVE_PROGRESSO = `simulador_${DADOS_SIMULADO.identificador}`;
  const INTERVALO_SINCRONIZACAO = 3000;

  const cliente = window.supabase.createClient(URL_SUPABASE, CHAVE_PUBLICA, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const elementos = {
    modal: document.querySelector("#modal-conta"),
    botaoConta: document.querySelector("#botao-conta"),
    formulario: document.querySelector("#formulario-conta"),
    email: document.querySelector("#email-conta"),
    senha: document.querySelector("#senha-conta"),
    cadastrar: document.querySelector("#botao-cadastrar"),
    sair: document.querySelector("#botao-sair"),
    areaLogin: document.querySelector("#area-login"),
    areaUsuario: document.querySelector("#area-usuario"),
    emailUsuario: document.querySelector("#email-usuario"),
    mensagem: document.querySelector("#mensagem-conta"),
    status: document.querySelector("#status-sincronizacao")
  };

  let usuarioAtual = null;
  let sincronizando = false;
  let ultimoConteudoLocal = localStorage.getItem(CHAVE_PROGRESSO);

  function mostrarModal() {
    elementos.modal.hidden = false;
    document.body.classList.add("modal-aberto");
    elementos.mensagem.textContent = "";
    setTimeout(() => elementos.email?.focus(), 50);
  }

  function fecharModal() {
    elementos.modal.hidden = true;
    document.body.classList.remove("modal-aberto");
  }

  function atualizarInterfaceUsuario(usuario) {
    usuarioAtual = usuario || null;
    const conectado = Boolean(usuarioAtual);

    elementos.areaLogin.hidden = conectado;
    elementos.areaUsuario.hidden = !conectado;
    elementos.botaoConta.textContent = conectado ? "Minha conta" : "Entrar";
    elementos.emailUsuario.textContent = conectado ? usuarioAtual.email : "";
    elementos.status.textContent = conectado ? "Sincronizado com a nuvem" : "Somente neste dispositivo";
    elementos.status.classList.toggle("conectado", conectado);
  }

  function mensagemConta(texto, tipo = "") {
    elementos.mensagem.textContent = texto;
    elementos.mensagem.className = `mensagem-conta ${tipo}`.trim();
  }

  async function entrar(evento) {
    evento.preventDefault();
    mensagemConta("Entrando...");

    const { error } = await cliente.auth.signInWithPassword({
      email: elementos.email.value.trim(),
      password: elementos.senha.value
    });

    if (error) {
      mensagemConta(traduzirErro(error.message), "erro");
      return;
    }

    mensagemConta("Conta conectada com sucesso.", "sucesso");
    elementos.formulario.reset();
    await sincronizarAoEntrar();
  }

  async function cadastrar() {
    mensagemConta("Criando sua conta...");

    const { data, error } = await cliente.auth.signUp({
      email: elementos.email.value.trim(),
      password: elementos.senha.value,
      options: {
        emailRedirectTo: "https://danielmoreiradev.github.io/simulador-estudos/"
      }
    });

    if (error) {
      mensagemConta(traduzirErro(error.message), "erro");
      return;
    }

    if (!data.session) {
      mensagemConta("Conta criada. Confira seu e-mail para confirmar o acesso.", "sucesso");
      return;
    }

    mensagemConta("Conta criada e conectada.", "sucesso");
    await sincronizarAoEntrar();
  }

  async function sair() {
    const { error } = await cliente.auth.signOut();
    if (error) {
      mensagemConta("Não foi possível sair da conta.", "erro");
      return;
    }
    mensagemConta("Você saiu da conta. O progresso local continua neste aparelho.", "sucesso");
  }

  async function sincronizarAoEntrar() {
    if (!usuarioAtual) return;

    elementos.status.textContent = "Sincronizando...";

    const remoto = await carregarProgressoRemoto();
    const local = lerProgressoLocal();

    if (remoto && !local) {
      localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(remoto));
      ultimoConteudoLocal = localStorage.getItem(CHAVE_PROGRESSO);
      elementos.status.textContent = "Progresso recuperado";
      setTimeout(() => location.reload(), 700);
      return;
    }

    if (remoto && local) {
      const combinado = combinarProgressos(local, remoto);
      localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(combinado));
      ultimoConteudoLocal = localStorage.getItem(CHAVE_PROGRESSO);
    }

    await sincronizarAgora();
  }

  function lerProgressoLocal() {
    try {
      const conteudo = localStorage.getItem(CHAVE_PROGRESSO);
      return conteudo ? JSON.parse(conteudo) : null;
    } catch {
      return null;
    }
  }

  function combinarProgressos(local, remoto) {
    return {
      ...remoto,
      ...local,
      respostas: { ...(remoto.respostas || {}), ...(local.respostas || {}) },
      marcadas: [...new Set([...(remoto.marcadas || []), ...(local.marcadas || [])])],
      segundos: Math.max(local.segundos || 0, remoto.segundos || 0),
      finalizado: Boolean(local.finalizado || remoto.finalizado),
      questoes: local.questoes?.length ? local.questoes : remoto.questoes
    };
  }

  async function carregarProgressoRemoto() {
    const { data: progresso, error: erroProgresso } = await cliente
      .from("progressos_simulado")
      .select("indice_atual, modo, segundos_decorridos, finalizado, marcadas")
      .eq("usuario_id", usuarioAtual.id)
      .eq("simulado_id", DADOS_SIMULADO.identificador)
      .maybeSingle();

    if (erroProgresso) {
      console.error("Erro ao carregar progresso:", erroProgresso);
      return null;
    }

    if (!progresso) return null;

    const { data: respostas, error: erroRespostas } = await cliente
      .from("respostas_questoes")
      .select("questao_id, alternativa_marcada, marcada_revisao")
      .eq("usuario_id", usuarioAtual.id)
      .eq("simulado_id", DADOS_SIMULADO.identificador);

    if (erroRespostas) {
      console.error("Erro ao carregar respostas:", erroRespostas);
      return null;
    }

    const mapaRespostas = {};
    const marcadas = new Set(Array.isArray(progresso.marcadas) ? progresso.marcadas : []);

    (respostas || []).forEach((item) => {
      if (item.alternativa_marcada !== null) {
        mapaRespostas[item.questao_id] = item.alternativa_marcada;
      }
      if (item.marcada_revisao) marcadas.add(item.questao_id);
    });

    return {
      questoes: copiarQuestoesPadrao(),
      indice: progresso.indice_atual,
      respostas: mapaRespostas,
      marcadas: [...marcadas],
      modo: progresso.modo,
      segundos: progresso.segundos_decorridos,
      finalizado: progresso.finalizado
    };
  }

  function copiarQuestoesPadrao() {
    return DADOS_SIMULADO.questoes.map((questao) => ({
      ...questao,
      alternativas: questao.alternativas.map((texto, original) => ({ texto, original }))
    }));
  }

  async function sincronizarAgora() {
    if (!usuarioAtual || sincronizando || !navigator.onLine) return;

    const conteudoAtual = localStorage.getItem(CHAVE_PROGRESSO);

    if (!conteudoAtual && ultimoConteudoLocal) {
      await apagarProgressoRemoto();
      ultimoConteudoLocal = null;
      return;
    }

    if (!conteudoAtual || conteudoAtual === ultimoConteudoLocal) return;

    sincronizando = true;
    elementos.status.textContent = "Sincronizando...";

    try {
      const progresso = JSON.parse(conteudoAtual);
      await salvarProgressoRemoto(progresso);
      await salvarRespostasRemotas(progresso);
      if (progresso.finalizado) await salvarResultadoRemoto(progresso);

      ultimoConteudoLocal = conteudoAtual;
      elementos.status.textContent = "Sincronizado agora";
      setTimeout(() => {
        if (usuarioAtual) elementos.status.textContent = "Sincronizado com a nuvem";
      }, 1800);
    } catch (erro) {
      console.error("Erro de sincronização:", erro);
      elementos.status.textContent = "Sincronização pendente";
    } finally {
      sincronizando = false;
    }
  }

  async function salvarProgressoRemoto(progresso) {
    const { error } = await cliente.from("progressos_simulado").upsert({
      usuario_id: usuarioAtual.id,
      simulado_id: DADOS_SIMULADO.identificador,
      indice_atual: Number(progresso.indice || 0),
      modo: progresso.modo === "prova" ? "prova" : "estudo",
      segundos_decorridos: Number(progresso.segundos || 0),
      finalizado: Boolean(progresso.finalizado),
      marcadas: Array.isArray(progresso.marcadas) ? progresso.marcadas.map(String) : [],
      atualizado_em: new Date().toISOString()
    }, { onConflict: "usuario_id,simulado_id" });

    if (error) throw error;
  }

  async function salvarRespostasRemotas(progresso) {
    const questoes = Array.isArray(progresso.questoes) ? progresso.questoes : [];
    const marcadas = new Set((progresso.marcadas || []).map(String));

    const linhas = questoes.map((questao) => {
      const idQuestao = String(questao.id);
      const resposta = progresso.respostas?.[questao.id];
      return {
        usuario_id: usuarioAtual.id,
        simulado_id: DADOS_SIMULADO.identificador,
        questao_id: idQuestao,
        alternativa_marcada: resposta === undefined ? null : Number(resposta),
        correta: resposta === undefined ? null : Number(resposta) === Number(questao.respostaCorreta),
        marcada_revisao: marcadas.has(idQuestao),
        atualizado_em: new Date().toISOString()
      };
    });

    if (!linhas.length) return;

    const { error } = await cliente.from("respostas_questoes").upsert(linhas, {
      onConflict: "usuario_id,simulado_id,questao_id"
    });

    if (error) throw error;
  }

  async function salvarResultadoRemoto(progresso) {
    const chaveResultado = `resultado_enviado_${usuarioAtual.id}_${DADOS_SIMULADO.identificador}`;
    if (localStorage.getItem(chaveResultado)) return;

    const questoes = progresso.questoes || [];
    let acertos = 0;
    let erros = 0;
    let emBranco = 0;

    questoes.forEach((questao) => {
      const resposta = progresso.respostas?.[questao.id];
      if (resposta === undefined) emBranco += 1;
      else if (Number(resposta) === Number(questao.respostaCorreta)) acertos += 1;
      else erros += 1;
    });

    const total = questoes.length;
    const percentual = total ? Math.round((acertos / total) * 100) : 0;

    const { error } = await cliente.from("resultados_simulado").insert({
      usuario_id: usuarioAtual.id,
      simulado_id: DADOS_SIMULADO.identificador,
      titulo_simulado: DADOS_SIMULADO.titulo,
      total,
      acertos,
      erros,
      em_branco: emBranco,
      percentual,
      tempo_segundos: Number(progresso.segundos || 0)
    });

    if (error) throw error;
    localStorage.setItem(chaveResultado, "1");
  }

  async function apagarProgressoRemoto() {
    if (!usuarioAtual) return;

    const filtro = {
      usuario_id: usuarioAtual.id,
      simulado_id: DADOS_SIMULADO.identificador
    };

    const { error: erroRespostas } = await cliente
      .from("respostas_questoes")
      .delete()
      .match(filtro);

    const { error: erroProgresso } = await cliente
      .from("progressos_simulado")
      .delete()
      .match(filtro);

    if (erroRespostas || erroProgresso) {
      console.error("Erro ao apagar progresso remoto:", erroRespostas || erroProgresso);
      return;
    }

    elementos.status.textContent = "Progresso reiniciado";
  }

  function traduzirErro(mensagem) {
    const texto = mensagem.toLowerCase();
    if (texto.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (texto.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
    if (texto.includes("user already registered")) return "Este e-mail já possui uma conta.";
    if (texto.includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
    return "Não foi possível concluir. Verifique os dados e tente novamente.";
  }

  elementos.botaoConta.addEventListener("click", mostrarModal);
  elementos.formulario.addEventListener("submit", entrar);
  elementos.cadastrar.addEventListener("click", cadastrar);
  elementos.sair.addEventListener("click", sair);
  elementos.modal.querySelectorAll("[data-fechar-modal]").forEach((item) => item.addEventListener("click", fecharModal));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !elementos.modal.hidden) fecharModal();
  });

  cliente.auth.onAuthStateChange(async (_evento, sessao) => {
    atualizarInterfaceUsuario(sessao?.user || null);
    if (sessao?.user) await sincronizarAoEntrar();
  });

  cliente.auth.getSession().then(({ data }) => {
    atualizarInterfaceUsuario(data.session?.user || null);
  });

  window.addEventListener("online", sincronizarAgora);
  setInterval(sincronizarAgora, INTERVALO_SINCRONIZACAO);
})();