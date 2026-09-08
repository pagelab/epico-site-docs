# Tutoriais Épico Site

Acervo público e canônico de tutoriais do Épico Site, construído com Astro e
Starlight para publicação em `https://docs.epico.site/`.

O conteúdo vive neste repositório em Markdown. O WordPress da Área de Clientes
apenas aponta para as páginas públicas e consulta um índice JSON derivado deste
mesmo acervo. Ele não mantém uma segunda cópia dos artigos.

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
