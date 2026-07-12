# Instruções para assistentes de IA

Este arquivo define regras obrigatórias para qualquer IA ou automação que altere este projeto.

## Princípio geral

Faça somente a mudança solicitada, com o menor impacto possível. Não reorganize, renomeie ou reescreva partes não relacionadas.

Antes de alterar qualquer arquivo:

1. leia este documento;
2. leia `ARQUITETURA.md`;
3. inspecione os arquivos envolvidos;
4. identifique dependências entre interface, simulador e persistência;
5. preserve o comportamento existente que não faça parte da solicitação.

## Arquivos e responsabilidades

- `questoes.js`: conteúdo do simulado ativo;
- `script.js`: funcionamento do simulado;
- `integracao-supabase.js`: autenticação, persistência, histórico e painel;
- `index.html`: estrutura e componentes da interface;
- `estilo.css`: estilos gerais;
- `supabase.css`: estilos complementares;
- `README.md`: apresentação pública e genérica;
- `ARQUITETURA.md`: documentação técnica interna sem segredos.

Não mova responsabilidades entre arquivos sem uma justificativa técnica clara.

## Inclusão ou correção de questões

Ao alterar apenas o conteúdo de um simulado, modifique preferencialmente somente `questoes.js`.

Regras obrigatórias:

- preserve o formato atual dos objetos;
- mantenha identificadores de questões únicos;
- não altere o identificador de um simulado já utilizado;
- não remova campos utilizados pelo histórico;
- confira se `respostaCorreta` aponta para a alternativa correta;
- não insira HTML não confiável, scripts, eventos ou conteúdo remoto;
- preserve acentuação e codificação UTF-8.

## Alterações no simulador

Ao modificar `script.js`:

- preserve iniciar, continuar, responder, revisar, finalizar e reiniciar;
- preserve o salvamento do estado completo;
- mantenha compatibilidade com questões e alternativas embaralhadas;
- não altere nomes de campos persistidos sem atualizar a integração e planejar compatibilidade;
- não remova eventos usados pela camada de sincronização;
- preserve estados de acerto, erro, branco e marcação para revisão.

## Alterações no painel e persistência

Ao modificar `integracao-supabase.js`:

- nunca remova autenticação obrigatória;
- nunca adicione cadastro público de usuários;
- nunca exponha credenciais privadas;
- preserve o isolamento de dados pelo usuário autenticado;
- preserve progresso atual, tentativas e histórico detalhado;
- não transforme histórico em registro único sobrescrito;
- evite duplicar tentativas durante sincronizações repetidas;
- trate falhas de rede sem apagar dados locais ou remotos;
- não confie apenas na interface para autorização;
- mantenha mensagens de erro genéricas no login.

## Banco de dados

Qualquer alteração de banco exige revisão de segurança.

É proibido:

- desativar RLS;
- criar política que permita acesso indiscriminado;
- conceder acesso ao papel anônimo;
- usar chave administrativa no frontend;
- criar função privilegiada apenas para contornar permissões;
- apagar ou renomear tabelas e colunas existentes sem plano de migração;
- eliminar dados históricos;
- aplicar permissões como `TRUNCATE`, `TRIGGER` ou `REFERENCES` sem necessidade comprovada.

Ao criar tabela nova:

- associe cada registro ao usuário;
- ative e force RLS;
- crie políticas de propriedade;
- conceda somente as operações necessárias;
- valide as permissões efetivas após a mudança;
- execute verificadores de segurança e desempenho.

## Interface e estilos

Ao alterar HTML ou CSS:

- preserve acessibilidade básica, foco, rótulos e navegação por teclado;
- teste larguras de celular, tablet e desktop;
- preserve tema claro e escuro;
- não remova elementos usados por JavaScript sem atualizar todos os seletores;
- não use estilos inline sem necessidade;
- não introduza bibliotecas externas apenas por conveniência;
- preserve a política de segurança de conteúdo.

## Segurança do repositório

Nunca grave no repositório:

- senhas;
- tokens pessoais;
- chave administrativa ou secreta;
- credenciais de banco;
- arquivos de ambiente reais;
- dados pessoais sensíveis;
- logs com credenciais ou sessões.

Uma chave explicitamente destinada ao navegador pode aparecer no frontend, mas toda proteção deve continuar sendo garantida por autenticação, autorização e regras de acesso no servidor.

## Dependências externas

- não altere versões sem verificar compatibilidade;
- prefira versões fixas;
- não adicione dependência sem necessidade;
- revise a política de segurança de conteúdo ao alterar origens externas;
- nunca desative proteções do navegador para fazer uma dependência funcionar.

## Processo obrigatório de alteração

1. Entenda o pedido e limite o escopo.
2. Leia os arquivos afetados por inteiro.
3. Faça mudanças pequenas e coerentes.
4. Verifique seletores, nomes de campos e dependências.
5. Teste autenticação e saída.
6. Teste início, resposta, revisão, finalização e reinício.
7. Teste salvamento e recuperação do progresso.
8. Teste criação de histórico sem duplicação.
9. Teste painel e filtros com zero, um e vários registros.
10. Teste interface em celular e desktop.
11. Revise se algum segredo ou detalhe sensível foi incluído.
12. Documente somente mudanças relevantes.

## Proibições adicionais

Não faça refatoração ampla junto com uma correção pequena.

Não altere múltiplos arquivos quando uma mudança isolada resolver.

Não invente tabelas, campos, seletores ou funções sem verificar o código e o banco atuais.

Não declare que algo foi testado ou publicado sem verificação real.

Não apague dados existentes para corrigir incompatibilidades.

## Critério de conclusão

Uma alteração só está concluída quando:

- o pedido foi atendido;
- o fluxo anterior continua funcionando;
- os dados continuam persistidos;
- não houve redução de segurança;
- não foram introduzidos segredos;
- o resultado foi verificado de forma compatível com o escopo.