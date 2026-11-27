#!/usr/bin/env python3
"""
Arte PROVISÓRIA do porão (Fase 1) e dos itens do inventário.
Cativeiro comum de sequestro — sem símbolos do culto. A única pista do
subsolo escondido é uma parede de tijolos mais nova e uma grelha no chão.
Uso: python3 tools/gen_basement.py
"""
import math
import os
import random
from svgkit import *

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
BG = os.path.join(ROOT, "backgrounds")
OBJ = os.path.join(ROOT, "objects")
ITEMS = os.path.join(ROOT, "interface", "itens")


def background():
    w = 1500
    rnd = random.Random(3)
    defs = common_defs() + (
        '<pattern id="blocos" width="80" height="40" patternUnits="userSpaceOnUse">'
        + rect(0, 0, 80, 40, "#3a3c36", stroke=None)
        + rect(0.5, 0.5, 79, 19, "none", stroke="#24261f", sw=2)
        + rect(-39.5, 20.5, 79, 19, "none", stroke="#24261f", sw=2)
        + rect(40.5, 20.5, 79, 19, "none", stroke="#24261f", sw=2)
        + '</pattern>'
        + '<pattern id="tijolos" width="44" height="22" patternUnits="userSpaceOnUse">'
        + rect(0, 0, 44, 22, "#6a3a2c", stroke=None)
        + rect(1, 1, 42, 9, "none", stroke="#3a2018", sw=1.5)
        + rect(-21, 12, 42, 9, "none", stroke="#3a2018", sw=1.5) + rect(23, 12, 42, 9, "none", stroke="#3a2018", sw=1.5)
        + '</pattern>'
        + rad_grad("calor", [(0, "#ff4a1a", .55), (1, "#ff4a1a", 0)])
    )
    b = [rect(0, 0, w, WALL_BOTTOM, "url(#blocos)", stroke=None), stains(w, "#0a0c08", seed=61, n=16)]
    # umidade escorrendo
    for _ in range(14):
        x = rnd.uniform(40, w - 40)
        b.append(rect(x, rnd.uniform(40, 120), rnd.uniform(3, 8), rnd.uniform(120, 300), "#14160f", stroke=None, op=.35))
    # teto: vigas e canos
    b.append(rect(0, 0, w, 40, "#1a1a16", stroke=None))
    for x in range(30, w, 190):
        b.append(rect(x, 0, 26, 52, "#2a2218", sw=2))
    b.append(rect(0, 58, w, 12, "#4a4a44", sw=2, rx=6))
    b.append(rect(0, 76, w, 8, "#3a3028", sw=1.5, rx=4))
    # janela basculante alta, com grades e tinta raspada
    b.append(rect(250, 60, 150, 70, "#2a2a24", sw=3))
    b.append(rect(260, 68, 130, 54, "url(#nightsky)", sw=2))
    b.append(path("M 262 120 C 300 100 340 112 388 96 L 388 120 Z", "#0c1408", stroke=None))
    for x in range(272, 390, 18):
        b.append(line(x, 66, x, 126, "#5a5a54", 4))
    b.append(rect(260, 68, 60, 54, "#1a1a14", stroke=None, op=.7))
    # parede de tijolos mais nova (pista do subsolo)
    b.append(rect(880, 150, 190, WALL_BOTTOM - 150, "url(#tijolos)", sw=3))
    b.append(rect(880, 150, 190, WALL_BOTTOM - 150, "#000", stroke=None, op=.25))
    b.append(path("M 878 150 L 1072 150", stroke="#8a8a80", sw=3, op=.6))
    # porta no topo da escada
    b.append(rect(1350, 60, 110, 210, "#2a1c14", sw=3))
    b.append(rect(1360, 70, 90, 200, "#3a2618", sw=2.5))
    b.append(rect(1360, 266, 90, 4, "#ffcf8a", stroke=None, op=.5))
    b.append(ell(1440, 170, 5, 5, "#8a7a4a", sw=1.5))
    b.append(baseboard(w, "#2a2a24", "#14140f"))
    # piso de cimento
    b.append(rect(0, FLOOR_TOP, w, H - FLOOR_TOP, "#2e2e2a", stroke=None))
    for _ in range(40):
        x, y = rnd.uniform(0, w), rnd.uniform(FLOOR_TOP + 10, H)
        b.append(path(f"M {x} {y} l {rnd.uniform(-60, 60)} {rnd.uniform(-8, 8)} l {rnd.uniform(-40, 40)} {rnd.uniform(-6, 6)}",
                      stroke="#1a1a16", sw=1.5, op=.6))
    # ralo/grelha no chão diante da parede nova, com ar quente avermelhado
    b.append(ell(975, 560, 46, 12, "#141410", sw=2.5))
    for k in range(-3, 4):
        b.append(line(975 + k * 11, 550, 975 + k * 11, 570, "#4a4a44", 2.5))
    b.append(ell(975, 556, 120, 50, "url(#calor)", stroke=None, op=.7))
    b.append(room_shading(w))
    save(os.path.join(BG, "bg_basement.svg"), doc("".join(b), w, H, defs))


