// Estado do jogo (flags, itens, documentos lidos) e salvamento em localStorage.

const SAVE_KEY = 'apocrifo_save_v1';
const SETTINGS_KEY = 'apocrifo_settings_v1';

function safeStorage(fn, fallback = null) {
  try { return fn(window.localStorage); } catch (e) { return fallback; }
}

export class GameState {
  constructor() { this.reset(); }

  reset() {
    this.room = 'guestroom';
    this.pos = null;           // {x, y} do Arthur ao carregar
    this.flags = {};           // marcos da história
    this.items = [];           // inventário simples
    this.docs = [];            // documentos já lidos (podem ser relidos na pausa)
    this.seen = {};            // contagem de interações por id
  }

  flag(name) { return !!this.flags[name]; }
  set(name, value = true) { this.flags[name] = value; }
  has(item) { return this.items.includes(item); }
  give(item) { if (!this.has(item)) this.items.push(item); }
  markDoc(id) { if (!this.docs.includes(id)) this.docs.push(id); }

  /** Registra que o jogador interagiu com algo; devolve quantas vezes já foi. */
  touch(id) {
    this.seen[id] = (this.seen[id] || 0) + 1;
    return this.seen[id];
  }
  times(id) { return this.seen[id] || 0; }
  countSeen(prefix) {
    return Object.keys(this.seen).filter((k) => k.startsWith(prefix)).length;
  }

  save() {
    const data = { room: this.room, pos: this.pos, flags: this.flags, items: this.items, docs: this.docs, seen: this.seen, t: Date.now() };
    safeStorage((s) => s.setItem(SAVE_KEY, JSON.stringify(data)));
  }

  load() {
    const raw = safeStorage((s) => s.getItem(SAVE_KEY));
    if (!raw) return false;
    try {
      const d = JSON.parse(raw);
      this.reset();
      Object.assign(this, { room: d.room, pos: d.pos, flags: d.flags || {}, items: d.items || [], docs: d.docs || [], seen: d.seen || {} });
      return true;
    } catch (e) {
      return false;
    }
  }

  static hasSave() { return !!safeStorage((s) => s.getItem(SAVE_KEY)); }
  static clearSave() { safeStorage((s) => s.removeItem(SAVE_KEY)); }

  static loadSettings() {
    const raw = safeStorage((s) => s.getItem(SETTINGS_KEY));
    try { return Object.assign({ volume: 0.7 }, raw ? JSON.parse(raw) : {}); } catch (e) { return { volume: 0.7 }; }
  }
  static saveSettings(settings) { safeStorage((s) => s.setItem(SETTINGS_KEY, JSON.stringify(settings))); }
}
