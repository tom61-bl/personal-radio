/* ============================================================
   像素波形可视化
   ============================================================ */

const PixelViz = {
  canvas: null,
  ctx: null,
  color: "#4ecdc4",
  animationId: null,
  running: false,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
  },

  setColor(color) {
    this.color = color;
  },

  start() {
    if (this.running) return;
    this.running = true;
    this.draw();
  },

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.clear();
  },

  draw() {
    if (!this.running) return;

    this.clear();

    const w = this.canvas.width;
    const h = this.canvas.height;
    const data = AudioSystem.getWaveform();
    const barCount = 32;
    const barWidth = Math.floor(w / barCount);
    const gap = 2;
    const mid = h / 2;

    // 绘制像素柱状波形
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * data.length);
      const value = Math.abs(data[dataIndex] || 0);
      const barHeight = Math.max(2, Math.floor(value * h * 0.9));

      // 像素化高度（对齐到 4 的倍数）
      const pixelHeight = Math.floor(barHeight / 4) * 4;

      // 上下对称
      const x = i * barWidth + gap;
      const y = mid - pixelHeight / 2;

      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(x, y, barWidth - gap * 2, pixelHeight);

      // 顶部亮点
      this.ctx.fillStyle = "rgba(255,255,255,0.6)";
      this.ctx.fillRect(x, y, barWidth - gap * 2, 2);
    }

    // 中线
    this.ctx.fillStyle = "rgba(255,255,255,0.1)";
    this.ctx.fillRect(0, mid - 1, w, 1);

    this.animationId = requestAnimationFrame(() => this.draw());
  },

  clear() {
    this.ctx.fillStyle = "rgba(0,0,0,0.9)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
};
