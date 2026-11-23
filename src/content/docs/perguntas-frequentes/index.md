---
title: Perguntas frequentes
description: Respostas diretas sobre o andamento do serviço, posts, e-commerce, acessos e o acompanhamento na Área de Clientes.
topic: perguntas-frequentes
draft: false
lastReviewed: 2026-11-23
keywords:
  - "dúvidas"
  - "perguntas"
  - "FAQ"
  - "questions"
  - "preguntas"
  - "loja virtual"
  - "e-commerce"
  - "ecommerce"
  - "WooCommerce"
  - "vender online"
  - "posts preservados"
  - "perder posts"
  - "meu site durante o trabalho"
  - "acessos"
  - "quem controla as contas"
  - "área de clientes"
  - "cancelamento"
  - "reembolso"
  - "agendamento"
  - "data da implantação"
  - "plugin específico"
  - "plugin incompatível"
  - "templates"
  - "custo do site"
  - "preço"
sidebar:
  order: 1
---

Esta página reúne as dúvidas que atravessam os serviços de implantação. Os temas
que têm artigo próprio são respondidos em detalhe lá e indicados ao final.

## O que acontece com meu site durante o trabalho?

O site atual permanece canônico até existir uma versão real aprovada e um plano de
lançamento. A fixture do Site Horizonte não autoriza troca de domínio, e a ativação
posterior incluída só começa quando você declarar o conteúdo real pronto. Os serviços
Site Núcleo e Site Fronteira também passam por revisão e lançamento da versão real. Todos os
fluxos usam revisão, janela de publicação e rollback compatíveis com o projeto.

## Meus posts são preservados?

O WordPress é tratado de forma não destrutiva. No modelo headless, posts compatíveis
podem ser projetados no site estático depois da implantação. Isso não significa que
páginas criadas por temas ou construtores visuais sejam convertidas automaticamente
para o site kit.

## O Épico Site serve para e-commerce?

Não para uma loja complexa com carrinho, checkout e conta do cliente implementados no
próprio site estático. Links de pagamento, agendas e outras jornadas podem apontar para
serviços externos, conforme a compatibilidade e o escopo.

## Quais acessos são necessários e quem controla as contas?

Os acessos necessários dependem do serviço contratado. WordPress, Cloudflare, domínio e
demais contas devem permanecer em nome do cliente, e a equipe Épico recebe somente as
permissões necessárias pelo período da execução. O Site Horizonte exige os acessos
usados para implantar e validar a infraestrutura. Quem fica com os arquivos e as contas
ao final do serviço está respondido em
[Suporte, garantias e propriedade do site](/servicos-e-suporte/suporte-e-propriedade/).

## Como funcionam a garantia e o agendamento?

