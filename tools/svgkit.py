"""Pequenas funções para escrever SVG à mão de forma organizada."""
import math
import os
import random

INK = "#120d12"
H = 720            # altura de todos os cômodos
WALL_BOTTOM = 446  # onde a parede encontra o rodapé
FLOOR_TOP = 466    # início do piso


def doc(body, w, h, defs="", vb=None):
    vb = vb or f"0 0 {w} {h}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}">\n'
            f"<defs>{defs}</defs>\n{body}\n</svg>\n")


def save(path, content):
    # O jogo usa PNG. Os geradores gravam os SVGs-fonte em tools/svg_originais/
    # (para virar PNG de novo, é preciso exportar — ex.: Inkscape ou navegador).
    path = os.path.abspath(path)
    marker = os.sep + "assets" + os.sep
    if marker in path and os.sep + "svg_originais" + os.sep not in path:
        head, tail = path.split(marker, 1)
        path = os.path.join(head, "tools", "svg_originais", "assets", tail)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        fh.write(content)


def grp(content, id=None, transform=None, opacity=None, extra=""):
    a = ""
    if id:
        a += f' id="{id}"'
    if transform:
        a += f' transform="{transform}"'
    if opacity is not None:
        a += f' opacity="{opacity}"'
    return f"<g{a} {extra}>{content}</g>"


