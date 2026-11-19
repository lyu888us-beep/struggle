# 乐词 Lexio PWA — 窗口交接文档（Handoff）

> 生成：2026-11-16 · 上一个窗口助手整理 · 供下一个模型/新窗口继续
> 用户已对「对战10题」「例句朗读」两问题失去耐心，明确要求换模型继续。请先读 §4（未解问题），其余为背景。

---

## 0. 一句话现状

仓库 `lyu888us-beep/struggle`，分支 `arena/035d3581-struggle`。PWA 全功能版已迭代至 **v9**（本交接随 v9 一起提交）：词库下载按钮已按用户要求**整体移除**（词库内置+首开自动导入）、词库**取消9条上限改100条/页全量分页显示**、分类 chips 可用；测试 **80/80 绿**。仍未解决的只有两件：**①背面例句朗读在用户 iPhone 上无声；②用户坚称对战只有7题（代码与自动化已证明是10题）**。

---

## 1. 仓库与环境

| 项 | 值 |
|---|---|
| 仓库 | `lyu888us-beep/struggle` |
| 分支 | `arena/035d3581-struggle`（Arena 会话分支，**勿改名、勿切其他分支**，push 只推它） |
| PWA 源 | `lexio-pwa-full/`（`index.html` 单文件应用 + `sw.js` + `data/original-site-wordbank.json` 25,024 词） |
| 测试 | `lexio-desktop/`（jsdom）；**发版前必须** `cd lexio-desktop && node test/nav.test.js` 全绿（当前 80 项） |
| 移动端 | `lexio-mobile/`（Capacitor APK；keystore `ci-dist/release.p12`，alias `lexio`，pass `lexio2026`，**勿删**） |
| Python | `/tmp/pil-venv/bin/python`（Pillow；/tmp 可能被清，缺失时 `python3 -m venv /tmp/pil-venv && /tmp/pil-venv/bin/pip install pillow`） |
| 出网限制 | 仅 `github.com / codeload.github.com / api.github.com / registry.npmjs.org / pypi.org / files.pythonhosted.org`（**测不了 youdao/google TTS 是否可达**，只能问用户） |
| 日期 | 2026-11-16 |

## 2. 发版流程（唯一可用路径）

1. 改 `lexio-pwa-full/**` → `cd lexio-desktop && node test/nav.test.js`（80 项全绿）
2. `git add … && git commit` → **`git pull --rebase origin arena/035d3581-struggle` → `git push origin arena/035d3581-struggle`**
   - push 触发 `.github/workflows/deploy-lexio-pages.yml`（`paths: lexio-pwa-full/**`）
   - **`gh workflow run` = 403 不可用**，只能靠 paths 匹配的 push 触发
3. `RID=$(gh run list --workflow deploy-lexio-pages.yml --limit 1 --json databaseId -q '.[0].databaseId') && gh run watch $RID --exit-status`
4. 打 zip（`cd lexio-pwa-full && zip -r -q ../Lexio-PWA-全功能版vN.zip . -x '*.DS_Store'`）→ Drive 上传（§5）→ **删本地 zip**
5. 回复用户**一律中文**；多模块回复用编号列表；给测试输出作证据

线上验证：`https://lyu888us-beep.github.io/struggle/`；`sw.js` 首行 `CACHE_NAME` 应等于本次版本（**每发一版 +1**，旧缓存自动清）。

## 3. 版本史（v1→v9，均已上云盘）

| 版 | 核心内容 |
|---|---|
| v1–v4 | 基础功能迭代（这4个 zip 已按用户指令进 Drive 回收站） |
| v5 | 词卡 grid 翻面防重叠、左滑/右滑记「已记住」、对战比分纯数字修复 |
| v6 | 底部Tab乱码（实心背景+不透明淡入）、例句朗读iOS竞态（cancel+250ms）、对战答完立即下一题、固定10题、卡片缩小+框内滚动 |
| v7 | FAQ实心背景+动画z序+动画期禁backdoor毛玻璃（治首页↔订阅残影）、释义blur、下载改本地Blob、sw强制刷新 |
| v8 | **例句朗读三通道链**（Google TTS→有道→系统语音，每路2.5s超时）、释义完全透明、下载改系统分享面板、**SW更新自动reload根治旧会话** |
| v9 | **取消下载按钮/导出（词库内置自动载入）**、**词库100条/页全量分页+加载更多+分类chips重置**、移除分享面板断言 |

