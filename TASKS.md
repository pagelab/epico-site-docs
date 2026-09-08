# Fila de implementação — Tutoriais Épico Site

> Ordem primária por dependência e prioridade. A complexidade estima o tamanho
> de uma sessão: `P` até meia sessão, `M` uma sessão, `G` duas ou mais sessões.
> Um gate humano ou externo nunca é promovido a PASS por evidência técnica.

## Ordem executiva

| Ordem | ID | Prioridade | Complexidade | Entrega | Estado | Dependência ou gate |
| ---: | --- | :---: | :---: | --- | --- | --- |
| 1 | `DOCS-00` | P0 | P | Autoridades, fronteiras, gates e fila persistente | concluído | ordem do owner de 2026-09-07 |
| 2 | `DOCS-01` | P0 | M | Repo e scaffold Starlight reproduzíveis | concluído | `DOCS-00` |
| 3 | `DOCS-02` | P0 | M | Modelo de conteúdo, slugs, lint editorial e estrutura das seis áreas | concluído | `DOCS-01` |
| 4 | `DOCS-03A` | P0 | M | Migrar fundamentos e edição, com mapa de proveniência | aberto | `DOCS-02` |
| 5 | `DOCS-03B` | P0 | M | Migrar preços, hospedagem, suporte e propriedade | aberto | `DOCS-03A` |
| 6 | `DOCS-03C` | P0 | M | Fundir os dois FAQs sem duplicação | aberto | `DOCS-03B` |
| 7 | `DOCS-03D` | P0 | M | Escrever tutoriais de licenças e downloads | aberto | `DOCS-03C` |
| 8 | `DOCS-03E` | P0 | M | Escrever tutoriais de domínio e publicação | aberto | `DOCS-03C` |
| 9 | `DOCS-04A` | P0 | M | Gerador puro e endpoint do índice JSON | aberto | `DOCS-02` |
| 10 | `DOCS-04B` | P0 | G | Página `/busca/` e cliente de busca defensivo | aberto | `DOCS-04A` |
| 11 | `DOCS-04C` | P0 | M | Testes adversariais e limites do índice | aberto | `DOCS-04B` |
| 12 | `DOCS-05` | P0 | M | Tema próprio, fontes locais, contraste e orçamento de desempenho | aberto | `DOCS-01` |
| 13 | `DOCS-06` | P0 | M | Sitemap, llms, robots, headers, CSP e configuração estática do Worker | aberto | `DOCS-04C`, `DOCS-05` |
| 14 | `DOCS-07` | P0 | M | QA local completo e preview pronto para aceite | aberto | `DOCS-03A` a `DOCS-06` |
| 15 | `G-CONTENT` | P0 | Humano | Aceite factual, comercial e editorial do owner | bloqueado | `DOCS-07` |
| 16 | `G-VISUAL` | P0 | Humano | Aceite visual e acessível do owner | bloqueado | `DOCS-07` |
| 17 | `DOCS-08` | P1 | M | Repo remoto, Workers Builds, preview, produção, DNS e rollback | bloqueado | `G-CONTENT`, `G-VISUAL`, `G-CLOUDFLARE` |
| 18 | `PANEL-01A` | P1 | M | `DocsSite`, cards, categorias, CSP e i18n no plugin | bloqueado | Docs em produção |
| 19 | `PANEL-01B` | P1 | G | Busca defensiva e acessível em `shell.js` | bloqueado | `PANEL-01A` |
| 20 | `PANEL-02` | P1 | G | Smokes, mutações, suíte, release e verificação do plugin | bloqueado | `PANEL-01B`, aceite separado |

## Critérios por task

### `DOCS-00` — registro e governança

- `AGENTS.md`, `STATE.md`, esta fila e ADR inicial existem.
- Autoridade de conteúdo e separação dos dois ciclos de release estão escritas.
- Gates externos e humanos têm nome e condição de abertura.

### `DOCS-01` — scaffold reproduzível

- Node, npm e dependências diretas estão em versões exatas.
- `package-lock.json` e `npm ci` são obrigatórios.
- Saída é estática, `site` e trailing slash são explícitos.
- Locale raiz é `pt-BR` e a sidebar tem seis grupos explícitos.
- Exemplos do template foram removidos.
- `npm run verify` termina com exit code zero.

### `DOCS-02` — modelo de conteúdo

- Seis diretórios com `index.md` e slugs ASCII permanentes.
- Frontmatter exige `title`, `description`, `topic`, `draft` e `lastReviewed`.
- `topic` usa allowlist e não conflita com `category` do Starlight.
- Lints cobrem slug, travessão longo, ponto e vírgula e conteúdo proibido.

### `DOCS-03A` a `DOCS-03E` — corpus público

- Seis fontes locais migradas sem manter duplicação entre os dois FAQs.
- Artigos faltantes de licença, download, domínio e publicação foram escritos.
- Nenhum preço, prazo ou escopo diverge da fonte vigente.
- Revisões factual, comercial, linguagem, acessibilidade e segurança ficam
  separadas do aceite final do owner.

### `DOCS-04A` a `DOCS-04C` — busca e índice

- Um módulo puro gera o índice usado pelo endpoint e por `/busca/`.
- Drafts, slugs duplicados, URL externa e campos vazios falham no build.
- Índice limita quantidade e bytes e não contém corpo de artigo nem PII.
- `/busca/` é estática, filtra no browser e degrada para navegação manual.
- Testes cobrem payload malformado, URL hostil, timeout e caracteres especiais.

### `DOCS-05` — tema e fontes

