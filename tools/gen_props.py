#!/usr/bin/env python3
"""
Gera os móveis e objetos independentes (assets/objects).
Cada SVG tem a base do objeto na borda inferior do viewBox, para que o jogo
possa posicioná-lo pelo "pé" e ordenar a profundidade pela coordenada y.
"""
import math
import os
import random
from svgkit import *

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "objects")
SIZES = {}


def prop(name, w, h, body, defs=""):
    SIZES[name] = (w, h)
    save(os.path.join(OUT, f"{name}.svg"), doc(body, w, h, defs))


WOOD = "#4a3020"
WOOD_DK = "#2e1c12"
WOOD_LT = "#6a4a30"


def legs(xs, top, bottom, color=WOOD_DK, wdt=12):
    return "".join(rect(x - wdt / 2, top, wdt, bottom - top, color, sw=2.5) for x in xs)


def bed_guest():
    w, h = 440, 220
    b = [legs([20, 420], 170, 214)]
    b.append(rect(8, 40, 34, 176, WOOD, sw=3, rx=6))          # cabeceira
    b.append(ell(25, 40, 20, 10, WOOD_LT, sw=3))
    b.append(rect(400, 100, 30, 116, WOOD, sw=3, rx=6))        # pés
    b.append(rect(36, 130, 372, 50, "#c8bca8", sw=3, rx=8))   # colchão
    b.append(path("M 40 100 C 120 92 220 104 300 96 C 360 92 396 104 406 118 L 406 182 L 120 186 C 80 176 52 168 40 150 Z",
                  "#5a4a6a", sw=3))                            # cobertor
    b.append(path("M 140 110 C 180 130 220 120 260 140 M 280 104 C 300 130 340 126 380 150", stroke="#3a2e48", sw=2.5, op=.8))
    b.append(path("M 46 98 C 44 82 60 74 100 76 C 128 78 136 90 132 104 C 120 112 64 112 46 98 Z", "#e6dccb", sw=3))
    b.append(path("M 60 90 C 80 86 100 88 118 94", stroke="#b0a490", sw=2))
    b.append(rect(36, 180, 372, 10, "#000", stroke=None, op=.3))
    prop("bed_guest", w, h, "".join(b))


def nightstand():
    w, h = 110, 250
    b = [rect(10, 150, 90, 96, WOOD, sw=3), rect(18, 162, 74, 34, WOOD_DK, sw=2), ell(55, 179, 4, 4, "#b0904a", sw=1.5),
         rect(6, 144, 98, 10, WOOD_LT, sw=3), legs([18, 92], 240, 248, WOOD_DK, 10)]
    # abajur
    b.append(path("M 46 144 L 64 144 L 60 120 L 50 120 Z", "#6a5a40", sw=2.5))
    b.append(line(55, 120, 55, 76, "#3a3020", 4))
    b.append(path("M 28 80 L 82 80 L 70 30 L 40 30 Z", "#e8d0a0", sw=3))
    b.append(path("M 28 80 L 82 80 L 70 30 L 40 30 Z", "url(#shade)", stroke=None))
    # copo d'água e comprimidos
    b.append(rect(74, 124, 16, 20, "#c8e0e8", sw=2, op=.8))
    b.append(ell(26, 141, 3, 2, "#f0f0f0", sw=1) + ell(34, 142, 3, 2, "#f0f0f0", sw=1))
    defs = lin_grad("shade", [(0, "#fff8d0", .5), (1, "#a06a2a", .4)], 0, 0, 0, 1)
    prop("nightstand", w, h, "".join(b), defs)


def wardrobe():
    w, h = 210, 340
    b = [rect(8, 20, 194, 312, WOOD, sw=3), rect(0, 10, 210, 18, WOOD_LT, sw=3),
         rect(20, 36, 82, 270, WOOD_DK, sw=2.5), rect(108, 36, 82, 270, WOOD_DK, sw=2.5),
         ell(94, 170, 4, 6, "#b0904a", sw=1.5), ell(116, 170, 4, 6, "#b0904a", sw=1.5),
         legs([20, 190], 330, 340, WOOD_DK, 14)]
    # porta entreaberta: frestinha escura e uma manga roxa
    b.append(path("M 102 40 L 108 40 L 108 300 L 102 300 Z", "#050306", stroke=None))
    b.append(path("M 104 210 C 112 220 110 240 106 250 L 100 248 C 102 236 102 222 100 214 Z", "#3a1d74", sw=1.5))
    b.append(rect(20, 36, 82, 270, "url(#grain)", stroke=None))
    defs = lin_grad("grain", [(0, "#000", .3), (.4, "#000", 0), (1, "#fff", .06)], 0, 0, 1, 0)
    prop("wardrobe", w, h, "".join(b), defs)


