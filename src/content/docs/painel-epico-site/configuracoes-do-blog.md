---
title: Configure a listagem do blog
description: Como operar a aba Blog do painel Épico Site, com o título e a descrição da listagem, a quantidade de posts por página, o modelo da página principal, os posts populares, a cor do título e o carregamento contínuo.
topic: painel-epico-site
draft: false
lastReviewed: 2026-10-24
keywords:
  - "blog"
  - "título do blog"
  - "descrição do blog"
  - "listagem de posts"
  - "página de posts"
  - "SEO"
  - "meta description"
  - "título"
  - "blog settings"
  - "configurar blog"
  - "posts por página"
  - "modelo do blog"
  - "layout do blog"
  - "Magazine"
  - "Minimal"
  - "Galeria"
  - "Sidebar"
  - "posts populares"
  - "mais lidos"
  - "carregamento contínuo"
  - "rolagem infinita"
sidebar:
  order: 3.5
---

A aba **Blog** reúne as configurações da listagem principal dos artigos: os
textos de apresentação, a quantidade de posts, o modelo da página principal e
alguns detalhes de aparência e navegação.

Abra **Épico Site → Configurações → Blog**. Os campos ficam no grupo
**Configurações gerais do blog**. A faixa **Blog**, no início da aba, traz o
botão **Salvar**.

Essa aba ajusta uma listagem de blog que já faz parte do site. Ela não cria um
endereço de blog e não muda quais artigos são publicados. Para conferir o
conteúdo que entra no site, veja
[Controle o que o site publica](/painel-epico-site/publicacao-do-site/).

## Título e descrição da listagem

Os dois textos aparecem na abertura da listagem principal do blog, em todos os
modelos, e nas páginas seguintes da listagem. Eles não mudam os títulos dos
posts nem os textos das categorias, tags ou autores.

### Título principal da listagem

O campo vem preenchido com **Blog**. Escreva o título que deve abrir a
listagem, com **até 200 caracteres**, em texto simples, sem formatação.

Para publicar a listagem sem título, apague o conteúdo do campo e salve.

### Descrição da listagem

O campo vem preenchido com **Artigos e novidades do blog.** Escreva um texto
curto para apresentar os artigos ao visitante, com **até 1000 caracteres** no
texto visível. O editor oferece **negrito**, *itálico* e **links**, com botões
para inserir ou remover links e para desfazer ou refazer alterações. Não há
inserção de imagens.

Para publicar a listagem sem descrição, apague o conteúdo do campo e salve.

### Limites dos textos

Se um texto passar do limite, o painel mostra uma mensagem e mantém o valor
anterior até você reduzir o texto. Nada é cortado automaticamente. Na
descrição, o limite conta apenas o texto que aparece para o visitante.

### Como os textos convivem com o plugin de SEO

O título e a descrição desta aba são os textos visíveis na página do blog. O
plugin de SEO integrado tem seus próprios campos, e cada lugar segue a sua
fonte:

- **No título de SEO**, mostrado na aba do navegador e nos resultados de
  busca, o plugin de SEO integrado mantém a prioridade.
- **Na meta description**, o plugin de SEO usa a descrição dele. Ela nunca
  preenche a descrição visível da listagem, e a descrição desta aba não
  altera a do plugin.

Se quiser que os textos visíveis e os textos de SEO sejam iguais, confira os
dois lugares.

## Posts por página

Define quantos posts aparecem em cada página das listagens do blog. O valor
não pode ser zero nem ficar vazio.

É a mesma opção de **Configurações → Leitura** do WordPress. Uma alteração em
um lugar aparece automaticamente no outro. Na frente do site, o visitante pode
escolher outra quantidade para a própria leitura, sem mudar esta
configuração.

## Modelo da página principal do blog

Escolhe a composição da primeira página do blog. As páginas seguintes e os
arquivos de categoria, tag e autor mantêm o layout compartilhado.

