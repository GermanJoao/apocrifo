// Roteiro da demo: documentos, falas e eventos.
//
// Cada interação é uma função async que recebe "ctx" (ver RoomScene.makeContext):
//   ctx.say(quem, texto)         fala ou pensamento ('pensa', 'arthur', 'clara:stare', 'narr'...)
//   ctx.talk([[quem, texto], …]) várias falas em sequência
//   ctx.choose(quem, texto, [opções]) → índice escolhido
//   ctx.read(idDoDocumento)      abre o leitor de documentos
//   ctx.state                    flags, itens e contagens (ver systems/state.js)
//   ctx.sfx, ctx.wait, ctx.toast, ctx.flicker, ctx.goto, ctx.ending…
//   ctx.npc(id), ctx.spawnNpc, ctx.walkNpc, ctx.removeNpc, ctx.walkPlayer
//
// Texto entre *asteriscos* aparece destacado em vermelho.
// Decisões narrativas ainda em aberto foram mantidas como mistério de propósito.

const D = 'assets/documents/';

// ---------------------------------------------------------------------------
// DOCUMENTOS
// ---------------------------------------------------------------------------
export const DOCS = {
  clara_drawing: {
    title: 'Desenho colado na parede',
    style: 'photo',
    pages: [{ img: `${D}clara_drawing.png`, html: '<p class="note">giz de cera, papel de caderno. As bordas foram recortadas com tesoura de picotar.</p>' }],
  },
  photo_family: {
    title: 'Fotografia no corredor',
    style: 'photo',
    pages: [{
      img: `${D}photo_family.png`,
      html: '<p>Uma foto da família no sofá da sala. Na ponta, alguém colou um quarto integrante: um corpo recortado de revista, de casaco roxo.</p><p>O rosto é o meu. Da minha carteirinha da escola.</p>',
    }],
  },
  photo_vigil: {
    title: 'Fotografia antiga',
    style: 'photo',
    pages: [{
      img: `${D}photo_vigil.png`,
      html: '<p>Duas pessoas de branco num campo, à noite. Um círculo de velas. No centro, um berço vazio.</p><p class="note">no verso, a lápis: “vigília — primeira noite. (não veio)”</p>',
    }],
  },
  shrine_photo: {
    title: 'Mural da Clara',
    style: 'photo',
    pages: [{
      img: `${D}shrine_photo.png`,
      html: '<p>São dezenas de fotos. Todas minhas. Todas de longe. No ponto de ônibus, na saída da escola, na janela do meu quarto — <em>do meu quarto de verdade</em>.</p><p>Um fio vermelho liga uma à outra, como se formassem um caminho.</p>',
    }],
  },
  clara_diary: {
    title: 'Diário da Clara',
    style: 'diary',
    pages: [
      { html: '<p>14 de junho</p><p>Vi ele de novo no ponto. Casaco roxo, fone sem música (eu sei porque cheguei perto). Ele não olha pra ninguém. Eu gosto disso. Ninguém olha pra mim também.</p>' },
      { html: '<p>2 de agosto</p><p>Contei pro papai. Achei que ele ia brigar.</p><p>Ele ficou muito quieto. Depois foi buscar o caderno dele e me perguntou a data de aniversário do Arthur.</p><p>Eu sabia, claro.</p>' },
      { html: '<p>3 de agosto</p><p>Papai e mamãe conversaram a noite toda. Mamãe chorou, mas de felicidade. Me abraçou e disse: “você encontrou. você encontrou, filha.”</p><p>Eu não sei o que eu encontrei. Eu só gosto dele.</p>' },
      { html: '<p>(sem data)</p><p>Ele chegou!!! Tá dormindo no quarto de hóspedes. Papai diz que ele é especial por outro motivo, mas eu não ligo pro motivo do papai. Ele é especial pra mim.</p><p>Mamãe disse pra eu não me apegar muito.</p><p>Por quê?</p>' },
    ],
  },
  calendar: {
    title: 'Calendário da cozinha',
    style: 'photo',
    pages: [{ img: `${D}calendar.png`, html: '<p>Os dias estão riscados um a um. O dia 30 está circulado em vermelho, com um desenho dentro.</p>' }],
  },
  book_edda: {
    title: 'Edda Poética — Völuspá',
    style: 'book',
    pages: [{
      img: `${D}livros/edda_doepler.jpg`,
      html: '<p class="small center">Emil Doepler, “Depois do Ragnarök” (c. 1905)</p>'
        + '<p class="small">(marcador de fita na profecia da vidente)</p>'
        + '<p>Irmãos lutarão entre si e serão a morte um do outro… o sol escurece, a terra afunda no mar, as estrelas brilhantes caem do céu.</p>'
        + '<p class="note">Eles sabiam que tudo termina. Escreveram o fim com tanto cuidado.<br>Ninguém perguntou o que nasce no buraco que fica.</p>',
    }],
  },
  book_kojiki: {
    title: 'Kojiki — Registro de Coisas Antigas',
    style: 'book',
    pages: [{
      img: `${D}livros/kojiki_kobayashi.jpg`,
      html: '<p class="small center">Kobayashi Eitaku, “Izanami e Izanagi” (década de 1880)</p>'
        + '<p>E ao dar à luz o deus do fogo, Kagutsuchi, Izanami teve as entranhas queimadas, adoeceu e partiu para a Terra de Yomi.</p>'
        + '<p class="note">Todo nascimento de deus queima alguém.<br>Escolher com cuidado quem segura a vela.</p>',
    }],
  },
  book_shanhaijing: {
    title: 'Clássico das Montanhas e dos Mares',
    style: 'book',
    pages: [{
      img: `${D}livros/shanhaijing_nuwa.jpg`,
      html: '<p class="small center">Nüwa, ilustração do Clássico das Montanhas e dos Mares</p>'
        + '<p>Um bestiário antigo. Montanha por montanha, rio por rio, os viajantes anotaram cada criatura: quantas cabeças, quantos olhos, que som fazem, se trazem enchente ou seca.</p>'
        + '<p class="note">Catalogaram tudo que existe.<br>Procurei três vezes. Ele não está aqui.<br>Claro que não. Ele ainda não existe.</p>',
    }],
  },
  book_rigveda: {
    title: 'Rigveda — Hino da Criação',
    style: 'book',
    pages: [{
      img: `${D}livros/rigveda_ms2097.jpg`,
      html: '<p class="small center">Manuscrito do Rigveda (séc. XIX)</p>'
        + '<p>Então não havia o ser nem o não-ser… Quem sabe de verdade? Quem poderia dizer de onde veio, de onde surgiu esta criação?</p>'
        + '<p>Talvez nem aquele que a vigia do mais alto céu saiba.</p>'
        + '<p class="note">Nós saberemos.<br>Nós vamos estar na sala quando acontecer.</p>',
    }],
  },
  notebook: {
    title: 'Caderno da Vigília',
    style: 'notebook',
    pages: [
      { img: `${D}notebook_cover.png`, html: '<p class="center">para quem esperar depois de nós</p>' },
      {
        img: `${D}notebook_rings.png`,
        html: '<p>Toda casa do céu tem o seu fim escrito. Os do Norte escreveram o deles — lobo, fogo, mar. Os do Leste escreveram outros.</p><p>Mas as casas estão rachando. E na rachadura não mora ninguém.</p><p>Ainda.</p>',
      },
      {
        html: '<p><strong>Adão</strong> não tem mãe no céu. Não tem panteão, não tem montanha, não tem árvore.</p><p>Por isso precisa de uma casa aqui embaixo.</p><p>Nós somos a casa.</p><p class="small">1ª vigília — nada.<br>2ª vigília — nada.<br>Faltava alguma coisa. Faltava alguém.</p>',
      },
      {
        html: '<p>C. encontrou o menino.</p><p>Ela acha que é amor. Deixe que ache. Amor também serve — talvez sirva melhor.</p><p>Ele não deve ter medo. O medo azeda.</p><p>Quartos limpos, comida quente, lençóis brancos. Nada de espelhos.</p>',
      },
      {
        img: `${D}notebook_house.png`,
        html: '<p>A sala de baixo está quase pronta.</p><p>Quando o relógio parar de vez, será a noite.</p>',
      },
      {
        html: '<div class="degrade"><span>Adão vai nos agradecer.</span><span>Adão vai nos agradecer.</span><span>Adão vai nos agradecer.</span><span>Adão vai nos agradecer.</span><span>Adão vai nos agradecer.</span><span>Adão vai nos agradecer.</span></div>'
          + '<p class="other-hand">não machuquem ele<br>— C.</p>',
      },
    ],
  },
};

