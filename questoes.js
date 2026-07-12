const DADOS_SIMULADO = {
  titulo: "Simulado IBGE — Informática (nível médio)",
  identificador: "simulado-ibge-informatica-v2",
  questoes: [
    {
      id: 1,
      materia: "Língua Portuguesa",
      assunto: "Interpretação de texto",
      origem: "Questão demonstrativa",
      enunciado: "<p>Leia a frase:</p><p><strong>“A persistência transforma pequenas ações em grandes resultados.”</strong></p><p>Qual ideia é defendida?</p>",
      alternativas: ["Resultados importantes dependem apenas de sorte.", "Pequenas ações contínuas podem produzir grandes resultados.", "Persistir significa repetir sempre o mesmo erro.", "Grandes resultados surgem de forma imediata.", "A persistência não influencia os resultados."],
      respostaCorreta: 1,
      comentario: "A frase destaca que a continuidade de pequenas ações pode gerar resultados relevantes ao longo do tempo."
    },
    {
      id: 2,
      materia: "Matemática",
      assunto: "Porcentagem",
      origem: "Questão demonstrativa",
      enunciado: "<p>Uma pessoa acertou 18 questões de uma prova com 20 questões.</p><p>Qual foi o percentual de acertos?</p>",
      alternativas: ["80%", "85%", "90%", "92%", "95%"],
      respostaCorreta: 2,
      comentario: "O cálculo é 18 ÷ 20 = 0,9. Multiplicando por 100, temos 90%."
    },
    {
      id: 3,
      materia: "Informática",
      assunto: "Segurança digital",
      origem: "Questão demonstrativa",
      enunciado: "<p>Qual prática ajuda a aumentar a segurança de uma conta online?</p>",
      alternativas: ["Usar a mesma senha em todos os serviços.", "Compartilhar a senha com pessoas conhecidas.", "Ativar a autenticação em dois fatores.", "Salvar a senha em páginas desconhecidas.", "Desativar todas as atualizações de segurança."],
      respostaCorreta: 2,
      comentario: "A autenticação em dois fatores adiciona uma segunda etapa de verificação e reduz o risco de acesso indevido."
    },
    {
      id: 4,
      materia: "Raciocínio Lógico",
      assunto: "Sequências",
      origem: "Questão demonstrativa",
      enunciado: "<p>Observe a sequência: <strong>2, 4, 8, 16, ___</strong></p><p>Qual número completa corretamente a sequência?</p>",
      alternativas: ["18", "20", "24", "30", "32"],
      respostaCorreta: 4,
      comentario: "Cada número é o dobro do anterior. Portanto, 16 × 2 = 32."
    },
    {
      id: 5,
      materia: "Conhecimentos Gerais",
      assunto: "Cidadania",
      origem: "Questão demonstrativa",
      enunciado: "<p>Em uma democracia, o exercício da cidadania inclui:</p>",
      alternativas: ["Participar da vida social e conhecer direitos e deveres.", "Ignorar as decisões que afetam a comunidade.", "Cumprir apenas os deveres considerados convenientes.", "Evitar qualquer forma de participação pública.", "Transferir todos os deveres para outras pessoas."],
      respostaCorreta: 0,
      comentario: "A cidadania envolve participação social, consciência de direitos e cumprimento de deveres."
    },
    {
      id: 6,
      materia: "Informática",
      assunto: "Windows 10 e 11",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>No sistema operacional Windows, assinale a alternativa que apresenta corretamente a função do atalho <strong>Ctrl + Shift + Esc</strong>.</p>",
      alternativas: ["Abrir diretamente o Gerenciador de Tarefas.", "Exibir a janela Executar.", "Bloquear a sessão do usuário.", "Abrir o Explorador de Arquivos.", "Alternar entre as janelas abertas."],
      respostaCorreta: 0,
      comentario: "O atalho Ctrl + Shift + Esc abre diretamente o Gerenciador de Tarefas do Windows."
    },
    {
      id: 7,
      materia: "Informática",
      assunto: "Microsoft Word",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Em uma versão recente do Microsoft Word em português, o recurso utilizado para reproduzir rapidamente a formatação de um trecho em outro é denominado:</p>",
      alternativas: ["Controlar Alterações.", "Pincel de Formatação.", "Localizar e Substituir.", "Mala Direta.", "Quebra de Seção."],
      respostaCorreta: 1,
      comentario: "O Pincel de Formatação copia características como fonte, tamanho, cor, bordas e alinhamento para outro trecho."
    },
    {
      id: 8,
      materia: "Informática",
      assunto: "Microsoft Excel",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Considere que as células A1, A2 e A3 contêm, respectivamente, os valores 10, 20 e 30. No Microsoft Excel, o resultado da fórmula <strong>=MÉDIA(A1:A3)</strong> será:</p>",
      alternativas: ["10", "20", "30", "60", "600"],
      respostaCorreta: 1,
      comentario: "A função MÉDIA soma os valores e divide pela quantidade de células: (10 + 20 + 30) ÷ 3 = 20."
    },
    {
      id: 9,
      materia: "Informática",
      assunto: "Microsoft Excel",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>No Microsoft Excel, assinale a alternativa que apresenta uma referência absoluta de célula.</p>",
      alternativas: ["A1", "A$1", "$A1", "$A$1", "A1:A10"],
      respostaCorreta: 3,
      comentario: "Na referência absoluta $A$1, tanto a coluna quanto a linha permanecem fixas quando a fórmula é copiada."
    },
    {
      id: 10,
      materia: "Informática",
      assunto: "Internet e navegadores",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Sobre a navegação anônima ou privada oferecida pelos navegadores, analise a afirmativa:</p><p><strong>Ao encerrar a janela privada, o navegador tende a não manter o histórico local das páginas visitadas naquela sessão.</strong></p><p>Assinale a alternativa correta.</p>",
      alternativas: ["A afirmativa está correta, mas esse modo não torna o usuário invisível na internet.", "A afirmativa está incorreta, pois o histórico é sempre mantido.", "A navegação privada impede o provedor de internet de identificar os acessos.", "A navegação privada elimina vírus automaticamente.", "A navegação privada dispensa o uso de conexão segura."],
      respostaCorreta: 0,
      comentario: "A navegação privada reduz registros locais, mas não oculta necessariamente a atividade do provedor, da rede ou dos sites acessados."
    },
    {
      id: 11,
      materia: "Informática",
      assunto: "Correio eletrônico",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Em uma mensagem de correio eletrônico, o campo <strong>Cco</strong> é utilizado para:</p>",
      alternativas: ["Enviar uma cópia visível a todos os destinatários.", "Ocultar dos demais destinatários os endereços incluídos nesse campo.", "Anexar automaticamente uma cópia do arquivo enviado.", "Confirmar obrigatoriamente a leitura da mensagem.", "Impedir o encaminhamento da mensagem."],
      respostaCorreta: 1,
      comentario: "Cco significa cópia oculta. Os destinatários inseridos nesse campo não ficam visíveis aos demais destinatários."
    },
    {
      id: 12,
      materia: "Informática",
      assunto: "Segurança da informação",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Um usuário recebe uma mensagem que imita a comunicação visual de um banco e solicita o preenchimento urgente de senha e dados pessoais em um link. Essa tentativa de fraude é conhecida, principalmente, como:</p>",
      alternativas: ["Backup.", "Firewall.", "Phishing.", "Compactação.", "Desfragmentação."],
      respostaCorreta: 2,
      comentario: "Phishing é uma fraude que tenta enganar a vítima para obter senhas, dados bancários ou outras informações, geralmente por mensagens e páginas falsas."
    },
    {
      id: 13,
      materia: "Informática",
      assunto: "Redes de computadores",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Em redes de computadores, o equipamento responsável por encaminhar pacotes entre redes distintas e normalmente conectar uma rede local à internet é o:</p>",
      alternativas: ["Roteador.", "Teclado.", "Scanner.", "Monitor.", "Estabilizador."],
      respostaCorreta: 0,
      comentario: "O roteador analisa os endereços de rede e encaminha os pacotes entre redes diferentes."
    },
    {
      id: 14,
      materia: "Informática",
      assunto: "Armazenamento e backup",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Assinale a alternativa que descreve corretamente um <strong>backup incremental</strong>.</p>",
      alternativas: ["Copia todos os arquivos em toda execução.", "Copia somente os arquivos alterados desde o último backup, completo ou incremental.", "Copia apenas os arquivos do sistema operacional.", "Mantém os dados somente na memória RAM.", "Exclui automaticamente a cópia anterior antes de iniciar."],
      respostaCorreta: 1,
      comentario: "O backup incremental registra apenas as alterações feitas desde o backup anterior, seja ele completo ou incremental."
    },
    {
      id: 15,
      materia: "Informática",
      assunto: "Conceitos de hardware",
      origem: "Questão inédita — estilo IBFC",
      enunciado: "<p>Sobre memória RAM e armazenamento, assinale a alternativa correta.</p>",
      alternativas: ["A memória RAM mantém os dados mesmo sem energia elétrica.", "O SSD é utilizado exclusivamente para processamento de cálculos.", "A memória RAM armazena temporariamente dados e programas em uso.", "O processador é um dispositivo destinado apenas ao backup.", "O disco rígido substitui integralmente a memória RAM durante a execução dos programas."],
      respostaCorreta: 2,
      comentario: "A memória RAM guarda temporariamente os dados e instruções utilizados pelos programas em execução e perde seu conteúdo quando o equipamento é desligado."
    }
  ]
};
