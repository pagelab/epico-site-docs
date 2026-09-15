---
title: Capture leads com pop-up e chat
description: Como operar a aba Geração de leads do painel Épico Site, com redirecionamento, verificação anti-robô, pop-up modal e janela de chat com WhatsApp e outras plataformas.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
sidebar:
  order: 5
---

A aba **Geração de leads** configura como o site captura contatos. A captura
flui pelos formulários das seções do site e por dois recursos opcionais: um
pop-up modal e uma janela de chat flutuante com plataformas de mensagens.

Abra **Épico Site → Configurações** e escolha a aba **Geração de leads**.

## O que acontece depois do envio

Em **Configurações gerais de captura**, a opção **Redirecionar ao enviar o
formulário** define o desfecho de um envio bem-sucedido:

- **Exibir uma mensagem** mantém o visitante na mesma página e mostra a
  **Mensagem de confirmação padrão após o envio do formulário**, um texto
  curto com formatação simples e links.
- **Página interna** leva o inscrito para a **Página de redirecionamento**
  escolhida entre páginas e posts do site.
- **URL externa** leva para o **endereço completo** digitado no campo de URL
  externa, começando com `https://`. Um destino inválido degrada para a
  mensagem de confirmação, sem quebrar o site.

O interruptor **Ocultar outras capturas após um envio confirmado** esconde os
outros pontos de captura do site no navegador de quem acabou de enviar. Só um
sinal anônimo de conclusão é guardado, nunca os valores do formulário.

## Proteção contra robôs

A seção **Proteção contra bots** usa o Cloudflare Turnstile, o desafio da
Cloudflare alternativo ao CAPTCHA:

1. Ative **Exigir verificação ao enviar o formulário**.
2. Cole a **Chave do site** e a **Chave secreta** do seu widget no painel da
   Cloudflare.
3. Salve o painel e confirme que o widget aparece no site publicado.
4. Só então mantenha o interruptor ativo.

A ordem acima importa. Com o interruptor ligado e as chaves ainda não
utilizáveis, o painel avisa que as capturas continuam aceitando envios sem
verificação, em vez de bloquear tudo. A chave secreta é guardada
criptografada e nunca aparece em rotas públicas do site.

Se o widget não carregar no site, quem administra a infraestrutura precisa
autorizar o endereço `challenges.cloudflare.com` na política de conteúdo do
site publicado.

## Escolha apenas um modo de captura

O pop-up e o chat são mutuamente exclusivos. Ligar um desliga o outro no
painel. Se uma instalação antiga chega com os dois ligados, nenhum dos dois
funciona e o painel mostra o aviso **Escolha apenas um modo de captura**.
Desligue um dos dois e salve.

## Pop-up de captura

Ative **Ativar o pop-up** para exibir um formulário como janela modal. As
opções ficam em três grupos:

### Estilo

- **Posição do pop-up no layout do site** escolhe onde a janela abre na tela.
- **Imagem de destaque** é opcional, aparece ao lado do formulário e é
  recortada para preencher a coluna. Em telas pequenas a imagem é ocultada.

### Configurações gerais

- **Título do pop-up** e **Mensagem do pop-up** formam o conteúdo da janela.
- **Texto do botão do pop-up** muda o botão de envio, com o padrão "Quero
  receber".
- **Ativar campos extras do formulário** revela os **Campos adicionais**:
  Nome, Telefone e Consentimento. O campo E-mail está sempre incluído.

### Opções de exibição

- **Gatilho do pop-up** define se a janela abre após um intervalo de tempo ou
  após rolar a página. O intervalo aceita de 1 a 120 segundos, com padrão de
  15. A profundidade de rolagem aceita de 1 a 100 por cento, com padrão de
  50.
- **Ativar intenção de saída** também abre o pop-up quando o visitante com
  mouse move o ponteiro para fora pelo topo da janela. Vale só em computadores
  e respeita a frequência.
- **Frequência de exibição** controla quantas vezes o pop-up aparece: uma vez
  por sessão do navegador, uma vez por dia ou em cada visualização de página.
- **Exibir o pop-up em celulares** vem ligado por padrão.
- **Selecione onde inserir** restringe as páginas onde o pop-up aparece, e as
  **Exceções** estreitam a lista para posts, páginas ou categorias
  específicos. Em branco, vale para todos os endereços do local escolhido.

## Chat de captura

Ative **Ativar a janela de chat com formulário de captura** para oferecer um
chat flutuante. Além de encaminhar para aplicativos de mensagens, o
formulário do chat registra os dados de quem contatou.

### Configurações gerais

- **Plataformas de chat** é uma lista onde você adiciona até seis
  plataformas: WhatsApp, Instagram, Telegram, TikTok, Snapchat e Messenger. Em
  cada item, escolha a plataforma e informe o **telefone ou nome de
  usuário**. O link da plataforma é montado automaticamente pelo painel a
  partir desses dados, sem URL digitada. No WhatsApp, use o formato
  internacional, com código do país e DDD.
- **Nome de usuário do chat** é o nome do atendente, e **Texto de chamada
  para ação do chat** é a frase do balão, com exemplos como "Atendimento" e
  "Quer receber o nosso eBook exclusivo?".
- **Ativar o recurso de geração de leads** liga as mensagens automáticas de
  saudação e o formulário após o clique no botão do chat. Vem ligado por
  padrão.
- **Texto de saudação** e **Mensagem principal** compõem a conversa
  apresentada antes do formulário.
- **Campos adicionais do formulário** seguem o mesmo modelo do pop-up.
- **Mensagem pré-preenchida do WhatsApp** define o texto da conversa quando
  o lead continua no WhatsApp, com espaços para nome, e-mail e telefone.

### Estilo

- **Posição do chat no layout do site** escolhe o canto do botão flutuante.
- **Cores da captura chat** definem o destaque a partir de uma cor da marca
  ou personalizada, com fundo e texto herdando a Identidade visual.
- **Imagem de fundo do conteúdo do chat** é opcional, com recomendação de
  430 por 430 pixels.
- **Personalizar botão** escolhe entre o ícone padrão, o ícone do WhatsApp e
  uma **imagem personalizada** recortada em círculo.

### Opções de exibição

- **Exibir nos seguintes dias da semana** e os intervalos **antes do
  meio-dia** e **depois do meio-dia** definem a janela de atendimento, usando
  o fuso horário configurado no WordPress.
- **Selecione onde inserir** e as **Exceções** seguem o modelo do pop-up.

O painel avisa que as alterações do chat aparecem após a publicação do site.
Depois de publicar, atualize a página do site, e se necessário abra uma janela
anônima para ver o chat do jeito de um visitante novo.

## Relacionados

- [Entregue iscas e notifique novos leads](/painel-epico-site/iscas-e-notificacoes/)
- [Conecte ferramentas de marketing e análise](/painel-epico-site/integracoes/)
