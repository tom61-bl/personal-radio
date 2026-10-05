/* ============================================================
   音频系统 — 纯原生 Web Audio + HTML5 Audio
   无 Tone.js 依赖，最稳定
   ============================================================ */

const AudioSystem = {
  tracks: {},
  currentChannel: -1,
  isTuning: false,
  volume: 0.6,
  ready: false,
  ctx: null,
  noiseGain: null,
  noiseNode: null,

  // 在用户点击手势内调用
  async resume() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") {
        // 超时保护：resume 最多等 1 秒，不阻塞后续流程
        await Promise.race([
          this.ctx.resume(),
          new Promise((r) => setTimeout(r, 1000))
        ]);
      }
      console.log("[audio] ctx state:", this.ctx.state);
    } catch (e) {
      console.log("[audio] resume error:", e);
    }
  },

  async init() {
    // 创建 5 个音乐轨道
    const files = [
      "audio/ch1-identity.mp3",
      "audio/ch2-now.mp3",
      "audio/ch3-future.mp3",
      "audio/ch4-contact.mp3",
      "audio/ch5-works.mp3"
    ];
    files.forEach((src, i) => {
      const a = new Audio(src);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      this.tracks[i] = a;
    });

    // 调频杂音
    try {
      this.setupNoise();
    } catch (e) {
      console.log("[audio] noise error:", e);
    }

    this.ready = true;
    console.log("[audio] init done, tracks:", Object.keys(this.tracks).length);
  },

  setupNoise() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    this.noiseNode.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(this.ctx.destination);
    this.noiseNode.start();
  },

  playStatic(duration = 0.6) {
    if (!this.ctx || !this.noiseGain) return;
    try {
      const now = this.ctx.currentTime;
      const g = this.noiseGain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0.15, now + 0.05);
      g.setValueAtTime(0.15, now + Math.max(0.1, duration - 0.1));
      g.linearRampToValueAtTime(0, now + duration);
    } catch (e) {}
  },

  // 锁定哔声（方波）
  playBeep() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 1046; // C6
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  },

  // 旋钮声（低频脉冲）
  playClick() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  },

  fadeIn(id, fade = 1.5) {
    const a = this.tracks[id];
    if (!a) {
      console.log("[audio] fadeIn: track", id, "not found");
      return;
    }
    a.volume = 0;
    const p = a.play();
    if (p && p.catch) {
      p.catch((e) => console.log("[audio] play failed:", id, e));
    }
    const target = this.volume;
    const steps = 20;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      a.volume = Math.min(target, (target * i) / steps);
      if (i >= steps) {
        a.volume = target;
        clearInterval(timer);
        console.log("[audio] faded in track", id);
      }
    }, (fade * 1000) / steps);
  },

  fadeOut(id, fade = 0.5) {
    const a = this.tracks[id];
    if (!a) return;
    const start = a.volume;
    const steps = 10;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      a.volume = Math.max(0, start * (1 - i / steps));
      if (i >= steps) {
        a.pause();
        a.currentTime = 0;
        a.volume = 0;
        clearInterval(timer);
      }
    }, (fade * 1000) / steps);
  },

  async switchChannel(id, duration = 0.7) {
    if (this.isTuning) return;
    this.isTuning = true;

    if (this.currentChannel >= 0) {
      this.fadeOut(this.currentChannel, duration * 0.5);
    }

    this.playStatic(duration);
    this.playClick();

    await new Promise((r) => setTimeout(r, duration * 1000));

    this.playBeep();
    this.fadeIn(id, 1.2);
    this.currentChannel = id;
    this.isTuning = false;
  },

  playFirst(id) {
    console.log("[audio] playFirst:", id);
    this.playBeep();
    this.fadeIn(id, 1.5);
    this.currentChannel = id;
  },

  setVolume(val) {
    this.volume = val;
    Object.values(this.tracks).forEach((a) => {
      if (!a.paused) a.volume = val;
    });
  },

  stopAll() {
    Object.values(this.tracks).forEach((a) => {
      a.pause();
      a.currentTime = 0;
      a.volume = 0;
    });
    if (this.noiseGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        const g = this.noiseGain.gain;
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(0, now + 0.2);
      } catch (e) {}
    }
  }
};
