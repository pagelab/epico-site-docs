---
title: Monte o cabeçalho e o rodapé do site
description: Como usar a tela Cabeçalho e rodapé do menu Épico Site para escolher a estrutura, editar menu, botões, logo e cores, decidir onde cada parte aparece e importar um menu do WordPress.
topic: painel-epico-site
draft: false
lastReviewed: 2026-11-05
keywords:
  - "cabeçalho"
  - "header"
  - "encabezado"
  - "rodapé"
  - "footer"
  - "pie de página"
  - "menu"
  - "menu principal"
  - "navegação"
  - "navigation"
  - "submenu"
  - "mega menu"
  - "botão do cabeçalho"
  - "call to action"
  - "logo"
  - "logo no celular"
  - "cabeçalho fixo"
  - "sticky header"
  - "redes sociais"
  - "newsletter"
  - "direitos autorais"
  - "copyright"
  - "importar menu"
  - "menus do WordPress"
  - "aparência"
sidebar:
  order: 2.5
---

O cabeçalho e o rodapé do site são editados em uma tela própria, fora das
abas do painel. Cada um é uma **parte do site**: você escolhe uma estrutura
pronta, preenche menu, botões, logo e cores, e decide em quais páginas ela
aparece.

## Onde fica

No WordPress, abra **Épico Site → Cabeçalho e rodapé**. A lista mostra todas
as partes, com a coluna **Exibição** indicando onde cada uma aparece. Para
editar essa tela, o seu usuário precisa de permissão de administrador.

Na ativação do plugin, o site já recebe um cabeçalho e um rodapé iniciais,
exibidos em todo o site. Você pode editar essas duas partes ou criar outras.

## Escolha a estrutura

Cada parte segue uma estrutura fixa, com campos próprios. Você troca textos,
links e imagens sem mexer no arranjo.

1. Clique em **Criar alternativa**.
2. Na janela **Escolha uma estrutura**, abra a aba **Cabeçalho** ou
   **Rodapé** e clique na estrutura que quer usar.
3. Para aproveitar um menu que o site já tinha, escolha esse menu em
   **Começar a partir de um menu do WordPress**. Para partir do menu de
   exemplo, mantenha **Nenhum, começar com o menu de exemplo**.
4. Dê um título à parte, preencha os campos e publique.

Para trocar a estrutura de uma parte existente, use **Trocar estrutura** no
painel **Estrutura** da lateral do editor. A estrutura escolhida substitui o
que está no editor naquele momento.

As estruturas de cabeçalho são oito:

- **Menu com submenus, busca e botão de ação**, a estrutura inicial.
- **Logo centralizado com redes sociais acima do menu**.
- **Faixa de redes sociais acima do menu centralizado**.
- **Menu ao lado do logo com redes sociais**.
- **Logo centralizado entre dois grupos de menu**.
- **Menu à esquerda com logo centralizado e redes sociais**.
- **Menu centralizado com logo à esquerda**.
- **Logo e menu juntos à esquerda**.

As estruturas de rodapé são seis:

- **Convite para novidades com links e redes sociais**, a estrutura inicial.
- **Logo ao lado de colunas de links com newsletter entre as faixas**.
- **Logo centralizado entre links, com convite abaixo**.
- **Logo ao lado da newsletter com links abaixo**.
- **Convite de newsletter com pares de links e base com logo**.
- **Convite de newsletter com logo e links ao lado**.

## Onde cada parte aparece

A caixa **Exibição**, na lateral do editor, decide onde a parte aparece
depois de publicada.

### Mostrar em

O campo **Mostrar em** oferece **Em todo o site**, **Somente na página
inicial**, **Todos os posts**, **Todas as páginas**, **Todos os posts e
páginas**, **Todos os arquivos de categoria** e **Página “não encontrado”
(404)**.

O local mais específico vence. Um cabeçalho escolhido para **Todos os posts**
substitui, nos posts, o cabeçalho que aparece **Em todo o site**. Assim você
pode ter, por exemplo, um cabeçalho geral e outro só para os artigos.

**Nenhum (alternativa)** guarda a parte sem exibi-la. Use para preparar uma
versão nova com calma, antes de colocá-la no ar.

Uma parte só aparece no site quando está publicada e sem senha.

### Exceções

Depois de escolher um local, dois campos permitem tirar a parte de alguns
lugares:

- **Não exibir em** marca tipos de página em que a parte não aparece, mesmo
  que o local combine: **Página inicial**, **Posts**, **Páginas**,
  **Arquivos de categoria** e **Página “não encontrado” (404)**.