def chair_clothes():
    w, h = 120, 180
    b = [rect(84, 10, 12, 166, WOOD, sw=2.5), rect(14, 96, 82, 12, WOOD_LT, sw=2.5),
         legs([20, 90], 108, 176, WOOD, 10)]
    b.append(path("M 22 82 L 92 82 L 96 98 L 18 98 Z", "#6a6a6a", sw=2.5))
    b.append(path("M 24 70 L 90 70 L 92 84 L 22 84 Z", "#3a4a6a", sw=2.5))
    b.append(path("M 30 60 L 88 60 L 88 72 L 30 72 Z", "#8a5a6a", sw=2.5))
    b.append(rect(52, 56, 14, 6, "#e8e0c8", stroke=None))
    prop("chair_clothes", w, h, "".join(b))


def grandfather_clock():
    w, h = 110, 340
    b = [rect(22, 120, 66, 200, WOOD, sw=3), rect(10, 316, 90, 20, WOOD_DK, sw=3),
         path("M 10 120 L 100 120 L 100 30 C 100 6 10 6 10 30 Z", WOOD, sw=3),
         ell(55, 62, 34, 34, "#e6dcc4", sw=3)]
    for i in range(12):
        a = i * math.pi / 6
        b.append(line(55 + math.cos(a) * 28, 62 + math.sin(a) * 28, 55 + math.cos(a) * 32, 62 + math.sin(a) * 32, INK, 2))
    # três ponteiros: um a mais
    b.append(line(55, 62, 55, 38, INK, 3) + line(55, 62, 72, 70, INK, 3) + line(55, 62, 40, 82, "#8a1a1a", 2))
    b.append(ell(55, 62, 3, 3, INK, stroke=None))
    b.append(rect(34, 140, 42, 150, "#1a1008", sw=2.5))
    b.append(line(55, 140, 55, 250, "#b0904a", 2.5) + ell(55, 256, 12, 12, "#c8a050", sw=2))
    b.append(rect(34, 140, 42, 150, "#c8d8e8", stroke=None, op=.08))
    prop("clock", w, h, "".join(b))


def phone_table():
    w, h = 130, 210
    b = [rect(10, 96, 110, 12, WOOD_LT, sw=3), rect(18, 108, 94, 30, WOOD, sw=2.5),
         legs([24, 106], 136, 206, WOOD_DK, 9)]
    b.append(path("M 30 96 L 36 70 L 96 70 L 100 96 Z", "#2a2a2a", sw=2.5))
    b.append(ell(66, 82, 14, 9, "#8a8a7a", sw=2))
    b.append(path("M 30 66 C 30 54 100 54 100 66 L 92 70 L 38 70 Z", "#1a1a1a", sw=2.5))
    # fio cortado amarrado com laço
    b.append(path("M 100 86 C 120 90 118 120 112 130", stroke="#1a1a1a", sw=2.5))
    b.append(path("M 112 130 C 104 124 104 136 112 132 C 120 136 120 124 112 130 Z", "#c02a4a", sw=1.5))
    b.append(rect(14, 190, 102, 6, "#000", stroke=None, op=.3))
    prop("phone_table", w, h, "".join(b))


