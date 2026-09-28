---
title: Ative e desative recursos do site
description: Como operar a aba Recursos do painel Épico Site, organizada em quatro sub-abas, com estrutura do post, recursos de leitura, impressão, compartilhamento, comentários, experiência do visitante e blocos do editor.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-28
sidebar:
  order: 4
---

A aba **Recursos** liga e desliga recursos do site publicado e os componentes
disponíveis no editor de blocos. Recursos desligados não são carregados, o que
mantém o editor rápido. Ative apenas o que o seu site realmente usa.

Abra **Épico Site → Configurações** e escolha a aba **Recursos**. Ela tem
quatro sub-abas, e cada seção deste artigo diz em qual delas o recurso mora:

- **Geral** reúne o que compõe o artigo, da estrutura do post à barra de
  ferramentas.
- **Interação** reúne compartilhamento, comentários e conversa nas redes.
- **Experiência** reúne o que muda a forma de ler e navegar pelo site.
- **Módulos** reúne os módulos de monetização e os blocos do editor.

Vários recursos das sub-abas Geral e Experiência valem para o site inteiro e
podem ser ajustados em cada post, no menu **Épico Site** da lateral do editor.
Lá, cada opção oferece **Padrão do painel**, **Ativado** e **Desativado**.
Escolher Ativado ou Desativado vale só para aquele post.

## Geral

### Estrutura do post

Define como cada artigo se organiza, do topo ao fim do texto. Os interruptores
valem para todos os posts, e a maioria vem ligada por padrão:

- **Imagem de destaque** abre o artigo com a imagem destacada do post. Posts
  sem imagem destacada simplesmente não exibem essa área.
- **Metadados do post** mostra uma barra logo abaixo do título. Os itens
  **Autores**, **Data de publicação**, **Data de atualização** e
  **Categorias** só aparecem quando essa barra está ligada, e o **Avatar do
  autor** só aparece quando **Autores** está ligado.
- **Tempo de leitura** mostra o tempo estimado (cerca de 200 palavras por
  minuto) antes do texto, fora da barra de metadados.
- **Número de comentários** acrescenta a contagem de comentários aprovados à
  barra de metadados. A opção só aparece com **Comentários nos posts** ligado
  e vem desligada. Enquanto o artigo não tem comentários, o item vira um
  link **Comente**, que leva ao formulário.
- **Tags** mostra as tags do post depois do artigo.
- **Largura ampla** decide até onde os blocos de largura ampla ultrapassam a
  coluna de texto. Vai de 0% (mesma largura do texto) a 100% (largura da
  janela) e o padrão é 20%.
- **Layout da estrutura do post** escolhe como título, imagem destacada e
  metadados se arrumam no topo: **Imagem no topo**, **Texto primeiro**,
  **Lado a lado** ou **Sobreposto**.
- **Imagem de fundo do cabeçalho** é uma imagem opcional para o fundo do
  cabeçalho, com posição, tamanho, repetição e fixação. Ela não fica visível
  quando a imagem destacada do artigo já é posicionada como fundo do
  cabeçalho.
- **Cor de fundo do cabeçalho** pinta a faixa do título nos dois layouts que
  têm faixa, **Imagem no topo** e **Texto primeiro**. As opções são as cores
  principal, secundária e terciária da aba Identidade visual, ou **Sem cor de
  fundo** (transparente). O texto da faixa se ajusta sozinho para continuar
  legível.
- **Capitular no início do post** amplia a primeira letra do primeiro
  parágrafo, com a fonte de destaque e a cor da marca. Vem desligada.

### Recursos adicionais

Quatro auxiliares que aparecem dentro do artigo. Todos vêm desligados por
padrão:

- **Breadcrumbs** abre o artigo com a trilha que vai da página inicial,
  passa pela categoria e chega ao título. O último degrau é o próprio artigo
  e não é um link.
- **Caixa do autor** fecha o artigo com o nome, o avatar e a biografia
  escrita no perfil do usuário do WordPress. Autores sem biografia ficam de
  fora.
- **Navegação de posts** oferece o artigo anterior e o próximo, na ordem de
  publicação. O primeiro e o último artigo do site mostram só o lado que
  existe.
