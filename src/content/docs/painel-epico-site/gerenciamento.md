---
title: Gerencie dados, segurança e backup do plugin
description: Como operar a aba Gerenciamento do painel Épico Site, com exclusão de dados na desinstalação, bloqueio da instalação WordPress e backup das configurações.
topic: painel-epico-site
draft: false
lastReviewed: 2026-09-15
sidebar:
  order: 11
---

A aba **Gerenciamento** reúne decisões sobre os dados do plugin e a segurança
da instalação WordPress que alimenta o site publicado.

Abra **Épico Site → Configurações** e escolha a aba **Gerenciamento**.

## Excluir todos os dados ao desinstalar

O interruptor **Excluir todos os dados ao desinstalar** vem desligado. Ligar é
um ato deliberado e irreversível: ao **desinstalar** o plugin, o WordPress
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

## Backup das configurações

O campo **Backup das configurações do Épico Site** exporta todas as
configurações do painel em um texto que você copia e guarda:

1. Abra a aba Gerenciamento e salve o painel. O campo de backup é preenchido
   com as configurações atuais do banco de dados.
2. Copie o texto do campo e guarde em local seguro.

O texto exportado inclui segredos, como as chaves de API das integrações.
Trate o backup como um segredo, sem compartilhar em repositórios públicos. A
chave de licença não entra no backup, porque é guardada separadamente.

## Restaurar de um backup

No campo **Restaurar de um backup**, cole o texto completo exportado
anteriormente e salve o painel. As credenciais e o e-mail de notificação do
administrador são preservados automaticamente quando você restaura no mesmo
site. Em um site novo, esses valores precisam ser informados de novo.
