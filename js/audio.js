/* ============================================================
   音频系统
   - 音乐：原生 HTML5 Audio（稳定、可预测）
   - 音效：Tone.js（哔声、旋钮声）
   - 调频杂音：Web Audio 生成
   ============================================================ */

const AudioSystem = {
  tracks: {},          // 5 个音乐 Audio 对象
  currentChannel: -1,
  isTuning: false,
  volume: 0.6,
  ready: false,
  analyser: null,
  noiseGain: null,
  noiseNode: null,
  ctx: null,

  // 在用户点击手势内第一时间调用
  async resume() {
    // 恢复 Tone 上下文
    try {
      await Tone.start();
      if (Tone.context.state !== "running") await Tone.context.resume();
    } catch (e) {
      console.log("Tone 恢复:", e);
    }
    // 恢复 Web Audio（用于杂音）
    try {
      if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
    } catch (e) {}
  },

  // 初始化
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
      this.tracks[i] = a;
    });

    // 用 Web Audio 分析音乐波形（MediaElementSource）
    this.musicAnalyser = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) this.ctx = new AC();
      this.musicAnalyser = this.ctx.createAnalyser();
      this.musicAnalyser.fftSize = 256;
      this.musicAnalyser.smoothingTimeConstant = 0.7;
      Object.values(this.tracks).forEach((a) => {
        try {
          const src = this.ctx.createMediaElementSource(a);
          src.connect(this.musicAnalyser);
          this.musicAnalyser.connect(this.ctx.destination);
        } catch (e) {
          // 已连接过
        }
      });
    } catch (e) {
      console.log("波形分析器创建失败:", e);
    }

    // 调频杂音
    try { this.setupNoise(); } catch (e) { console.log("杂音失败:", e); }

    this.ready = true;
  },

  // 调频杂音
  setupNoise() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
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

  // 播放调频杂音
  playStatic(duration = 0.6) {
    if (!this.ctx || !this.noiseGain) return;
    const now = this.ctx.currentTime;
    const g = this.noiseGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(0, now);
    g.linearRampToValueAtTime(0.2, now + 0.05);
    g.setValueAtTime(0.2, now + duration - 0.1);
    g.linearRampToValueAtTime(0, now + duration);
  },

  // 频道锁定哔声
  playBeep() {
    try {
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 }
      }).toDestination();
      synth.volume.value = -12;
      synth.triggerAttackRelease("C6", "16n");
    } catch (e) {}
  },

  // 旋钮声
  playClick() {
    try {
      const synth = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 2 }).toDestination();
      synth.volume.value = -20;
      synth.triggerAttackRelease("C2", "32n");
    } catch (e) {}
  },

  // 淡入播放指定轨道
  fadeIn(id, fade = 1.5) {
    const a = this.tracks[id];
    if (!a) return;
    a.volume = 0;
    const p = a.play();
    if (p && p.catch) p.catch((e) => console.log("播放失败:", id, e));
    // 手动淡入
    const target = this.volume;
    const steps = 20;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      a.volume = Math.min(target, (target * i) / steps);
      if (i >= steps) {
        a.volume = target;
        clearInterval(timer);
      }
    }, (fade * 1000) / steps);
  },

  // 淡出停止指定轨道
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

  // 切换频道
  async switchChannel(id, duration = 0.7) {
    if (this.isTuning) return;
    this.isTuning = true;

    // 淡出旧音乐
    if (this.currentChannel >= 0) {
      this.fadeOut(this.currentChannel, duration * 0.5);
    }

    // 调频杂音 + 旋钮声
    this.playStatic(duration);
    this.playClick();

    await new Promise((r) => setTimeout(r, duration * 1000));

    // 锁定哔声
    this.playBeep();

    // 淡入新音乐
    this.fadeIn(id, 1.2);

    this.currentChannel = id;
    this.isTuning = false;
  },

  // 直接播放（开机首频道，无杂音）
  playFirst(id) {
    this.playBeep();
    this.fadeIn(id, 1.5);
    this.currentChannel = id;
  },

  // 设置音量（影响当前轨道）
  setVolume(val) {
    this.volume = val;
    Object.values(this.tracks).forEach((a) => {
      if (!a.paused) a.volume = val;
    });
  },

  // 获取音乐波形数据
  getWaveform() {
    if (this.musicAnalyser) {
      const arr = new Uint8Array(this.musicAnalyser.frequencyBinCount);
      this.musicAnalyser.getByteFrequencyData(arr);
      return arr;
    }
    return new Uint8Array(128);
  },

  // 停止所有
  stopAll() {
    Object.values(this.tracks).forEach((a) => {
      a.pause();
      a.currentTime = 0;
      a.volume = 0;
    });
    if (this.noiseGain && this.ctx) {
      const now = this.ctx.currentTime;
      const g = this.noiseGain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0, now + 0.2);
    }
  }
};
