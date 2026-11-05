---
title: Gerencie dados, segurança e backup do plugin
description: Como operar a aba Gerenciamento do painel Épico Site, com exclusão de dados na desinstalação, bloqueio da instalação WordPress, ocultação do site publicado nos buscadores e backup das configurações.
topic: painel-epico-site
draft: false
lastReviewed: 2026-11-05
keywords:
  - "backup"
  - "cópia de segurança"
  - "copia de seguridad"
  - "exportar configurações"
  - "importar configurações"
  - "restaurar"
  - "restore"
  - "desinstalar"
  - "uninstall"
  - "apagar dados"
  - "excluir dados"
  - "delete data"
  - "bloquear instalação"
  - "segurança"
  - "security"
  - "noindex"
  - "esconder do Google"
  - "ocultar dos buscadores"
  - "robots.txt"
  - "site em construção"
sidebar:
  order: 11
---

A aba **Gerenciamento** reúne decisões sobre os dados do plugin e a segurança
da instalação WordPress que alimenta o site publicado.

Abra **Épico Site → Configurações** e escolha a aba **Gerenciamento**.

## Excluir todos os dados ao desinstalar

O interruptor **Excluir todos os dados ao desinstalar** vem desligado. Ao
ligar e depois **desinstalar** o plugin, o WordPress
apagará as configurações do painel, as chaves de API das integrações, os
registros de leads, os dados de licença e o cofre de credenciais.

Desativar o plugin é diferente e não exclui nada. A exclusão só acontece na
remoção completa do plugin, e somente com o interruptor ligado. Se você
reinstalar depois, precisará redigitar as integrações e reativar a licença.

## Bloquear esta instalação do WordPress

O interruptor **Bloquear esta instalação do WordPress** vem ligado. Ele
protege a instalação que só alimenta o site publicado:

- Visitantes recebem uma recusa no lugar da página de boas-vindas do
  WordPress.
- Requisições anônimas à API ficam limitadas aos endereços que o site
  publicado consome.
- Os métodos de XML-RPC são desativados e os sitemaps do WordPress são
  removidos.
- O editor de arquivos de tema e plugin dentro do painel é fechado.

Usuários conectados, o editor de blocos e a tela de login continuam
funcionando normalmente. Este bloqueio não substitui um firewall, proteção de
login ou autenticação em duas etapas, que continuam sendo tarefas de plugins
dedicados.

O efeito é imediato no WordPress, sem depender da publicação do site.

## Ocultar o site publicado dos buscadores

O interruptor **Ocultar o site publicado dos buscadores** vem desligado.
Ligado, o site publicado pede aos buscadores que não o indexem: o arquivo
`robots.txt` fecha o site inteiro e todas as páginas recebem a marcação
`noindex`. Use enquanto o site ainda não deve aparecer no Google, por exemplo
durante a revisão do conteúdo, e desligue antes de divulgar o endereço.

A mudança vale a partir da próxima publicação do site. Os buscadores levam um
tempo para atualizar os resultados nos dois sentidos, então uma página já
indexada pode continuar aparecendo por alguns dias.

Esta opção é independente de **Configurações → Leitura → Visibilidade para
buscadores** do WordPress. A opção do WordPress vale só para o endereço onde
você acessa o painel, e não para o site publicado.

## Backup das configurações

O campo **Backup das configurações do Épico Site** exporta todas as
configurações do painel em um texto que você copia e guarda:

1. Abra a aba Gerenciamento e salve o painel. O campo de backup é preenchido
   com as configurações atuais do banco de dados.
2. Copie o texto do campo e guarde em local seguro.

A exportação substitui as credenciais por marcadores, incluindo as chaves de
API, a chave secreta do Turnstile e os acessos à Cloudflare. O e-mail do
administrador usado nas notificações também é omitido. A chave de licença
fica fora do backup, porque é guardada separadamente.

Este backup cobre as configurações do painel. Ele não substitui o backup do
conteúdo, da biblioteca de mídia, dos leads ou dos arquivos do WordPress.

## Restaurar de um backup

No campo **Restaurar de um backup**, cole o texto completo exportado
anteriormente e salve o painel. As credenciais e o e-mail de notificação do
administrador são preservados automaticamente quando você restaura no mesmo
site. Em um site novo, esses valores precisam ser informados de novo.
