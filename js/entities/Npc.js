// Personagens não jogáveis: respiram, olham para o Arthur e podem andar.
import { CHAR_ORIGIN_Y } from '../assets.js';
import { NPC_TYPES } from '../data/rooms.js';
import { depthScale } from './perspective.js';

export class Npc {
  constructor(scene, id, type, x, y, face = -1) {
    this.scene = scene;
    this.id = id;
    this.type = type;
    const def = NPC_TYPES[type];
    this.sprite = scene.add.sprite(x, y, def.frames[0]).setOrigin(0.5, CHAR_ORIGIN_Y);
    this.sprite.play(`${type}-idle`);
    this.scaleMul = def.scale || 1;
    this.face = face;
    this.walking = null;
    this.lookAtPlayer = true;
    this.bobT = 0;
    this._apply();
  }

  get x() { return this.sprite.x; }
  get y() { return this.walking ? this.walking.baseY : this.sprite.y; }

  /** Área sólida no chão (o Arthur contorna). */
  blockRect() {
    return { x1: this.sprite.x - 24, y1: this.y - 12, x2: this.sprite.x + 24, y2: this.y };
  }

  _apply() {
    this.sprite.setFlipX(this.face < 0);
    this.sprite.setScale(depthScale(this.y) * this.scaleMul);
    this.sprite.setDepth(this.y);
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
        this.sprite.y = w.baseY - Math.abs(Math.sin(this.bobT)) * 4;
        if (Math.abs(dx) > 1) this.face = dx < 0 ? -1 : 1;
      }
    } else if (this.lookAtPlayer && player && Math.abs(player.x - this.sprite.x) < 520) {
      // vira lentamente para o Arthur quando ele se aproxima
      const want = player.x < this.sprite.x ? -1 : 1;
      if (want !== this.face && Math.abs(player.x - this.sprite.x) > 30) this.face = want;
    }
    this._apply();
  }

  walkTo(x, y, speed = 120) {
    return new Promise((resolve) => {
      this.walking = { x, y, speed, baseY: this.sprite.y, resolve };
    });
  }

  destroy() { this.sprite.destroy(); }
}
