# ADR 0004 — Web Analytics da Cloudflare no acervo

- **Status:** aceita
- **Data:** 2026-09-10
- **Decisor:** owner do Épico Studio

## Contexto

A zona `epico.site` tem o Web Analytics da Cloudflare com injeção automática
ativa. O `public/_headers` do acervo aplica CSP estrita, sem `unsafe-inline`
e sem hosts de terceiros em `script-src`, então o beacon
`static.cloudflareinsights.com` injetado pela edge era bloqueado pelo browser
e nenhuma coleta acontecia (achado do DOCS-08 com o `probe-csp`, três
violações de console do mesmo beacon). A decisão ficou registrada como
pendência separada: desligar a injeção na zona ou adotar analytics
deliberadamente, o que exigiria abrir a CSP, mudar o gate e registrar a
decisão. O owner escolheu adotar.

## Decisão

1. Adotar o Web Analytics da Cloudflare pela injeção automática da zona, sem
   snippet manual no acervo: o HTML do `dist` continua sem scripts de
   terceiros e o canary `workers.dev`, fora da zona, não recebe injeção.
2. A CSP abre pontualmente `script-src` para
   `https://static.cloudflareinsights.com`. O host é a autorização mínima
   estável: a edge injeta `<script type="module">` com path versionado
   (`beacon.min.js/v31...`) e SRI, então o caminho exato sugerido pela FAQ
   oficial quebraria a cada atualização do beacon (confirmado no HTML servido
   em 2026-09-10).
3. `connect-src` permanece exatamente `'self'`: na injeção automática o
   beacon reporta para o próprio domínio, forma documentada pela FAQ oficial.
4. O gate `scripts/check-publishing.mjs` passa a EXIGIR o host do beacon em
   `script-src` com mensagem própria, coberto por teste de mutação: a remoção
   futura da autorização derruba o verify e o deploy, mantendo esta decisão
   viva no pipeline.
5. O Web Analytics da Cloudflare é cookieless e não coleta PII. A política
   pública de uso do `llms.txt` não muda.

## Consequências

- O browser passa a baixar o beacon da Cloudflare nas páginas do custom
  domain e as métricas agregadas ficam disponíveis no dashboard da zona.
- A CSP passa a confiar no host `static.cloudflareinsights.com` para
  scripts. O host é dedicado ao beacon, mas qualquer script que a Cloudflare
  sirva ali passa a ser autorizado no acervo.
- A sonda `probe-csp.mjs` passa a esperar zero violações de console no
  custom domain, com o script inline hostil continuando bloqueado.
- Desligar a injeção na zona ou reverter esta decisão exige fechar a CSP e
  remover a exigência do gate em conjunto.
