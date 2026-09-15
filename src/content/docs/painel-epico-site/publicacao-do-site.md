---
title: Controle o que o site publica
description: Como operar a aba Publicação do painel Épico Site, com endereço público, política de publicação, listas de conteúdo e o estado da publicação.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
sidebar:
  order: 3
---

A aba **Publicação** decide qual conteúdo do WordPress chega ao site
publicado e mostra se as suas alterações já estão no ar. O site publicado é
gerado a partir do conteúdo do WordPress, e esta aba é o controle do que
entra nessa geração.

Abra **Épico Site → Configurações** e escolha a aba **Publicação**.

## Endereço público do site

O campo **Endereço público do site (origem)** informa o endereço que os
visitantes acessam, como o domínio próprio do site. Não é o endereço do
WordPress. Ele alimenta o link **Ver no site** do editor e restringe quais
origens podem enviar o formulário de captura de leads.

Enquanto estiver vazio, os formulários aceitam envios de qualquer origem e o
link **Ver no site** não aparece. Preencha com o endereço completo, começando
com `https://`.

## Política de publicação

A **Política de publicação** controla para quais páginas e posts o site final
gera endereços:

| Opção | O que publica |
| --- | --- |
| Não publicar nada | Nada é publicado. É o padrão de fábrica |
| Publicar todas as páginas e posts | Todo conteúdo publicado no WordPress |
| Publicar somente as páginas | Apenas páginas publicadas |
| Publicar somente os posts | Apenas posts publicados |
| Publicar somente o conteúdo selecionado | Apenas o conteúdo da lista de inclusão |
| Publicar tudo, exceto o conteúdo selecionado | Todo o conteúdo, menos o da lista de exclusão |

A escolha das duas últimas opções revela a lista logo abaixo da política.
Comece a digitar um título para filtrar e selecione os itens. Cada item
mostra se é página ou post. Somente conteúdo com estado publicado entra no
site, e a política nunca muda o funcionamento do próprio WordPress.

Duas regras especiais protegem o site:

- Quando a página inicial é uma página fixa, ela é sempre publicada, mesmo se
  estiver na lista de exclusão.
- Se a sua escolha deixar o site vazio ou sem página inicial, a publicação é
  recusada e o site que está no ar continua como está. O painel avisa com
  mensagens explicando a causa antes de você salvar.

## Resultado por conteúdo

No editor de cada página ou post, a caixa **Publicação do site** mostra o
resultado efetivo daquele conteúdo: se entra no site, se fica de fora e por
quê. Com o endereço público preenchido, a caixa também traz o link
**Ver no site** para conferir a página publicada.

## Estado da publicação

Cada salvamento de conteúdo ou de configuração pede uma nova publicação do
site. Você acompanha o andamento em três lugares:

- Na **barra superior do WordPress**, o indicador de estado da publicação
  mostra frases como "Publicando suas alterações", "Site atualizado" ou
  "Não foi possível atualizar o site". Clicar nele abre a aba Publicação.
- No **editor de conteúdo**, um aviso informa quando o site está sendo
  atualizado e confirma quando as alterações estão no ar.
- No fim da aba **Publicação**, o cartão **Estado da publicação** traz a
  frase de apoio e a tabela **Publicações recentes**, com data, desfecho e
  duração de cada publicação.

Se um pedido de publicação falhar, o painel tenta de novo sozinho até três
vezes e avisa na barra do WordPress. Enquanto a nova versão não termina, o
site continua servindo a versão anterior.

## Dados da Cloudflare

Os campos **Endereço de publicação da Cloudflare** e **Acesso à Cloudflare**
ligam o WordPress à geração do site na Cloudflare. Eles são configurados pela
equipe Épico durante a ativação do site e, depois de preenchidos, ficam
ocultos para administradores do site, para não serem apagados sem querer. Se
precisar revisá-los, fale com o suporte.

O endereço de publicação vazio significa que mudanças de conteúdo param de
publicar sozinhas, e o site só muda quando o endereço for configurado de novo.

## Relacionados

- [Publique seu site pela primeira vez](/dominio-e-publicacao/publique-seu-site-pela-primeira-vez/)
- [Conecte seu domínio com segurança](/dominio-e-publicacao/conecte-seu-dominio/)
- [Capture leads com pop-up e chat](/painel-epico-site/captura-de-leads/)
