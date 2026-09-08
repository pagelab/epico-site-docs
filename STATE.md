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
  `pagelab/epico-site-docs` e fez push do branch `main`. O remoto provisório na
  organização `EpicoStudio` foi criado e removido no mesmo dia por ordem do
  owner, que concentra na conta `pagelab` os repositórios conectados ao
  Cloudflare. Nenhum projeto Cloudflare, domínio ou deploy foi configurado.
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
- `DOCS-03A` concluído em 2026-09-08: `formatos-de-publicacao` (de
  `01-entenda-o-novo-formato.md`) e `edicao-e-personalizacao` (de
  `03-edicao-e-personalizacao.md`) publicados no acervo com ajustes editoriais
  mínimos exigidos pelas regras. O mapa de proveniência do corpus vive em
  `docs/provenance.md`, com commit de referência de cada fonte para o diff da
  revisão factual, e é guardado por `tests/provenance.test.ts`. `npm run verify`
  verde: 33 testes em 4 arquivos e build de 10 páginas.
- Commit local e push das mudanças do `DOCS-03A` para
  `pagelab/epico-site-docs` executados a pedido do owner em 2026-09-08.
- `DOCS-03B` concluído em 2026-09-08: `precos-e-hospedagem` (de
  `02-precos-e-hospedagem.md`) e `suporte-e-propriedade` (de
  `04-suporte-e-propriedade.md`) publicados na área `servicos-e-suporte` com ajustes
  editoriais mínimos exigidos pelas regras (pontos e vírgula, um travessão longo e
  "setup" como nome do serviço). As linhas de `docs/provenance.md` ganharam o commit
  de referência de cada fonte. `npm run verify` verde: 33 testes em 4 arquivos e
  build de 12 páginas.
- `DOCS-03C` concluído em 2026-09-08: os dois FAQs viraram o artigo único
  `perguntas-frequentes/index.md` (o índice da área é o artigo, sem slug redundante
  nem landing vazio). O artigo responde o que só as fontes de FAQ cobriam e linka os
  quatro artigos migrados para o restante, sem repeti-los. `docs/provenance.md`
  registrou as duas fontes com commit de referência e estados distintos (`migrado`
  no consolidado, `fundido` no FAQ curto) e `tests/provenance.test.ts` passou a
  exigir que linhas `fundido` também apontem para artigo canônico, provado por
  mutação. Nesta mesma sessão, `npm audit` passou a reportar 3 vulnerabilidades high
  em `sharp <0.35.4` via `wrangler → miniflare` com o lockfile inalterado (atualização
  do banco de advisories); remediado com `overrides` de `"sharp": "^0.35.4"` no
  `package.json`, que unificou a árvore na versão corrigida, e lockfile regenerado.
  `npm run verify` verde: 33 testes em 4 arquivos, build de 12 páginas, zero
  vulnerabilidades.
- `DOCS-03D` concluído em 2026-09-08: `licencas-e-downloads/licencas-e-prazos.md`
  ("Consulte suas licenças e prazos") e `licencas-e-downloads/baixar-arquivos.md`
  ("Baixe os arquivos do seu produto") publicados como conteúdo novo, sem fonte
  semente. Os fatos vêm da ADR 0003 do workspace Área de Clientes e dos rótulos
  reais do painel em produção, conferidos no código do plugin e no catálogo
  pt_BR. `docs/provenance.md` registrou as duas linhas com destino canônico e
  estado "conteúdo novo", com parágrafo de origem factual para a revisão de
  `G-CONTENT`. `npm run verify` verde: 33 testes em 4 arquivos, build de 14
  páginas, zero vulnerabilidades.
- `DOCS-03E` concluído em 2026-09-08: `dominio-e-publicacao/publique-seu-site-pela-primeira-vez.md`
  ("Publique seu site pela primeira vez") e
  `dominio-e-publicacao/conecte-seu-dominio.md` ("Conecte seu domínio com
  segurança") publicados como conteúdo novo, sem fonte semente, com os títulos
  e descrições dos cards de tutorial do painel. Os fatos vêm da ADR 0007 do
  workspace Área de Clientes e dos rótulos reais do painel em produção,
  conferidos no código do plugin e no catálogo pt_BR. Nada sobre a mecânica do
  DNS além do que o painel declara foi inventado. `docs/provenance.md`
  registrou as duas linhas com destino canônico e estado "conteúdo novo", com
  parágrafo de origem factual para a revisão de `G-CONTENT`. `npm run verify`
  verde: 33 testes em 4 arquivos, build de 16 páginas, zero vulnerabilidades.
- O corpus `DOCS-03B` a `DOCS-03E` foi commitado (`52020ad`) e enviado por
  push ao remoto `pagelab/epico-site-docs` (branch `main`) por ordem do owner
  em 2026-09-08, incluindo as bookmarks, o mapa de proveniência e o override
  de `sharp`. Nenhuma outra mudança pendente no working tree.
- Os avisos de coleção i18n vazia e página 404 ainda não criada pertencem a
  `DOCS-06`. Não foram silenciados.
- Nenhum projeto Cloudflare, domínio ou deploy foi configurado. A visibilidade
  pública do remoto e a branch de produção aguardam as decisões de `DOCS-08`.

## ▶ Próxima ação

Executar `DOCS-04A`: gerador puro e endpoint do índice JSON, conforme os
critérios de `TASKS.md` (drafts, slugs duplicados, URL externa e campos vazios
falham no build, índice limitado e sem corpo de artigo nem PII). Não abrir o
gate de aceite de conteúdo (`G-CONTENT` segue fechado).

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
- Remoto: `pagelab/epico-site-docs` no GitHub, privado, branch `main`.
- Última sessão: 2026-09-08.
