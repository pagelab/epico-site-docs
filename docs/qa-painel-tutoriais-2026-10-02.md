# QA dos tutoriais do painel (2026-10-02)

Pedido direto do owner na sessão `site-kit-build epico-base`: conferir cada
opção e atualizar/criar sua explicação no acervo. Fonte editorial única:
`src/content/docs/painel-epico-site/` deste repositório.

## Fonte e limites da conferência

- Nove abas, 222 definições de campos de dados e 51 headings obtidos pelas
  funções reais do plugin em WordPress/pt_BR, sem ler valores salvos nem
  exportar credenciais. Um campo de dados é legado invisível (ActiveCampaign).
- Referência Git do kit: `36f63d6b8e47248c6a27197d1dfe543423b37a99`. A árvore
  de trabalho já tinha mudanças do owner antes desta sessão, incluindo
  Aplicação da imagem, fontes e seleção nativa no celular. O inventário
  considera os controles atuais da fonte canônica, sem afirmar que essas
  mudanças preexistentes já foram empacotadas ou publicadas.
- Campos `group`, `divider`, avisos e hidden não são opções independentes.
  Os controles implementados em HTML e o seletor Brevo que grava um hidden
  foram conferidos separadamente abaixo. Registros de publicação também
  foram lidos em `includes/deploy-status-ui.php`.
- Definições do painel foram cruzadas com os consumidores de publicação,
  captura, compartilhamento, leitura, privacidade e backup. O exportador
  temporário contém somente metadados de definição, nunca dados dos leads.
- Os tutoriais não fixam o novo default tipográfico em avaliação na árvore
  de trabalho. Explicam as escolhas e corrigem a enumeração dos três ajustes.

## Correções e novas explicações

- Captura fixada: inserção automática, três grupos, profundidade, frequência,
  mídia opcional e aplicação, elegibilidade editorial, celular, prioridade
  local, conflito com Pop-up, coexistência com chat e operação do bloco local.
- Compartilhar seleção: interruptor independente, padrão ausente ligado,
  passos, cópia com atribuição e URL pública, exclusões e seleção nativa.
- Zen manual: Retirar os controles, dependência do Painel de Ajustes,
  Modo sem distrações, ausência de persistência e comportamento com mouse.
- RD Station: dois modos exclusivos, confirmação e seus efeitos, teste de
  conexão sem criar contato, chave ilegível e consentimento do formulário.
- Iscas: associação específica do Cartão de captura e RD API apto a entregar.
- Notificação: o seletor é radio, Administrador OU Lead. Não oferece ambos.
- Backup: credenciais e e-mail omitidos, preservação no mesmo site e limite
  do backup de configurações, que não inclui conteúdo ou leads.
- Chat: canto inferior direito fixo, remoção da opção extinta, tokens de
  WhatsApp, cores avançadas e horários padrão reais (terça a sábado).
- Recursos: páginas com modelo Posts, Fixar barra, três layouts com faixa,
  redes condicionais, blocos disponíveis e aplicação no editor.
- Integrações: Brevo escolhe lista carregada, GA espera consentimento mesmo
  sem injetar seu próprio snippet. Publicação: Ver no domínio público e
  quatro dados de Cloudflare. Privacidade e Código extra: opções/defaults.
- Doze artigos revistos com `lastReviewed: 2026-10-02`. Slugs e âncoras
  anteriores preservados. Nova seção dentro do artigo de captura, sem
  duplicar a autoridade editorial.

## Matriz de cobertura por campo

Cada linha abaixo foi conferida, incluindo campos condicionais. A coluna
Tutorial aponta para a explicação do grupo que cobre o campo.