def bed_clara():
    w, h = 400, 230
    b = [legs([24, 376], 186, 226, "#d8d0c8", 10)]
    b.append(path("M 6 210 L 6 70 C 6 30 60 30 60 70 L 60 210 Z", "#e8e0d8", sw=3))
    b.append(path("M 20 70 C 22 50 44 50 46 70 L 46 180 L 20 180 Z", "none", stroke="#b8a8b0", sw=2))
    b.append(rect(54, 140, 330, 50, "#e8dcd8", sw=3, rx=8))
    b.append(path("M 58 120 C 160 112 260 122 384 116 L 386 192 L 60 192 Z", "#c88aa0", sw=3))
    for x in range(80, 380, 34):
        b.append(ell(x, 160, 5, 5, "#f0d0dc", stroke=None, op=.7))
    b.append(path("M 62 118 C 58 98 80 92 110 96 C 132 98 138 110 134 122 Z", "#f4ecec", sw=3))
    # bichos de pelúcia (um remendado com tecido roxo)
    b.append(ell(170, 104, 22, 20, "#c8b090", sw=2.5) + ell(158, 84, 8, 8, "#c8b090", sw=2) + ell(182, 84, 8, 8, "#c8b090", sw=2)
             + ell(164, 100, 2.5, 2.5, INK, stroke=None) + ell(176, 100, 2.5, 2.5, INK, stroke=None))
    b.append(ell(230, 104, 18, 20, "#d8d0e0", sw=2.5)
             + path("M 222 72 C 218 56 226 52 228 70 Z M 236 70 C 238 52 246 56 240 72 Z", "#d8d0e0", sw=2)
             + path("M 216 104 L 230 98 L 244 108 L 236 120 L 220 118 Z", "#3a1d74", sw=1.5)
             + path("M 218 106 L 222 110 M 228 100 L 230 104 M 238 108 L 240 112", stroke="#e8e0f0", sw=1)
             + ell(226, 96, 2, 2, INK, stroke=None) + ell(236, 96, 2, 2, INK, stroke=None))
    b.append(path("M 340 194 L 386 194 L 386 60 C 386 40 340 40 340 60 Z", "#e8e0d8", sw=3))
    b.append(rect(54, 190, 330, 10, "#000", stroke=None, op=.3))
    prop("bed_clara", w, h, "".join(b))


def altar_shelf():
    w, h = 230, 140
    b = [rect(10, 60, 210, 14, "#5a3a2a", sw=3), rect(22, 74, 186, 62, "#3a2418", sw=3),
         rect(36, 86, 70, 40, "#2a1810", sw=2), rect(124, 86, 70, 40, "#2a1810", sw=2)]
    for i, x in enumerate((30, 56, 170, 196)):
        hh = 26 + (i % 2) * 10
        b.append(rect(x - 6, 60 - hh, 12, hh, "#e8dcc6", sw=2))
        b.append(path(f"M {x - 6} {60 - hh + 6} C {x - 8} {60 - hh + 14} {x - 4} {60 - hh + 16} {x - 6} {60 - hh + 22}", stroke="#d8c8a8", sw=2))
        b.append(ell(x, 60 - hh - 7, 3.5, 7, "#ffcf6a", stroke=None) + ell(x, 60 - hh - 5, 1.5, 3, "#fff6d0", stroke=None))
    # mecha de cabelo amarrada com fita
    b.append(path("M 100 56 C 96 40 104 28 112 20 C 120 30 126 42 120 56 Z", "#b27343", sw=2))
    b.append(rect(102, 38, 20, 6, "#c01a2a", stroke=None))
    b.append(rect(126, 44, 30, 16, "#e8e0d0", sw=1.5, extra='transform="rotate(-8 141 52)"'))
    b.append(text(141, 55, "A.", 8, "#5a1a2a", "Georgia, serif", extra='transform="rotate(-8 141 52)"'))
    prop("altar_shelf", w, h, "".join(b))


def dollhouse():
    w, h = 220, 280
    b = [rect(10, 190, 200, 12, WOOD_LT, sw=3), legs([24, 196], 202, 276, WOOD_DK, 10)]
    b.append(path("M 30 190 L 30 90 L 110 30 L 190 90 L 190 190 Z", "#e8dcc8", sw=3))
    b.append(path("M 22 96 L 110 24 L 198 96", stroke="#6a2a2a", sw=8))
    b.append(line(30, 140, 190, 140, INK, 2.5) + line(110, 90, 110, 190, INK, 2.5))
    rooms = [(32, 92, 76, 46, "#4a4458"), (112, 92, 76, 46, "#5a3c46"), (32, 142, 76, 46, "#3e1c22"), (112, 142, 76, 46, "#5a6048")]
    for x, y, ww, hh, c in rooms:
        b.append(rect(x, y, ww, hh, c, stroke=None))
    # bonequinho de capuz roxo no quarto de hóspedes
    b.append(ell(70, 116, 4, 4, "#b27343", stroke=None) + rect(66, 120, 8, 14, "#3a1d74", stroke=None))
    b.append(rect(50, 128, 14, 8, "#e8e0d0", stroke=None))
    # quarto extra pintado embaixo, todo vermelho
    b.append(rect(56, 202, 108, 0.1, "none", stroke=None))
    b.append(path("M 60 204 L 160 204 L 156 236 L 64 236 Z", "#7a0a0a", sw=2))
    b.append(ell(110, 226, 12, 3, "#e8d8c8", stroke=None) + ell(98, 226, 3, 3, "#e8d8c8", stroke=None))
    for k in range(9):
        b.append(line(72 + k * 10, 207, 72 + k * 10, 212, "#ff8a6a", 1.4, .8))
    prop("dollhouse", w, h, "".join(b))


