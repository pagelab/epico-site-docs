---
title: Entregue iscas e notifique novos leads
description: Como operar em Geração de leads o registro de UTM, o convite do Google, a entrega de iscas digitais, as notificações por e-mail e o armazenamento dos leads.
topic: painel-epico-site
draft: false
lastReviewed: 2026-10-02
sidebar:
  order: 6
---

Este tutorial cobre as opções da aba **Geração de leads** que tratam o lead
depois da captura: atribuição de origem, entrega de material, avisos por
e-mail e armazenamento no banco de dados. Para os formulários no conteúdo,
no pop-up e no chat, veja [Capture leads no conteúdo, no pop-up e no chat](/painel-epico-site/captura-de-leads/).

Abra **Épico Site → Configurações**, aba **Geração de leads**.

## Registro de parâmetros UTM

O interruptor **Ativar o registro de parâmetros UTM** vem desligado e captura
os parâmetros
de campanha dos links que trazem o visitante, como `utm_source` e
`utm_campaign`, e os envia em campos ocultos dos formulários, enriquecendo o
perfil dos leads. Para lembrar a origem entre páginas, a gravação também
exige consentimento
de marketing do visitante. Sem ele, o formulário ainda pode enviar os
parâmetros presentes no endereço da página atual, sem guardá-los para depois.

## Convite do Google Preferred Sources

O interruptor **Exibir convite para adicionar este site ao Google Preferred
Sources** mostra, nos posts, um convite discreto para o leitor adicionar o
site às fontes preferidas da conta Google dele. O convite é um link para as
preferências do Google com o seu domínio, sem parâmetros de rastreamento e
sem coleta de dados. O recurso vem desligado. **Posição do convite no post**
escolhe início
(o padrão), meio ou fim do post.

Quem adiciona o site às fontes preferidas passa a ver o seu conteúdo com
mais frequência nos resultados de notícias da conta dele. O critério de
exibição é do Google e está descrito na
[documentação do Preferred Sources](https://developers.google.com/search/docs/appearance/preferred-sources?hl=pt-br).

## Entrega da isca digital

Na seção **Entrega da isca digital**, escolha qual isca digital entregar em
cada tipo de captura. O padrão é não associar uma isca:

- **Formulários da página** atende os formulários das seções de página.
  O Cartão de captura tem a associação própria abaixo.
- **Formulário do pop-up** atende o pop-up modal.
- **Formulário da captura fixa por rolagem** atende o cartão automático ou
  inserido como bloco no conteúdo.
- **Formulário do chat** atende a janela de chat.

A entrega acontece depois que o serviço de marketing integrado confirma o
envio. O RD Station confirma no modo **Chave de API**. No modo **Código de
monitoramento**, não há confirmação e a isca não é entregue. As
iscas são criadas na tela
[Todas as iscas](/painel-epico-site/gerencie-os-leads/).

Quando a isca é uma página ou um endereço externo, o visitante é levado até
ela logo depois da confirmação.

### Como o arquivo da isca fica protegido

Quando a isca é um arquivo, ele nunca é publicado no site e o endereço dele
não aparece em nenhuma página. Cada inscrição confirmada recebe um link de
download temporário, que a confirmação mostra e inicia sozinho. O link deixa
de funcionar depois de uma hora. Quem voltar mais tarde envia o formulário de
novo para receber outro.

Ao ser escolhido como isca, o arquivo sai do endereço comum da biblioteca de
mídia e vai para uma pasta privada, com endereço secreto. Nos servidores
Apache e LiteSpeed, o acesso direto a essa pasta é bloqueado, inclusive para
quem administra o site. Para conferir o material, use o próprio formulário.
Em servidores nginx, o bloqueio depende de uma regra na configuração da
hospedagem, e sem ela a proteção é o endereço secreto.

Trocar ou remover a isca invalida na hora os links já enviados. O arquivo que
deixa de ser isca volta ao lugar de origem na biblioteca de mídia.

## Notificações por e-mail

Na seção **Notificar por e-mail o registro de novos leads**:

1. Ative **Ativar a notificação**, que vem desligada.
2. Em **Enviar para**, escolha **Administrador** (o padrão) ou **Lead**.
   O seletor permite um destinatário por vez.
3. Se escolher Administrador, confira o **Destinatário (administrador)**. O
   padrão é o e-mail de administração do WordPress.
4. Se escolher Lead, escreva o **Assunto** e a **Mensagem de notificação**
   que a pessoa recebe após enviar o formulário.

As notificações são tentativas de melhor esforço. Uma falha de e-mail nunca
derruba a inscrição do lead. O e-mail do administrador resume os dados do
contato, incluindo o provedor que recebeu o envio e o estado do
consentimento, quando houver.

## Armazenamento dos leads

O interruptor **Armazenar os dados capturados dos leads no banco de dados do
WordPress** guarda os leads capturados pelos formulários Épico Capture, com
evidência de consentimento quando fornecida, na tela **Todos os leads**. Vem ligado por padrão.

O **Período de retenção dos leads** decide por quanto tempo os registros
ficam guardados. O padrão é indefinido, e a limpeza automática só passa a
existir quando você escolhe um período, de 30 dias a 5 anos. A exclusão
automática também apaga as evidências de consentimento junto com o registro.

## Relacionados

- [Acompanhe e exporte os seus leads](/painel-epico-site/gerencie-os-leads/)
- [Peça consentimento e cuide da privacidade](/painel-epico-site/privacidade-e-consentimento/)
