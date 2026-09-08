---
title: Conecte seu domínio com segurança
description: Passo a passo para apontar o domínio sem tirar o site do ar.
topic: dominio-e-publicacao
draft: false
lastReviewed: 2026-09-08
sidebar:
  order: 3
---

## Antes de apontar o domínio

- **Confira o site real.** Abra o endereço temporário exibido na tela de
  publicação do painel e revise o site com calma. O apontamento acontece
  somente depois dessa conferência.
- **Tenha o acesso ao registrador em mãos.** O registrador é a empresa onde o
  domínio foi registrado. A conta continua em seu nome, e a equipe Épico
  recebe somente o necessário para o trabalho, pelo período da execução.
- **Confira se a etapa já está aberta.** A tarefa **Aponte o seu domínio**
  aparece no painel quando a revisão termina. Se ela ainda não apareceu,
  [Publique seu site pela primeira vez](/dominio-e-publicacao/publique-seu-site-pela-primeira-vez/)
  explica a ordem das etapas.

## Escolha quem faz o apontamento

Na etapa **DNS e ativação do domínio**, as duas rotas ficam disponíveis:

- **Façam para mim**: você envia o acesso ao registrador pelo formulário do
  próprio painel e a equipe Épico faz o apontamento, avisando quando estiver
  pronto.
- **Como fazer eu mesmo**: você acessa o painel do registrador e adiciona o
  registro CNAME indicado na tela, apontando o domínio para o site no
  Cloudflare.

A tela de publicação mostra o endereço temporário com um botão de copiar. Ele
é a referência do site que já está rodando, para você conferir antes e depois
da troca.

## Enviar o acesso ao registrador pelo painel

Ao clicar em **Façam para mim**, o painel abre o formulário **Envie o acesso
ao seu registrador**, com três campos:

- **Endereço do painel de controle**, o site da empresa onde o domínio está
  registrado.
- **Usuário**.
- **Senha**.

Esses dados ficam dentro da sua Área de Clientes, são guardados
criptografados e nunca são enviados por e-mail. Depois do envio, o painel
confirma o recebimento com a mensagem **Recebemos o acesso ao seu registrador**
e a equipe avisa quando o apontamento estiver pronto.

O formulário do painel é o canal desse envio. Não mande senha de registrador
por e-mail nem por outros meios.

## Se for apontar por conta própria

1. Acesse o painel de controle do seu registrador e localize a gestão de DNS
   do domínio.
2. Adicione o registro CNAME indicado na tela de publicação, apontando o
   domínio para o site no Cloudflare. Os nomes dos campos variam de registrador
   para registrador, então siga a ajuda do seu provedor para encontrar onde os
   registros DNS são editados.
3. Volte ao painel e clique em **Já apontei o domínio**.

Duas regras mantêm a troca segura:

- **O site atual permanece no ar** até a mudança de DNS fazer efeito. Você não
  fica com os dois endereços fora do ar ao mesmo tempo.
- **A propagação leva até 48 horas** para valer em toda a internet, e o site
  pode ficar fora do ar nesse período. Se demorar mais que isso, avise a equipe
  pelo formulário de suporte da Área de Clientes.

## O que acontece depois do apontamento?

Depois de clicar em **Já apontei o domínio**, o painel passa a exibir
**Conferindo o site publicado** enquanto a verificação final acontece. Ao fim
dessa conferência, o serviço é concluído com o site respondendo pelo seu
domínio.

Se algo der errado durante a troca, o plano de retorno vale: o site atual não
foi removido e o domínio volta a apontar para ele. A visão completa da etapa
está em
[Publique seu site pela primeira vez](/dominio-e-publicacao/publique-seu-site-pela-primeira-vez/).

## Domínio do site e domínio da licença são a mesma coisa?

Não. O domínio do site é o endereço público, assunto deste guia. Já os
**Sites conectados** da seção **Licenças** são os domínios em que o produto
está ativado, administrados com o botão **Remover domínio**. Como eles
funcionam está em
[Consulte suas licenças e prazos](/licencas-e-downloads/licencas-e-prazos/).
