import { WALK } from '../data/rooms.js';
import { CHAR_SCALE } from '../assets.js';

/** Escala dos personagens conforme a profundidade (mais ao fundo = menor). */
export function depthScale(y) {
  const t = Phaser.Math.Clamp((y - WALK.yMin) / (WALK.yMax - WALK.yMin), 0, 1);
  return CHAR_SCALE * Phaser.Math.Linear(0.9, 1.03, t);
}
