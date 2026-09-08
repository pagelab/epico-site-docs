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
- Pagefind, sitemap e `llms.txt`, `llms-full.txt` e `llms-small.txt` são
  gerados.
- `npm run verify` verde: Astro Check sem diagnósticos, lint limpo, 54 testes
  em 5 arquivos, build de 16 páginas + `/search-index.json`, zero
  vulnerabilidades e política de install scripts PASS.
- Os avisos de coleção i18n vazia e página 404 ainda não criada pertencem a
  `DOCS-06`. Não foram silenciados.
- Nenhum projeto Cloudflare, domínio ou deploy foi configurado. A visibilidade
  pública do remoto e a branch de produção aguardam as decisões de `DOCS-08`.

## ▶ Próxima ação

Executar `DOCS-04B`: página `/busca/` estática e cliente de busca defensivo
reusando o gerador puro do índice (`src/lib/search-index.mjs`), com filtro no
browser, degradação para navegação manual e testes de payload malformado, URL
hostil, timeout e caracteres especiais. `npm run verify` verde fecha a fatia.
Não abrir `G-CONTENT`, `G-VISUAL` nem `G-CLOUDFLARE`.

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
