// Cena de jogo: monta um cômodo a partir de js/data/rooms.js, controla o
// Arthur, a profundidade, as luzes, as interações e os eventos da história.
import { ROOMS } from '../data/rooms.js';
import { refScale } from '../assets.js';
import { DOCS, EVENTS, INTERACTIONS, NPC_TALK, PARANOIA, afterInteraction } from '../data/story.js';
import { Player } from '../entities/Player.js';
import { Npc } from '../entities/Npc.js';
import { services } from '../services.js';

const DEPTH = { bg: -1000, light: 4000, dark: 4500, fg: 5000, vignette: 5500, prompt: 6000 };
const INTERACT_RADIUS = 95;
// barulho por segundo andando normalmente (Shift = silencioso)
const NOISE_RATE = { wood: 0.11, tile: 0.15, concrete: 0.08 };
const NOISE_DECAY = 0.07;

export class RoomScene extends Phaser.Scene {
  constructor() { super('RoomScene'); }

  init(data) {
    this.roomId = data.room || 'guestroom';
    this.spawn = data.spawn || null;
    this.runIntro = !!data.intro;
  }

  create() {
    const { state, audio, ui } = services;
    const base = ROOMS[this.roomId];
    this.fase1 = state.flag('fase1');
    // na Fase 1 a versão "noite" substitui luz, som e NPCs
    const room = this.fase1 && base.noite ? { ...base, ...base.noite } : base;
    this.room = room;
    this.noise = 0;
    this.catching = false;
    this.locked = 0;
    this.npcs = {};
    this.blocks = [];
    this.current = null;
    this.leaving = false;

    // ---------------------------------------------------------- cenário
    this.add.image(0, 0, room.bg).setOrigin(0, 0).setDepth(DEPTH.bg).setScale(refScale(this, room.bg));
    this._addWear(room);
    for (const p of room.props) {
      if (p.when && !p.when(state)) continue;
      const img = this.add.image(p.x, p.y, p.key).setOrigin(0.5, 1).setDepth(p.depth ?? p.y).setScale((p.scale || 1) * refScale(this, p.key));
      if (p.key === 'cadeira_cativeiro') this.chairProp = img;
      if (p.flip) img.setFlipX(true);
      if (p.block) {
        const [w, h] = p.block;
        this.blocks.push({ x1: p.x - w / 2, y1: p.y - h, x2: p.x + w / 2, y2: p.y });
      }
    }
    for (const f of room.foreground || []) {
      this.add.image(f.x, f.y, f.key).setOrigin(0.5, 1).setScrollFactor(f.scroll || 1.2, 1).setScale(refScale(this, f.key))
        .setDepth(DEPTH.fg).setFlipX(!!f.flip);
    }

    // --------------------------------------------------------- iluminação
    // sombra geral translúcida (funciona em WebGL e Canvas) + luzes aditivas
    this.ambient = this.add.rectangle(0, 0, room.width, 720, 0x06030a).setOrigin(0)
      .setAlpha(room.shade ?? 0.3).setDepth(DEPTH.light);
    this.lights = room.lights.map((l) => this._makeLight(l));
    this.darkness = this.add.rectangle(0, 0, room.width, 720, 0x000000).setOrigin(0).setAlpha(0).setDepth(DEPTH.dark);
    this.add.image(640, 360, 'vignette').setScrollFactor(0).setDepth(DEPTH.vignette).setDisplaySize(1280, 720);

    // poeira flutuando na luz
    this.add.particles(0, 0, 'fx_dust', {
      x: { min: 0, max: room.width },
      y: { min: 80, max: 600 },
      lifespan: 9000,
      speedX: { min: -6, max: 6 },
      speedY: { min: -4, max: 4 },
      scale: { min: 0.2, max: 0.6 },
      alpha: { start: 0, end: 0.25, ease: 'Sine.easeInOut', yoyo: true },
      quantity: 1,
      frequency: 400,
    }).setDepth(DEPTH.light + 1).setBlendMode(Phaser.BlendModes.ADD);

    // ------------------------------------------------------------ Arthur
    const sp = this.spawn || room.start;
    this.player = new Player(this, sp.x, sp.y, sp.face || 1, room.floor);
    this.player.setTint(room.ambient);
    // Arthur amarrado na cadeira do porão
    if (this.roomId === 'basement' && state.flag('amarrado')) {
      this.player.setTied(true);
      if (this.textures.exists('arthur_amarrado')) this._showTiedDrawing();
      else this.ropes = this.add.image(sp.x, sp.y + 4, 'cordas').setOrigin(0.5, 1).setScale(0.62 * refScale(this, 'cordas')).setDepth(sp.y + 2).setTint(room.ambient);
    }
    if (this.roomId === 'basement' && !state.flag('amarrado') && this.chairProp && this.textures.exists('arthur_cadeira_vazia')) {
      this._useEmptyChairDrawing();
    }
    this.bounds = { x1: 60, x2: room.width - 60 };

    // --------------------------------------------------------------- NPCs
    for (const n of this.fase1 ? (room.npcs || []).filter((q) => q.fase1) : room.npcs || []) {
      if (!n.when || n.when(state)) this.spawnNpc(n.id, n.key, n.x, n.y, n.face);
    }

    // ------------------------------------------------- indicador de interação
    this.prompt = this.add.container(0, 0).setDepth(DEPTH.prompt).setAlpha(0);
    this.promptIcon = this.add.image(0, 0, 'key_e').setScale(0.7 * refScale(this, 'key_e'));
    this.promptText = this.add.text(22, 0, '', {
      fontFamily: '"Special Elite", "Courier New", monospace',
      fontSize: '17px',
      color: '#e6dcc8',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    this.prompt.add([this.promptIcon, this.promptText]);
    this.tweens.add({ targets: this.promptIcon, y: -4, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });

    // ------------------------------------------------------------ câmera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, room.width, 720);
    cam.startFollow(this.player.sprite, true, 0.07, 0.07);
    cam.fadeIn(700, 0, 0, 0);

    // ----------------------------------------------------------- controles
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,UP,DOWN,LEFT,RIGHT,SHIFT,SPACE');

    // ------------------------------------------------------ áudio e estado
    audio.setAmbience(room.ambience || []);
    state.room = this.roomId;
    state.pos = { x: sp.x, y: sp.y, face: sp.face || 1 };
    state.save();
    ui.fade(0, 400);
    ui.setInventory(state.items, this.fase1 || state.items.length > 0);
    ui.setNoise(0, this.fase1);
    this._scheduleParanoia();
    if (!this.runIntro) ui.toast(room.name, 1800);

    this.ctx = this.makeContext();
    if (this.runIntro) this.runScript(EVENTS.intro);
  }

  /** Camadas de sujeira/desgaste sobre parede e piso (texturas fotográficas CC0). */
  _addWear(room) {
    const wear = room.wear || {};
    const W = room.width;
    if (this.textures.exists('tex_sujeira_parede')) {
      this.add.tileSprite(0, 0, W, 446, 'tex_sujeira_parede').setOrigin(0)
        .setAlpha(wear.wall ?? 0.5).setDepth(DEPTH.bg + 1).setTilePosition(W * 0.37, 90);
    }
    if (room.floor === 'wood' && this.textures.exists('tex_veios_piso')) {
      this.add.tileSprite(0, 466, W, 254, 'tex_veios_piso').setOrigin(0)
        .setTileScale(1.2, 0.55).setAlpha(wear.floor ?? 0.4).setDepth(DEPTH.bg + 1);
    }
    if (this.textures.exists('tex_manchas_piso')) {
      this.add.tileSprite(0, 466, W, 254, 'tex_manchas_piso').setOrigin(0)
        .setTileScale(1, 0.6).setAlpha(wear.stains ?? 0.55).setDepth(DEPTH.bg + 1);
    }
  }

  _makeLight(l) {
    const img = this.add.image(l.x, l.y, 'glow').setTint(l.color).setAlpha(l.alpha)
      .setScale(((l.r * 2) / 256) * refScale(this, 'glow')).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.light + 2);
    img.base = l.alpha;
    if (l.flicker) {
      // tremulação irregular (lâmpada velha, vela, televisão)
      this.time.addEvent({
        delay: 120,
        loop: true,
        callback: () => {
          if (Math.random() < l.flicker * 0.15) {
            img.setAlpha(img.base * Phaser.Math.FloatBetween(0.2, 0.7));
            this.time.delayedCall(Phaser.Math.Between(40, 140), () => img.setAlpha(img.base));
          }
        },
      });
    }
    if (l.pulse) {
      this.tweens.add({ targets: img, alpha: l.alpha * 0.4, yoyo: true, repeat: -1, duration: 2200, ease: 'Sine.easeInOut' });
    }
    return img;
  }

  // ===================================================================
  // LOOP
  // ===================================================================
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const { ui } = services;
    const busy = ui.isBusy() || this.locked > 0;
    const k = this.keys;

    let input = { x: 0, y: 0, slow: false };
    if (!busy) {
      input = {
        x: (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0),
        y: (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0),
        slow: k.SHIFT.isDown,
      };
    }
    const blocks = this.blocks.concat(Object.values(this.npcs).map((n) => n.blockRect()));
    this.player.update(dt, input, this.bounds, blocks);
    if (this.fase1 && !busy) this._updateNoise(dt, input);
    for (const n of Object.values(this.npcs)) n.update(dt, this.player);

    // interação mais próxima
    const target = busy ? null : this._nearest();
    this._showPrompt(target);
    if (target && Phaser.Input.Keyboard.JustDown(k.E) && !ui.recentlyClosed()) {
      this.interact(target);
    } else if (busy) {
      Phaser.Input.Keyboard.JustDown(k.E); // consome o toque
    }
  }

