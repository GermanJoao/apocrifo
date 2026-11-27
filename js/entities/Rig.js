// Personagem "de recorte" (marionete): monta as partes desenhadas (PNG ou SVG)
// a partir de um rig.json e anima caminhada, respiração e piscada no código.
//
// Fluxo para o artista: desenhar o personagem em camadas numa mesma tela,
// exportar cada camada inteira (com transparência) e salvar com o nome que
// aparece no rig.json. As articulações ("pivot") ficam nas coordenadas da tela.

const TRIM_SCALE = 0.5; // texturas guardadas pela metade (economiza memória)

// ---------------------------------------------------------------------------
// Carregamento (chamado pela BootScene)
// ---------------------------------------------------------------------------

/** Enfileira o rig.json e, quando ele chegar, as imagens das partes. */
export function loadRig(scene, name, baseUrl) {
  const jsonKey = `rig_${name}`;
  scene.load.json(jsonKey, `${baseUrl}rig.json`);
  scene.load.on(`filecomplete-json-${jsonKey}`, (key, type, data) => {
    for (const p of data.pecas) {
      const url = baseUrl + p.arquivo;
      if (url.endsWith('.svg')) scene.load.svg(`${jsonKey}:${p.id}`, url, { width: data.tela, height: data.tela });
      else scene.load.image(`${jsonKey}:${p.id}`, url);
    }
  });
}

/** Recorta o espaço transparente de cada parte e guarda as medidas. */
export function prepareRig(scene, name) {
  const jsonKey = `rig_${name}`;
  const data = scene.cache.json.get(jsonKey);
  if (!data) return null;
  const trims = {};
  for (const p of data.pecas) {
    const key = `${jsonKey}:${p.id}`;
    if (!scene.textures.exists(key)) { console.error(`[rig] parte ausente: ${p.arquivo}`); continue; }
    const src = scene.textures.get(key).getSourceImage();
    const W = Math.round(src.width * TRIM_SCALE);
    const H = Math.round(src.height * TRIM_SCALE);
    const full = document.createElement('canvas');
    full.width = W; full.height = H;
    const fctx = full.getContext('2d');
    fctx.drawImage(src, 0, 0, W, H);
    const px = fctx.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (px[(y * W + x) * 4 + 3] > 8) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) { x0 = y0 = 0; x1 = y1 = 1; }
    const pad = 2;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
    x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
    const cw = x1 - x0 + 1;
    const ch = y1 - y0 + 1;
    const cut = document.createElement('canvas');
    cut.width = cw; cut.height = ch;
    cut.getContext('2d').drawImage(full, x0, y0, cw, ch, 0, 0, cw, ch);
    const tKey = `${key}:t`;
    if (scene.textures.exists(tKey)) scene.textures.remove(tKey);
    scene.textures.addCanvas(tKey, cut);
    // contorno de baixo (para apoiar os sapatos no chão com precisão)
    const bottom = [];
    for (let x = x0; x <= x1; x += 4) {
      for (let y = y1; y >= y0; y--) {
        if (px[(y * W + x) * 4 + 3] > 8) { bottom.push([x / TRIM_SCALE, y / TRIM_SCALE]); break; }
      }
    }
    // medidas em coordenadas da tela original (assume tela quadrada = data.tela)
    const u = data.tela / src.width;
    trims[p.id] = {
      key: tKey, x: (x0 / TRIM_SCALE) * u, y: (y0 / TRIM_SCALE) * u, w: (cw / TRIM_SCALE) * u, h: (ch / TRIM_SCALE) * u,
      bottom: bottom.map(([bx, by]) => [bx * u, by * u]), texScale: u / TRIM_SCALE,
    };
  }
  scene.registry.set(`${jsonKey}:trims`, trims);
  return data;
}

// ---------------------------------------------------------------------------
// Personagem montado
// ---------------------------------------------------------------------------
const rad = Phaser.Math.DegToRad;

