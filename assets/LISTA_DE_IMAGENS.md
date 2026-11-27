# Lista de imagens do jogo

Para trocar uma imagem: salve um PNG com **o mesmo nome e na mesma pasta**. Fundo transparente onde fizer sentido.
O tamanho abaixo é o da arte atual. Pode desenhar maior (ex.: o dobro, para ficar mais nítido): o jogo **ajusta sozinho** para ocupar o mesmo espaço, desde que você mantenha a **proporção** (mesma relação largura × altura).

## `assets/backgrounds/`
Cenários (fundo do cômodo: parede, piso, portas, quadros). Altura 720; a largura é a do cômodo.

| arquivo | tamanho |
|---|---|
| `bg_basement.png` | 1500×720 |
| `bg_clara_room.png` | 1500×720 |
| `bg_guestroom.png` | 1600×720 |
| `bg_hallway.png` | 2200×720 |
| `bg_kitchen.png` | 1700×720 |
| `bg_livingroom.png` | 2300×720 |
| `title_bg.png` | 1376×768 |

## `assets/characters/arthur/`
Arthur: busto do diálogo. O corpo é montado com as partes (ver README).
**Retratos de diálogo** (de todos os personagens): quadro em pé na proporção ~0,91 (ex.: 512×561), com a cabeça e o colarinho ocupando o quadro, sem muito espaço vazio em volta.

| arquivo | tamanho |
|---|---|
| `arthur_busto.png` | 512×561 |

## `assets/characters/daughter/`
Clara: o corpo do jogo vem das partes em `clara_partes/` (tela 1080×1080, vista de frente; rig gerado por `tools/build_clara_rig.py`). O retrato do diálogo é `clara_busto.png` (512×560). Os `clara_idle_*` e `clara_portrait_*` antigos só servem de reserva se o rig falhar.

| arquivo | tamanho |
|---|---|
| `clara_idle_0.png` | 240×424 |
| `clara_idle_1.png` | 240×424 |
| `clara_portrait_smile.png` | 512×556 |
| `clara_portrait_stare.png` | 512×556 |
| `clara_busto.png` | 512×560 |

## `assets/characters/parents/`
Mãe e Pai (provisório): desenhos INTEIROS, sem partes. `idle_0/1` = parado (respiração, alterna devagar); `andar_0..3` = caminhada em loop (6 quadros por segundo): 0 = contato (uma perna à frente), 1 = passagem (a outra perna passa com o pé no ar), 2 = contato com a outra perna à frente, 3 = passagem. Todos no mesmo tamanho de tela (240×424 ou maior, na mesma proporção), olhando para a DIREITA, com os pés na mesma linha (y≈392 de 424) — o jogo espelha quando eles andam para a esquerda. Basta substituir o PNG.

| arquivo | tamanho |
|---|---|
| `mae_idle_0.png` | 240×424 |
| `mae_idle_1.png` | 240×424 |
| `mae_andar_0.png` … `mae_andar_3.png` | 240×424 |
| `mae_portrait.png` | 512×556 |
| `mae_portrait_open.png` | 512×556 |
| `pai_idle_0.png` | 240×424 |
| `pai_idle_1.png` | 240×424 |
| `pai_andar_0.png` … `pai_andar_3.png` | 240×424 |
| `pai_portrait.png` | 512×556 |
| `pai_portrait_stare.png` | 512×556 |

## `assets/documents/`
Imagens que aparecem no leitor de documentos.

| arquivo | tamanho |
|---|---|
| `calendar.png` | 720×840 |
| `clara_drawing.png` | 880×640 |
| `notebook_cover.png` | 800×1040 |
| `notebook_house.png` | 840×840 |
| `notebook_rings.png` | 840×840 |
| `photo_family.png` | 840×640 |
| `photo_vigil.png` | 640×800 |
| `shrine_photo.png` | 600×680 |

## `assets/documents/livros/`
Gravuras dos livros do pai (domínio público).

| arquivo | tamanho |
|---|---|
| `edda_doepler.jpg` | 700×460 |
| `kojiki_kobayashi.jpg` | 500×1166 |
| `rigveda_ms2097.jpg` | 700×672 |
| `shanhaijing_nuwa.jpg` | 600×651 |

## `assets/interface/`
Interface: símbolo, vinheta, brilho das luzes, tecla E, granulado, papel.

| arquivo | tamanho |
|---|---|
| `arrow.png` | 28×28 |
| `favicon.png` | 220×230 |
| `glow.png` | 256×256 |
| `grain.png` | 256×256 |
| `key_e.png` | 48×48 |
| `paper.png` | 512×512 |
| `symbol.png` | 440×460 |
| `symbol_red.png` | 440×460 |
| `vignette.png` | 1280×720 |

## `assets/interface/itens/`
Ícones do inventário (quadrados).

| arquivo | tamanho |
|---|---|
| `arame.png` | 128×128 |
| `chave_pequena.png` | 128×128 |
| `chave_porao.png` | 128×128 |
| `jornal.png` | 128×128 |
| `molho_chaves.png` | 128×128 |

## `assets/objects/`
Móveis e objetos separados. A base do objeto fica na borda de baixo da imagem (é onde ele "pisa" no chão).

| arquivo | tamanho |
|---|---|
| `altar_shelf.png` | 230×140 |
| `aquecedor.png` | 160×282 |
| `armchair.png` | 180×210 |
| `bed_clara.png` | 400×230 |
| `bed_guest.png` | 440×220 |
| `bookshelf.png` | 340×420 |
| `cadeira_cativeiro.png` | 180×272 |
| `caixas.png` | 250×232 |
| `chair_clothes.png` | 120×180 |
| `clock.png` | 110×340 |
| `coffee_table.png` | 270×90 |
| `colchonete.png` | 350×98 |
| `cordas.png` | 180×340 |
| `cordas_chao.png` | 200×60 |
| `counter.png` | 580×170 |
| `desk.png` | 240×240 |
| `dining_table.png` | 460×190 |
| `dollhouse.png` | 220×280 |
| `escada_porao.png` | 340×422 |
| `estante_porao.png` | 240×302 |
| `fg_chair.png` | 200×360 |
| `fg_coatrack.png` | 200×560 |
| `fg_curtain.png` | 220×720 |
| `fg_plant.png` | 300×460 |
| `floor_lamp.png` | 100×340 |
| `fridge.png` | 160×310 |
| `molho_chaves.png` | 60×70 |
| `nightstand.png` | 110×250 |
| `phone_table.png` | 130×210 |
| `sofa.png` | 400×200 |
| `tv.png` | 210×230 |
| `vulto.png` | 160×420 |
| `wardrobe.png` | 210×340 |

## `assets/textures/`
Texturas de desgaste e papel (CC0).

| arquivo | tamanho |
|---|---|
| `couro.jpg` | 512×512 |
| `manchas_piso.png` | 512×512 |
| `papel_branco.jpg` | 768×768 |
| `papel_velho.jpg` | 768×768 |
| `sujeira_parede.png` | 512×512 |
| `veios_piso.png` | 512×512 |

## `assets/characters/arthur/partes/`
Partes do Arthur (tela 1080×1080). Ver README → "Personagens desenhados por partes".
