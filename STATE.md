# Tutoriais Épico Site — estado de implementação

> Bookmark de retomada. Leia no começo e atualize por último em toda sessão.

- **Produto:** acervo público em `docs.epico.site`.
- **Stack:** Astro estático + Starlight + Cloudflare Workers Static Assets.
- **Autoridade editorial:** `src/content/docs/` neste repositório.
- **Fila canônica:** [`TASKS.md`](TASKS.md).
- **Decisões vigentes:**
  [`docs/decisions/0001-public-docs-architecture.md`](docs/decisions/0001-public-docs-architecture.md),
  [`docs/decisions/0002-cloudflare-publication.md`](docs/decisions/0002-cloudflare-publication.md),
  [`docs/decisions/0003-dominio-canonico-tutoriais.md`](docs/decisions/0003-dominio-canonico-tutoriais.md),
  [`docs/decisions/0004-web-analytics-cloudflare.md`](docs/decisions/0004-web-analytics-cloudflare.md)
  e [`docs/decisions/0005-repositorio-publico.md`](docs/decisions/0005-repositorio-publico.md).

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
- `DOCS-07` concluído em 2026-09-09: QA local completo e preview de plantão.
  `npm ci` em árvore limpa (`node_modules`/`dist`/`.astro` removidos) com
  zero vulnerabilidades e `npm run verify` exit 0. Artefatos inspecionados
  (Pagefind 1.5.2 pt-br com 16 páginas, `/busca/` estática, 404 custom,
  `_headers`, robots, sitemap, llms, fontes). QA interativo via
  `scripts/qa-interactive.mjs` (Chrome CDP com teclado/mouse reais,
  ferramenta de sessão): deep-link `?q=`, debounce de 150 ms com digitação
  real (uma única leva de render), submit imediato, tema percebido com
  persistência, ToC 7/7, sidebar seis áreas + Busca, a11y estrutural limpa
  (landmarks, h1 único, `aria-live` anunciando contagem), mobile sem
  overflow e onze screenshots inspecionados. Achado real corrigido: a CSP
  do DOCS-06 quebrava o modal do Pagefind (WASM sem
  `'wasm-unsafe-eval'` em `script-src`, `WebAssembly.instantiate`
  rejeitado, modal preso em "Searching"); o token estrito entrou no
  `_headers`, o gate passou a exigir e a suíte ganhou o teste (168
  testes), com prova por mutação e re-sonda empírica do modal funcionando.
  Ressalvas para o owner: mensagens do Pagefind em inglês (decisão do
  `G-VISUAL`), troca de tema via evento `change` no headless e VoiceOver
  real é verificação humana. Narrativa no `TASKS.md` §"Checkpoint de
  2026-09-09: DOCS-07".