- **Não exibir nestes conteúdos** escolhe páginas ou posts específicos em que
  a parte não aparece.

Nesses lugares aparece a próxima parte mais específica.

### Conflitos

Duas partes da mesma área no mesmo local entram em conflito. Só aparece a
parte salva por último, e o editor e a lista avisam com uma mensagem que
começa com **Conflito**. Escolha outro local para uma delas.

## Cabeçalho

Os campos do cabeçalho ficam na lateral do editor, em abas. A maioria das
estruturas tem as abas **Ações**, **Mídia** e **Design**. A estrutura **Faixa
de redes sociais acima do menu centralizado** tem também a aba **Texto**, com
**Número de telefone** e **Endereço de email**, exibidos com ícone na faixa
superior. Um campo vazio fica oculto.

### Ações

- **Ação principal** e **Ação secundária** são os botões de chamada para
  ação. Cada um tem **Texto do link**, **Destino do link** (**URL ou âncora**
  ou **Página do site**), **Nova aba** e **Ícone**. A ação secundária aparece
  ao lado da principal em telas largas e no menu do celular. A barra do
  celular mantém só os botões que cabem.
- **Estilo do botão** escolhe **Contorno**, o padrão, ou **Preenchido**. Com
  Preenchido, **Cor dos botões de ação** escolhe **Destaque**, **Marca
  secundária** ou **Marca terciária**. A ação secundária tem os mesmos dois
  campos.
- **Busca** mostra o botão de busca. Vem marcado.
- **Fixo ao rolar** faz o cabeçalho sumir quando o visitante rola para baixo
  e voltar assim que ele rola para cima. Vem desmarcado.
- **Menu principal** lista os itens do menu. Cada item tem texto, destino,
  ícone e uma **Imagem do submenu** opcional, e pode ter até três **Grupos do
  submenu**, cada um com **Título do grupo** e até seis links.
- **Agrupar submenus sob os itens** abre cada submenu logo abaixo do seu
  item, em vez de um painel que ocupa toda a largura da tela.
- **Redes sociais** lista os perfis exibidos, com **Rede social** e endereço.
  Algumas estruturas mostram os ícones também em telas largas. As demais os
  mostram apenas no menu do celular.

Algumas estruturas têm campos a mais ou a menos. **Logo centralizado com
redes sociais acima do menu** tem um **Menu secundário**. **Menu ao lado do
logo com redes sociais** tem **Redes sociais no topo**, que leva a faixa de
redes para antes da faixa de logo e menu. As estruturas **Logo centralizado
entre dois grupos de menu** e **Menu à esquerda com logo centralizado e redes
sociais** não têm botões de ação.

### Mídia

- **Logo** substitui, nesta parte, o logotipo da aba Identidade visual.
  Aceita SVG. Vazio usa o logotipo do painel.
- **Diferente no mobile** permite enviar um **Logo (mobile)** para celulares,
  útil quando a marca fica ilegível em uma barra estreita.
- **Logo (modo escuro)** aparece quando o site está em modo escuro ou quando
  o cabeçalho usa o papel visual **Escuro**. Também pode ter uma versão
  própria para celulares.
- **Largura do logo (px)** define a largura. A altura segue a proporção da
  imagem, e a imagem nunca passa da própria largura, para não pixelar. Zero
  mantém o tamanho automático.
- **Posição vertical do logo** faz um ajuste fino em pixels, para logotipos
  cujo centro visual não coincide com o centro da imagem. Valores positivos
  descem a imagem e negativos sobem.
- **Logo do cabeçalho fixo** aparece com **Fixo ao rolar** marcado e é
  exibido enquanto o cabeçalho está fixo no topo.
- **Imagem de fundo** é uma imagem opcional atrás do cabeçalho, com posição,
  tamanho, repetição e fixação.

### Design

- **Papel visual** define o fundo do cabeçalho: **Padrão**, **Destaque**,
  **Escuro**, **Marca primária**, **Marca secundária** ou **Marca terciária**.
  Textos e ícones acompanham automaticamente.
- **Papel visual dos submenus** define, do mesmo jeito, o fundo dos submenus
  e do menu do celular.
