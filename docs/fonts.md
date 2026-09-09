# Proveniência das fontes locais

> Registro interno das duas fontes servidas localmente por este acervo. Não é
> conteúdo público. `tests/theme.test.ts` guarda os SHA-256 abaixo: trocar um
> arquivo sem atualizar este registro derruba o gate.

## Regra

O acervo usa exatamente dois arquivos WOFF2, servidos por `public/fonts/` a
partir do mesmo domínio, sem Google Fonts nem CDN. O design system é próprio
deste repositório e compartilha com as outras superfícies apenas cores de
marca e estas duas famílias: o `tokens.css` do painel não é importado.

## Registro

| Arquivo | Família | Peso | Origem canônica | Upstream | Licença | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| `CalSans-SemiBold.woff2` | Cal Sans | 600 | `Design/Fontes/Cal_Sans/` | [calcom/font](https://github.com/calcom/font) | SIL OFL 1.1 | `099beb6bb141bbde40ca0bd7141c327b68967d86d48a0d4e88ea709e943411c8` |
| `Outfit-Variable.woff2` | Outfit | 100 a 900 (eixo `wght`) | `Design/Fontes/Outfit/web/` | [Outfitio/Outfit-Fonts](https://github.com/Outfitio/Outfit-Fonts) | SIL OFL 1.1 | `a8a1fe406bb4b86b02bf3165fa4c2774b706aee8d08204036abe7da02eff719f` |

Copiados em 2026-09-08 de `Design/Fontes/` no workspace EpicoStudio. Os
checksums coincidem byte a byte com as cópias usadas pelo painel
(`Produto/Area-de-clientes`), o que confirma que as três superfícies servem a
mesma fonte. Os textos de licença acompanham os WOFF2 em `public/fonts/`
(`OFL-CalSans.txt` e `OFL-Outfit.txt`, SHA-256
`05a6691e4394bf5791fdf81bf2494f292a1cacf910b166977562579648387019` e
`8fc6af31312082959cc8297b30e04d94ff457faecc9fb0aeeb8906bf448f20e6`),
porque a OFL 1.1 exige que a licença acompanhe a redistribuição e o site
público redistribui os arquivos.

## Uso

`Outfit` variável cobre o corpo inteiro via `--sl-font`. `Cal Sans` existe
apenas no peso 600 e é a fonte de display da marca, aplicada nos headings
nativos em `src/styles/theme.css`. O Starlight 0.42 não expõe variável
pública para fonte de título, e a regra nos headings não toca classe,
componente ou camada do Starlight. Nenhuma fonte monoespaçada é adicionada:
código usa a pilha de sistema do próprio Starlight.