- Primeira passagem de `G-VISUAL/G-CONTENT` aplicada localmente em 2026-09-09,
  sem aceite: logo SVG fornecido no cabeçalho via override pontual de
  `SiteTitle`, com os dois paths inline, título textual acessível, largura
  renderizada de 164 px e `max-width: 165px`; light usa wordmark `#3d4b51` e
  mark `#2135dd`, dark usa `#ffffff` nos dois, sem filtro. Os demais
  refinamentos pedidos cobrem sidebar, navegação, headings, links, botões e
  Pagefind, além da remoção somente do negrito nos quatro tópicos indicados
  do FAQ.
  As cores viraram tokens responsivos: valores literais pedidos no light e
  equivalentes do design system da Área de Clientes no dark. Inspeção cobriu
  desktop light/dark, Pagefind com resultados e mobile 390 px. Por correção
  do owner, o diálogo do Pagefind agora compartilha o token responsivo de
  fundo da sidebar, não o rosa de navegação ativa; a equivalência foi
  confirmada por valores computados nos dois temas. O scrollbar da sidebar
  usa trilha transparente à superfície e sem borda, com thumb tokenizado em
  `#e8eefb` no light e `#2c3240` no dark; CSS padrão e WebKit foram
  conferidos no browser. No breakpoint a partir de 50 rem, `.large` usa
  `var(--sl-text-sm)`, confirmado no browser como 14 px no viewport de
  1280 px. O header recebeu o brand strip de 5 px do painel por token local,
  usando `--epico-color-action-primary`; o browser confirmou `#3253e8` no
  light e `#8098f6` no dark. O seletor de tema usa ícones de `0.9em` e largura
  calculada para exibir “Escuro” integralmente. O hero usa o WebP local com
  alt descritivo na coluna direita e grid desktop `6fr 5fr`. O preset fixo
  `400 × 400` do componente do Starlight cortava a imagem; por correção do
  owner, o override local de `Hero` usa os metadados intrínsecos `609 × 306`
  e largura responsiva. Browser confirmou atributos e recurso natural
  `609 × 306`, com proporção renderizada de 1,9904 e sem corte; build gerou
  a variante otimizada de 15 kB. `--sl-color-hairline-light` referencia
  `--sl-color-gray-5` nas duas paletas, confirmado no browser como `#323648`
  no dark e `#babdc9` no light. O owner removeu a superfície rosa do item
  ativo da sidebar: links usam padding uniforme de `.6em`, o item ativo usa
  raio de 5 px e os tokens semânticos apontam o texto para
  `--epico-color-action-primary` e o fundo para `--sl-color-black`. O browser
  confirmou `#3253e8` sobre branco no light, `#8098f6` sobre a superfície da
  sidebar no dark, padding computado de 9,6 px e raio de 5 px nas duas
  paletas. O gate mede 5,94:1 no light e 6,65:1 no dark. O hero manteve
  `src/assets/hero-image.webp` por correção do owner, e o grid `6fr 5fr`
  passou para o override local. Os botões primary e minimal compartilham o
  mesmo padding por breakpoint. Dois `summary-card` derivados da página
  Início do painel aparecem após o parágrafo da home, com tokens próprios
  light/dark e hover real conferido. O override público `SocialIcons` serve
  os links Área de clientes (`https://app.epico.site/painel`) e Épico Site no
  header e menu móvel com os SVGs fornecidos, `currentColor` e
  `--sl-icon-size: 1.2em`. Ao fim da primeira rodada de revisão, o owner
  autorizou commit e push: `npm run verify` exit 0 na sessão (173 testes) e
  árvore enviada para `origin/main`. Os gates `G-CONTENT` e `G-VISUAL` seguem
  em aberto até os aceites explícitos. Narrativa no `TASKS.md`
  §"Checkpoint de 2026-09-09: primeira passagem de G-VISUAL/G-CONTENT".
- Refinamento visual adicional aplicado localmente em 2026-09-09, ainda sem
  aceite: os tokens de título passaram a `--sl-text-4xl`, `--sl-text-3xl`,
  `--sl-text-2xl` e `--sl-text-xl`. Para H4 foi usado o token nativo
  `--sl-text-xl`, equivalente a 20 px, porque o Starlight 0.42 não define
  `--sl-text-1xl`. O browser confirmou 35, 29, 24 e 20 px nas duas paletas.
  O efeito espacial canônico do `epico.site` foi reproduzido no
  `body::after` com uma máscara para o topo e a imagem
  `src/assets/outer-space.webp` servida localmente, preservando a CSP
  `img-src 'self' data:`. O pseudo usa `height: 40em`; `isolation` permanece
  automático no `body`, como na referência, para que `mix-blend-mode: color`
  componha corretamente no light. O conjunto foi escopado a
  `body:has(.hero)`, marcador exclusivo da homepage. Em viewport desktop a
  imagem usa `color` e opacidade 1 no light, `screen` e opacidade 0,7 no dark.
  Abaixo de 769 px o pseudo da homepage permanece, mas sem
  `background-image`, evitando baixar o asset. Rotas editoriais sem hero não
  recebem o pseudo nem solicitam a imagem. O build emitiu
  `_astro/outer-space.DBburU8Q.webp` com 34.510 bytes e SHA-256
  `d15fd91727da2471e5e428dfdf6c8d2a08e33f95a62e812efee5cbe9b3ab1936`.
  Os `summary-card` passaram a ter fundo transparente, e o gate de contraste
  mede título, eyebrow e ação contra o fundo real da página. O browser confirmou
  `scrollHeight` igual à altura do conteúdo na homepage, pseudo de 800 px,
  blend `color`/`screen`, cards transparentes com borda `gray-3` no dark e
  `gray-5` no light, e o primeiro parágrafo centralizado nas duas paletas.
  O `body::before` foi removido por completo. Em `/primeiros-passos/`, o
  browser confirmou ausência de hero, pseudos sem imagem e `scrollHeight` sem
  contribuição do overlay.
  O primeiro parágrafo de cada `.sl-markdown-content` também passou a usar
  alinhamento central, conforme o ajuste literal do owner.
