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
| 4 | `DOCS-03A` | P0 | M | Migrar fundamentos e edição, com mapa de proveniência | concluído | `DOCS-02` |
| 5 | `DOCS-03B` | P0 | M | Migrar preços, hospedagem, suporte e propriedade | concluído | `DOCS-03A` |
| 6 | `DOCS-03C` | P0 | M | Fundir os dois FAQs sem duplicação | concluído | `DOCS-03B` |
| 7 | `DOCS-03D` | P0 | M | Escrever tutoriais de licenças e downloads | concluído | `DOCS-03C` |
| 8 | `DOCS-03E` | P0 | M | Escrever tutoriais de domínio e publicação | concluído | `DOCS-03C` |
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

## Checkpoint de 2026-09-08: DOCS-03A

- `01-entenda-o-novo-formato.md` migrado para
  `primeiros-passos/formatos-de-publicacao.md` e `03-edicao-e-personalizacao.md`
  para `editar-seu-site/edicao-e-personalizacao.md`. O slug do primeiro perdeu
  "novo" por ser referência temporal em slug permanente, e os prefixos
  numéricos das fontes não foram levados.
- Ajustes editoriais aplicados apenas onde as regras do acervo exigem: pontos e
  vírgula removidos (lista de serviços e duas frases da fonte 03) e "setup"
  como referência ao serviço trocado por `Setup Headless` (título de seção,
  "depois do setup", "setup básico", "ativação do setup"). O restante do corpo
  é fiel à fonte.
- `docs/provenance.md` criado como mapa de proveniência do corpus: registra as
  seis fontes em `Produto/Area-de-clientes/docs/knowledge-base/`, o commit de
  referência de cada migração (para o diff da revisão factual em `G-CONTENT`),
  destino canônico, task e estado, incluindo as linhas de conteúdo novo de
  `DOCS-03D` e `DOCS-03E`.
- `tests/provenance.test.ts` guarda o mapa: as seis fontes nomeadas aparecem
  uma única vez, toda linha "migrado" aponta para artigo existente com topic
  correspondente ao diretório e nenhum destino canônico é compartilhado.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos, lint
  limpo, 33 testes em 4 arquivos, build de 10 páginas com as duas novas
  (/primeiros-passos/formatos-de-publicacao/ e
  /editar-seu-site/edicao-e-personalizacao/), zero vulnerabilidades e política
  de install scripts PASS.
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Commit local e push
  para `pagelab/epico-site-docs` executados a pedido do owner em 2026-09-08.

## Checkpoint de 2026-09-08: DOCS-03B

- `02-precos-e-hospedagem.md` migrado para
  `servicos-e-suporte/precos-e-hospedagem.md` e `04-suporte-e-propriedade.md` para
  `servicos-e-suporte/suporte-e-propriedade.md`, sem os prefixos numéricos das fontes.
- Ajustes editoriais aplicados apenas onde as regras exigem: pontos e vírgula
  removidos (três frases da fonte 02, dois itens da lista de serviços e três frases
  da fonte 04), travessão longo do parágrafo de operação gerenciada trocado por
  oração entre vírgulas e "setup" como referência ao serviço trocado por
  `Setup Headless` ("depois do setup", "preço do setup", "pertencem ao setup" e o
  título "O setup técnico já coloca meu novo site no ar imediatamente?"). A expressão
  "o setup existente" da fonte 02 foi mantida por se referir à configuração atual do
  WordPress do cliente, não ao serviço.
- `docs/provenance.md` atualizado com o commit de referência de cada fonte
  (`e32bc9c9d1bebd1c9c90cbe74838a1c6ed7c19fc` para `02-precos-e-hospedagem.md` e
  `eec17af7d3984c45cf82be8c9fd8a925b3888ab5` para `04-suporte-e-propriedade.md`),
  guardado por `tests/provenance.test.ts`.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos, lint limpo, 33
  testes em 4 arquivos, build de 12 páginas com as duas novas
  (/servicos-e-suporte/precos-e-hospedagem/ e
  /servicos-e-suporte/suporte-e-propriedade/), zero vulnerabilidades e política de
  install scripts PASS.
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Nenhum commit ou push foi
  executado nesta sessão: aguardam ordem do owner.

