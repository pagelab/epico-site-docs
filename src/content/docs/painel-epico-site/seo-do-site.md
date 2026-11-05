---
title: Defina a identidade do site para os buscadores
description: Como operar a aba SEO do painel Épico Site, com o tipo de identidade, o nome público, as redes sociais oficiais publicadas para os buscadores e a foto do perfil.
topic: painel-epico-site
draft: false
lastReviewed: 2026-11-05
keywords:
  - "SEO"
  - "Google"
  - "buscadores"
  - "search engines"
  - "dados estruturados"
  - "structured data"
  - "schema"
  - "schema.org"
  - "JSON-LD"
  - "rich results"
  - "resultados avançados"
  - "Knowledge Graph"
  - "painel de conhecimento"
  - "Organization"
  - "organização"
  - "empresa"
  - "marca"
  - "Person"
  - "pessoa"
  - "site pessoal"
  - "sameAs"
  - "redes sociais"
  - "perfis oficiais"
  - "Instagram"
  - "LinkedIn"
  - "perfil do usuário"
  - "foto do perfil"
  - "avatar"
  - "Gravatar"
  - "identidade do site"
sidebar:
  order: 4.5
---

A aba **SEO** diz aos buscadores quem está por trás do site. Com ela, o site
publicado passa a informar ao Google se é uma organização ou uma pessoa, o
nome público, o logotipo e os perfis oficiais nas redes sociais. Essas
informações saem como dados estruturados, um formato que os buscadores leem e
os visitantes não veem.

Abra **Épico Site → Configurações** e escolha a aba **SEO**, logo abaixo de
**Recursos**. Hoje ela tem a seção **Identidade**.

## O que o site publica sem configurar nada

Mesmo com a aba vazia, o site publicado já descreve a si mesmo para os
buscadores. A página inicial informa o próprio site, com nome e endereço, e
cada artigo informa título, datas, autor e a trilha de navegação. A seção
Identidade acrescenta quem responde pelo site e liga os artigos a essa
identidade como responsável pela publicação.

## Identidade

### Identidade do site

O campo **Identidade do site** escolhe o tipo de identidade:

- **Não definida (só o WebSite)** é o padrão. O site publica apenas os dados
  do próprio site, sem dizer quem está por trás dele.
- **Organização** serve para empresa, marca ou projeto.
- **Pessoa** serve para um site pessoal.

O tipo nunca é adivinhado a partir do conteúdo. Ele só existe quando você o
escolhe aqui.

### Nome público

Aparece depois que um tipo é escolhido. É o nome mostrado aos buscadores
quando ele for diferente do título do site, definido em **Configurações →
Geral** do WordPress. Deixe vazio para usar o título do site.

Uma **Organização** também publica o logotipo escolhido em **Logotipo**, na
aba Identidade visual. Veja
[Identidade e comportamento](/painel-epico-site/identidade-visual/#identidade-e-comportamento).

### Perfil do usuário

O campo **Perfil do usuário** escolhe o usuário do WordPress cujas redes
sociais e foto representam o site. A lista mostra os usuários que podem
editar posts.

- Sem escolha, vale o **Administrador principal** do site, indicado na
  primeira opção da lista.
- **Ninguém** não publica perfil nenhum.

As redes desse usuário são publicadas como os perfis oficiais da identidade
escolhida acima. Elas também alimentam o item **Redes sociais** da página de
contato. Escolha um usuário que represente o site ou a marca. Para uma
organização, pode valer a pena criar um usuário só para isso, com as redes da
marca.

E-mail, telefone e endereço nunca são publicados por esta seção.

### Foto do perfil

Logo abaixo do seletor, o campo **Foto do perfil** mostra a foto do usuário
escolhido. É a mesma foto do campo **Foto do perfil** em **Usuários →
Perfil**: trocar aqui troca lá também. Envie uma imagem quadrada, com pelo
menos 192 pixels de lado.

A foto substitui o Gravatar em todo o site, inclusive na caixa do autor, e
dispensa criar conta em outro serviço. Sem foto, o WordPress continua usando
o Gravatar. Se você acabou de trocar o usuário no seletor, salve as
configurações antes de editar a foto.

## Cadastre as redes sociais no perfil do usuário

As redes ficam no perfil do usuário escolhido, não no painel:

1. No WordPress, abra **Usuários** e edite o usuário escolhido. Se for o seu
   próprio usuário, abra **Usuários → Perfil**.
2. Na seção **Redes sociais (Épico Site)**, adicione uma linha por rede.
3. Em **Rede**, escolha Instagram, Facebook, LinkedIn, X, YouTube, TikTok,
   Threads, Pinterest ou GitHub.
4. Em **Endereço do perfil**, cole o endereço completo, começando com
   `https`.
5. Clique em **Atualizar perfil**.

Endereços que não pertencem à rede escolhida são descartados, assim como
endereços sem `https`. Endereços repetidos entram uma vez só, até um total de
dez perfis.

As mesmas redes aparecem na caixa do autor, no fim dos artigos desse usuário.
Se o perfil já tiver redes preenchidas pelo plugin de SEO, elas são usadas
como reserva, e o que estiver na lista do Épico Site vale mais.

## Confira o resultado

1. Salve a aba SEO e aguarde a publicação indicada na barra superior do
   WordPress.
2. Abra o [validador de dados estruturados do Schema.org](https://validator.schema.org/)
   e informe o endereço da página inicial do site publicado.
3. Confira se a identidade aparece com o tipo, o nome e os perfis esperados.
   Repita o teste com o endereço de um artigo, que deve trazer a identidade
   como responsável pela publicação.

Os buscadores leem essas informações na próxima visita ao site. O Google
decide se e quando as usa nos resultados, e a mudança pode levar dias ou
semanas para aparecer.

Se preferir contratar a execução, fale com a equipe Épico pelos canais de
suporte da sua área de cliente.

## Relacionados

- [Conheça o painel Épico Site](/painel-epico-site/)
- [Aplique a identidade visual do site](/painel-epico-site/identidade-visual/)
- [Ative e desative recursos do site](/painel-epico-site/recursos-do-site/#página-de-contato)
- [Gerencie dados, segurança e backup do plugin](/painel-epico-site/gerenciamento/#ocultar-o-site-publicado-dos-buscadores)
