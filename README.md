# 个人说明书 · 多频道像素电台

一台像素风的多频道电台，调频到不同频率，听见不同的我。

## 频道

| 频率 | 频道 | 音乐风格 |
|---|---|---|
| FM 88.1 | 身份台 · 我是谁 | 8-bit Chiptune |
| FM 92.5 | 现在进行台 · 我在做什么 | Jazz |
| FM 96.8 | 未来台 · 我想做什么 | Classical / Piano |
| FM 101.3 | 联络台 · 怎么样和我链接 | Lyrical / Ballad |
| FM 105.7 | 成果台 · 我的成果 | 8-bit Triumphant |

## 特性

- 像素风 8-bit 视觉，CRT 扫描线
- 调频旋钮 + 频道指示灯
- 每个频道独立基调音乐，切换时淡入淡出
- 调频白噪音 + 像素波形实时可视化
- 键盘方向键切换
- 纯前端，无构建工具

## 技术栈

- 原生 HTML / CSS / JavaScript
- [Tone.js](https://tonejs.github.io/)（Web Audio）
- Google Fonts：Press Start 2P + VT323

## 本地运行

直接用浏览器打开 `index.html`，或启动一个本地服务器：

```bash
# Python
python -m http.server 8000

# Node
npx serve
```

## 音乐署名

背景音乐来自 [Patrick de Arteaga](https://patrickdearteaga.com)，基于 Creative Commons 许可发布。
