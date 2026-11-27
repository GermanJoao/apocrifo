// Arquivos de áudio. Licenças e autores em CREDITS.md.
//
// Cada som pode ser:
//   null                         → usa o som sintetizado (Web Audio)
//   'caminho.ogg'                → um arquivo
//   { src: [...], volume: 0.5 }  → vários arquivos (um é sorteado a cada vez) e volume próprio
// Sons com prefixo amb_ ou music_ tocam em loop.

const A = 'assets/audio/';
const variants = (name, n) => Array.from({ length: n }, (_, i) => `${A}${name}_${i}.ogg`);

export const AUDIO_FILES = {
  // efeitos
  step_wood: { src: variants('passo_madeira', 5), volume: 0.3 },
  step_tile: { src: variants('passo_piso', 5), volume: 0.3 },
  interact: { src: `${A}interagir.ogg`, volume: 0.15 },
  door_open: { src: [`${A}porta_abrir.ogg`], volume: 0.45 },
  door_close: { src: `${A}porta_fechar.ogg`, volume: 0.4 },
  door_locked: { src: `${A}trancado.ogg`, volume: 1.0 },
  creak: { src: [`${A}rangido_1.ogg`, `${A}rangido_2.ogg`], volume: 0.6 },
  unlock: { src: `${A}trinco.ogg`, volume: 0.6 },
  page: { src: [`${A}pagina_1.ogg`, `${A}pagina_2.ogg`, `${A}pagina_3.ogg`], volume: 1.0 },
  book: { src: `${A}livro_abrir.ogg`, volume: 1.0 },
  item: { src: `${A}item.ogg`, volume: 0.5 },
  heartbeat: { src: `${A}coracao.wav`, volume: 0.6 },
  flicker: { src: `${A}piscar_luz.ogg`, volume: 0.3 },
  static: { src: `${A}estatica.ogg`, volume: 0.25 },
  sting: null,
  // ambientes (loop)
  amb_rain: { src: `${A}amb_chuva.ogg`, volume: 0.35 },
  amb_house: { src: `${A}amb_casa.ogg`, volume: 0.15 },
  amb_clock: { src: `${A}amb_relogio.wav`, volume: 0.4 },
  amb_fire: { src: `${A}amb_lareira.ogg`, volume: 0.6 },
  amb_boil: { src: `${A}amb_panela.ogg`, volume: 0.8 },
  amb_fridge: null,
  amb_choir: { src: `${A}amb_porao.ogg`, volume: 0.14 },
  // música (loop)
  music_title: { src: `${A}amb_casa.ogg`, volume: 0.2 },
};
