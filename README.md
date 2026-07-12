# Simulador de Estudos

Sistema responsivo de questões feito com HTML, CSS e JavaScript.

## Arquivos

- `index.html`: estrutura da interface.
- `estilo.css`: aparência e responsividade.
- `script.js`: funcionamento, correção, revisão e salvamento local.
- `questoes.js`: conteúdo das questões, alternativas, gabarito e comentários.

## Como criar um novo simulado

Edite apenas `questoes.js` e altere o campo `identificador` para um valor único.

No campo `respostaCorreta`:

- `0` = A
- `1` = B
- `2` = C
- `3` = D
- `4` = E

## Publicação

O projeto pode ser publicado pelo GitHub Pages usando a branch `main` e a pasta `/ (root)`.

## Dados

Nesta versão, o progresso fica salvo no `localStorage` do navegador. A integração com Supabase será adicionada em uma próxima etapa.