def props():
    WD, WK = "#4a3020", "#2e1c12"
    # cadeira de madeira (vista de frente/lado), espaldar alto
    c = [rect(30, 10, 16, 230, WK, sw=3), rect(134, 10, 16, 230, WK, sw=3),
         rect(30, 20, 120, 18, WD, sw=3), rect(30, 70, 120, 12, WD, sw=2.5),
         rect(20, 140, 140, 22, WD, sw=3), rect(30, 162, 14, 108, WK, sw=2.5), rect(136, 162, 14, 108, WK, sw=2.5),
         rect(56, 210, 12, 60, WK, sw=2), rect(112, 210, 12, 60, WK, sw=2)]
    save(os.path.join(OBJ, "cadeira_cativeiro.svg"), doc("".join(c), 180, 272))
    # cordas que prendem o Arthur (sobreposição)
    rope = "#b8a070"
    r = []
    for y in (120, 136, 196, 210):
        r.append(path(f"M 10 {y} C 60 {y - 8} 120 {y - 8} 170 {y}", stroke="#2a2014", sw=11))
        r.append(path(f"M 10 {y} C 60 {y - 8} 120 {y - 8} 170 {y}", stroke=rope, sw=7))
        r.append(path(f"M 20 {y - 3} L 160 {y - 3}", stroke="#8a7448", sw=1.5, extra='stroke-dasharray="4 5"'))
    for y in (300, 316):
        r.append(path(f"M 30 {y} C 70 {y + 6} 110 {y + 6} 150 {y}", stroke="#2a2014", sw=10))
        r.append(path(f"M 30 {y} C 70 {y + 6} 110 {y + 6} 150 {y}", stroke=rope, sw=6))
    r.append(path("M 150 200 C 170 230 160 250 172 270", stroke=rope, sw=5))
    r.append(rect(60, 176, 60, 16, "#9a9a92", sw=2, op=.95))  # fita
    save(os.path.join(OBJ, "cordas.svg"), doc("".join(r), 180, 340))
    # cordas soltas no chão
    rc = [path("M 10 40 C 40 10 80 50 120 20 C 150 0 170 30 190 24", stroke="#2a2014", sw=10),
          path("M 10 40 C 40 10 80 50 120 20 C 150 0 170 30 190 24", stroke=rope, sw=6),
          path("M 30 46 C 60 30 90 56 140 40", stroke="#2a2014", sw=9), path("M 30 46 C 60 30 90 56 140 40", stroke=rope, sw=5)]
    save(os.path.join(OBJ, "cordas_chao.svg"), doc("".join(rc), 200, 60))
    # escada de madeira subindo para a direita
    e = [path("M 0 420 L 300 40 L 330 40 L 330 70 L 40 420 Z", "#3a2618", sw=3)]
    for i in range(10):
        x = 20 + i * 30
        y = 400 - i * 38
        e.append(rect(x, y - 10, 64, 14, "#6a4a30", sw=2.5))
    e.append(line(330, 0, 330, 420, "#2a1c12", 8))
    e.append(path("M 330 20 L 40 380", stroke="#1a120c", sw=4))
    save(os.path.join(OBJ, "escada_porao.svg"), doc("".join(e), 340, 422))
    # prateleira de metal com latas e caixa de ferramentas
    p = [rect(10, 0, 8, 300, "#5a5a54", sw=2), rect(222, 0, 8, 300, "#5a5a54", sw=2)]
    for y in (60, 150, 240):
        p.append(rect(6, y, 228, 8, "#6a6a64", sw=2))
    for i, (x, c2) in enumerate([(30, "#8a6a3a"), (70, "#3a5a6a"), (110, "#6a3a3a"), (160, "#7a7a5a")]):
        p.append(rect(x, 22, 32, 38, c2, sw=2, rx=3) + rect(x, 22, 32, 6, "#2a2a2a", stroke=None))
    p.append(rect(40, 112, 120, 38, "#9a2a1a", sw=2.5, rx=4) + rect(80, 104, 40, 10, "#3a3a3a", sw=2))
    p.append(path("M 30 240 L 50 200 L 120 200 L 130 240 Z", "#c8b890", sw=2))   # jornais
    p.append(path("M 150 230 C 170 190 200 210 210 236", stroke="#9a9a9a", sw=3))  # cabide de arame
    p.append(path("M 180 200 L 180 190", stroke="#9a9a9a", sw=3))
    save(os.path.join(OBJ, "estante_porao.svg"), doc("".join(p), 240, 302))
    # caixas empilhadas
    cx = [rect(10, 120, 150, 110, "#8a6a42", sw=3), rect(30, 30, 120, 92, "#7a5a36", sw=3),
          line(10, 160, 160, 160, "#c8b088", 6, .8), line(30, 66, 150, 66, "#c8b088", 6, .8),
          text(85, 200, "NATAL", 16, "#3a2a1a", "Georgia, serif"), rect(140, 180, 100, 50, "#6a4a2a", sw=3)]
    save(os.path.join(OBJ, "caixas.svg"), doc("".join(cx), 250, 232))
    # aquecedor velho
    a = [rect(20, 20, 120, 260, "#8a8a80", sw=3, rx=30), rect(40, 180, 80, 40, "#2a2a24", sw=2),
         ell(80, 200, 10, 6, "#ff6a2a", stroke=None, op=.8), line(80, 0, 80, 20, "#5a5a54", 10),
         ell(80, 90, 18, 18, "#d8d0b8", sw=2) + line(80, 90, 92, 82, INK, 2)]
    save(os.path.join(OBJ, "aquecedor.svg"), doc("".join(a), 160, 282))
    # colchonete, balde e garrafa
    m = [path("M 10 70 L 230 70 L 240 96 L 0 96 Z", "#7a7a6a", sw=3), path("M 20 60 C 60 50 120 56 220 62 L 230 70 L 10 70 Z", "#9a9a86", sw=2.5),
         path("M 250 40 L 300 40 L 294 96 L 256 96 Z", "#5a6a7a", sw=3), path("M 248 40 C 260 20 290 20 302 40", stroke="#3a3a3a", sw=2.5),
         rect(320, 30, 22, 66, "#b8d8e8", sw=2, rx=6, op=.85), rect(326, 18, 10, 14, "#3a6aa8", sw=1.5)]
    save(os.path.join(OBJ, "colchonete.svg"), doc("".join(m), 350, 98))
    # molho de chaves no gancho (cozinha, Fase 1)
    k = [line(30, 0, 30, 14, "#6a6a64", 3), ell(30, 22, 10, 10, "none", stroke="#b8a060", sw=3)]
    for i, ang in enumerate((-30, 0, 30)):
        x = 30 + math.sin(math.radians(ang)) * 26
        y = 32 + math.cos(math.radians(ang)) * 26
        k.append(path(f"M 30 30 L {x} {y}", stroke="#c8b070", sw=4) + ell(x, y + 4, 4, 6, "#c8b070", sw=1.5))
    save(os.path.join(OBJ, "molho_chaves.svg"), doc("".join(k), 60, 70))
    # vulto (paranoia)
    v = [ell(80, 60, 34, 40, "#030205", stroke=None),
         path("M 30 110 C 40 80 120 80 130 110 L 150 420 L 10 420 Z", "#030205", stroke=None)]
    save(os.path.join(OBJ, "vulto.svg"), doc("".join(v), 160, 420))