  _nearest() {
    const px = this.player.x;
    const py = this.player.y;
    let best = null;
    let bestD = Infinity;
    const consider = (item) => {
      const dx = px - item.x;
      const dy = (py - item.y) * 1.6;
      const d = Math.hypot(dx, dy) * (item.npc ? 0.7 : 1); // pessoas têm prioridade
      if (d < (item.r || INTERACT_RADIUS) && d < bestD) { best = item; bestD = d; }
    };
    for (const it of this.room.interactables) {
      if (this._active(it)) consider(it);
    }
    for (const n of Object.values(this.npcs)) {
      if (!NPC_TALK[n.id] || n.walking) continue;
      consider({ id: NPC_TALK[n.id], x: n.x, y: n.y, r: 110, label: `Falar com ${n.id === 'mae' ? 'a Mãe' : n.id === 'pai' ? 'o Pai' : 'a Clara'}`, npc: n });
    }
    return best;
  }

  // ------------------------------------------- Arthur amarrado (desenho)
  /**
   * Desenho estático do autor (assets/characters/arthur/amarrado.png), na mesma
   * tela 1080×1080 e escala das partes do Arthur, com o chão na mesma linha.
   */
  _canvasTransform() {
    const rig = this.player.rig;
    const tela = rig ? rig.data.tela : 1080;
    const scale = rig ? rig.baseScale * rig.scaleMul : 0.28;
    const ground = rig ? rig.ground : 1000;
    const cx = rig ? (rig.data.centroX || tela / 2) : 540;
    return { scale, ox: cx / tela, oy: ground / tela };
  }

