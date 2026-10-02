/* ============================================================
   音频系统
   - 音乐：原生 HTML5 Audio（稳定、可预测）
   - 音效：Tone.js（哔声、旋钮声）
   - 调频杂音：Web Audio 生成
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
  musicAnalyser: null,

  // 在用户点击手势内第一时间调用
  async resume() {
    // 1. 恢复 Tone
    try {
      await Tone.start();
      if (Tone.context.state !== "running") {
        await Tone.context.resume();
      }
    } catch (e) {
      console.log("[audio] Tone resume:", e);
    }
    // 2. 创建/恢复 Web Audio 上下文
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
    } catch (e) {
      console.log("[audio] ctx resume:", e);
    }
  },

  // 初始化（必须在 resume 之后调用）
  async init() {
    // 创建 5 个音乐轨道
    const files = [
      "audio/ch1-identity.ogg",
      "audio/ch2-now.ogg",
      "audio/ch3-future.ogg",
      "audio/ch4-contact.ogg",
      "audio/ch5-works.ogg"
    ];
    files.forEach((src, i) => {
      const a = new Audio(src);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      a.crossOrigin = "anonymous";
      this.tracks[i] = a;
    });

    // 波形分析器
    try {
      if (this.ctx && !this.musicAnalyser) {
        this.musicAnalyser = this.ctx.createAnalyser();
        this.musicAnalyser.fftSize = 256;
        this.musicAnalyser.smoothingTimeConstant = 0.7;
        Object.values(this.tracks).forEach((a) => {
          try {
            const src = this.ctx.createMediaElementSource(a);
            src.connect(this.musicAnalyser);
            this.musicAnalyser.connect(this.ctx.destination);
          } catch (e) {
            // 已连接或不支持，忽略
          }
        });
      }
    } catch (e) {
      console.log("[audio] analyser:", e);
    }

    // 调频杂音
    try {
      this.setupNoise();
    } catch (e) {
      console.log("[audio] noise setup:", e);
    }

    this.ready = true;
    console.log("[audio] init done, tracks:", Object.keys(this.tracks).length);
  },

  // 调频杂音
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
      g.setValueAtTime(0, now);
      g.linearRampToValueAtTime(0.15, now + 0.05);
      g.setValueAtTime(0.15, now + Math.max(0.1, duration - 0.1));
      g.linearRampToValueAtTime(0, now + duration);
    } catch (e) {}
  },

  playBeep() {
    try {
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 }
      }).toDestination();
      synth.volume.value = -14;
      synth.triggerAttackRelease("C6", "16n");
    } catch (e) {}
  },

  playClick() {
    try {
      const synth = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 2 }).toDestination();
      synth.volume.value = -22;
      synth.triggerAttackRelease("C2", "32n");
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
        console.log("[audio] faded in track", id, "volume:", a.volume);
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

  getWaveform() {
    if (this.musicAnalyser) {
      const arr = new Uint8Array(this.musicAnalyser.frequencyBinCount);
      this.musicAnalyser.getByteFrequencyData(arr);
      return arr;
    }
    return new Uint8Array(128);
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
