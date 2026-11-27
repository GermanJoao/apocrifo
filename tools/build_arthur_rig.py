#!/usr/bin/env python3
"""
Monta o rig.json do Arthur a partir das partes desenhadas e das poses medidas.

Ideias principais (vindas de olhar os desenhos do autor):
- Os dois desenhos de sapato NÃO são "pé esquerdo/direito": são dois ESTADOS do pé.
    pe_apoiado  = pé de perfil, sola no chão (sapato_frente.png)
    pe_ponta    = pé levantado na ponta, bico para baixo (sapato_tras.png)
  Cada perna tem os dois; a pose diz qual aparece.
- O pé fica preso no tornozelo da perna (acompanha a perna).
- Ciclo completo: contato A (perna da frente avança), passagem A,
  contato B (perna de trás avança — papéis dos pés trocados), passagem B.
  As poses B são o "espelho" das A em torno da pose parada.

Uso:  python3 tools/build_arthur_rig.py [pasta_para_previa]
"""
import json
import math
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "characters", "arthur")
RIG = os.path.join(ROOT, "rig.json")
PARTES = os.path.join(ROOT, "partes")

PIV = {
    "tronco": (540, 600), "cabeca": (528, 240),
    "braco_tras": (505, 300),    # braço do lado esquerdo do desenho: fica ATRÁS do tronco
    "braco_frente": (607, 308),  # braço do lado direito do desenho: fica NA FRENTE
    "perna_frente": (584, 578), "perna_tras": (496, 592),
}
# Medidas (rotação PIL anti-horária em torno do pivot + deslocamento), encaixando
# as peças nos desenhos Idle, Andar1 e Andar2. Os braços já com os nomes corretos.
MEDIDO = {
    "parado": {
        "tronco": (-0.17, 0, 0), "cabeca": (0, 0, 0),
        "braco_tras": (3.0, -18, 4), "braco_frente": (-15.0, -4, 2),
        "perna_frente": (19.17, -20, 18), "perna_tras": (-23.34, -28, 2),
    },
    "passo1": {  # Andar1
        "tronco": (-0.17, 0, 0), "cabeca": (0, 0, 0),
        "braco_tras": (41.67, 26, 26), "braco_frente": (-40.83, 22, 10),
        "perna_frente": (30.83, -16, 30), "perna_tras": (-35.0, -24, 0),
    },
    "passo2": {  # Andar2 (as peças foram exportadas desta pose)
        "tronco": (-0.17, 0, 0), "cabeca": (0, 0, 0),
        "braco_tras": (0, 0, 0), "braco_frente": (0, 0, 0),
        "perna_frente": (0, 0, 0), "perna_tras": (-3, 10, 26),
    },
}
# Qual estado de pé cada perna usa em cada pose (visto nos desenhos: o pé que vai
# à frente, à esquerda, está apoiado; o de trás está na ponta).
# Andar1 = perna de TRÁS à frente; Andar2 = perna da FRENTE à frente.
PES = {
    "parado": {"perna_frente": "ponta", "perna_tras": "apoiado"},
    "passo1": {"perna_frente": "ponta", "perna_tras": "apoiado"},
    "passagem1": {"perna_frente": "ponta", "perna_tras": "apoiado"},
    "passo2": {"perna_frente": "apoiado", "perna_tras": "ponta"},
    "passagem2": {"perna_frente": "apoiado", "perna_tras": "ponta"},
    "sentado": {"perna_frente": "apoiado", "perna_tras": "apoiado"},
}


def rot_pt(p, c, ang, d=(0, 0)):
    """Rotação PIL (anti-horária na tela) de p em torno de c, depois desloca d."""
    th = math.radians(ang)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + math.cos(th) * x + math.sin(th) * y + d[0],
            c[1] - math.sin(th) * x + math.cos(th) * y + d[1])


def alpha_info(name):
    from PIL import Image
    import numpy as np
    a = np.asarray(Image.open(os.path.join(PARTES, name + ".png")).convert("RGBA"))[..., 3] > 128
    ys, xs = np.nonzero(a)
    return a, xs, ys


