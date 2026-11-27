# Apócrifo — demo

Terror psicológico, mistério e exploração em 2D lateral com profundidade.
Arthur acorda, de novo, no quarto de hóspedes de uma família que parece comum.

Feito com **HTML5 + CSS + JavaScript puro + Phaser 3 + SVG**. Não precisa de Node, npm
nem build: é um site estático, pronto para o GitHub Pages.

---

## Como jogar

| Tecla | Ação |
|---|---|
| `A` `D` / `←` `→` | andar |
| `W` `S` / `↑` `↓` | andar para o fundo / para a frente da cena |
| `Shift` | andar devagar |
| `E` (ou Espaço/Enter) | interagir, avançar diálogo, virar página |
| `Esc` / `P` | pausa (com a lista de documentos encontrados) |

O jogo salva sozinho ao trocar de cômodo. "Continuar" aparece na tela inicial
quando existe um salvamento.

## Como rodar localmente

Os navegadores bloqueiam o carregamento de arquivos via `file://`, então use
qualquer servidor estático. Exemplos:

```bash
cd apocrifo
python3 -m http.server 8000
# abra http://localhost:8000
```

Se a máquina não tiver WebGL, abra `index.html?renderer=canvas`.

## Publicar no GitHub Pages

1. Envie o conteúdo da pasta `apocrifo/` para um repositório.
2. Em *Settings → Pages*, escolha a branch e a pasta raiz (`/`).
3. Pronto. Todos os caminhos são relativos.

O Phaser está em `lib/phaser.min.js` (3.80.1). Se esse arquivo faltar, o
`index.html` tenta carregar a mesma versão pelo CDN jsDelivr.

---

## Estrutura

```
apocrifo/
├── index.html              página, camadas de interface em HTML
├── style.css               visual da interface (diálogo, documentos, menus)
├── lib/phaser.min.js       Phaser 3.80.1 (cópia local)
├── js/
│   ├── main.js             cria o jogo, liga menus/pausa/salvamento
│   ├── assets.js           manifesto de SVGs e retratos
│   ├── services.js         áudio, interface e estado compartilhados
│   ├── data/
│   │   ├── rooms.js        cômodos: móveis, colisões, luzes, saídas, pontos de interação
│   │   ├── story.js        roteiro: documentos, falas, eventos
│   │   └── audioManifest.js  arquivos de áudio opcionais
│   ├── entities/           Arthur (Player.js), família (Npc.js), escala de profundidade
│   ├── scenes/             Boot (carregamento), Title, Room (jogo)
│   ├── systems/            audio.js (Web Audio), state.js (flags e salvamento)
│   └── ui/ui.js            diálogo, leitor de documentos, menus, avisos
├── assets/
│   ├── characters/         arthur/, daughter/, parents/ (quadros e retratos)
│   ├── backgrounds/        um SVG por cômodo + fachada da tela inicial
│   ├── objects/            móveis independentes e silhuetas de primeiro plano
│   ├── documents/          fotos, desenhos, páginas do caderno
│   ├── interface/          símbolo, vinheta, brilho, tecla E, papel, granulado
│   └── audio/              (vazio — veja abaixo)
└── tools/                  geradores Python dos SVGs (opcionais)
```

## Estrutura da demo

- **Fase 1 (noite):** o Arthur acorda amarrado no porão. Minigame das cordas (A/D no ritmo),
  inventário de 3 espaços, quebra-cabeça da chave do porão (jornal + arame), casa escura com
  **medidor de barulho** (Shift anda em silêncio), molho de chaves e a porta da frente que não abre.
  Quem pega o Arthur depende do cômodo (`vigia` em `rooms.js`); ser pego muda a história.
- **Fase 2 (dia):** quarto de hóspedes, casa "liberada", conversas, documentos e o caderno.
  As falas reagem a quem o pegou (`pego_por`).
