// Personagens não jogáveis: respiram, olham para o Arthur e podem andar.
import { CHAR_ORIGIN_Y, CHAR_SCALE } from '../assets.js';
import { NPC_TYPES } from '../data/rooms.js';
import { depthScale } from './perspective.js';
import { refScale } from '../assets.js';
import { Rig } from './Rig.js';

export class Npc {
  constructor(scene, id, type, x, y, face = -1) {
    this.scene = scene;
    this.id = id;
    this.type = type;
    const def = NPC_TYPES[type];
    if (scene.cache.json.exists(`rig_${type}`) && scene.registry.get(`rig_${type}:trims`)) {
      // personagem montado com as partes desenhadas (rig.json)
      this.rig = new Rig(scene, type, x, y);
      this.sprite = this.rig.container;
      this.scaleMul = def.rigScale || 1;
    } else {
      this.sprite = scene.add.sprite(x, y, def.frames[0]).setOrigin(0.5, CHAR_ORIGIN_Y);
      this.sprite.play(`${type}-idle`);
      this.scaleMul = (def.scale || 1) * refScale(scene, def.frames[0]);
      this.hasWalk = scene.anims.exists(`${type}-walk`);
    }
    this.face = face;
    this.walking = null;
    this.lookAtPlayer = true;
    this.bobT = 0;
    // sombra borrada nos pés (igual à do Arthur)
    this.shadow = scene.add.image(x, y, 'fx_shadow').setOrigin(0.5, 0.5);
    this._apply();
  }

  get x() { return this.sprite.x; }
  get y() { return this.walking ? this.walking.baseY : this.sprite.y; }

  /** Área sólida no chão (o Arthur contorna). */
  blockRect() {
    return { x1: this.sprite.x - 24, y1: this.y - 12, x2: this.sprite.x + 24, y2: this.y };
  }

  setTint(c) { (this.rig || this.sprite).setTint(c); return this; }

  /** Topo da cabeça na tela (para o ícone de interação). */
  topY() { return this.rig ? this.rig.topY() : this.sprite.getTopCenter().y; }

  _apply() {
    if (this.rig) {
      this.rig.setFace(this.face);
      this.rig.setScaleMul(depthScale(this.y) * this.scaleMul / CHAR_SCALE);
    } else {
      this.sprite.setFlipX(this.face < 0);
      this.sprite.setScale(depthScale(this.y) * this.scaleMul);
    }
    this.sprite.setDepth(this.y);
    const s = depthScale(this.y) * this.scaleMul / CHAR_SCALE * (this.rig ? 0.85 : 1);
    this.shadow.setPosition(this.sprite.x, this.y - 2).setScale(0.8 * s, 0.9 * s)
      .setDepth(this.y - 3).setAlpha(0.9 * this.sprite.alpha);
  }

  update(dt, player) {
    if (this.walking) {
      const w = this.walking;
      const dx = w.x - this.sprite.x;
      const dy = w.y - w.baseY;
      const dist = Math.hypot(dx, dy);
      const step = w.speed * dt;
      if (dist <= step) {
        this.sprite.x = w.x;
        w.baseY = w.y;
        this.sprite.y = w.y;
        this.walking = null;
        w.resolve();
      } else {
        this.sprite.x += (dx / dist) * step;
        w.baseY += (dy / dist) * step;
        this.bobT += dt * 9;
        // rig e quadros de caminhada já animam os passos; sem eles o desenho só quica
        this.sprite.y = (this.rig || this.hasWalk) ? w.baseY : w.baseY - Math.abs(Math.sin(this.bobT)) * 4;
        if (Math.abs(dx) > 1) this.face = dx < 0 ? -1 : 1;
      }
    } else if (this.lookAtPlayer && player && Math.abs(player.x - this.sprite.x) < 520) {
      // vira lentamente para o Arthur quando ele se aproxima
      const want = player.x < this.sprite.x ? -1 : 1;
      if (want !== this.face && Math.abs(player.x - this.sprite.x) > 30) this.face = want;
    }
    if (this.rig) {
      this.rig.setWalking(!!this.walking, 1);
      this.rig.update(dt);
    } else if (this.hasWalk) {
      const want = `${this.type}-${this.walking ? 'walk' : 'idle'}`;
      if (this.sprite.anims.currentAnim?.key !== want) this.sprite.play(want);
    }
    this._apply();
  }

  walkTo(x, y, speed = 120) {
    return new Promise((resolve) => {
      this.walking = { x, y, speed, baseY: this.sprite.y, resolve };
    });
  }

  destroy() { this.sprite.destroy(); this.shadow.destroy(); }
}
