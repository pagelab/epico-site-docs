---
title: Capture leads no conteúdo, no pop-up e no chat
description: Como configurar a captura automática no artigo, o Cartão de captura local, o pop-up e o chat, com proteção contra robôs e confirmação de envio.
topic: painel-epico-site
draft: false
lastReviewed: 2026-10-02
sidebar:
  order: 5
---

A aba **Geração de leads** configura como o site captura contatos. A captura
flui pelos formulários das seções do site, pelo cartão de captura dentro do
artigo e por dois recursos flutuantes: pop-up e chat. Os três interruptores
de captura vêm desligados, e você ativa os pontos que pretende usar.

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
sinal anônimo de conclusão é guardado, nunca os valores do formulário. Vem
desligado. No RD Station, só o modo **Chave de API** confirma a entrega.
**Código de monitoramento** não ativa essa ocultação.

Quando existe uma isca associada à captura, a entrega dela prevalece sobre o
redirecionamento geral. Veja
[Entrega da isca digital](/painel-epico-site/iscas-e-notificacoes/#entrega-da-isca-digital).

## Proteção contra robôs

A seção **Proteção contra bots** usa o Cloudflare Turnstile, o desafio da
Cloudflare alternativo ao CAPTCHA:

1. Cole a **Chave do site** e a **Chave secreta** do seu widget no painel da
   Cloudflare. As duas chaves nascem quando você cria o widget, e o passo a
   passo está na
   [documentação do Turnstile](https://developers.cloudflare.com/turnstile/).
2. Ative **Exigir verificação no envio do formulário**, que vem desligada.
3. Salve, aguarde a publicação e confira o formulário no endereço público do
   site. Use uma chave autorizada para esse domínio.

A ordem acima importa. Com o interruptor ligado e as chaves ainda não
utilizáveis, o painel avisa que as capturas continuam aceitando envios sem
verificação, em vez de bloquear tudo. A chave secreta é guardada
criptografada e nunca aparece em rotas públicas do site.

Se o widget não carregar no site, quem administra a infraestrutura precisa
autorizar o endereço `challenges.cloudflare.com` na política de conteúdo do
site publicado.

## Captura fixada por rolagem

**Ativar a captura fixada por rolagem** insere automaticamente um cartão com
formulário em posts e páginas que usam o modelo **Posts**. O cartão aparece
na profundidade de leitura escolhida, sem você precisar inserir um bloco em
cada artigo. Páginas com outros modelos ficam de fora.

1. Desligue o pop-up, caso esteja ativo.
2. Escolha **Sim** em Ativar a captura fixada por rolagem.
3. Preencha os grupos **Configurações gerais**, **Estilo** e **Opções de
   exibição** descritos abaixo.
4. Salve e aguarde a publicação. Abra um conteúdo elegível no site e role
   até o ponto escolhido.

Em telas largas e com espaço suficiente, o cartão acompanha um trecho
limitado da leitura, até o próximo subtítulo principal ou bloco de seção.
Em telas estreitas ou sem espaço para fixar, ele permanece dentro do texto.

### Conteúdo da captura fixada

- **Título da captura fixada** aceita até 40 caracteres. O padrão é
  "Receba novidades".
- **Mensagem da captura fixada** é o convite abaixo do título. O padrão é
  "Cadastre seu e-mail para receber novos conteúdos.".
- **Texto do botão da captura fixada** muda o botão de envio. O padrão é
  "Quero receber".
- **Ativar campos extras do formulário** vem desligado e revela **Campos
  adicionais do formulário**. Escolha Nome, Telefone e Consentimento
  (LGPD/GDPR). E-mail sempre está incluído.

### Imagem da captura fixada

**Imagem de destaque** é opcional. **Aplicação da imagem** escolhe **Acima da
captura** (o padrão) ou **Fundo da captura**. Sem imagem escolhida, essa área
não aparece.

### Exibição da captura fixada

- **Profundidade de rolagem antes de exibir (percentual)** escolhe o ponto
  do artigo, de 1 a 100. O padrão é 50%.
- **Frequência de exibição** oferece **Em cada exibição de página**, **Uma
  vez**, **Uma vez por dia** e **Uma vez por sessão de navegador** (o
  padrão). Uma vez guarda a exibição neste navegador até seus dados serem
  apagados. A frequência da captura automática é compartilhada entre os
  artigos. Um bloco local tem frequência própria.
- **Exibir a captura fixada em celulares** vem ligado. Em telas pequenas o
  cartão fica no fluxo do texto.
- **Selecione onde inserir** oferece **Todos os posts** (o padrão), **Todos,
  exceto selecionados** e **Somente nos selecionados**. As duas últimas
  opções revelam **Selecione os conteúdos**, que lista posts e páginas
  publicadas com o modelo Posts.

### Usar um Cartão de captura em um artigo específico

O bloco **Cartão de captura (Épico Site)** permite escolher uma mensagem e
uma posição próprias para aquele artigo. Ele usa o mesmo formulário e a
mesma aparência da captura automática.

1. Em **Recursos → Módulos → Blocos de seção**, mantenha **Cartão de captura**
   habilitado.
2. No editor do artigo, insira o bloco no ponto desejado.
3. Preencha título, mensagem, texto do botão e campos extras em
   **Configurações gerais**, e a imagem opcional em **Estilo**.
4. Em **Opções de exibição**, ajuste **Fixar ao rolar**, **Frequência de
   exibição** e **Exibir em celulares**. O bloco vem com fixação e exibição
   em celulares ligadas, com frequência de uma vez por sessão.
5. Salve o artigo e aguarde a publicação.

Um bloco local substitui a captura automática apenas naquele artigo. Não
precisa ligar a captura automática para usar o bloco. Desligar a automática
não remove um bloco já inserido. A fixação só vale em conteúdo com modelo
editorial e quando o pop-up está desligado.

## Escolha apenas um modo de captura

O pop-up e o chat são mutuamente exclusivos. Ligar um desliga o outro no
painel. Se uma instalação antiga chega com os dois ligados, nenhum dos dois
funciona e o painel mostra o aviso **Escolha apenas um modo de captura**.
Desligue um dos dois e salve.

O chat pode conviver com a captura fixada por rolagem. O pop-up desliga e
bloqueia a captura automática. Blocos locais continuam dentro do artigo,
sem fixação, enquanto o pop-up estiver ativo.

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
  por sessão do navegador, uma vez por dia (o padrão) ou em cada
  visualização de página.
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
- **Ativar campos extras do formulário** revela **Campos adicionais do
  formulário**, seguindo o mesmo modelo do pop-up. E-mail sempre está
  incluído, e o interruptor vem desligado.
- **Mensagem pré-preenchida do WhatsApp** define o texto da conversa quando
  o lead continua no WhatsApp. Use `[nome]`, `[email]` e `[telefone]`, com até
  500 caracteres. Um campo ausente no formulário deixa seu marcador vazio.
  Em branco, o texto usa uma linha por dado enviado. A conversa só é
  liberada depois de uma entrega confirmada. No RD Station, isso exige o
  modo Chave de API.

### Estilo

O botão do chat fica no canto inferior direito. A posição é fixa e não há
campo de escolha no painel.

- **Cores da captura chat** definem o destaque a partir de uma cor da marca
  ou personalizada, com fundo e texto herdando a Identidade visual. O padrão
  usa **Destaque**. **Personalizar** revela **Cor de destaque do chat**, **Cor
  de fundo do chat** e **Cor do texto do chat**.
- **Imagem de fundo do conteúdo do chat** é opcional, com recomendação de
  430 por 430 pixels.
- **Personalizar botão** escolhe entre o ícone padrão, o ícone do WhatsApp e
  uma **Imagem personalizada do botão de ativação do chat**, recortada em
  círculo. O padrão é **Ícone padrão do chat**.

### Opções de exibição

- **Exibir nos seguintes dias da semana** e os intervalos **antes do
  meio-dia** e **depois do meio-dia** definem a janela de atendimento, usando
  o fuso horário configurado no WordPress. O padrão é de terça a sábado,
  das 9h às 12h e das 12h às 17h. Ajuste os dias e horários do seu atendimento.
- **Selecione onde inserir** e as **Exceções** seguem o modelo do pop-up.

O painel avisa que as alterações do chat aparecem após a publicação do site.
Depois de publicar, atualize a página do site, e se necessário abra uma janela
anônima para ver o chat do jeito de um visitante novo.

## Relacionados

- [Entregue iscas e notifique novos leads](/painel-epico-site/iscas-e-notificacoes/)
- [Conecte ferramentas de marketing e análise](/painel-epico-site/integracoes/)
