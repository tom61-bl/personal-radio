# 个人说明书 · FM

五个频道，五个我。慢慢转动旋钮，找到我。

## 频道

| 频率 | 频道 | 音乐风格 | 曲目 |
|---|---|---|---|
| FM 88.1 | 身份台 · 我是谁 | Lounge Jazz | Backbay Lounge |
| FM 92.5 | 现在进行台 · 我在做什么 | Bossa Nova | Casa Bossa Nova |
| FM 96.8 | 未来台 · 我想做什么 | Piano Solo | Sovereign |
| FM 101.3 | 联络台 · 怎么样和我链接 | Ukulele Pop | Carefree |
| FM 105.7 | 成果台 · 我的成果 | 8-bit Electronic | Bit Shift |

## 特性

- 底部复古收音机，可拖动频率指示线调频
- 五个电台（★标记），扫过时自动锁定并切换内容+音乐
- 两电台之间播放调频白噪音
- 数字频率屏 + 信号条 + 电台名
- ◀▶按钮 / 圆形旋钮 / 键盘方向键切换
- CRT 扫描线 + 星空背景
- 纯前端，无构建工具

## 技术栈

- 原生 HTML / CSS / JavaScript
- Web Audio API（调频杂音 + 音效）
- HTML5 Audio（背景音乐）
- Google Fonts：Press Start 2P + VT323 + ZCOOL KuaiLe

## 本地运行

直接用浏览器打开 `index.html`，或启动一个本地服务器：

```bash
python -m http.server 8000
```

## 音乐署名

所有背景音乐来自 [Kevin MacLeod](https://incompetech.com)，基于 Creative Commons Attribution 4.0 (CC BY 4.0) 许可发布。

- Backbay Lounge — Kevin MacLeod (incompetech.com)
- Casa Bossa Nova — Kevin MacLeod (incompetech.com)
- Sovereign — Kevin MacLeod (incompetech.com)
- Carefree — Kevin MacLeod (incompetech.com)
- Bit Shift — Kevin MacLeod (incompetech.com)
