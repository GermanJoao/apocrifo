// Gerenciador de áudio.
// Cada som pode vir de um arquivo (ver js/data/audioManifest.js) ou, na falta
// dele, de um sintetizador simples. Os volumes são propositalmente baixos:
// a ideia é desconforto, não susto.

import { AUDIO_FILES } from '../data/audioManifest.js';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.buffers = {};
    this.ambient = {};   // nome -> {stop()}
    this.volume = 0.7;
    this.muted = false;
  }

  /** Precisa ser chamado após um gesto do usuário (clique/tecla). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this.noiseBuf = this._makeNoise(2);
    this._loadFiles();
    if (this.desired) this.setAmbience(this.desired);
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  async _loadFiles() {
    this.volumes = {};
    const decode = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr = await res.arrayBuffer();
      return new Promise((ok, fail) => this.ctx.decodeAudioData(arr, ok, fail));
    };
    // ambientes primeiro (são os que mais se percebe faltando)
    const entries = Object.entries(AUDIO_FILES).sort(([a], [b]) => (b.startsWith('amb') ? 1 : 0) - (a.startsWith('amb') ? 1 : 0));
    await Promise.all(entries.map(async ([name, entry]) => {
      if (!entry) return;
      const spec = typeof entry === 'string' ? { src: entry } : entry;
      const urls = Array.isArray(spec.src) ? spec.src : [spec.src];
      const list = [];
      for (const url of urls) {
        try { list.push(await decode(url)); } catch (e) {
          console.warn(`[áudio] não foi possível carregar ${url}; usando som sintetizado.`, e);
        }
      }
      if (!list.length) return;
      this.buffers[name] = list;
      this.volumes[name] = spec.volume ?? 0.8;
      // se um ambiente já estava tocando sintetizado, troca pelo arquivo
      if (this.ambient[name]) { this.stopAmbient(name); this.playAmbient(name); }
    }));
  }

  _makeNoise(seconds) {
    const len = this.ctx.sampleRate * seconds;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // ruído marrom (mais grave)
      d[i] = white * 0.5 + last * 3;
    }
    return buf;
  }

  _noise(loop = false) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = loop;
    return src;
  }

  _gain(v, dest = this.master) {
    const g = this.ctx.createGain();
    g.gain.value = v;
    g.connect(dest);
    return g;
  }

  _filter(type, freq, q = 1) {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  _env(gainNode, t, attack, peak, decay) {
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(peak, t + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  _playBuffer(name, vol = 1, loop = false) {
    const list = this.buffers[name];
    const src = this.ctx.createBufferSource();
    src.buffer = list[Math.floor(Math.random() * list.length)];
    src.loop = loop;
    if (!loop) src.playbackRate.value = 0.94 + Math.random() * 0.12; // pequena variação natural
    const g = this._gain(loop ? 0 : vol);
    src.connect(g);
    if (loop) {
      // começa num ponto aleatório e entra devagar
      src.start(0, Math.random() * src.buffer.duration);
      g.gain.setTargetAtTime(vol, this.ctx.currentTime, 1.2);
      return this._fadeOutStop([src], g);
    }
    src.start();
    return { stop: () => { try { src.stop(); } catch (e) { /* já parado */ } } };
  }

  // ---------------------------------------------------------------- efeitos
  play(name, opts = {}) {
    if (!this.ctx) return;
    if (this.buffers[name]) { this._playBuffer(name, opts.volume ?? this.volumes[name]); return; }
    const t = this.ctx.currentTime;
    const synth = {
      step_wood: () => this._thump(t, 220 + Math.random() * 60, 0.22, 0.09),
      step_tile: () => { this._thump(t, 900 + Math.random() * 200, 0.12, 0.05); this._thump(t, 160, 0.12, 0.06); },
      interact: () => this._tone(t, 520, 0.05, 0.12, 'sine', 0.06),
      page: () => this._swish(t, 0.25, 2500, 0.18),
      item: () => { this._tone(t, 392, 0.02, 0.9, 'sine', 0.08); this._tone(t + 0.18, 587, 0.02, 1.2, 'sine', 0.06); },
      door_open: () => this._creak(t),
      door_locked: () => { for (let i = 0; i < 3; i++) this._thump(t + i * 0.09, 1400, 0.06, 0.12, 8); },
      unlock: () => { this._thump(t, 1800, 0.05, 0.15, 10); this._thump(t + 0.15, 1200, 0.08, 0.15, 10); },
      heartbeat: () => { this._thump(t, 55, 0.2, 0.5); this._thump(t + 0.28, 50, 0.25, 0.4); },
      flicker: () => { for (let i = 0; i < 5; i++) this._tone(t + i * 0.07, 120, 0.005, 0.05, 'square', 0.015); },
      sting: () => this._sting(t),
      static: () => this._swish(t, 1.2, 4000, 0.05),
    }[name];
    if (synth) synth();
  }

  _thump(t, freq, decay, vol, q = 1) {
    const src = this._noise();
    const f = this._filter('bandpass', freq, q);
    const g = this._gain(0, this.master);
    src.connect(f).connect(g);
    this._env(g, t, 0.004, vol, decay);
    src.start(t, Math.random());
    src.stop(t + decay + 0.1);
  }

  _tone(t, freq, attack, decay, type, vol) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = this._gain(0);
    o.connect(g);
    this._env(g, t, attack, vol, decay);
    o.start(t);
    o.stop(t + attack + decay + 0.1);
  }

  _swish(t, dur, freq, vol) {
    const src = this._noise();
    const f = this._filter('highpass', freq, 0.7);
    const g = this._gain(0);
    src.connect(f).connect(g);
    this._env(g, t, dur * 0.3, vol, dur * 0.7);
    src.start(t, Math.random());
    src.stop(t + dur + 0.1);
  }

  _creak(t) {
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(110, t + 0.5);
    o.frequency.linearRampToValueAtTime(85, t + 0.9);
    const f = this._filter('bandpass', 900, 6);
    const g = this._gain(0);
    o.connect(f).connect(g);
    this._env(g, t, 0.1, 0.06, 0.9);
    o.start(t);
    o.stop(t + 1.1);
    this._thump(t + 0.9, 90, 0.3, 0.12);
  }

  _sting(t) {
    [55, 58.3, 82.4].forEach((fr, i) => {
      const o = this.ctx.createOscillator();
      o.type = i === 2 ? 'sine' : 'sawtooth';
      o.frequency.value = fr;
      const f = this._filter('lowpass', 300);
      const g = this._gain(0);
      o.connect(f).connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 1.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      o.start(t);
      o.stop(t + 4.2);
    });
  }

  // -------------------------------------------------------------- ambientes
  playAmbient(name, vol = 1) {
    if (!this.ctx || this.ambient[name]) return;
    if (this.buffers[name]) { this.ambient[name] = this._playBuffer(name, vol * this.volumes[name], true); return; }
    const maker = {
      amb_rain: () => this._ambNoise('bandpass', 1400, 0.4, 0.05 * vol),
      amb_house: () => this._ambDrone([55, 55.6, 110.3], 0.018 * vol),
      amb_fridge: () => this._ambDrone([60, 120.4], 0.012 * vol),
      amb_fire: () => this._ambNoise('lowpass', 500, 0.8, 0.04 * vol, true),
      amb_choir: () => this._ambDrone([98, 146.8, 196.4, 97.2], 0.016 * vol, 'triangle', 0.15),
      amb_clock: () => this._ambClock(0.07 * vol),
      music_title: () => this._ambDrone([41.2, 61.7, 82.4, 92.5], 0.02 * vol, 'sawtooth', 0.05, 260),
    }[name];
    if (maker) this.ambient[name] = maker();
  }

  stopAmbient(name) {
    const a = this.ambient[name];
    if (a) { a.stop(); delete this.ambient[name]; }
  }

  /** Mantém apenas os ambientes listados (troca de cômodo). */
  setAmbience(list) {
    this.desired = list;
    if (!this.ctx) return;
    for (const name of Object.keys(this.ambient)) if (!list.includes(name)) this.stopAmbient(name);
    for (const name of list) this.playAmbient(name);
  }

  _fadeOutStop(nodes, gain) {
    return {
      stop: () => {
        const t = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setTargetAtTime(0.0001, t, 0.4);
        setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch (e) { /* ok */ } }), 2000);
      },
    };
  }

  _ambNoise(type, freq, q, vol, crackle = false) {
    const src = this._noise(true);
    const f = this._filter(type, freq, q);
    const g = this._gain(0);
    src.connect(f).connect(g);
    g.gain.setTargetAtTime(vol, this.ctx.currentTime, 1.2);
    src.start();
    const nodes = [src];
    if (crackle) {
      const id = setInterval(() => { if (Math.random() < 0.5) this._thump(this.ctx.currentTime, 2000 + Math.random() * 2000, 0.03, 0.03, 4); }, 180);
      return { stop: () => { clearInterval(id); this._fadeOutStop(nodes, g).stop(); } };
    }
    return this._fadeOutStop(nodes, g);
  }

  _ambDrone(freqs, vol, type = 'sine', lfoRate = 0.07, lp = 0) {
    const g = this._gain(0);
    let dest = g;
    if (lp) {
      const f = this._filter('lowpass', lp, 0.5);
      f.connect(g);
      dest = f;
    }
    const nodes = freqs.map((fr) => {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      o.connect(dest);
      o.start();
      return o;
    });
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = lfoRate;
    lfoGain.gain.value = vol * 0.5;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    nodes.push(lfo);
    g.gain.setTargetAtTime(vol, this.ctx.currentTime, 2);
    return this._fadeOutStop(nodes, g);
  }

  _ambClock(vol) {
    let tick = true;
    const id = setInterval(() => {
      this._thump(this.ctx.currentTime, tick ? 3200 : 2600, 0.03, vol, 12);
      tick = !tick;
    }, 1000);
    return { stop: () => clearInterval(id) };
  }

  stopAll() {
    for (const name of Object.keys(this.ambient)) this.stopAmbient(name);
  }
}
