# Tutoriais Épico Site

Acervo público e canônico de tutoriais do Épico Site, construído com Astro e
Starlight para publicação em `https://tutoriais.epico.site/`.

O conteúdo vive neste repositório em Markdown. O WordPress da Área de Clientes
apenas aponta para as páginas públicas e consulta um índice JSON derivado deste
mesmo acervo. Ele não mantém uma segunda cópia dos artigos.

O acervo é de uso livre para busca, citação, grounding e treinamento. A
política pública de uso está declarada em
<https://tutoriais.epico.site/llms.txt>.

## Ambiente local

Use exatamente as versões registradas em `.nvmrc`, `package.json` e
`package-lock.json`:

```sh
nvm use
npm ci
npm run verify
```

Para desenvolvimento:

```sh
npm run dev
```

Para conferir a build estática:

```sh
npm run build
npm run preview
```

## Estado e fila

- [`STATE.md`](STATE.md) guarda o ponto exato de retomada entre sessões.
- [`TASKS.md`](TASKS.md) é a fila priorizada e registra dependências, gates e
  critérios de conclusão.
- [`docs/decisions/0001-public-docs-architecture.md`](docs/decisions/0001-public-docs-architecture.md)
  fixa a fronteira entre o acervo, o painel e a infraestrutura de publicação.

## Publicação e contribuição

A produção é o branch `main` deste repositório, publicada pelo Workers Builds
da Cloudflare com o gate `npm ci && npm run verify`: o deploy só acontece com
o gate em exit code zero. Contribuições externas seguem pull request e
passam pelo mesmo gate. As decisões vigentes estão em
[`docs/decisions/`](docs/decisions/).
