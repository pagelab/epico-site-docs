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
| 9 | `DOCS-04A` | P0 | M | Gerador puro e endpoint do índice JSON | concluído | `DOCS-02` |
| 10 | `DOCS-04B` | P0 | G | Página `/busca/` e cliente de busca defensivo | concluído | `DOCS-04A` |
| 11 | `DOCS-04C` | P0 | M | Testes adversariais e limites do índice | concluído | `DOCS-04B` |
| 12 | `DOCS-05` | P0 | M | Tema próprio, fontes locais, contraste e orçamento de desempenho | concluído | `DOCS-01` |
| 13 | `DOCS-06` | P0 | M | Sitemap, llms, robots, headers, CSP e configuração estática do Worker | concluído | `DOCS-04C`, `DOCS-05` |
| 14 | `DOCS-07` | P0 | M | QA local completo e preview pronto para aceite | concluído | `DOCS-03A` a `DOCS-06` |
| 15 | `G-CONTENT` | P0 | Humano | Aceite factual, comercial e editorial do owner | aceito 2026-09-10 | `DOCS-07` |
| 16 | `G-VISUAL` | P0 | Humano | Aceite visual e acessível do owner | aceito 2026-09-10 | `DOCS-07` |
| 17 | `DOCS-08` | P1 | M | Repo remoto, Workers Builds, preview, produção, DNS e rollback | concluído | `G-CONTENT` ✅, `G-VISUAL` ✅, `G-CLOUDFLARE` |
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
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Após a sessão, o
  owner ordenou commit e push: o corpus `DOCS-03B` a `DOCS-03E` inteiro
  (artigos, proveniência, override de `sharp` e bookmarks) virou o commit
  `52020ad`, enviado ao remoto `pagelab/epico-site-docs` (branch `main`).

## Checkpoint de 2026-09-08: DOCS-04A

- Gerador puro `src/lib/search-index.mjs`: não importa nada de Astro, então o
  mesmo módulo alimenta o endpoint e a futura `/busca/` (`DOCS-04B`) e é
  testável sem build. Payload versão 1, determinístico (mesma entrada produz
  os mesmos bytes, sem carimbo de tempo), ordenado por URL, com chaves exatas
  `url`, `title`, `description`, `topic` e `lastReviewed`. Nenhum campo carrega
  corpo de artigo.
- Mapeamento slug → URL segue o acordo do `slugToParam` do Starlight (confirmado
  no fonte do vendor antes de codar): `''`/`index` → `/`, sufixo `/index`
  desaparece, `foo` → `/foo/`. Barreiras do gerador, todas falhando o build com
  mensagem própria: rascunho (`draft !== false`), URL hostil (dois-pontos,
  contrabarra ou protocolo-relativa), segmento fora do canônico ASCII, campos
  vazios ou de tipo errado, topic fora da allowlist de `topics.mjs`,
  `lastReviewed` fora do ISO real, slugs distintos resolvendo a MESMA URL
  (duplicado), PII (e-mail, caminho local, endereço local) em texto livre, teto
  de 200 entradas e teto de 256 KiB cobrado no serializador.
- Endpoint `src/pages/search-index.json.ts` com `prerender = true`: lê
  `getCollection('docs')`, converte `entry.id` → slug e `lastReviewed` → ISO e
  serve os bytes do `serializeSearchIndex`. Qualquer violação do gerador derruba
  o `astro build` (provado empíricamente: o erro estoura no prerender de
  `/search-index.json`).
- Lint de conteúdo: `draft: true` virou violação (`draft: true não pode entrar
  no acervo público`). O acervo não tem estado de rascunho publicado, e a
  barreira no gate é independente da barreira no build.
- Prova empírica com artigo real em rascunho: `lint-content.mjs` sai com exit 1
  E `astro build` sozinho também sai com exit 1, o que provou que drafts chegam
  à coleção em produção (não há filtro silencioso do Starlight na coleção).
  Duas camadas independentes, nenhuma deixa passar em silêncio. A primeira
  tentativa da mutação não alterou o arquivo (quoting do `sed`), foi flagrada
  pelo diff antes de qualquer conclusão e refeita com Node.
- Provas por mutação: 9 mutações (draft, duplicado, URL hostil, canônico,
  campo em branco, PII, teto de entradas, teto de bytes no gerador/serializador
  e rascunho no lint), cada uma com diff impresso, `node --check` antes de rodar
  e restauração por snapshot `cp` (nunca `git checkout`, arquivos ainda não
  commitados na hora da prova). Todas as 9 derrubaram os testes esperados.
- Suíte: 20 testes novos em `tests/search-index.test.ts` e 1 novo no
  `tests/lint-policy.test.ts` (54 testes em 5 arquivos). O primeiro rodou pegou
  um erro da expectativa do próprio teste (`primeiros-passos/index` resolve
  `/primeiros-passos/`, não `/primeiros-passos/index/`), não do gerador.
- Artefato real conferido: `dist/search-index.json` com 3.726 bytes, 15
  entradas em correspondência 1:1 com as 15 rotas HTML de docs (a 16ª página
  construída é o `404.html` do Starlight, corretamente fora do índice), sem
  corpo, sem chave extra.
- `npm run verify` verde com exit code 0 (Node `24.20.0` via nvm; a shell
  default traz Node 20, que o Astro 7 recusa): Astro Check sem diagnósticos,
  Content policy PASS, 54 testes, build de 16 páginas + `/search-index.json`,
  zero vulnerabilidades e política de install scripts PASS. Os avisos de
  coleção i18n vazia e 404 ausente continuam atribuídos a `DOCS-06`.
- Gate de aceite de conteúdo (`G-CONTENT`) não foi aberto. Commit da fatia
  `f127298`; bookmarks no commit imediatamente posterior.

## Checkpoint de 2026-09-08: DOCS-04B

- Página `/busca/` construída com o `StarlightPage` suportado (nenhum override
  de componente do Starlight). Prova empírica antes de codar: o `StarlightPage`
  valida o frontmatter com o schema estendido da coleção e exigia `topic`,
  `draft` e `lastReviewed`. Em vez de dar um `topic` fictício a uma página
  utilitária, o schema passou a TIpar os três campos como opcionais e a exigência
  editorial continua nas duas barreiras independentes que já existiam: o lint de
  conteúdo (presença, allowlist, `draft` booleano, data real) e o gerador do
  índice (que rejeita ausência e valor inválido no build). O desbloqueio também
  vale para o 404 custom de `DOCS-06`, que enfrentaria o mesmo conflito.
- Consumidor validador no mesmo módulo puro do produtor:
  `validateSearchIndexPayload` em `src/lib/search-index.mjs` aplica as barreiras
  do contrato no payload recebido no browser (entrada remota não confiável).
  Estrutura inválida (não objeto, chaves fora do contrato, version, entries não
  lista, teto de 200) rejeita o payload inteiro e a busca degrada para navegação
  manual. Entrada individualmente inválida (URL hostil ou não canônica, campo
  vazio, PII, topic fora da allowlist, data impossível, chave extra ou faltando)
  é descartada e contada. Payload não vazio onde nenhuma entrada sobra válida é
  tratado como comprometido e rejeitado.
- Teto por campo novo e simétrico: 500 caracteres para title e description,
  cobrado no gerador (falha o build) e no validador (descarta a entrada), para
  um campo gigante não estourar o layout de resultados mesmo dentro do teto
  total de 256 KiB. O teste antigo do teto de bytes foi reescrito para estourar
  os bytes com 200 entradas válidas no limite por campo, e não com um campo
  gigante que agora o gerador recusa antes.
