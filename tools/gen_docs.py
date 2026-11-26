#!/usr/bin/env python3
"""
Gera as ilustrações dos documentos (fotos, desenhos, páginas do caderno)
e os elementos de interface (símbolo, vinheta, brilho, tecla de interação, papel).
"""
import math
import os
import random
from svgkit import *

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
DOCS = os.path.join(ROOT, "documents")
UI = os.path.join(ROOT, "interface")
PEN = "#2a1a14"
HAND = "'Segoe Print', 'Comic Sans MS', cursive"


def adam_symbol(cx, cy, s=1.0, color=PEN, sw=3, broken=True):
    """Símbolo de Adão: uma semente fechada dentro de uma amêndoa,
    raízes descendo, e um anel partido ao redor (a ruptura)."""
    o = []
    o.append(path(f"M {cx} {cy - 70 * s} C {cx + 46 * s} {cy - 30 * s} {cx + 46 * s} {cy + 30 * s} {cx} {cy + 70 * s} "
                  f"C {cx - 46 * s} {cy + 30 * s} {cx - 46 * s} {cy - 30 * s} {cx} {cy - 70 * s} Z", stroke=color, sw=sw))
    o.append(ell(cx, cy, 13 * s, 13 * s, color, stroke=None))
    o.append(ell(cx, cy, 22 * s, 22 * s, "none", stroke=color, sw=sw * .6))
    for k in range(-4, 5):
        x = cx + k * 7 * s
        o.append(path(f"M {cx + k * 3 * s} {cy + 62 * s} C {x} {cy + 80 * s} {x + k * 2 * s} {cy + 92 * s} {x + k * 3 * s} {cy + (104 - abs(k) * 4) * s}",
                      stroke=color, sw=sw * .55))
    if broken:
        r = 92 * s
        a0, a1 = math.radians(-60), math.radians(235)
        x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        o.append(path(f"M {x0:.1f} {y0:.1f} A {r} {r} 0 1 1 {x1:.1f} {y1:.1f}", stroke=color, sw=sw * .8))
        o.append(line(x0, y0, x0 + 10 * s, y0 - 12 * s, color, sw * .6))
        o.append(line(x1, y1, x1 - 4 * s, y1 - 14 * s, color, sw * .6))
    return "".join(o)


def paper_defs(id="paper", base="#e8dfc8", seed=3):
    return (f'<filter id="{id}f" x="0" y="0" width="100%" height="100%">'
            f'<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="{seed}"/>'
            f'<feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .22 0"/>'
            f'<feComposite in2="SourceGraphic" operator="in"/></filter>')


def photo_family():
    w, h = 420, 320
    d = paper_defs()
    b = [rect(0, 0, w, h, "#f0ead8", stroke=None), rect(16, 16, w - 32, h - 70, "#6a5a48", stroke=None)]
    b.append(rect(16, 16, w - 32, 120, "#5a3a34", stroke=None))
    b.append(path("M 30 190 C 60 170 360 170 390 190 L 390 266 L 30 266 Z", "#4a3a2e", stroke="#2a1a12", sw=2))
    people = [(110, "#3a3a44", "#c8a890", "#8a8580"), (180, "#2c4446", "#dcb498", "#5e4436"), (250, "#5f7a6a", "#e6c8b4", "#241a22")]
    for x, body, skin, hair in people:
        b.append(rect(x - 24, 150, 48, 90, body, stroke="#1a1010", sw=2))
        b.append(ell(x, 126, 20, 24, skin, stroke="#1a1010", sw=2))
        b.append(path(f"M {x - 20} 120 C {x - 20} 96 {x + 20} 96 {x + 20} 120 C {x + 10} 108 {x - 10} 108 {x - 20} 120 Z", hair, stroke=None))
        b.append(path(f"M {x - 8} 136 C {x - 3} 140 {x + 3} 140 {x + 8} 136", stroke="#1a1010", sw=1.5))
    # quarta pessoa: rosto recortado de outra foto, colado
    b.append(rect(298, 150, 48, 90, "#24104f", stroke="#1a1010", sw=2))
    b.append(path("M 296 98 L 344 96 L 348 152 L 300 154 Z", "#d8d0c0", stroke="#8a8070", sw=1.5))
    b.append(ell(322, 126, 19, 23, "#d8ad8e", stroke="#1a1010", sw=2))
    b.append(path("M 304 114 L 308 100 L 316 110 L 322 98 L 330 110 L 338 100 L 340 116 Z", "#b27343", stroke=None))
    b.append(rect(308, 120, 12, 8, "none", stroke="#1a1010", sw=1.5) + rect(324, 120, 12, 8, "none", stroke="#1a1010", sw=1.5))
    b.append(rect(298, 90, 30, 10, "#e8e0b8", stroke=None, op=.8, extra='transform="rotate(-12 313 95)"'))
    b.append(rect(330, 146, 30, 10, "#e8e0b8", stroke=None, op=.8, extra='transform="rotate(10 345 151)"'))
    b.append(rect(16, 16, w - 32, h - 70, "#ffcf8a", stroke=None, op=.08))
    b.append(text(w / 2, h - 22, "nossa família. finalmente.", 20, "#3a2a5a", HAND))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "photo_family.svg"), doc("".join(b), w, h, d))


