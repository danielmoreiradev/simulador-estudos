# Simulador de Estudos

Aplicação web pessoal para resolução de questões, acompanhamento de desempenho e revisão de conteúdos voltados a concursos.

## Funcionalidades

- autenticação de acesso;
- simulados em modo estudo e modo prova;
- correção, revisão e marcação de questões;
- salvamento de progresso;
- histórico de tentativas e respostas;
- painel com médias, comparativos e pontos de atenção;
- interface responsiva para computador e celular.

## Organização geral

- `index.html`: estrutura das telas e componentes;
- `estilo.css`: estilos principais e responsividade;
- `supabase.css`: estilos complementares de autenticação e painel;
- `script.js`: regras do simulador e interação com as questões;
- `integracao-supabase.js`: autenticação, sincronização, histórico e painel;
- `questoes.js`: conteúdo do simulado ativo;
- `INSTRUCOES_PARA_IA.md`: regras obrigatórias para alterações assistidas;
- `ARQUITETURA.md`: visão técnica e dependências internas.

## Desenvolvimento

Antes de modificar o projeto, leia `INSTRUCOES_PARA_IA.md` e `ARQUITETURA.md`.

Mudanças devem preservar autenticação, sincronização, histórico, compatibilidade com dispositivos móveis e isolamento dos dados por usuário.

## Segurança

O projeto não deve conter senhas, chaves administrativas, tokens privados, credenciais de banco ou dados pessoais sensíveis.

Configurações públicas necessárias ao funcionamento do navegador não substituem as regras de autorização aplicadas no serviço de dados.

## Uso

Projeto de uso pessoal. Alterações devem ser testadas antes da publicação.