export const DOC_TITLES = Object.fromEntries(Object.entries(DOCS).map(([k, v]) => [k, v.title]));

// ---------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// ---------------------------------------------------------------------------

/** Escolhe a fala conforme quantas vezes o jogador já interagiu. */
function byTimes(ctx, id, variants) {
  const n = ctx.state.touch(id);
  return variants[Math.min(n, variants.length) - 1];
}

async function lines(ctx, list) {
  for (const [who, text] of list) await ctx.say(who, text);
}

// ---------------------------------------------------------------------------
// EVENTOS
// ---------------------------------------------------------------------------
export const EVENTS = {
  async intro(ctx) {
    if (ctx.state.flag('fase1')) return EVENTS.introBasement(ctx);
    ctx.state.set('intro_done');
    await ctx.wait(600);
    await ctx.say('narr', 'Acordei numa cama. Uma cama de verdade, com lençóis que cheiram a amaciante.');
    await ctx.say('pensa:worried', 'Meus pulsos estão em carne viva. Isso não foi uma queda.');
    const why = {
      mae: 'Ela disse que eu caí da escada. Que eu tive febre. Ela acredita nisso? Ou quer que eu acredite?',
      clara: 'A Clara jura que ficou do meu lado a noite toda. Que foi tudo um pesadelo.',
      pai: 'Ainda sinto a mão dele no meu braço.',
    }[ctx.state.flags.pego_por];
    if (why) await ctx.say('pensa', why);
    await ctx.say('pensa:worried', 'E agora a porta está trancada por fora.');
    ctx.hint(true);
  },

  /** A Clara destranca a porta do quarto de hóspedes. */
  async claraVisit(ctx) {
    if (ctx.state.flag('door_unlocked')) return;
    ctx.state.set('door_unlocked');
    await ctx.wait(300);
    ctx.sfx('unlock');
    await ctx.wait(450);
    ctx.sfx('unlock');
    await ctx.wait(450);
    ctx.sfx('door_open');
    await ctx.wait(300);
    ctx.spawnNpc('clara', 'clara', 1440, 532, -1);
    ctx.facePlayerTo(1440);
    await ctx.walkNpc('clara', Math.min(1330, ctx.playerX() + 170), 560);
    await lines(ctx, [
      ['clara', 'Bom dia, Arthur! Quer dizer… boa noite? Aqui dentro é difícil saber, né?'],
      ...({
        mae: [['clara', 'A mamãe disse que você caiu da escada. Tá doendo?']],
        clara: [['clara', 'Você me deu um susto ontem. Mas tudo bem, eu já te perdoei.']],
        pai: [['clara', 'O papai disse que você tava confuso ontem. Ele ficou bravo… mas passa. Sempre passa.']],
      }[ctx.state.flags.pego_por] || []),
      ['arthur:worried', 'Clara. Me deixa ir embora.'],
      ['clara', 'Você sempre começa com isso. Tudo bem, eu não fico chateada.'],
      ['clara', 'A mamãe disse que hoje você já pode andar pela casa. Só pela casa.'],
      ['clara', 'As portas de fora ficam trancadas. Mas não é por mal. É pra nada lá de fora pegar você antes da hora.'],
      ['arthur:worried', 'Antes da hora de quê?'],
      ['clara:stare', '…'],
      ['clara', 'Do jantar, bobo. A mamãe tá fazendo cozido. O papai tá na sala, lendo. Ele sempre tá lendo.'],
      ['clara', 'Eu vou estar no meu quarto. Se você quiser… sei lá. Conversar.'],
    ]);
    await ctx.walkNpc('clara', 1440, 532);
    ctx.removeNpc('clara');
    ctx.sfx('door_open');
    ctx.toast('A porta do quarto está destrancada.');
    ctx.hint(false);
    ctx.save();
  },

  /** Depois de pegar a chave, a Mãe chama o Pai para a cozinha. */
  async paiCalled(ctx) {
    await lines(ctx, [
      ['mae', 'Achou alguma coisa, querido?'],
      ['arthur:worried', '…Não. Só tava olhando.'],
      ['mae', 'Pode olhar à vontade. Esta casa é sua.'],
      ['mae:open', 'Querido! Vem me ajudar com a mesa!'],
      ['voz', 'Já vou.'],
    ]);
    ctx.sfx('door_open');
    ctx.spawnNpc('pai', 'pai', 110, 540, 1);
    await ctx.walkNpc('pai', 300, 640, 130);
    ctx.state.set('pai_moved');
    await ctx.say('pai', 'Arthur.');
    await ctx.say('pensa', 'Ele saiu da sala. A estante está sozinha agora.');
    ctx.save();
  },

  /** Final da demo, depois de ler o caderno. */
  async finale(ctx) {
    ctx.state.set('ending');
    await ctx.say('pensa:worried', 'Isso nunca foi sobre a Clara.');
    ctx.sfx('sting');
    await ctx.flicker(4);
    ctx.spawnNpc('clara', 'clara', ctx.playerX() - 220, 560, 1);
    ctx.sfx('heartbeat');
    await ctx.wait(900);
    ctx.facePlayerTo(ctx.playerX() - 220);
    await lines(ctx, [
      ['clara:stare', 'Você achou o caderno do papai.'],
      ['arthur:worried', 'Clara… você sabe o que eles vão fazer comigo?'],
      ['clara:stare', 'Eu não entendo tudo. Eles dizem que alguém vai nascer. Que vai consertar o céu.'],
      ['clara', 'Eu só pedi uma coisa pra eles. Que não machucassem você.'],
      ['clara', '…'],
      ['clara', 'Eles prometeram.'],
    ]);
    ctx.sfx('heartbeat');
    await ctx.say('voz', 'O jantar está na mesa!');
    await ctx.ending([
      'O jantar foi servido às nove.',
      'Havia cinco pratos.',
      'Ninguém se sentou no quinto lugar.',
      'Mas, antes de comer, todos agradeceram a ele.',
    ]);
  },
};

