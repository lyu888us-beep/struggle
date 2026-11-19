# Lexio 乐词 · 全功能版 PWA

本版本已**解除 7 天试用 / Pro 限制**：所有学习功能（五大词库、记忆卡片、错词强化、
英美发音、词库导入导出、学情统计）全部开放，无到期拦截。

> 说明：好友对战、支付结账为产品演示界面（无后端），其余功能均真实可用。

## iPhone / iPad（推荐方式）

1. 把本目录部署到任意 HTTPS 静态托管（GitHub Pages / Netlify / 服务器均可）
2. iPhone **Safari** 打开该网址
3. 分享 → **添加到主屏幕** → 全屏 App，首次联网后离线可用

官方全功能版已部署：**https://lyu888us-beep.github.io/struggle/**

## 电脑（免部署直接用）

- 任意装有 Node.js 18+ 的电脑：`node server.js`（把本目录文件放到 server.js 同级
  assets 目录结构，或直接用 `lexio-desktop` 工程里的便携启动器指向本目录）
- 或任意静态服务器：`python3 -m http.server 4173`

## 内容

- `index.html` 全功能主程序（补丁：过期状态永久关闭）
- `data/original-site-wordbank.json` 25,024 条词库（约 5.3MB）
- `manifest.webmanifest` + `sw.js`（缓存版本 lexio-shell-v5-full）+ 图标

## 与正式版差异

- `getTrialState()` 返回 `expired:false`（永久有效，已过期设备立即恢复）
- 试用提示改为「全功能已解锁」
- Service Worker 缓存版本 v5-full（强制刷新旧缓存）
