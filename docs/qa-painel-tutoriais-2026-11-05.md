# Varredura de tutoriais ausentes do painel e dos blocos (2026-11-05)

Ordem direta do owner (`DOCS-20`): detectar funções e features do painel do
Épico Site e dos blocos sem tutorial, escrever os tutoriais no acervo e manter
o índice da Área de Clientes em paridade.

## Fonte e método

- Kit `Produto/Kits/epico-base`, plugin 2.0.19, fonte Git
  `e696503ba1c2e659b75e94924fe046f7fbf1728b`, árvore limpa. O commit
  `e696503b` (foto do perfil) chegou durante a sessão e foi incluído.
- Definições reais lidas no WordPress local do kit (`~/Studio/epico-site`,
  plugin por symlink) com `switch_to_locale('pt_BR')` e contexto de admin,
  somente leitura: o filtro `rwmb_meta_boxes` devolveu as 14 caixas das onze
  abas, as caixas laterais do editor, a caixa de perfil do usuário, a caixa
  **Exibição** das partes do site e os 14 blocos de cabeçalho e rodapé.
- Para cada campo: rótulo, tooltip, descrição, opções e padrão. Os tooltips
  são a explicação oficial do painel e serviram de fonte factual. Os rótulos
  sem tradução pronta saíram do catálogo `epico-base-pt_BR.po`.
- Cruzamento automático dos rótulos com o texto do acervo, depois conferência
  manual de cada ausência (muitas eram paráfrase já coberta).
- Nenhum valor salvo foi exportado. A lista de usuários do seletor de perfil
  (com e-mails) foi lida e descartada, sem entrar no acervo.

## Lacunas encontradas e destino

| Lacuna | Origem no kit | Destino no acervo |
| --- | --- | --- |
| Aba **SEO** inteira (Identidade do site, Nome público, Perfil do usuário, Foto do perfil) e redes sociais no perfil do usuário | `settings/seo.php`, `includes/seo-identity.php`, `includes/author-social.php`, `includes/profile-photo.php` | artigo novo `painel-epico-site/seo-do-site` |
| Tela **Cabeçalho e rodapé**: 8 estruturas de cabeçalho, 6 de rodapé, Mostrar em, exceções, conflitos, abas Texto, Ações, Mídia e Design, importação de menus, Converter em rascunho, guarda de página em uso | `includes/shells/*`, `shells/*` | artigo novo `painel-epico-site/cabecalho-e-rodape` |
| **Página de contato** (saudação, botões, campos, assuntos, destino, informações, mapa) | `includes/contact-page.php` | seção nova em `recursos-do-site#página-de-contato` |
| **Vídeo flutuante** | `settings` Recursos, Experiência | seção nova em `recursos-do-site#vídeo-flutuante` |
| **Transição entre páginas** | `settings` Recursos, Experiência | seção nova em `recursos-do-site#transição-entre-páginas` |
| **Modo escuro como padrão** | `settings` Recursos, Experiência | `recursos-do-site#modo-escuro` |
| **Utilizar modelo padrão de posts em páginas** e a escolha por página no editor | `includes/post-structure.php` | `recursos-do-site#estrutura-do-post` |
| **Logotipo (modo escuro)** | `settings/branding.php` | `identidade-visual#identidade-e-comportamento` |
| **Ocultar o site publicado dos buscadores** | `settings/management.php` | seção nova em `gerenciamento` |
| **E-mail transacional** (Resend) | `settings/integrations.php` | seção nova em `integracoes#e-mail-transacional` |
| Aba Blog: modelos renomeados (Mínimo, Revista, Barra lateral, Barra lateral alternativa), **Captura de email** e **Alternar posição da barra lateral**, imagem de fundo do cabeçalho, faixa do título em todos os modelos | `settings/blog.php` (commits `a9fab9e5`, `82c0d512`) | `configuracoes-do-blog` |
| **Exibir na barra lateral do blog** | `includes/capture-policy.php` | `captura-de-leads#exibição-da-captura-fixada` |
| Isca do **Formulário do rodapé** | `modules/lead-generation/lead-magnets.php` | `iscas-e-notificacoes#entrega-da-isca-digital` |

## Conteúdo desatualizado corrigido

- `recursos-do-site`: as seções Módulos de monetização e Blocos de seção
  descreviam grupos hoje ocultos no painel (2.0.15). A sub-aba Módulos mostra
  só os blocos de post.
- `captura-de-leads`: o passo a passo do Cartão de captura mandava inserir um
  bloco que saiu do inseridor do editor (2.0.16). A seção agora cobre só o
  bloco já inserido em um artigo.
- `index`: onze abas, a tela Cabeçalho e rodapé e o atalho da barra superior.

## Fora do escopo ou sem tutorial próprio

- Blocos de seção Hero, Depoimentos e Cartão de captura: ocultos no painel e
  fora do inseridor por política de lançamento do kit. Sem tutorial até
  voltarem ao painel.
- Blocos de post (Autoria, Breadcrumbs, Post Meta, Redes Sociais, Tópicos):
  já cobertos. As descrições do editor ainda dizem "Esboço", ponto para a
  sessão do kit avaliar.
- Busca Cmd+K, barra superior e caixas laterais do editor: já cobertas.

## Pontos para a sessão do kit (sem escrita daqui)

O mapa fechado `wp/includes/fields/tutorial-links.php` não tem entrada para
as seções novas, e os títulos delas saem sem botão Tutorial ou degradam para a
área do painel. Âncoras disponíveis a partir desta publicação:

- `seo.identity` → `/painel-epico-site/seo-do-site/#identidade`
- `features.floating-video` (já usado no código, ausente do mapa) →
  `/painel-epico-site/recursos-do-site/#vídeo-flutuante`
- `features.contact` → `/painel-epico-site/recursos-do-site/#página-de-contato`
- `features.page-transitions` →
  `/painel-epico-site/recursos-do-site/#transição-entre-páginas`
- `integrations.transactional-email` →
  `/painel-epico-site/integracoes/#e-mail-transacional`
- `management.noindex` →
  `/painel-epico-site/gerenciamento/#ocultar-o-site-publicado-dos-buscadores`
- `blog.general` → `/painel-epico-site/configuracoes-do-blog/`

As entradas `features.monetization-modules` e `features.section-blocks`
apontam para âncoras removidas junto com as seções ocultas.

## Limites

- O painel não foi aberto no navegador. A conferência é das definições reais,
  não da tela renderizada.
- O commit `e696503b` ainda não foi empacotado como versão do plugin. O
  acervo descreve a fonte canônica, como na revisão de 2026-10-02.
