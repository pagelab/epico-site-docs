# O sistema de motor, UI e Design Pack, e como iniciar um novo site kit

Documento interno do workspace Docs (fora de `src/content/docs/`, portanto não é publicado).
Registrado em 09/11/2026, depois da release plugin 2.0.44 e motor 2.0.43 do `epico-base`, e atualizado no
mesmo dia com o modo release do `make-derived-kit` (commit `8ae03af7` do `epico-base`).
Fontes de verdade: `Kits/epico-base/docs/design-pack-2026-11-08.md`,
`Kits/epico-base/docs/release-2-0-44-2026-11-09.md` e `Kits/epico-base/core/DESIGN-PACK-CONTRACT.md`
(este último é gerado do código e sempre está em dia).

## 1. O que mudou

Até a 2.0.43, aparência e funções viviam juntas no `epico-base`. Um kit novo exigia copiar o kit.
Agora o `epico-base` é a base de todos os kits e a aparência é uma peça separada que se troca sem
fork:

```text
kit derivado
 ├─ @epico/site-core          motor (build, projeção, integrações, Switchboard)
 ├─ @epico/ui-epico-base      estrutura (componentes, seções, shells)
 ├─ @epico/design-<pack>      aparência (tokens, fontes, ícones, CSS, trocas pontuais)
 └─ extras do kit
```

Os três pacotes têm a mesma versão (hoje 2.0.43) e saem juntos em cada release do motor. O
WordPress tem um único ZIP por kit (`epico-site`, hoje 2.0.44), que carrega do pack a cor de marca,
a skin do editor, os ícones do editor e as variantes de shell e de oferta.

Regras que valem para tudo abaixo:

- `epico-base` nunca é vendido como produto. Os produtos públicos são blueprints verticais (por
  exemplo Épico Psy e Épico Med).
- O pack troca aparência, não funções e não estrutura de seção. Seção continua sendo bloco fixo.
- Um kit derivado não é fork do motor. Corrigir o motor corrige todos os kits.

## 2. O que é um Design Pack

Pacote npm `@epico/design-<nome>` com este conteúdo:

| Arquivo | Papel |
| --- | --- |
| `package.json` | `epico.designPack: 1` e `exports` de cada arquivo publicado |
| `design-pack.json` | identidade (`id`), pai (`extends`), padrões (`defaults.brandSeed`), `iconCatalog` e `variants` |
| `tokens.css` | os 203 tokens (seed, derivação, semântica) e os papéis de seção |
| `skin.css` | regras de aparência sobre as classes estáveis do UI pack, na camada `skin` |
| `icons/<nome>.svg` | um glifo para cada um dos 38 nomes do vocabulário de interface |
| `catalog/` e `fonts/` | catálogo e biblioteca de fontes |
| `overrides/<caminho>` | troca pontual de um arquivo de `src/` do UI pack |
| `wp/` | lado WordPress: `plugin.php` do pack, skin do editor, variantes de shell e oferta |

Pontos que costumam surpreender:

- **Herança:** um pack tem no máximo um pai e a cadeia vai até 3 packs. O filho só traz o que muda.
  O `epico-minimal` é o pack raiz de referência.
- **Cascata:** `@layer reset, base, theme, vendor, components, skin`. O CSS do UI pack entra em
  `components` e a skin do pack em `skin`. O Custom CSS do painel fica fora de camada e vence tudo.
- **Variantes de shell e oferta:** o pack declara em `design-pack.json` uma raiz nova que herda a
  gramática e os campos de uma raiz de fábrica (`grammarOf`) e traz só a estrutura. Toda função PHP
  do pack leva o prefixo `epico_pack_<id>_`.
- **Congelamento:** um pack com `frozen: true` guarda hashes em `FROZEN.json`. Qualquer byte
  diferente reprova no gate. Mudança visual vira `<id>-v2`. O `epico-minimal-v1` está congelado.
- **Pack de prova:** `design/epico-prova` (extends epico-minimal, fora dos workspaces) mostra um
  pack real com tokens, skin, ícones, catálogo do editor e uma variante de cabeçalho.

