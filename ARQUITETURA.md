# Arquitetura do sistema

Este documento apresenta a estrutura técnica necessária para manutenção segura do projeto. Não contém credenciais, segredos ou instruções administrativas.

## Visão geral

A aplicação é um frontend estático executado no navegador. Ela possui três áreas principais:

1. painel inicial com métricas e recomendações;
2. simulador de questões;
3. histórico de tentativas e respostas.

O acesso ao conteúdo depende de uma sessão autenticada. O navegador mantém uma cópia temporária do progresso para tolerar falhas de conexão, enquanto o serviço de dados preserva progresso, tentativas e histórico para acesso em diferentes dispositivos.

## Camadas

### Interface

Responsável por navegação, componentes, formulários, dashboard, simulado, resultado e histórico.

Arquivos principais:

- `index.html`
- `estilo.css`
- `supabase.css`

A interface depende de IDs e classes consumidos pelos arquivos JavaScript. Remover ou renomear elementos exige atualização coordenada dos seletores.

### Domínio do simulador

Responsável por:

- iniciar uma tentativa;
- copiar e embaralhar questões;
- registrar respostas;
- marcar revisão;
- calcular acertos, erros e questões em branco;
- controlar cronômetro;
- renderizar correção e revisão;
- reiniciar o progresso atual.

Arquivo principal:

- `script.js`

O estado corrente contém, no mínimo:

- questões da tentativa;
- índice atual;
- respostas;
- questões marcadas;
- modo de execução;
- tempo decorrido;
- situação de finalização.

Mudanças nesse formato afetam sincronização e compatibilidade com progressos existentes.

### Conteúdo

Arquivo principal:

- `questoes.js`

Cada questão deve preservar:

- identificador;
- matéria;
- assunto;
- origem;
- enunciado;
- alternativas;
- resposta correta;
- comentário.

O identificador do simulado deve permanecer estável após começar a produzir histórico.

### Autenticação e persistência

Arquivo principal:

- `integracao-supabase.js`

Responsabilidades:

- criar o cliente público do serviço;
- restaurar e renovar sessão;
- bloquear o conteúdo sem autenticação;
- realizar login e saída;
- sincronizar progresso corrente;
- persistir respostas atuais;
- registrar tentativas concluídas;
- registrar o histórico detalhado das questões;
- carregar métricas para o dashboard;
- carregar e filtrar o histórico.

A autorização real deve ser garantida no servidor por políticas de propriedade. Ocultar elementos da interface não é controle de acesso.

## Persistência

O sistema diferencia dois tipos de dado.

### Estado corrente

Representa o simulado em andamento. Pode ser atualizado conforme o usuário responde ou navega.

Inclui:

- posição atual;
- respostas atuais;
- marcações para revisão;
- modo;
- tempo;
- estado de conclusão.

Existe uma cópia local de contingência, mas o banco é a origem usada para sincronização entre dispositivos.

### Histórico imutável de tentativa

Ao finalizar, o sistema cria uma tentativa independente e registra cada questão relacionada a ela.

Essa separação é essencial para:

- comparativos semanais e mensais;
- evolução de desempenho;
- análises por matéria e assunto;
- histórico completo;
- preservação de respostas antigas;
- prevenção de sobrescrita dos resultados anteriores.

Uma tentativa concluída não deve ser reutilizada como progresso corrente.

## Modelo conceitual dos dados

### Progresso

Um registro por usuário e simulado ativo.

### Respostas correntes

Um registro por usuário, simulado e questão, usado durante a tentativa em andamento.

### Resultados resumidos

Registros com totais e percentuais de conclusões.

### Tentativas

Um registro independente para cada conclusão, contendo data, duração, modo e totais.

### Histórico de questões

Um registro por questão de cada tentativa, contendo matéria, assunto, resposta do usuário, resposta correta, resultado e marcação para revisão.

## Fluxo de autenticação

1. A página é carregada com o conteúdo principal bloqueado.
2. O cliente tenta recuperar uma sessão válida.
3. Sem sessão, somente o formulário de acesso permanece disponível.
4. Após login válido, o conteúdo é liberado.
5. O progresso remoto é recuperado e combinado cuidadosamente com eventual cópia local.
6. Ao sair, o conteúdo volta a ser bloqueado.

Novos cadastros não fazem parte do frontend.

## Fluxo de uma tentativa

1. O usuário abre a área de simulado.
2. Escolhe modo e opções de embaralhamento.
3. O estado da tentativa é criado.
4. Cada interação atualiza o estado corrente.
5. O estado é salvo localmente e sincronizado.
6. Ao finalizar, são calculados os totais.
7. Uma tentativa é criada.
8. O histórico detalhado das questões é inserido com vínculo à tentativa.
9. O dashboard passa a considerar os novos dados.
10. Um reinício remove apenas o progresso corrente, não o histórico concluído.

## Fluxo do dashboard

O painel consulta tentativas e histórico pertencentes ao usuário e deriva:

- volume de questões;
- média de acertos;
- tempo estudado;
- frequência de estudo;
- comparação entre períodos;
- desempenho por matéria;
- assuntos com maior incidência de erro;
- últimas tentativas;
- dicas baseadas nos resultados.

Métricas devem tratar ausência de dados sem gerar divisões inválidas ou mensagens enganosas.

## Segurança

Controles obrigatórios:

- autenticação antes de liberar o conteúdo;
- regras de acesso por proprietário;
- ausência de privilégios para acesso anônimo às tabelas pessoais;
- chave administrativa proibida no navegador;
- cadastro público desabilitado;
- mensagens de login sem enumeração de usuários;
- política de segurança de conteúdo preservada;
- nenhuma credencial privada no repositório;
- permissões de banco reduzidas ao necessário.

A URL do serviço e uma chave pública destinada ao navegador não são tratadas como segredo. Elas somente podem ser usadas com segurança quando autorização e políticas do banco estão corretamente configuradas.

## Dependências críticas

- IDs do HTML usados pelos scripts;
- formato de `DADOS_SIMULADO`;
- identificador estável do simulado;
- nomes dos campos do estado local;
- nomes e tipos das colunas do banco;
- eventos de autenticação;
- regras de propriedade dos registros;
- política de segurança de conteúdo e origens externas permitidas.

## Compatibilidade

Alterações devem considerar:

- sessões já existentes;
- progresso local antigo;
- progresso remoto atual;
- tentativas concluídas;
- uso simultâneo em dispositivos diferentes;
- modo claro e escuro;
- telas pequenas;
- ausência temporária de conexão.

## Checklist técnico mínimo

Após qualquer mudança relevante, verificar:

- carregamento sem erros no console;
- conteúdo bloqueado sem sessão;
- login e saída;
- abertura das três áreas;
- início e continuidade do simulado;
- respostas, revisão e cronômetro;
- finalização e reinício;
- sincronização após recarregar;
- criação única de tentativa;
- histórico detalhado;
- dashboard com dados e sem dados;
- responsividade;
- ausência de segredos no diff.