#!/usr/bin/env python3
"""
Monta o rig.json da Clara a partir das partes desenhadas (clara_partes/, tela 1080x1080).

Diferente do Arthur, a Clara está desenhada DE FRENTE:
- sapato_esq / sapato_dir são os pés esquerdo e direito mesmo (não estados de pé);
  cada um fica preso no tornozelo da sua perna.
- Os dois braços ficam NA FRENTE do tronco (as mangas caem por fora do suéter).
- Os sapatos ficam por baixo das pernas (a meia-calça cai sobre eles).
- O cabelo de trás fica atrás de tudo e acompanha a cabeça.
- Ao andar para a direita ela é espelhada (como o Arthur).
- Caminhada: as pernas abrem para a frente e para trás, a de trás passa por
  baixo do corpo com o pé no ar, e os braços balançam ao contrário das pernas.

Uso:  python3 tools/build_clara_rig.py [pasta_para_previa]
"""
import json
import math
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "characters", "daughter")
RIG = os.path.join(ROOT, "rig.json")

PIV = {
    "tronco": (540, 600), "cabeca": (530, 232),
    "braco_esq": (452, 290), "braco_dir": (624, 290),
    "perna_esq": (505, 600), "perna_dir": (590, 600),
}
TORNOZELO = {"perna_esq": (505, 960), "perna_dir": (605, 960)}

Z = (0, 0, 0)
# Desenho "olhando" para a esquerda: perna para a frente = rotação negativa
# (o pé vai para a esquerda). Ao andar para a direita o rig é espelhado.
POSES = {
    "parado": {k: Z for k in PIV},
    # contato A: perna esquerda à frente, direita atrás; braços ao contrário
    "passo1": {
        "tronco": (-2, 0, 0), "cabeca": (-1, 0, 0),
        "braco_esq": (10, 0, 0), "braco_dir": (-10, 0, 0),
        "perna_esq": (-16, 0, 0), "perna_dir": (12, 0, 0),
    },
    # passagem A: a perna direita passa por baixo do corpo, com o pé no ar
    "passagem1": {
        "tronco": (-1, 0, -6), "cabeca": (0, 0, -6),
        "braco_esq": (2, 0, 0), "braco_dir": (-2, 0, 0),
        "perna_esq": (2, 0, 0), "perna_dir": (-4, 0, -34),
    },
    # contato B: perna direita à frente
    "passo2": {
        "tronco": (-2, 0, 0), "cabeca": (-1, 0, 0),
        "braco_esq": (-8, 0, 0), "braco_dir": (10, 0, 0),
        "perna_esq": (9, 0, 0), "perna_dir": (-12, 0, 0),
    },
    # passagem B: a perna esquerda passa
    "passagem2": {
        "tronco": (-1, 0, -6), "cabeca": (0, 0, -6),
        "braco_esq": (-2, 0, 0), "braco_dir": (2, 0, 0),
        "perna_esq": (-4, 0, -34), "perna_dir": (2, 0, 0),
    },
}


def rot_pt(p, c, ang, d=(0, 0)):
    th = math.radians(ang)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + math.cos(th) * x + math.sin(th) * y + d[0],
            c[1] - math.sin(th) * x + math.cos(th) * y + d[1])