### Identidade visual

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `brand_seed` | Cor de destaque (semente da marca) | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#cores-da-marca) |
| `brand_secondary` | Marca secundária (opcional) | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#cores-da-marca) |
| `brand_tertiary` | Marca terciária (opcional) | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#cores-da-marca) |
| `surface_seed` | Cor de fundo (opcional) | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#cores-da-marca) |
| `text_seed` | Cor do texto (opcional) | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#cores-da-marca) |
| `typography_preset` | Personalidade tipográfica | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#tipografia) |
| `typography_heading_weight` | Peso do título | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#tipografia) |
| `typography_h1_scale` | Tamanho do título principal | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#tipografia) |
| `typography_type_scale` | Tamanho do texto dos posts | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#tipografia) |
| `typography_custom_heading` | Fonte dos títulos | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#fontes-personalizadas) |
| `typography_custom_body` | Fonte do texto | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#fontes-personalizadas) |
| `typography_custom_subtitle` | Fonte dos subtítulos | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#fontes-personalizadas) |
| `typography_custom_caption` | Fonte das legendas | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#fontes-personalizadas) |
| `logo_id` | Logotipo | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#identidade-e-comportamento) |
| `favicon_id` | Ícone do site | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#identidade-e-comportamento) |
| `enable_animations` | Ativar animações | [Seção](https://tutoriais.epico.site/painel-epico-site/identidade-visual/#identidade-e-comportamento) |

### Publicação

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `public_site_origin` | Endereço público do site (origem) | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#endereço-público-do-site) |
| `publish_policy` | Política de publicação | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#política-de-publicação) |
| `publish_include_ids` | Conteúdo a publicar | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#política-de-publicação) |
| `publish_exclude_ids` | Conteúdo a deixar de fora | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#política-de-publicação) |
| `deploy_webhook_url` | Endereço de publicação da Cloudflare | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#dados-da-cloudflare) |
| `deploy_cf_api_token` | Token de API da Cloudflare | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#dados-da-cloudflare) |
| `deploy_cf_account_id` | ID da conta Cloudflare | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#dados-da-cloudflare) |
| `deploy_cf_worker_name` | Nome do site na Cloudflare | [Seção](https://tutoriais.epico.site/painel-epico-site/publicacao-do-site/#dados-da-cloudflare) |

### Recursos

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `post_structure_featured_image` | Imagem de destaque | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_meta` | Metadados do post | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_authors` | Autores | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_avatar` | Avatar do autor | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_date` | Data de publicação | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_updated` | Data de atualização | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_categories` | Categorias | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_reading_time` | Tempo de leitura | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_comment_count` | Número de comentários | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_tags` | Tags | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_wide_width` | Largura ampla | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_layout` | Layout da estrutura do post | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_header_background_image` | Imagem de fundo do cabeçalho | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_header_background` | Cor de fundo do cabeçalho | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `post_structure_drop_cap` | Capitular no início do post | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#estrutura-do-post) |
| `reading_breadcrumbs` | Breadcrumbs | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#recursos-adicionais) |
| `reading_author_box` | Caixa do autor | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#recursos-adicionais) |
| `reading_post_nav` | Navegação de posts | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#recursos-adicionais) |
| `reading_related` | Artigos relacionados | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#recursos-adicionais) |
| `reading_related_source` | Relacionados por | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#recursos-adicionais) |
| `reading_related_count` | Quantos artigos | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#recursos-adicionais) |
| `enable_dark_mode_toggle` | Alternador do modo escuro | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#modo-escuro) |
| `reading_preferences` | Painel de Ajustes | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#experiência-de-leitura) |
| `reading_focus` | Modo “Zen” | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#experiência-de-leitura) |
| `reading_focus_trigger` | Retirar os controles | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#experiência-de-leitura) |
| `reading_toc` | Painel do Sumário | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#experiência-de-leitura) |
| `reading_progress` | Barra de progresso de leitura | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#experiência-de-leitura) |
| `reading_progress_position` | Posição da barra | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#experiência-de-leitura) |
| `enable_share_buttons` | Botões de compartilhamento | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#compartilhamento) |
| `share_networks` | Plataformas disponíveis | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#compartilhamento) |
| `share_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#compartilhamento) |
| `enable_highlight_share` | Compartilhar seleção | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#compartilhamento) |
| `share_sticky_bar` | Fixar barra | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#barra-de-ferramentas-do-post) |
| `share_sticky_bar_position` | Posição da fixação | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#barra-de-ferramentas-do-post) |
| `enable_read_aloud` | Ler posts em voz alta | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#leitura-em-voz-alta) |
| `read_aloud_label` | Rótulo de botão | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#leitura-em-voz-alta) |
| `enable_post_views` | Mostrar o contador de visualizações | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#visualização-de-posts) |
| `post_views_site_tag` | Tag do site no Web Analytics | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#visualização-de-posts) |
| `post_views_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#visualização-de-posts) |
| `post_structure_print` | Botão Imprimir | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#imprimir) |
| `enable_comments` | Comentários nos posts | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#comentários) |
| `enable_social_comment` | Apontar comentários para uma publicação nas redes | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#conversa-nas-redes) |
| `timeline_page` | Página de linha do tempo | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#página-de-linha-do-tempo) |
| `enable_continuous_listing` | Carregamento contínuo | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#listagens-de-posts) |
| `enable_scroll_to_top` | Botão rolar para o topo | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#rolar-para-o-topo) |
| `mod_service` | Módulo de serviços | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#módulos-de-monetização) |
| `blk_capture-card` | Cartão de captura | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-seção) |
| `blk_hero` | Seção Hero | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-seção) |
| `blk_testimonials` | Depoimentos | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-seção) |
| `pbk_author-box` | Autoria | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-post) |
| `pbk_breadcrumbs` | Breadcrumbs | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-post) |
| `pbk_post-meta` | Post Meta | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-post) |
| `pbk_social-networks` | Redes Sociais | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-post) |
| `pbk_topics` | Tópicos | [Seção](https://tutoriais.epico.site/painel-epico-site/recursos-do-site/#blocos-de-post) |

### Geração de leads

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `redirect_on_submit` | Redirecionar ao enviar o formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#o-que-acontece-depois-do-envio) |
| `confirmation_message` | Mensagem de confirmação padrão após o envio do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#o-que-acontece-depois-do-envio) |
| `internal_redirection_post` | Página de redirecionamento | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#o-que-acontece-depois-do-envio) |
| `external_redirection_link` | URL de redirecionamento para site externo | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#o-que-acontece-depois-do-envio) |
| `hide_captures_after_success` | Ocultar outras capturas após um envio confirmado | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#o-que-acontece-depois-do-envio) |
| `turnstile_activate` | Exigir verificação no envio do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#proteção-contra-robôs) |
| `turnstile_site_key` | Chave do site | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#proteção-contra-robôs) |
| `turnstile_secret_key` | Chave secreta | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#proteção-contra-robôs) |
| `sticky_capture_activate` | Ativar a captura fixada por rolagem | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_general_settings.sticky_title` | Título da captura fixada | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_general_settings.sticky_message` | Mensagem da captura fixada | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_general_settings.sticky_button_text` | Texto do botão da captura fixada | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_general_settings.sticky_extra_fields` | Ativar campos extras do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_general_settings.sticky_additional_fields` | Campos adicionais do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_style.sticky_image` | Imagem de destaque | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_style.sticky_image_application` | Aplicação da imagem | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_display_options.sticky_percent` | Profundidade de rolagem antes de exibir (percentual) | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_display_options.sticky_frequency` | Frequência de exibição | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_display_options.sticky_mobile` | Exibir a captura fixada em celulares | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_display_options.sticky_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `sticky_display_options.sticky_posts` | Selecione os conteúdos | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#captura-fixada-por-rolagem) |
| `popup_activate` | Ativar o pop-up | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_general_settings.popup_title` | Título do pop-up | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_general_settings.popup_message` | Mensagem do pop-up | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_general_settings.popup_button_text` | Texto do botão do pop-up | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_general_settings.popup_activate_form` | Ativar campos extras do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_general_settings.popup_additional_form_fields` | Campos adicionais do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_style.popup_position` | Posição do pop-up no layout do site | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_style.popup_featured_image` | Imagem de destaque | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_trigger` | Gatilho do pop-up | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_trigger_seconds` | Intervalo antes de exibir (segundos) | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_trigger_percent` | Profundidade de rolagem antes de exibir (percentual) | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_exit_intent` | Ativar intenção de saída | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_frequency` | Frequência de exibição | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_mobile` | Exibir o pop-up em celulares | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.popup_capture_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.association_popup_posts` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.association_popup_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.association_popup_posts_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `popup_display_options.association_popup_categories` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#pop-up-de-captura) |
| `chat_capture_activate` | Ativar a janela de chat com formulário de captura | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_platform_selection.chat_platform_name` | Nome da plataforma de chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_platform_selection.chat_platform_user` | Telefone ou nome de usuário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_username` | Nome de usuário do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_cta_text` | Texto de chamada para ação do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.lead_generation_activate` | Ativar o recurso de geração de leads | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_greeting_text` | Texto de saudação do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_main_message` | Mensagem principal do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_activate_form` | Ativar campos extras do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_additional_form_fields` | Campos adicionais do formulário | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_general_settings.chat_whatsapp_message` | Mensagem pré-preenchida do WhatsApp | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_color_source` | Cores da captura chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_accent_color` | Cor de destaque do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_bkg_color` | Cor de fundo do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_text_color` | Cor do texto do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_bkg_image` | Imagem de fundo do conteúdo do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_button_style` | Personalizar botão | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_style.chat_button_image` | Imagem personalizada do botão de ativação do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.chat_weekdays` | Exibir nos seguintes dias da semana | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.chat_hours_morning` | Exibir antes do meio-dia | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.chat_hours_afternoon` | Exibir depois do meio-dia | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.chat_capture_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.association_chat_capture_posts` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.association_chat_capture_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.association_chat_capture_posts_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `chat_display_options.association_chat_capture_categories` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/captura-de-leads/#chat-de-captura) |
| `utm_activate` | Ativar o registro de parâmetros UTM | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#registro-de-parâmetros-utm) |
| `preferred_sources_activate` | Exibir convite para adicionar este site ao Google Preferred Sources | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#convite-do-google-preferred-sources) |
| `preferred_sources_position` | Posição do convite no post | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#convite-do-google-preferred-sources) |
| `lead_magnet_hero` | Formulários da página | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#entrega-da-isca-digital) |
| `lead_magnet_popup` | Formulário do pop-up | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#entrega-da-isca-digital) |
| `lead_magnet_capture_card` | Formulário da captura fixa por rolagem | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#entrega-da-isca-digital) |
| `lead_magnet_chat` | Formulário do chat | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#entrega-da-isca-digital) |
| `enable_email_notification` | Ativar a notificação | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#notificações-por-e-mail) |
| `send_notification_to` | Enviar para | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#notificações-por-e-mail) |
| `admin_notification_recipient` | Destinatário (administrador) | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#notificações-por-e-mail) |
| `lead_notification_subject` | Assunto | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#notificações-por-e-mail) |
| `lead_notification_message` | Mensagem de notificação (lead) | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#notificações-por-e-mail) |
| `save_lead_database` | Armazenar os dados capturados dos leads no banco de dados do WordPress (somente formulários do Épico Capture) | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#armazenamento-dos-leads) |
| `lead_retention_days` | Período de retenção dos leads | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#armazenamento-dos-leads) |

### Integrações

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `marketing_tool` | Selecione a ferramenta | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `rdstation_settings.rdstation_delivery` | Como os contatos são enviados | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `rdstation_settings.rdstation_api_key` | Chave de API | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `rdstation_settings.rdstation_tracking_id` | Código de monitoramento do RD Station | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `mailchimp_settings.mailchimp_api_key` | Chave de API | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `mailchimp_settings.mailchimp_list_id` | ID do público / da lista | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `brevo_settings.brevo_api_key` | Chave de API | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `mailerlite_settings.mailerlite_api_key` | Chave de API | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `mailerlite_settings.mailerlite_list_id` | ID do grupo / da lista | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#e-mail-marketing) |
| `activecampaign_settings.activecampaign_api_key` | Chave de API | Legado invisível, fora do seletor de ferramentas |
| `gtm_activate` | Ativar a integração com o GTM | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#google-tag-manager) |
| `gtm` | ID do contêiner | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#google-tag-manager) |
| `ga_activate` | Ativar a integração com o GA | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#google-analytics) |
| `ga_property_id` | ID da propriedade | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#google-analytics) |
| `ga_form_tracking` | Incluir dados sobre o uso dos formulários | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#google-analytics) |
| `ga_snippet` | Adicionar o trecho de código da integração | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#google-analytics) |
| `pixel_activate` | Ativar a integração do pixel | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#meta-pixel) |
| `pixel` | ID do pixel | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#meta-pixel) |
| `metatags_activate` | Ativar a integração por meta tags | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#meta-tags-de-verificação) |
| `metatags.metatag_platform` | Nome da plataforma | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#meta-tags-de-verificação) |
| `metatags.metatag_code` | Código HTML da meta tag | [Seção](https://tutoriais.epico.site/painel-epico-site/integracoes/#meta-tags-de-verificação) |

### Privacidade

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `privacy_page` | Página de privacidade | [Seção](https://tutoriais.epico.site/painel-epico-site/iscas-e-notificacoes/#armazenamento-dos-leads) |
| `consent_banner` | Ativar o banner de consentimento | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_message` | Mensagem do banner | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_consent_button_text` | Texto do botão “aceitar” | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_decline_button_text` | Texto do botão “recusar” | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_position` | Posição do banner no layout do site | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `consent_dim_display` | Escurecer a tela | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `consent_color_source` | Cores do banner | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_text_color` | Cor do texto do consentimento | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_button_color` | Cor de destaque do consentimento | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_bkg_color` | Cor de fundo do consentimento | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `banner_cookie_max_age` | Lembrar o consentimento por (dias) | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#banner-de-consentimento) |
| `oembed_consent` | Ativar o pedido de consentimento para incorporações | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |
| `oembed_message` | Mensagem de consentimento da incorporação | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |
| `embed_overlay_button_text` | Texto do botão de consentimento da incorporação | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |
| `embed_color_source` | Cores do conteúdo incorporado | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |
| `overlay_text_color` | Cor do texto do conteúdo incorporado | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |
| `overlay_button_color` | Cor de destaque do consentimento | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |
| `overlay_bkg_color` | Cor de fundo do conteúdo incorporado | [Seção](https://tutoriais.epico.site/painel-epico-site/privacidade-e-consentimento/#consentimento-para-incorporações) |

### Código extra

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `custom_css` | Adicionar código CSS personalizado | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#css-personalizado) |
| `custom_css_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#css-personalizado) |
| `association_custom_css_posts` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#css-personalizado) |
| `association_custom_css_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#css-personalizado) |
| `association_custom_css_posts_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#css-personalizado) |
| `association_custom_css_categories` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#css-personalizado) |
| `custom_js_head` | Adicionar código JS personalizado | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `custom_js_head_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `custom_js_head_loading` | Selecione quando carregar | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_head_posts` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_head_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_head_posts_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_head_categories` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `custom_js_footer` | Adicionar código JS personalizado | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `custom_js_footer_location` | Selecione onde inserir | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `custom_js_footer_loading` | Selecione quando carregar | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_footer_posts` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_footer_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_footer_posts_pages` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |
| `association_custom_js_footer_categories` | Exceções | [Seção](https://tutoriais.epico.site/painel-epico-site/codigo-extra/#javascript-personalizado) |

### Gerenciamento

| Campo | Rótulo pt_BR | Tutorial |
| --- | --- | --- |
| `delete_data_on_uninstall` | Excluir todos os dados ao desinstalar | [Seção](https://tutoriais.epico.site/painel-epico-site/gerenciamento/#backup-das-configurações) |
| `lockdown_wordpress` | Bloquear esta instalação do WordPress | [Seção](https://tutoriais.epico.site/painel-epico-site/gerenciamento/#backup-das-configurações) |
| `theme_settings_backup` | Backup das configurações do Épico Site | [Seção](https://tutoriais.epico.site/painel-epico-site/gerenciamento/#backup-das-configurações) |
| `theme_settings_restore` | Restaurar de um backup | [Seção](https://tutoriais.epico.site/painel-epico-site/gerenciamento/#backup-das-configurações) |

## Controles compostos e ações conferidos separadamente

| Controle | Explicação |
| --- | --- |
| RD: Testar conexão | Integrações, RD Station, Chave de API |
| MailChimp: Carregar listas, seletor e Testar conexão | Integrações, MailChimp, Brevo e MailerLite |
| Brevo: Carregar listas, seletor e Testar conexão (`brevo_list_id` hidden) | Integrações, seleção obrigatória pela lista carregada |
| MailerLite: Carregar listas, seletor e Testar conexão | Integrações, lista/grupo |
| Gerenciar fontes na Biblioteca de Fontes | Identidade visual, Fontes personalizadas |
| Abrir um chamado de suporte | Suporte, Como acessar o suporte |
| Acessar os tutoriais | Suporte, Tutoriais |
| Obter ajuda para seu site | Suporte, Serviços adicionais |
| Salvar e busca Cmd+K/Ctrl+K | Conheça o painel |
| Registros e estado de publicação | Publicação, Estado da publicação |
| Licença, Todos os leads e Todas as iscas | Guias complementares do painel, conferidos |

## Validação

- `npm run verify` exit 0: check sem erros/warnings, 198 testes, lint de
  conteúdo, contraste, build de 29 páginas, publicação e install scripts PASS.
- Dependências high corrigidas: Wrangler 4.147.0, workerd 1.20261001.1 com
  postinstall revisto e permitido, undici 7.29.1 e devalue 5.9.4. Auditoria
  high/critical zerada. Quatro avisos moderate preexistentes fora desse recorte
  permanecem, sem bloquear o gate canônico `--audit-level=high`.
- Cinquenta destinos do mapa do painel presentes no HTML construído.
  Nenhum título de seção anterior foi removido. As âncoras novas
  `captura-fixada-por-rolagem`, `compartilhar-seleção` e `chave-de-api` existem.
- Kit: PHP lint dos dois arquivos PASS, TutorialLinksTest 10/171 PASS,
  PHPCS do mapa PASS e PHPStan sem erros. O heading localizado da captura
  contém o href da nova seção com os escapes reais do WordPress.
- A suíte PHP completa foi executada, mas deu um erro em TypeScaleTest:
  sanitize_title sem mock, no fluxo de custom defaults da fonte tipográfica
  preexistente e modificada por outra frente. Não se publicou pacote sobre
  esse gate. O novo botão permanece na fonte local, sem bump/ZIP/instalação.
- Navegador do painel sem sessão autenticada nesta execução. Conferência do
  heading e rótulos feita pelas funções reais em WordPress/pt_BR. Não se
  salvou opção, não se criou contato e não se acionou teste externo.
- Publicação do Docs será conferida após o push pelo ciclo canônico.