def items():
    os.makedirs(ITEMS, exist_ok=True)
    bgd = rect(2, 2, 60, 60, "#1a1418", stroke="#4a3e44", sw=2, rx=8)
    save(os.path.join(ITEMS, "jornal.svg"), doc(bgd + path("M 14 18 L 50 14 L 52 46 L 16 50 Z", "#d8ccb0", sw=2)
                                                + "".join(line(20, 22 + i * 6, 46, 20 + i * 6, "#5a5040", 1.5) for i in range(5)), 64, 64))
    save(os.path.join(ITEMS, "arame.svg"), doc(bgd + path("M 12 46 L 32 22 L 52 46 Z", stroke="#b8b8b8", sw=3)
                                               + path("M 32 22 C 32 12 42 12 40 20", stroke="#b8b8b8", sw=3), 64, 64))
    save(os.path.join(ITEMS, "chave_porao.svg"), doc(bgd + ell(22, 32, 9, 9, "none", stroke="#c8a050", sw=4)
                                                     + path("M 31 32 L 52 32 M 46 32 L 46 40 M 52 32 L 52 38", stroke="#c8a050", sw=4), 64, 64))
    save(os.path.join(ITEMS, "molho_chaves.svg"), doc(bgd + ell(32, 18, 8, 8, "none", stroke="#c8b070", sw=3)
                                                      + "".join(path(f"M 32 24 L {32 + dx} 50", stroke="#c8b070", sw=3) for dx in (-12, 0, 12)), 64, 64))
    save(os.path.join(ITEMS, "chave_pequena.svg"), doc(bgd + ell(24, 32, 7, 7, "none", stroke="#d8b060", sw=3)
                                                       + path("M 31 32 L 46 32 M 42 32 L 42 37", stroke="#d8b060", sw=3)
                                                       + rect(40, 18, 14, 9, "#e8e0c8", sw=1), 64, 64))


if __name__ == "__main__":
    background()
    props()
    items()
    print("arte do porão gerada")
