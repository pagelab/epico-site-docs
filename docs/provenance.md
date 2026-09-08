# Mapa de proveniência do corpus

> Registro interno de onde cada artigo do acervo veio e para qual slug canônico
> migrou. Não é conteúdo público. Cada task de migração atualiza as próprias
> linhas e mantém `tests/provenance.test.ts` verde.

## Fonte semente

O corpus semente vive fora deste repositório, no workspace
`Produto/Area-de-clientes`, diretório `docs/knowledge-base/`, versionado no
repositório da Área de Clientes. A coluna de commit registra o último commit
que tocou a fonte no momento da migração. É essa a origem exata contra a qual
a revisão factual de `G-CONTENT` compara o texto migrado.

As migrações aplicam apenas os ajustes que as regras editoriais deste acervo
exigem, como trocar ponto e vírgula, travessão longo ou a palavra "setup" em
texto voltado ao cliente. Nada além disso é reescrito sem registro.

## Migrações e artigos novos

| Fonte em `docs/knowledge-base/` | Commit de referência | Destino canônico | Task | Estado |
| --- | --- | --- | --- | --- |
| `01-entenda-o-novo-formato.md` | `eec17af7d3984c45cf82be8c9fd8a925b3888ab5` | [`primeiros-passos/formatos-de-publicacao`](../src/content/docs/primeiros-passos/formatos-de-publicacao.md) | `DOCS-03A` | migrado em 2026-09-08 |
| `03-edicao-e-personalizacao.md` | `3b1b075a1ce3c22fd8c62cac4e9bd4212e3a18d9` | [`editar-seu-site/edicao-e-personalizacao`](../src/content/docs/editar-seu-site/edicao-e-personalizacao.md) | `DOCS-03A` | migrado em 2026-09-08 |
| `02-precos-e-hospedagem.md` | n/a | a definir | `DOCS-03B` | pendente |
| `04-suporte-e-propriedade.md` | n/a | a definir | `DOCS-03B` | pendente |
| `FAQ.md` | n/a | a definir | `DOCS-03C` | pendente, fundir com `FAQ-consolidado.md` |
| `FAQ-consolidado.md` | n/a | a definir | `DOCS-03C` | pendente, fundir com `FAQ.md` |
| (sem origem) | n/a | a definir | `DOCS-03D` | a escrever: licenças e downloads |
| (sem origem) | n/a | a definir | `DOCS-03E` | a escrever: domínio e publicação |

O slug de `01-entenda-o-novo-formato.md` perdeu a palavra "novo" porque slugs
publicados são permanentes e não carregam referência temporal. O prefixo
numérico das fontes é artefato de ordenação do diretório de origem e também
não é levado.