def desk():
    w, h = 240, 240
    b = [rect(8, 116, 224, 14, WOOD_LT, sw=3), rect(150, 130, 74, 106, WOOD, sw=3),
         rect(158, 140, 58, 28, WOOD_DK, sw=2), rect(158, 176, 58, 28, WOOD_DK, sw=2), legs([20], 130, 236, WOOD_DK, 10)]
    # luminária de mesa
    b.append(path("M 190 116 L 214 116 L 210 108 L 194 108 Z", "#3a3a3a", sw=2))
    b.append(path("M 202 108 L 196 60 L 170 44", stroke="#3a3a3a", sw=4))
    b.append(path("M 150 40 L 186 30 L 192 54 L 160 62 Z", "#5a7a6a", sw=2.5))
    # diário com cadeado e coraçõezinhos
    b.append(path("M 40 116 L 44 98 L 112 96 L 110 116 Z", "#8a2a4a", sw=2.5))
    b.append(path("M 46 100 L 108 98", stroke="#f0d0dc", sw=2))
    b.append(rect(68, 102, 10, 8, "#d8b04a", sw=1.5))
    b.append(path("M 90 106 C 88 102 84 104 90 110 C 96 104 92 102 90 106 Z", "#f0d0dc", stroke=None))
    # lápis e fotos soltas
    b.append(line(120, 112, 146, 104, "#e8c040", 4) + line(144, 105, 148, 104, INK, 3))
    b.append(rect(14, 104, 22, 12, "#ece6da", sw=1.5, extra='transform="rotate(-10 25 110)"'))
    prop("desk", w, h, "".join(b))


def tv():
    w, h = 210, 230
    b = [rect(10, 120, 190, 104, WOOD, sw=3), rect(22, 134, 76, 76, WOOD_DK, sw=2), rect(112, 134, 76, 76, WOOD_DK, sw=2),
         legs([22, 188], 222, 230, WOOD_DK, 10)]
    b.append(rect(30, 16, 150, 104, "#3a3a34", sw=3, rx=12))
    b.append(rect(42, 26, 104, 82, "#7a8a8a", sw=3, rx=14))
    b.append(rect(42, 26, 104, 82, "url(#static)", stroke=None, rx=14))
    b.append(ell(94, 66, 60, 44, "#c8e8f0", stroke=None, op=.15))
    b.append(ell(164, 46, 7, 7, "#1a1a1a", sw=2) + ell(164, 70, 7, 7, "#1a1a1a", sw=2))
    b.append(line(80, 16, 60, -0.1, INK, 2) + line(110, 16, 140, 0, INK, 2))
    rnd = random.Random(4)
    st = "".join(rect(rnd.randint(0, 38), rnd.randint(0, 38), 2, 1, "#fff" if rnd.random() < .5 else "#000", stroke=None, op=.5)
                 for _ in range(120))
    defs = f'<pattern id="static" width="40" height="40" patternUnits="userSpaceOnUse">{st}</pattern>'
    prop("tv", w, h, "".join(b), defs)


def sofa():
    w, h = 400, 200
    c, cd = "#4a3a2e", "#33281e"
    b = [legs([30, 370], 180, 198, WOOD_DK, 10),
         path("M 30 40 C 30 20 370 20 370 40 L 370 130 L 30 130 Z", c, sw=3),
         rect(40, 110, 320, 44, cd, sw=3, rx=10),
         rect(42, 112, 156, 38, c, sw=2.5, rx=8), rect(202, 112, 156, 38, c, sw=2.5, rx=8),
         path("M 6 70 C 6 52 48 52 48 70 L 48 180 L 6 180 Z", c, sw=3),
         path("M 352 70 C 352 52 394 52 394 70 L 394 180 L 352 180 Z", c, sw=3),
         rect(40, 150, 320, 30, cd, sw=3)]
    for x in (120, 200, 280):
        b.append(ell(x, 70, 3, 3, cd, stroke=None))
    # manta de tricô
    b.append(path("M 250 40 C 270 60 260 100 280 140 L 320 140 C 310 100 320 60 300 36 Z", "#6a2a2a", sw=2.5))
    prop("sofa", w, h, "".join(b))


