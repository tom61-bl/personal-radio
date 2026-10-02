/* ============================================================
   音频系统 · 调频杂音、音乐、音效、波形分析
   ============================================================ */

const AudioSystem = {
  players: null,
  analyser: null,
  noiseNode: null,
  noiseGain: null,
  staticSource: null,
  currentChannel: -1,
  isTuning: false,
  volume: 0.6,
  ready: false,
  musicLoaded: false,

  // 必须在用户点击手势中第一时间调用：恢复上下文
  async resume() {
    try {
      await Tone.start();
      if (Tone.context.state !== "running") await Tone.context.resume();
      console.log("音频上下文已恢复:", Tone.context.state);
    } catch (e) {
      console.log("上下文恢复失败:", e);
    }
  },

  // 初始化（上下文已恢复后调用；完全不阻塞 UI）
  async init() {
    // 确保上下文运行
    try {
      if (Tone.context.state !== "running") await Tone.context.resume();
    } catch (e) {}
    try { Tone.Transport.start(); } catch (e) {}

    // 2. 主音量
    try {
      Tone.Destination.volume.value = Tone.gainToDb(this.volume);
    } catch (e) {}

    // 3. 分析器（用于波形）
    try {
      this.analyser = new Tone.Analyser("waveform", 128);
      Tone.Destination.connect(this.analyser);
    } catch (e) {}

    // 4. 音乐播放器（异步加载，不阻塞；包一层超时）
    try {
      this.players = new Tone.Players({
        urls: {
          0: "audio/ch1-identity.ogg",
          1: "audio/ch2-now.ogg",
          2: "audio/ch3-future.ogg",
          3: "audio/ch4-contact.ogg",
          4: "audio/ch5-works.ogg"
        },
        onload: () => {
          this.musicLoaded = true;
          console.log("音乐加载完成");
        },
        fadeIn: 0.5,
        fadeOut: 0.5
      }).toDestination();
    } catch (e) {
      console.log("播放器创建失败:", e);
    }

    // 5. 调频杂音
    try { this.setupNoise(); } catch (e) { console.log("杂音初始化失败:", e); }

    this.ready = true;

    // 6. 首次真实交互时恢复音频上下文（兜底自动播放策略）
    const resume = () => {
      try {
        if (Tone.context.state !== "running") Tone.context.resume();
      } catch (e) {}
    };
    ["click", "keydown", "touchstart"].forEach((evt) => {
      document.addEventListener(evt, resume, { passive: true });
    });
  },

  // 生成白噪音（调频沙沙声）
  setupNoise() {
    const bufferSize = Tone.context.sampleRate * 2;
    const noiseBuffer = Tone.context.createBuffer(
      1, bufferSize, Tone.context.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // 粉噪音效果（比纯白噪音更像收音机）
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    this.noiseNode = Tone.context.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseGain = Tone.context.createGain();
    this.noiseGain.gain.value = 0;

    // 加一个带通滤波器，让杂音更像收音机
    const filter = Tone.context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    this.noiseNode.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(Tone.context.destination);
    this.noiseNode.start();
  },

  // 播放调频杂音（切台时）
  playStatic(duration = 0.6) {
    const now = Tone.context.currentTime;
    this.noiseGain.gain.cancelScheduledValues(now);
    this.noiseGain.gain.setValueAtTime(0, now);
    this.noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    this.noiseGain.gain.setValueAtTime(0.15, now + duration - 0.1);
    this.noiseGain.gain.linearRampToValueAtTime(0, now + duration);
  },

  // 播放"哔"声（频道锁定）
  playBeep() {
    const synth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 }
    }).toDestination();
    synth.volume.value = -12;
    synth.triggerAttackRelease("C6", "16n");
  },

  // 播放旋钮机械声
  playClick() {
    const synth = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 2
    }).toDestination();
    synth.volume.value = -20;
    synth.triggerAttackRelease("C2", "32n");
  },

  // 切换频道
  async switchChannel(channelId, duration = 0.7) {
    if (this.isTuning) return;
    this.isTuning = true;

    // 停止当前音乐
    if (this.currentChannel >= 0 && this.players && this.musicLoaded) {
      try {
        const player = this.players.player(String(this.currentChannel));
        if (player && player.loaded) {
          player.volume.rampTo(-Infinity, duration * 0.4);
          setTimeout(() => player.stop(), duration * 400);
        }
      } catch (e) {}
    }

    // 播放调频杂音
    this.playStatic(duration);

    // 播放旋钮声
    this.playClick();

    // 等待调频完成
    await new Promise(r => setTimeout(r, duration * 1000));

    // 频道锁定哔声
    this.playBeep();

    // 播放新音乐
    if (this.players && this.musicLoaded) {
      try {
        const player = this.players.player(String(channelId));
        if (player && player.loaded) {
          player.loop = true;
          player.volume.value = -Infinity;
          player.start();
          player.volume.rampTo(Tone.gainToDb(this.volume), 1.5);
        }
      } catch (e) {
        console.log("音乐文件尚未就绪，跳过播放");
      }
    }

    this.currentChannel = channelId;
    this.isTuning = false;
  },

  // 设置音量
  setVolume(val) {
    this.volume = val;
    if (this.ready) {
      Tone.Destination.volume.rampTo(Tone.gainToDb(val), 0.1);
    }
  },

  // 获取波形数据
  getWaveform() {
    if (this.analyser) {
      return this.analyser.getValue();
    }
    return new Float32Array(128);
  },

  // 停止所有
  stopAll() {
    if (this.players) {
      try {
        this.players.stopAll();
      } catch (e) {}
    }
    if (this.noiseGain) {
      const now = Tone.context.currentTime;
      this.noiseGain.gain.cancelScheduledValues(now);
      this.noiseGain.gain.setValueAtTime(this.noiseGain.gain.value, now);
      this.noiseGain.gain.linearRampToValueAtTime(0, now + 0.3);
    }
  }
};