  _showTiedDrawing() {
    const { scale, ox, oy } = this._canvasTransform();
    const p = this.player;
    p.sprite.setVisible(false);
    if (this.chairProp) this.chairProp.setVisible(false);
    const tint = this.room.ambient;
    this.tiedImg = this.add.image(p.x, p.y, 'arthur_amarrado').setOrigin(ox, oy).setScale(scale).setDepth(p.y).setTint(tint);
    if (this.textures.exists('arthur_amarrado_olhos')) {
      this.tiedBlink = this.add.image(p.x, p.y, 'arthur_amarrado_olhos').setOrigin(ox, oy).setScale(scale).setDepth(p.y + 1).setTint(tint).setVisible(false);
      this.time.addEvent({ delay: 3800, loop: true, callback: () => {
        if (!this.tiedBlink) return;
        this.tiedBlink.setVisible(true);
        this.time.delayedCall(140, () => this.tiedBlink && this.tiedBlink.setVisible(false));
      } });
    }
    // respiração: incha um tiquinho a partir do chão
    this.tweens.add({ targets: [this.tiedImg, this.tiedBlink].filter(Boolean), scaleY: scale * 1.012, yoyo: true, repeat: -1, duration: 1700, ease: 'Sine.easeInOut' });
  }

  /** Tranco da cadeira no minigame (forte = errou o ritmo). */
  jolt(strong) {
    const targets = [this.tiedImg, this.tiedBlink].filter(Boolean);
    if (!targets.length) return;
    const ang = (strong ? 2.6 : 1.2) * (Math.random() < 0.5 ? -1 : 1);
    this.tweens.add({ targets, angle: ang, x: `+=${strong ? 5 : 2}`, duration: 70, yoyo: true, ease: 'Sine.easeOut' });
    if (strong) this.cameras.main.shake(120, 0.003);
  }

