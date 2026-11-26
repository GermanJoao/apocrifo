#!/usr/bin/env python3
"""
Gerador dos SVGs de personagens de Apócrifo.

Cada personagem é desenhado por partes (pernas, tronco, braços, cabeça) e os
quadros de animação são produzidos girando/deslocando essas partes.
O resultado são arquivos .svg independentes em assets/characters/.

Uso:  python3 tools/gen_characters.py
(Não é necessário para rodar o jogo; só para regenerar a arte.)
ATENÇÃO: rodar de novo sobrescreve os SVGs de personagens.
"""
import math
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "characters")
INK = "#0d0a10"
VIEW_W, VIEW_H = 240, 424
VIEW_Y = -24  # espaço extra acima da cabeça; os pés ficam em y=392


def svg_doc(body, vb=f"0 {VIEW_Y} {VIEW_W} {VIEW_H}", w=VIEW_W, h=VIEW_H, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}">\n'
            f'<defs>{defs}</defs>\n{body}\n</svg>\n')


def g(content, transform=None, extra=""):
    t = f' transform="{transform}"' if transform else ""
    return f"<g{t} {extra}>{content}</g>"


def p(d, fill, stroke=INK, sw=4, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"' if stroke else ""
    return f'<path d="{d}" fill="{fill}"{s} {extra}/>'


def line(d, sw=2.5, color=INK, op=1):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" opacity="{op}"/>'


def ell(cx, cy, rx, ry, fill, stroke=INK, sw=4, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"{s} {extra}/>'


def clipped(clip_id, shape_d, content):
    """Desenha 'content' recortado pela forma (para sombreamento cel)."""
    return (f'<clipPath id="{clip_id}"><path d="{shape_d}"/></clipPath>'
            f'<g clip-path="url(#{clip_id})">{content}</g>')


def outlined(shapes_fill, shapes_outline, sw=8):
    """Duas passadas: contorno grosso por baixo, preenchimento por cima.
    Isso funde partes sobrepostas (coxa+canela) em uma silhueta limpa."""
    outline = "".join(f'<path d="{d}" fill="{INK}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round"/>'
                      for d in shapes_outline)
    return outline + shapes_fill


# ---------------------------------------------------------------------------
# ARTHUR
# ---------------------------------------------------------------------------
A = dict(
    hair="#b27343", hair_dk="#8a5430", hair_lt="#cf8f58",
    skin="#d8ad8e", skin_dk="#b98a6e",
    jacket="#24104f", jacket_dk="#160830", jacket_lt="#341a6e",
    hood="#3a1d74", cuff="#3a1d74",
    shirt="#776868", shirt_dk="#5c4f50", button="#8c84b8",
    pants="#244789", pants_dk="#1a3468", pants_lt="#3160ad",
    shoe="#4a0d1a", shoe_dk="#2a0510", shoe_lt="#6e1a2c",
    eye="#3b1d06",
)

THIGH = 64
SHIN = 76

THIGH_D = "M -21 -10 C -24 20 -22 48 -19 70 L 19 70 C 22 46 23 20 21 -10 Z"
SHIN_D = "M -20 -6 C -22 24 -24 50 -24 68 C -24 78 -14 82 0 82 C 14 82 25 78 25 68 C 25 48 22 22 20 -6 Z"
SHOE_D = "M -18 -4 C -20 6 -20 12 -16 15 L 36 15 C 42 15 42 6 36 3 C 26 -2 14 -6 2 -7 Z"


def arthur_leg(hip, thigh_a, knee_a, shoe_a, uid, back=False):
    """Perna com calça larga e sapato vinho. Ângulos em graus."""
    pants = A["pants_dk"] if back else A["pants"]
    pants_dk = "#142a55" if back else A["pants_dk"]
    shoe = A["shoe_dk"] if back else A["shoe"]
    # passada de contorno
    outline = (f'<g transform="translate({hip[0]},{hip[1]}) rotate({thigh_a})">'
               f'<path d="{THIGH_D}" fill="{INK}" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/>'
               f'<g transform="translate(0,{THIGH}) rotate({knee_a})">'
               f'<path d="{SHIN_D}" fill="{INK}" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/>'
               f'<g transform="translate(0,{SHIN}) rotate({shoe_a})"><path d="{SHOE_D}" fill="{INK}" stroke="{INK}" stroke-width="8" stroke-linejoin="round"/></g>'
               f'</g></g>')
    fill = (f'<g transform="translate({hip[0]},{hip[1]}) rotate({thigh_a})">'
            f'<path d="{THIGH_D}" fill="{pants}"/>'
            f'<path d="M -21 -10 C -24 20 -22 48 -19 70 L -8 70 C -11 44 -12 20 -10 -10 Z" fill="{pants_dk}" opacity=".7"/>'
            f'<g transform="translate(0,{THIGH}) rotate({knee_a})">'
            f'<path d="{SHIN_D}" fill="{pants}"/>'
            f'<path d="M -20 -6 C -22 24 -24 50 -24 68 C -24 76 -18 80 -10 81 C -12 60 -11 24 -8 -6 Z" fill="{pants_dk}" opacity=".7"/>'
            + line("M 4 6 C 8 26 6 44 9 60", 2.2, INK, .55)
            + line("M -12 62 C -4 66 6 66 16 62", 2, INK, .45)
            + f'<g transform="translate(0,{SHIN}) rotate({shoe_a})">'
            f'<path d="{SHOE_D}" fill="{shoe}"/>'
            f'<path d="M 4 -4 C 18 -2 30 1 37 5" fill="none" stroke="{A["shoe_lt"]}" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
            f'<path d="M -17 11 L 38 11" stroke="{A["shoe_dk"]}" stroke-width="4"/>'
            f'</g></g></g>')
    return outline + fill


SLEEVE_D = "M -15 -8 C -20 26 -22 62 -20 92 L 16 92 C 18 62 17 26 13 -8 Z"
CUFF_D = "M -21 88 C -22 96 -21 104 -20 108 L 17 108 C 18 102 18 95 17 88 Z"


def arthur_arm(shoulder, angle, uid, back=False):
    j = A["jacket_dk"] if back else A["jacket"]
    cuff = "#2a1458" if back else A["cuff"]
    skin = A["skin_dk"] if back else A["skin"]
    inner = (
        p(SLEEVE_D, j, sw=4)
        + clipped(f"sl{uid}", SLEEVE_D, f'<rect x="-30" y="-10" width="18" height="110" fill="{A["jacket_dk"]}" opacity=".8"/>')
        + line("M 2 30 C 0 50 3 66 1 84", 2, INK, .5)
        + ell(-1, 120, 13, 12, skin, sw=4)
        + p(CUFF_D, cuff, sw=4)
        + ell(-11, 98, 3.2, 2.6, A["button"], sw=1.8)
    )
    return g(inner, f"translate({shoulder[0]},{shoulder[1]}) rotate({angle})")


TORSO_D = ("M 94 108 C 80 116 74 146 74 178 C 74 208 76 232 80 246 C 98 252 120 254 140 252 "
           "C 152 250 160 246 163 242 C 164 202 162 152 158 124 C 152 112 142 106 130 104 L 104 104 Z")
SHIRT_D = "M 122 104 C 120 140 122 204 124 252 L 147 250 C 146 204 146 152 149 108 C 140 104 130 103 122 104 Z"


def arthur_torso(uid, dy=0):
    shade = (f'<path d="M 60 100 L 100 100 C 92 150 94 210 100 260 L 60 260 Z" fill="{A["jacket_dk"]}" opacity=".85"/>'
             f'<path d="M 150 100 C 156 150 158 210 156 260 L 180 260 L 180 100 Z" fill="{A["jacket_dk"]}" opacity=".6"/>')
    buttons = "".join(ell(136 + (i % 2) * .6, 122 + i * 19, 3.4, 4.2, A["button"], sw=2) for i in range(7))
    body = (
        p(TORSO_D, A["jacket"], sw=4.5)
        + clipped(f"to{uid}", TORSO_D, shade
                  + p(SHIRT_D, A["shirt"], sw=3.5)
                  + f'<path d="M 140 108 C 138 160 140 210 141 252 L 148 252 L 149 108 Z" fill="{A["shirt_dk"]}"/>'
                  + buttons
                  + line("M 84 238 C 104 246 130 248 160 240", 2.5, INK, .55))
        # bainha / bolso
        + line("M 92 196 C 100 200 110 200 118 196", 2.2, INK, .5)
        # gola alta da camisa
        + p("M 114 98 C 113 106 114 112 116 116 L 146 116 C 148 110 148 104 146 98 Z", A["shirt"], sw=3.5)
        + ell(131, 108, 3.6, 3.6, A["button"], sw=2)
        # cordões do capuz
        + line("M 118 118 C 116 132 118 142 116 154", 2.4, INK)
        + line("M 150 118 C 152 132 150 140 152 150", 2.4, INK)
    )
    return g(body, f"translate(0,{dy})")


def arthur_hood(dy=0):
    d = ("M 92 116 C 80 110 78 94 88 86 C 96 80 108 84 114 92 C 116 100 114 110 112 118 "
         "C 106 124 98 122 92 116 Z")
    d2 = "M 146 92 C 158 88 166 98 164 112 C 162 122 154 126 148 122 C 150 112 150 102 146 92 Z"
    return g(p(d, A["hood"], sw=4) + line("M 92 96 C 98 100 104 108 104 116", 2, INK, .6)
             + p(d2, A["hood"], sw=4), f"translate(0,{dy})")


FACE_D = ("M 88 42 C 84 58 86 76 96 88 C 104 96 114 100 124 100 C 134 99 144 92 149 80 "
          "C 153 70 154 56 152 42 Z")

# silhueta do cabelo bagunçado (pontas e vales)
HAIR_PTS = [
    (84, 58), (74, 50), (82, 44), (70, 34), (82, 30), (76, 18), (90, 20), (92, 6), (104, 14),
    (112, 0), (120, 12), (134, 2), (138, 14), (152, 8), (150, 20), (164, 22), (156, 32),
    (168, 40), (156, 44), (160, 56), (150, 52), (148, 62), (142, 50), (136, 58), (130, 46),
    (124, 56), (118, 44), (110, 54), (104, 44), (98, 56), (94, 46), (90, 60),
]


def smooth_poly(pts):
    d = f"M {pts[0][0]} {pts[0][1]} "
    for i in range(1, len(pts)):
        x0, y0 = pts[i - 1]
        x1, y1 = pts[i]
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        d += f"Q {x0} {y0} {mx:.1f} {my:.1f} " if i > 1 else ""
    d += f"L {pts[-1][0]} {pts[-1][1]} Z"
    return d


def jagged(pts):
    return "M " + " L ".join(f"{x} {y}" for x, y in pts) + " Z"


HAIR_D = jagged(HAIR_PTS)


def arthur_head(uid, eyes="open", dy=0, tilt=0, expr="neutral"):
    parts = []
    # orelha (lado de trás)
    parts.append(ell(86, 64, 9, 13, A["skin"], sw=4))
    parts.append(line("M 86 58 C 82 62 84 68 88 70", 2, INK, .6))
    # rosto
    parts.append(p(FACE_D, A["skin"], sw=4.5))
    parts.append(clipped(f"fc{uid}", FACE_D,
                         f'<path d="M 80 40 C 88 60 92 82 112 102 L 70 110 Z" fill="{A["skin_dk"]}" opacity=".55"/>'
                         f'<path d="M 90 40 L 160 40 L 160 54 C 140 58 110 58 90 54 Z" fill="{A["skin_dk"]}" opacity=".5"/>'))
    # olhos
    if eyes == "open":
        wide = expr == "worried"
        ry = 6 if wide else 4.6
        for cx, rx in ((108, 8), (137, 6.5)):
            parts.append(ell(cx, 64, rx, ry, "#f1e6dc", stroke=None))
            parts.append(ell(cx + 1.5, 64.5, rx * .6, ry * .95, A["eye"], stroke=None))
            parts.append(ell(cx + 3, 62.5, 1.6, 1.6, "#ffffff", stroke=None))
            # pálpebra pesada (olhar cansado)
            lid_y = 58.5 if wide else 60.5
            parts.append(line(f"M {cx - rx - 1} {lid_y + 1.5} C {cx - 2} {lid_y - 1.5} {cx + 2} {lid_y - 1.5} {cx + rx + 1.5} {lid_y + 1}", 3.2))
            parts.append(line(f"M {cx - rx + 1} {69} C {cx} {70.5} {cx + rx - 1} {69.5} {cx + rx} {68.5}", 1.4, INK, .5))
    else:
        for cx, rx in ((108, 8), (137, 6.5)):
            parts.append(line(f"M {cx - rx} 64 C {cx - 3} 67 {cx + 3} 67 {cx + rx} 64", 3))
    # sobrancelhas (preocupadas)
    if expr == "worried":
        parts.append(line("M 98 52 C 104 49 110 50 116 54", 2.6))
        parts.append(line("M 130 53 C 135 49 140 48 145 50", 2.6))
    # nariz e boca
    parts.append(line("M 147 75 C 150 78 149 81 145 82", 2.2, INK, .8))
    if expr == "worried":
        parts.append(line("M 122 89 C 127 87 131 87 135 89", 2.4))
    else:
        parts.append(line("M 123 88 C 128 89 132 89 136 87", 2.4))
    # óculos
    parts.append(f'<rect x="96" y="54" width="25" height="19" rx="5" fill="#cfe0ff" fill-opacity=".14" stroke="#1b1522" stroke-width="2.8"/>')
    parts.append(f'<rect x="128" y="55" width="20" height="18" rx="5" fill="#cfe0ff" fill-opacity=".14" stroke="#1b1522" stroke-width="2.8"/>')
    parts.append(line("M 121 61 C 124 58 126 58 128 61", 2.4, "#1b1522"))
    parts.append(line("M 96 60 L 88 58", 2.4, "#1b1522"))
    parts.append(line("M 101 57 L 106 70", 1.6, "#ffffff", .35))
    parts.append(line("M 133 58 L 137 70", 1.6, "#ffffff", .3))
    # cabelo
    parts.append(p(HAIR_D, A["hair"], sw=4.5))
    parts.append(clipped(f"hr{uid}", HAIR_D,
                         f'<path d="M 60 0 L 100 0 C 92 20 90 40 96 66 L 60 66 Z" fill="{A["hair_dk"]}" opacity=".8"/>'
                         + line("M 112 12 C 118 22 120 32 118 44", 3, A["hair_lt"], .9)
                         + line("M 134 10 C 138 20 140 28 138 40", 3, A["hair_lt"], .8)
                         + line("M 150 22 C 154 30 154 38 150 46", 2.6, A["hair_lt"], .7)))
    parts.append(line("M 104 30 C 108 38 108 46 104 52", 2, INK, .6))
    parts.append(line("M 126 28 C 130 36 130 44 128 50", 2, INK, .6))
    parts.append(line("M 144 30 C 146 38 146 44 144 50", 2, INK, .55))
    return g("".join(parts), f"translate(0,{dy}) rotate({tilt} 118 100) translate(118 102) scale(1.16) translate(-118 -102)")


def arthur_neck(dy=0):
    return g(p("M 110 86 L 110 104 L 130 104 L 130 88 Z", A["skin_dk"], sw=3.5), f"translate(0,{dy})")


def arthur_frame(uid, thigh_f=0.0, thigh_b=0.0, knee_f=0.0, knee_b=0.0, arm_f=0.0, arm_b=0.0,
                 body_dy=0.0, breath=0.0, eyes="open", expr="neutral", tilt=0.0):
    """Monta um quadro completo do Arthur (virado para a direita)."""
    hip_f = (130, 234 + body_dy)
    hip_b = (106, 232 + body_dy)

    def shoe_angle(th, kn):
        return -(th + kn) * 0.9

    upper = body_dy + breath
    parts = [
        arthur_arm((150, 122 + upper), arm_b, uid + "b", back=True),
        arthur_leg(hip_b, thigh_b, knee_b, shoe_angle(thigh_b, knee_b), uid + "b", back=True),
        arthur_leg(hip_f, thigh_f, knee_f, shoe_angle(thigh_f, knee_f), uid + "f"),
        arthur_neck(upper),
        arthur_hood(upper),
        arthur_torso(uid, upper),
        arthur_head(uid, eyes, upper + breath * 0.4, tilt, expr),
        arthur_arm((90, 124 + upper), arm_f, uid + "f"),
    ]
    return "".join(parts)


def leg_foot_y(hip_y, th, kn):
    """Altura do tornozelo dado ângulos (graus)."""
    a1 = math.radians(th)
    a2 = math.radians(th + kn)
    return hip_y + THIGH * math.cos(a1) + SHIN * math.cos(a2)


def build_arthur():
    out = os.path.join(ROOT, "arthur")
    os.makedirs(out, exist_ok=True)
    rest_ankle = 234 + THIGH + SHIN
    # Caminhada: 8 quadros
    n = 8
    for i in range(n):
        t = 2 * math.pi * i / n
        th_f = 24 * math.sin(t)
        th_b = 24 * math.sin(t + math.pi)
        # o joelho dobra quando a perna está passando para frente
        # (coxa positiva = perna para trás; a perna dobra enquanto volta para frente)
        kn_f = max(0.0, -40 * math.cos(t - 0.25))
        kn_b = max(0.0, -40 * math.cos(t + math.pi - 0.25))
        foot_f = leg_foot_y(234, th_f, kn_f)
        foot_b = leg_foot_y(232, th_b, kn_b)
        dy = rest_ankle - max(foot_f, foot_b)
        arm_f = -18 * math.sin(t)
        arm_b = 14 * math.sin(t)
        body = arthur_frame(f"w{i}", th_f, th_b, kn_f, kn_b, arm_f, arm_b, body_dy=dy, tilt=1.5)
        with open(os.path.join(out, f"arthur_walk_{i}.svg"), "w") as fh:
            fh.write(svg_doc(body))
    # Repouso: 4 quadros de respiração + 1 piscada
    for i, b in enumerate([0, 0.8, 1.6, 0.8]):
        body = arthur_frame(f"i{i}", 0, 0, 0, 0, 3, -3, 0, b)
        with open(os.path.join(out, f"arthur_idle_{i}.svg"), "w") as fh:
            fh.write(svg_doc(body))
    body = arthur_frame("blink", 0, 0, 0, 0, 3, -3, 0, 0.8, eyes="closed")
    with open(os.path.join(out, "arthur_blink.svg"), "w") as fh:
        fh.write(svg_doc(body))
    # Retratos
    for expr in ("neutral", "worried"):
        body = arthur_frame("p" + expr, 0, 0, 0, 0, 3, -3, 0, 0, expr=expr)
        write_portrait(os.path.join(out, f"arthur_portrait_{expr}.svg"), body, "62 -22 122 128", "#2a1850")


def write_portrait(path, body, vb, glow):
    x, y, w, h = (float(v) for v in vb.split())
    bg = (f'<radialGradient id="pg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="{glow}"/>'
          f'<stop offset="1" stop-color="#07050a"/></radialGradient>')
    body = (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#pg)"/>' + body)
    with open(path, "w") as fh:
        fh.write(svg_doc(body, vb=vb, w=256, h=int(256 * h / w), defs=bg))


# ---------------------------------------------------------------------------
# CLARA — a filha mais velha
# ---------------------------------------------------------------------------
C = dict(hair="#241a22", hair_lt="#3e2e3c", skin="#e6c8b4", skin_dk="#c9a690",
         cardigan="#5f7a6a", cardigan_dk="#465d50", dress="#5a1e2a", dress_dk="#3e1420",
         collar="#e2dccd", sock="#e8e2d6", shoe="#17121a", eye="#1a0f14")


def clara_body(uid, eyes="open", expr="smile", breath=0.0):
    parts = []
    b = breath
    # cabelo de trás (longo)
    hair_back = "M 82 52 C 70 100 72 170 80 196 L 158 196 C 166 160 166 96 156 50 Z"
    parts.append(p(hair_back, C["hair"], sw=4.5))
    # pernas (meias) e sapatos
    for x, sh in ((104, 0), (128, 2)):
        parts.append(p(f"M {x} 270 L {x} 372 L {x + 16} 372 L {x + 16} 270 Z", C["sock"], sw=4))
        parts.append(p(f"M {x - 4} 368 C {x - 6} 380 {x - 4} 388 {x} 390 L {x + 30 + sh} 390 C {x + 34 + sh} 384 {x + 30} 374 {x + 18} 368 Z", C["shoe"], sw=4))
        parts.append(line(f"M {x + 2} 366 L {x + 18} 366", 2, INK, .6))
    # saia
    skirt = "M 86 214 C 82 240 80 262 78 286 C 100 294 140 294 162 286 C 160 262 158 238 154 214 Z"
    parts.append(p(skirt, C["dress"], sw=4.5))
    parts.append(clipped(f"sk{uid}", skirt, f'<rect x="70" y="200" width="30" height="100" fill="{C["dress_dk"]}"/>'
                         + line("M 112 222 L 108 290", 2, INK, .45) + line("M 134 222 L 138 290", 2, INK, .45)))
    # tronco: cardigã
    torso = "M 92 112 C 82 130 80 170 84 220 L 156 220 C 160 170 158 130 148 112 C 136 104 104 104 92 112 Z"
    parts.append(g(p(torso, C["cardigan"], sw=4.5)
                   + clipped(f"ct{uid}", torso, f'<rect x="76" y="100" width="22" height="130" fill="{C["cardigan_dk"]}"/>'
                             + p("M 112 108 L 122 150 L 132 108 Z", C["collar"], sw=3)
                             + "".join(ell(122, 160 + i * 18, 3, 3, "#d8cfbc", sw=1.6) for i in range(3))
                             + line("M 122 150 L 122 220", 2, INK, .6)
                             + "".join(line(f"M {x} 116 L {x} 218", 1.2, INK, .18) for x in range(90, 156, 7))),
                   f"translate(0,{b})"))
    # gola de renda
    parts.append(g(p("M 104 108 C 108 118 118 122 122 116 C 126 122 136 118 140 108 C 130 104 114 104 104 108 Z", C["collar"], sw=3),
                   f"translate(0,{b})"))
    # braços com mãos juntas na frente
    parts.append(g(p("M 92 120 C 84 150 86 186 100 206 L 116 200 C 104 182 100 156 104 128 Z", C["cardigan"], sw=4)
                   + p("M 148 120 C 156 150 154 186 140 206 L 124 200 C 136 182 140 156 136 128 Z", C["cardigan_dk"], sw=4)
                   + ell(120, 206, 15, 10, C["skin"], sw=4)
                   + line("M 112 204 C 118 208 124 208 130 204", 1.8, INK, .6),
                   f"translate(0,{b})"))
    # cabeça
    face = "M 92 40 C 88 62 92 82 104 94 C 112 100 126 102 136 96 C 146 88 152 72 150 42 Z"
    head = [ell(120, 100, 9, 10, C["skin_dk"], sw=3.5), p(face, C["skin"], sw=4.5)]
    if eyes == "open":
        for cx, rx in ((110, 8.5), (138, 7)):
            head.append(ell(cx, 66, rx, 7.5, "#f3ece6", stroke=INK, sw=2.2))
            pr = 5.6 if expr == "stare" else 4.8
            head.append(ell(cx + 1, 67, pr, pr + .8, C["eye"], stroke=None))
            head.append(ell(cx + 3, 64.5, 1.8, 1.8, "#fff", stroke=None))
            head.append(line(f"M {cx - rx - 1} 63 C {cx - 3} 56 {cx + 3} 56 {cx + rx + 2} 62", 3))
            head.append(line(f"M {cx + rx} 60 L {cx + rx + 4} 57", 2))
    else:
        for cx, rx in ((110, 8.5), (138, 7)):
            head.append(line(f"M {cx - rx} 66 C {cx - 3} 70 {cx + 3} 70 {cx + rx} 66", 3))
    head.append(ell(104, 80, 6, 3.4, "#e39a98", stroke=None, extra='opacity=".45"'))
    head.append(ell(142, 80, 4.5, 3, "#e39a98", stroke=None, extra='opacity=".45"'))
    head.append(line("M 144 72 C 146 76 146 78 143 80", 2, INK, .7))
    if expr == "smile":
        head.append(line("M 118 87 C 124 92 132 91 136 86", 2.6))
    else:
        head.append(line("M 121 89 C 126 89.5 130 89.5 134 88.5", 2.4))
    # franja reta e cabelo da frente
    bangs = ("M 86 58 C 82 30 96 10 120 8 C 144 8 158 24 156 56 L 150 56 L 150 48 L 140 50 L 140 46 "
             "L 128 50 L 126 44 L 114 50 L 110 44 L 100 50 L 96 46 L 92 56 Z")
    head.append(p(bangs, C["hair"], sw=4.5))
    head.append(line("M 104 16 C 116 12 132 12 144 20", 3, C["hair_lt"], .9))
    head.append(p("M 86 56 C 82 90 84 130 90 150 L 98 146 C 94 120 94 88 96 58 Z", C["hair"], sw=4))
    head.append(p("M 154 52 C 158 84 156 116 150 134 L 144 130 C 148 106 150 82 148 54 Z", C["hair"], sw=4))
    # presilha de mariposa
    head.append(g(p("M 0 0 C -10 -8 -14 2 -8 6 C -12 10 -6 14 0 6 C 6 14 12 10 8 6 C 14 2 10 -8 0 0 Z", "#c9b48a", sw=2)
                  + ell(0, 3, 1.5, 4, INK, stroke=None), "translate(146 26) rotate(18)"))
    parts.append(g("".join(head), f"translate(0,{b * 1.2})"))
    return "".join(parts)


def build_clara():
    out = os.path.join(ROOT, "daughter")
    os.makedirs(out, exist_ok=True)
    for i, b in enumerate([0, 1.2]):
        with open(os.path.join(out, f"clara_idle_{i}.svg"), "w") as fh:
            fh.write(svg_doc(clara_body(f"c{i}", breath=b)))
    for expr in ("smile", "stare"):
        write_portrait(os.path.join(out, f"clara_portrait_{expr}.svg"),
                       clara_body("p" + expr, expr=expr), "64 -2 112 122", "#3a1a26")


# ---------------------------------------------------------------------------
# MÃE
# ---------------------------------------------------------------------------
M = dict(hair="#5e4436", hair_lt="#7c5c4a", gray="#8c8078", skin="#dcb498", skin_dk="#bf957a",
         dress="#2c4446", dress_dk="#1e3032", apron="#cfc4ac", apron_dk="#b0a68e", shoe="#2a1c18")


def mae_body(uid, expr="smile", breath=0.0):
    b = breath
    parts = []
    # pernas / sapatos
    for x in (104, 128):
        parts.append(p(f"M {x} 300 L {x} 372 L {x + 14} 372 L {x + 14} 300 Z", "#b39a88", sw=3.5))
        parts.append(p(f"M {x - 4} 366 C {x - 6} 380 {x - 2} 388 {x + 2} 390 L {x + 28} 390 C {x + 32} 382 {x + 26} 372 {x + 16} 366 Z", M["shoe"], sw=4))
    # vestido longo
    dress = "M 90 100 C 78 140 78 200 76 300 C 96 312 144 312 166 300 C 162 220 160 140 150 100 C 132 92 108 92 90 100 Z"
    parts.append(g(p(dress, M["dress"], sw=4.5)
                   + clipped(f"md{uid}", dress, f'<rect x="60" y="90" width="28" height="240" fill="{M["dress_dk"]}"/>'
                             + line("M 100 230 L 96 304", 2, INK, .4) + line("M 142 230 L 146 304", 2, INK, .4)),
                   f"translate(0,{b})"))
    # avental com pequena mancha
    apron = "M 98 150 C 94 200 92 250 94 296 C 112 302 132 302 148 296 C 150 250 148 200 144 150 Z"
    parts.append(g(p(apron, M["apron"], sw=3.5)
                   + clipped(f"ma{uid}", apron, f'<rect x="90" y="140" width="14" height="170" fill="{M["apron_dk"]}"/>'
                             + ell(128, 238, 7, 4, "#7a3a34", stroke=None, extra='opacity=".55"')
                             + ell(134, 244, 3, 2, "#7a3a34", stroke=None, extra='opacity=".45"'))
                   + line("M 96 152 C 110 156 132 156 146 152", 3), f"translate(0,{b})"))
    # braços (segura uma colher de pau)
    parts.append(g(p("M 92 106 C 82 140 84 176 92 196 L 106 192 C 100 172 100 140 104 116 Z", M["dress"], sw=4)
                   + ell(100, 200, 10, 10, M["skin"], sw=4)
                   + p("M 148 106 C 160 130 162 160 156 176 L 142 172 C 146 156 146 134 140 114 Z", M["dress_dk"], sw=4)
                   + p("M 146 170 L 176 96 L 182 98 L 152 172 Z", "#9a6a42", sw=3)
                   + ell(180, 92, 7, 10, "#9a6a42", sw=3, extra='transform="rotate(22 180 92)"')
                   + ell(150, 176, 10, 10, M["skin"], sw=4), f"translate(0,{b})"))
    # pescoço e colar de pérolas
    head = [p("M 110 80 L 110 102 L 132 102 L 132 80 Z", M["skin_dk"], sw=3.5)]
    head.append("".join(ell(106 + i * 4.5, 104 + math.sin(i / 7 * math.pi) * 7, 2.6, 2.6, "#efe8dc", sw=1.2) for i in range(8)))
    face = "M 92 34 C 88 58 92 76 104 88 C 112 94 126 96 136 90 C 146 82 150 66 148 34 Z"
    head.append(p(face, M["skin"], sw=4.5))
    head.append(clipped(f"mf{uid}", face, f'<path d="M 86 30 C 92 56 96 76 116 98 L 80 100 Z" fill="{M["skin_dk"]}" opacity=".5"/>'))
    # olhos fechados sorridentes
    for cx, rx in ((110, 8), (137, 6.5)):
        if expr == "smile":
            head.append(line(f"M {cx - rx} 62 C {cx - 3} 56 {cx + 3} 56 {cx + rx} 62", 2.8))
        else:
            head.append(ell(cx, 61, rx * .8, 4, "#f3ece6", stroke=INK, sw=2))
            head.append(ell(cx + 1, 61.5, 3, 3.6, "#2a1a10", stroke=None))
            head.append(line(f"M {cx - rx} 58 C {cx - 3} 55 {cx + 3} 55 {cx + rx} 58", 2.6))
        head.append(line(f"M {cx - rx + 1} 66 C {cx} 68 {cx + rx - 2} 67 {cx + rx} 66", 1.2, INK, .4))
    head.append(line("M 143 66 C 146 70 146 73 142 75", 2, INK, .7))
    head.append(line("M 118 81 C 124 86 132 85 137 80", 2.6))
    head.append(line("M 116 79 L 118 82", 1.8, INK, .6))
    # coque
    hair = "M 88 46 C 84 22 98 6 120 6 C 142 6 154 20 152 44 C 146 34 134 28 120 30 C 106 30 96 36 88 46 Z"
    head.append(ell(110, 4, 18, 14, M["hair"], sw=4))
    head.append(line("M 98 2 C 106 -4 116 -4 122 2", 2, M["hair_lt"]))
    head.append(p(hair, M["hair"], sw=4.5))
    head.append(line("M 100 20 C 110 14 130 14 142 22", 2.4, M["gray"], .9))
    head.append(line("M 92 40 C 100 30 110 26 120 26", 2, M["hair_lt"], .8))
    parts.append(g("".join(head), f"translate(0,{b * 1.2})"))
    return "".join(parts)


# ---------------------------------------------------------------------------
# PAI
# ---------------------------------------------------------------------------
P = dict(hair="#8a8580", hair_dk="#5e5a56", skin="#d2ab90", skin_dk="#b38c72",
         cardigan="#5a4030", cardigan_dk="#3e2c20", shirt="#d8d2c6", tie="#2f3d2a",
         pants="#45454f", pants_dk="#33333b", shoe="#2c1a12")


def pai_body(uid, expr="neutral", breath=0.0):
    b = breath
    parts = []
    # pernas
    for x, c in ((102, P["pants_dk"]), (126, P["pants"])):
        parts.append(p(f"M {x} 236 C {x - 2} 290 {x} 340 {x} 376 L {x + 20} 376 C {x + 22} 340 {x + 22} 290 {x + 20} 236 Z", c, sw=4))
        parts.append(p(f"M {x - 4} 372 C {x - 6} 382 {x - 4} 390 {x} 391 L {x + 36} 391 C {x + 40} 384 {x + 34} 374 {x + 20} 372 Z", P["shoe"], sw=4))
    # tronco
    torso = "M 92 96 C 80 120 80 190 84 246 L 156 246 C 160 190 160 120 148 96 C 132 88 108 88 92 96 Z"
    parts.append(g(p(torso, P["cardigan"], sw=4.5)
                   + clipped(f"pt{uid}", torso, f'<rect x="76" y="90" width="22" height="160" fill="{P["cardigan_dk"]}"/>'
                             + p("M 112 92 L 120 246 L 136 246 L 134 92 Z", P["shirt"], sw=3)
                             + p("M 118 98 L 126 96 L 130 104 L 128 170 L 123 178 L 118 170 L 120 104 Z", P["tie"], sw=2.5)
                             + "".join(ell(140, 120 + i * 24, 2.8, 2.8, "#c0a080", sw=1.4) for i in range(5))
                             + line("M 86 236 L 154 236", 2.2, INK, .4)),
                   f"translate(0,{b})"))
    # braços segurando um livro aberto
    parts.append(g(p("M 92 104 C 82 140 84 170 100 186 L 112 178 C 102 162 100 140 104 112 Z", P["cardigan"], sw=4)
                   + p("M 148 104 C 158 140 156 166 140 184 L 130 176 C 142 160 142 138 138 112 Z", P["cardigan_dk"], sw=4)
                   + p("M 96 176 L 124 168 L 152 176 L 152 194 L 124 186 L 96 194 Z", "#6a2a24", sw=3.5)
                   + p("M 100 174 L 124 166 L 148 174 L 148 186 L 124 180 L 100 186 Z", "#e6dcc4", sw=2.5)
                   + line("M 124 166 L 124 180", 1.8)
                   + ell(104, 186, 9, 8, P["skin"], sw=3.5) + ell(144, 186, 9, 8, P["skin"], sw=3.5),
                   f"translate(0,{b})"))
    head = [p("M 110 72 L 110 96 L 132 96 L 132 72 Z", P["skin_dk"], sw=3.5)]
    face = "M 92 24 C 86 50 90 70 102 82 C 112 90 128 92 138 84 C 148 74 152 56 150 24 Z"
    head.append(p(face, P["skin"], sw=4.5))
    head.append(clipped(f"pf{uid}", face, f'<path d="M 86 20 C 92 48 98 70 118 92 L 80 94 Z" fill="{P["skin_dk"]}" opacity=".5"/>'))
    # olhos pequenos e calmos
    for cx, rx in ((110, 6), (136, 5)):
        if expr == "stare":
            head.append(ell(cx, 52, rx, 3.6, "#efe8e0", stroke=None))
            head.append(ell(cx, 52, 2.6, 2.8, "#1a1410", stroke=None))
        else:
            head.append(ell(cx, 53, 2.4, 2.6, "#1a1410", stroke=None))
        head.append(line(f"M {cx - rx - 2} 46 C {cx - 2} 43 {cx + 2} 43 {cx + rx + 2} 46", 2.6, P["hair_dk"]))
        head.append(line(f"M {cx - rx} 58 C {cx} 60 {cx + rx - 1} 59 {cx + rx} 58", 1.2, INK, .4))
    # óculos de leitura retangulares na ponta do nariz
    head.append('<rect x="100" y="54" width="20" height="11" rx="2" fill="#e8f0ff" fill-opacity=".15" stroke="#3a3430" stroke-width="2.2"/>')
    head.append('<rect x="128" y="54" width="16" height="11" rx="2" fill="#e8f0ff" fill-opacity=".15" stroke="#3a3430" stroke-width="2.2"/>')
    head.append(line("M 120 58 L 128 58", 2, "#3a3430"))
    head.append(line("M 142 52 C 147 60 148 66 143 70", 2.2, INK, .8))
    # bigode
    head.append(p("M 118 72 C 124 68 132 68 140 71 C 142 76 132 78 128 75 C 124 78 116 78 118 72 Z", P["hair"], sw=2.5))
    head.append(line("M 122 82 L 136 81", 2.2))
    # cabelo penteado para trás, entradas
    hair = "M 88 34 C 84 14 98 0 120 0 C 140 0 154 10 152 30 C 146 20 140 14 132 14 C 122 12 112 16 104 20 C 96 24 92 28 88 34 Z"
    head.append(p(hair, P["hair"], sw=4.5))
    head.append(line("M 98 18 C 110 8 126 6 142 10", 2, P["hair_dk"]))
    head.append(line("M 94 26 C 104 16 118 12 132 12", 1.8, "#b4b0aa"))
    head.append(ell(90, 46, 7, 11, P["skin"], sw=4))
    parts.append(g("".join(head), f"translate(0,{b * 1.2})"))
    return "".join(parts)


def build_parents():
    out = os.path.join(ROOT, "parents")
    os.makedirs(out, exist_ok=True)
    for i, b in enumerate([0, 1.2]):
        with open(os.path.join(out, f"mae_idle_{i}.svg"), "w") as fh:
            fh.write(svg_doc(mae_body(f"m{i}", breath=b)))
        with open(os.path.join(out, f"pai_idle_{i}.svg"), "w") as fh:
            fh.write(svg_doc(pai_body(f"p{i}", breath=b)))
    write_portrait(os.path.join(out, "mae_portrait.svg"), mae_body("mp"), "64 -14 112 122", "#3a2a1e")
    write_portrait(os.path.join(out, "mae_portrait_open.svg"), mae_body("mo", expr="open"), "64 -14 112 122", "#3a2a1e")
    write_portrait(os.path.join(out, "pai_portrait.svg"), pai_body("pp"), "64 -16 112 122", "#2a2418")
    write_portrait(os.path.join(out, "pai_portrait_stare.svg"), pai_body("ps", expr="stare"), "64 -16 112 122", "#2a2418")


if __name__ == "__main__":
    build_arthur()
    build_clara()
    build_parents()
    print("personagens gerados em", os.path.abspath(ROOT))