- Cliente puro `src/lib/search-client.mjs`: fetch injetável (testável sem
  browser) com timeout por `AbortController` de 5 s, teto de caracteres do
  corpo recebido (conservador: bytes UTF-8 são sempre maiores ou iguais aos
  caracteres UTF-16), URL obrigatoriamente caminho interno (rejeita `https://`,
  protocolo-relativa e relativa antes de chamar fetch) e payload revalidado.
  O filtro é literal (substring, sem regex), com normalização NFD sem acentos,
  AND de tokens (teto de 12), pontuação por ocorrência (título 4, descrição 2,
  área 1, bônus de título completo) e desempate alfabético por URL para ser
  determinístico. Teto de 30 resultados por consulta.
- `/busca/` estática e acessível: a navegação manual pelas seis áreas vem no
  HTML estático e é a degradação garantida sem JavaScript (o bloco de busca
  nasce `hidden` e só aparece com script). O input fica desabilitado até o
  índice chegar. Deep-link `?q=` preenche a consulta, `history.replaceState`
  mantém a URL sincronizada, o status usa `aria-live` e a contagem de
  resultados é anunciada. Todo render usa `createElement`, `textContent` e
  `setAttribute` com URLs já validadas: nenhum `innerHTML`.
- Descoberta sem override: link "Busca" no fim da sidebar via config, fora de
  `topics.mjs` (não é área editorial). A home usa `template: splash` e o 404
  nativo não renderiza sidebar, então o link aparece nas 15 páginas internas e
  na própria `/busca/`.
- Quatro erros de tipo do `astro check` corrigidos: o narrowing de
  `instanceof` não é preservado nas closures do script da página (wiring movido
  para `setupBusca` com parâmetros tipados) e o endpoint escoa os campos agora
  opcionais como valores inválidos para o gerador rejeitar com a mensagem
  editorial (fail-loud preservado).
- Suíte: 55 testes novos (109 em 6 arquivos). Payload malformado (não objeto,
  chaves extras, version, entries, JSON quebrado), URL hostil (`javascript:`,
  protocolo-relativa, `https`, travessia, contrabarra, segmentos vazios),
  timeout (fake timers), caracteres especiais na consulta (metacaracteres de
  regex são literais, emoji, aspas), falha de rede, resposta não ok, corpo
  acima do teto, AND de tokens, normalização de acento, determinismo e tetos.
- Dez provas por mutação com snapshot `cp`, `node --check` e restauração
  conferida. Nove na bateria (chaves exatas, teto por campo, version, teto de
  bytes do fetch, timeout, normalização, teto de resultados, AND de tokens e
  validação canônica de URL, que derrubou 5 testes). A décima revelou que o
  check de `:`/`..` em `entryUrlViolations` é redundante por construção com a
  barreira canônica de segmentos (nenhum teste depende dele sozinho): a
  redundância foi mantida como defesa em profundidade e registrada aqui.
- Artefato conferido: build de 17 páginas com `/busca/`, `dist/search-index.json`
  inalterado (15 entradas, 3.726 bytes, version 1), bundle da página com
  validador, timeout e normalização embutidos e sem `innerHTML`.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos,
  Content policy PASS, 109 testes, build de 17 páginas, zero vulnerabilidades e
  política de install scripts PASS. Gates `G-CONTENT`, `G-VISUAL` e
  `G-CLOUDFLARE` não abertos. QA interativo no browser (debounce, `?q=`,
  leitor de tela) pertence ao `DOCS-07` e ao `G-VISUAL`.
- Após a sessão, o owner ordenou commit e push e emitiu regra durável:
  commit e push ao fim de cada sessão deste repositório dispensam ordem
  específica (registrada em `STATE.md` §"Decisões confirmadas"). A fatia
  virou o commit `3e9ddc5`, enviado ao remoto `pagelab/epico-site-docs`
  (branch `main`) junto com os bookmarks.

## Checkpoint de 2026-09-08: DOCS-04C

- Bateria adversarial aberta com sondas empíricas contra o código entregue em
  04A/04B, antes de qualquer mudança. Três lacunas reais confirmadas: o
  validador aceitava URL duplicada no payload recebido (renderizava resultados
  repetidos, quebrando a simetria com o gerador); o timeout de 5 s cobria só o
  handshake do fetch, então um servidor que respondesse headers e travasse a
  transferência deixava `response.text()` pendente para sempre (provado: a
  promise não resolvia após 600 ms); e não havia rejeição antecipada por
  `Content-Length` declarado acima do teto, lendo o corpo inteiro antes do
  corte. Duas sondas já estavam cobertas pelo código e só não tinham teste
  permanente: `version` como string `'1'` e url `'//'`.
- Endurecimento do consumidor (`search-client.mjs`): o cronômetro do
  `AbortController` agora cobre o handshake E a leitura do corpo, com o abort
  durante a transferência mapeado para a mesma mensagem de timeout (no
  browser, abortar o sinal rejeita a leitura pendente); `Content-Length`
  numérico acima do teto rejeita a resposta antes de ler o corpo (header
  ausente ou não numérico não bloqueia, e o teto pós-leitura permanece); as
  mensagens de erro próprias da busca atravessam o mapeamento sem rewrapping.
- Endurecimento do contrato (`search-index.mjs`): `findPii` exportado (a
  suíte escaneia os bytes reais com os mesmos padrões que barram campos);
  URL repetida no payload recebido é descartada com a primeira ocorrência
  vencendo e contagem em `discarded`; url com segmento FINAL `index` é
  rejeitada no consumidor (slug `area/index` sempre resolve `/area/`, então
  `/area/index/` nunca é rota canônica); e o gerador passou a validar a URL
  já RESOLVIDA com a mesma barreira do consumidor, tornando a simetria
  produtor → consumidor estrutural: nenhum índice gerado pode ser descartado
  pelo validador que o consome.
- Suíte permanente nova `tests/search-adversarial.test.ts` (15 testes), sobre
  o artefato real derivado da única autoridade editorial (`src/content/docs/`,
  lido por parser mínimo do frontmatter plano que o acervo usa): 1:1 entre
  arquivos e entradas dentro dos tetos, toda URL mapeia de volta a um arquivo
  real, cada entrada reproduz exatamente o frontmatter (nenhum corpo de
  artigo viaja, confirmado também pela ausência de toda linha de corpo com 40+
  caracteres nos bytes servidos), round-trip 100% pelo contrato do consumidor
  e varredura de PII nos bytes. Bateria exaustiva de truncagem: TODOS os
  prefixos próprios do artefato real são rejeitados (JSON quebrado ou payload
  fora do contrato), mais corte em byte no meio de caractere acentuado. O
  subconjunto sintético válido é aceito e documentado como limite da defesa:
  o contrato garante entrada individualmente segura, não completude do
  acervo (completude exigiria assinatura, ausente no payload versão 1; a
  integridade do transporte é dever de same-origin + HTTPS). Sondas
  estruturais: `__proto__` e `constructor` como chaves próprias via
  `JSON.parse` caem na assinatura de chaves, teto de entradas inclusivo no
  consumidor e no produtor, duplicatas e segmento `index` nas duas pontas.
  Tempo real no teto: pipeline completo com 200 entradas (corpus real +
  preenchimento sintético dentro dos tetos) valida, filtra no teto de 30 e
  digere consultas patológicas (token de 10 mil caracteres, 40 tokens,
  apenas combining marks) em tempo interativo, com sonda de ausência de
  retrocesso quadrático (< 1 s para a bateria inteira, registrada como sonda,
  não como gate de performance).
- `tests/search-client.test.ts` ganhou 5 testes: resposta não ok em 404/500,
  abort quando o corpo trava depois dos headers (fake timers com fake fiel ao
  browser, que rejeita a leitura no abort) e os três caminhos de
  `Content-Length` (acima do teto sem ler o corpo, dentro do teto, não
  numérico ignorado). 129 testes em 7 arquivos.
- Doze provas por mutação, seis nas barreiras novas (dedupe de URL, timeout do
  corpo, precheck de Content-Length, segmento `index` no consumidor, simetria
  do produtor, `findPii`) e seis em barreiras de 04A/04B ainda não mutadas
  (teto de entradas do validador, regra de todas-inválidas, allowlist de topic
  no validador, `isRealDate`, `response.ok`, assinatura de chaves da entrada).
  Cada mutação com snapshot `cp`, `node --check`, suíte alvo derrubada e
  restauração conferida por checksum. As doze derrubaram testes.