// ---------------------------------------------------------------------------
// INTERAÇÕES
// ---------------------------------------------------------------------------
export const INTERACTIONS = {
  // ----------------------------------------------------- quarto de hóspedes
  async gr_window(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'gr_window', [
      'Pregaram tábuas por dentro e por fora. Pelas frestas, só chuva e uma árvore torta.',
      'Tentei soltar uma tábua no segundo dia. Os pregos são novos. Longos demais.',
    ]));
  },
  async gr_nightstand(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'gr_nightstand', [
      'Um copo d’água e dois comprimidos brancos. Toda noite. Eu parei de tomar há dois dias.',
      'Ainda não perceberam. Eu acho.',
    ]));
  },
  async gr_mirror(ctx) {
    ctx.state.touch('gr_mirror');
    await ctx.say('pensa', 'Tinha um espelho aqui. A marca na parede ainda está mais clara que o resto.');
    await ctx.say('pensa:worried', 'Por que alguém tira o espelho de um quarto?');
  },
  async gr_bed(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'gr_bed', [
      'Os lençóis cheiram a amaciante. Alguém troca tudo enquanto eu durmo.',
      'Não quero deitar de novo. Toda vez que eu deito, acordo mais tarde do que deveria.',
    ]));
  },
  async gr_drawings(ctx) {
    ctx.state.touch('gr_drawings');
    await ctx.read('clara_drawing');
    await ctx.say('pensa', 'A Clara desenha a gente de mãos dadas. “Nós + ele.”');
    await ctx.say('pensa:worried', 'Eu achava que o “ele” era eu. Mas o que é essa coisa vermelha em cima da gente?');
  },
  async gr_wardrobe(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'gr_wardrobe', [
      'Roupas do meu tamanho. Todas novas, nenhuma etiqueta. Prepararam isso muito antes de eu chegar.',
      'Meu casaco estava pendurado aqui quando acordei no primeiro dia. Pelo menos isso ainda é meu.',
    ]));
  },
  async gr_chair(ctx) {
    ctx.state.touch('gr_chair');
    await ctx.say('pensa', 'Roupas dobradas com cuidado demais. Tem um bilhete em cima.');
    await ctx.say('narr', '“Para o jantar especial. Use a camisa clara. Com carinho, M.”');
  },
  async gr_door(ctx) {
    if (ctx.state.flag('door_unlocked')) return ctx.useDoor();
    ctx.state.touch('gr_door');
    ctx.sfx('door_locked');
    if (ctx.state.countSeen('gr_') >= 4) return EVENTS.claraVisit(ctx);
    await ctx.say('pensa', 'Trancada por fora. Do outro lado, a casa parece respirar.');
  },

  // ------------------------------------------------------------- corredor
  async hw_photo_family(ctx) {
    ctx.state.touch('hw_photo_family');
    await ctx.read('photo_family');
    await ctx.say('pensa:worried', '“Nossa família. Finalmente.”');
  },
  async hw_photo_old(ctx) {
    ctx.state.touch('hw_photo_old');
    await ctx.read('photo_vigil');
    await ctx.say('pensa', 'São os pais da Clara, mais novos. “Primeira noite. Não veio.”');
    await ctx.say('pensa:worried', 'Não veio… quem?');
  },
  async hw_sampler(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'hw_sampler', [
      'Bordado à mão: “QUE ELE ENCONTRE A CASA PRONTA.” O “Ele” com letra maiúscula.',
      'Pontos miúdos, perfeitos. Alguém passou meses nisso.',
    ]));
  },
  async hw_clock(ctx) {
    ctx.state.touch('hw_clock');
    await ctx.say('pensa', 'O relógio está parado. Tem três ponteiros — o terceiro é vermelho e não aponta pra hora nenhuma.');
    await ctx.say('pensa:worried', 'Mesmo parado, eu continuo ouvindo o tique-taque.');
  },
  async hw_door_bath(ctx) {
    ctx.sfx('door_locked');
    await ctx.say('pensa', byTimes(ctx, 'hw_door_bath', [
      'Trancada. Lá dentro uma torneira pinga. Contei até cem. O ritmo não muda.',
      'Ninguém entrou nem saiu desse banheiro desde que eu cheguei.',
    ]));
  },
  async hw_phone(ctx) {
    ctx.state.touch('hw_phone');
    await ctx.say('pensa', 'Sem linha. O fio foi cortado com cuidado…');
    await ctx.say('pensa:worried', '…e depois alguém amarrou um lacinho vermelho na ponta.');
  },

  // ------------------------------------------------------ quarto da Clara
  async cr_bed(ctx) {
    ctx.state.touch('cr_bed');
    await ctx.say('pensa', 'Bichos de pelúcia. Um coelho foi remendado com um retalho roxo.');
    await ctx.say('pensa:worried', 'Falta um pedaço no meu capuz. Do mesmo tamanho.');
    if (ctx.npc('clara')) await ctx.say('clara', 'Ele se chama Arthurzinho. Ele dorme comigo.');
  },
  async cr_window(ctx) {
    ctx.state.touch('cr_window');
    await ctx.say('pensa', 'Cortinas de renda. O vidro foi pintado de preto por fora.');
  },
  async cr_shrine(ctx) {
    const first = ctx.state.touch('cr_shrine') === 1;
    await ctx.read('shrine_photo');
    if (first) {
      await ctx.say('pensa:worried', 'Ela me seguiu. Por meses.');
      if (ctx.npc('clara')) await ctx.say('clara', 'Essa do ponto é a minha preferida. Você parecia tão cansado. Deu vontade de cuidar de você.');
      await ctx.say('pensa', 'Embaixo do mural, velas acesas e uma mecha de cabelo amarrada com fita. Etiqueta: “A.”');
      await ctx.say('pensa:worried', 'Quando foi que ela cortou meu cabelo?');
    }
  },
  async cr_dollhouse(ctx) {
    ctx.state.touch('cr_dollhouse');
    await ctx.say('pensa', 'Uma casa de bonecas igual a esta casa. No quarto de hóspedes, um bonequinho de capuz roxo.');
    await ctx.say('pensa', 'Embaixo, na mesinha, alguém pintou mais um cômodo. Todo vermelho. Tem uma boneca deitada no meio, cercada de risquinhos.');
    await ctx.say('pensa:worried', 'Esta casa não tem porão. …Tem?');
  },
  async cr_poster(ctx) {
    ctx.state.touch('cr_poster');
    await ctx.say('pensa', '“MARIPOSA — turnê do silêncio.” Nunca ouvi falar dessa banda. A presilha da Clara tem o mesmo desenho.');
  },
  async cr_desk(ctx) {
    const n = ctx.state.touch('cr_desk');
    if (n === 1 && ctx.npc('clara')) {
      await ctx.say('clara', 'Pode ler. Eu não tenho segredos com você.');
    }
    await ctx.read('clara_diary');
    if (n === 1) await ctx.say('pensa:worried', '“Especial por outro motivo.” Que motivo?');
  },
  async talk_clara(ctx) {
    const n = ctx.state.touch('talk_clara');
    const talks = [
      [['clara', 'Você veio! Pode sentar, se quiser. Não repara na bagunça.'], ['arthur:worried', 'Clara, por que eu?'], ['clara', 'Porque você nunca olhava pra ninguém. Então quando você olhasse, ia ser pra mim.']],
      [['clara', 'Sabia que você morde a manga do casaco quando fica nervoso? Eu acho fofo.']],
      [['clara', 'O papai diz que você é especial por outro motivo. Mas eu não ligo pro motivo dele.'], ['arthur:worried', 'Que motivo?'], ['clara:stare', 'Ele não me conta tudo. Diz que eu ia ficar triste.']],
      [['clara:stare', 'Às vezes eu escuto cantarem lá embaixo, de madrugada. A mamãe diz que é o encanamento.']],
      [['clara', 'Você tá olhando pra porta de novo.']],
    ];
    await lines(ctx, talks[Math.min(n, talks.length) - 1]);
  },

  // ------------------------------------------------------------------ sala
  async lr_tv(ctx) {
    ctx.sfx('static');
    await ctx.say('pensa', byTimes(ctx, 'lr_tv', [
      'Só chuvisco. Por um instante achei que via esta sala na tela. Esta mesma sala, com uma pessoa a mais no sofá.',
      'Chuvisco. Só chuvisco.',
    ]));
  },
  async lr_sofa(ctx) {
    ctx.state.touch('lr_sofa');
    await ctx.say('pensa', 'Afundado no meio, como se alguém muito pesado sentasse sempre no mesmo lugar. Cheira a cera de vela.');
  },
  async lr_table(ctx) {
    ctx.state.touch('lr_table');
    await ctx.say('pensa', 'Chá frio. Um livro de nomes de bebê. Só uma página está marcada: a da letra A.');
  },
  async lr_portrait(ctx) {
    ctx.state.touch('lr_portrait');
    await ctx.say('pensa', 'Um retrato a óleo da família. No meio deles, uma cadeira vazia — pintada com mais luz do que todo o resto.');
  },
  async lr_window(ctx) {
    ctx.state.touch('lr_window');
    await ctx.say('pensa', 'Atrás das cortinas pesadas, a janela foi fechada com tijolos. O reboco ainda está úmido.');
  },
  async lr_front_door(ctx) {
    ctx.sfx('door_locked');
    await ctx.say('pensa', byTimes(ctx, 'lr_front_door', [
      'Três fechaduras e uma corrente. Todas trancadas por dentro, com chaves que não estão aqui.',
      'Eu gritei no primeiro dia. Bati até machucar as mãos. Ninguém veio.',
      'Ninguém nunca vem.',
    ]));
  },
  async lr_bookshelf(ctx) {
    if (ctx.state.touch('lr_bookshelf') === 1) {
      await ctx.say('pensa', 'A estante do pai. Mitologia nórdica, japonesa, chinesa, indiana… Cheia de anotações nas margens.');
    }
    let done = false;
    while (!done) {
      const opts = ['Edda Poética', 'Kojiki', 'Clássico das Montanhas e dos Mares', 'Rigveda', 'A gaveta trancada', 'Sair'];
      const i = await ctx.choose('pensa', 'O que eu olho?', opts);
      if (i === 0) await ctx.read('book_edda');
      else if (i === 1) await ctx.read('book_kojiki');
      else if (i === 2) await ctx.read('book_shanhaijing');
      else if (i === 3) await ctx.read('book_rigveda');
      else if (i === 4) { await INTERACTIONS.lr_drawer(ctx); done = true; }
      else done = true;
      if (i <= 3) {
        ctx.state.touch(`book_${i}`);
        if ([0, 1, 2, 3].every((k) => ctx.state.times(`book_${k}`) > 0) && !ctx.state.flag('books_all')) {
          ctx.state.set('books_all');
          await ctx.say('pensa:worried', 'Ele lê o fim do mundo de todo mundo como quem estuda pra uma prova.');
        }
      }
    }
  },
  async lr_drawer(ctx) {
    if (!ctx.state.has('key')) {
      ctx.sfx('door_locked');
      await ctx.say('pensa', 'Uma gaveta embaixo da estante, trancada. A fechadura é pequena, de latão.');
      if (ctx.npc('pai')) await ctx.say('pai:stare', 'A gaveta não, Arthur. Ainda não é a hora.');
      return;
    }
    if (ctx.npc('pai')) {
      await ctx.say('pai:stare', 'Já disse. A gaveta não.');
      return;
    }
    ctx.sfx('unlock');
    await ctx.wait(500);
    await ctx.say('pensa', 'A chavinha serviu. Lá dentro, embrulhado num pano branco, um caderno costurado à mão.');
    ctx.state.set('notebook_found');
    await ctx.read('notebook');
    await EVENTS.finale(ctx);
  },
  async talk_pai(ctx) {
    const n = ctx.state.touch('talk_pai');
    const talks = [
      [
        ...(ctx.state.flags.pego_por === 'pai'
          ? [['pai:stare', 'Sobre ontem à noite. Você estava fora de si. Vamos fingir que não aconteceu. Para o seu bem.']]
          : [['pai', 'Soube que você andou sonâmbulo. Acontece com quem dorme em casa estranha.']]),
        ['pai', 'Ah. Arthur. Sente-se, se quiser. A casa é sua.'],
        ['arthur:worried', 'Vocês não podem me manter aqui.'],
        ['pai', 'Nós não estamos mantendo você. Estamos *guardando* você. Há uma diferença, e um dia você vai entendê-la.'],
        ['pai', 'Você gosta de ler? Os antigos sabiam muita coisa. Os nórdicos escreveram o fim do mundo deles com uma precisão comovente.'],
        ['pai:stare', 'Mas nenhum deles se perguntou o que nasce depois.'],
        ['pai', 'Fique à vontade com a minha estante. Só não mexa na gaveta.'],
      ],
      [['pai', 'A Clara gosta muito de você. Seja gentil com ela. Ela não sabe de tudo.']],
      [['pai', 'Está ouvindo a chuva? Começou no dia em que você chegou. Não acho que seja coincidência.']],
      [['pai', 'Leia o que quiser, filho.'], ['arthur:worried', 'Eu não sou seu filho.'], ['pai:stare', 'Não. Não é.']],
    ];
    await lines(ctx, talks[Math.min(n, talks.length) - 1]);
  },

  // --------------------------------------------------------------- cozinha
  async kt_drawer(ctx) {
    if (ctx.state.has('key')) {
      await ctx.say('pensa', 'Talheres, barbante, fósforos. Mais nada.');
      return;
    }
    await ctx.say('pensa', 'Talheres, barbante, fósforos… e uma chavinha de latão com uma etiqueta.');
    await ctx.say('narr', '“estante — P.”');
    ctx.give('key');
    ctx.sfx('item');
    ctx.toast('Você pegou a chave pequena.');
    if (!ctx.state.flag('pai_moved')) await EVENTS.paiCalled(ctx);
  },
  async kt_stove(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'kt_stove', [
      'Uma panela enorme fervendo. Cheira bem. Isso é o pior: cheira muito bem.',
      'Ela mexe a panela sempre no mesmo sentido. Nunca ao contrário.',
    ]));
  },
  async kt_table(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'kt_table', [
      'A mesa está posta para cinco. Velas brancas no meio.',
      'Somos quatro nesta casa. Contei de novo. Quatro.',
    ]));
  },
  async kt_jars(ctx) {
    ctx.state.touch('kt_jars');
    await ctx.say('pensa', 'Arruda. Mirra. Sal grosso — muito sal grosso. O último pote não tem etiqueta.');
    await ctx.say('pensa:worried', 'São cabelos. Castanho-claros. São os meus.');
  },
  async kt_calendar(ctx) {
    ctx.state.touch('kt_calendar');
    await ctx.read('calendar');
    await ctx.say('pensa:worried', 'Os riscos começam no dia em que me trouxeram. Faltam quatro dias para o círculo.');
  },
  async kt_fridge(ctx) {
    ctx.state.touch('kt_fridge');
    await ctx.say('pensa', 'Desenhos da Clara presos com ímãs. E uma lista de compras:');
    await ctx.say('narr', '“leite, ovos, sal grosso (MUITO), velas brancas (40), lençóis novos, fita vermelha, mel.”');
  },
  async kt_basement(ctx) {
    ctx.sfx('door_locked');
    const n = ctx.state.touch('kt_basement');
    if (n === 1) {
      await ctx.say('pensa', 'Uma corrente e um cadeado. Por baixo da porta sai uma luz avermelhada e um ar quente.');
      await ctx.say('pensa:worried', 'Lá embaixo tem um zumbido grave. Parece um coro cantando de boca fechada.');
      if (ctx.npc('mae')) await ctx.say('mae:open', 'Aí não, querido. Lá embaixo ainda estamos arrumando.');
    } else {
      await ctx.say('pensa:worried', 'O zumbido para quando eu encosto o ouvido na porta. Como se alguém lá embaixo também estivesse escutando.');
    }
  },
  async talk_mae(ctx) {
    const n = ctx.state.touch('talk_mae');
    const talks = [
      [
        ['mae', 'Arthur, querido! Melhor da febre? Você nos deu um susto ontem à noite.'],
        ['arthur:worried', 'Vocês me amarraram no porão.'],
        ['mae', 'Ai, de novo isso. Querido, você caiu da escada. Eu estava lá. Você está lembrando errado, e tudo bem, a cabeça faz isso.'],
        ['mae', 'Já está com fome? O cozido demora mais um pouquinho.'],
        ['arthur:worried', 'Eu não sou seu filho.'],
        ['mae', 'Ninguém é filho de ninguém de verdade, sabia? A gente escolhe. A gente arruma a casa e espera.'],
        ['mae', 'Pode pegar o que quiser na cozinha. Esta casa é sua.'],
        ['mae:open', 'Só não desça. A porta do porão fica fechada.'],
      ],
      [['mae', 'Você precisa comer mais, querido. Vai precisar de forças.']],
      [['mae', 'A Clara é uma boa menina. Um pouco intensa. Puxou o pai.']],
      [['mae:open', 'Faltam poucos dias. Eu estou tão feliz que você está aqui.']],
    ];
    await lines(ctx, talks[Math.min(n, talks.length) - 1]);
  },
};

