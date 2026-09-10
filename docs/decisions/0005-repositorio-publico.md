# ADR 0005 — repositório remoto público

- **Status:** aceita (altera o "privado" do ponto 1 da
  [ADR 0002](0002-cloudflare-publication.md))

## Contexto

A [ADR 0002](0002-cloudflare-publication.md) definiu a fonte de produção
como o branch `main` do repositório `pagelab/epico-site-docs`, privado, e
deixou a visibilidade pública como decisão separada do owner. O acervo é
público por natureza, com política de uso livre para busca, citação,
grounding e treinamento declarada no `llms.txt`, e a publicação está no ar
com o pipeline canônico validado (Workers Builds com gate obrigatório). O
owner aprovou a visibilidade pública em 2026-09-10.

## Decisão

1. O repositório `pagelab/epico-site-docs` passa a ser público no GitHub. O
   branch de produção continua sendo `main` e o deploy canônico continua
   sendo o Workers Builds com `npm ci && npm run verify`, sem mudança no
   pipeline.
2. Nenhuma credencial entra no repositório, como já estabelecia o ponto 7 da
   ADR 0002: o histórico foi escrito sob a regra de nunca commitar token,
   segredo, PII, URL assinada ou dado de cliente. Identificadores não
   secretos (ids de conta, zona, Worker, versões e triggers) não são
   credenciais e podem ficar públicos.
3. O acervo editorial continua tendo este repositório como autoridade única:
   mudanças entram por pull request e passam pelo mesmo gate antes do deploy.

## Consequências

- Qualquer pessoa pode ler código, conteúdo, decisões e bookmarks de sessão,
  inclusive o histórico.
- Forks e clones públicos passam a existir. Reverter para privado não desfaz
  forks nem caches criados no período público.
- Contribuições externas seguem o fluxo de pull request com o gate
  obrigatório, sem caminho direto de escrita na produção.
