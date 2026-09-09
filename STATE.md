# Tutoriais Épico Site — estado de implementação

> Bookmark de retomada. Leia no começo e atualize por último em toda sessão.

- **Produto:** acervo público em `docs.epico.site`.
- **Stack:** Astro estático + Starlight + Cloudflare Workers Static Assets.
- **Autoridade editorial:** `src/content/docs/` neste repositório.
- **Fila canônica:** [`TASKS.md`](TASKS.md).
- **Decisão vigente:**
  [`docs/decisions/0001-public-docs-architecture.md`](docs/decisions/0001-public-docs-architecture.md).

## Estado corrente

- Scaffold Starlight (`DOCS-00` a `DOCS-02`) criado em 2026-09-07, auditado
  duas vezes (2026-09-07 e 2026-09-08) e com remoto privado
  `pagelab/epico-site-docs` (branch `main`) criado e enviado por ordem do
  owner. Node `24.20.0` e npm `11.19.0` fixados; Astro `7.3.1`, Starlight
  `0.42.0`. Mecanismos duráveis do gate: sidebar derivada de
  `src/lib/topics.mjs` (fonte única das seis áreas), lint de conteúdo com
  cercas CommonMark e barreiras anti-XSS guardadas por
  `tests/lint-policy.test.ts`, e `scripts/check-install-scripts.mjs` no
  `verify`, que falha com pacote de install script sem cobertura explícita no
  `allowScripts` canônico do npm 11.19.
- Corpus da fila `DOCS-03` completo (`03A` a `03E`, 2026-09-08): dez artigos
  nas seis áreas, com proveniência em `docs/provenance.md` (commit de
  referência por fonte, estados `migrado`/`fundido`/`conteúdo novo`, guardado
  por `tests/provenance.test.ts`). Override `"sharp": "^0.35.4"` no
  `package.json` remedia os advisories da cadeia `wrangler → miniflare`, com
  lockfile regenerado. Commit `52020ad` enviado por push por ordem do owner.
- `DOCS-04A` concluído em 2026-09-08 (commit `f127298`): gerador puro
  `src/lib/search-index.mjs` (payload versão 1, determinístico, teto de 200
  entradas e 256 KiB) e endpoint estático `src/pages/search-index.json.ts`.
  Rascunho, slug duplicado, URL hostil, slug não canônico, campo vazio, topic
  fora da allowlist, data inválida e PII falham o build com mensagem própria;
  lint trata `draft: true` como violação. Nove provas por mutação derrubadas e
  prova empírica com artigo real em rascunho falhando lint e build. Artefato:
  15 entradas em 1:1 com as rotas de docs, 3.726 bytes. Narrativa no
  `TASKS.md` §"Checkpoint de 2026-09-08: DOCS-04A".
- `DOCS-04B` concluído em 2026-09-08 (commit `3e9ddc5`, enviado por push):
  página `/busca/` estática via `StarlightPage` suportado, com
  navegação manual pelas seis áreas sempre no HTML (degradação sem
  JavaScript), busca no browser por `src/lib/search-client.mjs` (fetch com
  timeout de 5 s, teto de bytes, URL interna obrigatória, filtro literal com
  normalização de acento e teto de 30 resultados) e validação do payload por
  `validateSearchIndexPayload` no mesmo módulo puro do gerador, agora com teto
  simétrico de 500 caracteres por campo. Schema da coleção passou a tipar
  `topic`/`draft`/`lastReviewed` como opcionais: a exigência editorial segue
  no lint e no gerador do índice, e páginas utilitárias como `/busca/` e o
  futuro 404 não carregam área fictícia. Link "Busca" na sidebar via config,
  fora de `topics.mjs`. 55 testes novos (109 no total) e dez provas por
  mutação. Narrativa no `TASKS.md` §"Checkpoint de 2026-09-08: DOCS-04B".
- `DOCS-04C` concluído em 2026-09-08: bateria adversarial sobre as fatias
  04A/04B. Sondas empíricas acharam três lacunas reais no consumidor (URL
  duplicada aceita, timeout que não cobria a leitura do corpo, ausência de
  rejeição por `Content-Length`), todas endurecidas: o cronômetro do abort
  cobre handshake e corpo, `Content-Length` acima do teto rejeita antes de
  ler, duplicatas são descartadas com contagem, url com segmento final
  `index` é rejeitada nas duas pontas e o gerador passou a validar a URL
  resolvida com a barreira do consumidor (simetria estrutural). Suíte
  permanente `tests/search-adversarial.test.ts` sobre o artefato real:
  1:1 com as rotas, round-trip 100%, sem PII nem corpo (linhas longas do
  corpo ausentes dos bytes), TODOS os prefixos do artefato rejeitados
  (truncagem de rede), subconjunto sintético válido documentado como limite
  (completude não é alegável sem assinatura), sondas `__proto__`/`constructor`,
  teto inclusivo nas duas pontas e pipeline completo no teto de 200 entradas
  em tempo interativo. Doze provas por mutação (seis novas, seis de 04A/04B
  não mutadas), todas derrubando testes, restauração por checksum. Sondas
  HTTP contra o preview servido: 200 + `application/json`, bytes idênticos
  ao dist, Range 206 parcial rejeitado, `/busca/` estática íntegra e chunk do
  cliente com todas as barreiras e sem `innerHTML` (nota: o preview binda em
  `::1`). 129 testes em 7 arquivos. Narrativa no `TASKS.md` §"Checkpoint de
  2026-09-08: DOCS-04C".