// ===========================================================================
// FASE 1 — noite, porão e fuga (textos-rascunho: serão reescritos pelo autor)
// ===========================================================================
const QUEM_PEGOU = {
  mae: [
    ['mae', 'Arthur? Querido… o que você está fazendo de pé a essa hora?'],
    ['arthur:worried', 'Vocês me amarraram. Num porão.'],
    ['mae', 'Amarraram? Ai, meu amor. Você caiu da escada do porão. Bateu a cabeça. Eu passei a noite inteira do seu lado.'],
    ['mae:open', 'Olha esses pulsos. Você se debateu tanto com a febre… Eu tive que segurar você.'],
    ['arthur:worried', 'Eu sei o que aconteceu.'],
    ['mae', 'Sabe? Então por que está tremendo? Shhh. Ninguém está bravo com você. Vamos pra cama. Pra *sua* cama.'],
  ],
  clara: [
    ['clara:stare', '…Arthur?'],
    ['clara', 'Você saiu! Você veio me ver, né? Eu sabia que você ia vir.'],
    ['arthur:worried', 'Clara, eles me amarraram lá embaixo. Me ajuda a sair daqui.'],
    ['clara:stare', 'Ninguém te amarrou.'],
    ['clara', 'Você dormiu no sofá e teve um pesadelo. Eu fiquei do seu lado o tempo todo. Você não lembra? Eu lembro.'],
    ['clara', 'Mamãe! Papai! Ele acordou!'],
  ],
  pai: [
    ['pai', 'Solta a porta.'],
    ['arthur:worried', 'Me deixa sair. Eu não conto pra ninguém, eu juro—'],
    ['pai:stare', 'Solta. A porta. Arthur.'],
    ['narr', 'Ele aperta meu braço até eu sentir o osso.'],
    ['pai', 'Você está com febre. Está confuso. Ninguém trancou você em lugar nenhum.'],
    ['pai:stare', 'E se você acordar a minha filha de novo, eu vou ser muito menos gentil.'],
  ],
};

