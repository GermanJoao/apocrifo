// Interface em HTML/CSS sobreposta ao canvas:
// diálogo, leitor de documentos, menus, avisos e transições.

import { PORTRAITS } from '../assets.js';

const $ = (id) => document.getElementById(id);

const SPEAKER_NAMES = { arthur: 'Arthur', clara: 'Clara', mae: 'Mãe', pai: 'Pai', voz: '???' };
const ADVANCE_KEYS = ['KeyE', 'Space', 'Enter', 'NumpadEnter'];
const ITEM_ICONS = { molho: 'molho_chaves', key: 'chave_pequena' };
const ITEM_NAMES = { jornal: 'Jornal velho', arame: 'Cabide de arame', chave_porao: 'Chave do porão', molho: 'Molho de chaves', key: 'Chave pequena' };

/** Converte *texto* em destaque e escapa HTML. Devolve lista de caracteres. */
function parseMarkup(text) {
  const chars = [];
  let em = false;
  for (const ch of text) {
    if (ch === '*') { em = !em; continue; }
    chars.push({ ch, em });
  }
  return chars;
}

function renderChars(chars, n) {
  let html = '';
  let inEm = false;
  for (let i = 0; i < n; i++) {
    const c = chars[i];
    if (c.em && !inEm) { html += '<span class="em">'; inEm = true; }
    if (!c.em && inEm) { html += '</span>'; inEm = false; }
    html += c.ch === '<' ? '&lt;' : c.ch === '&' ? '&amp;' : c.ch;
  }
  if (inEm) html += '</span>';
  return html;
}

// ---------------------------------------------------------------------------
class Dialogue {
  constructor(ui) {
    this.ui = ui;
    this.el = $('dialogue');
    this.nameEl = $('dlg-name');
    this.textEl = $('dlg-text');
    this.portraitEl = $('dlg-portrait');
    this.active = false;
    this.el.addEventListener('click', () => this.advance());
  }

  /**
   * Mostra uma fala. speaker: 'arthur', 'clara:stare', 'narr' (narração),
   * 'pensa' (pensamento do Arthur) etc. Resolve quando o jogador avança.
   */
  say(speaker, text) {
    return new Promise((resolve) => {
      const [who, mood] = (speaker || 'narr').split(':');
      const portraitKey = mood ? `${who}:${mood}` : who;
      const isNarr = who === 'narr';
      const isThought = who === 'pensa';
      const pKey = isThought ? (mood ? `arthur:${mood}` : 'arthur') : portraitKey;

      this.el.classList.remove('hidden', 'done', 'narration', 'thought', 'no-portrait');
      if (isNarr) this.el.classList.add('narration');
      if (isThought) this.el.classList.add('thought');
      if (PORTRAITS[pKey]) {
        this.portraitEl.src = PORTRAITS[pKey];
      } else {
        this.el.classList.add('no-portrait');
      }
      this.nameEl.textContent = isNarr ? '' : isThought ? 'Arthur' : (SPEAKER_NAMES[who] || who);

      this.chars = parseMarkup(text);
      this.shown = 0;
      this.resolve = resolve;
      this.active = true;
      this.typing = true;
      this.textEl.innerHTML = '';
      this.ui.audio?.play('interact');
      this._tick();
    });
  }

  _tick() {
    clearTimeout(this.timer);
    if (!this.typing) return;
    this.shown++;
    this.textEl.innerHTML = renderChars(this.chars, this.shown);
    if (this.shown >= this.chars.length) {
      this.typing = false;
      this.el.classList.add('done');
      return;
    }
    const ch = this.chars[this.shown - 1].ch;
    const delay = '.!?…'.includes(ch) ? 220 : ch === ',' ? 110 : 24;
    this.timer = setTimeout(() => this._tick(), delay);
  }