export class Rig {
  constructor(scene, name, x, y) {
    this.scene = scene;
    this.data = scene.cache.json.get(`rig_${name}`);
    this.trims = scene.registry.get(`rig_${name}:trims`);
    this.container = scene.add.container(x, y);
    this.parts = {};
    for (const p of this.data.pecas) {
      const t = this.trims[p.id];
      if (!t) continue;
      const img = scene.add.image(0, 0, t.key)
        .setOrigin((p.pivot[0] - t.x) / t.w, (p.pivot[1] - t.y) / t.h)
        .setScale(t.texScale);
      if (p.oculto) img.setVisible(false);
      this.container.add(img);
      this.parts[p.id] = { def: p, img, trim: t };
    }
    this.state = 'idle';
    this.phase = 0;
    this.time = 0;
    this.walkAmount = 0;    // 0 = parado, 1 = andando (transição suave)
    this.speedMul = 1;
    this.nextBlink = 2 + Math.random() * 3;
    this.onStep = null;
    this.faceDir = 1;
    this.scaleMul = 1;
    this.phase = 0.25;
    this.restT = 1;
    this._pose();
    // escala: altura do corpo em repouso → altura desejada no jogo
    const top = this._top();
    this.bodyHeight = this.ground - top;
    this.baseScale = (this.data.alturaNoJogo || 268) / this.bodyHeight;
    this._applyScale();
  }

  // ---------------------------------------------------- interface pública
  get x() { return this.container.x; }
  set x(v) { this.container.x = v; }
  get y() { return this.container.y; }
  set y(v) { this.container.y = v; }

  /** Troca a pose de repouso (ex.: 'sentado'); 'parado' é o padrão. */
  setRestPose(name, seconds = 0) {
    this.prevRest = this.restPose || 'parado';
    this.restPose = name;
    this.restT = seconds > 0 ? 0 : 1;
    this.restDur = seconds;
  }

  setWalking(on, speedMul = 1) { this.state = on ? 'walk' : 'idle'; this.speedMul = speedMul; }

  /** face: 1 = direita, -1 = esquerda */
  setFace(face) { this.faceDir = face; this._applyScale(); }
  setScaleMul(m) { this.scaleMul = m; this._applyScale(); }
  setDepth(d) { this.container.setDepth(d); return this; }
  setTint(c) { Object.values(this.parts).forEach((p) => p.img.setTint(c)); return this; }
  setAlpha(a) { this.container.setAlpha(a); return this; }
  topY() { return this.container.y - this.bodyHeight * this.baseScale * this.scaleMul; }
  destroy() { this.container.destroy(); }

  _applyScale() {
    const drawnLeft = this.data.olhandoPara !== 'direita';
    // personagens desenhados de frente (espelhar: false) não viram ao andar
    const flip = this.data.espelhar === false ? 1 : ((this.faceDir < 0) === drawnLeft ? 1 : -1);
    const s = this.baseScale * this.scaleMul;
    this.container.setScale(s * flip, s);
  }

  update(dt) {
    this.time += dt;
    if (this.restT < 1) this.restT = Math.min(1, this.restT + dt / (this.restDur || 1));
    const target = this.state === 'walk' ? 1 : 0;
    this.walkAmount += (target - this.walkAmount) * Math.min(1, dt * 8);
    const anim = this.data.animacao || {};
    if (this.walkAmount > 0.02) {
      const before = this.phase;
      this.phase = (this.phase + dt * (anim.ciclosPorSegundo || 0.95) * this.speedMul) % 1;
      // passo = quando chega numa pose de contato (0 e 0.5 do ciclo)
      const crossed = (a, b, x) => (a < x && b >= x) || (a > b && (x === 0 || b >= x));
      if (this.onStep && this.walkAmount > 0.5 && (crossed(before, this.phase, 0.5) || before > this.phase)) this.onStep();
    } else {
      this.phase = 0.25; // recomeça a partir da pose de passagem
    }
    // piscada
    this.nextBlink -= dt;
    const closed = this.nextBlink < 0;
    if (this.nextBlink < -0.14) this.nextBlink = 2.5 + Math.random() * 3.5;
    if (this.parts.olhos_fechados) {
      this.parts.olhos_fechados.img.setVisible(closed);
      if (this.parts.olhos) this.parts.olhos.img.setVisible(!closed);
    }
    this._pose();
  }

  // ------------------------------------------------------------ pose
  /** Transformação de uma peça numa pose: {rot (graus, anti-horário), dx, dy}. */
  _tf(poseName, id) {
    const pose = this.data.poses[poseName] || {};
    const p = this.data.pecas.find((q) => q.id === id);
    return pose[id] || (p && p.segue && pose[p.segue]) || { rot: 0, dx: 0, dy: 0 };
  }

  _mix(a, b, t) {
    return { rot: a.rot + (b.rot - a.rot) * t, dx: a.dx + (b.dx - a.dx) * t, dy: a.dy + (b.dy - a.dy) * t };
  }

