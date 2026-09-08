# AGENTS.md — Tutoriais Épico Site

## Início e fim de cada sessão

1. Leia `STATE.md` antes de agir.
2. Execute apenas o task apontado em `▶ Próxima ação`, salvo ordem direta do
   owner para outro task.
3. Atualize `TASKS.md` quando o estado de um task mudar.
4. Atualize `STATE.md` por último, com uma próxima ação concreta e verificável.

## AI model routing

Referência global: [`../../Brain/AI/MODEL-ROUTING.md`](../../Brain/AI/MODEL-ROUTING.md).

As recomendações são somente advisory, nunca enforcement. Consulte a recomendação
transitória no `STATE.md` quando existir.

## Autoridades e fronteiras

- Este repositório é a autoridade do conteúdo público de `docs.epico.site`.
- Markdown em `src/content/docs/` é a única fonte editorial.
- O índice JSON e a página `/busca/` são derivados do mesmo acervo.
- A Área de Clientes apenas consome links e o índice. Ela não copia artigos.
- Não usar WordPress como CMS deste acervo.
- Não escrever em `Produto/Site-kits`, `Produto/Kits`, `Brain` ou no projeto da
  landing `epico.site` a partir deste repositório.
- O ciclo de release deste repositório é independente do plugin
  `epico-client-area`.

## Stack e comandos

- Astro estático com Starlight.
- Node e npm usam as versões exatas de `.nvmrc` e `package.json`.
- Instalação reproduzível com `npm ci`.
- Gate técnico local: `npm run verify` com exit code zero.
- Nenhum deploy, custom domain ou alteração de conta Cloudflare sem o task e o
  gate correspondentes em `TASKS.md`.

## Conteúdo público

- Nunca publicar PII, credenciais, tokens, URLs assinadas ou dados de cliente.
- Usar `equipe Épico` para trabalho humano.
- Não chamar o serviço de `setup` em texto corrido voltado ao cliente. Usar o
  nome próprio `Setup Headless` quando necessário.
- Não prometer lançamento depois de uma fixture técnica.
- DNS e revisão de plugins são etapa posterior incluída no Setup Headless.
- Preservar a escolha entre fazer por conta própria e contratar execução.
- Não usar travessão longo nem ponto e vírgula em texto voltado ao cliente.
- Slugs publicados são permanentes. Mudança posterior exige redirect
  documentado e teste.

## Design e segurança

- O design system é próprio deste acervo. Compartilha somente cores de marca e
  as fontes Cal Sans e Outfit com as outras superfícies.
- Não importar o `tokens.css` do painel e não criar overrides de componentes do
  Starlight sem nova decisão.
- Fontes são locais. Sem Google Fonts ou CDN.
- Toda entrada remota consumida no browser é não confiável e deve passar por
  validação de tipo, tamanho e origem antes de renderizar.
- Conteúdo remoto entra no DOM apenas por APIs de texto, nunca por `innerHTML`.