- Sondas HTTP contra o endpoint de verdade (`astro preview` sobre build novo;
  o preview binda em IPv6 `::1`, `127.0.0.1` recusa conexão): `/search-index.json`
  responde 200 com `Content-Type: application/json` e corpo idêntico byte a
  byte ao `dist/search-index.json`; `Range: bytes=0-99` devolve 206 parcial e o
  consumidor rejeita o fragmento; truncagem simulada da transferência em três
  pontos rejeitada; `/busca/` servida com o bloco de busca nascendo `hidden`,
  os seis links de área no HTML estático e nenhum `innerHTML`; o chunk do
  cliente (`busca.astro_astro_type_script...js`) contém timeout, tetos,
  contrato do payload, normalização e barreira de URL interna, sem
  `innerHTML`. Duas ressalvas honestas do dia: a primeira rodada da sonda de
  bundle inspecionou o chunk errado (`page.Dwipeu-R.js`, do Starlight) e foi
  corrigida a SONDA, não o produto; `innerHTML` existe no `ui-core` do
  Starlight (vendor, fora do cliente de busca).
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos,
  Content policy PASS, 129 testes em 7 arquivos, build de 17 páginas +
  `/search-index.json` (15 entradas, 3.726 bytes), zero vulnerabilidades e
  política de install scripts PASS. Gates `G-CONTENT`, `G-VISUAL` e
  `G-CLOUDFLARE` não abertos; QA interativo no browser permanece em
  `DOCS-07`/`G-VISUAL`. Commit e push ao fim da sessão cobertos pela
  autorização durável do owner.

## Checkpoint de 2026-09-08: DOCS-05

- Tema próprio em `src/styles/theme.css`, servido por `customCss`: apenas
  variáveis públicas `--sl-*`, nenhum override de componente e nenhum import
  do `tokens.css` do painel. Os seletores espelham a estrutura do tema do
  Starlight 0.42 lida no vendor (`props.css`): dark é o bloco padrão em
  `:root, ::backdrop` e o claro sobrescreve em
  `:root[data-theme='light'], [data-theme='light'] ::backdrop`, então as duas
  paletas ficam completas por construção. Neutros derivados no hue 229 (do
  navy de marca `#0a1552`, hue 230), acentos com valores exatos da escala
  azul de marca (blue-300 `#a9b9f9` e blue-400 `#8098f6` no dark, blue-700
  `#2844c6` no claro). A única regra em elemento nativo aplica Cal Sans peso
  600 em `h1` a `h6`: o Starlight 0.42 não expõe variável pública de fonte de
  título (conferido no `props.css` do vendor) e o CSS do usuário entra sem
  camada e importado primeiro, ordem documentada no próprio `Page.astro`.
- Duas fontes locais e só elas: `CalSans-SemiBold.woff2` e
  `Outfit-Variable.woff2` copiados da origem canônica `Design/Fontes/`, com
  SHA-256 idêntico byte a byte às cópias do painel (confirmação de que as
  superfícies servem a mesma fonte). Os textos OFL 1.1 acompanham os WOFF2
  em `public/fonts/` porque o site público redistribui os arquivos.
  Proveniência, upstream, licença e SHA-256 dos quatro arquivos registrados
  em `docs/fonts.md`, guardados por teste. `@font-face` com
  `font-display: swap` e preload das duas fontes via hook público `head`
  (forma de array do 0.42; a primeira tentativa com função foi recusada pelo
  schema do plugin, prova empírica da superfície suportada).
- Gate de contraste permanente `scripts/check-theme-contrast.mjs` dentro do
  `verify`: lê o `theme.css`, resolve as cadeias de `var()` com a herança
  real (bloco claro herda o dark, defaults públicos do vendor completam o
  que o tema não repete, como `--sl-color-bg` apontando para o black) e
  mede WCAG 2.1 para 9 pares essenciais nas duas paletas: corpo, títulos,
  links, botão, navegação, sidebar, secundário da sidebar, código inline
  (mínimo 4.5) e anel de foco (mínimo 3). Os 18 valores medidos passam com
  folga, pior caso 5.12:1.
- Medições exigidas antes do gate visual, com `scripts/measure-theme.mjs`
  (Chrome 153 headless via CDP sobre WebSocket nativo do Node, zero
  dependências novas; ferramenta de sessão documentada, fora do `verify`):
  LCP desktop 1280x800 de 1.488 ms na home (primeira navegação a frio,
  título H1 como elemento LCP) e 0,6 s ou menos nas demais; LCP mobile
  390x844 @3x com CPU 4x e Fast 3G entre 0,36 e 0,58 s; foco e teclado com
  seis Tabs reais pelo CDP, todos os elementos focados com contorno visível;
  reduced motion com zero elementos animados e `scroll-behavior: auto` (a
  única animação do vendor já nasce guardada por `no-preference`); mobile
  sem scroll horizontal; e as duas paletas pintadas de verdade no browser
  (dark fundo `rgb(19, 22, 32)`, light fundo branco, `h1` com Cal Sans em
  ambas, fontes carregadas com iniciador `link` do preload).
- Achado real das medições, corrigido na mesma sessão: a `/busca/` desktop
  media CLS 0.0701 porque o script bundled revelava o bloco de busca depois
  da primeira pintura e empurrava a seção de áreas para baixo (no mobile o
  conteúdo empurrado ficava abaixo da dobra, por isso CLS 0). Correção sem
  quebrar o contrato sem JavaScript: script inline síncrono imediatamente
  após o bloco remove o `hidden` antes de a seção seguinte ser parseada, o
  bloco continua nascendo `hidden` no HTML servido (conferido no dist) e a
  revelação no script bundled ficou como defesa em profundidade. Teste de
  regressão guarda a ordem revelação antes da seção de áreas. CLS medido
  0.0000 em todas as páginas, nos dois cenários, após a correção.
- Doze provas por mutação com snapshot, `node --check` quando sintaxe
  aplicável e restauração por checksum: byte extra no WOFF2 (derruba o
  teste de hash), terceiro WOFF2, propriedade fora de `--sl-*`, seletor de
  classe, URL de fonte externa, `components:` no config, preload removido,
  corpo claro sem AA, alias do vendor removido (a primeira tentativa gerou
  erro de sintaxe e foi refeita de forma válida: dez pares caem como
  variável ausente), secundário da sidebar claro, accent-high do dark e
  revelação movida para depois da seção. Todas derrubaram a barreira alvo.
- Limpeza dos três diagnósticos ts(6133) que o `astro check` passou a
  listar: dois nos scripts novos e um import órfão em
  `tests/search-index.test.ts` remanescente da reescrita do teste de bytes
  no DOCS-04C.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos,
  Content policy PASS, contraste do tema PASS com os 18 pares, 138 testes
  em 8 arquivos (9 novos em `tests/theme.test.ts`), build de 17 páginas,
  zero vulnerabilidades e política de install scripts PASS. Gates
  `G-CONTENT`, `G-VISUAL` e `G-CLOUDFLARE` não abertos: QA interativo no
  browser (leitor de tela, ToC, sidebar, dark mode percebido) permanece em
  `DOCS-07` e no `G-VISUAL`. Commit e push ao fim da sessão cobertos pela
  autorização durável do owner.

## Checkpoint de 2026-09-09: DOCS-06