def ankle_of(leg):
    """Tornozelo = centro da ponta de baixo da perna, um pouco para dentro."""
    _, xs, ys = alpha_info(leg)
    bottom = ys.max()
    sel = ys > bottom - 40
    return (float(xs[sel].mean()), float(bottom - 18))


def shoe_anchor(shoe, kind):
    """Ponto do sapato que encosta no tornozelo (onde a calça entra)."""
    _, xs, ys = alpha_info(shoe)
    top = ys.min()
    sel = ys < top + 30
    cx = float(xs[sel].mean())
    return (cx, float(top + (22 if kind == "apoiado" else 16)))


def mirror(pose_a, rest):
    """Pose espelhada em torno do repouso (mesma amplitude, sentido contrário)."""
    out = {}
    for k, (r, dx, dy) in pose_a.items():
        r0, dx0, dy0 = rest[k]
        if k.startswith(("perna", "braco")):
            out[k] = (2 * r0 - r, 2 * dx0 - dx, 2 * dy0 - dy)
        else:
            out[k] = (r, dx, dy)
    return out


def build():
    poses = dict(MEDIDO)
    # PROVISÓRIO até existir o desenho do Arthur amarrado: sentado na cadeira,
    # braços presos junto ao corpo, cabeça caída.
    poses["sentado"] = {
        "tronco": (3, 0, 6), "cabeca": (-9, -6, 10),
        "braco_tras": (6, -14, 10), "braco_frente": (-12, -6, 8),  # braços presos junto ao corpo
        "perna_frente": (-22, -10, 0), "perna_tras": (-30, -6, 0),
    }
    # passagens: meio caminho entre os dois passos (pernas se cruzando sob o corpo)
    mid = {k: tuple((a + b) / 2 for a, b in zip(MEDIDO["passo1"][k], MEDIDO["passo2"][k])) for k in MEDIDO["passo1"]}
    poses["passagem1"] = mid   # depois do passo1: a perna de trás está apoiada
    poses["passagem2"] = mid   # depois do passo2: a perna da frente está apoiada
    # na passagem B a perna que estava apoiada vira a que passa: troca também quem fica "por baixo"
    ank = {leg: ankle_of(leg) for leg in ("perna_frente", "perna_tras")}
    anc = {"apoiado": shoe_anchor("sapato_frente", "apoiado"), "ponta": shoe_anchor("sapato_tras", "ponta")}

    out_poses = {}
    for name, pose in poses.items():
        p = {k: {"rot": round(v[0], 2), "dx": round(v[1], 1), "dy": round(v[2], 1)} for k, v in pose.items()}
        for leg in ("perna_frente", "perna_tras"):
            p[leg]["pe"] = PES[name][leg]
        out_poses[name] = p

    with open(RIG) as fh:
        rig = json.load(fh)
    rig["_comentario"] = (
        "Arthur montado com as partes desenhadas (tela 1080x1080). Cada pose diz quanto cada peça gira "
        "em torno do pivot (graus, positivo = anti-horário) e quanto se desloca (dx, dy). Cada perna tem "
        "um pé preso no tornozelo; 'pe' escolhe o desenho: 'apoiado' (sola no chão) ou 'ponta' (pé "
        "levantado). Gerado por tools/build_arthur_rig.py.")
    rig["pecas"] = [
        {"id": "braco_tras", "arquivo": "partes/braco_tras.png", "pivot": list(PIV["braco_tras"])},
        {"id": "pe_tras_apoiado", "arquivo": "partes/sapato_frente.png", "pe": "apoiado", "perna": "perna_tras",
         "pivot": [round(c, 1) for c in anc["apoiado"]]},
        {"id": "pe_tras_ponta", "arquivo": "partes/sapato_tras.png", "pe": "ponta", "perna": "perna_tras",
         "pivot": [round(c, 1) for c in anc["ponta"]]},
        {"id": "perna_tras", "arquivo": "partes/perna_tras.png", "pivot": list(PIV["perna_tras"]),
         "tornozelo": [round(c, 1) for c in ank["perna_tras"]]},
        {"id": "pe_frente_apoiado", "arquivo": "partes/sapato_frente.png", "pe": "apoiado", "perna": "perna_frente",
         "pivot": [round(c, 1) for c in anc["apoiado"]]},
        {"id": "pe_frente_ponta", "arquivo": "partes/sapato_tras.png", "pe": "ponta", "perna": "perna_frente",
         "pivot": [round(c, 1) for c in anc["ponta"]]},
        {"id": "perna_frente", "arquivo": "partes/perna_frente.png", "pivot": list(PIV["perna_frente"]),
         "tornozelo": [round(c, 1) for c in ank["perna_frente"]]},
        {"id": "tronco", "arquivo": "partes/tronco.png", "pivot": list(PIV["tronco"])},
        {"id": "braco_frente", "arquivo": "partes/braco_frente.png", "pivot": list(PIV["braco_frente"])},
        {"id": "cabeca", "arquivo": "partes/cabeca.png", "pivot": list(PIV["cabeca"])},
        {"id": "olhos", "arquivo": "partes/olhos.png", "pivot": list(PIV["cabeca"]), "segue": "cabeca"},
        {"id": "olhos_fechados", "arquivo": "partes/olhos_fechados.png", "pivot": list(PIV["cabeca"]),
         "segue": "cabeca", "oculto": True},
        {"id": "sobrancelhas", "arquivo": "partes/sobrancelhas.png", "pivot": list(PIV["cabeca"]), "segue": "cabeca"},
        {"id": "cabelo", "arquivo": "partes/cabelo.png", "pivot": list(PIV["cabeca"]), "segue": "cabeca"},
    ]
    rig["poses"] = out_poses
    rig["animacao"] = {
        "_comentario": "ciclo de caminhada percorrido em loop (o pé troca de desenho no meio da transição)",
        "ciclo": ["passo1", "passagem1", "passo2", "passagem2"],
        "ciclosPorSegundo": 0.9, "balanco": 5,
        "respiracao": {"amplitude": 3, "velocidade": 0.45},
    }
    with open(RIG, "w") as fh:
        json.dump(rig, fh, ensure_ascii=False, indent=1)
    return rig


