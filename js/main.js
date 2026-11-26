// Ponto de entrada: cria o jogo Phaser e conecta interface, áudio e estado.
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { RoomScene } from './scenes/RoomScene.js';
import { AudioManager } from './systems/audio.js';
import { GameState } from './systems/state.js';
import { UI } from './ui/ui.js';
import { DOCS, DOC_TITLES } from './data/story.js';
import { ROOMS } from './data/rooms.js';
import { services } from './services.js';

if (!window.Phaser) {
  document.getElementById('loading-text').textContent = 'Não foi possível carregar o Phaser (lib/phaser.min.js).';
  throw new Error('Phaser ausente');
}

const audio = new AudioManager();
const settings = GameState.loadSettings();
audio.setVolume(settings.volume);
const ui = new UI(audio);
ui.setVolumeSlider(settings.volume);
const state = new GameState();

// ?renderer=canvas força o renderizador Canvas (útil em máquinas sem WebGL)
const forceCanvas = new URLSearchParams(location.search).get('renderer') === 'canvas';

const game = new Phaser.Game({
  type: forceCanvas ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#050407',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, pixelArt: false },
  scene: [BootScene, TitleScene, RoomScene],
});

Object.assign(services, { game, audio, ui, state });
window.__apocrifo = services; // útil para depuração no console

// ------------------------------------------------------------ navegação
function startRoom(room, spawn, intro = false) {
  ui.hide('title');
  ui.hide('ending');
  ui.closePause();
  game.scene.stop('TitleScene');
  game.scene.start('RoomScene', { room, spawn, intro });
}

function goToTitle() {
  ui.closePause();
  ui.controlsHint(false);
  game.scene.stop('RoomScene');
  game.scene.start('TitleScene');
}

function roomScene() {
  const s = game.scene.getScene('RoomScene');
  return s && (s.scene.isActive() || s.scene.isPaused()) ? s : null;
}

ui.on('new', async () => {
  audio.unlock();
  GameState.clearSave();
  state.reset();
  await ui.fade(1, 700);
  startRoom('guestroom', ROOMS.guestroom.start, true);
});

ui.on('continue', async () => {
  audio.unlock();
  if (!state.load()) return;
  await ui.fade(1, 700);
  startRoom(state.room, state.pos);
});

ui.on('fullscreen', () => {
  const el = document.getElementById('stage');
  if (document.fullscreenElement) document.exitFullscreen?.();
  else el.requestFullscreen?.().catch(() => {});
});

ui.on('escape', () => {
  const rs = roomScene();
  if (!rs || ui.dialogue.active || ui.reader.active) return;
  if (ui.pauseOpen) {
    ui.closePause();
    rs.scene.resume();
  } else if (!ui.screenOpen) {
    rs.scene.pause();
    ui.openPause(state.docs, DOC_TITLES);
  }
});

ui.on('resume', () => {
  ui.closePause();
  roomScene()?.scene.resume();
});

ui.on('docs', () => ui.toggleDocList());
ui.on('readDoc', (id) => DOCS[id] && ui.reader.open(DOCS[id]));
ui.on('title', goToTitle);
ui.on('volume', (v) => {
  audio.setVolume(v);
  GameState.saveSettings({ ...settings, volume: v });
});

// erros inesperados aparecem discretamente na tela em vez de travar em silêncio
window.addEventListener('error', (e) => ui.error(`Erro: ${e.message}`));
window.addEventListener('unhandledrejection', (e) => ui.error(`Erro: ${e.reason?.message || e.reason}`));
