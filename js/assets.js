// Manifesto de todos os assets carregados pelo jogo.
// Para trocar uma arte, basta substituir o arquivo SVG mantendo o nome
// (ou alterar o caminho aqui). Tamanhos = resolução de rasterização.

const CHAR_W = 240;
const CHAR_H = 424;
// os pés dos personagens ficam em y=392 de um viewBox que começa em -24
export const CHAR_ORIGIN_Y = (392 + 24) / CHAR_H;
export const CHAR_SCALE = 0.66;

const chars = [];
for (let i = 0; i < 8; i++) chars.push([`arthur_walk_${i}`, `assets/characters/arthur/arthur_walk_${i}.svg`]);
for (let i = 0; i < 4; i++) chars.push([`arthur_idle_${i}`, `assets/characters/arthur/arthur_idle_${i}.svg`]);
chars.push(['arthur_blink', 'assets/characters/arthur/arthur_blink.svg']);
for (let i = 0; i < 2; i++) {
  chars.push([`clara_idle_${i}`, `assets/characters/daughter/clara_idle_${i}.svg`]);
  chars.push([`mae_idle_${i}`, `assets/characters/parents/mae_idle_${i}.svg`]);
  chars.push([`pai_idle_${i}`, `assets/characters/parents/pai_idle_${i}.svg`]);
}

const props = {
  altar_shelf: [230, 140], armchair: [180, 210], bed_clara: [400, 230], bed_guest: [440, 220],
  bookshelf: [340, 420], chair_clothes: [120, 180], clock: [110, 340], coffee_table: [270, 90],
  counter: [580, 170], desk: [240, 240], dining_table: [460, 190], dollhouse: [220, 280],
  fg_chair: [200, 360], fg_coatrack: [200, 560], fg_curtain: [220, 720], fg_plant: [300, 460],
  floor_lamp: [100, 340], fridge: [160, 310], nightstand: [110, 250], phone_table: [130, 210],
  sofa: [400, 200], tv: [210, 230], wardrobe: [210, 340],
};

export const BACKGROUNDS = {
  bg_guestroom: [1600, 720], bg_hallway: [2200, 720], bg_clara_room: [1500, 720],
  bg_livingroom: [2300, 720], bg_kitchen: [1700, 720], title_bg: [1280, 720],
};

export const SVG_ASSETS = [
  ...chars.map(([k, p]) => ({ key: k, url: p, w: CHAR_W, h: CHAR_H })),
  ...Object.entries(props).map(([k, [w, h]]) => ({ key: k, url: `assets/objects/${k}.svg`, w, h })),
  ...Object.entries(BACKGROUNDS).map(([k, [w, h]]) => ({ key: k, url: `assets/backgrounds/${k}.svg`, w, h })),
  { key: 'glow', url: 'assets/interface/glow.svg', w: 256, h: 256 },
  { key: 'vignette', url: 'assets/interface/vignette.svg', w: 1280, h: 720 },
  { key: 'key_e', url: 'assets/interface/key_e.svg', w: 48, h: 48 },
];

// Retratos usados pela caixa de diálogo (carregados como <img> pelo HTML)
export const PORTRAITS = {
  arthur: 'assets/characters/arthur/arthur_busto.png',
  'arthur:worried': 'assets/characters/arthur/arthur_busto.png', // desenhe uma versão preocupada e troque aqui
  clara: 'assets/characters/daughter/clara_portrait_smile.svg',
  'clara:stare': 'assets/characters/daughter/clara_portrait_stare.svg',
  mae: 'assets/characters/parents/mae_portrait.svg',
  'mae:open': 'assets/characters/parents/mae_portrait_open.svg',
  pai: 'assets/characters/parents/pai_portrait.svg',
  'pai:stare': 'assets/characters/parents/pai_portrait_stare.svg',
};
