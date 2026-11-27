// Tela inicial: fachada da casa, chuva e o menu em HTML.
import { services } from '../services.js';
import { GameState } from '../systems/state.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const { ui, audio } = services;
    this.cameras.main.fadeIn(1200, 0, 0, 0);
    // a imagem cobre a tela inteira, qualquer que seja o tamanho do PNG
    this.bg = this.add.image(640, 360, 'title_bg');
    const src = this.bg.texture.getSourceImage();
    this.bgScale = Math.max(1280 / src.width, 720 / src.height) * 1.04;
    this.bg.setScale(this.bgScale);
    // posição relativa (0–1) da janela acesa no desenho, para o brilho piscar em cima
    const JANELA = { x: 0.609, y: 0.415 };
    const wx = 640 + (JANELA.x - 0.5) * src.width * this.bgScale;
    const wy = 360 + (JANELA.y - 0.5) * src.height * this.bgScale;


    // janela que acende e apaga de vez em quando
    this.windowGlow = this.add.image(wx, wy, 'glow').setTint(0xffa040).setBlendMode(Phaser.BlendModes.ADD).setScale(0.75).setAlpha(0);
    this.time.addEvent({
      delay: 5200,
      loop: true,
      callback: () => this.tweens.add({ targets: this.windowGlow, alpha: { from: 0, to: 0.45 }, yoyo: true, duration: 900, hold: 600 }),
    });

    this.add.image(640, 360, 'vignette').setDisplaySize(1280, 720);
    ui.showTitle(GameState.hasSave());
    audio.setAmbience(['amb_rain', 'music_title']);
  }

  update(time) {
    this.bg.x = 640 + Math.sin(time / 4000) * 6;
  }
}