- **Artigos relacionados** fecha o artigo com um carrossel, três artigos por
  vez. Com o recurso ligado, **Relacionados por** escolhe o parentesco
  (**Categorias**, o padrão, ou **Tags**) e **Quantos artigos** define o
  total do carrossel, de 3 a 12, com padrão 6. Artigos sem nenhum parente
  pelo critério escolhido não recebem o carrossel.

### Leitura em voz alta

O interruptor **Ler posts em voz alta** ativa um botão de áudio que lê o
conteúdo do post em português, usando a voz do próprio navegador. Vem ligado
por padrão. Em navegadores sem voz em português compatível, o controle
simplesmente não aparece. O campo **Rótulo de botão** muda o texto do botão,
cujo padrão é "Ouvir este artigo".

### Visualização de posts

O interruptor **Mostrar o contador de visualizações** exibe o número de
visualizações ao lado dos botões de compartilhar e ouvir:

- **Tag do site no Web Analytics** informa o identificador da propriedade do
  Cloudflare Web Analytics que alimenta o contador. A contagem cobre os
  últimos 90 dias do endereço público declarado na aba Publicação e é
  atualizada a cada publicação.
- **Selecione onde inserir** escolhe se o contador entra na barra de cima ou
  na de baixo do artigo.

Sem medição configurada, o contador não aparece.

### Imprimir

O interruptor **Botão Imprimir** acrescenta um botão de impressão à barra de
ferramentas do artigo. Vem desligado por padrão. A folha impressa tem estilo
próprio e mantém o texto, as imagens e as tags do artigo. O cabeçalho do
site, as ferramentas e os comentários ficam fora do papel.

### Barra de ferramentas do post

A barra de ferramentas é a faixa única do artigo que reúne os botões de
compartilhar, ouvir, imprimir e o contador de visualizações. Este grupo não
tem interruptor próprio e só aparece quando pelo menos uma dessas quatro
ferramentas está ligada, porque fixar uma barra vazia não faz sentido.

- **Fixar barra de compartilhamento** mantém a barra fixa na tela enquanto o
  visitante rola a página. A barra inteira fica fixa, com todos os botões
  dentro dela, e não só os de compartilhar. Com os botões de
  compartilhamento só abaixo do conteúdo, não existe barra acima para fixar,
  a menos que a leitura em voz alta esteja ligada.
- **Posição da fixação** escolhe entre **Topo** e **Rodapé**. No topo, a
  barra se fixa logo abaixo do bloco de cabeçalho quando a página tem um
  cabeçalho fixo. No rodapé, os elementos que já ficam presos ao pé da tela
  (capturas de leads e banner de consentimento) aparecem acima da barra, e
  os menus de compartilhar e de ouvir abrem para cima.

## Interação

### Compartilhamento

O interruptor **Botões de compartilhamento** ativa os botões de
compartilhamento junto ao conteúdo dos posts:

- **Plataformas disponíveis** escolhe as redes oferecidas, como WhatsApp,
  Copiar link, X, Facebook, LinkedIn, Telegram, Threads, Pinterest e o
  compartilhamento nativo do aparelho. Uma lista vazia é uma escolha válida e
  remove os botões.
- **Selecione onde inserir** posiciona os botões acima, abaixo ou nas duas
  posições do conteúdo.

Para manter a barra de compartilhamento fixa na tela, use o grupo **Barra de
ferramentas do post**, na sub-aba Geral.

### Comentários

O interruptor **Comentários nos posts** ativa o formulário de comentários
gerenciado pelo próprio WordPress. Cada post segue a configuração de discussão
do WordPress, com decisão por post na lateral do editor. A proteção anti-robô
usa as chaves do Cloudflare Turnstile configuradas na aba Geração de leads, e
a moderação usa as regras nativas do WordPress. Um comentário aprovado aparece
no site na publicação seguinte.

### Conversa nas redes

O interruptor **Apontar comentários para uma publicação nas redes** troca o
formulário do site por um convite para comentar em uma publicação sua no
Instagram, Facebook, TikTok, YouTube, Threads ou X. Em cada post, informe a
URL da publicação na lateral do editor. O recurso é apenas um link, sem
formulário nem coleta de dados, e pode conviver com os comentários no site.

## Experiência

### Modo escuro

O interruptor **Alternador do modo escuro** decide se o visitante pode trocar
entre tema claro e escuro. Desligado, o site permanece no tema claro. Vem
desligado por padrão. O controle aparece no cabeçalho do site quando o tema do
site oferece o componente.

### Experiência de leitura

