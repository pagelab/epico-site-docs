---
title: Conecte ferramentas de marketing e análise
description: Como operar a aba Integrações do painel Épico Site, com e-mail marketing, Google Tag Manager, Google Analytics, Meta Pixel e meta tags de verificação.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-16
sidebar:
  order: 8
---

A aba **Integrações** conecta o site às ferramentas que recebem os leads e
medem o tráfego. As chaves de API ficam guardadas criptografadas no servidor e
nunca são expostas em rotas públicas do site.

Abra **Épico Site → Configurações** e escolha a aba **Integrações**.

## E-mail marketing

Em **Selecione a ferramenta**, escolha **RD Station**, **MailChimp**,
**Brevo** ou **MailerLite**. O formulário do site passa a enviar os leads
para a ferramenta escolhida.

### RD Station

O RD Station conecta por **script de monitoramento**. Cole no campo **Código
de monitoramento do RD Station** o UUID ou a tag oficial completa copiada da
sua conta, em Configurações e Código de Monitoramento. O painel extrai e
guarda só o UUID, que é público. Um valor que não corresponde ao formato
esperado é avisado depois de salvar, e o script não carrega no site até
receber um valor válido. O script só é ativado após consentimento de
marketing do visitante.

### MailChimp, Brevo e MailerLite

1. Cole a **Chave de API** da ferramenta. Ela fica mascarada na tela e
   criptografada no servidor.
2. Clique em **Carregar listas**. O painel consulta a ferramenta usando a
   chave salva e mostra as listas disponíveis no seletor.
3. Escolha a lista de destino e clique em **Salvar**.

O botão **Testar conexão** faz a mesma consulta e confirma se a chave e a
lista estão funcionando. Se você acabou de trocar a chave, salve a página
antes de testar, porque o teste usa a chave salva. É possível digitar o ID da
lista manualmente no campo correspondente.

No Brevo, se os formulários apresentarem erro de envio, autorize o endereço
de saída da sua hospedagem WordPress no painel do Brevo, em Segurança e IPs
autorizados. O aviso da aba mostra o endereço IP que o Brevo informou como
bloqueado.

Confirme na plataforma o recebimento de um contato de teste antes de divulgar
o site.

## Rastreamento e análise

As integrações **Google Tag Manager**, **Google Analytics** e **Meta Pixel**
só ficam disponíveis quando o banner de consentimento está ativo na aba
[Privacidade](/painel-epico-site/privacidade-e-consentimento/). Os scripts
dessas ferramentas carregam apenas depois que o visitante aceita a categoria
correspondente, em conformidade com as regras de privacidade.

Cada ferramenta tem a sua própria seção logo abaixo, e as três podem
conviver no mesmo site.

### Google Tag Manager

O Tag Manager é o gerenciador gratuito do Google que concentra tags de
marketing em um único contêiner, sem precisar de um desenvolvedor a cada
mudança de campanha.

1. Ative **Ativar a integração com o GTM**.
2. Informe o **ID do contêiner**, no formato `GTM-XXXXXX`.
3. Salve o painel e publique o site.

O ID aparece no espaço de trabalho (Workspace) da conta do Tag Manager,
ao lado do nome do contêiner. O trecho de código completo não é usado
aqui, apenas o ID.

Com o Tag Manager ativo, as tags que você configurar lá dentro carregam
junto com ele. Elas herdam o mesmo consentimento do contêiner, portanto
evite colocar no contêiner uma tag de categoria diferente da que o
visitante aceitou.

### Google Analytics

O Analytics reúne os dados de tráfego do site e é o que sustenta uma
decisão de conteúdo baseada em número, não em impressão.

1. Ative **Ativar a integração com o GA**.
2. Informe o **ID da propriedade**, no formato `G-XXXXXXXXXX`. É apenas o
   ID, nunca o trecho de código inteiro. Ele fica na seção de integração
   do painel do Analytics.

Duas opções ajustam o comportamento:

- **Incluir dados sobre o uso dos formulários** envia ao Analytics os
  eventos dos formulários de captura do site, o que permite medir a
  conversão de cada ponto de captura.
- **Adicionar o trecho de código da integração** vem ligada e é o que
  injeta o Analytics no site. Desligue apenas quando o Analytics já entra
  por outra ferramenta, como o próprio Tag Manager, e você ainda quer
  enviar os eventos dos formulários. Visitantes conectados ao WordPress
  não são medidos.

Se você já integrou o Analytics pelo Tag Manager, mantenha apenas um dos
dois caminhos ativo, senão a mesma visita é contada duas vezes.

### Meta Pixel

O pixel é o recurso de medição das plataformas de anúncio. Ele mede o
resultado das campanhas, otimiza a entrega e alimenta a construção de
públicos.

1. Ative **Ativar a integração do pixel**.
2. Informe o **ID do pixel**, apenas o número, sem o trecho de código.

O ID fica na seção de integração do gerenciador de anúncios da Meta. O
pixel é sempre da categoria de marketing, portanto ele só dispara para
quem aceitou essa categoria no banner.

## Meta tags de verificação

As meta tags de verificação confirmam para plataformas como Google Search
Console, Bing Webmaster Tools e Pinterest que o site é seu:

1. Ative **Ativar a integração por meta tags**.
2. Em **Lista de meta tags**, clique para adicionar uma entrada.
3. Escolha o **Nome da plataforma** e cole o **Código HTML da meta tag**
   exatamente como recebeu da plataforma.

Um código que não corresponde à plataforma escolhida é ignorado na
publicação. Outros tipos de meta tag, como palavras-chave e robôs, também são
ignorados. Para serviços fora da lista, use a plataforma **Genérica**.

Depois de salvar e publicar o site, conclua a verificação no painel da
plataforma. A meta tag entra no cabeçalho de todas as páginas do site
publicado, sem depender de consentimento, porque identifica o site e não o
visitante.

## Relacionados

- [Capture leads com pop-up e chat](/painel-epico-site/captura-de-leads/)
- [Peça consentimento e cuide da privacidade](/painel-epico-site/privacidade-e-consentimento/)