- **Controle de modo escuro** mostra o botão de modo escuro neste cabeçalho.
  **Padrão do painel** segue o interruptor **Alternador do modo escuro** da
  aba Recursos. Veja
  [Modo escuro](/painel-epico-site/recursos-do-site/#modo-escuro).

## Rodapé

O rodapé tem as abas **Texto**, **Ações**, **Mídia** e **Design**.

### Texto do rodapé

- **Título do convite**, **Texto do campo de e-mail** e **Texto do botão**
  compõem a faixa de inscrição na newsletter.
- **Texto do consentimento** aparece ao lado da caixa de consentimento. As
  palavras “Política de privacidade” viram o link para a página de
  privacidade. Sem elas, o link entra no final do texto.
- **Aviso de direitos autorais** mostra o símbolo ©, o ano e o nome do site.
  Vem marcado. **Ano de início** é opcional e mostra o período até o ano
  atual. **Complemento dos direitos autorais** acrescenta um texto curto, com
  negrito, itálico, sublinhado e links.

### Ações do rodapé

- **Faixa de inscrição** mostra o formulário de newsletter. Vem marcada. O
  formulário envia os contatos para a ferramenta de e-mail marketing
  configurada e pode entregar uma isca digital própria, escolhida em
  **Formulário do rodapé**. Veja
  [Entrega da isca digital](/painel-epico-site/iscas-e-notificacoes/#entrega-da-isca-digital).
- **Endereço após a inscrição** é opcional. Abre uma página do site, como
  `/obrigado/`, ou um endereço externo depois de uma inscrição bem-sucedida.
  Vazio segue as configurações da aba Geração de leads.
- **Ícone do botão** e **Estilo do botão** ajustam o botão de envio.
- **Links do rodapé** lista os links. Nas estruturas com colunas, cada
  coluna é um menu com **Título do menu**, até quatro menus com até seis
  links cada.
- **Redes sociais** lista os perfis exibidos no rodapé.

### Mídia e design do rodapé

- **Logo**, **Logo (modo escuro)**, **Largura do logo (px)**, **Posição
  vertical do logo** e **Imagem de fundo** funcionam como no cabeçalho.
- **Papel visual** define o fundo do rodapé.
- **Divisor de forma** desenha uma forma na aresta superior do rodapé, na cor
  do papel visual: **Nenhum**, **Curva** (o padrão), **Onda**, **Triângulo**,
  **Serrilhado**, **Rampa**, **Onda inclinada** ou **Escada**. Conforme a
  forma, **Repetições** ajusta quantas vezes o desenho se repete e **Duas
  camadas** acrescenta uma onda semitransparente. **Altura do divisor (px)**
  define a altura, e **Inversão do divisor** inverte a forma.

## Importe um menu do WordPress

Se o site já tinha um menu feito no WordPress, seja um menu clássico ou um
bloco de navegação, você pode copiá-lo para um cabeçalho ou rodapé:

1. No editor da parte, clique em **Importar de um menu do WordPress**.
2. Em **Menu**, escolha o menu de origem.
3. Confira o relatório. Ele mostra quantos links serão importados, o que
   **Ficou de fora** e o que foi **Importado com mudanças**.
4. Clique em **Importar** e depois atualize a parte.

A importação substitui o menu do bloco. Os outros campos ficam como estão, e
nada muda no site até você atualizar. O cabeçalho aceita até três níveis de
menu, e o rodapé mantém só o primeiro nível. Itens sem destino publicado,
links para o painel do WordPress e listas automáticas de páginas ficam de
fora e precisam ser refeitos à mão.

Depois de migrar, **Apagar menus antigos…** remove os menus que o site não
usa mais. A exclusão é definitiva. Use **Baixar uma cópia (JSON)** antes, se
quiser guardar os menus. As páginas para as quais o menu apontava não são
apagadas.

## Tire uma parte do site

Uma parte em uso no site não pode ir para a lixeira nem virar rascunho
diretamente. Para tirá-la do ar, use **Converter em rascunho**, na lista ou
no editor. A parte deixa de aparecer no site e o painel pede uma nova
publicação. Depois disso, ela pode ir para a lixeira. Outra forma é mudar
**Mostrar em** para **Nenhum (alternativa)**.

Da mesma forma, uma página usada como destino no menu de uma parte em uso não
pode ser despublicada. O WordPress avisa com **Página em uso**. Troque o
destino desse item ou tire a parte do site antes.

## Quando a alteração aparece no site

Atualize a parte no editor e aguarde a publicação indicada na barra superior
do WordPress. As mudanças de cabeçalho e rodapé aparecem no site publicado
depois dessa publicação. Se preferir contratar a montagem do cabeçalho e do
rodapé, os pacotes adicionais da sua área de cliente cobrem personalização.

## Relacionados

- [Conheça o painel Épico Site](/painel-epico-site/)
- [Aplique a identidade visual do site](/painel-epico-site/identidade-visual/)
- [Ative e desative recursos do site](/painel-epico-site/recursos-do-site/)
- [Entregue iscas e notifique novos leads](/painel-epico-site/iscas-e-notificacoes/)