def coffee_table():
    w, h = 270, 90
    b = [path("M 10 30 L 260 30 L 250 46 L 20 46 Z", WOOD_LT, sw=3), legs([30, 240], 46, 88, WOOD_DK, 10),
         rect(40, 70, 190, 6, WOOD_DK, sw=2)]
    # xícaras e uma bíblia sem capa? não: um livro de capa lisa
    b.append(rect(60, 18, 50, 12, "#2a3a4a", sw=2) + rect(66, 10, 40, 8, "#5a2a1a", sw=2))
    b.append(path("M 170 30 L 172 16 L 190 16 L 192 30 Z", "#e8e0d0", sw=2) + path("M 192 20 C 200 20 200 28 192 28", stroke=INK, sw=2))
    b.append(ell(216, 28, 12, 3, "#c8c0b0", sw=1.5))
    prop("coffee_table", w, h, "".join(b))


def armchair():
    w, h = 180, 210
    c, cd = "#5a2a24", "#3e1a16"
    b = [legs([24, 156], 190, 208, WOOD_DK, 9),
         path("M 30 30 C 30 0 150 0 150 30 L 150 130 L 30 130 Z", c, sw=3),
         path("M 50 40 C 70 30 110 30 130 40", stroke=cd, sw=3),
         rect(32, 120, 116, 40, cd, sw=3, rx=8),
         path("M 6 80 C 6 62 40 62 40 80 L 40 190 L 6 190 Z", c, sw=3),
         path("M 140 80 C 140 62 174 62 174 80 L 174 190 L 140 190 Z", c, sw=3),
         rect(36, 158, 108, 32, cd, sw=3)]
    b.append(path("M 46 22 L 134 22 L 130 50 L 50 50 Z", "#e8e0d0", sw=1.5, op=.8))
    prop("armchair", w, h, "".join(b))


def floor_lamp():
    w, h = 100, 340
    b = [ell(50, 334, 30, 6, "#2a2018", sw=2.5), line(50, 330, 50, 80, "#3a3020", 5),
         path("M 14 84 L 86 84 L 72 20 L 28 20 Z", "#d8b880", sw=3),
         path("M 14 84 L 86 84 L 72 20 L 28 20 Z", "url(#lshade)", stroke=None)]
    for x in range(20, 84, 8):
        b.append(line(x, 84, x, 92, "#a08040", 1.5))
    defs = lin_grad("lshade", [(0, "#fff8d0", .5), (1, "#8a4a1a", .4)], 0, 0, 0, 1)
    prop("floor_lamp", w, h, "".join(b), defs)


def bookshelf():
    """Estante do pai: livros de mitologia e uma gaveta trancada."""
    w, h = 340, 420
    rnd = random.Random(8)
    b = [rect(6, 8, 328, 408, "#3a2416", sw=3), rect(0, 0, 340, 16, "#5a3a24", sw=3)]
    shelves = [30, 120, 210, 300]
    colors = ["#5a1a1a", "#1a2a4a", "#2a3a1e", "#4a3a1a", "#3a1a3a", "#6a5a3a", "#1a1a1a", "#7a4a2a", "#2a4a4a"]
    for sy in shelves:
        b.append(rect(18, sy, 304, 86, "#1a0e08", sw=2))
        x = 22
        while x < 312:
            bw = rnd.randint(10, 22)
            bh = rnd.randint(56, 80)
            if rnd.random() < .08 and x < 290:
                # livro deitado
                b.append(rect(x, sy + 86 - 12, 40, 12, rnd.choice(colors), sw=1.5))
                x += 42
                continue
            c = rnd.choice(colors)
            b.append(rect(x, sy + 86 - bh, bw, bh, c, sw=1.5))
            b.append(line(x + 2, sy + 86 - bh + 8, x + bw - 2, sy + 86 - bh + 8, "#c8a860", 1.2, .7))
            b.append(line(x + 2, sy + 86 - 10, x + bw - 2, sy + 86 - 10, "#c8a860", 1.2, .5))
            x += bw + 1
        b.append(rect(14, sy + 86, 312, 6, "#5a3a24", sw=2))
    # sinais nas lombadas destacadas (livros interativos)
    for (x, sy, label) in [(40, 30, "EDDA"), (130, 120, "KOJIKI"), (220, 210, "RIGVEDA"), (80, 210, "山海經")]:
        b.append(rect(x, sy + 14, 22, 72, "#6a4a22", sw=2))
        b.append(text(x + 11, sy + 50, label, 7, "#e8d090", "Georgia, serif",
                      extra=f'transform="rotate(90 {x + 11} {sy + 50})"'))
    # gaveta com fechadura
    b.append(rect(18, 386 - 0, 304, 24, "#4a2e1c", sw=2.5))
    b.append(rect(146, 390, 48, 16, "#5a3a24", sw=2))
    b.append(ell(170, 398, 4, 5, "#c8a050", sw=1.5) + rect(169, 399, 2, 5, INK, stroke=None))
    # pequeno símbolo entalhado no topo
    b.append(path("M 170 3 C 160 8 160 12 170 14 C 180 12 180 8 170 3 Z", "none", stroke="#c8a050", sw=1.5))
    prop("bookshelf", w, h, "".join(b))


