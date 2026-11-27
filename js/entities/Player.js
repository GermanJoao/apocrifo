// Arthur: movimento lateral com profundidade, animações e passos.
import { CHAR_ORIGIN_Y, CHAR_SCALE } from '../assets.js';
import { Rig } from './Rig.js';
import { WALK } from '../data/rooms.js';
import { depthScale } from './perspective.js';
import { services } from '../services.js';

const SPEED = 205;
const SLOW = 105;
const DEPTH_FACTOR = 0.55; // andar "para dentro" da cena é mais lento
const FEET_W = 46;
const FEET_H = 14;

export class Player {
  constructor(scene, x, y, face = 1, floor = 'wood') {
    this.scene = scene;
    this.floor = floor;
    this.face = face;
    this.moving = false;
    this.autoTarget = null;
    this.playStep = () => services.audio.play(this.floor === 'wood' ? 'step_wood' : 'step_tile');
    this.tied = false;
    if (scene.cache.json.exists('rig_arthur')) {
      // Arthur montado a partir das partes desenhadas (assets/characters/arthur/partes)
      this.rig = new Rig(scene, 'arthur', x, y);
      this.rig.onStep = this.playStep;
      this.sprite = this.rig.container;
    } else {
      // reserva se o rig não carregar: um retângulo discreto, para o jogo seguir
      this.sprite = scene.add.rectangle(x, y, 60, 260, 0x3a1d74).setOrigin(0.5, 1);
      this.sprite.setFlipX = () => this.sprite;
      this.sprite.setTint = () => this.sprite;
    }
    // sombra borrada nos pés
    this.shadow = scene.add.image(x, y, 'fx_shadow').setOrigin(0.5, 0.5).setAlpha(0.9);
    this._apply();
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  feetRect(x = this.sprite.x, y = this.sprite.y) {
    return { x1: x - FEET_W / 2, y1: y - FEET_H, x2: x + FEET_W / 2, y2: y };
  }

  faceTo(dir) { this.face = dir < 0 ? -1 : 1; this._apply(); }

  /** Amarrado na cadeira: não anda e fica na pose sentada. */
  setTied(on, seconds = 0) {
    this.tied = on;
    if (this.rig) this.rig.setRestPose(on ? 'sentado' : 'parado', seconds);
  }

  setTint(c) { (this.rig || this.sprite).setTint(c); }

  _apply() {
    if (this.rig) {
      this.rig.setFace(this.face);
      this.rig.setScaleMul(depthScale(this.sprite.y) / CHAR_SCALE);
    } else {
      this.sprite.setScale(depthScale(this.sprite.y) / CHAR_SCALE * 0.9);
    }
    this.sprite.setDepth(this.sprite.y);
    if (this.shadow) {
      const s = depthScale(this.sprite.y) / CHAR_SCALE;
      this.shadow.setPosition(this.sprite.x + (this.tied ? 6 : 0), this.sprite.y - 2)
        .setScale(0.85 * s * (this.tied ? 1.2 : 1), 0.9 * s)
        .setDepth(this.sprite.y - 3);
    }
  }

  _setAnim(moving, slow) {
    if (this.rig) this.rig.setWalking(moving, slow ? 0.6 : 1);

  }

  _collides(rect, blocks) {
    return blocks.some((b) => rect.x1 < b.x2 && rect.x2 > b.x1 && rect.y1 < b.y2 && rect.y2 > b.y1);
  }

  /** Movimento controlado pelo jogador. input = {x:-1..1, y:-1..1, slow:boolean} */
  update(dt, input, bounds, blocks) {
    let { x: ix, y: iy } = input;
    if (this.tied) { ix = 0; iy = 0; }

    // movimento automático (cutscenes)
    if (this.autoTarget) {
      const t = this.autoTarget;
      const dx = t.x - this.sprite.x;
      const dy = t.y - this.sprite.y;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) {
        this.autoTarget = null;
        t.resolve();
        ix = 0; iy = 0;
      } else {
        ix = Math.abs(dx) > 4 ? Math.sign(dx) : 0;
        iy = Math.abs(dy) > 4 ? Math.sign(dy) : 0;
        blocks = [];
      }
    }

    const speed = input.slow ? SLOW : SPEED;
    const len = Math.hypot(ix, iy) || 1;
    const vx = (ix / len) * speed * dt;
    const vy = (iy / len) * speed * DEPTH_FACTOR * dt;

    let nx = Phaser.Math.Clamp(this.sprite.x + vx, bounds.x1, bounds.x2);
    let ny = Phaser.Math.Clamp(this.sprite.y + vy, WALK.yMin, WALK.yMax);
    // resolve cada eixo separadamente para deslizar pelas bordas
    if (this._collides(this.feetRect(nx, this.sprite.y), blocks)) nx = this.sprite.x;
    if (this._collides(this.feetRect(nx, ny), blocks)) ny = this.sprite.y;

    const moved = Math.abs(nx - this.sprite.x) > 0.01 || Math.abs(ny - this.sprite.y) > 0.01;
    this.sprite.x = nx;
    this.sprite.y = ny;
    if (ix !== 0) this.face = ix < 0 ? -1 : 1;

    this.moving = moved;
    this._setAnim(moved, input.slow);
    if (this.rig) this.rig.update(dt);
    this._apply();
  }

  /** Caminha sozinho até um ponto (usado em eventos). */
  walkTo(x, y) {
    return new Promise((resolve) => { this.autoTarget = { x, y, resolve }; });
  }

  stop() {
    if (this.moving) {
      this.moving = false;
      this._setAnim(false);
    }
  }
}
