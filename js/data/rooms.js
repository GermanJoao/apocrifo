// Definição dos cômodos da casa.
//
// Convenções:
//  - Todos os cômodos têm 720px de altura; a largura vem do fundo.
//  - "y" de móveis e personagens é a linha do chão onde eles apoiam (a base).
//    A profundidade de desenho é ordenada por esse y.
//  - block: [largura, profundidade] da área sólida no chão, centrada em x e
//    terminando em y (o Arthur não atravessa).
//  - interactables: pontos no chão perto dos quais o jogador pode apertar E.
//    "icon" é onde o indicador aparece; "action" é a função em story.js.
//  - door: leva a outro cômodo (a story pode bloquear com "check").
//
// Fases da demo:
//  - Fase 1 (noite, furtiva): começa no porão. Só aparecem interações com
//    fase: 1, fases: [1, 2] ou portas. "noite" substitui luz/som/NPCs do cômodo.
//    "vigia" = quem acorda e pega o Arthur se ele fizer barulho demais ali.
//  - Fase 2 (dia): todo o resto. Interações com fase: 1 somem.
//  - props/interactables podem ter when: (state) => boolean.

export const WALK = { yMin: 512, yMax: 690 };

export const ROOMS = {
  basement: {
    name: 'Porão',
    bg: 'bg_basement',
    width: 1500,
    floor: 'concrete',
    ambient: 0x8a8a90,
    shade: 0.5,
    ambience: ['amb_house', 'amb_rain'],
    vigia: 'mae',
    props: [
      { key: 'caixas', x: 170, y: 520, block: [230, 24] },
      { key: 'estante_porao', x: 440, y: 500, block: [230, 18] },
      { key: 'aquecedor', x: 780, y: 500, block: [140, 18] },
      { key: 'colchonete', x: 1150, y: 520, block: [330, 22] },
      { key: 'cadeira_cativeiro', x: 620, y: 612, scale: 0.72, block: [110, 20], depth: 590 },
      { key: 'cordas_chao', x: 640, y: 640, when: (s) => !s.flag('amarrado') },
      { key: 'escada_porao', x: 1290, y: 700, depth: 520, block: [60, 40] },
    ],
    foreground: [{ key: 'fg_chair', x: 120, y: 820, scroll: 1.3 }],
    lights: [
      { x: 620, y: 170, r: 380, color: 0xffd8a0, alpha: 0.5, flicker: 0.6 },
      { x: 325, y: 100, r: 140, color: 0x6a88ff, alpha: 0.2 },
      { x: 975, y: 550, r: 160, color: 0xff3a1a, alpha: 0.35, pulse: true },
      { x: 1405, y: 270, r: 90, color: 0xffcf8a, alpha: 0.3 },
    ],
    interactables: [
      { id: 'bs_ropes', fase: 1, x: 620, y: 640, icon: [620, 330], label: 'Forçar as cordas', r: 60, when: (s) => s.flag('amarrado') },
      { id: 'bs_boxes', fase: 1, x: 200, y: 545, icon: [200, 270], label: 'Caixas' },
      { id: 'bs_shelf', fase: 1, x: 440, y: 530, icon: [440, 190], label: 'Prateleira' },
      { id: 'bs_window', fase: 1, x: 325, y: 530, icon: [325, 150], label: 'Janela' },
      { id: 'bs_chair', fase: 1, x: 690, y: 650, icon: [620, 380], label: 'Cadeira', when: (s) => !s.flag('amarrado') },
      { id: 'bs_heater', fase: 1, x: 780, y: 530, icon: [780, 200], label: 'Aquecedor' },
      { id: 'bs_wall', fase: 1, x: 975, y: 560, icon: [975, 160], label: 'Parede de tijolos' },
      { id: 'bs_mattress', fase: 1, x: 1150, y: 550, icon: [1150, 400], label: 'Colchonete' },
      { id: 'bs_stairs', fase: 1, x: 1190, y: 600, icon: [1300, 330], label: 'Escada', door: { to: 'kitchen', spawn: { x: 1500, y: 540, face: -1 } } },
    ],
    start: { x: 620, y: 640, face: -1 },
  },

  guestroom: {
    name: 'Quarto de hóspedes',
    bg: 'bg_guestroom',
    width: 1600,
    floor: 'wood',
    ambient: 0x9a92b4,
    ambience: ['amb_rain', 'amb_house'],
    props: [
      { key: 'nightstand', x: 420, y: 506, block: [90, 22] },
      { key: 'bed_guest', x: 640, y: 612, block: [410, 46] },
      { key: 'wardrobe', x: 1165, y: 500, block: [196, 20] },
      { key: 'chair_clothes', x: 1320, y: 604, block: [80, 22] },
    ],
    foreground: [{ key: 'fg_curtain', x: 1640, y: 720, scroll: 1.25 }],
    lights: [
      { x: 420, y: 282, r: 300, color: 0xffb870, alpha: 0.5 },
      { x: 760, y: 150, r: 420, color: 0xffd8a0, alpha: 0.45, flicker: 0.25 },
      { x: 320, y: 215, r: 160, color: 0x6a88ff, alpha: 0.18 },
    ],
    interactables: [
      { id: 'gr_window', x: 320, y: 530, icon: [320, 112], label: 'Janela' },
      { id: 'gr_nightstand', x: 430, y: 530, icon: [420, 228], label: 'Criado-mudo' },
      { id: 'gr_mirror', x: 658, y: 530, icon: [658, 124], label: 'Marca na parede' },
      { id: 'gr_bed', x: 640, y: 650, icon: [640, 380], label: 'Cama', r: 140 },
      { id: 'gr_drawings', x: 960, y: 530, icon: [960, 140], label: 'Desenhos' },
      { id: 'gr_wardrobe', x: 1165, y: 530, icon: [1165, 140], label: 'Guarda-roupa' },
      { id: 'gr_chair', x: 1320, y: 640, icon: [1320, 410], label: 'Cadeira' },
      { id: 'gr_door', x: 1440, y: 530, icon: [1440, 170], label: 'Porta', door: { to: 'hallway', spawn: { x: 180, y: 560, face: 1 } } },
    ],
    start: { x: 720, y: 660, face: 1 },
  },

  hallway: {
    name: 'Corredor',
    bg: 'bg_hallway',
    width: 2200,
    floor: 'wood',
    ambient: 0x8a9a8c,
    ambience: ['amb_rain', 'amb_house', 'amb_clock'],
    vigia: 'clara',
    noite: {
      shade: 0.62,
      ambience: ['amb_rain', 'amb_clock'],
      lights: [
        { x: 1750, y: 195, r: 170, color: 0x6a88ff, alpha: 0.2 },
        { x: 820, y: 440, r: 120, color: 0xffd8a0, alpha: 0.25 },
      ],
      npcs: [],
    },
    props: [
      { key: 'clock', x: 1290, y: 498, block: [100, 18] },
      { key: 'phone_table', x: 1760, y: 500, block: [120, 18] },
    ],
    foreground: [
      { key: 'fg_coatrack', x: 640, y: 760, scroll: 1.3 },
      { key: 'fg_plant', x: 1600, y: 800, scroll: 1.3 },
    ],
    lights: [
      { x: 330, y: 165, r: 280, color: 0xffc880, alpha: 0.5 },
      { x: 1000, y: 165, r: 280, color: 0xffc880, alpha: 0.5, flicker: 0.5 },
      { x: 1880, y: 165, r: 280, color: 0xffc880, alpha: 0.45 },
      { x: 1750, y: 195, r: 170, color: 0x6a88ff, alpha: 0.15 },
    ],
    interactables: [
      { id: 'hw_door_guest', x: 180, y: 530, icon: [180, 170], label: 'Quarto de hóspedes', door: { to: 'guestroom', spawn: { x: 1440, y: 560, face: -1 } } },
      { id: 'hw_photo_family', fases: [1, 2], x: 530, y: 530, icon: [530, 112], label: 'Foto de família' },
      { id: 'hw_photo_old', fases: [1, 2], x: 676, y: 530, icon: [676, 130], label: 'Foto antiga' },
      { id: 'hw_door_clara', x: 820, y: 530, icon: [820, 170], label: 'Quarto da Clara', door: { to: 'clara_room', spawn: { x: 130, y: 560, face: 1 } } },
      { id: 'hw_sampler', fases: [1, 2], x: 1150, y: 530, icon: [1150, 110], label: 'Bordado' },
      { id: 'hw_clock', fases: [1, 2], x: 1290, y: 528, icon: [1290, 130], label: 'Relógio' },
      { id: 'hw_door_bath', fases: [1, 2], x: 1480, y: 530, icon: [1480, 172], label: 'Banheiro' },
      { id: 'hw_phone', fases: [1, 2], x: 1760, y: 530, icon: [1760, 250], label: 'Telefone' },
      { id: 'hw_arch', x: 2080, y: 530, icon: [2080, 130], label: 'Sala de estar', door: { to: 'livingroom', spawn: { x: 120, y: 560, face: 1 } } },
    ],
    start: { x: 180, y: 560, face: 1 },
  },

  clara_room: {
    name: 'Quarto da Clara',
    bg: 'bg_clara_room',
    width: 1500,
    floor: 'wood',
    ambient: 0xae94a6,
    ambience: ['amb_rain', 'amb_house'],
    props: [
      { key: 'bed_clara', x: 310, y: 622, block: [380, 44] },
      { key: 'altar_shelf', x: 740, y: 500, block: [220, 18] },
      { key: 'dollhouse', x: 1050, y: 540, block: [200, 22] },
      { key: 'desk', x: 1330, y: 505, block: [230, 18] },
    ],
    foreground: [{ key: 'fg_curtain', x: -140, y: 720, scroll: 1.25, flip: true }],
    lights: [
      { x: 740, y: 420, r: 260, color: 0xffb060, alpha: 0.55, flicker: 0.35 },
      { x: 1340, y: 300, r: 260, color: 0xffd090, alpha: 0.45 },
      { x: 475, y: 210, r: 170, color: 0x6a88ff, alpha: 0.15 },
    ],
    npcs: [{ id: 'clara', key: 'clara', x: 575, y: 596, face: -1, when: (s) => s.flag('door_unlocked') && !s.flag('ending') }],
    interactables: [
      { id: 'cr_door', x: 120, y: 530, icon: [120, 170], label: 'Corredor', door: { to: 'hallway', spawn: { x: 820, y: 560, face: 1 } } },
      { id: 'cr_bed', x: 330, y: 660, icon: [250, 420], label: 'Pelúcias', r: 140 },
      { id: 'cr_window', x: 475, y: 530, icon: [475, 112], label: 'Janela' },
      { id: 'cr_shrine', x: 740, y: 530, icon: [740, 90], label: 'Mural de fotos' },
      { id: 'cr_dollhouse', x: 1050, y: 575, icon: [1050, 240], label: 'Casa de bonecas' },
      { id: 'cr_poster', x: 1180, y: 530, icon: [1180, 112], label: 'Pôster' },
      { id: 'cr_desk', x: 1300, y: 530, icon: [1280, 360], label: 'Escrivaninha' },
    ],
    start: { x: 130, y: 560, face: 1 },
  },

  livingroom: {
    name: 'Sala de estar',
    bg: 'bg_livingroom',
    width: 2300,
    floor: 'wood',
    ambient: 0xa08a90,
    ambience: ['amb_rain', 'amb_house', 'amb_fire'],
    props: [
      { key: 'tv', x: 430, y: 505, block: [200, 18] },
      { key: 'sofa', x: 660, y: 514, block: [390, 20] },
      { key: 'coffee_table', x: 640, y: 614, block: [250, 30] },
      { key: 'armchair', x: 1110, y: 566, block: [160, 30] },
      { key: 'floor_lamp', x: 1205, y: 506, block: [40, 12] },
      { key: 'bookshelf', x: 1420, y: 500, block: [330, 18] },
    ],
    foreground: [{ key: 'fg_plant', x: 2010, y: 800, scroll: 1.3 }],
    lights: [
      { x: 900, y: 410, r: 330, color: 0xff6a3a, alpha: 0.45, flicker: 0.4 },
      { x: 560, y: 155, r: 260, color: 0xffc880, alpha: 0.4 },
      { x: 1205, y: 210, r: 300, color: 0xffd090, alpha: 0.5 },
      { x: 2040, y: 155, r: 260, color: 0xffc880, alpha: 0.35, flicker: 0.6 },
      { x: 430, y: 380, r: 160, color: 0x9ad0ff, alpha: 0.25, flicker: 0.9 },
    ],
    npcs: [{ id: 'pai', key: 'pai', x: 1250, y: 575, face: -1, when: (s) => !s.flag('pai_moved') }],
    vigia: 'pai',
    noite: {
      shade: 0.6,
      ambience: ['amb_rain', 'amb_house'],
      lights: [
        { x: 900, y: 420, r: 220, color: 0xff4a2a, alpha: 0.25, flicker: 0.3 },
        { x: 1665, y: 210, r: 160, color: 0x6a88ff, alpha: 0.18 },
        { x: 430, y: 380, r: 130, color: 0x9ad0ff, alpha: 0.18, flicker: 0.9 },
      ],
      npcs: [],
    },
    interactables: [
      { id: 'lr_arch', x: 110, y: 530, icon: [110, 130], label: 'Corredor', door: { to: 'hallway', spawn: { x: 2060, y: 560, face: -1 } } },
      { id: 'lr_tv', fases: [1, 2], x: 430, y: 530, icon: [430, 250], label: 'Televisão' },
      { id: 'lr_sofa', fases: [1, 2], x: 760, y: 530, icon: [760, 300], label: 'Sofá' },
      { id: 'lr_table', fases: [1, 2], x: 600, y: 650, icon: [600, 500], label: 'Mesinha', r: 130 },
      { id: 'lr_portrait', fases: [1, 2], x: 900, y: 530, icon: [900, 60], label: 'Retrato' },
      { id: 'lr_bookshelf', x: 1420, y: 530, icon: [1420, 60], label: 'Estante do pai', r: 150 },
      { id: 'lr_window', x: 1665, y: 530, icon: [1665, 100], label: 'Janela' },
      { id: 'lr_front_door', fases: [1, 2], x: 1880, y: 530, icon: [1880, 160], label: 'Porta da frente' },
      { id: 'lr_door_kitchen', x: 2190, y: 530, icon: [2190, 170], label: 'Cozinha', door: { to: 'kitchen', spawn: { x: 120, y: 560, face: 1 } } },
    ],
    start: { x: 120, y: 560, face: 1 },
  },

  kitchen: {
    name: 'Cozinha',
    bg: 'bg_kitchen',
    width: 1700,
    floor: 'tile',
    ambient: 0xa8a48a,
    ambience: ['amb_rain', 'amb_fridge', 'amb_boil', 'amb_choir'],
    props: [
      { key: 'counter', x: 560, y: 500, block: [580, 18] },
      { key: 'fridge', x: 1340, y: 500, block: [150, 18] },
      { key: 'dining_table', x: 800, y: 650, block: [440, 40] },
      { key: 'molho_chaves', x: 228, y: 320, depth: -500, when: (s) => s.flag('fase1') && !s.has('molho') },
    ],
    vigia: 'mae',
    noite: {
      shade: 0.62,
      ambience: ['amb_rain', 'amb_fridge', 'amb_choir'],
      lights: [
        { x: 630, y: 280, r: 220, color: 0x6a88ff, alpha: 0.28 },
        { x: 1500, y: 450, r: 200, color: 0xff3a1a, alpha: 0.35, pulse: true },
        { x: 1340, y: 300, r: 120, color: 0xc8e8ff, alpha: 0.12, flicker: 0.2 },
      ],
      npcs: [],
    },
    foreground: [{ key: 'fg_chair', x: 260, y: 800, scroll: 1.3 }],
    lights: [
      { x: 820, y: 210, r: 420, color: 0xffd8a0, alpha: 0.5, flicker: 0.15 },
      { x: 1500, y: 450, r: 200, color: 0xff3a1a, alpha: 0.45, pulse: true },
      { x: 630, y: 280, r: 160, color: 0x6a88ff, alpha: 0.15 },
    ],
    npcs: [
      { id: 'mae', key: 'mae', x: 690, y: 540, face: -1, when: (s) => !s.flag('ending') },
      { id: 'pai', key: 'pai', x: 300, y: 640, face: 1, when: (s) => s.flag('pai_moved') && !s.flag('ending') },
    ],
    interactables: [
      { id: 'kt_door', x: 110, y: 530, icon: [110, 170], label: 'Sala de estar', door: { to: 'livingroom', spawn: { x: 2180, y: 560, face: -1 } } },
      { id: 'kt_hook', fase: 1, x: 228, y: 530, icon: [228, 200], label: 'Ganchos' },
      { id: 'kt_drawer', x: 330, y: 530, icon: [330, 380], label: 'Gaveta' },
      { id: 'kt_stove', x: 500, y: 530, icon: [565, 300], label: 'Fogão' },
      { id: 'kt_table', fases: [1, 2], x: 800, y: 690, icon: [800, 420], label: 'Mesa posta', r: 150 },
      { id: 'kt_jars', fases: [1, 2], x: 985, y: 530, icon: [985, 108], label: 'Potes' },
      { id: 'kt_calendar', fases: [1, 2], x: 1185, y: 530, icon: [1185, 112], label: 'Calendário' },
      { id: 'kt_fridge', fases: [1, 2], x: 1340, y: 530, icon: [1340, 160], label: 'Geladeira' },
      { id: 'kt_basement', x: 1500, y: 530, icon: [1500, 170], label: 'Porta do porão', door: { to: 'basement', spawn: { x: 1190, y: 600, face: -1 } } },
    ],
    start: { x: 120, y: 560, face: 1 },
  },
};

// Dados visuais das personagens não jogáveis
export const NPC_TYPES = {
  // scale: altura relativa ao Arthur (os adultos são mais altos)
  clara: { frames: ['clara_idle_0', 'clara_idle_1'], name: 'Clara', scale: 0.98 },
  mae: { frames: ['mae_idle_0', 'mae_idle_1'], walk: ['mae_andar_0', 'mae_andar_1', 'mae_andar_2', 'mae_andar_3'], name: 'Mãe', scale: 1.08 },
  pai: { frames: ['pai_idle_0', 'pai_idle_1'], walk: ['pai_andar_0', 'pai_andar_1', 'pai_andar_2', 'pai_andar_3'], name: 'Pai', scale: 1.14 },
};