- Aceites humanos e definição do `G-CLOUDFLARE` em 2026-09-10: o owner aceitou
  `G-CONTENT` e `G-VISUAL` ("accepted/verdes") e autorizou abrir os demais
  gates. A publicação foi decidida na
  [`docs/decisions/0002-cloudflare-publication.md`](docs/decisions/0002-cloudflare-publication.md):
  branch `main` de `pagelab/epico-site-docs`, Worker `epico-site-docs` sem
  `main`, bindings ou segredos, deploy canônico por Workers Builds rodando
  `npm ci && npm run verify` (deploy só com gate exit 0), `wrangler deploy`
  local como bootstrap, previews fora de `main` só em `*.workers.dev` já
  `noindex`, rollback por versions ou `git revert`, e `docs.epico.site` como
  Workers Custom Domain. A sonda de verificação pós-deploy
  `scripts/probe-production.mjs` foi escrita (DNS/TLS, HTTP, CORS, cache/ETag
  com 304, sitemap 1:1 com o dist, robots, llms, search-index byte a byte,
  CSP e canary workers.dev). O deploy em si não aconteceu: o token do MCP da
  API Cloudflare é inválido, o OAuth do wrangler expirou e cinco tentativas
  de `wrangler login` com aba aberta no navegador expiraram sem aprovação.
  Na sequência, a pedido do owner, o setup oficial de agente Cloudflare
  (`developers.cloudflare.com/agent-setup/prompt.md`) foi executado: 14
  skills oficiais instaladas em `~/.zcode/skills` e os cinco servidores MCP
  remotos registrados em `~/.zcode/cli/config.json` (api já existia com o
  token expirado; docs sem autenticação; bindings, builds e observability
  com o mesmo Bearer). Backup do config em `config.json.bak-agent-setup`.
  Narrativa no `TASKS.md` §"Checkpoint de 2026-09-10".
- Pagefind, sitemap e `llms.txt`, `llms-full.txt` e `llms-small.txt` são
  gerados.
- Bootstrap de produção do `DOCS-08` executado em 2026-09-10: o OAuth do
  wrangler foi renovado pelo owner (conta `contato@uberfacil.com`), a zona
  `epico.site` foi confirmada ativa e o Worker `epico-site-docs` foi publicado
  com o custom domain `docs.epico.site` e a origem canary
  `epico-site-docs.epico.workers.dev` (subdomínio real da conta é `epico`;
  com `routes` declaradas o wrangler exige `workers_dev: true` explícito, senão
  desliga o canary). Versão em produção `ca95ddeb-1d19-4873-aedf-083b27460b27`
  (bootstrap autorizado pela ADR 0002 ponto 3, com `npm run verify` exit 0
  antes de cada deploy). O gate `check-publishing.mjs` passou a exigir
  `workers_dev`, `preview_urls` e a rota custom domain exata, com testes e
  provas por mutação (176 testes no total). `scripts/probe-production.mjs`
  15/16 em produção (a sonda teve quatro expectativas corrigidas: SAN
  wildcard, 307 do runtime de assets, política llms só no `llms.txt` e
  subdomínio real). `scripts/probe-csp.mjs` contra produção: funcionalidade
  íntegra e script hostil bloqueado. Restam duas ações do owner para fechar o
  task: redirect HTTP→HTTPS na zona (setting ou Redirect Rule escopada) e os
  dois pré-requisitos do Workers Builds (instalação do GitHub App da Cloudflare
  para `pagelab` no dashboard + token de API com permissão de Builds, o
  `cfat_` do MCP segue inválido). Narrativa no `TASKS.md` §"Checkpoint de
  2026-09-10: bootstrap de produção do DOCS-08".
- Último baseline fechado (`DOCS-07`) tinha `npm run verify` verde com 168
  testes. A árvore da primeira passagem está verde com `npm run verify` exit
  0: Astro Check sem diagnósticos, lint e política de conteúdo PASS, 173
  testes, 32 pares de contraste PASS, build de 17 páginas, publicação
  estática PASS, zero vulnerabilidades e política de install scripts PASS. O
  advisory `GHSA-7w5x-hrqm-74c2`, surgido durante a sessão na cópia
  `smol-toml@1.7.0` do markdownlint, foi removido por override exato para
  `1.8.0`, sem o downgrade destrutivo sugerido pelo npm.