## 4. ⚠️ 未解问题（下一个窗口的主任务）

### 4.1 例句朗读在用户 iPhone 上仍无声（用户报告2次+）

**现代码**（`lexio-pwa-full/index.html`）：
- `function speakExample(text, lang, onDone)` — 三通道链：`translate.google.com/translate_tts?...` → `dict.youdao.com/dictvoice?...` → `speak()`（speechSynthesis，cancel 后 250ms 再发）。每路 **2.5s 没出声自动切下一路**；`playing` 事件=出声成功，`ended`/兜底计时=完成回调。
- `#exampleSpeak` 点击处理器：按 `hidden` 状态显隐；按下去出 toast「**正在朗读例句…**」；朗读中按钮变「⏸ 停止朗读」。

**必须先问清的事实（用户从未提供）**：
1. 按「朗读例句」后**有没有看到 toast「正在朗读例句…」**？（有=处理器跑了，纯发音通道问题；没有=按钮没按到/按钮被隐藏）
2. 单词发音按钮 `#studySpeak`（卡片正面🔊）**有没有声**？（有声=网络通，问题在例句链；无声=网络/设备级）
3. 用户在美国 Norfolk：**有道域名可能不稳；translate.google.com/translate_tts 可能 403**。沙箱出网受限，**无法自行验证这两个 URL**。
4. iPhone **静音键**、音量、PWA 添加到主屏幕后的音频会话。
5. **25,024 词只有 100 条有例句**（5本书各20条精讲），其余背面显示「本词暂无例句」且按钮隐藏——用户可能抽到无例句词却以为是bug。

**下一步建议**：先要上面 1/2 的答案；若 toast 有而无声 → 让用户在 Safari 里裸开页面测同一按钮（排除 PWA）；考虑加**可见的发音状态行**（通道1失败/通道2…），把故障点直接显示在屏幕上。

### 4.2 对战「仍然只有7题」（用户报告3次，情绪激烈）

**代码事实（已自动化验证）**：
- `battleStart()`：`battle.q = []; for (let qi = 0; qi < 10; qi++) battle.q.push(shuffledBank[qi % shuffledBank.length]);` → **q.length 恒为10**，与词库条数无关（全库只剩7条也循环到10）。
- 标签：`第 ${battle.i+1} / ${battle.q.length} 题`；`battleEnd()` 只在 `i >= q.length` 触发。
- 测试（nav.test.js）：连打10轮 → `第 1 / 10 … 第 10 / 10 题` → 「已结束 | 换个对手 · 再来一局」**全绿**。
- 对战逻辑位置：`battleStart` / `battleRound` / `advanceAfterPlayer`（我答完400ms必进下一题，清掉对手计时）/ `battleEnd` / `foeNameNow`。**注意 `window.__lexioBattle` 是 facade `{start,nextName,foe}`，没有 over/q 属性**（测试断言要用 UI 文本）。

**为什么用户还看到7（按可能性排序）**：
1. **PWA 后台旧会话跑旧 JS**——页面不刷新永远是老代码。v8 起已加 `controllerchange → location.reload()` 自动刷新 + SW `CACHE_NAME` 每版递增（v9=`lexio-shell-v9-fix`）。**用户必须把 PWA 从后台划掉重开一次**。
2. 用户在 v9 自动刷新生效前测试。
3. 未知——**下一步：让用户提供 `第 x / ? 题` 的截图**（x 和 ? 各是多少）；必要时把 `bank.length` 临时打进 `#battleState` 显示。

**绝不要再只口头保证**——用户原话「你这个大模型不用继续骗我」。每次回复附测试输出行。

### 4.3 本轮（v9）已解决、可直接告诉用户