def build():
    pecas = [
        {"id": "cabelo_tras", "arquivo": "clara_partes/cabelo_tras.png", "pivot": list(PIV["cabeca"]), "segue": "cabeca"},
        {"id": "pe_esq", "arquivo": "clara_partes/sapato_esq.png", "pe": "apoiado", "perna": "perna_esq",
         "pivot": list(TORNOZELO["perna_esq"])},
        {"id": "pe_dir", "arquivo": "clara_partes/sapato_dir.png", "pe": "apoiado", "perna": "perna_dir",
         "pivot": list(TORNOZELO["perna_dir"])},
        {"id": "perna_esq", "arquivo": "clara_partes/perna_esq.png", "pivot": list(PIV["perna_esq"]),
         "tornozelo": list(TORNOZELO["perna_esq"])},
        {"id": "perna_dir", "arquivo": "clara_partes/perna_dir.png", "pivot": list(PIV["perna_dir"]),
         "tornozelo": list(TORNOZELO["perna_dir"])},
        {"id": "tronco", "arquivo": "clara_partes/tronco.png", "pivot": list(PIV["tronco"])},
        {"id": "braco_esq", "arquivo": "clara_partes/braco_esq.png", "pivot": list(PIV["braco_esq"])},
        {"id": "braco_dir", "arquivo": "clara_partes/braco_dir.png", "pivot": list(PIV["braco_dir"])},
        {"id": "cabeca", "arquivo": "clara_partes/cabeca.png", "pivot": list(PIV["cabeca"])},
        {"id": "olhos", "arquivo": "clara_partes/olhos.png", "pivot": list(PIV["cabeca"]), "segue": "cabeca"},
        {"id": "olhos_fechados", "arquivo": "clara_partes/olhos_fechados.png", "pivot": list(PIV["cabeca"]),
         "segue": "cabeca", "oculto": True},
        {"id": "cabelo", "arquivo": "clara_partes/cabelo.png", "pivot": list(PIV["cabeca"]), "segue": "cabeca"},
    ]
    poses = {}
    for name, pose in POSES.items():
        p = {k: {"rot": v[0], "dx": v[1], "dy": v[2]} for k, v in pose.items()}
        for leg in ("perna_esq", "perna_dir"):
            p[leg]["pe"] = "apoiado"
        poses[name] = p
    rig = {
        "_comentario": (
            "Clara montada com as partes desenhadas (tela 1080x1080), vista de frente. Cada pose diz quanto "
            "cada peça gira em torno do pivot (graus, positivo = anti-horário) e quanto se desloca (dx, dy). "
            "Cada sapato fica preso no tornozelo da sua perna. Gerado por tools/build_clara_rig.py."),
        "tela": 1080,
        "olhandoPara": "esquerda",
        "alturaNoJogo": 250,
        "centroX": 540,
        "pecas": pecas,
        "poses": poses,
        "animacao": {
            "ciclo": ["passo1", "passagem1", "passo2", "passagem2"],
            "ciclosPorSegundo": 0.9, "balanco": 4,
            "respiracao": {"amplitude": 2, "velocidade": 0.35},
        },
    }
    with open(RIG, "w") as fh:
        json.dump(rig, fh, ensure_ascii=False, indent=1)
    return rig


def preview(rig, outdir):
    from PIL import Image, ImageDraw
    pecas = rig["pecas"]
    byid = {p["id"]: p for p in pecas}

    def render(pose):
        c = Image.new("RGBA", (1080, 1080), (200, 200, 200, 255))
        for p in pecas:
            if p.get("oculto"):
                continue
            im = Image.open(os.path.join(ROOT, p["arquivo"])).convert("RGBA")
            if "perna" in p:
                leg = pose[p["perna"]]
                lp = byid[p["perna"]]
                ank = rot_pt(lp["tornozelo"], lp["pivot"], leg["rot"], (leg["dx"], leg["dy"]))
                a = p["pivot"]
                im = im.rotate(0, center=tuple(a), translate=(ank[0] - a[0], ank[1] - a[1]))
            else:
                t = pose.get(p["id"]) or pose.get(p.get("segue"), {"rot": 0, "dx": 0, "dy": 0})
                im = im.rotate(t["rot"], resample=Image.BICUBIC, center=tuple(p["pivot"]), translate=(t["dx"], t["dy"]))
            c.alpha_composite(im)
        return c

    names = ["parado", "passo1", "passagem1", "passo2", "passagem2"]
    tiles = [render(rig["poses"][n]).crop((330, 20, 750, 1060)) for n in names]
    W = 420
    out = Image.new("RGBA", (W * len(tiles), 1080), (255, 255, 255, 255))
    d = ImageDraw.Draw(out)
    for i, t in enumerate(tiles):
        out.paste(t, (i * W, 40))
        d.text((i * W + 12, 10), names[i], fill=(0, 0, 0))
    path = os.path.join(outdir, "clara_rig_preview.png")
    out.resize((out.width // 2, out.height // 2)).save(path)
    return path


if __name__ == "__main__":
    rig = build()
    print("rig.json da Clara gerado")
    if len(sys.argv) > 1:
        print("prévia:", preview(rig, sys.argv[1]))
