// Carrega todas as imagens, cria as animações e trata falhas de carregamento.
import { IMAGE_ASSETS } from '../assets.js';
import { NPC_TYPES } from '../data/rooms.js';
import { services } from '../services.js';
import { loadRig, prepareRig } from '../entities/Rig.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.failed = [];
    this.load.on('progress', (p) => services.ui.setLoading(p));
    // arquivos opcionais: se não existirem, o jogo usa a versão provisória sem avisar
    this.optional = new Set(['arthur_amarrado', 'arthur_amarrado_olhos', 'arthur_cadeira_vazia']);
    this.load.on('loaderror', (file) => {
      if (this.optional.has(file.key)) return;
      this.failed.push(file.key);
      console.error('[assets] falha ao carregar', file.src);
    });
    loadRig(this, 'arthur', 'assets/characters/arthur/');
    loadRig(this, 'clara', 'assets/characters/daughter/');
    // Arthur amarrado na cadeira (desenho estático do autor, opcional)
    this.load.image('arthur_amarrado', 'assets/characters/arthur/amarrado.png');
    this.load.image('arthur_amarrado_olhos', 'assets/characters/arthur/amarrado_olhos_fechados.png');
    this.load.image('arthur_cadeira_vazia', 'assets/characters/arthur/cadeira_vazia.png');
    // texturas CC0 (ambientCG) convertidas em camadas de desgaste — ver CREDITS.md
    for (const t of ['sujeira_parede', 'veios_piso', 'manchas_piso']) this.load.image(`tex_${t}`, `assets/textures/${t}.png`);
    for (const a of IMAGE_ASSETS) this.load.image(a.key, a.url);
  }

  async create() {
    // substitui assets ausentes por uma textura discreta, para o jogo não travar
    for (const key of this.failed) {
      const a = IMAGE_ASSETS.find((x) => x.key === key) || { w: 64, h: 64 };
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
    try { prepareRig(this, 'clara'); } catch (e) { console.error('[rig] falha ao montar a Clara', e); this.cache.json.remove('rig_clara'); }
    this._makeAnimations();
    this._makeEffectTextures();

    // espera as fontes da interface para evitar "pulo" no texto
    try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* ok */ }
    this.scene.start('TitleScene');
  }

  _makeAnimations() {
    for (const [type, def] of Object.entries(NPC_TYPES)) {
      this.anims.create({
        key: `${type}-idle`,
        frames: [{ key: def.frames[0], duration: 1400 }, { key: def.frames[1], duration: 1600 }],
        repeat: -1,
      });
      // caminhada: os quadros que existirem, em loop (~0,7 s por ciclo)
      const walk = (def.walk || []).filter((k) => this.textures.exists(k));
      if (walk.length) {
        this.anims.create({ key: `${type}-walk`, frames: walk.map((key) => ({ key })), frameRate: 6, repeat: -1 });
      }
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
    // sombra borrada embaixo dos personagens: elipses sobrepostas = borda suave
    const sg = this.add.graphics();
    const steps = 14;
    for (let i = 0; i < steps; i++) {
      const k = 1 - i / steps;
      sg.fillStyle(0x000000, 0.1);
      sg.fillEllipse(128, 32, 240 * k + 16, 56 * k + 6);
    }
    sg.generateTexture('fx_shadow', 256, 64);
    sg.destroy();
  }
}