def counter():
    w, h = 580, 170
    b = [rect(4, 30, 572, 136, "#6a5a3a", sw=3), rect(0, 20, 580, 14, "#c8c0a8", sw=3)]
    for i in range(5):
        x = 16 + i * 112
        b.append(rect(x, 46, 100, 110, "#5a4a2e", sw=2))
        b.append(ell(x + (88 if i % 2 else 12), 70, 3.5, 3.5, "#a08a4a", sw=1.5))
    # fogão no meio com panela fumegante
    b.append(rect(230, 30, 130, 136, "#d8d4c4", sw=3))
    b.append(rect(244, 90, 102, 62, "#2a2a28", sw=2.5))
    for x in (258, 282, 306, 330):
        b.append(ell(x, 50, 7, 7, "#5a5a54", sw=2))
    b.append(path("M 258 20 L 330 20 L 326 -0.1 L 262 -0.1 Z", "#3a3a3a", sw=2.5))
    # pia sob a janela
    b.append(rect(390, 22, 110, 10, "#9aa0a0", sw=2))
    b.append(path("M 444 22 L 444 4 C 444 -0.1 460 -0.1 460 6", stroke="#9aa0a0", sw=4))
    # tábua com pão e faca
    b.append(rect(60, 10, 90, 10, "#a87a4a", sw=2) + ell(90, 8, 20, 9, "#c89a5a", sw=2) + line(118, 6, 146, 14, "#c8c8d0", 3))
    prop("counter", w, h, "".join(b))


def fridge():
    w, h = 160, 310
    b = [rect(10, 6, 140, 300, "#d8d4c0", sw=3, rx=14), line(12, 110, 148, 110, INK, 2.5),
         rect(128, 40, 8, 50, "#9a9a90", sw=2, rx=3), rect(128, 130, 8, 70, "#9a9a90", sw=2, rx=3)]
    # desenhos e lista presos com ímã
    b.append(rect(30, 30, 60, 54, "#f0ece0", sw=1.5, extra='transform="rotate(-6 60 57)"'))
    b.append(path("M 40 72 L 50 46 L 60 72 M 66 72 L 74 46 L 82 72", stroke="#3a7a3a", sw=2.5))
    b.append(ell(62, 40, 8, 6, "#e8c020", stroke=None))
    b.append(ell(60, 30, 5, 5, "#c02a2a", sw=1.2))
    b.append(rect(30, 140, 70, 90, "#fffaf0", sw=1.5, extra='transform="rotate(3 65 185)"'))
    for k in range(6):
        b.append(line(38, 156 + k * 12, 92 - (k % 3) * 8, 156 + k * 12, "#3a3a6a", 1.5, .8))
    b.append(ell(65, 140, 5, 5, "#2a6ac0", sw=1.2))
    b.append(rect(10, 290, 140, 16, "#000", stroke=None, op=.25, rx=6))
    prop("fridge", w, h, "".join(b))