Contrato completo, tokens e vocabulário de ícones: `Kits/epico-base/core/DESIGN-PACK-CONTRACT.md`.

## 3. Três coisas diferentes que se chamam "novo site"

Antes de começar, descubra qual é o pedido. O rito muda por completo.

| Pedido | Rito | Estado |
| --- | --- | --- |
| Site de um cliente, com a aparência do `epico-base` | skill `implantar-site` e `docs/sop-2-0-implantacao-sem-phantomwp.md` | pronto, em uso (Mariana) |
| Kit com aparência própria (novo Design Pack sobre o motor) | seção 4 abaixo | pronto até o kit instalável (modos de prova e release). Entrega a cliente ainda pede release com o pack e blueprint |
| Outro kit-base ou coleção nova | fábrica Site-kits, com pedido explícito do owner | rito de fábrica, não automatizado |

## 4. Iniciar um kit com aparência própria

### 4.1 Pré-requisitos

1. Pedido explícito do owner. A fábrica não cria kit, coleção, SKU nem escolhe Design Pack por
   ausência de diretório (`Site-kits/CLAUDE.md` e `KITS-INDEX.md`).
2. Ler o `STATE.md` do `epico-base` e o da fábrica. O STATE do kit é a única fonte de próxima
   ação e de gates.
3. Ambiente: Node 22 (o do nvm, `22.22.2`), container `phantomwp-epico-base` no ar e o
   `node_modules` do repositório instalado.

### 4.2 Criar o pack

1. Copie `design/epico-prova/` para `design/<id>/` como ponto de partida, ou comece do zero.
2. Ajuste `package.json` (nome `@epico/design-<id>`, versão igual à do motor) e `design-pack.json`
   (`id` em kebab-case, `extends: "@epico/design-epico-minimal"`, `defaults.brandSeed`).
3. Em `tokens.css`, redeclare só os tokens que mudam. Nomes de token não mudam, só valores.
4. Em `skin.css`, escreva regras sobre as classes estáveis do UI pack.
5. Para ícones, ponha em `icons/` só os glifos que diferem do pai. Nome do vocabulário sem glifo em
   toda a cadeia é erro de build.
6. Se precisar de estrutura nova, use `overrides/` (embrulhando o original por `#ui-base/`) ou uma
   variante de shell ou de oferta. Evite o override quando um token ou a skin resolver.
7. Sem mídia demo. Imagem sem anexo usa `/assets/img_placeholder.svg`, e fundo sem anexo fica sem URL.

### 4.3 Provar a aparência (modo de prova, `--link`)

Gera um kit derivado de prova dentro do mount do container:

```bash
node scripts/make-derived-kit.mjs output/derived-<id> --design design/<id> --link
```

Com `--zip <dir>` ele também gera o ZIP do plugin com o pack (`package-epico-site.sh --design <pack> --out <dir>`).
O ZIP de prova não toca `wp/dist` nem o `dist-manifest.json` e traz `PROVA.txt`.

Depois meça no navegador. O comparador de estilos computados fica em
`scripts/computed-style-snapshot.mjs` (34 páginas, claro e escuro, 375 e 1280 px, com estados).
A aparência só muda onde o pack declara, e a captura contra o `epico-minimal` no mesmo dado mostra isso.

Limite importante: o kit gerado com `--link` é só para medir (o `node_modules` é um clone do repositório, sem
`npm install`). **Não é uma instalação entregável.**

### 4.4 Gerar o kit instalável (modo release, sem `--link`)

Existe desde 09/11/2026. Delega ao `make-starter`, então o resultado tem a forma de uma instalação 2.0 de verdade:

```bash
docker exec -u 1001 -w /app phantomwp-epico-base \
  node scripts/make-derived-kit.mjs output/derived-<id> --design design/<id>
```

Rode no container. No host o `npm pack` do núcleo falha, porque faltam os binários do esbuild para o macOS no
`node_modules` compartilhado. O destino precisa ficar dentro do mount do container (`output/...`). Em worktree
use `-w /app/.claude/worktrees/<nome>`.

