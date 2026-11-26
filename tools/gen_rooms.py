#!/usr/bin/env python3
"""
Gera os fundos (backgrounds) dos cômodos da casa.
Cada fundo contém apenas parede, piso, portas e objetos pendurados.
Móveis que o Arthur pode contornar ficam em assets/objects (gen_props.py).

As coordenadas dos objetos pendurados (quadros, desenhos, calendário...)
são usadas como pontos de interação em js/data/rooms.js.
"""
import math
import os
import random
from svgkit import *

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "backgrounds")


def wall(w, pattern_id):
    return rect(0, 0, w, WALL_BOTTOM, f"url(#{pattern_id})", stroke=None)


def wainscot(w, top, color, dark):
    out = [rect(0, top, w, WALL_BOTTOM - top, color, sw=2.5),
           rect(0, top - 6, w, 10, dark, sw=2.5)]
    for x in range(20, w, 110):
        out.append(rect(x, top + 18, 86, WALL_BOTTOM - top - 34, "none", stroke=dark, sw=2.5))
        out.append(line(x + 2, top + 20, x + 84, top + 20, "#ffffff", 1, .08))
    return "".join(out)


def sconce(x, y):
    return (path(f"M {x - 8} {y + 20} L {x + 8} {y + 20} L {x + 4} {y + 30} L {x - 4} {y + 30} Z", "#6a5430", sw=2)
            + path(f"M {x - 16} {y} L {x + 16} {y} L {x + 10} {y + 22} L {x - 10} {y + 22} Z", "#e8c890", sw=2.5)
            + ell(x, y + 10, 30, 22, "url(#warm)", stroke=None, op=.9))


def hanging_bulb(x, length=120):
    return (line(x, 0, x, length, INK, 2)
            + path(f"M {x - 6} {length} L {x + 6} {length} L {x + 6} {length + 10} L {x - 6} {length + 10} Z", "#3a3020", sw=1.5)
            + ell(x, length + 20, 11, 13, "#ffe2a8", sw=2)
            + ell(x, length + 20, 90, 90, "url(#warm)", stroke=None, op=.8))


def tape(x, y, rot=0):
    return rect(x - 12, y - 5, 24, 10, "#e8e0b8", stroke=None, op=.7, extra=f'transform="rotate({rot} {x} {y})"')


# ---------------------------------------------------------------------------

