# Tutoriais Épico Site — estado de implementação

> Bookmark de retomada. Leia no começo e atualize por último em toda sessão.

- **Produto:** acervo público em `docs.epico.site`.
- **Stack:** Astro estático + Starlight + Cloudflare Workers Static Assets.
- **Autoridade editorial:** `src/content/docs/` neste repositório.
- **Fila canônica:** [`TASKS.md`](TASKS.md).
- **Decisões vigentes:**
  [`docs/decisions/0001-public-docs-architecture.md`](docs/decisions/0001-public-docs-architecture.md),
  [`docs/decisions/0002-cloudflare-publication.md`](docs/decisions/0002-cloudflare-publication.md)
  e [`docs/decisions/0003-dominio-canonico-tutoriais.md`](docs/decisions/0003-dominio-canonico-tutoriais.md).

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

## ▶ Próxima ação

Owner decide e executa três passos de credencial/permissão (nenhum é
substituível por API a partir desta sessão):

1. Redirect HTTP→HTTPS de `tutoriais.epico.site`: no dashboard da zona
   `epico.site`, ou `Always Use HTTPS` em SSL/TLS → Edge Certificates (vale
   para a zona inteira) ou uma Redirect Rule escopada a
   `http.host eq "tutoriais.epico.site"` (preferível, não toca nos outros
   hosts da zona). A mesma regra pode redirecionar o hostname antigo
   `docs.epico.site` para o novo preservando o caminho, caso links tenham
   sido salvos (ADR 0003). Alternativa: incluir permissão de Zone
   Rules/Settings no token renovado no passo 3 e deixar a sessão aplicar via
   API.
2. Instalar o GitHub App da Cloudflare para `pagelab`: o app exato chama
   "Cloudflare Workers and Pages" (dono oficial `cloudflare`, verificado pela
   API do GitHub em 2026-09-10), em
   https://github.com/apps/cloudflare-workers-and-pages. Ele não aparece em
   busca de marketplace e o caminho canônico é o dashboard: Workers & Pages →
   `epico-site-docs` → Settings → Builds → Connect → GitHub, autorizando
   `pagelab/epico-site-docs` (slug `cloudflare-workers-and-pages`; os antigos
   `cloudflare-workers`/`cloudflare-pages` não existem mais, e o app de slug
   `cloudflare` é de terceiro, TappNetwork). Pré-requisito de dashboard
   exigido pela doc oficial da API de Builds.
3. Renovar o token da API em
   `https://dash.cloudflare.com/profile/api-tokens` (token Custom Token
   criado NO PERFIL DO USUÁRIO, com as permissões listadas abaixo). O token
   NÃO passa por chat: o owner o aplica em `~/.zcode/cli/config.json` nas
   quatro entradas autenticadas (`cloudflare-api`, `cloudflare-bindings`,
   `cloudflare-builds`, `cloudflare-observability`, cabeçalho
   `Authorization: Bearer`), ou salva em arquivo local temporário e informa
   SÓ O CAMINHO à sessão, que aplica por script sem imprimir o valor. Depois
   reiniciar o agente (o config das MCPs é lido na inicialização). As
   permissões conferidas pelo owner em 2026-09-10 no dashboard pt-BR:
   Conta `Configuração de builds de Workers: Editar`,
   `Scripts do Workers: Ler`, `Cauda do Workers: Ler`, Zona
   `Redirecionamento único: Editar` (Single Redirect, chave interna
   `Dynamic URL Redirects Write`) e `Zona: Ler`, com Account Resources na
   conta específica e Zone Resources na zona `epico.site`. Linhas opcionais:
   `Configurações da conta: Ler` (MCP api listar contas) e a
   `Usuário/Tokens de API: Ler` que o owner já tinha adicionado. GitHub App
   instalado e repositório conectado pelo owner no dashboard em 2026-09-10.

Com isso, a sessão completa o `DOCS-08`: conexão e triggers do Workers Builds
(org `pagelab` 1451087, repo 1361499499, build command `npm ci && npm run
verify`), redirect HTTP→HTTPS se vier por API, e re-sonda completa
(`probe-production.mjs` 16/16). Decisão pendente separada: desligar a injeção
automática de Web Analytics na zona ou adotar analytics deliberadamente
(hoje o beacon é bloqueado pela CSP estrita, sem tracking).

## Gates vivos

- `G-CONTENT`: aceito pelo owner em 2026-09-10.
- `G-VISUAL`: aceito pelo owner em 2026-09-10.
- `G-CLOUDFLARE`: parâmetros decididos na ADR 0002 e produção publicada por
  bootstrap em 2026-09-10 (custom domain + canary no ar, sonda 15/16). Faltam
  para fechar: redirect HTTP→HTTPS (owner na zona), Workers Builds (GitHub App
  no dashboard + token de API) e decisão sobre o beacon de Web Analytics.
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
- Cloudflare: Worker `epico-site-docs` em produção (versão
  `5d188d17-9905-46f2-820b-a1dbc50d477c`) com custom domain
  `tutoriais.epico.site` e canary `epico-site-docs.epico.workers.dev`. OAuth
  do wrangler válido (conta `contato@uberfacil.com`). Token do MCP ainda
  inválido.
- Remoto: `pagelab/epico-site-docs` no GitHub, privado, branch `main`.
- Última sessão: 2026-09-10 (bootstrap de produção do `DOCS-08` e troca do
  domínio canônico para `tutoriais.epico.site` por decisão do owner, ADR
  0003: custom domain novo anexado, antigo removido, gate sem literal de
  domínio, sonda 15/16 no novo host, CSP de produção íntegra com beacon de
  analytics bloqueado, Workers Builds bloqueado em GitHub App + token;
  verify verde com 176 testes; commit e push cobertos pela autorização
  durável).
- Andamento do Docs vive SOMENTE neste workspace (ordem do owner em
  2026-09-08): o `STATE.md` da Área de Clientes apenas redireciona para cá.