  /** Pergunta com opções. Resolve com o índice escolhido (Esc = última). */
  async choose(speaker, text, options) {
    const p = this.say(speaker, text);
    this.advance(); // mostra o texto inteiro de uma vez
    this.choiceMode = true;
    this.choiceIndex = 0;
    const box = document.createElement('div');
    box.className = 'choices';
    options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.addEventListener('click', (e) => { e.stopPropagation(); this._pick(i); });
      b.addEventListener('mouseenter', () => this._highlight(i));
      box.appendChild(b);
    });
    this.choiceBox = box;
    this.el.querySelector('.dlg-body').appendChild(box);
    this.el.classList.remove('done');
    this._highlight(0);
    return new Promise((resolve) => { this.choiceResolve = resolve; p.then(() => {}); });
  }

  _highlight(i) {
    this.choiceIndex = i;
    [...this.choiceBox.children].forEach((b, k) => b.classList.toggle('sel', k === i));
  }

  _pick(i) {
    this.choiceMode = false;
    this.choiceBox.remove();
    this.choiceBox = null;
    this.ui.audio?.play('interact');
    const r = this.choiceResolve;
    this.choiceResolve = null;
    this.close();
    r(i);
  }

  onChoiceKey(e) {
    const n = this.choiceBox.children.length;
    if (['ArrowDown', 'KeyS'].includes(e.code)) this._highlight((this.choiceIndex + 1) % n);
    else if (['ArrowUp', 'KeyW'].includes(e.code)) this._highlight((this.choiceIndex - 1 + n) % n);
    else if (ADVANCE_KEYS.includes(e.code)) this._pick(this.choiceIndex);
    else if (e.code === 'Escape') this._pick(n - 1);
  }

  advance() {
    if (!this.active || this.choiceMode) return;
    if (this.typing) {
      // primeira tecla completa o texto
      this.typing = false;
      clearTimeout(this.timer);
      this.shown = this.chars.length;
      this.textEl.innerHTML = renderChars(this.chars, this.shown);
      this.el.classList.add('done');
      return;
    }
    this.close();
  }

  close() {
    this.active = false;
    this.el.classList.add('hidden');
    this.ui.markClosed();
    const r = this.resolve;
    this.resolve = null;
    if (r) r();
  }
}

// ---------------------------------------------------------------------------
class Reader {
  constructor(ui) {
    this.ui = ui;
    this.el = $('reader');
    this.sheet = $('reader-sheet');
    this.titleEl = $('reader-title');
    this.pageEl = $('reader-page');
    this.countEl = $('reader-count');
    this.prevBtn = $('reader-prev');
    this.nextBtn = $('reader-next');
    this.active = false;
    this.prevBtn.addEventListener('click', () => this.turn(-1));
    this.nextBtn.addEventListener('click', () => this.turn(1));
  }

  open(doc) {
    return new Promise((resolve) => {
      this.doc = doc;
      this.page = 0;
      this.resolve = resolve;
      this.active = true;
      this.sheet.className = `reader-sheet style-${doc.style || 'paper'}`;
      this.titleEl.textContent = doc.title || '';
      this.el.classList.remove('hidden');
      this.ui.audio?.play('page');
      this._render();
    });
  }

  _render() {
    const page = this.doc.pages[this.page];
    let html = '';
    if (page.img) html += `<img src="${page.img}" alt="">`;
    if (page.html) html += page.html;
    this.pageEl.innerHTML = html;
    this.sheet.scrollTop = 0;
    const n = this.doc.pages.length;
    this.countEl.textContent = n > 1 ? `${this.page + 1} / ${n}` : '';
    this.prevBtn.disabled = this.page === 0;
    this.nextBtn.disabled = this.page === n - 1;
    this.prevBtn.style.visibility = this.nextBtn.style.visibility = n > 1 ? 'visible' : 'hidden';
    this.sheet.classList.remove('flip');
    void this.sheet.offsetWidth; // reinicia a animação
    this.sheet.classList.add('flip');
  }

  turn(dir) {
    const next = this.page + dir;
    if (next < 0 || next >= this.doc.pages.length) return;
    this.page = next;
    this.ui.audio?.play('page');
    this._render();
  }

  close() {
    // fechar só depois de ver a última página? Não: o jogador pode fechar a
    // qualquer momento, mas avançar com E percorre as páginas primeiro.
    this.active = false;
    this.el.classList.add('hidden');
    this.ui.markClosed();
    const r = this.resolve;
    this.resolve = null;
    if (r) r();
  }

  onKey(e) {
    if (['ArrowRight', 'KeyD'].includes(e.code)) this.turn(1);
    else if (['ArrowLeft', 'KeyA'].includes(e.code)) this.turn(-1);
    else if (e.code === 'Escape') this.close();
    else if (ADVANCE_KEYS.includes(e.code)) {
      if (this.page < this.doc.pages.length - 1) this.turn(1);
      else this.close();
    }
  }
}

// ---------------------------------------------------------------------------
export class UI {
  constructor(audio) {
    this.audio = audio;
    this.dialogue = new Dialogue(this);
    this.reader = new Reader(this);
    this.handlers = {};
    this.lastClose = 0;
    this.pauseOpen = false;

    this._bindMenu($('title-menu'));
    this._bindMenu($('pause-menu'));
    this._bindMenu(document.querySelector('#ending-card .menu'));
    $('volume').addEventListener('input', (e) => this.emit('volume', Number(e.target.value) / 100));

    window.addEventListener('keydown', (e) => this._onKey(e));
  }