Controles pensados para quem lê textos longos. Aparecem só nos posts, e todos
vêm desligados por padrão:

- **Painel de Ajustes** mostra ao lado do post uma aba chamada **Ajustes**,
  que abre o painel **Ajustes de leitura**. Nele o leitor escolhe o tamanho
  do texto, a entrelinha, a largura da coluna, o estilo dos links e a
  densidade, e pode salvar a posição de leitura para continuar depois. As
  escolhas ficam guardadas no navegador do próprio leitor. Em telas grandes o
  painel fica na lateral, em tablets vira uma gaveta, e no celular o menu não
  aparece e o texto segue o padrão do site. O menu surge depois que a página
  termina de carregar.
- **Zen mode** esconde os controles flutuantes do post depois de 4 segundos
  sem movimento do mouse, rolagem ou teclado, para deixar só o texto na tela.
  Eles voltam no primeiro movimento. Vale apenas para aparelhos com mouse.
- **Painel do Sumário** monta um sumário automático a partir dos cabeçalhos do
  conteúdo. Em telas largas ele fica ao lado do texto, e nas mais estreitas
  recolhe numa aba **Sumário** na aresta direita. Artigos com menos de dois
  cabeçalhos não recebem o sumário.
- **Barra de progresso de leitura** mostra quanto do artigo o leitor já
  percorreu, com um marcador por cabeçalho, como um pequeno mapa do texto.
  **Posição da barra** só aparece com a barra ligada e escolhe entre **Topo**
  (logo abaixo do cabeçalho do site) e **Rodapé** (acima da barra de
  ferramentas do artigo quando ela está fixa).

O sumário e a barra de progresso também podem ser decididos post a post, no
menu **Épico Site** do editor. O **Painel de Ajustes** e o **Zen mode** valem
para o site todo.

### Página de linha do tempo

O campo **Página de linha do tempo** escolhe a página que hospeda o arquivo
cronológico do site, com as publicações organizadas por data e um calendário
filtrável. O conteúdo dessa página não é renderizado, importam apenas o
título e o endereço dela. Escolha uma página publicada.

### Listagens de posts

O interruptor **Carregamento contínuo** faz os próximos posts carregarem
sozinhos quando o visitante se aproxima do fim da lista, no blog, na página
de posts e nos arquivos de categoria, sem botão extra. Depois de cinco
páginas automáticas, o link normal da paginação volta, e o rodapé continua ao
alcance. Sem JavaScript a paginação funciona como sempre. Vem desligado por
padrão.

### Rolar para o topo

O interruptor **Botão rolar para o topo** mostra um botão flutuante de volta
ao topo. Ele fica oculto até o visitante começar a rolar, aparece centrado na
parte inferior da janela e leva ao topo quando clicado. Vem desligado por
padrão.

## Módulos e blocos do editor

Os três grupos a seguir formam a sub-aba **Módulos** e decidem o que o
editor de blocos oferece a quem escreve. Desligar um item remove o
componente do editor. Páginas já publicadas que usam o componente continuam
no ar até a próxima publicação do site.

### Módulos de monetização

Um módulo é maior do que um bloco: ele traz um tipo de conteúdo inteiro,
com a tela de cadastro e os campos que aquele conteúdo precisa.

O **Módulo de serviços** traz o tipo de conteúdo Serviços, com o seletor
de ícones, e vem ligado por padrão. Desligue quando o site não vende
serviços, e o menu do WordPress fica mais curto para quem edita.

### Blocos de seção

Os blocos de seção são as seções prontas que montam uma página inteira,
como a seção de abertura **Hero** e a seção **Depoimentos**. Cada
interruptor decide se a seção aparece na lista de blocos do editor.

Cada seção é um bloco fechado, com os campos que o contrato dela prevê.
Você preenche texto, mídia e links, sem mexer na estrutura.

### Blocos de post

Os blocos de post são componentes menores, para usar dentro do corpo de um
post: **Autoria**, **Breadcrumbs**, **Post Meta**, **Redes Sociais** e
**Tópicos**. Vêm desligados por padrão. Ative apenas os que for usar, para
manter curta a lista que aparece na hora de escrever.

## Quando a alteração aparece no site

Salve com o botão **Salvar** e aguarde a publicação indicada na barra
superior do WordPress. Os efeitos desta aba aparecem no site publicado e no
editor depois dessa publicação.
