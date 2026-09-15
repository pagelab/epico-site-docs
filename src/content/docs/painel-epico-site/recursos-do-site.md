---
title: Ative e desative recursos do site
description: Como operar a aba Recursos do painel Épico Site, com modo escuro, compartilhamento, leitura em voz alta, comentários, blocos e módulos do editor.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
sidebar:
  order: 4
---

A aba **Recursos** liga e desliga recursos do site publicado e os componentes
disponíveis no editor de blocos. Recursos desligados não são carregados, o que
mantém o editor rápido. Ative apenas o que o seu site realmente usa.

Abra **Épico Site → Configurações** e escolha a aba **Recursos**.

## Modo escuro

O interruptor **Alternador do modo escuro** decide se o visitante pode trocar
entre tema claro e escuro. Desligado, o site permanece no tema claro. Vem
desligado por padrão. O controle aparece no cabeçalho do site quando o tema do
site oferece o componente.

## Compartilhamento

O interruptor **Botões de compartilhamento** ativa os botões de
compartilhamento junto ao conteúdo dos posts:

- **Plataformas disponíveis** escolhe as redes oferecidas, como WhatsApp,
  Copiar link, X, Facebook, LinkedIn, Telegram, Threads, Pinterest e o
  compartilhamento nativo do aparelho. Uma lista vazia é uma escolha válida e
  remove os botões.
- **Selecione onde inserir** posiciona os botões acima, abaixo ou nas duas
  posições do conteúdo.
- **Fixar barra de compartilhamento** mantém a barra fixa no topo da janela
  enquanto o visitante rola a página.

## Leitura em voz alta

O interruptor **Ler posts em voz alta** ativa um botão de áudio que lê o
conteúdo do post em português, usando a voz do próprio navegador. Vem ligado
por padrão. Em navegadores sem voz em português compatível, o controle
simplesmente não aparece. O campo **Rótulo de botão** muda o texto do botão,
cujo padrão é "Ouvir este artigo".

## Visualização de posts

O interruptor **Mostrar o contador de visualizações** exibe o número de
visualizações ao lado dos botões de compartilhar e ouvir:

- **Tag do site no Web Analytics** informa o identificador da propriedade do
  Cloudflare Web Analytics que alimenta o contador. A contagem cobre os
  últimos 90 dias do endereço público declarado na aba Publicação e é
  atualizada a cada publicação.
- **Selecione onde inserir** escolhe se o contador entra na barra de cima ou
  na de baixo do artigo.

Sem medição configurada, o contador não aparece.

## Comentários

O interruptor **Comentários nos posts** ativa o formulário de comentários
gerenciado pelo próprio WordPress. Cada post segue a configuração de discussão
do WordPress, com decisão por post na lateral do editor. A proteção anti-robô
usa as chaves do Cloudflare Turnstile configuradas na aba Geração de leads, e
a moderação usa as regras nativas do WordPress. Um comentário aprovado aparece
no site na publicação seguinte.

## Conversa nas redes

O interruptor **Apontar comentários para uma publicação nas redes** troca o
formulário do site por um convite para comentar em uma publicação sua no
Instagram, Facebook, TikTok, YouTube, Threads ou X. Em cada post, informe a
URL da publicação na lateral do editor. O recurso é apenas um link, sem
formulário nem coleta de dados, e pode conviver com os comentários no site.

## Página de linha do tempo

O campo **Página de linha do tempo** escolhe a página que hospeda o arquivo
cronológico do site, com as publicações organizadas por data e um calendário
filtrável. O conteúdo dessa página não é renderizado, importam apenas o
título e o endereço dela. Escolha uma página publicada.

## Módulos e blocos do editor

- Em **Módulos de monetização**, o **Módulo de serviços** traz o tipo de
  conteúdo Serviços com o seletor de ícones. Vem ligado por padrão.
- Em **Blocos de seção**, os interruptores controlam as seções prontas
  disponíveis no editor, como a seção de abertura **Hero** e a seção
  **Depoimentos**.
- Em **Blocos de posts**, os interruptores ativam blocos para usar dentro dos
  posts: **Autoria**, **Breadcrumbs**, **Post Meta**, **Redes Sociais** e
  **Tópicos**. Vêm desligados por padrão. Ative apenas os que for usar.

Desligar um bloco remove o componente do editor. Páginas já publicadas que
usam o bloco continuam no ar até a próxima publicação do site.

## Quando a alteração aparece no site

Salve com o botão **Salvar** e aguarde a publicação indicada na barra
superior do WordPress. Os efeitos desta aba aparecem no site publicado e no
editor depois dessa publicação.
