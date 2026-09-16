---
title: Entregue iscas e notifique novos leads
description: Como operar em Geração de leads o registro de UTM, o convite do Google, a entrega de iscas digitais, as notificações por e-mail e o armazenamento dos leads.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-16
sidebar:
  order: 6
---

Este tutorial cobre as opções da aba **Geração de leads** que tratam o lead
depois da captura: atribuição de origem, entrega de material, avisos por
e-mail e armazenamento no banco de dados. Para o formulário, o pop-up e o
chat, veja [Capture leads com pop-up e chat](/painel-epico-site/captura-de-leads/).

Abra **Épico Site → Configurações**, aba **Geração de leads**.

## Registro de parâmetros UTM

O interruptor **Ativar o registro de parâmetros UTM** captura os parâmetros
de campanha dos links que trazem o visitante, como `utm_source` e
`utm_campaign`, e os envia em campos ocultos dos formulários, enriquecendo o
perfil dos leads. A gravação da atribuição também depende do consentimento
de marketing do visitante, quando o banner de consentimento está ativo.

## Convite do Google Preferred Sources

O interruptor **Exibir convite para adicionar este site ao Google Preferred
Sources** mostra, nos posts, um convite discreto para o leitor adicionar o
site às fontes preferidas da conta Google dele. O convite é um link para as
preferências do Google com o seu domínio, sem parâmetros de rastreamento e
sem coleta de dados. A opção **Posição do convite no post** escolhe início,
meio ou fim do post.

Quem adiciona o site às fontes preferidas passa a ver o seu conteúdo com
mais frequência nos resultados de notícias da conta dele. O critério de
exibição é do Google e está descrito na
[documentação do Preferred Sources](https://developers.google.com/search/docs/appearance/preferred-sources?hl=pt-br).

## Entrega da isca digital

Na seção **Entrega da isca digital**, escolha qual isca digital entregar em
cada tipo de captura:

- **Formulários da página** atende todo formulário dentro de páginas.
- **Formulário do pop-up** atende o pop-up modal.
- **Formulário do chat** atende a janela de chat.

A entrega acontece depois que o serviço de marketing integrado confirma o
envio, e o link de download aparece na confirmação. O RD Station não
confirma a entrega, portanto não dispara isca. As iscas são criadas na tela
[Todas as iscas](/painel-epico-site/gerencie-os-leads/).

## Ocultar iscas dos mecanismos de busca

O interruptor **Ocultar o conteúdo das iscas digitais** pede a buscadores e
rastreadores de inteligência artificial que não indexem os arquivos das
iscas. O site publicado passa a enviar o cabeçalho de não indexação em cada
arquivo materializado e inclui o diretório das iscas no arquivo de robôs do
site. A opção reduz a descoberta, não controla acesso: quem tem o endereço
consegue baixar. Ela não esconde páginas de destino e vale a partir da
publicação seguinte.

## Notificações por e-mail

Na seção **Notificar por e-mail o registro de novos leads**:

1. Ative **Ativar a notificação**.
2. Em **Enviar para**, marque **Administrador**, **Lead** ou os dois.
3. No bloco do administrador, confira o **Destinatário (administrador)**. O
   padrão é o e-mail de administração do WordPress.
4. No bloco do lead, escreva o **Assunto** e a **Mensagem de notificação**
   que a pessoa recebe após enviar o formulário.

As notificações são tentativas de melhor esforço. Uma falha de e-mail nunca
derruba a inscrição do lead. O e-mail do administrador resume os dados do
contato, incluindo o provedor que recebeu o envio e o estado do
consentimento, quando houver.

## Armazenamento dos leads

O interruptor **Armazenar os dados capturados dos leads no banco de dados do
WordPress** guarda cada lead capturado, com evidência de consentimento, na
tela **Todos os leads**. Vem ligado por padrão.

O **Período de retenção dos leads** decide por quanto tempo os registros
ficam guardados. O padrão é indefinido, e a limpeza automática só passa a
existir quando você escolhe um período, de 30 dias a 5 anos. A exclusão
automática também apaga as evidências de consentimento junto com o registro.

## Relacionados

- [Acompanhe e exporte os seus leads](/painel-epico-site/gerencie-os-leads/)
- [Peça consentimento e cuide da privacidade](/painel-epico-site/privacidade-e-consentimento/)