  _useEmptyChairDrawing() {
    const { scale, ox, oy } = this._canvasTransform();
    const c = this.chairProp;
    const x = this.room.start.x;
    const y = this.room.start.y;
    c.setTexture('arthur_cadeira_vazia').setOrigin(ox, oy).setScale(scale).setPosition(x, y).setDepth(y - 2).setVisible(true);
  }

  /** A interação existe nesta fase? */
  _active(it) {
    if (it.when && !it.when(services.state)) return false;
    const fase = this.fase1 ? 1 : 2;
    if (it.fases) return it.fases.includes(fase);
    if (it.fase) return it.fase === fase;
    return fase === 2 || !!it.door;
  }

  // ------------------------------------------------------------ barulho
  _updateNoise(dt, input) {
    const moving = this.player.moving && !this.player.tied;
    if (moving && !input.slow) this.noise += (NOISE_RATE[this.room.floor] || 0.1) * dt;
    else this.noise = Math.max(0, this.noise - NOISE_DECAY * dt);
    services.ui.setNoise(this.noise, true);
    if (this.noise >= 1 && !this.catching) this.caught();
  }

  addNoise(v) {
    if (!services.state.flag('fase1')) return false;
    this.noise = Math.max(0, Math.min(1.2, this.noise + v));
    services.ui.setNoise(this.noise, true);
    if (this.noise >= 1 && !this.catching && !this.player.tied) { this.caught(); return true; }
    return this.noise >= 1;
  }

  caught(by) {
    this.catching = true;
    const who = by || this.room.vigia || 'mae';
    this.runScript((ctx) => EVENTS.caught(ctx, who, this.roomId));
  }

  // ----------------------------------------------------------- paranoia
  _scheduleParanoia() {
    const st = services.state;
    const base = this.fase1 ? 22000 : 70000;
    const intensity = Math.min(1, (st.seen.paranoia || 0) / 8);
    const delay = Phaser.Math.Between(base * (1 - intensity * 0.5), base * 1.6 * (1 - intensity * 0.4));
    this.paranoiaTimer = this.time.delayedCall(delay, async () => {
      if (!services.ui.isBusy() && this.locked === 0 && !this.leaving) {
        st.touch('paranoia');
        try { await PARANOIA(this.ctx, this.roomId, this.fase1); } catch (e) { console.error(e); }
      }
      this._scheduleParanoia();
    });
  }

  _showPrompt(target) {
    const key = target ? target.id : null;
    if (key === this.promptKey) {
      if (target && target.npc) this.prompt.setPosition(target.npc.x - 20, target.npc.topY() - 26);
      return;
    }
    this.promptKey = key;
    this.tweens.killTweensOf(this.prompt);
    if (!target) {
      this.tweens.add({ targets: this.prompt, alpha: 0, duration: 150 });
      return;
    }
    this.promptText.setText(target.label || '');
    const [ix, iy] = target.npc ? [target.npc.x - 20, target.npc.topY() - 26] : target.icon || [target.x, target.y - 200];
    this.prompt.setPosition(ix - this.promptText.width / 2, iy);
    this.tweens.add({ targets: this.prompt, alpha: 1, duration: 180 });
  }

