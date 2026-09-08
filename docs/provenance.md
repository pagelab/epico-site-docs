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
| `02-precos-e-hospedagem.md` | `e32bc9c9d1bebd1c9c90cbe74838a1c6ed7c19fc` | [`servicos-e-suporte/precos-e-hospedagem`](../src/content/docs/servicos-e-suporte/precos-e-hospedagem.md) | `DOCS-03B` | migrado em 2026-09-08 |
| `04-suporte-e-propriedade.md` | `eec17af7d3984c45cf82be8c9fd8a925b3888ab5` | [`servicos-e-suporte/suporte-e-propriedade`](../src/content/docs/servicos-e-suporte/suporte-e-propriedade.md) | `DOCS-03B` | migrado em 2026-09-08 |
| `FAQ.md` | `e32bc9c9d1bebd1c9c90cbe74838a1c6ed7c19fc` | [`perguntas-frequentes/index`](../src/content/docs/perguntas-frequentes/index.md) | `DOCS-03C` | fundido em 2026-09-08 |
| `FAQ-consolidado.md` | `3b1b075a1ce3c22fd8c62cac4e9bd4212e3a18d9` | [`perguntas-frequentes/index`](../src/content/docs/perguntas-frequentes/index.md) | `DOCS-03C` | migrado em 2026-09-08 |
| (sem origem) | n/a | [`licencas-e-downloads/licencas-e-prazos`](../src/content/docs/licencas-e-downloads/licencas-e-prazos.md) | `DOCS-03D` | conteúdo novo em 2026-09-08 |
| (sem origem) | n/a | [`licencas-e-downloads/baixar-arquivos`](../src/content/docs/licencas-e-downloads/baixar-arquivos.md) | `DOCS-03D` | conteúdo novo em 2026-09-08 |
| (sem origem) | n/a | [`dominio-e-publicacao/publique-seu-site-pela-primeira-vez`](../src/content/docs/dominio-e-publicacao/publique-seu-site-pela-primeira-vez.md) | `DOCS-03E` | conteúdo novo em 2026-09-08 |
| (sem origem) | n/a | [`dominio-e-publicacao/conecte-seu-dominio`](../src/content/docs/dominio-e-publicacao/conecte-seu-dominio.md) | `DOCS-03E` | conteúdo novo em 2026-09-08 |

O slug de `01-entenda-o-novo-formato.md` perdeu a palavra "novo" porque slugs
publicados são permanentes e não carregam referência temporal. O prefixo
numérico das fontes é artefato de ordenação do diretório de origem e também
não é levado.

`DOCS-03C` é uma fusão, não uma migração par a par: as duas fontes de FAQ
viram um único artigo, que é o `index` da área `perguntas-frequentes`. A área
existe para o FAQ, então o índice da área vira o artigo em vez de criar um
slug redundante abaixo de um landing vazio. O estado `migrado` fica na fonte
corpo (`FAQ-consolidado.md`, 22 perguntas) e `fundido` na fonte curta
(`FAQ.md`, acessos e autonomia), porque a regra de destino único vale por
migração canônica e fusão é o caso excepcional declarado. As perguntas já
respondidas pelos artigos migrados de `DOCS-03A` e `DOCS-03B` não foram
repetidas: o artigo fundido responde o que só as duas fontes de FAQ cobriam
(andamento do serviço, posts, e-commerce, acessos e a Área de Clientes) e
linka os artigos para o restante. O preâmbulo interno do consolidado ("o
escopo aprovado na proposta prevalece") não é conteúdo público e ficou de
fora, como os prefixos numéricos.

Os dois artigos de `DOCS-03D` são conteúdo novo, sem fonte semente. Os fatos
vêm da decisão de produto
[ADR 0003](../../Area-de-clientes/docs/decisions/0003-suporte-atualizacoes-e-ultima-versao-elegivel.md)
(do workspace Área de Clientes, prazos de suporte e atualizações e regra de
re-download) e do comportamento atual do painel em produção, incluindo os
rótulos exibidos ao cliente (`Suporte até`, `Atualizações até`,
`Sites conectados`, `Remover domínio`, `Atualizações encerradas`, caixa
`Renove seu acesso ao suporte` com o botão `Renovar agora`). A revisão factual
de `G-CONTENT` compara esses dois artigos contra a ADR 0003 e o estado do
painel, não contra a pasta de fontes semente.

Os dois artigos de `DOCS-03E` são conteúdo novo, sem fonte semente, e usam os
títulos e descrições dos cards de tutorial do painel ("Conecte seu domínio com
segurança", "Publique seu site pela primeira vez"). Os fatos vêm da decisão de
produto
[ADR 0007](../../Area-de-clientes/docs/decisions/0007-tipos-de-servico-e-checklists.md)
(do workspace Área de Clientes, cinco etapas do acompanhamento, gate de
lançamento por serviço e itens da etapa de publicação) e dos rótulos reais do
painel em produção, conferidos no código do plugin e no catálogo pt_BR: as
telas de revisão (`Prepare seu site` com `Meu conteúdo está pronto`,
`Revise e aprove` com `Aprovo o conteúdo`), a tarefa `Aponte o seu domínio`
com `Já apontei o domínio` e `Conferindo o site publicado`, a caixa
`Itens desta etapa` (DNS e ativação do domínio, Rotas e endereços,
Redirecionamentos e endereços, Plano de retorno pronto, Revisão segura de
plugins do WordPress, Testes de confiabilidade), o formulário `Envie o acesso
ao seu registrador` (dados guardados criptografados e nunca enviados por
e-mail) e a janela de propagação de até 48 horas com formulário de suporte
como escape. A revisão factual de `G-CONTENT` compara esses dois artigos
contra a ADR 0007 e o estado do painel, não contra a pasta de fontes semente.