def guestroom():
    w = 1600
    defs = common_defs() + wallpaper_pattern("wp", "#4a4458", "#5c5470", "stripes", "#7a6a8a")
    b = [wall(w, "wp"), stains(w, "#1a1020", seed=11, n=10), crown(w, "#5a5060", "#1c1822")]
    # janela tapada com tábuas
    b.append(window(230, 130, 180, 170, boarded=True, seed=7))
    # marca clara onde havia um espelho
    b.append(rect(612, 150, 92, 118, "#6a6478", stroke=None, op=.55))
    b.append(rect(612, 150, 92, 118, "none", stroke="#2a2430", sw=1.5, op=.4))
    b.append(ell(658, 140, 3, 3, "#9a9a9a", sw=1.2))
    # desenhos da Clara colados
    b.append(rect(872, 168, 92, 112, "#e8e2d0", sw=2, extra='transform="rotate(-4 918 224)"'))
    b.append(path("M 892 250 L 900 210 L 908 250 M 900 222 L 888 232 M 900 222 L 914 230", stroke="#7a3aa8", sw=3,
                  extra='transform="rotate(-4 918 224)"'))
    b.append(ell(900, 202, 7, 7, "none", stroke="#7a3aa8", sw=2.5, extra='transform="rotate(-4 918 224)"'))
    b.append(path("M 930 250 L 936 212 L 944 250 M 936 222 L 916 228 M 936 222 L 950 232", stroke="#2a2a2a", sw=3,
                  extra='transform="rotate(-4 918 224)"'))
    b.append(ell(936, 204, 7, 7, "none", stroke="#2a2a2a", sw=2.5, extra='transform="rotate(-4 918 224)"'))
    b.append(path("M 904 196 C 912 186 924 186 930 196 C 934 188 942 188 944 194", stroke="#c02a3a", sw=2.5,
                  extra='transform="rotate(-4 918 224)"'))
    b.append(tape(880, 170, -8) + tape(958, 166, 6))
    b.append(rect(984, 196, 70, 86, "#e4dcc8", sw=2, extra='transform="rotate(5 1019 239)"'))
    b.append(ell(1019, 240, 20, 20, "none", stroke="#b02020", sw=3))
    b.append(ell(1019, 240, 6, 6, "#b02020", stroke=None))
    for k in range(9):
        a = math.pi * .2 + k * math.pi * .6 / 8
        b.append(line(1019 + math.cos(a) * 22, 240 + math.sin(a) * 22, 1019 + math.cos(a) * 34, 240 + math.sin(a) * 34, "#b02020", 2))
    b.append(tape(1019, 198, 3))
    b.append(door(1440, 120, 250))
    b.append(baseboard(w, "#3a3040", "#1c1620"))
    b.append(floor_planks(w, "#3a2a24", "#2a1c18", "#140c0a", seed=2))
    # tapete sob a cama
    b.append(path("M 420 560 L 880 560 L 940 690 L 360 690 Z", "#4a2630", sw=2.5))
    b.append(path("M 436 572 L 866 572 L 916 678 L 384 678 Z", "none", stroke="#8a5a4a", sw=2, op=.6))
    b.append(hanging_bulb(760, 110))
    b.append(light_pool(430, 300, 260, 220, "warm", .55))
    b.append(room_shading(w))
    save(os.path.join(OUT, "bg_guestroom.svg"), doc("".join(b), w, H, defs))


def hallway():
    w = 2200
    defs = common_defs() + wallpaper_pattern("wp", "#26332a", "#3a4a3c", "damask")
    b = [wall(w, "wp"), stains(w, "#0a100a", seed=21, n=12), wainscot(w, 296, "#3a2a1e", "#22160e"),
         crown(w, "#3a2a1e", "#120c08")]
    b.append(door(180, 120, 250))
    # porta da Clara com plaquinha
    sign = (path("M 820 236 C 800 220 790 244 820 262 C 850 244 840 220 820 236 Z", "#c89aa8", sw=2)
            + text(820, 252, "C", 14, "#5a1e2a", "Georgia, serif")
            + rect(838, 300, 16, 12, "#e8d8a0", stroke=None, op=.8, extra='transform="rotate(12 846 306)"'))
    b.append(door(820, 120, 250, color="#4a2e24", dark="#32201a", sign=sign))
    b.append(door(1480, 116, 246, color="#3e2c22", dark="#28190f"))
    b.append(rect(1424, 440, 112, 6, "#9ab0d8", stroke=None, op=.25))
    b.append(arch(2080, 170, 290))
    # fotos de família
    fam = (rect(462, 152, 136, 98, "#6a5a48", stroke=None)
           + "".join(ell(492 + i * 36, 186, 11, 13, "#d8b8a0", sw=1.5) + rect(480 + i * 36, 200, 24, 48, c, sw=1.5)
                     for i, c in enumerate(["#3a3a44", "#2c4446", "#5f7a6a"]))
           + rect(587, 176, 14, 20, "#c8b8a0", stroke=None, op=.9)
           + ell(592, 186, 11, 12, "#d8ad8e", sw=1.5) + path("M 582 180 L 586 168 L 592 176 L 598 168 L 602 180", "#b27343", sw=1.2)
           + rect(580, 200, 24, 48, "#24104f", sw=1.5))
    b.append(frame(462, 152, 136, 98, fam, "#6a4a2a"))
    old = (rect(640, 168, 72, 92, "#8a7a60", stroke=None)
           + rect(640, 230, 72, 30, "#5a5a3a", stroke=None)
           + "".join(rect(652 + i * 26, 196, 14, 36, "#e8e4d8", sw=1) + ell(659 + i * 26, 190, 6, 7, "#c8a890", sw=1) for i in range(2))
           + "".join(ell(646 + k * 12, 252, 2, 3, "#ffe8a0", stroke=None) for k in range(6)))
    b.append(frame(640, 168, 72, 92, old, "#3a2a1a"))
    b.append(rect(640, 168, 72, 92, "#c8a870", stroke=None, op=.25))
    # bordado "Que Ele encontre a casa pronta"
    sam = (rect(1090, 150, 120, 96, "#e6dcc4", stroke=None)
           + text(1150, 178, "QUE ELE", 11, "#6a1a2a", "Georgia, serif", extra='letter-spacing="2"')
           + text(1150, 196, "ENCONTRE", 11, "#6a1a2a", "Georgia, serif", extra='letter-spacing="2"')
           + text(1150, 214, "A CASA PRONTA", 9, "#6a1a2a", "Georgia, serif", extra='letter-spacing="1"')
           + path("M 1100 230 Q 1150 240 1200 230", stroke="#3a5a3a", sw=2, extra='stroke-dasharray="3 3"')
           + ell(1150, 162, 4, 6, "none", stroke="#6a1a2a", sw=1.5))
    b.append(frame(1090, 150, 120, 96, sam, "#5a3a22"))
    # janela sobre a mesinha do telefone
    b.append(window(1680, 120, 140, 150, curtains=("#3a1c22", "#22100f"), seed=9))
    for x in (330, 1000, 1880):
        b.append(sconce(x, 150))
    b.append(baseboard(w, "#2a1c14", "#140c08"))
    b.append(floor_planks(w, "#3a281c", "#2a1a10", "#120a06", seed=5))
    # passadeira
    b.append(path("M 140 520 L 2060 520 L 2100 640 L 100 640 Z", "#4a1c1c", sw=2.5))
    b.append(path("M 160 530 L 2040 530 L 2076 630 L 124 630 Z", "none", stroke="#a07a40", sw=2, op=.5))
    b.append(room_shading(w))
    save(os.path.join(OUT, "bg_hallway.svg"), doc("".join(b), w, H, defs))


