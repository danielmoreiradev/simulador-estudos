(() => {
  "use strict";

  const CHAVE_TEMA = "simulador_tema";
  const CHAVE_PROGRESSO = `simulador_${DADOS_SIMULADO.identificador}`;
  const $ = (seletor) => document.querySelector(seletor);
  const $$ = (seletor) => document.querySelectorAll(seletor);

  const el = {
    inicio: $("#inicio"), simulado: $("#simulado"), resultado: $("#resultado"),
    totalInicial: $("#total-inicial"), iniciar: $("#botao-iniciar"), continuar: $("#botao-continuar"),
    tema: $("#botao-tema"), embaralharQuestoes: $("#embaralhar-questoes"), embaralharAlternativas: $("#embaralhar-alternativas"),
    grade: $("#grade-questoes"), textoProgresso: $("#texto-progresso"), barraProgresso: $("#barra-progresso"),
    respondidas: $("#respondidas"), restantes: $("#restantes"), tempo: $("#tempo"), materia: $("#materia"),
    tituloQuestao: $("#titulo-questao"), assunto: $("#assunto"), origem: $("#origem"), enunciado: $("#enunciado"),
    alternativas: $("#alternativas"), comentario: $("#comentario"), tituloComentario: $("#titulo-comentario"),
    textoComentario: $("#texto-comentario"), anterior: $("#anterior"), limpar: $("#limpar"), proxima: $("#proxima"),
    revisao: $("#botao-revisao"), finalizar: $("#botao-finalizar"), resultadoTitulo: $("#resultado-titulo"),
    resultadoMensagem: $("#resultado-mensagem"), percentual: $("#percentual"), circulo: $("#circulo"), total: $("#total"),
    acertos: $("#acertos"), erros: $("#erros"), branco: $("#branco"), tempoFinal: $("#tempo-final"),
    listaRevisao: $("#lista-revisao"), imprimir: $("#imprimir"), reiniciar: $("#reiniciar"), aviso: $("#aviso")
  };

  const estado = { questoes: [], indice: 0, respostas: {}, marcadas: [], modo: "estudo", segundos: 0, finalizado: false, intervalo: null };

  function copiarQuestoes() {
    return DADOS_SIMULADO.questoes.map(q => ({ ...q, alternativas: q.alternativas.map((texto, original) => ({ texto, original })) }));
  }

  function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function iniciarNovo() {
    estado.questoes = copiarQuestoes();
    estado.indice = 0; estado.respostas = {}; estado.marcadas = []; estado.segundos = 0; estado.finalizado = false;
    estado.modo = $('input[name="modo"]:checked')?.value || "estudo";
    if (el.embaralharQuestoes.checked) estado.questoes = embaralhar(estado.questoes);
    if (el.embaralharAlternativas.checked) estado.questoes = estado.questoes.map(q => ({ ...q, alternativas: embaralhar(q.alternativas) }));
    salvar(); abrirSimulado();
  }

  function abrirSimulado() {
    el.inicio.hidden = true; el.resultado.hidden = true; el.simulado.hidden = false;
    criarGrade(); renderizar(); iniciarCronometro(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function criarGrade() {
    el.grade.innerHTML = "";
    estado.questoes.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "numero"; b.textContent = i + 1;
      b.addEventListener("click", () => { estado.indice = i; renderizar(); });
      el.grade.appendChild(b);
    });
  }

  function renderizar() {
    const q = estado.questoes[estado.indice]; if (!q) return;
    const resposta = estado.respostas[q.id];
    el.materia.textContent = q.materia || "Geral"; el.tituloQuestao.textContent = `Questão ${estado.indice + 1}`;
    el.assunto.textContent = q.assunto || "Assunto não informado"; el.origem.textContent = q.origem || "Origem não informada";
    el.enunciado.innerHTML = q.enunciado; el.alternativas.innerHTML = ""; el.comentario.hidden = true;

    q.alternativas.forEach((alt, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "alternativa";
      b.innerHTML = `<span class="letra">${String.fromCharCode(65 + i)}</span><span>${escapar(alt.texto)}</span>`;
      if (resposta === alt.original) b.classList.add("selecionada");
      const corrigir = estado.finalizado || (estado.modo === "estudo" && resposta !== undefined);
      if (corrigir) {
        b.disabled = true;
        if (alt.original === q.respostaCorreta) b.classList.add("correta");
        if (resposta === alt.original && alt.original !== q.respostaCorreta) b.classList.add("errada");
      } else b.addEventListener("click", () => responder(alt.original));
      el.alternativas.appendChild(b);
    });

    if (resposta !== undefined && (estado.modo === "estudo" || estado.finalizado)) mostrarComentario(q, resposta);
    const marcada = estado.marcadas.includes(q.id);
    el.revisao.textContent = marcada ? "★ Marcada para revisar" : "☆ Marcar para revisar";
    el.anterior.disabled = estado.indice === 0;
    el.proxima.textContent = estado.indice === estado.questoes.length - 1 ? "Finalizar" : "Próxima →";
    atualizarResumo(); atualizarGrade();
  }

  function responder(indice) {
    const q = estado.questoes[estado.indice]; estado.respostas[q.id] = indice; salvar(); renderizar();
  }

  function mostrarComentario(q, resposta) {
    const acertou = resposta === q.respostaCorreta;
    el.comentario.hidden = false; el.tituloComentario.textContent = acertou ? "✓ Resposta correta" : "✕ Resposta incorreta";
    el.textoComentario.textContent = q.comentario || "Sem comentário disponível.";
  }

  function atualizarResumo() {
    const total = estado.questoes.length, resp = Object.keys(estado.respostas).length;
    el.textoProgresso.textContent = `${resp} de ${total}`; el.barraProgresso.style.width = `${total ? (resp / total) * 100 : 0}%`;
    el.respondidas.textContent = resp; el.restantes.textContent = total - resp; el.tempo.textContent = formatarTempo(estado.segundos);
  }

  function atualizarGrade() {
    $$(".numero").forEach((b, i) => {
      const q = estado.questoes[i], r = estado.respostas[q.id]; b.className = "numero";
      if (i === estado.indice) b.classList.add("atual");
      if (r !== undefined) b.classList.add("respondida");
      if (estado.finalizado || (estado.modo === "estudo" && r !== undefined)) {
        b.classList.remove("respondida"); b.classList.add(r === q.respostaCorreta ? "correta" : "errada");
      }
    });
  }

  function proxima() {
    if (estado.indice < estado.questoes.length - 1) { estado.indice++; salvar(); renderizar(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else confirmarFinalizacao();
  }

  function anterior() { if (estado.indice > 0) { estado.indice--; salvar(); renderizar(); } }

  function limpar() {
    const q = estado.questoes[estado.indice];
    if (estado.modo === "estudo" && estado.respostas[q.id] !== undefined) return avisar("No modo estudo, uma resposta já corrigida não pode ser apagada.");
    delete estado.respostas[q.id]; salvar(); renderizar();
  }

  function marcar() {
    const id = estado.questoes[estado.indice].id, pos = estado.marcadas.indexOf(id);
    pos >= 0 ? estado.marcadas.splice(pos, 1) : estado.marcadas.push(id); salvar(); renderizar();
  }

  function confirmarFinalizacao() {
    const faltam = estado.questoes.length - Object.keys(estado.respostas).length;
    const msg = faltam ? `Ainda existem ${faltam} questão(ões) sem resposta. Finalizar mesmo assim?` : "Finalizar e ver o resultado?";
    if (confirm(msg)) finalizar();
  }

  function finalizar() { estado.finalizado = true; pararCronometro(); salvar(); mostrarResultado(); }

  function calcular() {
    let acertos = 0, erros = 0, branco = 0;
    estado.questoes.forEach(q => {
      const r = estado.respostas[q.id];
      if (r === undefined) branco++; else if (r === q.respostaCorreta) acertos++; else erros++;
    });
    const total = estado.questoes.length, percentual = total ? Math.round(acertos / total * 100) : 0;
    return { total, acertos, erros, branco, percentual };
  }

  function mostrarResultado() {
    const r = calcular(); el.inicio.hidden = true; el.simulado.hidden = true; el.resultado.hidden = false;
    el.resultadoTitulo.textContent = r.percentual >= 90 ? "Excelente desempenho!" : r.percentual >= 75 ? "Muito bom resultado!" : r.percentual >= 60 ? "Você está no caminho certo." : "Vamos reforçar a revisão.";
    el.resultadoMensagem.textContent = r.percentual >= 75 ? "Revise os pontos errados para avançar ainda mais." : "Use a revisão abaixo para identificar os assuntos que precisam de mais atenção.";
    el.percentual.textContent = `${r.percentual}%`; el.circulo.style.setProperty("--p", r.percentual);
    el.total.textContent = r.total; el.acertos.textContent = r.acertos; el.erros.textContent = r.erros; el.branco.textContent = r.branco; el.tempoFinal.textContent = formatarTempo(estado.segundos);
    renderizarRevisao("todas"); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderizarRevisao(filtro) {
    el.listaRevisao.innerHTML = "";
    const lista = estado.questoes.filter(q => filtro === "erradas" ? estado.respostas[q.id] !== q.respostaCorreta : filtro === "marcadas" ? estado.marcadas.includes(q.id) : true);
    if (!lista.length) { el.listaRevisao.innerHTML = "<p>Nenhuma questão encontrada neste filtro.</p>"; return; }
    lista.forEach(q => {
      const r = estado.respostas[q.id], correta = textoAlternativa(q, q.respostaCorreta), usuario = r === undefined ? "Não respondida" : textoAlternativa(q, r);
      const item = document.createElement("article"); item.className = "item-revisao";
      item.innerHTML = `<strong>${escapar(q.materia)} · ${r === q.respostaCorreta ? "Correta" : r === undefined ? "Em branco" : "Errada"}</strong><p>${escapar(extrairTexto(q.enunciado))}</p><small><b>Sua resposta:</b> ${escapar(usuario)}<br><b>Resposta correta:</b> ${escapar(correta)}<br><b>Comentário:</b> ${escapar(q.comentario || "Sem comentário.")}</small>`;
      el.listaRevisao.appendChild(item);
    });
  }

  function textoAlternativa(q, original) { return q.alternativas.find(a => a.original === original)?.texto || "Alternativa não encontrada"; }

  function salvar() {
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify({ questoes: estado.questoes, indice: estado.indice, respostas: estado.respostas, marcadas: estado.marcadas, modo: estado.modo, segundos: estado.segundos, finalizado: estado.finalizado }));
    el.continuar.hidden = false;
  }

  function carregar() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)); if (!dados?.questoes?.length) return;
      Object.assign(estado, dados); estado.finalizado ? mostrarResultado() : abrirSimulado();
    } catch { avisar("Não foi possível carregar o progresso salvo."); }
  }

  function reiniciar() {
    if (!confirm("Apagar o progresso e reiniciar?")) return;
    localStorage.removeItem(CHAVE_PROGRESSO); pararCronometro(); location.reload();
  }

  function iniciarCronometro() { pararCronometro(); estado.intervalo = setInterval(() => { estado.segundos++; el.tempo.textContent = formatarTempo(estado.segundos); if (estado.segundos % 10 === 0) salvar(); }, 1000); }
  function pararCronometro() { if (estado.intervalo) clearInterval(estado.intervalo); estado.intervalo = null; }
  function formatarTempo(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60; return (h ? `${String(h).padStart(2,"0")}:` : "") + `${String(m).padStart(2,"0")}:${String(seg).padStart(2,"0")}`; }
  function escapar(v) { return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
  function extrairTexto(html) { const d = document.createElement("div"); d.innerHTML = html; return d.textContent?.trim() || ""; }
  function avisar(msg) { el.aviso.textContent = msg; el.aviso.classList.add("visivel"); setTimeout(() => el.aviso.classList.remove("visivel"), 2500); }

  el.iniciar.addEventListener("click", iniciarNovo); el.continuar.addEventListener("click", carregar); el.tema.addEventListener("click", () => { const novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro"; document.documentElement.dataset.tema = novo; localStorage.setItem(CHAVE_TEMA, novo); });
  el.anterior.addEventListener("click", anterior); el.proxima.addEventListener("click", proxima); el.limpar.addEventListener("click", limpar); el.revisao.addEventListener("click", marcar); el.finalizar.addEventListener("click", confirmarFinalizacao); el.imprimir.addEventListener("click", () => print()); el.reiniciar.addEventListener("click", reiniciar);
  $$(".filtro").forEach(b => b.addEventListener("click", () => { $$(".filtro").forEach(x => x.classList.remove("ativo")); b.classList.add("ativo"); renderizarRevisao(b.dataset.filtro); }));

  document.documentElement.dataset.tema = localStorage.getItem(CHAVE_TEMA) || (matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro");
  el.totalInicial.textContent = `${DADOS_SIMULADO.questoes.length} questões`; el.continuar.hidden = !localStorage.getItem(CHAVE_PROGRESSO);
})();