  _pose() {
    const anim = this.data.animacao || {};
    const ciclo = anim.ciclo || ['passo1', 'passagem1', 'passo2', 'passagem2'];
    const w = this.walkAmount;
    // posição no ciclo de caminhada
    const f = this.phase * ciclo.length;
    const i0 = Math.floor(f) % ciclo.length;
    const i1 = (i0 + 1) % ciclo.length;
    let t = f - Math.floor(f);
    t = t * t * (3 - 2 * t); // suaviza
    const resp = anim.respiracao || { amplitude: 4, velocidade: 0.9 };
    const breath = Math.sin(this.time * resp.velocidade * Math.PI * 2) * resp.amplitude * (1 - w);

    const tfs = {};
    const peOf = {}; // desenho de pé escolhido para cada perna ('apoiado' ou 'ponta')
    for (const p of this.data.pecas) {
      if (p.perna) continue; // pés são posicionados depois, no tornozelo
      const upper = !p.tornozelo; // tudo que não é perna respira e balança
      let idle = this._tf(this.restPose || 'parado', p.id);
      if (this.restT < 1) idle = this._mix(this._tf(this.prevRest, p.id), idle, this.restT * this.restT * (3 - 2 * this.restT));
      const walk = this._mix(this._tf(ciclo[i0], p.id), this._tf(ciclo[i1], p.id), t);
      const tf = this._mix(idle, walk, w);
      // respiração: sobe e desce a parte de cima
      if (upper) tf.dy += breath * (p.id === 'tronco' || p.id.startsWith('braco') ? 0.6 : 1);
      // balanço vertical da caminhada
      if (upper) tf.dy += w * Math.cos(this.phase * Math.PI * 4) * (anim.balanco || 6);
      tfs[p.id] = tf;
      if (p.tornozelo) {
        const pePose = w > 0.5 ? this._tf(t < 0.5 ? ciclo[i0] : ciclo[i1], p.id) : this._tf(this.restPose || 'parado', p.id);
        peOf[p.id] = pePose.pe || 'apoiado';
      }
    }

    // pés: presos ao tornozelo da perna, com o desenho do estado atual
    let ground = -Infinity;
    const anchors = {};
    for (const p of this.data.pecas) {
      if (!p.perna) continue;
      const part = this.parts[p.id];
      if (!part) continue;
      const leg = this.data.pecas.find((q) => q.id === p.perna);
      const lt = tfs[p.perna];
      const th = Phaser.Math.DegToRad(lt.rot);
      const x = leg.tornozelo[0] - leg.pivot[0];
      const y = leg.tornozelo[1] - leg.pivot[1];
      const ax = leg.pivot[0] + Math.cos(th) * x + Math.sin(th) * y + lt.dx;
      const ay = leg.pivot[1] - Math.sin(th) * x + Math.cos(th) * y + lt.dy;
      const visible = peOf[p.perna] === p.pe;
      part.img.setVisible(visible);
      anchors[p.id] = [ax, ay];
      tfs[p.id] = { rot: 0, dx: 0, dy: 0 };
      if (visible) ground = Math.max(ground, this._partBottom(part, [ax, ay], 0));
    }
    if (!isFinite(ground)) ground = 1000;
    // pés no chão, sem tremer: acompanha o ponto mais baixo com suavidade
    this.ground = this.ground === undefined ? ground : this.ground + (ground - this.ground) * 0.5;
    const cx = this.data.centroX || this.data.tela / 2;
    for (const p of this.data.pecas) {
      const part = this.parts[p.id];
      if (!part) continue;
      const tf = tfs[p.id];
      const [px, py] = anchors[p.id] || [p.pivot[0] + tf.dx, p.pivot[1] + tf.dy];
      part.img.setPosition(px - cx, py - this.ground);
      part.img.setRotation(Phaser.Math.DegToRad(-tf.rot));
    }
  }

  _partBottom(part, pivot, deg) {
    const p = part.def.pivot;
    const a = rad(deg);
    let max = -Infinity;
    for (const [cx, cy] of part.trim.bottom) {
      const dx = cx - p[0];
      const dy = cy - p[1];
      max = Math.max(max, pivot[1] + dx * Math.sin(a) + dy * Math.cos(a));
    }
    return max;
  }

  _top() {
    let min = Infinity;
    for (const part of Object.values(this.parts)) {
      min = Math.min(min, part.trim.y);
    }
    return min;
  }
}
