# Lexio 乐词 · 单机桌面版（跨平台 Electron 工程）

把 `lexio-pwa-original-site-deploy.zip` 打包成**断网可用的单机软件**。词库（25,024 条）、配置、图标全部内置；程序只监听本机 `127.0.0.1` 随机端口，不对外网暴露任何服务。

## 三种使用方式

### ① 免构建绿色便携版（双击即用，推荐先试这个）

不需要 Node、不需要安装任何东西：

- **Windows**：双击 `启动Lexio.bat` → 自动开本地服务并打开默认浏览器
- **macOS / Linux**（装有 Node 18+）：终端执行 `node server.js` → 打开提示的地址

> 数据与正式版完全一致，进度存在浏览器 IndexedDB 里。

### ② 开发模式运行（Electron 窗口）

```bash
npm install     # 首次会下载 Electron 运行时（约 100MB）
npm start       # 打开独立桌面窗口
```

### ③ 打包正式安装包 + 便携版

在**目标系统**上执行（一条命令同时产出两种形态）：

| 平台 | 命令 | 产物（在 `dist/`） |
|---|---|---|
| Windows | `npm run dist:win` | `Lexio-Setup-*.exe`（安装包）+ `Lexio-Portable-*.exe`（免安装便携版） |
| macOS | `npm run dist:mac` | `Lexio-*.dmg` + `Lexio-*.zip` |
| Linux | `npm run dist:linux` | `Lexio-*.AppImage`（免安装）+ `Lexio-*.deb`（安装包） |

说明：

- macOS 打包必须在 Mac 上执行（Apple 工具链限制）；未签名应用首次打开需右键 → 打开，或 `xattr -cr /Applications/Lexio.app`
- Windows/Linux 可以交叉构建；本沙箱环境因网络白名单拦截了 Electron 运行时下载（`objects.githubusercontent.com` 不在放行名单），所以安装包需在你自己的机器上执行上述命令生成，代码本身已全部测试通过

## 测试

```bash
npm test         # 服务器测试 + 模拟 Electron 冒烟测试（无需显示器/二进制）
```

- `test/server.test.js`：14 项 —— 端点、MIME、5.3MB 词库、404、路径穿越防护
- `test/smoke.js`：用 mock Electron 走通 `main.js → 内置服务器 → PWA 页面加载` 全链路

## 目录结构

```
lexio-desktop/
├── 启动Lexio.bat          # Windows 免安装启动器
├── portable-server.ps1    # 便携版本地服务器（PowerShell，系统自带）
├── main.js                # Electron 主进程（窗口、外链拦截、冒烟钩子）
├── server.js              # 内置静态服务器（127.0.0.1，随机端口，防路径穿越）
├── electron-builder.yml   # 安装包/便携版打包配置
├── build/icon.png         # 应用图标（512×512）
├── assets/                # PWA 全部资源（页面、5.3MB 词库、manifest、SW）
└── test/                  # 自动化测试
```

## 技术要点

- **完全离线**：唯一联网点是有道发音接口，失败自动回退系统语音合成（原 PWA 已有此逻辑）
- **安全**：`contextIsolation + sandbox`，禁用 Node 集成；外链一律交给系统浏览器；服务器有路径穿越防护
- **单实例**：重复启动只会唤起已有窗口
- **`/api/checkout`** 是原 PWA 的支付占位接口，单机版返回 404，不影响学习功能

## 受限网络环境备注

若在证书拦截/白名单网络中安装依赖：

```bash
export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt  # 信任系统 CA
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install                     # 先装依赖，稍后再补运行时
```

<!-- ci-trigger -->