def photo_vigil():
    w, h = 320, 400
    d = paper_defs(seed=7) + rad_grad("cand", [(0, "#ffe8a0", .8), (1, "#ffe8a0", 0)])
    b = [rect(0, 0, w, h, "#e8dcc0", stroke=None), rect(18, 18, w - 36, h - 90, "#3a3024", stroke=None)]
    b.append(rect(18, 200, w - 36, 110, "#2a2418", stroke=None))
    # círculo de velas
    for k in range(14):
        a = k * math.pi * 2 / 14
        x, y = 160 + math.cos(a) * 100, 250 + math.sin(a) * 34
        b.append(ell(x, y, 14, 14, "url(#cand)", stroke=None) + ell(x, y, 2, 3, "#fff4d0", stroke=None))
    # duas figuras de branco, rostos borrados
    for x in (110, 210):
        b.append(path(f"M {x - 22} 266 L {x - 16} 160 C {x - 14} 150 {x + 14} 150 {x + 16} 160 L {x + 22} 266 Z", "#d8d0bc", stroke=None))
        b.append(ell(x, 140, 14, 16, "#b8a890", stroke=None))
        b.append(ell(x, 140, 16, 18, "#d8d0bc", stroke=None, op=.6))
    # berço vazio no centro
    b.append(path("M 136 236 L 184 236 L 180 256 L 140 256 Z", "none", stroke="#c8b890", sw=2.5))
    b.append(path("M 140 236 C 140 220 180 220 180 236", stroke="#c8b890", sw=2))
    b.append(rect(18, 18, w - 36, h - 90, "#c89050", stroke=None, op=.25))
    b.append(text(w / 2, h - 40, "vigília — primeira noite", 18, "#4a3a2a", HAND))
    b.append(text(w / 2, h - 16, "(não veio)", 15, "#6a2a2a", HAND))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "photo_vigil.svg"), doc("".join(b), w, h, d))