const DE_ONDE = { mae: 1, clara: 1, pai: -1 }; // de que lado a pessoa chega

Object.assign(EVENTS, {
  /** Novo jogo: o Arthur acorda amarrado no porão. */
  async introBasement(ctx) {
    await ctx.wait(900);
    await ctx.say('narr', 'Escuro. Cheiro de mofo e de cera derretida.');
    await ctx.say('pensa:worried', 'Minhas mãos… estão amarradas atrás da cadeira. Os tornozelos também.');
    await ctx.say('pensa', 'Um porão. A última coisa que eu lembro é o ponto de ônibus. E uma mão no meu ombro.');
    await ctx.say('pensa:worried', 'Preciso sair daqui antes que alguém desça.');
    ctx.toast('Aperte E para forçar as cordas.');
  },

  /** Barulho demais enquanto ainda está amarrado: a Mãe desce para ver. */
  async maeDesce(ctx) {
    ctx.state.touch('mae_desceu');
    for (let i = 0; i < 4; i++) { ctx.sfx('step_wood'); await ctx.wait(420); }
    ctx.sfx('door_open');
    ctx.spawnNpc('mae', 'mae', 1300, 540, -1);
    await ctx.walkNpc('mae', ctx.playerX() + 140, 600, 110);
    await lines(ctx, [
      ['mae', 'Shhh. Shhh. Tá tudo bem.'],
      ['arthur:worried', 'Me solta. Por favor.'],
      ['mae', 'Você está com febre, querido. Fica falando dormindo. Ninguém está te machucando.'],
      ['narr', 'Ela aperta os nós. Com cuidado. Com muito cuidado.'],
      ['mae:open', 'Pronto. Assim você não cai da cadeira. Amanhã de manhã você vai se sentir melhor.'],
    ]);
    ctx.state.set('cordas', 0);
    await ctx.walkNpc('mae', 1300, 540, 120);
    ctx.removeNpc('mae');
    ctx.sfx('door_close');
    ctx.noise(-2);
  },

  /** Alguém pega o Arthur fora da cadeira. Muda a história, não é derrota. */
  async caught(ctx, who, roomId) {
    ctx.state.set('pego_por', who);
    ctx.state.set('pego_em', roomId);
    ctx.sfx('heartbeat');
    const from = DE_ONDE[who] || 1;
    const x = ctx.playerX() + from * 320;
    ctx.spawnNpc(who, who, x, 600, -from);
    ctx.facePlayerTo(x);
    await ctx.walkNpc(who, ctx.playerX() + from * 130, 610, 150);
    for (const [w, t] of QUEM_PEGOU[who] || QUEM_PEGOU.mae) await ctx.say(w, t);
    ctx.sfx('heartbeat');
    await ctx.darken(1, 1400);
    await ctx.say('narr', 'Não lembro de ter subido as escadas. Não lembro de mais nada.');
    // vai para a Fase 2
    ctx.setPhase2();
    ctx.state.items = [];
    ctx.state.set('door_unlocked', false);
    await ctx.goto('guestroom', { x: 720, y: 660, face: 1 }, { intro: true });
  },
});

