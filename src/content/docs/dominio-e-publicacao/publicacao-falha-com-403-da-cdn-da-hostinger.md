---
title: A publicação falha com 403 por causa da CDN da Hostinger
description: Quando a CDN da Hostinger barra a leitura do WordPress e a publicação do site para com erro 403, veja como desativar a CDN ou baixar o nível de segurança.
topic: dominio-e-publicacao
draft: false
lastReviewed: 2026-11-07
keywords:
  - "403"
  - "erro 403"
  - "forbidden"
  - "Hostinger"
  - "hCDN"
  - "CDN da Hostinger"
  - "CDN da hospedagem"
  - "bloqueio da CDN"
  - "x-hcdn-request-id"
  - "Checking your browser"
  - "Just a moment"
  - "build falhou"
  - "publicação falhou"
  - "não foi possível atualizar o site"
  - "build failed"
sidebar:
  order: 4
---

Este guia vale para sites com WordPress hospedado na Hostinger. Se a
publicação do site parou e o registro fala em bloqueio da CDN da hospedagem,
o problema está na CDN da Hostinger, e não na Cloudflare. A correção leva
poucos minutos no painel da Hostinger.

## Como reconhecer o problema?

O painel do WordPress mostra "Não foi possível atualizar o site" e o site
publicado continua na versão anterior. No registro da publicação, a leitura
do WordPress aparece com o rótulo **bloqueio da CDN da hospedagem**, junto de
um trecho parecido com este:

```text
HTTP 403 (bloqueio da CDN da hospedagem, servidor hcdn, x-hcdn-request-id 1a2b3c4d)
```

Os dois sinais que importam são o **servidor hcdn** e o
**x-hcdn-request-id**. Eles mostram que quem respondeu foi a CDN da Hostinger.
O número do `x-hcdn-request-id` muda a cada tentativa. Guarde o da falha mais
recente, porque o suporte da Hostinger pede esse dado.

A falha costuma ser intermitente: uma publicação passa e a seguinte para, sem
nenhuma mudança no site.

## Por que isso acontece?

A Hostinger tem uma CDN própria, chamada hCDN, que fica na frente do
WordPress. Ela tenta separar visitantes de robôs. O servidor que gera o seu
site lê o conteúdo do WordPress a partir de um data center, e às vezes a hCDN
confunde esse acesso com um robô.

Quando isso acontece, ela responde com uma página de verificação que diz
"Checking your browser" ou "Just a moment". Essa página é da Hostinger,
apesar de parecer com as verificações da Cloudflare. O servidor de publicação
não é um navegador, não passa pela verificação e a leitura termina em 403.

## Solução recomendada: desativar a CDN da Hostinger

No painel da Hostinger (hPanel), siga o caminho **Sites**, **Gerenciar site**,
**Desempenho**, **CDN** e desative a CDN. No painel em inglês, o caminho é
**Websites**, **Manage site**, **Performance**, **CDN**, botão **Disable**.
Espere alguns minutos e publique de novo.

Desativar a CDN não deixa o site mais lento:

- O site público é servido pela Cloudflare, e não pela Hostinger.
- As imagens e os arquivos de mídia são copiados durante a publicação e
  também saem pela Cloudflare.
- O WordPress só recebe a leitura da publicação, o seu acesso ao painel e os
  envios dos visitantes, como comentários, inscrições e formulários. Nenhuma
  CDN guarda esses acessos em cache.

Se o seu domínio é próprio e o DNS dele fica fora da Hostinger, confira o
registro que aponta para o WordPress depois de desativar a CDN. Ele deve sair
de `cdn.hstgr.net` e passar a apontar para o IP do servidor, que aparece no
próprio hPanel. Na dúvida, fale com a equipe Épico antes de alterar o DNS.

## Alternativa: manter a CDN com nível de segurança menor

Se preferir manter a CDN ativa, siga o mesmo caminho até **CDN**, clique em
**Gerenciar** e abra a aba **Segurança**. No campo de nível de segurança,
baixe um passo por vez: primeiro **Medium**, publique de novo e, se ainda
falhar, **Low**. Espere cerca de um minuto depois de cada mudança.

Níveis mais altos inspecionam os acessos com mais rigor. Baixar o nível
reduz os bloqueios por engano e mantém a proteção básica. O painel da
Hostinger não permite liberar um endereço ou um serviço específico, então não
existe uma lista de exceções para preencher.

## Último recurso: pedir uma exceção ao suporte da Hostinger

Se o bloqueio continuar mesmo com o nível baixo, abra um chamado no suporte
da Hostinger e peça uma exceção na CDN para estes dois caminhos do seu site:

- `/wp-json/*`
- `/wp-content/uploads/*`

Informe o `x-hcdn-request-id` da falha mais recente, a data e o horário da
tentativa. Com esse número, o suporte encontra o bloqueio nos registros da
CDN.

## Documentação da Hostinger

Os três artigos oficiais existem somente em inglês:

- [Como corrigir acessos legítimos bloqueados pela CDN](https://www.hostinger.com/support/hostinger-cdn-how-to-fix-blocked-legitimate-requests/)
- [Níveis de segurança da CDN](https://www.hostinger.com/support/10695636-hostinger-cdn-security-levels/)
- [A página de verificação do navegador](https://www.hostinger.com/support/hostinger-cdn-the-browser-verification-page/)

## Relacionados

- [Controle o que o site publica](/painel-epico-site/publicacao-do-site/)
- [Publique seu site pela primeira vez](/dominio-e-publicacao/publique-seu-site-pela-primeira-vez/)
- [Conecte seu domínio com segurança](/dominio-e-publicacao/conecte-seu-dominio/)
