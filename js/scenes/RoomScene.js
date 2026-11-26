// Cena de jogo: monta um cômodo a partir de js/data/rooms.js, controla o
// Arthur, a profundidade, as luzes, as interações e os eventos da história.
import { ROOMS } from '../data/rooms.js';
import { DOCS, EVENTS, INTERACTIONS, NPC_TALK, afterInteraction } from '../data/story.js';
import { Player } from '../entities/Player.js';
import { Npc } from '../entities/Npc.js';
import { services } from '../services.js';

const DEPTH = { bg: -1000, light: 4000, dark: 4500, fg: 5000, vignette: 5500, prompt: 6000 };
const INTERACT_RADIUS = 95;

export class RoomScene extends Phaser.Scene {
  constructor() { super('RoomScene'); }

  init(data) {
    this.roomId = data.room || 'guestroom';
    this.spawn = data.spawn || null;
    this.runIntro = !!data.intro;
  }

  create() {
    const { state, audio, ui } = services;
    const room = ROOMS[this.roomId];
    this.room = room;
    this.locked = 0;
    this.npcs = {};
    this.blocks = [];
    this.current = null;
    this.leaving = false;

    // ---------------------------------------------------------- cenário
    this.add.image(0, 0, room.bg).setOrigin(0, 0).setDepth(DEPTH.bg);
    this._addWear(room);
    for (const p of room.props) {
      const img = this.add.image(p.x, p.y, p.key).setOrigin(0.5, 1).setDepth(p.depth ?? p.y);
      if (p.flip) img.setFlipX(true);
      if (p.block) {
        const [w, h] = p.block;
        this.blocks.push({ x1: p.x - w / 2, y1: p.y - h, x2: p.x + w / 2, y2: p.y });
      }
    }
    for (const f of room.foreground || []) {
      this.add.image(f.x, f.y, f.key).setOrigin(0.5, 1).setScrollFactor(f.scroll || 1.2, 1)
        .setDepth(DEPTH.fg).setFlipX(!!f.flip);
    }

    // --------------------------------------------------------- iluminação
    // sombra geral translúcida (funciona em WebGL e Canvas) + luzes aditivas
    this.ambient = this.add.rectangle(0, 0, room.width, 720, 0x06030a).setOrigin(0)
      .setAlpha(room.shade ?? 0.3).setDepth(DEPTH.light);
    this.lights = room.lights.map((l) => this._makeLight(l));
    this.darkness = this.add.rectangle(0, 0, room.width, 720, 0x000000).setOrigin(0).setAlpha(0).setDepth(DEPTH.dark);
    this.add.image(640, 360, 'vignette').setScrollFactor(0).setDepth(DEPTH.vignette);

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
    this.bounds = { x1: 60, x2: room.width - 60 };

    // --------------------------------------------------------------- NPCs
    for (const n of room.npcs || []) {
      if (!n.when || n.when(state)) this.spawnNpc(n.id, n.key, n.x, n.y, n.face);
    }

    // ------------------------------------------------- indicador de interação
    this.prompt = this.add.container(0, 0).setDepth(DEPTH.prompt).setAlpha(0);
    this.promptIcon = this.add.image(0, 0, 'key_e').setScale(0.7);
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
      .setScale((l.r * 2) / 256).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.light + 2);
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
      if (!it.when || it.when(services.state)) consider(it);
    }
    for (const n of Object.values(this.npcs)) {
      if (!NPC_TALK[n.id] || n.walking) continue;
      consider({ id: NPC_TALK[n.id], x: n.x, y: n.y, r: 110, label: `Falar com ${n.id === 'mae' ? 'a Mãe' : n.id === 'pai' ? 'o Pai' : 'a Clara'}`, npc: n });
    }
    return best;
  }

  _showPrompt(target) {
    const key = target ? target.id : null;
    if (key === this.promptKey) {
      if (target && target.npc) this.prompt.setPosition(target.npc.x - 20, target.npc.sprite.getTopCenter().y - 26);
      return;
    }
    this.promptKey = key;
    this.tweens.killTweensOf(this.prompt);
    if (!target) {
      this.tweens.add({ targets: this.prompt, alpha: 0, duration: 150 });
      return;
    }
    this.promptText.setText(target.label || '');
    const [ix, iy] = target.npc ? [target.npc.x - 20, target.npc.sprite.getTopCenter().y - 26] : target.icon || [target.x, target.y - 200];
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
    this.npcs[id].sprite.setTint(this.room.ambient);
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
      goto: async (room, spawn) => {
        scene.leaving = true;
        scene.locked++;
        await ui.fade(1, 450);
        scene.scene.start('RoomScene', { room, spawn });
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
