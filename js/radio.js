/* ============================================================
   电台主控逻辑
   ============================================================ */

(function () {
  const state = {
    powered: false,
    currentChannel: 0,
    isSwitching: false
  };

  // DOM
  const $ = (id) => document.getElementById(id);
  const bootScreen = $("boot-screen");
  const radioStage = $("radio-stage");
  const powerBtn = $("power-btn");
  const powerOff = $("power-off");
  const lcdFreq = $("lcd-freq");
  const lcdChannel = $("lcd-channel");
  const contentFreq = $("content-freq");
  const contentTitle = $("content-title");
  const contentBody = $("content-body");
  const ledRow = $("led-row");
  const knob = $("knob");
  const volume = $("volume");
  const starfield = $("starfield");

  // ===== 星空 =====
  function createStars() {
    for (let i = 0; i < 60; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 3 + "s";
      starfield.appendChild(star);
    }
  }

  // ===== 主题色 =====
  function updateTheme(ch) {
    document.documentElement.style.setProperty("--ch-color", ch.color);
    document.documentElement.style.setProperty("--ch-color-dim", ch.colorDim);
    PixelViz.setColor(ch.color);
  }

  // ===== 频率数字滚动 =====
  function animateFreq(target) {
    const start = parseFloat(lcdFreq.textContent);
    const end = parseFloat(target);
    if (start === end) return;
    const steps = 10;
    const inc = (end - start) / steps;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      lcdFreq.textContent = (start + inc * i).toFixed(1);
      if (i >= steps) {
        lcdFreq.textContent = target;
        clearInterval(timer);
      }
    }, 40);
  }

  // ===== LED =====
  function updateLEDs(id) {
    ledRow.querySelectorAll(".led-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === id);
    });
  }

  // ===== 旋钮角度 =====
  function updateKnob(id) {
    const angle = (id / (CHANNELS.length - 1)) * 270 - 135;
    knob.style.transform = `rotate(${angle}deg)`;
  }

  // ===== 渲染频道（无音频切换） =====
  function renderChannel(ch) {
    updateTheme(ch);
    animateFreq(ch.freq);
    lcdChannel.textContent = ch.name;
    updateLEDs(ch.id);
    updateKnob(ch.id);
    contentFreq.textContent = `FM ${ch.freq}`;
    contentTitle.textContent = ch.title;
    contentBody.innerHTML = ch.content;
  }

  // ===== 切换频道（含音频） =====
  async function switchChannel(id) {
    if (state.isSwitching || id === state.currentChannel) return;
    state.isSwitching = true;

    const ch = CHANNELS[id];
    await AudioSystem.switchChannel(id, 0.7);

    renderChannel(ch);
    state.currentChannel = id;
    state.isSwitching = false;
  }

  // ===== 开机 =====
  async function powerOn() {
    powerBtn.disabled = true;
    powerBtn.textContent = "LOADING...";

    await AudioSystem.init();
    PixelViz.init("wave-canvas");
    PixelViz.start();

    bootScreen.style.display = "none";
    radioStage.style.display = "flex";
    state.powered = true;

    // 初始化第一个频道
    renderChannel(CHANNELS[0]);
    state.currentChannel = 0;

    // 直接播放第一个频道音乐（无杂音）
    AudioSystem.playBeep();
    if (AudioSystem.musicLoaded) {
      try {
        const p = AudioSystem.players.player("0");
        if (p && p.loaded) {
          p.loop = true;
          p.volume.value = -Infinity;
          p.start();
          p.volume.rampTo(Tone.gainToDb(AudioSystem.volume), 1.5);
        }
      } catch (e) {}
    }

    powerBtn.disabled = false;
    powerBtn.textContent = "ON AIR";
  }

  // ===== 关机 =====
  function shutdown() {
    AudioSystem.stopAll();
    PixelViz.stop();
    radioStage.style.display = "none";
    bootScreen.style.display = "flex";
    state.powered = false;
    state.currentChannel = 0;
  }

  // ===== 事件 =====
  function bindEvents() {
    powerBtn.addEventListener("click", powerOn);
    powerOff.addEventListener("click", shutdown);

    // 频道按钮
    ledRow.querySelectorAll(".led-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.powered || state.isSwitching) return;
        switchChannel(parseInt(btn.dataset.channel));
      });
    });

    // 旋钮左右
    $("knob-prev").addEventListener("click", () => {
      if (!state.powered || state.isSwitching) return;
      const prev = (state.currentChannel - 1 + CHANNELS.length) % CHANNELS.length;
      switchChannel(prev);
    });

    $("knob-next").addEventListener("click", () => {
      if (!state.powered || state.isSwitching) return;
      const next = (state.currentChannel + 1) % CHANNELS.length;
      switchChannel(next);
    });

    // 点旋钮 = 下一个
    knob.addEventListener("click", () => {
      if (!state.powered || state.isSwitching) return;
      const next = (state.currentChannel + 1) % CHANNELS.length;
      switchChannel(next);
    });

    // 音量
    volume.addEventListener("input", (e) => {
      AudioSystem.setVolume(e.target.value / 100);
    });

    // 键盘
    document.addEventListener("keydown", (e) => {
      if (!state.powered || state.isSwitching) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = (state.currentChannel - 1 + CHANNELS.length) % CHANNELS.length;
        switchChannel(prev);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = (state.currentChannel + 1) % CHANNELS.length;
        switchChannel(next);
      }
    });
  }

  // 启动
  window.addEventListener("load", () => {
    createStars();
    bindEvents();
  });
})();
