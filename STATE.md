# Tutoriais Épico Site — estado de implementação

> Bookmark de retomada. Leia no começo e atualize por último em toda sessão.

- **Produto:** acervo público em `docs.epico.site`.
- **Stack:** Astro estático + Starlight + Cloudflare Workers Static Assets.
- **Autoridade editorial:** `src/content/docs/` neste repositório.
- **Fila canônica:** [`TASKS.md`](TASKS.md).
- **Decisão vigente:**
  [`docs/decisions/0001-public-docs-architecture.md`](docs/decisions/0001-public-docs-architecture.md).

## Estado corrente

- Repositório local criado em 2026-09-07 com o template oficial Starlight.
  Dois commits locais: o inicial do gerador (`create-astro`, `e6244f5`) e o commit
  do scaffold auditado (fatias `DOCS-00` a `DOCS-02` + ajustes da auditoria).
  Em 2026-09-08, ordem direta do owner criou o remoto privado
  `EpicoStudio/epico-site-docs` e fez push do branch `main`. Nenhum projeto
  Cloudflare, domínio ou deploy foi configurado.
- Node `24.20.0` e npm `11.19.0` estão fixados.
- `DOCS-00`, `DOCS-01` e `DOCS-02` concluídos localmente. O scaffold tem locale
  raiz `pt-BR`, seis grupos, schema estrito e lint de conteúdo público.
- `npm ci` reproduziu o lockfile. `npm run verify` passou com Astro Check sem
  diagnósticos, lint limpo, 4 testes, build de 8 páginas e zero vulnerabilidades.
- A auditoria completa de 2026-09-07 sobre o scaffold aplicou quatro ajustes:
  `sharp` direto removido (pin não unificava com o range do Astro e criava cópia
  órfã), `@types/node` alinhado à major do runtime (`24.13.3`), sidebar derivada
  de `src/lib/topics.mjs` (fonte única das seis áreas) e barreiras anti-XSS no
  lint de conteúdo, provadas por sonda. `npm ci` e `npm run verify` verdes após
  os ajustes.
- A segunda auditoria (2026-09-08) manteve o gate verde e aplicou três melhorias:
  `allowScripts` reescrito no formato canônico do npm 11.19 com esbuild pinado
  por versão e novo passo de gate `scripts/check-install-scripts.mjs` no
  `verify` (falha com pacote sem cobertura, provado por sonda), lint de
  conteúdo refatorado em módulo testável com cercas CommonMark, violação de
  cerca não fechada e barreiras anti-XSS ampliadas (`javascript:` e
  `data:text/html` em `href`/`src`, tags brutas `<iframe>`, `<object>`,
  `<embed>`, `<form>`), e as sondas viraram regressão permanente em
  `tests/lint-policy.test.ts` (30 testes em 3 arquivos no total). Commit local
  e push para o remoto executados a pedido do owner em 2026-09-08.
- Pagefind, sitemap e `llms.txt`, `llms-full.txt` e `llms-small.txt` são gerados.
- Os avisos de coleção i18n vazia e página 404 ainda não criada pertencem a
  `DOCS-06`. Não foram silenciados.
- Nenhum projeto Cloudflare, domínio ou deploy foi configurado. A visibilidade
  pública do remoto e a branch de produção aguardam as decisões de `DOCS-08`.

## ▶ Próxima ação

Executar `DOCS-03A`: migrar `01-entenda-o-novo-formato.md` e
`03-edicao-e-personalizacao.md` para os slugs canônicos, registrar o mapa de
proveniência do corpus e concluir com `npm run verify`. Não abrir o gate de
aceite de conteúdo nessa sessão.

## Gates vivos

- `G-CONTENT`: revisão factual, comercial, editorial, acessível e de segurança,
  seguida de aceite humano do owner.
- `G-VISUAL`: aceite humano em desktop, mobile, teclado, leitor de tela, dark
  mode, ToC, sidebar, Pagefind, `/busca/`, 404 e fontes.
- `G-CLOUDFLARE`: definir repositório remoto, conta/projeto, branch de produção,
  política de preview, rollback e custom domain antes de qualquer publicação.
- `G-PANEL`: só abrir integração no plugin depois do Docs publicado e conferido.

## Decisões confirmadas pelo owner

- Repositório separado em `Produto/Docs`.
- Acervo público, com uso livre para busca, citação, grounding e treinamento.
- Fontes Cal Sans e Outfit sob SIL Open Font License.
- Markdown no Git, sem WordPress como CMS.
- Nenhuma escrita em `Site-kits`, `Kits`, `Brain` ou na landing `epico.site`.

## Ambiente

- Diretório: `/Users/mac/Documents/EpicoStudio/Projetos/EpicoSite/Produto/Docs`.
- Node: `24.20.0` via nvm.
- npm: `11.19.0`.
- Astro: `7.3.1`.
- Starlight: `0.42.0`.
- Cloudflare: não configurado.
- Remoto: `EpicoStudio/epico-site-docs` no GitHub, privado, branch `main`.
- Última sessão: 2026-09-08.