// ------------------------------------------------------------- porão
Object.assign(INTERACTIONS, {
  async bs_ropes(ctx) {
    const res = await ctx.struggle({
      start: ctx.state.flags.cordas || 0,
      onHit: (p) => { ctx.jolt(false); if (Math.random() < 0.25) ctx.sfx('creak'); ctx.state.set('cordas', p); },
      onMiss: () => { ctx.jolt(true); ctx.sfx('creak'); return ctx.noise(0.16); },
    });
    if (res.result === 'ouvido') return EVENTS.maeDesce(ctx);
    ctx.state.set('amarrado', false);
    ctx.state.set('cordas', 100);
    await ctx.freePlayer();
    await ctx.say('pensa', 'Consegui. Meus pulsos estão em carne viva.');
    await ctx.say('pensa:worried', 'Devagar. Se eu fizer barulho, alguém desce. (Shift: andar em silêncio.)');
    ctx.save();
  },
  async bs_boxes(ctx) {
    if (!ctx.state.has('jornal') && !ctx.state.flag('porao_aberto')) {
      await ctx.say('pensa', 'Caixas de enfeites de Natal. Embaixo, uma pilha de jornais velhos.');
      ctx.give('jornal');
      ctx.sfx('page');
      ctx.toast('Jornal velho');
      return;
    }
    await ctx.say('pensa', 'Enfeites de Natal. Bolas de vidro embrulhadas uma a uma. Uma família que comemora o Natal.');
  },
  async bs_shelf(ctx) {
    if (!ctx.state.has('arame') && !ctx.state.flag('porao_aberto')) {
      await ctx.say('pensa', 'Latas de tinta. Uma caixa de ferramentas — vazia. Tiraram tudo que corta.');
      await ctx.say('pensa', 'Sobrou um cabide de arame.');
      ctx.give('arame');
      ctx.toast('Cabide de arame');
      return;
    }
    await ctx.say('pensa', 'Nem uma chave de fenda. Pensaram em tudo.');
  },
  async bs_window(ctx) {
    await ctx.say('pensa', byTimes(ctx, 'bs_window', [
      'Grades. Do lado de fora, grama alta e chuva. Mesmo sem as grades, eu não passaria.',
      'Gritar daqui? A casa mais próxima… eu nem sei se existe casa mais próxima.',
    ]));
  },
  async bs_chair(ctx) {
    await ctx.say('pensa', 'As cordas são novas. Ainda têm o vinco da embalagem. Compraram para isso.');
  },
  async bs_heater(ctx) {
    await ctx.say('pensa', 'O aquecedor estala. O porão está quente demais pra uma lâmpada só e esse aquecedor velho.');
  },
  async bs_wall(ctx) {
    ctx.state.set('pista_subsolo');
    await ctx.say('pensa', 'Essa parte da parede é mais nova. Tijolos limpos, sem mofo, assentados com pressa.');
    await ctx.say('pensa', 'Da grelha no chão sobe um ar quente. E um zumbido grave, constante.');
    await ctx.say('pensa:worried', 'Tem alguma coisa embaixo deste porão.');
  },
  async bs_mattress(ctx) {
    await ctx.say('pensa', 'Um colchonete, um balde, uma garrafa d’água pela metade.');
    await ctx.say('pensa:worried', 'Eles planejaram que eu ficasse aqui um bom tempo.');
  },
  async bs_stairs(ctx) {
    if (ctx.state.flag('porao_aberto')) { ctx.noise(0.08); return ctx.useDoor(); }
    ctx.noise(0.08);
    if (ctx.state.has('jornal') && ctx.state.has('arame')) {
      await ctx.say('pensa', 'A chave está na fechadura, do outro lado. Passo o jornal por baixo da porta…');
      ctx.sfx('page');
      await ctx.say('pensa', '…enfio o arame na fechadura e empurro, devagar…');
      ctx.sfx('unlock');
      const heard = ctx.noise(0.25);
      if (heard) return;
      await ctx.wait(500);
      await ctx.say('pensa', '…e puxo o jornal de volta. A chave veio junto.');
      ctx.take('jornal');
      ctx.take('arame');
      ctx.give('chave_porao');
      ctx.sfx('item');
      await ctx.wait(400);
      ctx.sfx('unlock');
      ctx.take('chave_porao');
      ctx.state.set('porao_aberto');
      await ctx.say('pensa:worried', 'Aberta.');
      ctx.save();
      return;
    }
    ctx.sfx('door_locked');
    await ctx.say('pensa', 'Subo a escada devagar. A porta está trancada. Pela fechadura dá pra ver: a chave está do outro lado.');
    if (ctx.state.has('jornal')) await ctx.say('pensa', 'O jornal passa por baixo da porta. Agora preciso de algo fino pra empurrar a chave.');
    else if (ctx.state.has('arame')) await ctx.say('pensa', 'Posso empurrar a chave com o arame… mas ela vai cair no chão do outro lado, longe de mim.');
    else await ctx.say('pensa', 'Se eu conseguisse derrubar a chave… e puxar ela pra cá.');
  },

  // ------------------------------------------------- casa de madrugada
  async kt_hook(ctx) {
    if (ctx.state.has('molho')) return ctx.say('pensa', 'Ganchos vazios.');
    await ctx.say('pensa', 'Um molho de chaves no gancho, ao lado da porta. Devagar. Sem fazer barulho.');
    ctx.noise(0.12);
    ctx.give('molho');
    ctx.toast('Molho de chaves');
  },
});