  async interact(target) {
    this.current = target;
    services.audio.play('interact');
    if (target.npc) {
      target.npc.face = this.player.x < target.npc.x ? -1 : 1;
      this.player.faceTo(target.npc.x - this.player.x);
    } else if (Math.abs(target.x - this.player.x) > 10) {
      this.player.faceTo(target.x - this.player.x);
    }
    const handler = INTERACTIONS[target.id];
    if (handler) {
      await this.runScript(handler);
    } else if (target.door) {
      await this.runScript(() => this.ctx.useDoor());
    }
    if (!this.leaving) await this.runScript((ctx) => afterInteraction(ctx, this.roomId));
  }

  async runScript(fn) {
    this.locked++;
    this.player.stop();
    try {
      await fn(this.ctx);
    } catch (e) {
      console.error('[história] erro no evento', e);
      services.ui.error(`Erro no evento: ${e.message}`);
    } finally {
      this.locked = Math.max(0, this.locked - 1);
    }
  }

  // ===================================================================
  // NPCs
  // ===================================================================
  spawnNpc(id, type, x, y, face) {
    if (this.npcs[id]) this.npcs[id].destroy();
    this.npcs[id] = new Npc(this, id, type, x, y, face);
    this.npcs[id].setTint(this.room.ambient);
    this.npcs[id].sprite.setAlpha(0);
    this.tweens.add({ targets: this.npcs[id].sprite, alpha: 1, duration: 400 });
    return this.npcs[id];
  }

  removeNpc(id) {
    const n = this.npcs[id];
    if (!n) return;
    delete this.npcs[id];
    this.tweens.add({ targets: n.sprite, alpha: 0, duration: 300, onComplete: () => n.destroy() });
  }