# ------------------------------------------------------------- prévia
def preview(rig, outdir):
    from PIL import Image, ImageDraw
    pecas = rig["pecas"]
    byid = {p["id"]: p for p in pecas}

    def render(pose):
        c = Image.new("RGBA", (1080, 1080), (215, 215, 215, 255))
        for p in pecas:
            if p.get("oculto"):
                continue
            im = Image.open(os.path.join(ROOT, p["arquivo"])).convert("RGBA")
            if "perna" in p and "pe" in p:   # sapato preso ao tornozelo
                leg = pose[p["perna"]]
                if leg["pe"] != p["pe"]:
                    continue
                lp = byid[p["perna"]]
                ank = rot_pt(lp["tornozelo"], lp["pivot"], leg["rot"], (leg["dx"], leg["dy"]))
                a = p["pivot"]
                im = im.rotate(0, center=tuple(a), translate=(ank[0] - a[0], ank[1] - a[1]))
            else:
                t = pose.get(p["id"]) or pose.get(p.get("segue"), {"rot": 0, "dx": 0, "dy": 0})
                im = im.rotate(t["rot"], resample=Image.BICUBIC, center=tuple(p["pivot"]), translate=(t["dx"], t["dy"]))
            c.alpha_composite(im)
        return c

    names = ["parado"] + rig["animacao"]["ciclo"]
    tiles = [render(rig["poses"][n]).crop((240, 20, 820, 1060)) for n in names]
    W = 580
    out = Image.new("RGBA", (W * len(tiles), 1080), (255, 255, 255, 255))
    d = ImageDraw.Draw(out)
    for i, t in enumerate(tiles):
        out.paste(t, (i * W, 40))
        d.text((i * W + 12, 10), names[i], fill=(0, 0, 0))
    path = os.path.join(outdir, "rig_preview.png")
    out.resize((out.width // 2, out.height // 2)).save(path)
    return path


if __name__ == "__main__":
    rig = build()
    print("rig.json atualizado")
    if len(sys.argv) > 1:
        print("prévia:", preview(rig, sys.argv[1]))
