# ADR 0003 — domínio canônico tutoriais.epico.site

- **Status:** aceita
- **Data:** 2026-09-10
- **Decisor:** owner do Épico Studio

## Contexto

A [ADR 0002](0002-cloudflare-publication.md) definiu `docs.epico.site` como
custom domain canônico. O acervo é voltado a uma audiência majoritariamente
brasileira e o owner decidiu que o subdomínio `tutoriais` comunica melhor o
propósito do site. A mudança acontece horas após o primeiro deploy, sem links
divulgados no domínio antigo e sem índice de busca consolidado.

## Decisão

1. O custom domain canônico passa a ser `tutoriais.epico.site`, anexado como
   Workers Custom Domain na zona `epico.site` da mesma conta. O `site` do
   `astro.config.mjs` permanece a fonte única dos URLs canônicos, do sitemap,
   do robots e da política llms, e o gate `check-publishing.mjs` passou a
   exigir que a rota do `wrangler.jsonc` seja exatamente o hostname desse
   site canônico, sem literal duplicado.
2. O custom domain `docs.epico.site` é removido no mesmo deploy da adição do
   novo. Sem redirect do hostname antigo por ora: a publicação no domínio
   antigo durou horas sem divulgação e a criação de Redirect Rule exige
   permissão de zona que a sessão não tem. Se links tiverem sido salvos, o
   owner pode criar Redirect Rule no dashboard apontando `docs.epico.site`
   para `https://tutoriais.epico.site` preservando o caminho.
3. O restante da ADR 0002 permanece inalterado: Worker sem `main` em Static
   Assets, origem `workers.dev` como canary `noindex`, previews fora de
   `main` apenas em `*.workers.dev`, Workers Builds com
   `npm ci && npm run verify` e rollback por versions ou `git revert`.

## Consequências

- A URL divulgada passa a ser `https://tutoriais.epico.site`.
- Slugs publicados continuam permanentes e inalterados: só o hostname muda.
- O certificado gerenciado wildcard `*.epico.site` da zona já cobre o novo
  hostname, então a troca não depende de emissão nova.
- O hostname antigo deixa de responder após a remoção do custom domain.
