// Manifesto de todos os assets carregados pelo jogo.
// Para trocar uma arte, substitua o arquivo PNG mantendo o nome (ou altere o
// caminho aqui). Os números são só o tamanho de referência da arte atual;
// o jogo usa o tamanho real do PNG que você colocar.

const CHAR_W = 240;
const CHAR_H = 424;
// os pés dos personagens ficam em y=392 de um viewBox que começa em -24
export const CHAR_ORIGIN_Y = (392 + 24) / CHAR_H;
export const CHAR_SCALE = 0.66;

const chars = [];
// o Arthur é montado pelo rig (assets/characters/arthur/rig.json + partes/)
for (let i = 0; i < 2; i++) {
  chars.push([`clara_idle_${i}`, `assets/characters/daughter/clara_idle_${i}.png`]);
  chars.push([`mae_idle_${i}`, `assets/characters/parents/mae_idle_${i}.png`]);
  chars.push([`pai_idle_${i}`, `assets/characters/parents/pai_idle_${i}.png`]);
}
// quadros de caminhada dos pais (desenhos inteiros, trocados direto pelo PNG)
for (let i = 0; i < 4; i++) {
  chars.push([`mae_andar_${i}`, `assets/characters/parents/mae_andar_${i}.png`]);
  chars.push([`pai_andar_${i}`, `assets/characters/parents/pai_andar_${i}.png`]);
}

const props = {
  altar_shelf: [230, 140], armchair: [180, 210], bed_clara: [400, 230], bed_guest: [440, 220],
  bookshelf: [340, 420], chair_clothes: [120, 180], clock: [110, 340], coffee_table: [270, 90],
  counter: [580, 170], desk: [240, 240], dining_table: [460, 190], dollhouse: [220, 280],
  fg_chair: [200, 360], fg_coatrack: [200, 560], fg_curtain: [220, 720], fg_plant: [300, 460],
  floor_lamp: [100, 340], fridge: [160, 310], nightstand: [110, 250], phone_table: [130, 210],
  sofa: [400, 200], tv: [210, 230], wardrobe: [210, 340],
  // porão (Fase 1) — arte provisória
  cadeira_cativeiro: [180, 272], cordas: [180, 340], cordas_chao: [200, 60], escada_porao: [340, 422],
  estante_porao: [240, 302], caixas: [250, 232], aquecedor: [160, 282], colchonete: [350, 98],
  molho_chaves: [60, 70], vulto: [160, 420],
};

export const BACKGROUNDS = {
  bg_guestroom: [1600, 720], bg_hallway: [2200, 720], bg_clara_room: [1500, 720],
  bg_livingroom: [2300, 720], bg_kitchen: [1700, 720], bg_basement: [1500, 720], title_bg: [1376, 768],
};

export const IMAGE_ASSETS = [
  ...chars.map(([k, p]) => ({ key: k, url: p, w: CHAR_W, h: CHAR_H })),
  ...Object.entries(props).map(([k, [w, h]]) => ({ key: k, url: `assets/objects/${k}.png`, w, h })),
  ...Object.entries(BACKGROUNDS).map(([k, [w, h]]) => ({ key: k, url: `assets/backgrounds/${k}.png`, w, h })),
  { key: 'glow', url: 'assets/interface/glow.png', w: 256, h: 256 },
  { key: 'vignette', url: 'assets/interface/vignette.png', w: 1280, h: 720 },
  { key: 'key_e', url: 'assets/interface/key_e.png', w: 48, h: 48 },
];

// Retratos usados pela caixa de diálogo (carregados como <img> pelo HTML)
export const PORTRAITS = {
  arthur: 'assets/characters/arthur/arthur_busto.png',
  'arthur:worried': 'assets/characters/arthur/arthur_busto.png', // desenhe uma versão preocupada e troque aqui
  clara: 'assets/characters/daughter/clara_busto.png',
  'clara:stare': 'assets/characters/daughter/clara_busto.png',
  mae: 'assets/characters/parents/mae_portrait.png',
  'mae:open': 'assets/characters/parents/mae_portrait_open.png',
  pai: 'assets/characters/parents/pai_portrait.png',
  'pai:stare': 'assets/characters/parents/pai_portrait_stare.png',
};

// Tamanho de referência de cada imagem: se o PNG novo tiver outro tamanho
// (ex.: desenhado no dobro), o jogo reduz/aumenta para ocupar o mesmo espaço.
const REF = Object.fromEntries(IMAGE_ASSETS.map((a) => [a.key, [a.w, a.h]]));
export function refScale(scene, key) {
  const ref = REF[key];
  if (!ref || !scene.textures.exists(key)) return 1;
  const src = scene.textures.get(key).getSourceImage();
  return src.height ? ref[1] / src.height : 1;
}