- Interações por fase: `fase: 1`, `fases: [1, 2]` ou, sem nada, só na Fase 2 (portas valem nas duas).
  A versão noturna de um cômodo fica em `noite` (luz, som, NPCs).
- Paranoia: `PARANOIA()` em `story.js`, agendada pela `RoomScene`.

## Como as coisas funcionam

**Profundidade.** O chão é uma faixa (`WALK` em `rooms.js`, y de 512 a 690).
Cada móvel e personagem tem um "pé" (a base); a ordem de desenho é o `y` desse pé.
Por isso o Arthur passa na frente da cama quando está mais perto da câmera e atrás
dela quando está mais ao fundo. Os personagens também diminuem levemente ao fundo.

**Colisão.** Cada móvel pode ter `block: [largura, profundidade]`, um retângulo no chão.
Os pés do Arthur são uma caixinha que desliza pelas bordas desses retângulos.

**Interação.** Em `rooms.js`, cada cômodo lista `interactables` (`id`, ponto no chão,
posição do ícone, rótulo). O mais próximo do Arthur mostra a tecla **E**. A ação com
o mesmo `id` fica em `INTERACTIONS` no `story.js`. Portas usam `door: { to, spawn }`.

**Roteiro.** As ações são funções `async` que recebem um `ctx`:

```js
async kt_jars(ctx) {
  await ctx.say('pensa', 'Arruda. Mirra. Sal grosso…');
  await ctx.say('pensa:worried', 'São cabelos. São os meus.');
},
```

`ctx.say(quem, texto)` — quem pode ser `arthur`, `arthur:worried`, `clara`,
`clara:stare`, `mae`, `mae:open`, `pai`, `pai:stare`, `pensa` (pensamento),
`narr` (narração) ou `voz` (alguém fora de cena). Também existem `ctx.choose`,
`ctx.read` (documentos), `ctx.spawnNpc`, `ctx.walkNpc`, `ctx.flicker`, `ctx.goto`,
`ctx.state.flag/set/give/has` etc. Veja `RoomScene.makeContext()`.

**Documentos.** Em `DOCS` (`story.js`): título, estilo (`photo`, `book`, `diary`,
`notebook`) e páginas com imagem e/ou HTML. Documentos lidos ficam disponíveis
no menu de pausa.

**Luz.** Cada cômodo tem uma sombra translúcida geral (`shade`) e luzes aditivas
(`lights`) com cor, raio, tremulação (`flicker`) ou pulsação (`pulse`).
Funciona tanto em WebGL quanto em Canvas.

## Áudio

Os sons vêm de pacotes **CC0** (Kenney e OpenGameArt): passos em madeira e piso,
portas, trincos, páginas, chuva, relógio, lareira, panela fervendo, estática e dois
ambientes de terror. Fonte e autor de cada arquivo estão em `CREDITS.md`.

Tudo é configurado em `js/data/audioManifest.js`: cada som pode ser um arquivo, uma lista
(um é sorteado a cada vez, como os passos) e ter volume próprio. Valores `null` usam o
som sintetizado pela Web Audio API (ex.: o zumbido da geladeira e o "sting" do final).
Arquivos com prefixo `amb_` e `music_` tocam em loop, com entrada e saída suaves.

## Texturas e imagens de terceiros

- `assets/textures/`: fotos CC0 do ambientCG. As de parede/piso viraram camadas de
  sujeira transparentes aplicadas por cima de cada cômodo (ajuste com `wear` em `rooms.js`);
  papel e couro são usados no leitor de documentos.
- `assets/documents/livros/`: gravuras em domínio público (Wikimedia Commons) nos livros do pai.

## Personagens desenhados por partes (marionete)

O Arthur do jogo é montado a partir dos desenhos em `assets/characters/arthur/partes/`
(cabeça, olhos, olhos fechados, sobrancelhas, cabelo, tronco, 2 braços, 2 pernas, 2 sapatos).
O código anima caminhada, respiração e piscada; não é preciso desenhar quadros.