def clara_drawing():
    w, h = 440, 320
    d = paper_defs(seed=11)
    b = [rect(0, 0, w, h, "#f2eee2", stroke=None)]
    for y in range(40, h, 26):
        b.append(line(0, y, w, y, "#a8c0d8", 1, .6))
    b.append(line(40, 0, 40, h, "#d89090", 1.2, .7))
    crayon = 'stroke-linecap="round" stroke-linejoin="round"'
    # Arthur (roxo) e Clara (preto) de mãos dadas
    b.append(path("M 150 270 L 160 200 L 172 270 M 160 214 L 136 236 M 160 214 L 200 228", stroke="#5a2aa8", sw=5))
    b.append(ell(160, 182, 18, 18, "none", stroke="#5a2aa8", sw=4))
    b.append(path("M 144 170 L 148 156 L 156 166 L 162 152 L 170 166 L 178 158 L 176 172", stroke="#c07a3a", sw=4))
    b.append(path("M 250 270 L 240 200 L 230 270 M 240 214 L 200 228 M 240 214 L 262 236", stroke="#1a1a1a", sw=5))
    b.append(ell(240, 182, 18, 18, "none", stroke="#1a1a1a", sw=4))
    b.append(path("M 222 176 C 220 210 224 230 226 238 M 258 176 C 260 210 256 230 254 238", stroke="#1a1a1a", sw=4))
    b.append(path("M 192 210 C 196 198 210 198 204 214 C 214 200 228 206 204 228 C 178 214 186 200 192 210 Z", "#d02a3a", stroke=None))
    # algo grande sobre eles: um círculo com raízes
    b.append(ell(200, 76, 46, 46, "none", stroke="#c01a1a", sw=5))
    b.append(ell(200, 76, 14, 14, "#c01a1a", stroke=None))
    for k in range(-4, 5):
        b.append(path(f"M {200 + k * 6} 122 C {200 + k * 9} 136 {200 + k * 10} 144 {200 + k * 12} 156", stroke="#c01a1a", sw=3))
    b.append(text(330, 80, "nós", 26, "#1a1a1a", HAND))
    b.append(text(336, 112, "+ ele", 26, "#c01a1a", HAND))
    b.append(text(84, 300, "C. ♥ A.", 20, "#5a2aa8", HAND))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "clara_drawing.svg"), doc("".join(b), w, h, d))


def notebook_cover():
    w, h = 400, 520
    d = paper_defs(seed=5) + ('<filter id="burn"><feGaussianBlur stdDeviation="1.4"/></filter>')
    b = [rect(10, 10, w - 20, h - 20, "#4a3a2a", sw=3, rx=8)]
    b.append(rect(10, 10, 40, h - 20, "#3a2a1c", sw=3, rx=6))
    for y in range(40, h - 30, 36):
        b.append(line(30, y, 30, y + 18, "#c8b890", 2.5))
    b.append(grp(adam_symbol(225, 230, 1.15, "#1a0e08", 5), extra='filter="url(#burn)"'))
    b.append(grp(adam_symbol(225, 230, 1.15, "#2a1a10", 3)))
    b.append(path("M 50 380 C 160 372 300 388 390 378", stroke="#b8a070", sw=4))
    b.append(path("M 330 378 C 340 400 336 430 344 470", stroke="#b8a070", sw=3))
    b.append(rect(10, 10, w - 20, h - 20, "#000", stroke=None, rx=8, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "notebook_cover.svg"), doc("".join(b), w, h, d))


def notebook_rings():
    """Página com casas concêntricas e uma rachadura onde fica o símbolo."""
    w, h = 420, 420
    d = paper_defs(seed=9)
    b = [rect(0, 0, w, h, "#ece2c8", stroke=None)]
    cx, cy = 210, 210
    names = ["Freixo", "Takamagahara", "Kunlun", "Meru"]
    for i, r in enumerate((180, 140, 100, 62)):
        b.append(ell(cx, cy, r, r, "none", stroke=PEN, sw=2, extra='stroke-dasharray="1 0"'))
        b.append(text(cx, cy - r + 16, names[i], 12, PEN, HAND))
    # rachadura
    b.append(path("M 300 40 L 286 92 L 300 120 L 270 170 L 286 200 L 250 250 L 262 290 L 230 350 L 236 400",
                  stroke="#6a0a0a", sw=4))
    b.append(grp(adam_symbol(0, 0, .32, "#6a0a0a", 4), transform="translate(262 230)"))
    b.append(text(340, 300, "aqui.", 20, "#6a0a0a", HAND))
    b.append(path("M 330 290 C 310 280 296 266 284 250", stroke="#6a0a0a", sw=2))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "notebook_rings.svg"), doc("".join(b), w, h, d))