// portas e objetos que mudam conforme a fase
const fase2 = {
  kt_basement: INTERACTIONS.kt_basement,
  lr_front_door: INTERACTIONS.lr_front_door,
  hw_door_clara: null,
  hw_door_guest: null,
};
Object.assign(INTERACTIONS, {
  async kt_basement(ctx) {
    if (ctx.state.flag('fase1')) { ctx.noise(0.05); return ctx.useDoor(); }
    ctx.sfx('door_locked');
    await ctx.say('pensa', byTimes(ctx, 'kt_basement_f2', [
      'A porta do porão. Agora tem um cadeado novo, ainda brilhando.',
      'Eu estive lá embaixo. Eu sei que estive. Meus pulsos sabem.',
    ]));
    if (ctx.state.flag('pista_subsolo') && ctx.state.times('kt_basement_f2') === 1) {
      await ctx.say('pensa:worried', 'E embaixo do porão, aquele zumbido. Daqui dá pra sentir no chão.');
    }
    if (ctx.npc('mae') && ctx.state.times('kt_basement_f2') === 1) await ctx.say('mae:open', 'Aí não, querido. Você já caiu daquela escada uma vez.');
  },
  async lr_front_door(ctx) {
    if (!ctx.state.flag('fase1')) return fase2.lr_front_door(ctx);
    if (!ctx.state.has('molho')) {
      ctx.sfx('door_locked');
      ctx.noise(0.2);
      await ctx.say('pensa', 'Três fechaduras e uma corrente. Preciso das chaves.');
      return;
    }
    await ctx.say('pensa', 'Primeira fechadura…');
    ctx.sfx('unlock'); ctx.noise(0.15);
    await ctx.wait(700);
    await ctx.say('pensa', '…abriu. Segunda…');
    ctx.sfx('unlock'); ctx.noise(0.15);
    await ctx.wait(700);
    await ctx.say('pensa', '…abriu. A terceira—');
    ctx.sfx('door_locked');
    await ctx.say('pensa:worried', 'Nenhuma dessas chaves entra. E a corrente tem cadeado.');
    await ctx.say('pensa:worried', 'Não. Não, não, não.');
    ctx.state.set('tentou_porta');
    ctx.sfx('door_locked');
    await ctx.wait(300);
    ctx.sfx('door_locked');
    // a porta faz barulho demais: o Pai sempre ouve
    return EVENTS.caught(ctx, 'pai', 'livingroom');
  },
  async hw_door_clara(ctx) {
    if (!ctx.state.flag('fase1')) return ctx.useDoor();
    ctx.noise(0.15);
    await ctx.say('pensa', 'Tem luz por baixo da porta. Ela está acordada.');
    await ctx.say('pensa:worried', 'Ouço ela falando baixinho. Com quem?');
  },
  async hw_door_guest(ctx) {
    if (!ctx.state.flag('fase1')) return ctx.useDoor();
    ctx.sfx('door_locked');
    ctx.noise(0.1);
    await ctx.say('pensa', 'Trancada. Pela fresta, um quarto arrumado demais. Esperando alguém.');
  },
});