  // ===================================================================
  // API usada pelos roteiros (story.js)
  // ===================================================================
  makeContext() {
    const scene = this;
    const { ui, audio, state } = services;
    return {
      state,
      say: (who, text) => ui.dialogue.say(who, text),
      talk: async (list) => { for (const [w, t] of list) await ui.dialogue.say(w, t); },
      choose: (who, text, options) => ui.dialogue.choose(who, text, options),
      read: async (id) => {
        state.markDoc(id);
        await ui.reader.open(DOCS[id]);
      },
      wait: (ms) => new Promise((r) => scene.time.delayedCall(ms, r)),
      sfx: (name) => audio.play(name),
      toast: (text) => ui.toast(text),
      hint: (show) => ui.controlsHint(show),
      save: () => {
        state.pos = { x: scene.player.x, y: scene.player.y, face: scene.player.face };
        state.save();
      },
      npc: (id) => scene.npcs[id] || null,
      spawnNpc: (id, type, x, y, face) => scene.spawnNpc(id, type, x, y, face),
      removeNpc: (id) => scene.removeNpc(id),
      walkNpc: (id, x, y, speed) => scene.npcs[id]?.walkTo(x, y, speed) ?? Promise.resolve(),
      walkPlayer: (x, y) => scene.player.walkTo(x, y),
      playerX: () => scene.player.x,
      facePlayerTo: (x) => scene.player.faceTo(x - scene.player.x),
      give: (item) => { state.give(item); ui.setInventory(state.items, true); },
      take: (item) => { state.items = state.items.filter((i) => i !== item); ui.setInventory(state.items, scene.fase1 || state.items.length > 0); },
      noise: (v) => scene.addNoise(v),
      whisper: (text, ms) => ui.whisper(text, ms),
      struggle: (opts) => ui.struggle(opts),
      roomId: () => scene.roomId,
      freePlayer: async () => {
        if (scene.tiedImg) {
          // desenho estático: corte rápido no escuro e ele aparece de pé ao lado da cadeira
          await new Promise((r) => scene.tweens.add({ targets: scene.darkness, alpha: 1, duration: 350, onComplete: r }));
          scene.tiedImg.destroy(); scene.tiedImg = null;
          if (scene.tiedBlink) { scene.tiedBlink.destroy(); scene.tiedBlink = null; }
          scene.player.setTied(false, 0);
          scene.player.sprite.setVisible(true);
          scene.player.sprite.x += 80;
          if (scene.chairProp) {
            if (scene.textures.exists('arthur_cadeira_vazia')) scene._useEmptyChairDrawing();
            else scene.chairProp.setVisible(true);
          }
          await new Promise((r) => scene.time.delayedCall(250, r));
          await new Promise((r) => scene.tweens.add({ targets: scene.darkness, alpha: 0, duration: 500, onComplete: r }));
          return;
        }
        scene.player.setTied(false, 0.9);
        if (scene.ropes) {
          const ropes = scene.ropes;
          scene.ropes = null;
          scene.tweens.add({ targets: ropes, alpha: 0, y: ropes.y + 20, duration: 500, onComplete: () => ropes.destroy() });
        }
        const drop = scene.add.image(scene.player.x + 20, scene.player.y, 'cordas_chao').setOrigin(0.5, 1).setScale(refScale(scene, 'cordas_chao')).setDepth(scene.player.y - 1).setAlpha(0);
        scene.tweens.add({ targets: drop, alpha: 1, duration: 600 });
        await new Promise((r) => scene.time.delayedCall(1000, r));
      },
      jolt: (strong) => scene.jolt(strong),
      tieAgain: () => {
        scene.player.setTied(true, 0.5);
        if (!scene.ropes) scene.ropes = scene.add.image(scene.player.x, scene.player.y + 4, 'cordas').setOrigin(0.5, 1).setScale(0.62).setDepth(scene.player.y + 2);
      },
      vulto: (x, y = 530, dir = 1) => new Promise((r) => {
        const v = scene.add.image(x, y, 'vulto').setOrigin(0.5, 1).setDepth(y - 30).setAlpha(0).setScale(0.62 * refScale(scene, 'vulto'));
        scene.tweens.add({ targets: v, alpha: 0.85, duration: 120, yoyo: true, hold: 260 });
        scene.tweens.add({ targets: v, x: x + dir * 260, duration: 520, onComplete: () => { v.destroy(); r(); } });
      }),
      setPhase2: () => {
        state.set('fase1', false);
        state.set('fase2');
        ui.setNoise(0, false);
      },
      flicker: async (times = 3) => {
        for (let i = 0; i < times; i++) {
          audio.play('flicker');
          scene.darkness.setAlpha(0.85);
          scene.lights.forEach((l) => l.setAlpha(0));
          await new Promise((r) => scene.time.delayedCall(Phaser.Math.Between(60, 180), r));
          scene.darkness.setAlpha(0);
          scene.lights.forEach((l) => l.setAlpha(l.base));
          await new Promise((r) => scene.time.delayedCall(Phaser.Math.Between(80, 400), r));
        }
      },
      darken: (alpha, ms = 800) => new Promise((r) => scene.tweens.add({ targets: scene.darkness, alpha, duration: ms, onComplete: r })),
      useDoor: async () => {
        const door = scene.current?.door;
        if (!door) return;
        const isArch = /arch/.test(scene.current.id);
        if (!isArch) audio.play('door_open');
        if (!isArch) setTimeout(() => audio.play('door_close'), 650);
        await scene.ctx.goto(door.to, door.spawn);
      },
      goto: async (room, spawn, opts = {}) => {
        scene.leaving = true;
        scene.locked++;
        await ui.fade(1, opts.intro ? 1200 : 450);
        scene.scene.start('RoomScene', { room, spawn, intro: !!opts.intro });
      },
      ending: async (lines) => {
        await ui.fade(1, 1800);
        audio.setAmbience(['amb_rain']);
        services.state.constructor.clearSave();
        scene.scene.pause();
        await ui.ending(lines);
      },
    };
  }
}
