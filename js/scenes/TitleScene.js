// Tela inicial: fachada da casa, chuva e o menu em HTML.
import { services } from '../services.js';
import { GameState } from '../systems/state.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const { ui, audio } = services;
    this.cameras.main.fadeIn(1200, 0, 0, 0);
    this.bg = this.add.image(640, 360, 'title_bg').setScale(1.04);

    this.add.particles(0, 0, 'fx_rain', {
      x: { min: -100, max: 1380 },
      y: -30,
      lifespan: 1100,
      speedY: { min: 700, max: 900 },
      speedX: -120,
      rotate: 8,
      scaleY: { min: 0.6, max: 1.2 },
      alpha: { min: 0.08, max: 0.25 },
      quantity: 3,
      frequency: 16,
    });

    // janela que acende e apaga de vez em quando
    this.windowGlow = this.add.image(845, 410, 'glow').setTint(0xffa040).setBlendMode(Phaser.BlendModes.ADD).setScale(1.1).setAlpha(0);
    this.time.addEvent({
      delay: 5200,
      loop: true,
      callback: () => this.tweens.add({ targets: this.windowGlow, alpha: { from: 0, to: 0.45 }, yoyo: true, duration: 900, hold: 600 }),
    });

    this.add.image(640, 360, 'vignette');
    ui.showTitle(GameState.hasSave());
    audio.setAmbience(['amb_rain', 'music_title']);
  }

  update(time) {
    this.bg.x = 640 + Math.sin(time / 4000) * 6;
  }
}
