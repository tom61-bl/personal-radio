/* ============================================================
   外婆的收音机 · 主控逻辑
   拖动频率指示线，扫过电台时锁定并切换内容/音乐
   ============================================================ */

(function () {
  const FREQ_MIN = 88;
  const FREQ_MAX = 108;
  const LOCK_THRESHOLD = 0.6; // 距离电台多少 MHz 内锁定

  const state = {
    powered: false,
    currentFreq: 88.1,
    currentStation: -1,
    isDragging: false,
    isTuning: false
  };

  // DOM
  const $ = (id) => document.getElementById(id);
  const contentInner = $("content-inner");
  const freqScale = $("freq-scale");
  const freqTicks = $("freq-ticks");
  const freqStations = $("freq-stations");
  const indicator = $("freq-indicator");
  const digitalFreq = $("digital-freq");
  const stationName = $("station-name");
  const signalBars = $("signal-bars");
  const hintText = $("hint-text");
  const powerMask = $("power-mask");
  const powerBtn = $("power-btn");
  const knobRound = $("knob-round");

  // ===== 生成刻度 =====
  function buildTicks() {
    for (let f = FREQ_MIN; f <= FREQ_MAX; f += 0.5) {
      const isMajor = Number.isInteger(f);
      const tick = document.createElement("div");
      tick.className = "tick " + (isMajor ? "major" : "minor");
      tick.style.left = freqToPercent(f) + "%";
      freqTicks.appendChild(tick);

      if (isMajor && f % 2 === 0) {
        const label = document.createElement("div");
        label.className = "tick-label";
        label.style.left = freqToPercent(f) + "%";
        label.textContent = f;
        freqTicks.appendChild(label);
      }
    }
  }

  // ===== 生成电台星标 =====
  function buildStations() {
    CHANNELS.forEach((ch) => {
      const star = document.createElement("div");
      star.className = "station-star";
      star.style.left = freqToPercent(ch.freq) + "%";
      star.textContent = "★";
      star.dataset.id = ch.id;
      star.title = `FM ${ch.freq} ${ch.name}`;
      freqStations.appendChild(star);
    });
  }

  // ===== 工具函数 =====
  function freqToPercent(f) {
    return ((f - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 100;
  }
  function percentToFreq(p) {
    return FREQ_MIN + (p / 100) * (FREQ_MAX - FREQ_MIN);
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // 找最近的电台
  function nearestStation(freq) {
    let best = null;
    let bestDist = Infinity;
    CHANNELS.forEach((ch) => {
      const d = Math.abs(parseFloat(ch.freq) - freq);
      if (d < bestDist) {
        bestDist = d;
        best = ch;
      }
    });
    return { station: best, dist: bestDist };
  }

  // ===== 更新指示线位置 =====
  function setIndicator(freq) {
    state.currentFreq = freq;
    indicator.style.left = freqToPercent(freq) + "%";
    digitalFreq.textContent = freq.toFixed(1);
  }

  // ===== 锁定电台 =====
  async function lockStation(station) {
    if (state.currentStation === station.id) return;
    state.currentStation = station.id;

    // 更新星标高亮
    document.querySelectorAll(".station-star").forEach((s) => {
      s.classList.toggle("locked", parseInt(s.dataset.id) === station.id);
    });

    // 信号满格
    signalBars.classList.add("locked");
    stationName.textContent = station.name;
    hintText.textContent = `已锁定 FM ${station.freq} · ${station.name}`;

    // 切换内容（淡入）
    contentInner.style.opacity = "0";
    setTimeout(() => {
      contentInner.innerHTML = `<h2>FM ${station.freq} · ${station.title}</h2>` + station.content;
      contentInner.style.opacity = "1";
    }, 250);

    // 切换音乐
    if (state.powered) {
      await AudioSystem.switchChannel(station.id, 0.5);
    }
  }

  // ===== 解锁（离开电台） =====
  function unlockStation() {
    if (state.currentStation === -1) return;
    state.currentStation = -1;
    document.querySelectorAll(".station-star").forEach((s) => s.classList.remove("locked"));
    signalBars.classList.remove("locked");
    stationName.textContent = "——";
    hintText.textContent = "沙沙沙…… 慢慢转动旋钮，寻找藏在夜空里的电台";
  }

  // ===== 调频处理（拖动中） =====
  function tuneTo(freq) {
    freq = clamp(freq, FREQ_MIN, FREQ_MAX);
    setIndicator(freq);

    const { station, dist } = nearestStation(freq);

    if (dist <= LOCK_THRESHOLD) {
      // 吸附到电台频率
      const targetFreq = parseFloat(station.freq);
      setIndicator(targetFreq);
      lockStation(station);
    } else {
      unlockStation();
      // 播放杂音
      if (state.powered && !state.isTuning) {
        AudioSystem.playStatic(0.3);
      }
    }
  }

  // ===== 拖动交互 =====
  function getFreqFromEvent(e) {
    const rect = freqScale.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return percentToFreq(clamp(pct, 0, 100));
  }

  function onDragStart(e) {
    if (!state.powered) return;
    state.isDragging = true;
    e.preventDefault();
    tuneTo(getFreqFromEvent(e));
  }
  function onDragMove(e) {
    if (!state.isDragging) return;
    e.preventDefault();
    tuneTo(getFreqFromEvent(e));
  }
  function onDragEnd() {
    state.isDragging = false;
  }

  // ===== 旋钮/按钮切换 =====
  function nextStation() {
    if (!state.powered) return;
    const sorted = [...CHANNELS].sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
    let idx = sorted.findIndex((c) => c.id === state.currentStation);
    idx = (idx + 1) % sorted.length;
    const target = sorted[idx];
    animateTuneTo(parseFloat(target.freq));
  }
  function prevStation() {
    if (!state.powered) return;
    const sorted = [...CHANNELS].sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
    let idx = sorted.findIndex((c) => c.id === state.currentStation);
    idx = (idx - 1 + sorted.length) % sorted.length;
    const target = sorted[idx];
    animateTuneTo(parseFloat(target.freq));
  }

  // 动画调频
  function animateTuneTo(targetFreq) {
    if (state.isTuning) return;
    state.isTuning = true;
    const start = state.currentFreq;
    const duration = 600;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const freq = start + (targetFreq - start) * eased;
      setIndicator(freq);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setIndicator(targetFreq);
        const { station } = nearestStation(targetFreq);
        lockStation(station);
        state.isTuning = false;
      }
    }
    // 播放杂音
    if (state.powered) AudioSystem.playStatic(0.5);
    AudioSystem.playClick();
    requestAnimationFrame(step);
  }

  // ===== 开机 =====
  async function powerOn() {
    powerBtn.disabled = true;
    powerBtn.textContent = "正在开机…";

    await AudioSystem.resume();
    await AudioSystem.init();

    state.powered = true;
    powerMask.classList.add("hidden");

    // 默认锁定第一个电台
    const first = CHANNELS[0];
    setIndicator(parseFloat(first.freq));
    lockStation(first);
    AudioSystem.playFirst(0);

    powerBtn.disabled = false;
    powerBtn.textContent = "▶ 开机";
  }

  // ===== 星空 =====
  function createStars() {
    for (let i = 0; i < 50; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 70 + "%";
      star.style.animationDelay = Math.random() * 3 + "s";
      $("starfield").appendChild(star);
    }
  }

  // ===== 事件绑定 =====
  function bindEvents() {
    powerBtn.addEventListener("click", powerOn);

    // 拖动
    freqScale.addEventListener("mousedown", onDragStart);
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
    freqScale.addEventListener("touchstart", onDragStart, { passive: false });
    document.addEventListener("touchmove", onDragMove, { passive: false });
    document.addEventListener("touchend", onDragEnd);

    // 按钮
    $("btn-prev").addEventListener("click", prevStation);
    $("btn-next").addEventListener("click", nextStation);
    knobRound.addEventListener("click", nextStation);

    // 键盘
    document.addEventListener("keydown", (e) => {
      if (!state.powered) return;
      if (e.key === "ArrowLeft") prevStation();
      if (e.key === "ArrowRight") nextStation();
    });

    // 内容淡入过渡
    contentInner.style.transition = "opacity 0.25s ease";
  }

  // ===== 启动 =====
  window.addEventListener("load", () => {
    createStars();
    buildTicks();
    buildStations();
    setIndicator(88.1);
    bindEvents();
  });
})();