## Checkpoint de 2026-09-08: DOCS-03C

- `FAQ.md` e `FAQ-consolidado.md` foram fundidos num artigo único, que é o
  `index` da área `perguntas-frequentes`. A área existe para o FAQ, então o
  índice da área vira o artigo, em vez de criar um slug redundante abaixo de um
  landing vazio. As duas fontes deixam de existir como artigos separados e não
  há duplicação entre elas.
- O artigo fundido responde apenas o que só as duas fontes de FAQ cobriam:
  o que acontece com o site durante o trabalho, preservação de posts,
  e-commerce, acessos e controle de contas e a Área de Clientes. As perguntas
  já respondidas pelos artigos de `DOCS-03A` e `DOCS-03B` não foram repetidas:
  o artigo linka os quatro artigos migrados numa seção final de encaminhamento.
- Ajustes editoriais limitados às regras: o ponto e vírgula da fonte
  (`contas devem permanecer em nome do cliente; a equipe Épico recebe`) virou
  oração coordenada, "No headless" virou "No modelo headless" e o prefixo
  numérico e o preâmbulo interno do consolidado ("o escopo aprovado na proposta
  prevalece sobre exemplos gerais deste arquivo") não são conteúdo público e
  ficaram de fora.
- `docs/provenance.md`: as duas linhas de FAQ saíram de "a definir" e ganharam
  commit de referência (`e32bc9c9d1bebd1c9c90cbe74838a1c6ed7c19fc` para
  `FAQ.md` e `3b1b075a1ce3c22fd8c62cac4e9bd4212e3a18d9` para
  `FAQ-consolidado.md`), destino `perguntas-frequentes/index` e estados
  distintos: `migrado` no consolidado (corpo principal) e `fundido` no FAQ
  curto, porque fusão é a exceção declarada à regra de destino único.
- `tests/provenance.test.ts` estendido: linhas `fundido` também precisam
  apontar para artigo canônico existente, com topic do diretório. Prova por
  mutação: trocar o destino da linha `fundido` por "a definir" derruba o teste,
  e a restauração ficou idêntica ao snapshot.
- Incidente externo ao recorte, remediado na mesma sessão: `npm audit` passou a
  reportar 3 vulnerabilidades high (`sharp <0.35.4`, GHSAs de libheif) na cadeia
  `wrangler 4.129.1 → miniflare 5.20260907.0-alpha → sharp 0.35.2`, com o mesmo
  lockfile que passou verde na sessão do `DOCS-03B` horas antes, o que indica
  atualização do banco de advisories e não mudança local. O wrangler 4.130.0
  existe, mas o miniflare mais novo continua exigindo `sharp 0.35.2`, então bump
  não resolve. Remediação: `overrides` de `"sharp": "^0.35.4"` no
  `package.json`, que unifica a árvore em `0.35.4` (a versão que o Astro já
  usava), com lockfile regenerado. O `wrangler` continua em `4.129.1`.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos, lint
  limpo, 33 testes em 4 arquivos, build de 12 páginas, zero vulnerabilidades e
  política de install scripts PASS. Os avisos de coleção i18n vazia e 404
  ausente continuam atribuídos a `DOCS-06`.
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Nenhum commit ou
  push foi executado nesta sessão: seguem aguardando ordem do owner, junto com
  as mudanças não commitadas do `DOCS-03B`.

## Checkpoint de 2026-09-08: DOCS-03D

- Dois artigos novos na área `licencas-e-downloads`:
  `licencas-e-downloads/licencas-e-prazos.md` ("Consulte suas licenças e
  prazos") e `licencas-e-downloads/baixar-arquivos.md` ("Baixe os arquivos do
  seu produto"), ambos conteúdo novo, sem fonte semente.
- Os fatos foram derivados da decisão de produto
  [ADR 0003](../Area-de-clientes/docs/decisions/0003-suporte-atualizacoes-e-ultima-versao-elegivel.md)
  do workspace Área de Clientes (uso permanente, suporte de 100 dias,
  atualizações por 12 meses, re-download da última versão elegível e renovação
  sem cobrança retroativa) e do comportamento atual do painel em produção. Os
  rótulos citados nos artigos foram conferidos no código do plugin e no
  catálogo pt_BR: `Suporte até`, `Atualizações até`, `Sites conectados`,
  `Conectado`, `Remover domínio`, `Atualizações encerradas` e a caixa
  `Renove seu acesso ao suporte` com o botão `Renovar agora`, que leva ao card
  `Suporte adicional` da seção Serviços.
- Escopo deliberado: os artigos não repetem o que as áreas de Serviços e
  Suporte já respondem e linkam esses artigos. Não descrevem passos de
  instalação do produto nem prometem caminho de compra além do que a
  interface oferece (a renovação de atualizações é encaminhada à página
  Suporte, que é o canal real do painel).
- `docs/provenance.md`: a linha "a escrever" de `DOCS-03D` virou duas linhas
  com destino canônico e estado `conteúdo novo em 2026-09-08`, e um parágrafo
  novo registra a origem factual (ADR 0003 e painel em produção) para a
  revisão factual de `G-CONTENT`.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos, lint
  limpo, 33 testes em 4 arquivos, build de 14 páginas com as duas novas
  (/licencas-e-downloads/licencas-e-prazos/ e
  /licencas-e-downloads/baixar-arquivos/), zero vulnerabilidades e política
  de install scripts PASS.
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Nenhum commit ou
  push foi executado nesta sessão: as mudanças de `DOCS-03B`, `DOCS-03C` e
  `DOCS-03D` seguem no working tree, aguardando ordem do owner.

## Checkpoint de 2026-09-08: DOCS-03E

- Dois artigos novos na área `dominio-e-publicacao`:
  `dominio-e-publicacao/publique-seu-site-pela-primeira-vez.md` ("Publique seu
  site pela primeira vez") e `dominio-e-publicacao/conecte-seu-dominio.md`
  ("Conecte seu domínio com segurança"), ambos conteúdo novo, sem fonte
  semente. Os títulos e descrições são os mesmos dos cards de tutorial do
  painel ("Da revisão final ao site no ar, com a checklist de publicação" e
  "Passo a passo para apontar o domínio sem tirar o site do ar").
- Os fatos vêm da ADR 0007 do workspace Área de Clientes (cinco etapas, gate de
  lançamento por serviço, itens da etapa de publicação) e dos rótulos reais do
  painel em produção, conferidos no código do plugin e no catálogo pt_BR:
  telas de revisão (`Prepare seu site` com `Meu conteúdo está pronto`,
  `Revise e aprove` com `Aprovo o conteúdo`), tarefa `Aponte o seu domínio`
  com `Já apontei o domínio` e `Conferindo o site publicado`, caixa
  `Itens desta etapa` por serviço, formulário `Envie o acesso ao seu
  registrador` (dados criptografados, nunca por e-mail) e propagação de até
  48 horas com formulário de suporte como escape. Nada sobre a mecânica do
  DNS além do que o painel declara foi inventado: o valor do registro CNAME e
  as telas de cada registrador não são prometidos.
- Escopo deliberado: os artigos não repetem o que as áreas de Serviços,
  Suporte e Perguntas frequentes já respondem e linkam esses artigos. O artigo
  de domínio desambigua o domínio público do site dos **Sites conectados** da
  licença, que seguem na área de Licenças. O índice da área não mudou.
- `docs/provenance.md`: a linha "a escrever" de `DOCS-03E` virou duas linhas
  com destino canônico e estado `conteúdo novo em 2026-09-08`, e um parágrafo
  novo registra a origem factual (ADR 0007 e painel em produção) para a
  revisão factual de `G-CONTENT`.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos, lint
  limpo, 33 testes em 4 arquivos, build de 16 páginas com as duas novas
  (/dominio-e-publicacao/publique-seu-site-pela-primeira-vez/ e
  /dominio-e-publicacao/conecte-seu-dominio/), zero vulnerabilidades e
  política de install scripts PASS. Os avisos de coleção i18n vazia e 404
  ausente continuam atribuídos a `DOCS-06`.
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Nenhum commit ou
  push foi executado nesta sessão: as mudanças de `DOCS-03B` a `DOCS-03E`
  seguem no working tree, aguardando ordem do owner.
