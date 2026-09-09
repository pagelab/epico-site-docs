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
