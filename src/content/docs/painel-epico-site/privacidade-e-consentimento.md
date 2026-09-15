---
title: Peça consentimento e cuide da privacidade
description: Como operar a aba Privacidade do painel Épico Site, com página de privacidade, banner de consentimento e controle de vídeos e incorporações de terceiros.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
sidebar:
  order: 9
---

A aba **Privacidade** atende regras como a LGPD no Brasil e o RGPD na Europa,
pedindo consentimento explícito antes de rastrear o comportamento do visitante
ou carregar conteúdo de terceiros.

Abra **Épico Site → Configurações** e escolha a aba **Privacidade**.

## Página de privacidade

O campo **Página de privacidade** escolhe a página do WordPress com as
declarações de privacidade do site. É a mesma configuração de
Configurações e Privacidade do WordPress, e o painel mantém as duas em
sincronia. O link para a página aparece no site publicado, e a página precisa
estar publicada para o link funcionar.

## Banner de consentimento

Ative **Ativar o banner de consentimento** para mostrar um banner que pede ao
visitante as escolhas de rastreamento. O banner é a chave que libera as
integrações do Google Tag Manager, Google Analytics e Meta Pixel na aba
[Integrações](/painel-epico-site/integracoes/). Com o banner desligado, essas
integrações ficam ocultas.

As opções do banner:

- **Mensagem do banner** é o texto principal. Deixe em branco para usar a
  mensagem padrão, que menciona cookies, análise de tráfego e o link para a
  política de privacidade.
- **Texto do botão "aceitar"** e **Texto do botão "recusar"** mudam os botões,
  com padrões "Eu aceito" e "Eu recuso".
- **Posição do banner no layout do site** escolhe entre cantos, centro,
  largura total do cabeçalho e largura total do rodapé.
- **Escurecer a tela** escurece o fundo abaixo do banner para destacá-lo.
- **Cores do banner** escolhem a cor de destaque a partir de uma cor da marca,
  com fundo e texto herdando a Identidade visual. A opção Personalizar revela
  as três cores avançadas.
- **Lembrar o consentimento por (dias)** define por quanto tempo a escolha
  vale antes de o banner reaparecer, de 1 a 365 dias, com padrão de 365.

## Consentimento para incorporações

Ative **Ativar o pedido de consentimento para incorporações** para que vídeos
e outros conteúdos de terceiros só carreguem após consentimento. Funciona com
vídeos do YouTube, Vimeo, VideoPress e TED, além de arquivos de vídeo e áudio
hospedados fora do site. Sem o aceite, aparece um quadro no lugar do
conteúdo:

- **Mensagem de consentimento da incorporação** é o texto do quadro, com uma
  mensagem padrão que explica o bloqueio de privacidade.
- **Texto do botão de consentimento da incorporação** muda o botão, cujo
  padrão "Abrir preferências" abre o painel de preferências do visitante.
- **Cores do conteúdo incorporado** seguem o modelo do banner e podem ser
  personalizadas de forma independente.

## A experiência do visitante

O banner oferece aceitar, recusar e abrir as preferências individuais por
categoria: análise, marketing e mídia externa. A escolha fica gravada em um
cookie do próprio site, pelo período configurado.

Quando você muda a política, como ativar uma nova integração ou trocar a
mensagem do banner, o consentimento anterior expira e o banner reaparece
para nova confirmação. O visitante também pode reabrir as preferências a
qualquer momento pelo gatilho **Preferências de privacidade**, que permanece
disponível no site enquanto houver recurso ligado que dependa de
consentimento.

## Relacionados

- [Conecte ferramentas de marketing e análise](/painel-epico-site/integracoes/)
- [Adicione código personalizado ao site](/painel-epico-site/codigo-extra/)