**Para trocar ou redesenhar:**
1. Desenhe o personagem em camadas, todas na mesma tela (ex.: 1080×1080).
2. Exporte cada camada como PNG com fundo transparente, **na tela inteira** (sem recortar),
   com o mesmo nome do arquivo antigo. O jogo recorta o espaço vazio sozinho.
3. As poses ficam em `rig.json` → `poses` (`parado`, `passo1`, `passagem1`, `passo2`,
   `passagem2`) e são geradas por `tools/build_arthur_rig.py` (edite as medidas lá e rode
   `python3 tools/build_arthur_rig.py`). Para cada peça: quanto gira em torno do `pivot`
   (`rot`, graus, positivo = anti-horário) e quanto se desloca (`dx`, `dy`).
   - **Pés:** os dois desenhos de sapato são dois *estados* do pé — `sapato_frente.png` =
     pé apoiado (de perfil), `sapato_tras.png` = pé na ponta (levantado). Cada perna tem
     os dois, presos no `tornozelo`; a pose escolhe qual aparece (`"pe": "apoiado"|"ponta"`).
   - **Braços:** `braco_tras.png` (lado esquerdo do desenho) fica atrás do tronco;
     `braco_frente.png` (lado direito) fica na frente.
   - `passo1` = desenho Andar1 (perna de trás à frente), `passo2` = Andar2 (perna da frente
     à frente), `parado` = Idle. As passagens ficam no meio do caminho.
4. `olhandoPara` diz para que lado o desenho olha; o jogo espelha quando precisa.

O retrato do diálogo é `assets/characters/arthur/arthur_busto.png`. Para ter um retrato
preocupado, desenhe outro e aponte `'arthur:worried'` em `js/assets.js`.

Para a família, o mesmo formato pode ser usado: crie `assets/characters/<nome>/rig.json`
e a pasta `partes/` (por enquanto Clara, Mãe e Pai ainda usam os SVGs antigos).

## Arte

Todas as imagens do jogo são **PNG** (texturas e gravuras em JPG). Para trocar qualquer
uma, salve um PNG com o mesmo nome na mesma pasta. A lista completa, com tamanhos, está em
`assets/LISTA_DE_IMAGENS.md`.

- Personagens provisórios (Clara, Mãe, Pai): pés na linha y≈392 de uma imagem 240×424,
  virados para a direita (o jogo espelha). Os definitivos vão usar o sistema de partes.
- Móveis: a base do móvel fica na borda inferior da imagem.
- Se mudar o tamanho de um móvel, o jogo usa o tamanho novo; se mudar muito, ajuste a
  posição/colisão em `js/data/rooms.js`.

Os SVGs originais da arte provisória ficaram em `tools/svg_originais/` (não são usados pelo
jogo). Os scripts em `tools/` geram SVGs nessa pasta; para usá-los no jogo seria preciso
exportar para PNG de novo.

## O que está na demo

- 5 cômodos: quarto de hóspedes, corredor, quarto da Clara, sala de estar e cozinha.
- Arthur montado com os desenhos originais por partes: respiração, piscada e caminhada.
- Clara, Mãe e Pai, com retratos e falas que mudam a cada conversa.
- ~40 pontos de interação, 13 documentos (fotos, diário, livros do pai, calendário,
  caderno da vigília).
- Eventos: a Clara destranca o quarto; a Mãe chama o Pai para a cozinha; o final.
- Tela inicial, continuar, pausa, volume, tela cheia, documentos encontrados.

## Decisões em aberto (de propósito)

A demo só dá pistas. Não explica por que Arthur, o que acontece na "sala de baixo",
nem o que é Adão. Os nomes "Clara", "Mãe" e "Pai" (como a família se apresenta) e
o dia 30 no calendário são escolhas da demo e podem ser trocados em `story.js`.