def clara_room():
    w = 1500
    defs = common_defs() + wallpaper_pattern("wp", "#5a3c46", "#7a5260", "flowers", "#c8a0a8")
    b = [wall(w, "wp"), stains(w, "#2a1018", seed=31, n=7), crown(w, "#6a4a52", "#1c1014")]
    # estrelas que brilham no escuro, no teto/parede alta
    rnd = random.Random(5)
    for _ in range(18):
        x, y = rnd.uniform(200, 1400), rnd.uniform(52, 120)
        b.append(path(f"M {x} {y - 6} L {x + 2} {y - 2} L {x + 6} {y} L {x + 2} {y + 2} L {x} {y + 6} L {x - 2} {y + 2} L {x - 6} {y} L {x - 2} {y - 2} Z",
                      "#c8f0a0", stroke=None, op=.55))
    b.append(door(120, 116, 250, color="#4a2e24", dark="#32201a"))
    b.append(window(400, 130, 150, 160, curtains=("#e8dcd8", "#b8a8a8"), seed=12))
    # mural de fotos do Arthur
    b.append(rect(600, 112, 280, 200, "#8a6a4a", sw=3))
    b.append(rect(608, 120, 264, 184, "#a8845a", stroke=None))
    for i in range(40):
        b.append(ell(rnd.uniform(612, 868), rnd.uniform(124, 300), 2, 2, "#6a4a2a", stroke=None, op=.5))
    pins = []
    for (px, py, rot) in [(618, 128, -6), (668, 132, 4), (720, 126, -2), (780, 134, 7), (828, 128, -5),
                          (624, 200, 5), (680, 214, -8), (790, 206, 3), (836, 214, -4),
                          (640, 262, -3), (712, 256, 6), (770, 262, -7), (826, 258, 2)]:
        t = f'transform="rotate({rot} {px + 20} {py + 22})"'
        b.append(rect(px, py, 40, 44, "#ece6da", sw=1.5, extra=t))
        b.append(rect(px + 4, py + 4, 32, 28, "#3a3e4a", stroke=None, extra=t))
        b.append(ell(px + 20, py + 14, 4, 4, "#b27343", stroke=None, extra=t))
        b.append(rect(px + 16, py + 18, 9, 12, "#3a1d74", stroke=None, extra=t))
        pins.append((px + 20, py + 3))
        b.append(ell(px + 20, py + 3, 3, 3, "#c02030", sw=1))
    # fio vermelho entre as fotos
    order = [0, 6, 2, 10, 4, 7, 12, 1, 9]
    b.append(path("M " + " L ".join(f"{pins[i][0]} {pins[i][1]}" for i in order), stroke="#b01020", sw=1.5, op=.9))
    # foto central maior (Arthur no ponto de ônibus)
    b.append(rect(712, 170, 64, 76, "#ece6da", sw=2))
    b.append(rect(717, 175, 54, 56, "#4a5060", stroke=None))
    b.append(rect(722, 180, 6, 50, "#2a2e36", stroke=None))
    b.append(ell(752, 196, 6, 6, "#b27343", stroke=None))
    b.append(rect(746, 202, 13, 22, "#3a1d74", stroke=None))
    b.append(path("M 724 238 C 734 232 754 232 764 238", stroke="#c02030", sw=2))
    b.append(path("M 742 234 C 738 228 732 232 742 242 C 752 232 746 228 742 234 Z", "#c02030", stroke=None))
    # pôster de banda
    b.append(rect(1120, 130, 120, 170, "#1a1218", sw=2.5))
    b.append(path("M 1180 170 C 1160 150 1140 170 1160 190 C 1140 200 1160 220 1180 204 C 1200 220 1220 200 1200 190 C 1220 170 1200 150 1180 170 Z",
                  "#c8b48a", stroke=None, op=.9))
    b.append(text(1180, 250, "MARIPOSA", 16, "#c8b48a", "Georgia, serif", extra='letter-spacing="3"'))
    b.append(text(1180, 270, "turnê do silêncio", 9, "#8a7a6a", "Georgia, serif"))
    b.append(baseboard(w, "#5a3a42", "#2a1a1e"))
    b.append(floor_planks(w, "#4a3028", "#34201a", "#180c0a", seed=8))
    b.append(ell(720, 620, 300, 60, "#6a3a50", sw=2.5))
    b.append(ell(720, 620, 260, 46, "none", stroke="#e8c8d0", sw=2, op=.4))
    b.append(light_pool(740, 300, 300, 220, "warm", .4))
    b.append(light_pool(1320, 360, 200, 160, "warm", .5))
    b.append(room_shading(w))
    save(os.path.join(OUT, "bg_clara_room.svg"), doc("".join(b), w, H, defs))