O que o modo release faz:

1. Resolve a cadeia do pack (`resolveChain`). Recusa o próprio `epico-minimal`, porque não há o que derivar, e
   recusa um destino que não foi gerado pelo script.
2. Chama `makeStarter(out, { designPacks })`. Os tarballs do motor (`core`, `ui`, `epico-minimal`) saem como
   sempre, e cada pack próprio da cadeia sai por `npm pack` em `vendor/`.
3. O manifesto da release do motor (o que `releaseFor` acha para o par WordPress atual) vira um **candidato**
   (`candidateWithDesign`): a lista `engine.design` ganha o pack próprio, com versão, `coreRange` (do
   `peerDependencies` do pack, ou `^2.0.0`), nome do tarball e SHA-256. O `id` continua o da release do motor,
   porque o validador exige `<plugin>+engine-<motor>`. O candidato vai para `vendor/release/release.json` e o
   `LICENSE-EPICO.md` sai como rascunho.
4. O `package.json` e o `package-lock.json` levam o pack por `file:vendor/<tarball>` (o lockfile é conferido contra
   o do kit, com o hash de cada tarball). O `astro.config.epico.mjs` ganha `epico({ design: "@epico/design-<id>" })`.
5. Com `--zip <dir>`, gera também o ZIP do plugin com o pack, como no modo de prova.

Para provar o kit gerado, no container:

```bash
cd output/derived-<id>
npm ci --no-audit --no-fund        # o lockfile gerado tem de instalar sozinho
npm run build                      # epico build
```

O build lê o WordPress de `src/lib/wordpress-config.ts`, que no starter é um endereço inválido. Para uma prova,
copie o `wordpress-config.ts` e o `.env` do `epico-base` para o kit (ficam fora do git em `output/`) e apague o
`.env` depois. Confira no `dist/_epico/build-state.json` que `engine.design` lista os dois packs e que o CSS tem
os valores do pack (por exemplo o raio e o `--brand-seed`). Para ver no navegador, copie o `dist/` para `/tmp` e
sirva com `python3 -I` (o preview do app não lê `~/Documents`).

Provado em 09/11/2026 com o `design/epico-prova`: `npm ci` de 418 pacotes e `epico build` completos, nenhum
cliente envolvido. O teste de unidade do manifesto candidato está em `core/src/lib/__tests__/design-prova.test.ts`.

### 4.5 O que ainda falta para entregar a um cliente

- Um pack próprio só pode ser publicado pelo fleet quando uma release do motor o lista em `engine.design`. O
  candidato do modo release serve à instalação e à prova, não substitui o manifesto certificado.
- Um blueprint (YAML de especificação e materialização manual no WordPress) e o aceite estético do owner.
- Limites conhecidos do pack no WordPress, revistos em 09/11 (detalhe em `docs/design-pack-2026-11-08.md`):
  hero e capture-card não têm medida no editor do wp-dev (política editorial de lançamento suspende os blocos),
  a variante de cabeçalho só chega ao site com um registro de shell que use a raiz, e a variante de oferta
  não tem seletor no editor. Os três são decisões do owner. A borda do botão de contorno da oferta na skin do
  pack de prova foi corrigida.
- O `LICENSE-EPICO.md` gerado não lista os Design Packs (só núcleo e UI pack). Ajuste quando a primeira entrega
  real exigir.

### 4.6 Gates

Rodar na raiz do `epico-base`:

```bash
node scripts/engine-boundary.mjs --write
node scripts/design-freeze.mjs design/<id> --check
npm run check
npm test
```

O `engine-boundary` confere a fronteira do pack (prefixo PHP, exports, cobertura de tokens e ícones)
e mantém o `DESIGN-PACK-CONTRACT.md` em dia. `design-freeze --write` congela o pack quando o owner
aceitar a aparência.

## 5. Iniciar o site de um cliente (rito pronto)