  on(name, fn) { this.handlers[name] = fn; }
  emit(name, ...args) { this.handlers[name]?.(...args); }

  /** Algum elemento de interface está bloqueando o jogo? */
  isBusy() { return this.dialogue.active || this.reader.active || this.pauseOpen || this.screenOpen || !!this.struggleState; }
  markClosed() { this.lastClose = performance.now(); }
  recentlyClosed(ms = 250) { return performance.now() - this.lastClose < ms; }

  _bindMenu(menu) {
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      this.audio?.unlock();
      this.audio?.play('interact');
      this.emit(btn.dataset.action);
    });
    menu.addEventListener('mouseover', (e) => {
      const btn = e.target.closest('button');
      if (btn && !btn.disabled) btn.focus();
    });
  }

  _visibleMenuButtons() {
    const screen = [...document.querySelectorAll('.screen.visible')].pop();
    if (!screen) return [];
    return [...screen.querySelectorAll('.menu button, #doc-list button')].filter((b) => !b.disabled && b.offsetParent);
  }

  _onKey(e) {
    if (e.repeat) return;
    this.audio?.unlock();

    if (this.struggleState) { e.preventDefault(); this._struggleKey(e); return; }
    if (this.reader.active) { e.preventDefault(); this.reader.onKey(e); return; }
    if (this.dialogue.active && this.dialogue.choiceMode) { e.preventDefault(); this.dialogue.onChoiceKey(e); return; }
    if (this.dialogue.active) {
      if (ADVANCE_KEYS.includes(e.code)) { e.preventDefault(); this.dialogue.advance(); }
      return;
    }
    // navegação por teclado nos menus
    const buttons = this._visibleMenuButtons();
    if (buttons.length) {
      const i = buttons.indexOf(document.activeElement);
      if (['ArrowDown', 'KeyS', 'ArrowRight'].includes(e.code)) { e.preventDefault(); buttons[(i + 1) % buttons.length].focus(); return; }
      if (['ArrowUp', 'KeyW', 'ArrowLeft'].includes(e.code)) { e.preventDefault(); buttons[(i - 1 + buttons.length) % buttons.length].focus(); return; }
      if (['Enter', 'Space', 'KeyE'].includes(e.code) && i >= 0) { e.preventDefault(); buttons[i].click(); return; }
    }
    if (e.code === 'Escape' || e.code === 'KeyP') this.emit('escape');
  }

  // ---------------------------------------------------------------- telas
  show(id) {
    $(id).classList.add('visible');
    this.screenOpen = ['title', 'ending', 'loading'].some((s) => $(s).classList.contains('visible'));
    const first = this._visibleMenuButtons()[0];
    if (first) setTimeout(() => first.focus(), 50);
  }

  hide(id) {
    $(id).classList.remove('visible');
    this.screenOpen = ['title', 'ending', 'loading'].some((s) => $(s).classList.contains('visible'));
  }

  setLoading(p) { $('loading-fill').style.width = `${Math.round(p * 100)}%`; }

  showTitle(hasSave) {
    $('btn-continue').disabled = !hasSave;
    this.hide('loading');
    this.hide('pause');
    this.hide('ending');
    this.show('title');
  }

  openPause(docs, docTitles) {
    this.pauseOpen = true;
    const list = $('doc-list');
    list.classList.add('hidden');
    list.innerHTML = docs.length
      ? docs.map((id) => `<button data-doc="${id}">${docTitles[id] || id}</button>`).join('')
      : '<span class="empty">Nenhum documento ainda.</span>';
    list.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => this.emit('readDoc', b.dataset.doc)));
    this.show('pause');
  }

  toggleDocList() { $('doc-list').classList.toggle('hidden'); }

  closePause() {
    this.pauseOpen = false;
    this.hide('pause');
    this.markClosed();
  }

  setVolumeSlider(v) { $('volume').value = Math.round(v * 100); }

  // --------------------------------------------------------------- avisos
  toast(text, ms = 2600) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  controlsHint(show) {
    const el = $('controls-hint');
    el.innerHTML = show
      ? '<kbd>A</kbd><kbd>D</kbd> / <kbd>←</kbd><kbd>→</kbd> andar &nbsp; <kbd>W</kbd><kbd>S</kbd> profundidade<br><kbd>E</kbd> interagir &nbsp; <kbd>Shift</kbd> devagar &nbsp; <kbd>Esc</kbd> pausa'
      : '';
  }

  fade(to, ms = 600) {
    const el = $('fade');
    el.style.transition = `opacity ${ms}ms ease`;
    el.style.opacity = String(to);
    return new Promise((r) => setTimeout(r, ms));
  }

  error(msg) {
    const el = $('error');
    el.classList.remove('hidden');
    el.textContent = msg;
  }

  // ------------------------------------------------------- Fase 1 (HUD)
  /** Mostra os itens carregados (ícones em assets/interface/itens/<id>.png). */
  setInventory(items, visible = true) {
    const el = $('inventory');
    el.classList.toggle('hidden', !visible);
    const slots = 3;
    let html = items.slice(0, slots).map((id) => `<img src="assets/interface/itens/${ITEM_ICONS[id] || id}.png" alt="${id}" title="${ITEM_NAMES[id] || id}">`).join('');
    for (let i = items.length; i < slots; i++) html += '<div class="slot"></div>';
    el.innerHTML = html;
  }

  setNoise(value, visible = true) {
    const el = $('noise');
    el.classList.toggle('hidden', !visible);
    el.classList.toggle('alto', value > 0.7);
    $('noise-fill').style.width = `${Math.round(Math.min(1, value) * 100)}%`;
  }

  whisper(text, ms = 2600) {
    const el = $('whisper');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.whisperTimer);
    this.whisperTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  /**
   * Minigame das cordas. Alterne A/D no ritmo. Resolve com 'livre' ou,
   * se onMiss devolver true (barulho demais), com 'ouvido'.
   */
  struggle({ start = 0, onMiss, onHit } = {}) {
    return new Promise((resolve) => {
      const st = { progress: start, expect: 'KeyA', windowOpen: false, resolve, onMiss, onHit, done: false };
      this.struggleState = st;
      $('struggle').classList.remove('hidden');
      $('struggle-fill').style.width = `${st.progress}%`;
      const beat = () => {
        if (st.done) return;
        st.windowOpen = true;
        st.answered = false;
        const el = $(st.expect === 'KeyA' ? 'key-a' : 'key-d');
        el.classList.add('ready');
        st.closeTimer = setTimeout(() => {
          el.classList.remove('ready');
          st.windowOpen = false;
        }, 380);
        st.beatTimer = setTimeout(beat, 640);
      };
      st.beatTimer = setTimeout(beat, 500);
    });
  }

  _struggleKey(e) {
    const st = this.struggleState;
    const code = { ArrowLeft: 'KeyA', ArrowRight: 'KeyD' }[e.code] || e.code;
    if (!['KeyA', 'KeyD'].includes(code) || st.done) return;
    const el = $(code === 'KeyA' ? 'key-a' : 'key-d');
    const flash = (cls) => { el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 160); };
    if (st.windowOpen && !st.answered && code === st.expect) {
      st.answered = true;
      st.progress = Math.min(100, st.progress + 9);
      st.expect = st.expect === 'KeyA' ? 'KeyD' : 'KeyA';
      flash('hit');
      st.onHit?.(st.progress);
    } else {
      st.progress = Math.max(0, st.progress - 3);
      flash('miss');
      if (st.onMiss?.()) return this._endStruggle('ouvido');
    }
    $('struggle-fill').style.width = `${st.progress}%`;
    if (st.progress >= 100) this._endStruggle('livre');
  }

  _endStruggle(result) {
    const st = this.struggleState;
    st.done = true;
    clearTimeout(st.beatTimer);
    clearTimeout(st.closeTimer);
    document.querySelectorAll('.struggle-keys span').forEach((s) => s.classList.remove('ready'));
    $('struggle').classList.add('hidden');
    this.struggleState = null;
    this.markClosed();
    st.resolve({ result, progress: st.progress });
  }

  // ---------------------------------------------------------------- final
  async ending(lines) {
    this.show('ending');
    const box = $('ending-lines');
    box.innerHTML = '';
    $('ending-card').classList.add('hidden');
    await this.fade(0, 10);
    for (const text of lines) {
      const p = document.createElement('p');
      p.textContent = text;
      box.appendChild(p);
      await new Promise((r) => setTimeout(r, 60));
      p.classList.add('show');
      await new Promise((r) => setTimeout(r, 3200));
    }
    await new Promise((r) => setTimeout(r, 1200));
    box.innerHTML = '';
    $('ending-card').classList.remove('hidden');
    const first = this._visibleMenuButtons()[0];
    if (first) first.focus();
  }
}