- Tema usa apenas variáveis públicas do Starlight e nenhum component override.
- Apenas os dois WOFF2 necessários são copiados.
- Proveniência, licença e SHA-256 estão registrados.
- Contraste claro e escuro, foco, teclado, reduced motion, mobile, LCP e CLS são
  medidos antes do gate visual.

### `DOCS-06` — publicação estática segura

- `_headers`, `robots.txt`, sitemap, 404 e arquivos llms constam na build.
- Política pública permite busca, grounding, citação e treinamento.
- `wrangler.jsonc` usa static assets, data fixa e 404 real, sem SPA fallback.
- Origem `workers.dev` recebe `noindex` e o custom domain permanece indexável.

### `DOCS-07` — QA local

- `npm ci` em árvore limpa e `npm run verify` passam.
- Artefatos construídos, Pagefind, `/busca/`, 404 e headers são inspecionados.
- Preview fica pronto para revisão, sem ser chamado de aceito.

### `DOCS-08` — publicação

- Repo/branch, least privilege, checks, preview e rollback são explícitos.
- Produção só segue após `G-CONTENT` e `G-VISUAL`.
- DNS/TLS, HTTP, CORS, cache, ETag, sitemap, robots, llms e CSP são verificados
  separadamente após o deploy.

### `PANEL-01A`, `PANEL-01B` e `PANEL-02` — integração WordPress

- Trabalho ocorre em sessão própria no workspace `Area-de-clientes`.
- O plugin mantém mapa fechado de URLs e não hospeda conteúdo.
- Índice remoto é não confiável, limitado, validado e renderizado sem HTML.
- `connect-src` recebe apenas o host necessário e `form-action 'self'` permanece.
- PASS técnico, release instalada e aceite visual continuam estados distintos.

## Checkpoint de 2026-09-07

- `DOCS-00`, `DOCS-01` e `DOCS-02` concluídos localmente.
- `npm ci` reproduz o lockfile em árvore limpa (reconferido após a auditoria,
  zero vulnerabilidades).
- `npm run verify`: Astro Check sem diagnósticos, lint limpo, 4 testes em 2
  arquivos, build estática de 8 páginas e auditoria com zero vulnerabilidades.
- Auditoria completa do scaffold (mesmo dia): `sharp` direto removido (o pin
  0.35.3 não unificava com o range `^0.35.4` do Astro e criava cópia órfã),
  `@types/node` alinhado à major do runtime (`24.13.3`), sidebar derivada de
  `src/lib/topics.mjs` como fonte única das seis áreas, e lint de conteúdo com
  barreiras anti-XSS (`<script`, manipulador `on*=`, link `javascript:` fora de
  fences), provadas por arquivo-sonda.
- Pagefind, sitemap e os três arquivos `llms*.txt` foram gerados.
- Os avisos de build sobre a coleção i18n vazia e o conteúdo 404 ainda não criado
  pertencem a `DOCS-06` e não foram silenciados.
- Commit local do scaffold executado (a pedido do owner); nenhum remoto, push
  ou deploy foi executado.

## Checkpoint de 2026-09-08

- Segunda auditoria completa do scaffold a pedido do owner, sem abrir `DOCS-03A`.
- `allowScripts` do `package.json` reescrito no formato canônico do npm 11.19
  via `npm install-scripts approve`/`deny`: esbuild agora pinado por versão
  (`0.28.1` e `0.28.2`), workerd pinado e `fsevents` negado. A auditoria
  confirmou que o campo é o mecanismo real do npm: dependências sem cobertura
  têm scripts de instalação bloqueados por padrão.
- Novo passo de gate `scripts/check-install-scripts.mjs` no `npm run verify`:
  como `npm install-scripts ls` é apenas informativo (sempre exit 0), o script
  falha o gate quando existe pacote com script de instalação sem cobertura
  explícita. Prova por sonda: campo vazio lista os pacotes e sai com exit 1.
- `scripts/lint-content.mjs` refatorado em módulo testável com execução direta
  preservada: cercas de código seguem o CommonMark (fechamento exige mesmo
  caractere, comprimento igual ou maior e linha limpa), cerca não fechada até o
  fim do arquivo virou violação e as barreiras anti-XSS passam a cobrir
  `href`/`src` com `javascript:` e `data:text/html` e tags brutas `<iframe>`,
  `<object>`, `<embed>` e `<form>` fora de cerca.
- As sondas de segurança viraram regressão permanente em
  `tests/lint-policy.test.ts` (25 testes, com contraparte limpa por barreira) e
  o scaffold ganhou teste que exige `allowScripts` presente e bem formado.
- `npm ci` reproduz o lockfile sem avisos de install-scripts. `npm run verify`:
  Astro Check sem diagnósticos, lint limpo, 30 testes em 3 arquivos, build de 8
  páginas, zero vulnerabilidades e política de scripts PASS.
- Nenhuma versão de dependência mudou: `@types/node` segue a major do runtime e
  TypeScript 7 é major nova sem ganho para o gate.
- Mudanças commitadas e enviadas por push, a pedido do owner, para o remoto
  privado `pagelab/epico-site-docs` (branch `main`, conta conectada ao
  Cloudflare). O remoto provisório `EpicoStudio/epico-site-docs` foi removido
  por ordem do owner no mesmo dia. `DOCS-08` segue
  bloqueado: preview, produção, DNS, rollback, least privilege e a política de
  visibilidade do remoto não foram definidos. Os avisos de coleção i18n vazia e
  404 ausente continuam atribuídos a `DOCS-06`.