// ---------------------------------------------------------- paranoia
/** Pequenos acontecimentos que podem não ser reais. Ficam mais frequentes com o tempo. */
export async function PARANOIA(ctx, roomId, fase1) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const x = ctx.playerX();
  const ev = {
    sussurro: async () => { ctx.whisper(pick(['…Arthur…', '…fica…', '…ele está ouvindo…', '…está quase…'])); },
    passos: async () => { for (let i = 0; i < 5; i++) { ctx.sfx('step_wood'); await ctx.wait(380 + Math.random() * 120); } },
    batidas: async () => { for (let i = 0; i < 3; i++) { ctx.sfx('door_locked'); await ctx.wait(420); } },
    vulto: async () => { await ctx.vulto(x + (Math.random() < 0.5 ? -420 : 300), 525, Math.random() < 0.5 ? 1 : -1); },
    luz: async () => { await ctx.flicker(2); },
    rangido: async () => { ctx.sfx('creak'); },
    tv: async () => { ctx.sfx('static'); ctx.whisper('…esta sala…'); },
  };
  const pools = {
    basement: ['passos', 'sussurro', 'luz', 'batidas', 'rangido'],
    kitchen: ['sussurro', 'vulto', 'batidas', 'rangido'],
    livingroom: ['vulto', 'tv', 'sussurro', 'rangido'],
    hallway: ['vulto', 'sussurro', 'rangido', 'passos'],
  };
  const pool = pools[roomId] || ['sussurro', 'rangido', 'luz'];
  const calm = ['rangido', 'luz', 'sussurro'];
  await ev[pick(fase1 ? pool : pool.filter((p) => calm.includes(p)).concat(['rangido']))]();
}

// Conversas com NPCs são ligadas pelo id do personagem
export const NPC_TALK = { clara: 'talk_clara', mae: 'talk_mae', pai: 'talk_pai' };

// Verificações automáticas após cada interação (eventos que "acontecem")
export async function afterInteraction(ctx, roomId) {
  if (roomId === 'guestroom' && !ctx.state.flag('door_unlocked') && ctx.state.countSeen('gr_') >= 5) {
    await EVENTS.claraVisit(ctx);
  }
}