def notebook_house():
    """Corte da casa desenhado à mão com um cômodo a mais embaixo."""
    w, h = 420, 420
    d = paper_defs(seed=13)
    b = [rect(0, 0, w, h, "#ece2c8", stroke=None)]
    b.append(path("M 70 200 L 70 110 L 210 30 L 350 110 L 350 200", stroke=PEN, sw=3))
    b.append(path("M 70 200 L 350 200 M 210 110 L 210 280 M 70 280 L 350 280 L 350 200 M 70 200 L 70 280", stroke=PEN, sw=2.5))
    b.append(line(70, 110, 350, 110, PEN, 2))
    b.append(text(140, 160, "menino", 15, PEN, HAND) + text(280, 160, "C.", 15, PEN, HAND))
    b.append(text(140, 245, "sala", 15, PEN, HAND) + text(280, 245, "cozinha", 15, PEN, HAND))
    # porão
    b.append(path("M 110 280 L 110 370 L 310 370 L 310 280", stroke="#6a0a0a", sw=3))
    b.append(ell(210, 330, 60, 18, "none", stroke="#6a0a0a", sw=2))
    for k in range(10):
        a = k * math.pi * 2 / 10
        b.append(ell(210 + math.cos(a) * 60, 330 + math.sin(a) * 18, 2.5, 2.5, "#6a0a0a", stroke=None))
    b.append(path("M 150 160 C 130 220 170 290 200 322", stroke="#6a0a0a", sw=2, extra='stroke-dasharray="5 5"'))
    b.append(path("M 192 312 L 202 324 L 186 324", stroke="#6a0a0a", sw=2))
    b.append(text(210, 400, "a sala de baixo", 16, "#6a0a0a", HAND))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "notebook_house.svg"), doc("".join(b), w, h, d))


def calendar_doc():
    w, h = 360, 420
    d = paper_defs(seed=17)
    b = [rect(0, 0, w, h, "#ece6d6", stroke=None), rect(0, 0, w, 70, "#8a2a2a", stroke=None)]
    b.append(text(w / 2, 46, "NOVEMBRO", 30, "#f0e6d0", "Georgia, serif", extra='letter-spacing="4"'))
    days = "D S T Q Q S S".split()
    for c, dd in enumerate(days):
        b.append(text(30 + c * 50, 96, dd, 14, "#6a5a4a", "Georgia, serif"))
    n = 1
    for r in range(5):
        for c in range(7):
            if r == 0 and c < 3:
                continue
            if n > 30:
                break
            x, y = 8 + c * 50, 106 + r * 58
            b.append(rect(x, y, 46, 54, "none", stroke="#b0a890", sw=1))
            b.append(text(x + 10, y + 16, str(n), 12, "#4a3a2a", "Georgia, serif"))
            if n < 26:
                b.append(line(x + 6, y + 8, x + 40, y + 48, "#3a3a3a", 2, .7))
            if n == 30:
                b.append(ell(x + 23, y + 30, 22, 22, "none", stroke="#c01a1a", sw=3))
                b.append(grp(adam_symbol(0, 0, .13, "#c01a1a", 6, broken=False), transform=f"translate({x + 23} {y + 32})"))
            n += 1
    b.append(text(250, 404, "faltam 4", 18, "#c01a1a", HAND))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "calendar.svg"), doc("".join(b), w, h, d))


