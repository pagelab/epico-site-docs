# ADR 0001 — acervo público separado e painel consumidor

- **Status:** aceita
- **Data:** 2026-09-07
- **Decisor:** owner do Épico Studio

## Contexto

A Área de Clientes precisa de tutoriais públicos, pesquisáveis e citáveis. Hoje
os cards de tutoriais e a busca de suporte são maquetes. O conteúdo semente já
existe em Markdown, enquanto o elo WordPress para Astro não é um contrato pronto
para servir como CMS deste acervo.

O painel e a landing também não compartilham um design system único. Importar os
tokens do painel para um framework de documentação criaria acoplamento sem
benefício funcional.

## Decisão

1. `docs.epico.site` será um site Astro estático com Starlight em repositório
   próprio, `Produto/Docs`.
2. Markdown versionado neste repositório é a autoridade editorial.
3. O WordPress não é CMS do acervo.
4. A página `/busca/` e `search-index.json` derivam do mesmo conteúdo.
5. A Área de Clientes usa links curados e consome o índice público. Ela não
   guarda cópia dos artigos.
6. O design system do acervo é independente. Compartilha apenas cores de marca
   e as fontes Cal Sans e Outfit, ambas servidas localmente.
7. O projeto é público e pode ser usado livremente para busca, grounding,
   citação e treinamento. A sintaxe exata dos sinais será validada contra a
   documentação vigente antes da publicação.
8. Docs e plugin têm repositórios, gates, versões, deploys e aceites separados.

## Consequências

- Corrigir um artigo não exige release do plugin.
- URLs publicadas tornam-se contrato e exigem redirect documentado se mudarem.
- O índice público é entrada não confiável no browser do painel e precisa de
  validação estrita.
- Conteúdo, visual e infraestrutura dependem de gates humanos ou externos que
  não podem ser inferidos de uma build verde.
- Nenhuma mudança em `Site-kits`, `Kits`, `Brain` ou na landing faz parte deste
  workstream.
