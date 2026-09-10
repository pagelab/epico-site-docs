# ADR 0002 — publicação no Cloudflare com Static Assets

- **Status:** aceita (o domínio canônico do ponto 6 foi alterado pela
  [ADR 0003](0003-dominio-canonico-tutoriais.md); o "privado" do ponto 1 foi
  alterado pela [ADR 0005](0005-repositorio-publico.md); o beacon de Web
  Analytics da zona passou a ser autorizado pela
  [ADR 0004](0004-web-analytics-cloudflare.md))
- **Data:** 2026-09-10
- **Decisor:** owner do Épico Studio

## Contexto

Os gates humanos `G-CONTENT` e `G-VISUAL` foram aceitos em 2026-09-10 e o gate
`G-CLOUDFLARE` exige repositório remoto, conta e projeto, branch de produção,
política de preview, rollback e custom domain definidos antes de qualquer
publicação. O `wrangler.jsonc` já descreve o Worker `epico-site-docs` com
static assets, 404 real sem SPA fallback, data de compatibilidade fixa e sem
`main`. O `public/_headers` já aplica CSP por hash, headers de segurança,
`immutable` em `/_astro/*` e `noindex` nas duas formas de URL `workers.dev`.

## Decisão

1. Fonte de produção é o branch `main` do repositório `pagelab/epico-site-docs`
   no GitHub, privado. Nenhum outro repositório publica em produção.
2. O destino é o Worker `epico-site-docs` em Static Assets da conta Cloudflare
   do Épico, sem `main`, sem bindings e sem segredos. O least privilege é
   estrutural: não existe código de Worker nem permissão de runtime para
   reduzir.
3. O caminho canônico de deploy é o Workers Builds conectado ao repositório,
   com comando de build que executa o mesmo gate local
   (`npm ci && npm run verify`). O deploy só acontece com o gate em exit 0.
   `wrangler deploy` local com verify verde na sessão é o caminho manual
   equivalente e serve de bootstrap.
4. Política de preview: branches fora de `main` geram preview em
   `*.workers.dev` e nunca recebem custom domain. O `_headers` já garante
   `noindex` nas duas formas de URL `workers.dev`, então previews não são
   indexáveis por construção.
5. Rollback tem dois caminhos: emergência por versions do Worker no dashboard
   ou wrangler, sem rebuild, e correção durável por `git revert` no `main`,
   que reexecuta o pipeline completo.
6. Produção canônica é o custom domain `docs.epico.site`, anexado como Workers
   Custom Domain na zona `epico.site` da mesma conta, com TLS gerenciado pelo
   Cloudflare. A origem `workers.dev` permanece publicada como canary e já é
   `noindex`.
7. Nenhuma credencial entra no repositório. Autenticação de máquina é o OAuth
   do wrangler e, no pipeline, a conexão do Workers Builds.

## Consequências

- A URL divulgada é sempre `https://docs.epico.site`. A origem `workers.dev`
  não é divulgada e não compete com o domínio canônico no índice.
- Um build que produza scripts inline divergentes dos hashes do `_headers`
  derruba o gate e não chega ao deploy.
- DNS do `docs.epico.site` passa a ser gerenciado pela conta Cloudflare do
  Épico. Mudar de zona ou de conta exige decisão nova.
- A visibilidade pública do repositório permanece decisão separada do owner e
  não faz parte desta ADR.