def shrine_photo():
    w, h = 300, 340
    d = paper_defs(seed=19)
    b = [rect(0, 0, w, h, "#ece6da", stroke=None), rect(16, 16, w - 32, 250, "#4a5060", stroke=None)]
    b.append(rect(30, 40, 20, 226, "#2a2e36", stroke=None) + rect(20, 40, 120, 14, "#2a2e36", stroke=None))
    b.append(rect(60, 60, 60, 40, "#c8c020", stroke="#2a2e36", sw=3))
    b.append(text(90, 86, "ÔNIBUS", 10, "#2a2e36", "Georgia, serif"))
    b.append(rect(16, 230, w - 32, 36, "#3a3e46", stroke=None))
    # Arthur de costas, ao longe
    b.append(path("M 190 236 L 192 200 L 214 200 L 216 236 Z", "#244789", stroke=None))
    b.append(path("M 182 204 C 180 170 186 150 203 148 C 220 150 226 170 224 204 Z", "#24104f", stroke=None))
    b.append(path("M 190 150 C 188 130 218 130 216 150 Z", "#3a1d74", stroke=None))
    b.append(ell(203, 134, 14, 14, "#b27343", stroke=None))
    b.append(rect(16, 16, w - 32, 250, "#000", stroke=None, op=.15))
    b.append(text(w / 2, 300, "terça, 7h12. ele sempre", 17, "#5a2a5a", HAND))
    b.append(text(w / 2, 324, "espera do lado da placa.", 17, "#5a2a5a", HAND))
    b.append(rect(0, 0, w, h, "#000", stroke=None, extra='filter="url(#paperf)"'))
    save(os.path.join(DOCS, "shrine_photo.svg"), doc("".join(b), w, h, d))


# --------------------------- interface --------------------------------------

def ui_assets():
    save(os.path.join(UI, "symbol.svg"), doc(adam_symbol(110, 110, 1, "#c8b8a0", 3.2), 220, 230))
    save(os.path.join(UI, "symbol_red.svg"), doc(adam_symbol(110, 110, 1, "#8a1a1a", 3.2), 220, 230))
    vg = rad_grad("v", [(0, "#000", 0), (.55, "#000", .05), (.85, "#000", .55), (1, "#000", .9)], r=.75)
    save(os.path.join(UI, "vignette.svg"), doc(rect(0, 0, 1280, 720, "url(#v)", stroke=None), 1280, 720, vg))
    gl = rad_grad("g", [(0, "#ffffff", .5), (.3, "#ffffff", .22), (.65, "#ffffff", .06), (1, "#ffffff", 0)])
    save(os.path.join(UI, "glow.svg"), doc(rect(0, 0, 256, 256, "url(#g)", stroke=None), 256, 256, gl))
    key = (rect(4, 4, 40, 40, "#1a1418", stroke="#c8b8a0", sw=2.5, rx=8) + rect(8, 8, 32, 30, "#2a2228", stroke=None, rx=6)
           + text(24, 32, "E", 22, "#e8dcc8", "Georgia, serif", extra='font-weight="bold"'))
    save(os.path.join(UI, "key_e.svg"), doc(key, 48, 48))
    arrow = path("M 6 4 L 22 14 L 6 24 Z", "#c8b8a0", stroke=None)
    save(os.path.join(UI, "arrow.svg"), doc(arrow, 28, 28))
    paper = (f'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="4" seed="2"/>'
             f'<feColorMatrix values="0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .15  0 0 0 .28 0"/></filter>'
             + rad_grad("pv", [(0, "#000", 0), (.7, "#000", .04), (1, "#5a3a1a", .35)], r=.75))
    save(os.path.join(UI, "paper.svg"), doc(rect(0, 0, 512, 512, "#e9dfc6", stroke=None) + rect(0, 0, 512, 512, "#000", stroke=None, extra='filter="url(#n)"')
                                         + rect(0, 0, 512, 512, "url(#pv)", stroke=None), 512, 512, paper))
    grain = ('<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4"/>'
             '<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.35"/></filter>')
    save(os.path.join(UI, "grain.svg"), doc(rect(0, 0, 256, 256, "#000", stroke=None, extra='filter="url(#n)"'), 256, 256, grain))
    # ícone da aba do navegador
    save(os.path.join(UI, "favicon.svg"), doc(rect(0, 0, 220, 230, "#0c0a10", stroke=None) + adam_symbol(110, 110, 1, "#c8b8a0", 6), 220, 230))


if __name__ == "__main__":
    photo_family()
    photo_vigil()
    clara_drawing()
    notebook_cover()
    notebook_rings()
    notebook_house()
    calendar_doc()
    shrine_photo()
    ui_assets()
    print("documentos e interface gerados")