No Site Núcleo e no Site Horizonte, depois do pagamento, você agenda a implantação pela
Área de Clientes, numa data livre dos 20 dias seguintes à confirmação do pagamento, em
dias úteis. Depois de agendar, você pode trocar a data pela Área de Clientes até 48 horas
antes, dentro da mesma janela. A garantia é incondicional por 30 dias a partir do
pagamento, com reembolso integral pelo botão da Área de Clientes, antes ou depois da
implantação. A Gestão WP tem regra própria, com 7 dias. O que o reembolso encerra e os demais detalhes estão em
[Suporte, garantias e propriedade do site](/servicos-e-suporte/suporte-e-propriedade/#como-funcionam-cancelamento-e-reembolso).

## Quanto custa e o que cada serviço faz?

Os dois serviços de implantação custam **R$ 497 cada**, com pagamento por Pix ou cartão em
até 12x, com a taxa do parcelamento. A garantia é de 30 dias, com reembolso integral.

- **Site Horizonte:** instala o Épico Base e publica o site no modelo headless.
- **Site Núcleo:** publica uma versão estática do site atual, preservando o visual.
- **Personalização WP (R$ 497):** adicional disponível só para o Site Horizonte.

Quem quer um projeto totalmente personalizado, ou algo novo que esses serviços não cobrem,
pode pedir orçamento do **Site Fronteira**.

## Depois de publicado, quanto custa manter o site?

O site final custa **R$ 0** para ficar no ar. Ele roda na sua conta da Cloudflare, no plano
gratuito, e só passa a ter custo se ultrapassar o limite, que é muito amplo para sites
estáticos. O domínio e a hospedagem do WordPress continuam por sua conta. O suporte e as
atualizações duram 100 dias a partir do pagamento e, depois, podem ser renovados. A Gestão WP
é opcional.

## E se eu precisar de um plugin específico?

No **Site Horizonte**, os plugins do tema antigo não entram, porque o Épico Base cobre as
necessidades do site. Nós os desativamos, e você pode sugerir uma função ou pedir orçamento.
No **Site Núcleo**, mantemos só o básico, como formulários, busca e comentários.

Depois da compra, a equipe Épico confere o seu site e diz o que fica e o que sai. Se um plugin
não for compatível e você não quiser abrir mão dele, você pode solicitar o reembolso integral
pela Área de Clientes em até 30 dias, ou pedir orçamento. O reembolso nesse caso é pedido por
você. Ele só é automático para quem não agendou a implantação dentro da janela, e quem decide
seguir sem o plugin não é reembolsado.

## Tem templates para outros sites?

No lançamento, o Site Horizonte usa o **Épico Base**, a preço promocional. Ele traz blog
completo, cinco modelos de página principal, páginas de categoria, tag, autor, busca e erro,
cabeçalho e rodapé, SEO, privacidade e captura de leads. Blocos para montar páginas e outros
site kits estão em desenvolvimento. O Site Núcleo não usa template e mantém o visual atual do
seu site.

## A Área de Clientes mostrará qual serviço contratei?

Sim. No Site Horizonte, o acompanhamento mostrará Implantação técnica, Prepare seu site
e Ativação. Na preparação, você poderá escolher “Fazer por conta própria” ou “Quero que
a equipe Épico faça”. Na ativação, DNS e revisão de plugins terão tutoriais e pedido de
ajuda dentro do suporte. Até essa atualização ser concluída, uma URL técnica não
significa que o domínio deve ser alterado.

## Por que a publicação do meu site falha com erro 403 na Hostinger?

Quando o WordPress está na Hostinger, a CDN própria da hospedagem (hCDN) às
vezes confunde o servidor que gera o seu site com um robô e bloqueia a leitura
do conteúdo. O registro da publicação mostra o rótulo **bloqueio da CDN da
hospedagem**, com `servidor hcdn` e um `x-hcdn-request-id`. O bloqueio é da
Hostinger, e não da Cloudflare. A solução recomendada é desativar a CDN da
Hostinger, que não acelera nada nesse modelo, porque o site público é servido
pela Cloudflare. O passo a passo, com as alternativas para quem prefere manter
a CDN, está em
[A publicação falha com 403 por causa da CDN da Hostinger](/dominio-e-publicacao/publicacao-falha-com-403-da-cdn-da-hostinger/).

## Onde cada dúvida é respondida em detalhe?

- O que é headless, os três serviços e o que acontece com os plugins:
  [Entenda os formatos de publicação do Épico Site](/primeiros-passos/formatos-de-publicacao/).
- Para quem o Épico Site é indicado, personalização de design e textos, recriação de
  páginas e publicação de conteúdo: [Produto, nichos e edição de conteúdo](/editar-seu-site/edicao-e-personalizacao/).
- Preços, assinatura, quando escolher cada serviço, o que o Site Horizonte inclui e
  hospedagem: [Preços, hospedagem e tipos de implantação](/servicos-e-suporte/precos-e-hospedagem/).
- O que configuramos, suporte e os 100 dias, operação gerenciada, dono dos arquivos e
  das contas, garantia de 30 dias, cancelamento e reembolso:
  [Suporte, garantias e propriedade do site](/servicos-e-suporte/suporte-e-propriedade/).
- Publicação que falha com erro 403 por causa da CDN da Hostinger:
  [A publicação falha com 403 por causa da CDN da Hostinger](/dominio-e-publicacao/publicacao-falha-com-403-da-cdn-da-hostinger/).
