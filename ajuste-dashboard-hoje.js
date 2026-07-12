(() => {
  "use strict";
  const URL="https://otvnhahpwblgxevzrsra.supabase.co",KEY="sb_publishable_OpslVSpJubk6OCLQzand-A_KkeLfQ6r";
  if(!window.supabase?.createClient)return;
  const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"simulador_sessao"}}),$=s=>document.querySelector(s);
  const inicioSemana=d=>{const x=new Date(d),dia=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-dia);return x};
  const duracao=s=>{s=Number(s||0);if(s<3600)return`${Math.round(s/60)} min`;return`${Math.floor(s/3600)}h ${Math.round((s%3600)/60)}min`};
  async function atualizar(){const{data:s}=await db.auth.getSession();if(!s.session?.user)return;const ini=inicioSemana(new Date()),ant=new Date(ini);ant.setDate(ant.getDate()-7);const{data,error}=await db.from("tentativas_simulado").select("total,acertos,tempo_segundos,concluido_em").gte("concluido_em",ant.toISOString()).order("concluido_em");if(error)return;const lista=data||[],atual=lista.filter(x=>new Date(x.concluido_em)>=ini),anterior=lista.filter(x=>new Date(x.concluido_em)>=ant&&new Date(x.concluido_em)<ini),soma=(a,c)=>a.reduce((n,x)=>n+Number(x[c]||0),0),q=soma(atual,"total"),a=soma(atual,"acertos"),qAnt=soma(anterior,"total"),aAnt=soma(anterior,"acertos"),media=q?Math.round(a/q*100):0,mediaAnt=qAnt?Math.round(aAnt/qAnt*100):0;
    if($("#kpi-questoes"))$("#kpi-questoes").textContent=q;
    if($("#kpi-media"))$("#kpi-media").textContent=`${media}%`;
    if($("#kpi-tempo"))$("#kpi-tempo").textContent=duracao(soma(atual,"tempo_segundos"));
    if($("#kpi-questoes-comp"))$("#kpi-questoes-comp").textContent=qAnt?`${Math.round((q-qAnt)/qAnt*100)>=0?"+":""}${Math.round((q-qAnt)/qAnt*100)}% vs. semana anterior`:"Sem comparação ainda";
    if($("#kpi-media-comp"))$("#kpi-media-comp").textContent=qAnt?`${media-mediaAnt>=0?"+":""}${media-mediaAnt} p.p. vs. semana anterior`:"Sem comparação ainda";
    if($("#resumo-periodo"))$("#resumo-periodo").textContent=q?`Nesta semana, incluindo hoje, você respondeu ${q} questões com média de ${media}% de acertos.`:"Comece um simulado para formar sua análise semanal.";
    const nomes=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],g=$("#grafico-semanal");if(g)g.innerHTML=nomes.map((n,i)=>{const d=new Date(ini);d.setDate(d.getDate()+i);const f=new Date(d);f.setDate(f.getDate()+1);const itens=atual.filter(t=>new Date(t.concluido_em)>=d&&new Date(t.concluido_em)<f),tq=soma(itens,"total"),ta=soma(itens,"acertos"),p=tq?Math.round(ta/tq*100):0;return`<div class="barra-dia" title="${tq} questões · ${p}%"><div class="barra-dia__coluna"><span class="barra-dia__valor" style="height:${p}%"></span></div><small>${n}<br>${p}%</small></div>`}).join("");
  }
  window.addEventListener("dashboard:carregar",()=>setTimeout(atualizar,500));window.addEventListener("simulador:finalizado",()=>setTimeout(atualizar,900));db.auth.onAuthStateChange((_e,s)=>{if(s?.user)setTimeout(atualizar,700)});setTimeout(atualizar,900);
})();