def dining_table():
    """Mesa posta para cinco."""
    w, h = 460, 190
    b = []
    # cadeiras de trás
    for x in (90, 230, 370):
        b.append(rect(x - 30, 20, 60, 90, WOOD_DK, sw=2.5, rx=6) + rect(x - 22, 32, 44, 60, WOOD, sw=2))
    b.append(path("M 20 92 L 440 92 L 430 108 L 30 108 Z", "#e8e0d0", sw=3))   # toalha
    b.append(path("M 30 108 L 430 108 L 424 150 L 36 150 Z", "#d8ccb8", sw=3))
    for x in range(48, 420, 26):
        b.append(path(f"M {x} 150 L {x + 13} 160 L {x + 26} 150", "#d8ccb8", sw=1.5))
    b.append(legs([50, 410], 150, 186, WOOD_DK, 12))
    for i, x in enumerate((70, 150, 230, 310, 390)):
        b.append(ell(x, 94, 26, 6, "#f4f0e6", sw=2) + ell(x, 94, 16, 3.5, "#d8d0c0", stroke=None))
        b.append(line(x - 34, 90, x - 34, 98, "#a8a8b0", 2) + line(x + 34, 90, x + 34, 98, "#a8a8b0", 2))
    # velas brancas no centro
    for x in (200, 260):
        b.append(rect(x - 5, 60, 10, 32, "#f0ead8", sw=1.5) + ell(x, 54, 3, 6, "#ffcf6a", stroke=None))
    b.append(path("M 220 92 C 222 78 238 78 240 92 Z", "#6a3a2a", sw=2))
    # cadeira da frente (cabeceira), vista de costas, mais escura
    b.append(rect(-0.1, 100, 22, 86, WOOD_DK, sw=2.5) + rect(438, 100, 22, 86, WOOD_DK, sw=2.5))
    prop("dining_table", w, h, "".join(b))


# --- primeiro plano (silhuetas que passam na frente da câmera) -------------

def fg_plant():
    w, h = 300, 460
    b = [path("M 100 460 L 110 360 L 190 360 L 200 460 Z", "#0a0608", stroke=None)]
    for a, l in [(-70, 260), (-50, 300), (-30, 330), (-10, 300), (15, 320), (35, 280), (60, 240), (-85, 200), (80, 200)]:
        r = math.radians(a)
        x2 = 150 + math.sin(r) * l
        y2 = 360 - math.cos(r) * l
        cx = 150 + math.sin(r) * l * .5 + 30 * math.cos(r)
        cy = 360 - math.cos(r) * l * .5
        b.append(path(f"M 150 360 Q {cx:.0f} {cy:.0f} {x2:.0f} {y2:.0f} Q {cx - 40 * math.cos(r):.0f} {cy:.0f} 150 360 Z",
                      "#06040a", stroke=None))
    prop("fg_plant", w, h, "".join(b))


def fg_coatrack():
    w, h = 200, 560
    b = [rect(94, 20, 12, 540, "#06040a", stroke=None), ell(100, 556, 70, 10, "#06040a", stroke=None)]
    b.append(path("M 60 60 C 40 120 36 220 50 320 L 140 320 C 160 220 150 120 130 60 C 120 44 76 44 60 60 Z", "#08060c", stroke=None))
    b.append(ell(100, 30, 50, 14, "#06040a", stroke=None) + ell(100, 20, 30, 18, "#06040a", stroke=None))
    prop("fg_coatrack", w, h, "".join(b))


def fg_chair():
    w, h = 200, 360
    b = [rect(30, 20, 20, 340, "#07050a", stroke=None), rect(150, 20, 20, 340, "#07050a", stroke=None),
         rect(30, 30, 140, 22, "#07050a", stroke=None), rect(30, 110, 140, 14, "#07050a", stroke=None),
         rect(20, 220, 160, 26, "#07050a", stroke=None)]
    prop("fg_chair", w, h, "".join(b))


def fg_curtain():
    w, h = 220, 720
    b = [path("M 0 0 L 220 0 C 180 200 200 400 150 720 L 0 720 Z", "#0a0508", stroke=None),
         path("M 60 0 C 70 240 50 480 70 720", stroke="#140a10", sw=8), path("M 130 0 C 120 240 130 480 110 720", stroke="#140a10", sw=6)]
    prop("fg_curtain", w, h, "".join(b))


if __name__ == "__main__":
    for fn in [bed_guest, nightstand, wardrobe, chair_clothes, grandfather_clock, phone_table, bed_clara, altar_shelf,
               dollhouse, desk, tv, sofa, coffee_table, armchair, floor_lamp, bookshelf, counter, fridge, dining_table,
               fg_plant, fg_coatrack, fg_chair, fg_curtain]:
        fn()
    for k, (w, h) in sorted(SIZES.items()):
        print(f"{k}: {w}x{h}")