| Modelo | Como a primeira página se organiza |
| --- | --- |
| **Padrão** | Post em destaque e grade de cards. É o modelo de fábrica. |
| **Minimal** | Foco no texto, com imagens opcionais ao lado de cada linha. |
| **Magazine** | Abertura editorial e grupos de posts por categoria. |
| **Galeria** | Mosaico de imagens. |
| **Sidebar** | Listagem com coluna lateral. |
| **Sidebar Alt** | Grade de cards com coluna lateral à esquerda. |

Trocar o modelo preserva o título e a descrição da listagem. Abaixo do
seletor, o painel mostra somente os controles do modelo escolhido.

### Imagens no modelo Minimal

Aparece com o modelo **Minimal**. Ligado, mostra a imagem destacada ao lado de
cada linha. Desligue para uma listagem somente com texto.

### Categorias dos grupos do Magazine

Aparecem com o modelo **Magazine**. Cada um dos três campos escolhe a
categoria de um grupo editorial:

- Os posts da página com a categoria escolhida abrem o grupo, que traz o
  próprio título e um link para o arquivo da categoria.
- Um post que está em dois grupos aparece somente no primeiro.
- Um grupo sem posts fica fora da página.
- O terceiro grupo é misto, com um post em destaque e quatro cards
  compactos.

## Posts populares

Ligado, exibe os artigos mais acessados nos últimos 90 dias. Eles aparecem ao
lado do post em destaque no modelo **Padrão** e na coluna lateral no modelo
**Sidebar Alt**.

Para funcionar, configure o Cloudflare Web Analytics em **Recursos →
Visualizações de posts**. A ordem é atualizada a cada publicação do site.
Enquanto não houver visualizações disponíveis, a lista fica oculta.

## Cor de fundo do título principal do blog

Pinta uma faixa atrás do título e da descrição da listagem. Essa opção vale
para o modelo **Padrão**. Nos demais modelos, o título aparece sem faixa.

- **Sem cor de fundo** mantém o título sobre o fundo do site. É o padrão.
- **Destaque**, **Marca secundária** e **Marca terciária** usam as cores da
  identidade visual. A cor do texto segue o campo **Texto sobre esta cor** de
  cada uma. Veja
  [Aplique a identidade visual do site](/painel-epico-site/identidade-visual/).
- **Personalizar** mostra dois campos: **Cor de fundo personalizada**, que
  usa a cor de destaque quando fica vazia, e **Cor do texto personalizada**,
  que se ajusta automaticamente ao fundo quando fica vazia. Se escolher uma
  cor de texto, mantenha contraste suficiente para uma leitura confortável.

## Carregamento contínuo de posts

Ligado, faz os próximos posts carregarem sozinhos quando o visitante se
aproxima do fim da lista, sem precisar clicar. Vale no blog, na página de
posts e nos arquivos de categoria. Depois de cinco páginas automáticas, os
controles de paginação voltam a aparecer e o rodapé pode ser alcançado. Sem
JavaScript, a paginação funciona como sempre. Vem desligado por padrão.

## Salve e confira o resultado

1. Ajuste os campos que deseja personalizar.
2. Clique em **Salvar** na faixa **Blog** ou no botão ao final da aba.
3. Acompanhe o indicador de publicação na barra superior do WordPress.
4. Quando a publicação terminar, abra a listagem principal do blog no site e
   confira o resultado. Se houver páginas seguintes, confira uma delas também.

Uma alteração salva pede uma nova publicação. O site continua exibindo a
versão anterior enquanto a nova é gerada. Salvar novamente os mesmos valores
pode exibir **Nada foi alterado**, sem pedir outra publicação.

## Relacionados

- [Conheça o painel Épico Site](/painel-epico-site/)
- [Aplique a identidade visual do site](/painel-epico-site/identidade-visual/)
- [Controle o que o site publica](/painel-epico-site/publicacao-do-site/)
- [Ative e desative recursos do site](/painel-epico-site/recursos-do-site/)