- `DOCS-05` concluído em 2026-09-08: tema próprio em `src/styles/theme.css`
  usando apenas variáveis públicas `--sl-*` (paletas dark e light completas,
  seletores espelhados do vendor), nenhum override de componente, sem
  importar o `tokens.css` do painel. Cal Sans 600 nos headings via regra em
  elemento nativo e Outfit variável no corpo, as duas únicas WOFF2, copiadas
  de `Design/Fontes/` com checksums idênticos aos do painel, preload via
  hook público `head`, licenças OFL acompanhando os arquivos e
  proveniência/SHA-256 registrados em `docs/fonts.md`. Gate permanente de
  contraste `scripts/check-theme-contrast.mjs` no `verify`: 18 pares medidos
  nas duas paletas, todos AA (pior caso 5.12:1). Medições antes do gate
  visual com `scripts/measure-theme.mjs` (Chrome headless via CDP,
  ferramenta de sessão): LCP desktop até 1.488 ms a frio e mobile 4x/Fast 3G
  abaixo de 0.6 s, CLS 0.0000 em tudo (a `/busca/` media 0.07 e ganhou
  revelação inline síncrona antes da primeira pintura, contrato sem
  JavaScript preservado), foco visível em seis Tabs, reduced motion sem
  animações e mobile sem overflow. Doze provas por mutação. Narrativa no
  `TASKS.md` §"Checkpoint de 2026-09-08: DOCS-05".
- `DOCS-06` concluído em 2026-09-09: publicação estática segura sem deploy.
  `public/_headers` com CSP por hash SHA-256 dos dez scripts inline servidos
  (sem `unsafe-inline` em script-src, `img-src 'self' data:` para os ícones
  SVG que o vendor injeta em runtime), headers de segurança só na regra
  global, `Cache-Control immutable` para `/_astro/*` e
  `X-Robots-Tag: noindex` apenas nas duas formas de URL `workers.dev`
  (produção e preview de versão), deixando o custom domain indexável.
  `public/robots.txt` com Allow e Sitemap canônico. Política pública de uso
  (busca, citação, grounding e treinamento) declarada no `llms.txt` via
  `details` do plugin. `wrangler.jsonc` com static assets, data fixa
  `2026-09-07`, `not_found_handling: 404-page` sem SPA fallback e sem
  `main`. 404 custom em `src/content/docs/404.md` (página utilitária: fora
  do índice de busca e dos llms, frontmatter reduzido no lint) e coleção
  `i18n` declarada com `pt-br.json`, resolvendo os dois avisos de build.
  Gate permanente `scripts/check-publishing.mjs` no `verify` (fontes +
  artefato: conjunto exato de hashes, sitemap 1:1 com o dist, 404 e política
  conferidos), 29 testes novos, quinze provas por mutação, sondas HTTP
  contra `wrangler dev` local (headers, noindex por Host, 404 real status
  404, immutable, artefatos) e sonda Chrome via CDP
  `scripts/probe-csp.mjs` (ferramenta de sessão) com zero violações de CSP,
  funcionalidade íntegra e script inline hostil bloqueado. Narrativa no
  `TASKS.md` §"Checkpoint de 2026-09-09: DOCS-06".
- Pagefind, sitemap e `llms.txt`, `llms-full.txt` e `llms-small.txt` são
  gerados.
- `npm run verify` verde: Astro Check sem diagnósticos e sem avisos, lint
  limpo, 167 testes em 9 arquivos, contraste do tema PASS, Static publishing
  PASS, build de 17 páginas (acervo + `/busca/` + 404 custom) +
  `/search-index.json`, zero vulnerabilidades e política de install scripts
  PASS.
- Nenhum projeto Cloudflare, domínio ou deploy foi configurado: o
  `wrangler.jsonc` e o `_headers` são configuração estática verificada
  localmente. A visibilidade pública do remoto e a branch de produção
  aguardam as decisões de `DOCS-08`.

## ▶ Próxima ação

Executar `DOCS-07`: QA local completo e preview pronto para aceite.
`npm ci` em árvore limpa e `npm run verify` com exit code zero, inspeção
dos artefatos construídos (Pagefind, `/busca/`, 404 custom, `_headers`,
robots, sitemap, llms), QA interativo no browser (debounce da busca,
deep-link `?q=`, leitor de tela, ToC, sidebar, dark mode percebido) e
preview de plantão para o owner revisar, sem chamar o resultado de aceito.
Gates `G-CONTENT`, `G-VISUAL` e `G-CLOUDFLARE` continuam fechados até o
QA existir.

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
- Commit e push ao fim de cada sessão deste repositório dispensam ordem
  específica, desde que o gate `npm run verify` tenha terminado com exit code
  zero na sessão (owner, 2026-09-08). A regra vale para o ciclo do Docs e não
  abre deploy, preview, DNS ou qualquer gate humano.

## Ambiente

- Diretório: `/Users/mac/Documents/EpicoStudio/Projetos/EpicoSite/Produto/Docs`.
- Node: `24.20.0` via nvm.
- npm: `11.19.0`.
- Astro: `7.3.1`.
- Starlight: `0.42.0`.
- Cloudflare: não configurado.
- Remoto: `pagelab/epico-site-docs` no GitHub, privado, branch `main`.
- Última sessão: 2026-09-09 (`DOCS-06` concluído; commit e push cobertos pela
  autorização durável de fim de sessão).
- Andamento do Docs vive SOMENTE neste workspace (ordem do owner em
  2026-09-08): o `STATE.md` da Área de Clientes apenas redireciona para cá.
