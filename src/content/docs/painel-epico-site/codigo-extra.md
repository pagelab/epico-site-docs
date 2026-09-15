---
title: Adicione código personalizado ao site
description: Como operar a aba Código extra do painel Épico Site, com CSS e JavaScript globais, local de aplicação, carregamento por consentimento e código por página.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
sidebar:
  order: 10
---

A aba **Código extra** recebe trechos de CSS e JavaScript que estendem ou
ajustam o site publicado. O CSS entra no cabeçalho do site. O JavaScript pode
entrar no cabeçalho ou no fechamento da página.

Abra **Épico Site → Configurações** e escolha a aba **Código extra**.

Quem salva código precisa de permissão de administrador com capacidade de
código não filtrado no WordPress. Sem essa permissão, a aba avisa que as
alterações nos campos de código não serão salvas.

## CSS personalizado

Cole o CSS puro no campo **Adicionar código CSS personalizado**. Não envolva
em uma tag de estilo, ela é adicionada automaticamente. Comentários, media
queries e seletores aninhados são preservados. Exemplo:

```css
.secao-destaque h2 {
  letter-spacing: 0.02em;
}
```

Duas regras de segurança do CSS: não são aceitos `@import` nem endereços
remotos em `url()`, porque o site publicado só pode referenciar arquivos
locais. Código com marcação HTML também é recusado.

## JavaScript personalizado

Há dois campos com o mesmo funcionamento: um para a tag de cabeçalho e outro
para o fechamento da página. Cole o JavaScript puro, sem a tag de script.
Scripts do rodapé rodam depois que o corpo da página carrega, que é o local
recomendado para scripts não críticos.

**Selecione quando carregar** controla o momento da execução:

- **Imediata (todos os visitantes)** entrega o script para todos.
- **Após consentimento de analytics** mantém o script inerte até o visitante
  aceitar a categoria de análise.
- **Após consentimento de marketing** faz o mesmo com a categoria de
marketing.

Use as opções de consentimento para rastreadores e pixels, como exige a aba
[Privacidade](/painel-epico-site/privacidade-e-consentimento/). Quando um
script carrega imediatamente e parece enviar dados para outras empresas, a
aba mostra um aviso sugerindo a opção de consentimento adequada.

## Onde o código aplica

**Selecione onde inserir** restringe o alcance do trecho:

| Opção | Alcance |
| --- | --- |
| Em todo o site | Todas as páginas do site publicado |
| Somente na página inicial | Apenas a página inicial |
| Todos os posts | Posts, com filtro por título nas Exceções |
| Todas as páginas | Páginas, com filtro por título nas Exceções |
| Todos os tipos de post | Posts e páginas, com filtro nas Exceções |
| Todos os arquivos de categoria | Categorias, com filtro nas Exceções |
| Desktop | Apenas telas de computador |
| Celular | Apenas telas de celular |
| Página "não encontrado" (404) | A página de erro do site |

As **Exceções** aparecem conforme a localização escolhida e estreitam a lista
para itens específicos. Deixe em branco para aplicar a todos os endereços do
local escolhido.

## Código por página ou post

No editor de cada post ou página, a caixa lateral **Código extra** recebe CSS
e JavaScript que valem apenas para aquele endereço do site publicado. Não há
seletor de local nem de carregamento, o alcance é a própria página. O código
presente já é o acionamento, e basta salvar e publicar o conteúdo.

## Código inválido

O painel aceita e guarda o código no salvamento, e a validação completa roda
na publicação do site. Um trecho que viola as regras interrompe a geração do
site com um erro, em vez de publicar código perigoso, e o site continua no ar
com a versão anterior. Ajuste o trecho indicado e publique de novo.