def livingroom():
    w = 2300
    defs = common_defs() + wallpaper_pattern("wp", "#3e1c22", "#52262e", "stripes", "#6a3a3a")
    defs += rad_grad("ember", [(0, "#ff6a2a", .5), (1, "#ff2a0a", 0)])
    b = [wall(w, "wp"), stains(w, "#12060a", seed=41, n=12), wainscot(w, 310, "#2e1c16", "#1a0e0a"),
         crown(w, "#3a2018", "#120806")]
    b.append(arch(110, 160, 290))
    # lareira
    b.append(rect(780, 270, 240, 176, "#3a302c", sw=3))
    b.append(rect(760, 256, 280, 20, "#3a2a22", sw=3))
    b.append(path("M 830 446 L 830 330 C 830 300 970 300 970 330 L 970 446 Z", "#0a0606", sw=3))
    b.append(ell(900, 436, 60, 14, "#2a2220", stroke=None))
    b.append(ell(900, 430, 50, 20, "url(#ember)", stroke=None))
    for i in range(9):
        b.append(rect(784 + (i % 3) * 78, 282 + (i // 3) * 54, 74, 50, "none", stroke="#3a2e28", sw=1.5, op=.6))
    # velas e porta-retrato na cornija
    for x in (790, 820, 980, 1010):
        b.append(rect(x - 5, 222, 10, 34, "#e6dccb", sw=1.5) + ell(x, 214, 3, 6, "#ffd080", stroke=None)
                 + ell(x, 214, 22, 22, "url(#warm)", stroke=None, op=.9))
    # retrato pintado da família com cadeira vazia no centro
    port = (rect(830, 80, 140, 120, "#2a1e18", stroke=None)
            + ell(900, 120, 80, 60, "#4a3424", stroke=None, op=.7)
            + ell(852, 122, 10, 12, "#c8a890", sw=1.5) + rect(842, 136, 22, 64, "#2e2018", sw=1.5)
            + ell(948, 124, 10, 12, "#c8a890", sw=1.5) + rect(938, 138, 22, 62, "#1e3436", sw=1.5)
            + ell(878, 140, 8, 10, "#d8b8a0", sw=1.5) + rect(870, 152, 18, 48, "#4a5a4a", sw=1.5)
            + path("M 904 200 L 904 162 L 926 162 L 926 200 M 904 178 L 926 178", "none", stroke="#8a6a3a", sw=3)
            + ell(915, 150, 14, 10, "#fff4c0", stroke=None, op=.15))
    b.append(frame(830, 80, 140, 120, port, "#8a6a2a"))
    # janela com cortinas pesadas
    b.append(window(1590, 120, 150, 180, curtains=("#2a1418", "#160a0c"), seed=14))
    # porta da frente com três fechaduras
    fd = door(1880, 130, 260, color="#2a1a12", dark="#1c100a")
    for i, y in enumerate((236, 262, 288)):
        fd += rect(1922, y, 16, 14, "#a08a4a", sw=1.5) + ell(1930, y + 7, 2, 2, INK, stroke=None)
    fd += path("M 1900 232 C 1910 244 1920 246 1940 240", stroke="#9a9a9a", sw=2.5)
    fd += rect(1846, 200, 68, 20, "#9a8a6a", sw=1.5, op=.9)
    b.append(fd)
    b.append(door(2200, 110, 250, color="#3a2418", dark="#24150e"))
    for x in (560, 1250, 2040):
        b.append(sconce(x, 140))
    b.append(baseboard(w, "#2a1a12", "#120a06"))
    b.append(floor_planks(w, "#30201a", "#221410", "#100806", seed=12))
    b.append(path("M 380 540 L 1300 540 L 1360 680 L 320 680 Z", "#3a1a2a", sw=2.5))
    b.append(path("M 400 552 L 1280 552 L 1334 668 L 346 668 Z", "none", stroke="#9a7a4a", sw=2, op=.5))
    b.append(path("M 560 580 L 1120 580 L 1150 640 L 530 640 Z", "none", stroke="#9a7a4a", sw=1.5, op=.3))
    b.append(light_pool(900, 360, 300, 200, "redglow", .5))
    b.append(room_shading(w))
    save(os.path.join(OUT, "bg_livingroom.svg"), doc("".join(b), w, H, defs))


def kitchen():
    w = 1700
    defs = common_defs() + wallpaper_pattern("wp", "#5a6048", "#3a3e2c", "tiles")
    defs += rad_grad("under", [(0, "#ff3a1a", .7), (1, "#ff3a1a", 0)])
    b = [wall(w, "wp"), stains(w, "#2a2a10", seed=51, n=14), crown(w, "#4a4a38", "#14140c")]
    b.append(door(110, 110, 250, color="#3a2418", dark="#24150e"))
    # armários superiores
    for i in range(4):
        x = 300 + i * 132
        b.append(rect(x, 80, 124, 120, "#6a5a3a", sw=3))
        b.append(rect(x + 10, 90, 104, 100, "#5a4a2e", sw=2))
        b.append(ell(x + (100 if i % 2 else 24), 180, 4, 4, "#a08a4a", sw=1.5))
    # janela da pia
    b.append(window(560, 224, 140, 110, seed=17, curtains=("#a8a070", "#7a7448")))
    # prateleira de potes
    b.append(rect(890, 196, 190, 10, "#4a3a22", sw=2.5))
    jars = [("#8a9a5a", "ARRUDA"), ("#6a4a2a", "MIRRA"), ("#c8c0a0", "SAL"), ("#b27343", "")]
    for i, (c, lbl) in enumerate(jars):
        x = 904 + i * 44
        b.append(rect(x, 150, 34, 46, "#c8d8d8", sw=2, rx=4, op=.95))
        b.append(rect(x + 3, 166, 28, 28, c, stroke=None, rx=3, op=.9))
        b.append(rect(x + 2, 142, 30, 10, "#6a5a3a", sw=2))
        if lbl:
            b.append(rect(x + 4, 170, 26, 12, "#efe6c8", stroke=None))
            b.append(text(x + 17, 179, lbl, 5.5, "#3a2a1a", "Georgia, serif"))
    # cabelos no último pote
    for k in range(6):
        b.append(path(f"M {1040 + k * 4} 192 C {1036 + k * 5} 180 {1048 + k * 3} 172 {1042 + k * 4} 166",
                      stroke="#d89a5a", sw=1.2, op=.9))
    # calendário
    b.append(rect(1130, 150, 110, 140, "#ece6d6", sw=2.5))
    b.append(rect(1130, 150, 110, 34, "#8a2a2a", stroke=None))
    b.append(text(1185, 172, "NOVEMBRO", 11, "#f0e6d0", "Georgia, serif"))
    for r in range(5):
        for c in range(7):
            x, y = 1136 + c * 15, 194 + r * 18
            b.append(rect(x, y, 13, 15, "none", stroke="#b0a890", sw=.8))
            if r < 3 or (r == 3 and c < 4):
                b.append(line(x + 2, y + 2, x + 11, y + 13, "#3a3a3a", 1.2, .8))
    b.append(ell(1136 + 5 * 15 + 6, 194 + 4 * 18 + 8, 9, 9, "none", stroke="#c01a1a", sw=2))
    b.append(ell(1185, 146, 3, 3, "#9a9a9a", sw=1))
    # porta do porão com corrente e brilho por baixo
    bd = door(1500, 110, 244, color="#2e2016", dark="#1e140c")
    bd += path("M 1452 300 C 1480 316 1520 316 1548 300", stroke="#8a8a8a", sw=4, extra='stroke-dasharray="7 4"')
    bd += rect(1490, 302, 20, 24, "#6a6a5a", sw=2, rx=3)
    bd += path("M 1494 302 C 1494 290 1506 290 1506 302", stroke="#6a6a5a", sw=3)
    b.append(bd)
    b.append(rect(1446, 440, 108, 6, "#ff4a2a", stroke=None, op=.8))
    b.append(ell(1500, 456, 120, 30, "url(#under)", stroke=None))
    # luminária pendente sobre a mesa
    b.append(line(820, 0, 820, 150, INK, 2))
    b.append(path("M 780 190 L 860 190 L 840 150 L 800 150 Z", "#3a4a3a", sw=3))
    b.append(ell(820, 192, 12, 5, "#ffe2a8", stroke=None))
    b.append(baseboard(w, "#3a3a2a", "#1a1a10"))
    b.append(floor_tiles(w, "#1c1c18", "#5e5a4a", "#0e0e0a"))
    b.append(rect(0, FLOOR_TOP, w, H - FLOOR_TOP, "#1a1a10", stroke=None, op=.35))
    b.append(ell(820, 470, 360, 260, "url(#warm)", stroke=None, op=.55))
    b.append(room_shading(w))
    save(os.path.join(OUT, "bg_kitchen.svg"), doc("".join(b), w, H, defs))


def title_screen():
    """Fachada da casa à noite, para a tela inicial."""
    w, h = 1280, 720
    defs = (lin_grad("sky", [(0, "#04050c", 1), (.7, "#121a30", 1), (1, "#1e2238", 1)])
            + rad_grad("win", [(0, "#ffcf7a", .9), (.6, "#ff9a3a", .25), (1, "#ff9a3a", 0)])
            + rad_grad("moon", [(0, "#d8e0f0", .35), (1, "#d8e0f0", 0)])
            + lin_grad("fog", [(0, "#4a5068", 0), (1, "#4a5068", .55)]))
    rnd = random.Random(2)
    b = [rect(0, 0, w, h, "url(#sky)", stroke=None)]
    for _ in range(90):
        b.append(ell(rnd.uniform(0, w), rnd.uniform(0, 380), .9, .9, "#c8d0e8", stroke=None, op=rnd.uniform(.2, .7)))
    b.append(ell(1040, 130, 160, 160, "url(#moon)", stroke=None))
    b.append(ell(1040, 130, 34, 34, "#c8cede", stroke=None, op=.85))
    b.append(ell(1028, 122, 30, 32, "#0c1020", stroke=None, op=.9))
    # árvores secas
    for x, s in ((120, 1.2), (1180, 1), (260, .8)):
        b.append(path(f"M {x} 720 C {x + 6 * s} 600 {x - 10 * s} 520 {x} {720 - 300 * s} "
                      f"M {x} {720 - 180 * s} C {x + 40 * s} {700 - 240 * s} {x + 80 * s} {700 - 260 * s} {x + 110 * s} {700 - 300 * s} "
                      f"M {x} {720 - 230 * s} C {x - 40 * s} {700 - 270 * s} {x - 70 * s} {700 - 300 * s} {x - 90 * s} {700 - 340 * s}",
                      stroke="#020308", sw=10 * s))
    # casa
    hx, hy = 400, 230
    b.append(path(f"M {hx - 30} {hy + 60} L {hx + 240} {hy - 80} L {hx + 510} {hy + 60} Z", "#0c0a10", sw=3))
    b.append(rect(hx + 380, hy - 70, 40, 80, "#0c0a10", sw=3))
    b.append(rect(hx, hy + 60, 480, 330, "#141018", sw=3))
    for i in range(14):
        b.append(line(hx, hy + 80 + i * 22, hx + 480, hy + 80 + i * 22, "#0a080c", 2, .8))
    wins = [(hx + 60, hy + 110, True), (hx + 200, hy + 110, False), (hx + 340, hy + 110, True),
            (hx + 60, hy + 250, False), (hx + 340, hy + 250, True)]
    for x, y, lit in wins:
        b.append(rect(x, y, 80, 90, "#ffb860" if lit else "#06060a", sw=3))
        if lit:
            b.append(ell(x + 40, y + 45, 110, 110, "url(#win)", stroke=None))
        b.append(line(x + 40, y, x + 40, y + 90, "#0c0a10", 5))
        b.append(line(x, y + 45, x + 80, y + 45, "#0c0a10", 5))
    # silhueta em uma janela
    b.append(ell(hx + 380, hy + 140, 10, 12, "#1a0a08", stroke=None))
    b.append(rect(hx + 368, hy + 152, 24, 48, "#1a0a08", stroke=None))
    b.append(rect(hx + 210, hy + 250, 60, 140, "#0a0608", sw=3))
    b.append(ell(hx + 240, hy + 240, 20, 20, "url(#win)", stroke=None, op=.6))
    b.append(rect(0, 610, w, 110, "#05060a", stroke=None))
    b.append(rect(0, 470, w, 250, "url(#fog)", stroke=None))
    save(os.path.join(OUT, "title_bg.svg"), doc("".join(b), w, h, defs))


if __name__ == "__main__":
    guestroom()
    hallway()
    clara_room()
    livingroom()
    kitchen()
    title_screen()
    print("fundos gerados em", os.path.abspath(OUT))