O rito vive na skill `implantar-site` (`Site-kits/.agents/skills/implantar-site/SKILL.md`) e no
SOP `docs/sop-2-0-implantacao-sem-phantomwp.md`. Só com cliente nomeado pelo operador, acesso
confirmado e dia marcado na Área de Clientes. Em resumo:

1. `scripts/bootstrap-site.mjs` cria o repositório privado a partir do starter, configura o WordPress,
   o Worker, o endereço público, o inventário de URLs e o Deploy Hook, e espera o primeiro build.
2. O plugin `epico-site` (ZIP versionado em `wp/dist/`, SHA-256 no `dist-manifest.json`) é instalado
   no WordPress do cliente, com o SHA conferido no servidor.
3. As atualizações seguintes de motor vão pelo `fleet`:
   `node scripts/fleet.mjs plan|apply --engine <versão> --fleet ~/epico-ops/fleet.json --starter dist-starter --ring canary --id <instalação>`.
   O `apply` troca o motor, roda o doutor, publica um preview, confere o motor publicado, promove a
   `main` e registra o inventário.

## 6. Como a release do motor funciona agora

Cada release é um manifesto `releases/<plugin>+engine-<motor>.json` com o ZIP do plugin, o tema e os
tarballs de `core`, `ui` e `design[]`, todos com SHA-256 e o commit que os reproduz. Ordem usada na
2.0.44, que vale como modelo:

1. Gates verdes, depois bump nas duas declarações do plugin (`wp/epico-site.php`, cabeçalho e
   `EPICO_KIT_VERSION`), em `wp/readme.txt`, nos três `package.json` do motor e no `package.json`
   e `package-lock.json` da raiz.
2. Manifesto novo, o anterior vira `withdrawn`, e os testes de versão acompanham.
3. Empacotar do checkout base: `npm run package:plugin` duas vezes (SHA igual) e
   `scripts/make-starter.mjs` três vezes no container (tarballs iguais).
4. Gravar os hashes no manifesto, commit e push, instalar no wp-dev e no WordPress do cliente,
   rodar o fleet e fazer o QA no site publicado.

Armadilhas já medidas: o `.git` de um worktree não existe no container (o `fleet.test.ts` só passa
no base, 18 de 18 em 09/11), arquivo novo precisa de `git add` explícito (o `add -u` não pega), e depois
de trocar o symlink do wp-dev é preciso reiniciar o Studio.

Higiene de `wp/dist/` (política do `dist-manifest.json`): manter as últimas 4 versões de cada artefato e nunca o
ZIP `live-accepted`. Depois do aceite do cliente, marque a entrada como `live-accepted` no manifesto. Remover um
ZIP do disco não remove a entrada do manifesto.

Release neutra: se `wp/`, `core/`, `ui/`, `design/epico-minimal` e `starter/` não mudaram desde a última release,
um bump só troca o número. Confira com `git diff --stat <commit do bump> HEAD -- wp core ui design/epico-minimal starter`
antes de rodar o rito.

## 7. Onde ler mais

| Assunto | Arquivo |
| --- | --- |
| Arquitetura do Design Pack, fases F0 a F5 e rodada 2 | `Kits/epico-base/docs/design-pack-2026-11-08.md` |
| Contrato do pack (gerado) | `Kits/epico-base/core/DESIGN-PACK-CONTRACT.md` |
| Pack de referência e congelamento | `Kits/epico-base/design/epico-minimal/README.md` |
| Release 2.0.44 | `Kits/epico-base/docs/release-2-0-44-2026-11-09.md` |
| Desempenho da Mariana (baseline e remedições) | `Kits/epico-base/docs/desempenho-baseline-2026-11-07.md` |
| Gerador do kit derivado | `Kits/epico-base/scripts/make-derived-kit.mjs` e `make-starter.mjs` |
| Fleet | `Kits/epico-base/docs/fleet-2-0.md` |
| Implantação num cliente | `Kits/epico-base/docs/sop-2-0-implantacao-sem-phantomwp.md` |
| Registro de kits e taxonomia | `Site-kits/site-kits/KITS-INDEX.md` e `Brain/00-Chronology/32-taxonomia-kits-base-colecoes-blueprints.md` |