- `public/_headers` (copiado ao `dist/` pelo build, 4 regras parseadas pelo
  wrangler): regra global `/*` com CSP `default-src 'self'` e `script-src`
  cobrindo os DEZ scripts inline servidos (do Starlight e o revelador da
  `/busca/`) por hash SHA-256 do conteúdo exato entre tags, sem
  `unsafe-inline` nem `unsafe-eval`; `style-src 'self' 'unsafe-inline'`
  pelos atributos `style=` do vendor e pelo estilo scoped da `/busca/`
  (estilos não executam código); `img-src 'self' data:` porque o vendor
  injeta ícones SVG como data URI em `<img>` em runtime (achado da sonda
  Chrome, invisível ao grep do HTML estático; SVG em img é sanitizado pelo
  browser); `font-src`, `connect-src` e `worker-src` exatamente `'self'`
  (pagefind-worker e fetches do índice são same-origin); `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`; mais
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` e HSTS. Headers de segurança existem SÓ na regra
  global: regra mais específica com o mesmo header teria os valores unidos
  por vírgula pelo Cloudflare. `/_astro/*` recebe apenas
  `Cache-Control: immutable` (assets com hash no nome). `noindex` da origem
  `workers.dev` nas DUAS formas de URL (`https://:script.:account.workers.dev/*`
  de produção e `https://:version.:script.:account.workers.dev/*` de preview
  de versão, padrão da doc oficial de static assets): o custom domain não
  casa regra com host e permanece indexável. O `_headers` não usa
  comentários porque a doc de static assets só documenta comentários em
  `_redirects`.
- `public/robots.txt`: `User-agent: *`, `Allow: /` e
  `Sitemap: https://docs.epico.site/sitemap-index.xml`. Política pública de
  uso declarada no `llms.txt` via `details` do plugin (lugar canônico do
  llmstxt.org): uso livre para busca, citação, grounding e treinamento, com
  citação apontando o endereço original. O 404 utilitário ficou fora dos
  `llms*.txt` (`exclude` do plugin).
- `wrangler.jsonc` em JSON puro (sem comentários, parseável pelo gate):
  `assets.directory ./dist`, `html_handling auto-trailing-slash` explícito
  (canônico do acervo), `not_found_handling 404-page` (404 real, sem SPA
  fallback), `compatibility_date` fixa em `2026-09-07` (a data do workerd
  instalado, verificável localmente), sem `main` e sem `run_worker_first`:
  respostas de Worker não recebem os `_headers`. Nome `epico-site-docs`.
  Nenhum deploy, conta ou DNS foi tocado: o arquivo é só a configuração
  estática exigida pelo task.
- 404 custom em `src/content/docs/404.md` (título, descrição e três
  caminhos: início, busca, sidebar), gerado como `dist/404.html`. Página
  utilitária: o endpoint do índice exclui `entry.id === '404'` (não é
  resultado de busca), o teste adversarial aplica a mesma exclusão no
  corpus e o lint de conteúdo passou a tratar `404.md` com frontmatter
  obrigatório reduzido (title e description), mantendo topic/lastReviewed
  válidos quando presentes e proibindo `draft: true` (o Starlight filtraria
  o 404 custom e o build cairia no nativo em silêncio). Os DOIS avisos de
  build atribuídos a esta fatia foram resolvidos: `Entry docs → 404 was
  not found` sumiu com o arquivo, e o da coleção i18n vazia sumiu com a
  coleção `i18n` declarada no `content.config.ts` (loader/schema do
  Starlight) mais `src/content/i18n/pt-br.json` materializando o ponto de
  override documentado (a UI pt-BR já vem traduzida no pacote).
- Gate permanente `scripts/check-publishing.mjs` no `verify`, depois do
  build: confere `_headers` idêntico em `public/` e `dist/`, formato válido
  (blocos, separador, teto de regras e de 2000 caracteres por linha), CSP
  com o conjunto EXATO de hashes dos scripts inline de TODAS as páginas do
  dist (nem faltando, nem órfão), diretivas obrigatórias com valores
  exatos, headers de segurança só na global, noindex em workers.dev nas
  duas formas e em nenhum outro lugar, `immutable` em `/_astro/*`,
  robots com Allow/Sitemap e sem `Disallow: /`, sitemap-index apontando o
  `sitemap-0.xml` do site canônico lido do `astro.config.mjs` e toda URL
  do sitemap mapeando a um `index.html` real do dist, 404 servido igual ao
  custom e ausente do `search-index.json`, `llms*.txt` presentes com as
  quatro palavras da política (busca, citação, grounding, treinamento) e
  `wrangler.jsonc` íntegro (404-page, sem SPA, sem `main`, data fixa).
  Módulo importável como o lint de conteúdo.
- Suíte: 29 testes novos (167 em 9 arquivos): 25 em
  `tests/publishing.test.ts` (funções puras do parse/CSP/hash/host mais
  fixture válida em tmpdir e 19 mutações de fixture, cada uma esperando a
  violação específica) e 4 em `tests/lint-policy.test.ts` cobrindo o 404
  utilitário (frontmatter reduzido, rascunho proibido, campos presentes
  validados).
- Sondas HTTP contra o `wrangler dev` local (nenhum deploy): as 4 regras
  foram parseadas sem erro; a home serve CSP completa e os headers de
  segurança sem `X-Robots-Tag`; `Host: epico-site-docs.pagelab.workers.dev`
  e `Host: abc123.epico-site-docs.pagelab.workers.dev` recebem
  `X-Robots-Tag: noindex`; `Host: docs.epico.site` não recebe (custom
  domain indexável); rota inexistente responde 404 real com o corpo do 404
  custom; `/_astro/*.js` serve `Cache-Control immutable`;
  `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, `llms*.txt`,
  `search-index.json`, WOFF2 e `pagefind.js` respondem 200 com
  content-type correto; `/busca` sem barra redireciona para `/busca/`.
- Sonda Chrome headless via CDP (ferramenta de sessão
  `scripts/probe-csp.mjs`, fora do `verify` como o `measure-theme.mjs`)
  contra o wrangler dev com headers reais: zero violações de CSP nas
  páginas navegadas, `StarlightThemeProvider` executando (script inline
  autorizado por hash), ToC presente, `/busca/` com o bloco revelado pelo
  script inline, índice buscado e input habilitado, e sonda negativa com
  um script inline hostil injetado por DOM BLOQUEADO pela CSP (a política
  está efetiva, não sendo ignorada). Duas ressavas honestas da sonda,
  corrigidas nela e não no produto: o seletor do ToC estava errado
  (`mobile-table-of-contents` em vez de `starlight-toc`/
  `mobile-starlight-toc`) e o `Runtime.evaluate` da sonda negativa
  precisou de `awaitPromise` para ler a Promise.
- Quinze provas por mutação com snapshot `cp` e restauração por checksum:
  hash removido, hash órfão, `unsafe-inline`, noindex global, regras
  workers.dev removidas, SPA fallback, `main` no wrangler, `Disallow: /`,
  robots sem Sitemap, 404 genérico, URL fantasma no sitemap, llms sem
  política, 404 no índice, `dist/_headers` divergente e cache sem
  immutable. Todas derrubaram o gate com a violação alvo.
- `.wrangler/` (estado local do wrangler dev) adicionado ao `.gitignore`.
- `npm run verify` verde com exit code 0: Astro Check sem diagnósticos nem
  avisos (i18n e 404 resolvidos), Content policy PASS, contraste PASS,
  167 testes em 9 arquivos, build de 17 páginas (acervo + `/busca/` + 404
  custom) + `/search-index.json` (15 entradas, 404 fora), zero
  vulnerabilidades, Static publishing PASS e política de install scripts
  PASS. Gates `G-CONTENT`, `G-VISUAL` e `G-CLOUDFLARE` não abertos:
  nenhum deploy, preview, DNS ou mudança de conta foi executado. Commit e
  push ao fim da sessão cobertos pela autorização durável do owner.

## Checkpoint de 2026-09-09: DOCS-07

- `npm ci` em árvore de verdade limpa (`node_modules`, `dist` e `.astro`
  removidos antes): 519 pacotes, zero vulnerabilidades, sem avisos de
  install scripts. `npm run verify` com exit code 0 antes e depois da
  correção da sessão: Astro Check sem diagnósticos nem avisos, Content
  policy PASS, contraste do tema PASS, build de 17 páginas +
  `/search-index.json`, Static publishing PASS, `npm audit` limpo e política
  de install scripts PASS.
- Inspeção dos artefatos construídos: Pagefind 1.5.2 com idioma `pt-br`,
  16 páginas indexadas (o 404 fora) e 16 fragments; `/busca/` com o bloco
  de busca nascendo `hidden` e as seis áreas no HTML estático; `404.html`
  com título e caminhos de saída; `_headers` com CSP de 10 hashes, headers
  de segurança só na global, `immutable` em `/_astro/*` e `noindex` apenas
  nas duas formas `workers.dev`; `robots.txt` com Allow e Sitemap;
  `sitemap-0.xml` com as 16 URLs canônicas; `llms.txt`/`-full`/`-small`
  com a política das quatro palavras; WOFF2 e OFL servidos.
- QA interativo com a ferramenta de sessão `scripts/qa-interactive.mjs`
  (Chrome headless via CDP com eventos de teclado e mouse reais, na mesma
  família do `measure-theme.mjs`; fora do `verify`), contra o `wrangler dev`
  local servindo o `dist/` com os headers reais: home dark com skip link
  "Pular para o conteúdo"; sidebar com os seis grupos corretos e link
  Busca; ToC desktop com as 7 âncoras (1 `#_top` + 6 seções) em
  correspondência exata e ToC mobile como `details`; deep-link
  `/busca/?q=dominio` com consulta preenchida, 4 resultados, URL preservada
  e status anunciado; debounce provado com digitação real (7 teclas a
  80 ms geram UMA única leva de render, 152 a 156 ms depois da última
  tecla); submit por Enter renderiza imediatamente (delta 0 ms); tema
  percebido trocando de verdade (fundo branco, `starlight-theme=light`,
  sobrevivendo a reload); acessibilidade estrutural limpa (landmarks
  header/nav/aside/main/footer, h1 único, zero botões sem nome, zero
  imagens sem alt, zero links sem texto, label ligado ao input,
  `role=status` com `aria-live=polite` anunciando a contagem); 404 custom
  renderizado; mobile 390 px sem overflow horizontal com ToC colapsado.
  Onze screenshots tirados e inspecionados visualmente (home dark, sidebar,
  ToC, busca com deep-link, debounce, light, anúncio, modal, 404, mobile).
- Achado real do QA, corrigido na sessão: o modal de busca do Starlight
  (Pagefind) estava quebrado pela CSP. Sonda com coleta de console pegou
  `WebAssembly.instantiate(): ... violates the following Content Security
  policy directive because 'unsafe-eval'`: sem `wasm-unsafe-eval` em
  `script-src`, o WASM do Pagefind não compila e o modal fica preso em
  "Searching". A sonda Chrome do `DOCS-06` navegava páginas e testava a
  `/busca/` (cliente próprio), mas nunca abriu o modal do Pagefind, por
  isso a lacuna passou. Correção: `'wasm-unsafe-eval'` em `script-src` no
  `public/_headers` (token estrito que autoriza só WebAssembly, não eval
  de JavaScript; `unsafe-eval` continua proibido), gate
  `check-publishing.mjs` passou a EXIGIR o token com mensagem própria
  (remoção futura derruba o gate) e a suíte ganhou o teste da mutação
  (168 testes em 9 arquivos). Prova por mutação: remover o token derruba o
  gate com a violação alvo (e a barreira de divergência dist/fonte);
  restauração por checksum; re-sonda empírica do modal com "8 results for
  dominio", 5 resultados renderizados e zero erros de console.
- Ressalvas honestas do QA: as mensagens da UI do Pagefind aparecem em
  inglês ("8 results for dominio") e a decisão de localizar é do owner no
  `G-VISUAL`; a troca de tema foi exercitada disparando o mesmo evento
  `change` que o teclado dispararia, porque o Chrome headless não processa
  popup de select nativo com eventos CDP sintéticos (provado em sonda: nem
  o foco permanece no select) — as duas paletas, a persistência e o reload
  foram verificados de verdade; leitor de tela real (VoiceOver) permanece
  verificação humana do `G-VISUAL`, com o QA local cobrindo a base
  estrutural que ele consome.
- Preview de plantão para o owner revisar: `wrangler dev` servindo o
  `dist/` com os headers reais em `http://localhost:8787/` (comando
  `npx wrangler dev --port 8787`; o `astro preview` não aplica os
  `_headers`). QA não é aceite: `G-CONTENT` e `G-VISUAL` seguem
  bloqueados até a revisão do owner e `G-CLOUDFLARE` segue fechado.
  Nenhum deploy, DNS ou mudança de conta foi executado. Commit e push ao
  fim da sessão cobertos pela autorização durável do owner.

## Checkpoint de 2026-09-09: primeira passagem de G-VISUAL/G-CONTENT

- Primeira passagem pedida pelo owner aplicada localmente, sem promover os
  gates humanos: o cabeçalho usa o SVG fornecido num override pontual de
  `SiteTitle`, único seam que mantém os dois paths inline e recoloríveis,
  com o título textual preservado como nome acessível; headings e links
  receberam os ajustes tipográficos; sidebar, Pagefind, botões e superfícies
  receberam os refinamentos literais do feedback.
- Os quatro trechos indicados no FAQ perderam somente o negrito, sem mudança
  de texto, ordem, links ou conteúdo factual.
- As cores compartilhadas foram declaradas como tokens locais responsivos,
  sem importar `tokens.css`: light usa os valores literais indicados pelo
  owner e dark usa os equivalentes vigentes do design system da Área de
  Clientes. O logo segue os tokens canônicos do painel: largura renderizada
  164 px, `max-width: 165px`, wordmark `#3d4b51` e mark `#2135dd` no light,
  ambos `#ffffff` no dark, sem filtro. Inspeção no browser confirmou os cinco
  valores computados e cobriu desktop dark/light, sidebar e pill ativo,
  Pagefind com resultados e mobile 390 px. Por correção posterior do owner,
  o diálogo do Pagefind usa o mesmo token responsivo de fundo da sidebar,
  `--epico-sidebar-background`, em vez do rosa claro de navegação ativa. O
  scrollbar da sidebar também ganhou tokens próprios por tema: trilha igual
  à superfície e sem borda, thumb dessaturado `#e8eefb` no light e equivalente
  neutro `#2c3240` no dark.
  No breakpoint a partir de 50 rem, `.large` passou a usar
  `var(--sl-text-sm)`, conforme o ajuste tipográfico literal do owner.
  O brand strip canônico de 5 px foi adaptado ao Starlight somente no header,
  via token local de espessura e `--epico-color-action-primary` responsivo.
  Os ícones do seletor de tema usam `0.9em`; o `select` ganhou largura e
  paddings calculados pelos tokens públicos do componente, deixando “Escuro”
  visível por inteiro. O hero passou a renderizar o asset local
  `src/assets/hero-image.webp` à direita da stack, com alt descritivo e grid
  desktop ajustado de `7fr 4fr` para `6fr 5fr`. Após o owner identificar o
  corte do preset `400 × 400` do Starlight, um override pontual de `Hero`
  passou a usar os metadados intrínsecos `609 × 306` e largura responsiva,
  preservando a imagem inteira.
  `--sl-color-hairline-light` passou a referenciar `--sl-color-gray-5` nas
  duas paletas, conforme a correção literal do owner.
- O owner removeu a superfície rosa do item ativo da sidebar. O link passou a
  ter padding uniforme de `.6em` e raio de 5 px. Os tokens semânticos apontam
  para `--epico-color-action-primary` no texto e `--sl-color-black` no fundo:
  no light, `#3253e8` sobre branco; no dark, `#8098f6` sobre a própria
  superfície escura da sidebar. A inspeção no browser confirmou os valores
  computados, o padding de 9,6 px nos quatro lados e o raio de 5 px nas duas
  paletas. O gate de contraste agora passa com 5,94:1 no light e 6,65:1 no
  dark.
- Próximo passo verificável: devolver o preview para o owner continuar os
  aceites humanos `G-VISUAL` e `G-CONTENT`. Nenhum commit ou push foi feito
  durante esta iteração visual.
- O hero manteve `src/assets/hero-image.webp` por correção direta do owner,
  com metadados intrínsecos `609 × 306`; o grid `6fr 5fr` passou para o
  próprio override de `Hero`, removendo a duplicação no CSS global. O botão
  minimal compartilha o mesmo token de padding do botão primário nos dois
  breakpoints; o browser confirmou `7 px × 18 px` em ambos no viewport móvel.
- Dois atalhos foram adicionados depois do parágrafo introdutório da home com
  a estrutura `summary-grid`/`summary-card` da página Início do painel:
  eyebrow, footer, título e ícone de saída. Os tokens locais reproduzem as
  superfícies, bordas, tipografia, raio, espaçamento e hover do painel em
  light e dark sem importar `tokens.css`. Hover real no browser confirmou
  ação azul, borda azul, elevação de 2 px e sombra no light; no dark, a
  elevação e a cor permanecem, com sombra desativada como no painel.
- O seam público `SocialIcons` recebeu override local para os dois links do
  header e do menu móvel: Área de clientes usa o SVG de entrada fornecido e
  Épico Site usa o SVG de foguete fornecido. Os dois usam `currentColor`, sem
  media query própria, e `--sl-icon-size: 1.2em`; o browser confirmou 19,2 px
  e cores resolvidas pelas paletas do Starlight. O gate de contraste ganhou
  título, eyebrow, hover e ícone dos cards e passa nos 32 pares medidos.
- Durante o gate final, o registro npm passou a reportar a vulnerabilidade
  `GHSA-7w5x-hrqm-74c2` no `smol-toml@1.7.0` fixado pela versão corrente de
  `markdownlint-cli2`. O downgrade destrutivo sugerido por `npm audit fix
  --force` não foi usado; override exato para `smol-toml@1.8.0`, versão já
  consumida por Astro, removeu a cópia vulnerável e ganhou contrato na suíte.
  `npm run verify` voltou a exit 0: 172 testes, 32 pares de contraste, build
  de 17 páginas, publicação estática PASS, zero vulnerabilidades e install
  scripts PASS.
- A escala de headings foi reduzida para os degraus móveis do Starlight em
  todos os viewports: H1 `4xl`, H2 `3xl`, H3 `2xl` e H4 `xl`. O literal
  `--sl-text-1xl` indicado pelo owner não existe no Starlight 0.42; foi usado
  o token nativo equivalente `--sl-text-xl`, evitando uma referência sem
  resolução. O browser confirmou 35, 29, 24 e 20 px nas duas paletas.
- O efeito espacial do `epico.site` foi adaptado ao pseudo-elemento inferior do
  `body` com o asset local `src/assets/outer-space.webp` (2048 × 1153,
  SHA-256 `d15fd91727da2471e5e428dfdf6c8d2a08e33f95a62e812efee5cbe9b3ab1936`).
  A imagem só é carregada a partir de 769 px e mantém a CSP `img-src 'self'`.
  O overlay inferior usa altura de 40 em, máscara para o topo e z-index
  negativo; tokens de tema preservam `color`/opacidade 1 no light e
  `screen`/opacidade 0,7 no dark, conforme a implementação canônica. No
  viewport móvel, o browser confirmou ausência de download da imagem e os
  demais valores computados por tema.
- O primeiro parágrafo de cada bloco `.sl-markdown-content` passou a usar
  `text-align: center`, conforme o ajuste literal do owner.
- As capturas do owner revelaram que os pseudos espaciais com `70em`
  ultrapassavam o conteúdo curto da home e aumentavam o `scrollHeight`.
  A altura foi reduzida para `40em`; `isolation: isolate` foi removido para
  recuperar no light o mesmo contexto de composição `mix-blend-mode: color`
  observado no `epico.site`. Os `summary-card` passaram a ter fundo
  transparente e o gate de contraste mede seu texto contra o fundo real da
  página.
- O overlay espacial foi escopado a `body:has(.hero)`, marcador exclusivo da
  homepage. Nenhuma rota editorial sem hero recebe os pseudos ou solicita o
  asset `outer-space.webp`.
- A borda dos `summary-card` usa `var(--sl-color-gray-3)` no dark e
  `var(--sl-color-gray-5)` no light. O `body::before` foi removido por completo
  para a homepage curta, mantendo somente o overlay inferior `body::after`.
- Ao fim da primeira rodada de revisão no preview, o owner autorizou commit e
  push. `npm run verify` rodou verde na sessão (exit 0, 173 testes em 9
  arquivos, 32 pares de contraste, build de 17 páginas, publicação estática
  PASS, zero vulnerabilidades) e a árvore foi commitada e enviada para
  `origin/main`. Os gates `G-CONTENT` e `G-VISUAL` seguem em aberto até os
  aceites explícitos do owner; correções adicionais apontadas na revisão
  entrarão como commit próprio.

## Checkpoint de 2026-09-10: aceites humanos e definição do G-CLOUDFLARE

- O owner aceitou `G-CONTENT` e `G-VISUAL` em 2026-09-10 ("accepted/verdes") e
  autorizou abrir os demais gates. As duas linhas da ordem executiva passaram
  a `aceito 2026-09-10` e `DOCS-08` passou a `em andamento`.
- `G-CLOUDFLARE` definido pela
  [ADR 0002](docs/decisions/0002-cloudflare-publication.md): produção é o
  branch `main` de `pagelab/epico-site-docs`, Worker `epico-site-docs` em
  Static Assets sem `main`, bindings ou segredos (least privilege
  estrutural), deploy canônico por Workers Builds com
  `npm ci && npm run verify` como comando de build e deploy somente com o
  gate em exit 0, `wrangler deploy` local com verify verde como caminho
  manual e bootstrap, previews fora de `main` apenas em `*.workers.dev` (já
  `noindex` pelo `_headers` nas duas formas de URL), rollback por versions do
  Worker sem rebuild ou por `git revert` reexecutando o pipeline, e
  `docs.epico.site` como Workers Custom Domain da zona `epico.site`, com a
  origem `workers.dev` pública apenas como canary `noindex`.
- Sonda de produção `scripts/probe-production.mjs` escrita para a verificação
  pós-deploy exigida pelo `DOCS-08`, cada critério em verificação própria:
  DNS e TLS (SAN e validade do certificado), HTTP (redirect permanente para
  https, home, `/busca/`, redirect com barra, 404 real com corpo custom),
  CSP estrutural com hashes e `wasm-unsafe-eval` e sem `unsafe-inline`/eval,
  headers de segurança, CORS sem `Access-Control-Allow-Origin` aberto,
  cache/ETag com `immutable` e revalidação 304 real do asset, sitemap 1:1 com
  o dist local com HEAD em cada URL, robots, `llms*.txt` com as quatro
  palavras da política, `search-index.json` byte a byte com o dist e canary
  `workers.dev` com noindex. Ferramenta de sessão como o `probe-csp.mjs`,
  fora do `verify`. `node --check` e markdownlint da ADR verdes.
- Baseline da sessão: `npm run verify` exit 0 duas vezes (antes e depois dos
  arquivos novos), 173 testes, build de 17 páginas, publicação estática PASS,
  zero vulnerabilidades.
- Deploy NÃO executado por bloqueio de credencial: o token do servidor MCP da
  API Cloudflare é inválido (`1000 Invalid API Token` no verify do token e
  `9109` nos endpoints de conta), o OAuth local do wrangler expirou sem
  conseguir renovar e cinco tentativas de `wrangler login` (janela de ~10
  minutos com aba aberta no navegador e notificação do macOS) expiraram sem
  o owner aprovar. Nenhum recurso Cloudflare foi criado ou alterado.
- Setup oficial de agente Cloudflare executado na sequência, a pedido do
  owner (`developers.cloudflare.com/agent-setup/prompt.md`): 14 skills
  oficiais instaladas em `~/.zcode/skills` (wrangler, cloudflare,
  workers-best-practices, durable-objects e demais) e os cinco servidores
  MCP remotos registrados em `~/.zcode/cli/config.json`: api
  (`mcp.cloudflare.com`, já existia com o token `cfat_` expirado), docs
  (`docs.mcp.cloudflare.com`, sem autenticação), bindings, builds e
  observability (os três com o mesmo Bearer do api, a renovar de uma vez).
  Backup do config em `config.json.bak-agent-setup`. Os servidores ficam
  disponíveis depois de reiniciar o agente.
- Próximo passo verificável: owner reiniciar o agente ZCode, renovar o token
  da API em `https://dash.cloudflare.com/profile/api-tokens` e informar o
  novo valor à sessão, que o aplica às quatro entradas autenticadas. Com o
  token válido, a sessão retoma `DOCS-08`: deploy de produção, custom domain
  `docs.epico.site`, Workers Builds e `probe-production.mjs` em verde.

## Checkpoint de 2026-09-10: bootstrap de produção do DOCS-08

- Agente reiniciado com os cinco servidores MCP Cloudflare ativos. O token
  `cfat_` do MCP segue inválido (`1000 Invalid API Token`), mas o OAuth do
  wrangler foi renovado pelo owner (`wrangler whoami` autenticado como
  `contato@uberfacil.com`, account `ff43237266d9602f6f795600729b0bf1`, com
  `workers_scripts`/`workers_routes` write, `zone` read e `ssl_certs` write).
  A ADR 0002 ponto 3 autoriza `wrangler deploy` local com verify verde na
  sessão como bootstrap, então a publicação seguiu por esse caminho. Zona
  `epico.site` confirmada ativa na conta (id
  `c42c09ae7884ffe30ca0f68a0ede83c3`) antes de qualquer mudança.
- `wrangler.jsonc` ganhou a declaração completa da ADR 0002: rota
  `{ "pattern": "docs.epico.site", "custom_domain": true }`, `workers_dev:
  true` e `preview_urls: true`. Achado real do primeiro deploy: com `routes`
  declaradas o wrangler DESLIGA a rota workers.dev salvo declaração
  explícita, e a origem canary respondia 404 com `error code: 1042` (a ADR
  ponto 6 exige a origem publicada como canary). O subdomínio workers.dev
  REAL da conta é `epico` (confirmado via API), não `pagelab` (palpite do
  DOCS-06). Os placeholders `:script`/`:account` do `_headers` sempre casaram
  a origem correta, então só o default da sonda apontava errado. Segundo
  deploy com os três campos: versão `ca95ddeb-1d19-4873-aedf-083b27460b27`
  (o primeiro, só custom domain, foi `6482dc37-7cbb-411e-a517-9169fb3f07c4`),
  73 assets, triggers `https://epico-site-docs.epico.workers.dev` e
  `docs.epico.site` (custom domain).
- Gate `check-publishing.mjs` endurecido na mesma sessão: agora exige
  `workers_dev: true`, `preview_urls: true` e `routes` exatamente igual ao
  custom domain canônico (chave extra ou padrão divergente falha), guardando
  as decisões de deploy da ADR no `verify`. Três testes de mutação novos em
  `tests/publishing.test.ts` (29 no arquivo) e duas provas por mutação no
  `wrangler.jsonc` REAL (sem `workers_dev` e com padrão de rota trocado), cada
  uma derrubando o gate com a violação alvo, restauração conferida por
  checksum. `npm run verify` verde: 176 testes em 9 arquivos, contraste 32
  pares, build de 17 páginas, publicação estática PASS, zero vulnerabilidades.
- `probe-production.mjs` contra a produção real: primeira rodada 11/16. Quatro
  expectativas eram da SONDA, não do produto, e foram corrigidas nela: SAN
  precisa casar wildcard de um rótulo (`*.epico.site` cobre `docs.epico.site`,
  certificado gerenciado Google Trust Services válido até 2026-12-09), o
  redirect de barra final do runtime de static assets é 307 fixo da
  plataforma (aceito 301/302/307/308 com Location canônica), a política
  pública vive só no `llms.txt` por contrato do gate (as variantes full/small
  são conteúdo derivado sem o bloco `details`) e o default da origem canary
  passou ao subdomínio real. Segunda rodada 15/16.
- Verificado em produção (verde): DNS resolvendo, TLS wildcard válido, home
  200 sem `noindex`, CSP com os 10 hashes e `wasm-unsafe-eval` sem
  `unsafe-inline`/`unsafe-eval`, headers de segurança completos, CORS sem
  ACAO aberto, `/busca/` 200 com redirect de barra, 404 real com o corpo
  custom, `immutable` + ETag revalidado com 304 em `/_astro/*`, ETag no HTML,
  sitemap 1:1 com o dist local (16 URLs em HEAD), robots com Sitemap
  canônico, três `llms*.txt` servidos com a política no `llms.txt`,
  `search-index.json` byte a byte igual ao dist e canary workers.dev 200 com
  `noindex` e CSP.
- Única vermelha da sonda: redirect HTTP→HTTPS. `http://docs.epico.site/`
  serve 200 direto (sem redirect permanente). A correção é setting de zona
  (`Always Use HTTPS`, afeta a zona inteira) ou Redirect Rule escopada ao
  host, e o OAuth do wrangler não cobre escrita (nem leitura) de settings ou
  regras de zona (403 código 10000). Fica como ação do owner: dashboard, ou
  token de API renovado com permissão de Zone Rules/Settings para a sessão
  aplicar via API. O HSTS já enviado e o canonical/robots em https mitigam
  conteúdo duplicado enquanto isso.
- `probe-csp.mjs` apontado à produção: funcionalidade íntegra (theme provider
  executando, ToC presente, `/busca/` revelada com índice carregado e input
  habilitado, script inline hostil bloqueado pela CSP). Achado real: a zona
  tem Web Analytics da Cloudflare com injeção automática e o beacon
  `static.cloudflareinsights.com` é bloqueado pela CSP estrita (as três
  violações reportadas são o mesmo beacon). Nenhum tracking ocorre (bloqueado
  por construção). Decisão do owner pendente: desligar a injeção automática
  na zona OU decidir adotar analytics, o que exigiria abrir `script-src`/
  `connect-src` no `_headers`, mudar gate e emendar a ADR.
- Workers Builds bloqueado em duas pontas independentes, ambas confirmadas por
  sondagem: (1) o GitHub App da Cloudflare NÃO está instalado para `pagelab`
  (API do GitHub do owner lista zero instalações) e a doc oficial exige a
  instalação via dashboard (Workers & Pages → Worker → Settings → Builds →
  Connect → GitHub), fluxo web que a API não substitui. (2) A API de Builds
  responde 403 código 10000 até para leitura com o OAuth do wrangler
  (permissão Workers Builds ausente no OAuth). Deixado pronto para a próxima
  sessão: org `pagelab` id `1451087`, repo `epico-site-docs` id `1361499499`,
  build command `npm ci && npm run verify` (ADR ponto 3), trigger de produção
  no `main` e previews fora de `main` já `noindex` pelo `_headers`.
- Commit e push ao fim da sessão cobertos pela autorização durável (verify
  exit 0 na sessão). O deploy em si usou o caminho bootstrap autorizado pela
  ADR e não abriu o gate humano do `G-CLOUDFLARE`, que segue em execução com
  produção no ar.

## Checkpoint de 2026-09-10: domínio canônico tutoriais.epico.site

- Decisão do owner no mesmo dia do deploy: a audiência é majoritariamente
  brasileira e `tutoriais` comunica melhor o propósito do acervo que `docs`.
  Registrada na
  [ADR 0003](docs/decisions/0003-dominio-canonico-tutoriais.md), que
  supersede apenas o ponto 6 da ADR 0002 (anotado no status da própria 0002).
  Slugs publicados permanecem inalterados: só o hostname mudou.
- Troca aplicada em todos os pontos vivos: `site` do `astro.config.mjs`
  (fonte única dos URLs canônicos, sitemap, canonical e política llms, cujo
  texto passou a citar `tutoriais.epico.site`), `Sitemap` do
  `public/robots.txt`, rota do `wrangler.jsonc`, `AGENTS.md`, `README.md` e
  default do `probe-production.mjs` (label de DNS derivado do host). Nenhuma
  ocorrência do domínio antigo resta fora das ADRs e dos checkpoints
  históricos.
- O gate `check-publishing.mjs` parou de fixar hostname por literal: a rota
  exigida passou a ser o hostname do site canônico lido do
  `astro.config.mjs`. Divergência de domínio entre config e deploy derruba o
  gate a partir de agora. Teste de mutação da rota reescrito derivado de
  `SITE`. `npm run verify` verde com 176 testes.
- Deploy da troca (versão `5d188d17-9905-46f2-820b-a1dbc50d477c`): 21 assets
  reenviados (arquivos com URLs novos: sitemap, robots, llms, HTMLs com
  canonical) e 52 reaproveitados. A API confirma `tutoriais.epico.site`
  anexado ao Worker `epico-site-docs` e `docs.epico.site` removido da conta,
  sem custom domain órfão (`epico.site` e `beta.epico.site` seguem anexados a
  outros Workers do owner, intocados).
- Verificação pós-troca: `probe-production.mjs` 15/16 no novo domínio (DNS,
  TLS wildcard válido até 2026-10-19, CSP com os 10 hashes, headers de
  segurança, `/busca/`, 404 custom, cache/ETag com 304, sitemap 1:1 servindo
  `tutoriais.epico.site`, robots, llms, `search-index.json` byte a byte e
  canary workers.dev com noindex). O hostname antigo não resolve mais
  (registro DNS removido junto com o custom domain). A única vermelha segue
  sendo o redirect HTTP→HTTPS, agora aplicável ao novo hostname, a mesma
  pendência de zona do owner. `probe-csp.mjs` no novo domínio: funcionalidade
  íntegra, script hostil bloqueado e as mesmas três violações do beacon de
  Web Analytics da zona (decisão do owner pendente).
- Sem redirect do hostname antigo por decisão registrada na ADR 0003:
  a publicação no domínio antigo durou horas sem divulgação e Redirect Rule
  exige permissão de zona que a sessão não tem. O caminho fica documentado
  caso links tenham sido salvos.
- Commit e push cobertos pela autorização durável (verify exit 0 na sessão).

## Checkpoint de 2026-09-10: fechamento do DOCS-08

- Token `cfut_` aplicado pelo owner nas quatro entradas autenticadas do
  `~/.zcode/cli/config.json` (`cloudflare-api`, `cloudflare-bindings`,
  `cloudflare-builds`, `cloudflare-observability`, mesmo valor conferido).
  Verify da API: `active`. Zonas e conta listadas com o token: zona
  `epico.site` (id `c42c09ae7884ffe30ca0f68a0ede83c3`) e conta
  `ff43237266d9602f6f795600729b0bf1`, iguais aos ids registrados.
- Triggers do Workers Builds conferidos por API: o owner já tinha conectado
  o repo (repo_connection `73d43a6d`, repo `epico-site-docs` id `1361499499`,
  provider `github`, org `pagelab` id `1451087`) e deixado os DOIS triggers
  exatamente como a ADR 0002 define: produção (`ea467d5c`) com
  `branch_includes ["main"]`, build command `npm ci && npm run verify` e
  deploy `npx wrangler deploy`; preview (`7f74ef20`) com todas as branches
  exceto `main`, o mesmo gate e deploy `npx wrangler versions upload`
  (versão de preview, sem promover). Worker tag
  `f433b2be6327495a938ab47307bac494`, build token próprio da conta.
- Build manual de validação disparado pela API (`907df2a1`, branch `main`):
  o ambiente detectou `nodejs@24.20.0` e `npm@11.19.0` do `.nvmrc` e do
  `package.json`, o clone e o `npm clean-install` passaram, e o build
  FALHOU dentro do gate: `markdownlint` MD034 em `STATE.md:289`, a URL do
  GitHub App escrita crua no bookmark do commit `c3e8ab9` (escrito depois
  do verify daquela sessão, então nunca tinha sido lintado). O deploy foi
  bloqueado com o gate vermelho, que é a prova estrutural do critério da
  ADR 0002: nenhum deploy sem verify exit 0. O histórico de builds contou a
  mesma história: o build do push do bookmark `c3e8ab9` (`66054cfa`) tinha
  falhado pelo mesmo MD034, e o build da conexão original (`4b05ed63`,
  commit `c3352c3`) tinha passado com deploy.
- Correção: a URL ganhou delimitadores `<...>` no `STATE.md` (commit
  `366ad28`), `npm run verify` local exit 0 e push. O trigger automático de
  push disparou o build `72f8af46` (commit `366ad28`) sem intervenção:
  SUCCESS, deployment `99adcca2` às 17:55:16Z e versão
  `0cee9266-f07e-464a-8791-9999ea6122f5` em produção. O ciclo canônico
  push no `main` → build → gate → deploy está validado ponta a ponta, nos
  dois sentidos (gate vermelho bloqueia, gate verde publica).
- Single Redirect HTTP→HTTPS criado por API com a permissão
  `Redirecionamento único: Editar` do token: PUT no entrypoint da fase
  `http_request_dynamic_redirect` da zona `epico.site` (ruleset
  `afc7e7ad004241f2864b82cddc64ddfe`, antes vazio), regra `ref`
  `tutoriais_http_to_https` com expressão
  `(not ssl) and (http.host eq "tutoriais.epico.site")`, ação `redirect`
  301 para `concat("https://tutoriais.epico.site", http.request.uri.path)`
  com `preserve_query_string`. Escopo restrito ao host novo: o hostname
  antigo segue sem redirect por decisão da ADR 0003. Validação empírica:
  `http://` raiz responde 301 com Location `https://tutoriais.epico.site/`,
  `http://tutoriais.epico.site/busca/?q=dominio` preserva path e query no
  Location, e `https://` direto responde 200 sem loop. Nenhum outro host da
  zona foi tocado.
- `scripts/probe-production.mjs` 16/16 contra produção (antes 15/16): DNS,
  TLS wildcard válido, redirect HTTP→HTTPS agora VERDE com 301 e Location
  https, home 200 sem noindex, CSP com os 10 hashes e `wasm-unsafe-eval`,
  headers de segurança, CORS sem ACAO aberto, `/busca/` 200 com redirect de
  barra, 404 real com corpo custom, `immutable` com ETag revalidado em 304,
  sitemap 1:1 com o dist local (16 URLs), robots com Sitemap canônico, os
  três `llms*.txt` com a política no `llms.txt`, `search-index.json` byte a
  byte igual ao dist e canary workers.dev 200 com noindex e CSP. A sonda
  validou o deployment novo do Workers Builds.
- `DOCS-08` concluído e `G-CLOUDFLARE` fechado. Pendências separadas do
  owner, fora do task: beacon de Web Analytics da zona (segue bloqueado
  pela CSP estrita, sem tracking; desligar a injeção na zona ou adotar
  analytics deliberadamente com emenda da ADR 0002), visibilidade pública
  do remoto e a abertura de `PANEL-01A`, agora desbloqueado tecnicamente
  pelo Docs em produção, em sessão própria no workspace Área de Clientes.
- Commit e push cobertos pela autorização durável (verify exit 0 na sessão).