def path(d, fill="none", stroke=INK, sw=3, op=None, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"' if stroke else ""
    o = f' opacity="{op}"' if op is not None else ""
    return f'<path d="{d}" fill="{fill}"{s}{o} {extra}/>'


def rect(x, y, w, h, fill, stroke=INK, sw=3, rx=0, op=None, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    o = f' opacity="{op}"' if op is not None else ""
    r = f' rx="{rx}"' if rx else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"{s}{r}{o} {extra}/>'


def ell(cx, cy, rx, ry, fill, stroke=INK, sw=3, op=None, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    o = f' opacity="{op}"' if op is not None else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"{s}{o} {extra}/>'


def line(x1, y1, x2, y2, stroke=INK, sw=2, op=None):
    o = f' opacity="{op}"' if op is not None else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round"{o}/>'


def text(x, y, s, size=14, fill=INK, family="Georgia, serif", anchor="middle", extra=""):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-family="{family}" '
            f'text-anchor="{anchor}" {extra}>{s}</text>')


def lin_grad(id, stops, x1=0, y1=0, x2=0, y2=1):
    st = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<linearGradient id="{id}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{st}</linearGradient>'


def rad_grad(id, stops, cx=.5, cy=.5, r=.5):
    st = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{id}" cx="{cx}" cy="{cy}" r="{r}">{st}</radialGradient>'


# ---------------------------------------------------------------------------
# Peças de cenário reutilizáveis
# ---------------------------------------------------------------------------

def floor_planks(w, base, dark, seam, vanish_x=None, seed=1):
    """Piso de tábuas com leve perspectiva (linhas convergindo para o fundo)."""
    rnd = random.Random(seed)
    vx = vanish_x if vanish_x is not None else w / 2
    out = [rect(0, FLOOR_TOP, w, H - FLOOR_TOP, base, stroke=None)]
    # faixas horizontais mais finas no fundo, mais largas na frente
    y = FLOOR_TOP
    step = 12
    i = 0
    while y < H:
        y2 = y + step
        if i % 2:
            out.append(rect(0, y, w, step, dark, stroke=None, op=.35))
        out.append(line(0, y, w, y, seam, 1.4, .55))
        y = y2
        step *= 1.22
        i += 1
    # tábuas convergentes
    x = -400
    while x < w + 400:
        xb = vx + (x - vx) * 2.1
        out.append(line(x, FLOOR_TOP, xb, H, seam, 1.6, .5))
        x += 70 + rnd.randint(-6, 6)
    # escurecimento no fundo (junto à parede)
    return "".join(out)


def floor_tiles(w, c1, c2, seam):
    """Piso xadrez em perspectiva (cozinha)."""
    out = [rect(0, FLOOR_TOP, w, H - FLOOR_TOP, c1, stroke=None)]
    vx = w / 2
    rows = []
    y = FLOOR_TOP
    step = 26
    while y < H:
        rows.append((y, min(H, y + step)))
        y += step
        step *= 1.18
    cols = list(range(-1200, w + 1200, 80))
    for r, (ya, yb) in enumerate(rows):
        ta = (ya - FLOOR_TOP) / (H - FLOOR_TOP)
        tb = (yb - FLOOR_TOP) / (H - FLOOR_TOP)
        for c in range(len(cols) - 1):
            if (r + c) % 2:
                continue
            xa0 = vx + (cols[c] - vx) * (1 + 1.1 * ta)
            xa1 = vx + (cols[c + 1] - vx) * (1 + 1.1 * ta)
            xb0 = vx + (cols[c] - vx) * (1 + 1.1 * tb)
            xb1 = vx + (cols[c + 1] - vx) * (1 + 1.1 * tb)
            out.append(path(f"M {xa0:.1f} {ya:.1f} L {xa1:.1f} {ya:.1f} L {xb1:.1f} {yb:.1f} L {xb0:.1f} {yb:.1f} Z",
                            c2, stroke=seam, sw=1, op=.95))
    return "".join(out)


def baseboard(w, color, shade):
    return (rect(0, WALL_BOTTOM - 4, w, FLOOR_TOP - WALL_BOTTOM + 4, color, sw=2.5)
            + rect(0, FLOOR_TOP - 7, w, 7, shade, stroke=None)
            + line(0, WALL_BOTTOM + 3, w, WALL_BOTTOM + 3, "#ffffff", 1.2, .12))


def crown(w, color, shade):
    return (rect(0, 0, w, 34, shade, stroke=None)
            + rect(0, 30, w, 14, color, sw=2.5)
            + line(0, 48, w, 48, INK, 1.5, .5))


def wallpaper_pattern(id, bg, fg, kind="stripes", accent=None):
    if kind == "stripes":
        body = (rect(0, 0, 40, 40, bg, stroke=None) + rect(0, 0, 6, 40, fg, stroke=None, op=.5)
                + rect(20, 0, 2, 40, fg, stroke=None, op=.35)
                + (ell(31, 20, 2.5, 3.5, accent, stroke=None, op=.45) if accent else ""))
        return f'<pattern id="{id}" width="40" height="40" patternUnits="userSpaceOnUse">{body}</pattern>'
    if kind == "damask":
        d = "M 30 6 C 38 16 44 22 30 34 C 16 22 22 16 30 6 Z M 30 34 C 34 40 40 44 30 54 C 20 44 26 40 30 34 Z"
        body = (rect(0, 0, 60, 60, bg, stroke=None) + path(d, fg, stroke=None, op=.55)
                + ell(0, 0, 4, 4, fg, stroke=None, op=.5) + ell(60, 0, 4, 4, fg, stroke=None, op=.5)
                + ell(0, 60, 4, 4, fg, stroke=None, op=.5) + ell(60, 60, 4, 4, fg, stroke=None, op=.5))
        return f'<pattern id="{id}" width="60" height="60" patternUnits="userSpaceOnUse">{body}</pattern>'
    if kind == "flowers":
        body = (rect(0, 0, 48, 48, bg, stroke=None)
                + "".join(ell(12 + math.cos(a) * 4, 12 + math.sin(a) * 4, 3, 3, fg, stroke=None, op=.55)
                          for a in [i * math.pi * 2 / 5 for i in range(5)])
                + ell(12, 12, 2, 2, accent or fg, stroke=None, op=.8)
                + ell(36, 36, 2.2, 2.2, fg, stroke=None, op=.4))
        return f'<pattern id="{id}" width="48" height="48" patternUnits="userSpaceOnUse">{body}</pattern>'
    if kind == "tiles":
        body = (rect(0, 0, 36, 36, bg, stroke=None) + rect(0.5, 0.5, 35, 35, "none", stroke=fg, sw=1.2)
                + rect(3, 3, 12, 5, "#ffffff", stroke=None, op=.07))
        return f'<pattern id="{id}" width="36" height="36" patternUnits="userSpaceOnUse">{body}</pattern>'
    raise ValueError(kind)


def stains(w, color, seed=3, n=8):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        x = rnd.uniform(40, w - 40)
        y = rnd.uniform(60, 380)
        rx = rnd.uniform(20, 70)
        out.append(ell(x, y, rx, rx * rnd.uniform(.6, 1.6), color, stroke=None, op=rnd.uniform(.08, .18)))
        # escorrido
        if rnd.random() < .5:
            out.append(rect(x - 2, y, 4, rnd.uniform(30, 120), color, stroke=None, op=.1))
    return "".join(out)


def door(x, w=120, h=250, color="#3a2418", dark="#24150e", knob="#b0904a", open_=False, sign=None):
    """Porta em parede. x = centro."""
    y = WALL_BOTTOM - h
    l = x - w / 2
    out = [rect(l - 12, y - 12, w + 24, h + 12, "#2a1c14", sw=3)]
    if open_:
        out.append(rect(l, y, w, h, "#050306", sw=3))
    else:
        out.append(rect(l, y, w, h, color, sw=3))
        out.append(rect(l + 14, y + 16, w - 28, h * .38, dark, sw=2))
        out.append(rect(l + 14, y + 26 + h * .38, w - 28, h * .46, dark, sw=2))
        out.append(ell(l + w - 18, y + h * .55, 6, 6, knob, sw=2))
        out.append(rect(l + w - 22, y + h * .55 + 8, 8, 14, "#2a2016", sw=1.5))
        out.append(rect(l, y, w, h, "url(#doorshade)", stroke=None))
    if sign:
        out.append(sign)
    return "".join(out)


def arch(x, w=170, h=280, inner="#060408"):
    y = WALL_BOTTOM - h
    l = x - w / 2
    d = f"M {l} {WALL_BOTTOM} L {l} {y + 60} C {l} {y} {l + w} {y} {l + w} {y + 60} L {l + w} {WALL_BOTTOM} Z"
    d2 = (f"M {l - 14} {WALL_BOTTOM} L {l - 14} {y + 56} C {l - 14} {y - 16} {l + w + 14} {y - 16} {l + w + 14} {y + 56} "
          f"L {l + w + 14} {WALL_BOTTOM} Z")
    return path(d2, "#2a1c14", sw=3) + path(d, inner, sw=3) + path(d, "url(#archdepth)", stroke=None)


def frame(x, y, w, h, inner, frame_color="#5a4428", sw=3):
    return (rect(x - 8, y - 8, w + 16, h + 16, frame_color, sw=sw)
            + rect(x - 8, y - 8, w + 16, h + 16, "url(#frameshine)", stroke=None)
            + rect(x, y, w, h, "#1a1410", sw=2) + inner)


def window(x, y, w, h, night="#0f1830", frame_color="#3a2c22", boarded=False, curtains=None, rain=True, seed=4):
    rnd = random.Random(seed)
    out = [rect(x - 10, y - 10, w + 20, h + 20, frame_color, sw=3),
           rect(x, y, w, h, "url(#nightsky)", sw=2)]
    if rain:
        for _ in range(int(w * h / 600)):
            rx = rnd.uniform(x + 4, x + w - 4)
            ry = rnd.uniform(y + 4, y + h - 20)
            out.append(line(rx, ry, rx - 2, ry + rnd.uniform(8, 18), "#9ab0d8", 1, .35))
    # árvore lá fora
    out.append(path(f"M {x + w * .7} {y + h} C {x + w * .72} {y + h * .6} {x + w * .64} {y + h * .4} {x + w * .5} {y + h * .2} "
                    f"M {x + w * .68} {y + h * .55} C {x + w * .8} {y + h * .4} {x + w * .9} {y + h * .35} {x + w} {y + h * .3}",
                    stroke="#05070e", sw=6, op=.9))
    out.append(line(x + w / 2, y, x + w / 2, y + h, frame_color, 6))
    out.append(line(x, y + h / 2, x + w, y + h / 2, frame_color, 6))
    out.append(rect(x - 16, y + h + 8, w + 32, 12, frame_color, sw=2.5))
    if boarded:
        for i, (a, b) in enumerate([(.18, .12), (.48, .55), (.8, .86)]):
            yy = y + h * a
            out.append(path(f"M {x - 18} {yy} L {x + w + 18} {y + h * b} L {x + w + 18} {y + h * b + 26} L {x - 18} {yy + 26} Z",
                            "#5a4630", sw=2.5))
            out.append(path(f"M {x - 18} {yy + 9} L {x + w + 18} {y + h * b + 9}", stroke="#3a2c1e", sw=1.5, op=.7))
            for nx in (x - 8, x + w + 8):
                ny = yy + 13 + (y + h * b - yy) * ((nx - x + 18) / (w + 36))
                out.append(ell(nx, ny, 2.5, 2.5, "#8a8a8a", sw=1))
    if curtains:
        c, cd = curtains
        out.append(path(f"M {x - 30} {y - 24} L {x + w * .22} {y - 24} C {x + w * .18} {y + h * .5} {x + w * .1} {y + h} {x + w * .2} {y + h + 30} "
                        f"L {x - 34} {y + h + 34} Z", c, sw=3))
        out.append(path(f"M {x + w + 30} {y - 24} L {x + w * .78} {y - 24} C {x + w * .82} {y + h * .5} {x + w * .9} {y + h} {x + w * .8} {y + h + 30} "
                        f"L {x + w + 34} {y + h + 34} Z", c, sw=3))
        for k in (.04, .12):
            out.append(line(x + w * k - 10, y - 20, x + w * k - 16, y + h + 26, cd, 3, .7))
            out.append(line(x + w * (1 - k) + 10, y - 20, x + w * (1 - k) + 16, y + h + 26, cd, 3, .7))
        out.append(rect(x - 40, y - 32, w + 80, 9, "#2a2018", sw=2, rx=4))
    return "".join(out)


def light_pool(cx, cy, rx, ry, color, op=.55, id_="warm"):
    return ell(cx, cy, rx, ry, f"url(#{id_})", stroke=None, op=op)


def common_defs():
    return (
        lin_grad("doorshade", [(0, "#000", .0), (.7, "#000", .1), (1, "#000", .45)], 0, 0, 1, 0)
        + lin_grad("archdepth", [(0, "#1a1218", .5), (1, "#000", 0)], 0, 0, 0, 1)
        + lin_grad("frameshine", [(0, "#fff", .18), (.5, "#fff", 0), (1, "#000", .3)], 0, 0, 1, 1)
        + lin_grad("nightsky", [(0, "#0a1024", 1), (1, "#1e2c4c", 1)])
        + lin_grad("ceilingdark", [(0, "#000", .75), (1, "#000", 0)])
        + lin_grad("floordark", [(0, "#000", .55), (.35, "#000", .1), (1, "#000", .35)])
        + rad_grad("warm", [(0, "#ffcf8a", .55), (.5, "#ff9f4a", .18), (1, "#ff9f4a", 0)])
        + rad_grad("cold", [(0, "#8aa8ff", .35), (1, "#3a4a8a", 0)])
        + rad_grad("redglow", [(0, "#ff5a4a", .4), (1, "#ff2a1a", 0)])
    )


def room_shading(w):
    """Escurecimento geral: teto, cantos e junção parede/piso."""
    return (rect(0, 0, w, 160, "url(#ceilingdark)", stroke=None)
            + rect(0, FLOOR_TOP, w, H - FLOOR_TOP, "url(#floordark)", stroke=None)
            + rect(0, 0, 60, H, "#000", stroke=None, op=.35)
            + rect(w - 60, 0, 60, H, "#000", stroke=None, op=.35))