- Produção no ar desde 2026-09-10 por bootstrap do `DOCS-08`: Worker
  `epico-site-docs` com static assets, custom domain `tutoriais.epico.site`
  (domínio canônico trocado de `docs.epico.site` no mesmo dia por decisão do
  owner, ADR 0003, hostname antigo removido sem redirect) e canary
  `epico-site-docs.epico.workers.dev` noindex. Pendências para fechar o
  task: redirect HTTP→HTTPS na zona (owner, agora para `tutoriais`), Workers
  Builds (GitHub App no dashboard + token de API válido, ver ▶ Próxima
  ação) e a decisão sobre o beacon de Web Analytics bloqueado pela CSP. A
  visibilidade pública do remoto permanece decisão separada.
- `DOCS-08` concluído em 2026-09-10 com o deploy canônico do ciclo: o token
  `cfut_` aplicado pelo owner no config das MCPs passou no verify da API, os
  triggers do Workers Builds já estavam conectados e configurados pelo owner
  exatamente como a ADR 0002 (produção no `main` com build
  `npm ci && npm run verify` e deploy `npx wrangler deploy`, preview nas
  demais branches com `npx wrangler versions upload`). Build manual de
  validação falhou NO GATE (MD034 de URL crua no bookmark `c3e8ab9`) e o
  deploy foi bloqueado, provando o critério estrutural da ADR. Corrigido o
  bookmark (commit `366ad28`), o push disparou build automático verde
  (`72f8af46`), deployment `99adcca2` e versão `0cee9266` em produção.
  Single Redirect HTTP→HTTPS criado por API (ruleset `afc7e7ad` da zona,
  expressão `(not ssl) and (http.host eq "tutoriais.epico.site")`, 301 com
  path e query preservados, escopo só no host novo) e validado sem loop.
  `scripts/probe-production.mjs` 16/16, agora com o redirect em verde.
  Narrativa no `TASKS.md` §"Checkpoint de 2026-09-10: fechamento do
  `DOCS-08`".
