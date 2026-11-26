// Carrega todos os SVGs, cria as animações e trata falhas de carregamento.
import { SVG_ASSETS } from '../assets.js';
import { NPC_TYPES } from '../data/rooms.js';
import { services } from '../services.js';
import { loadRig, prepareRig } from '../entities/Rig.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.failed = [];
    this.load.on('progress', (p) => services.ui.setLoading(p));
    this.load.on('loaderror', (file) => {
      this.failed.push(file.key);
      console.error('[assets] falha ao carregar', file.src);
    });
    loadRig(this, 'arthur', 'assets/characters/arthur/');
    // texturas CC0 (ambientCG) convertidas em camadas de desgaste — ver CREDITS.md
    for (const t of ['sujeira_parede', 'veios_piso', 'manchas_piso']) this.load.image(`tex_${t}`, `assets/textures/${t}.png`);
    for (const a of SVG_ASSETS) {
      this.load.svg(a.key, a.url, { width: a.w, height: a.h });
    }
  }

  async create() {
    // substitui assets ausentes por uma textura discreta, para o jogo não travar
    for (const key of this.failed) {
      const a = SVG_ASSETS.find((x) => x.key === key);
      const g = this.add.graphics();
      g.fillStyle(0x1a1418, 1).fillRect(0, 0, a.w, a.h);
      g.lineStyle(2, 0x5a2a2a, 1).strokeRect(1, 1, a.w - 2, a.h - 2);
      g.generateTexture(key, a.w, a.h);
      g.destroy();
    }
    if (this.failed.length) {
      services.ui.error(`Alguns arquivos não carregaram (${this.failed.join(', ')}). Rode o jogo por um servidor (veja o README).`);
    }

    try { prepareRig(this, 'arthur'); } catch (e) { console.error('[rig] falha ao montar o Arthur', e); this.cache.json.remove('rig_arthur'); }
    this._makeAnimations();
    this._makeEffectTextures();

    // espera as fontes da interface para evitar "pulo" no texto
    try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* ok */ }
    this.scene.start('TitleScene');
  }

  _makeAnimations() {
    const walk = [];
    for (let i = 0; i < 8; i++) walk.push({ key: `arthur_walk_${i}` });
    this.anims.create({ key: 'arthur-walk', frames: walk, frameRate: 11, repeat: -1 });

    const breath = [0, 1, 2, 3, 2, 1];
    const idle = [];
    for (let loop = 0; loop < 3; loop++) breath.forEach((i) => idle.push({ key: `arthur_idle_${i}`, duration: 260 }));
    idle.push({ key: 'arthur_blink', duration: 140 });
    this.anims.create({ key: 'arthur-idle', frames: idle, frameRate: 4, repeat: -1 });

    for (const [type, def] of Object.entries(NPC_TYPES)) {
      this.anims.create({
        key: `${type}-idle`,
        frames: [{ key: def.frames[0], duration: 1400 }, { key: def.frames[1], duration: 1600 }],
        repeat: -1,
      });
    }
  }

  _makeEffectTextures() {
    // gota de chuva e partícula de poeira (efeitos, não arte)
    const g = this.add.graphics();
    g.fillStyle(0xb8c8e8, 1).fillRect(0, 0, 2, 22);
    g.generateTexture('fx_rain', 2, 22);
    g.clear();
    g.fillStyle(0xffffff, 1).fillCircle(3, 3, 3);
    g.generateTexture('fx_dust', 6, 6);
    g.destroy();
  }
}
