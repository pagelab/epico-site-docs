---
title: Conecte ferramentas de marketing e análise
description: Como operar a aba Integrações do painel Épico Site, com e-mail marketing, Google Tag Manager, Google Analytics, Meta Pixel e meta tags de verificação.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
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

- **Google Tag Manager**: ative a integração e informe o **ID do contêiner**,
  no formato `GTM-XXXXXX`, encontrado no espaço de trabalho da ferramenta.
- **Google Analytics**: ative a integração e informe o **ID da propriedade**,
  no formato `G-XXXXXXXXXX`, apenas o ID, sem o trecho de código inteiro. A
  opção **Incluir dados sobre o uso dos formulários** envia eventos dos
  formulários do site para o painel do Analytics. Se você já integrou o
  Google Analytics pelo Tag Manager, deixe apenas um dos dois ativo para não
  duplicar a coleta.
- **Meta Pixel**: ative a integração do pixel e informe o **ID do pixel**,
  apenas o número, sem o trecho de código.

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