- ADR 0004/0005 aplicadas em 2026-09-10 por decisão do owner: o Web
  Analytics da Cloudflare foi ADOTADO pela injeção automática da zona, com
  `script-src` aberto pontualmente para
  `https://static.cloudflareinsights.com` (host, porque a edge injeta o
  beacon com path versionado e SRI), `connect-src` permanecendo exatamente
  `'self'` (injeção automática reporta para o próprio domínio, pela FAQ
  oficial), gate `check-publishing.mjs` EXIGINDO o host com mensagem
  própria, teste de mutação novo (177 testes) e prova por mutação no
  `_headers` real. Deploy pelo ciclo canônico (push `5936c02` → build
  `7a426b3b` verde) e sondas: `probe-production.mjs` 16/16 e
  `probe-csp.mjs` com ZERO violações de console, beacon carregando e
  script hostil bloqueado. O repositório remoto foi tornado PÚBLICO
  (<https://github.com/pagelab/epico-site-docs>) após scan do histórico
  inteiro por credenciais reais com zero achados. Narrativa no `TASKS.md`
  §"Checkpoint de 2026-09-10: ADR 0004/0005".
- Verificação pós-adoção do analytics em 2026-09-14: sonda Chrome+CDP provou
  o ciclo completo no HTTP (GET do beacon 200 pela CSP nova, POST
  `/cdn-cgi/rum` com payload real respondido 204, zero erros de console).
  Porém a GraphQL Analytics API mostra o `siteTag` do beacon da zona com
  ZERO pageviews em 10-14/09 enquanto os demais sites da conta contabilizam
  quase em tempo real: a edge aceita o RUM e o dataset não contabiliza.
  A listagem de sites RUM por REST recusa Bearer (erro 10405), então a
  distinção entre site pausado/legado e defasagem do produto fica para o
  dashboard da zona, na mão do owner. A CSP da ADR 0004 autoriza por host,
  então religar o produto da zona (que gera site novo) não quebra nada no
  acervo. Narrativa no `TASKS.md` §"Checkpoint de 2026-09-14".
- Padronização dos nomes públicos publicada em 2026-09-14, por ordem direta
  do owner: seis artigos agora usam **Núcleo** (`static_conversion`),
  **Horizonte** (`headless_setup`) e **Fronteira** (`headless_agency`), sem
  alterar as chaves internas, slugs ou URLs. O lint passou a rejeitar os três
  nomes históricos no conteúdo público e ganhou quatro provas permanentes.
  Gate completo no runtime fixado: 181 testes, build de 17 páginas, zero
  vulnerabilidades e `npm run verify` exit 0. O catálogo comercial da Área de
  Clientes ficou fora do recorte porque seu `STATE.md` registra preço, escopo
  e CTA como decisão pendente sem mapeamento 1:1. PR #1 integrado no merge
  `cc6913b`, Workers Build `08831b18` verde, sonda canônica 16/16 e conferência
  HTTP dos seis artigos com os três nomes novos e zero nomes históricos.
  Narrativa no `TASKS.md` §"Checkpoint de 2026-09-14: nomes públicos Núcleo,
  Horizonte e Fronteira".
- Refinamento editorial preparado em 2026-09-14 por nova decisão do owner:
  os nomes passam a ser sempre **Site Núcleo**, **Site Horizonte** e **Site
  Fronteira**, nessa ordem quando reunidos em lista. Os seis artigos, a regra
  durável de `AGENTS.md` e o lint foram sincronizados. A política agora rejeita
  nomes históricos, nomes novos sem o prefixo `Site` e listas/tabelas com os
  três serviços fora da ordem canônica. Dez provas de vocabulário, 187 testes
  no total; chaves internas, slugs, URLs e catálogo comercial externo seguem
  intocados. Narrativa no `TASKS.md` §"Checkpoint de 2026-09-14:
  prefixo Site e ordem canônica dos serviços".
- Fechamento do prefixo em 2026-09-15: o owner declarou features e QA verdes
  e a sessão integrou o PR #2 (merge `83c66ed`), com Workers Build verde,
  sonda `probe-production.mjs` 16/16 e conferência HTTP dos seis artigos
  servidos (nomes completos presentes, zero formas históricas ou
  incompletas). A produção está no ar com o vocabulário final.
- `DOCS-09` executado em 2026-09-15 por ordem direta do owner: tutoriais de
  operação do painel do kit `epico-base` no WordPress. Análise do painel por
  leitura do código do kit no commit de referência
  `8b7c7cdae1ed62d7332e10d1a9195af9e7a295b2` (plugin 1.24.1, cinco agentes
  de leitura, rótulos pt_BR do catálogo do plugin, motivações dos docblocks
  e do histórico git do kit, nenhuma escrita no kit). Nova área
  `painel-epico-site` como sétima entrada de `topics.mjs` e doze artigos
  cobrindo todas as seções do painel: nove abas, submenu Licença e telas de
  leads e iscas. Proveniência ampliada. Gate verde: `npm run verify` exit 0,
  187 testes, build de 29 páginas, índice com 27 entradas em 7,4 kB, zero
  vulnerabilidades. Mudança na branch `codex/tutoriais-painel-epico-site`
  com PR aberto, aguardando o fluxo editorial. Narrativa no `TASKS.md`
  §"Checkpoint de 2026-09-15: fechamento do PR #2 e tutoriais do painel do
  kit".
- Fechamento do `DOCS-09` em 2026-09-15: o owner revisou o PR #3 e declarou
  a revisão ok, autorizando a integração. Merge commit `52cce8e` no `main`,
  Workers Build de produção verde (check run `success`, versão
  `02128101-28c9-4877-bd27-108fbf557a71`), `scripts/probe-production.mjs`
  16/16 e conferência HTTP da nova área em produção: 12 rotas 200, 12
  entradas no índice (27 no total), sidebar de página interna e navegação
  manual da `/busca/` com a sétima área. `G-PANEL` liberado. Narrativa no
  `TASKS.md` §"Checkpoint de 2026-09-15: integração do PR #3 e fechamento
  do DOCS-09".
- `DOCS-10` executado em 2026-09-15 por ordem direta do owner: o clique no
  ícone de corrente dos títulos agora COPIA o deep link da seção (URL
  absoluta com fragmento percentual-codado) em vez de apenas navegar. Script
  público estático `public/scripts/anchor-link-copy.js` carregado pelo hook
  `head` em todas as páginas (CSP cobre por `'self'`, sem hash novo no
  `_headers`), clique com modificador segue nativo, feedback por check +
  tooltip com o par de botão já medido pelo gate de contraste e anúncio em
  região live, fallback `execCommand` para clipboard indisponível e sem
  JavaScript o link navega como antes. Override `heading.anchorLabel`
  ("Copiar link da seção...") com renome `pt-br.json` → `pt-BR.json`: o
  lookup do vendor casa o arquivo com o `lang` BCP-47 do locale e o nome
  antigo nunca aplicava (localmente foi preciso limpar `.astro` pelo
  filesystem case-insensitive). Namespace do SVG do check percentual-codado
  no data URI para preservar a barreira de tema sem URL remota. Suíte
  `tests/anchor-copy.test.ts` com funções puras dos bytes servidos (11
  testes, 198 no total), três provas por mutação e sonda empírica
  `scripts/probe-anchor-copy.mjs` PASS contra `wrangler dev` com headers
  reais (clipboard byte a byte, sem hash na URL, feedback presente e
  restaurado, Ctrl+clique nativo, zero violações de CSP). `npm run verify`
  exit 0. Push `983d57a` com Workers Build de produção verde,
  `scripts/probe-production.mjs` 16/16 e conferência HTTP em produção:
  `/scripts/anchor-link-copy.js` servido, tag presente no HTML da página e
  rótulo "Copiar link da seção" renderizado. Narrativa no `TASKS.md`
  §"Checkpoint de 2026-09-15: cópia do deep link de títulos (DOCS-10)".

## ▶ Próxima ação

Fila local sem tasks abertos (`DOCS-00` a `DOCS-10` concluídos). A próxima
ação é do owner, fora deste workspace: abrir `PANEL-01A` em sessão própria
no workspace Área de Clientes para linkar as seções do painel do kit às
páginas publicadas de `/painel-epico-site/`, agora liberado pelo `G-PANEL`
(verificar o registro da abertura no `STATE.md` daquele workspace). A
conferência do dashboard do Web Analytics da zona `epico.site` (dataset do
`siteTag` zerado no GraphQL desde 2026-09-14) continua como follow-up
independente do owner. Este repositório só volta a agir por novo task do
owner; o build canônico de produção a cada push no `main` segue automático.

## Gates vivos

- `G-CONTENT`: aceito pelo owner em 2026-09-10.
- `G-VISUAL`: aceito pelo owner em 2026-09-10.
- `G-CLOUDFLARE`: fechado em 2026-09-10. Produção no ar em
  `tutoriais.epico.site` pelo deploy canônico do Workers Builds (gate verde
  obrigatório, validado nos dois sentidos), redirect HTTP→HTTPS ativo por
  Single Redirect escopado, sonda `probe-production.mjs` 16/16, canary
  workers.dev noindex e beacon do Web Analytics autorizado pela CSP da
  ADR 0004 (carregando e enviando, 204, com `probe-csp.mjs` em zero
  violações). Ressalva viva da verificação de 2026-09-14: o dataset do
  `siteTag` da zona segue zerado no GraphQL, conferência no dashboard é do
  owner (ver ▶ Próxima ação).
- `G-PANEL`: liberado em 2026-09-15. A condição "Docs publicado e conferido"
  está satisfeita (merge `52cce8e`, sonda 16/16 e conferência da área
  `/painel-epico-site/` em produção). A integração no plugin (`PANEL-01A`)
  abre por ordem do owner em sessão própria no workspace Área de Clientes.

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
- Cloudflare: Worker `epico-site-docs` em produção (versão
  `02128101-28c9-4877-bd27-108fbf557a71`, deployment de 2026-09-15T14:32:50Z
  pelo Workers Builds do merge `52cce8e`) com custom domain
  `tutoriais.epico.site`, canary
  `epico-site-docs.epico.workers.dev` noindex e Single Redirect HTTP→HTTPS
  escopado ao host (301 com path e query). OAuth do wrangler válido (conta
  `contato@uberfacil.com`). Token `cfut_` da API ativo nas quatro MCPs
  autenticadas (Builds user-scoped, Workers Scripts read, Tail read, Single
  Redirect write, zona read). Workers Builds conectado a
  `pagelab/epico-site-docs` com deploy automático no `main` condicionado ao
  `npm ci && npm run verify` (trigger produção `ea467d5c`, preview
  `7f74ef20`).
- Remoto: `pagelab/epico-site-docs` no GitHub, PÚBLICO (ADR 0005), branch
  `main`.
- Última sessão: 2026-09-15 (`DOCS-10` por ordem direta do owner: clique no
  ícone de corrente dos títulos copia o deep link da seção, com `npm run
  verify` exit 0 na sessão — 198 testes —, três provas por mutação e sonda
  `probe-anchor-copy.mjs` PASS contra `wrangler dev`; fila local sem tasks
  abertos).
- Andamento do Docs vive SOMENTE neste workspace (ordem do owner em
  2026-09-08): o `STATE.md` da Área de Clientes apenas redireciona para cá.