- **取消下载**：`⬇ 下载词库` 按钮、`exportWordBank`、介绍页下载链接全部删除；词库 = 内置 `data/original-site-wordbank.json` + 首次联网打开自动导入 IndexedDB（`loadBundledWordBank`，带完整性校验），**无任何手动下载/保存/导入步骤**。
- **9条上限**：`renderWordGrid` 去掉 `slice(0,9)` → `GRID_PAGE_SIZE=100`，状态行「已显示 x / y 条」+「加载更多」按钮；分类 chips（全部/高考/CET-4/CET-6/考研/雅思）与搜索切换会 `renderWordGrid(true)` 重置分页。分类数据链：词级无 category → `extractRecords` 打书级 category（高考/四级/六级/考研/雅思）→ `categoryMatches` 别名表匹配 chip 值（CET-4↔四级 等）。
- 释义遮罩 = `color: transparent`（完全不可见，非马赛克）。
- 首页↔订阅残影 = faq 实心背景 + 动画期间 JS 压序 z-index + `view-anim-lock` 禁 backdrop-filter。

## 5. Google Drive「乐词」文件夹

- 文件夹 id：`1fB0Rh6GhHngY2tE1jiNLZH4jmbiWQBAp`
- 上传（connector `google_drive` → `upload_file`）参数：
  ```json
  {"file_path":"Lexio-PWA-全功能版vN.zip","name":"同名","content_mime_type":"application/zip",
   "parents":["1fB0Rh6GhHngY2tE1jiNLZH4jmbiWQBAp"],"supports_all_drives":true,
   "fields":"id,name,webViewLink,size","starred":true}
  ```
- 现有文件（**除用户点名外一律勿动**）：Setup exe `1M62srNdNUeSXhtJYFcbt89GVxzOcfC9m`；Portable `161jqy99EAIkmOKg3zihO6bObFsWx2hlc`；dmg `1mIfo06H8EQ7bF_wTQTGciktCBaIp-zKV`；mac zip `1xViLYxc8OedvpDzS9cN7gjglvJ23fHHp`；deb `1YJiUEAJ4SjEQd8YSQKGT5RIcaPqKB6qf`；APK `1YZs5DNDNv7L95I22hl74mpOp4P08zEKY`；源码 zip `1HsShTZSR3d5DXmgUq980KFNTSaJCaJD9`；下载说明 `1ULghSSoEuvuRWMhvZUPZUWjZVcKOBi0v`；PWA zip：v5 `1fVAgv9daMPAgdf9VrnOprF7IZPPMqZr6`、v6 `15-Ptd2OsQpwWP86Uf9PQDXhXnl9Ketk-`、v7 `1kft47oy-x7mD74035CFFDMCii9e-VLDy`、v8 `1MuUYlgdBoF7KSVgRHwcitp0EMpdLpxjy`、v9=本次上传。
- 删除规则：**只删用户点名的**；v1–v4 已删（可恢复，用户指令）；v5+ 未点名。

## 6. 用户约束（勿违反）

- 中文回复；PWA-only（`lexio-desktop` 桌面版不动，勿重建桌面交付物）；
- 布局必须**多层级**（不要一屏长滚动）；学习页=**沉浸式全屏**（无宣传字样、无滚动、进入有动画）；
- 新交付 = 新文件名，不覆盖旧文件；keystore 保留在仓库；
- 词库25k 内置自动载入是既定方案（用户刚拍板「取消下载」）；
- **沟通方式**：用户要证据不要空话；每次修复附测试行号级证明；他问什么先答什么。

## 7. 测试速查

```bash
cd lexio-desktop && node test/nav.test.js   # 80 项，必须全绿
```
覆盖：导航/动画清场、翻卡 grid、滑卡计数、释义开关、**词库24条全量+高考分类只显高考+分页静态断言**、**对战连打10轮到结算**、残影样式三件套、自动刷新、下载按钮已移除。
**jsdom 无 IndexedDB → bank=24 条 SAMPLE_WORDS，这是测试设计勿当 bug 修**；真实设备=25,024 条（`bankCountLabel` 显示）。

## 8. 坑（踩过的，别重踩）

- `#expiredBanner` / `#bannerSubscribe` 是无条件绑定的初始化器，元素删了会 init 崩 → 只能改样式不能删节点。
- push 前必 `git pull --rebase`；`gh workflow run`=403；Pages settings API=403/404。
- 动画：`show()` 内 `inn/outers` 的 z-index 用内联样式压序（incoming 首屏最高），`endAnim` 里清除 `style.zIndex`。
- `speak()`（speechSynthesis）：iOS 上 cancel 后立刻 speak 会被吞 → 必须延时（现 250ms）。
- 测试断言 `__lexioBattle.over` 会失败——它是 facade，用 `#battleState`/`#battleStart` 文本断言。
