# Lexio 发音补录与发布交接

> 后续窗口从此状态继续。新增录音只用用户确认的 `voice-00 / en-US`；不要试听新音色、重做已发布录音，也不要把队列或临时合并音频说成已发布的逐词 MP3。无需更换新窗口：当前语音生成工具本轮 10 个音频额度已用完，下一批源音频需下一轮对话调用；可留在本对话继续。

## 分支与发布状态

- 仓库：`lyu888us-beep/struggle`
- 当前固定分支：`arena/749eb136-struggle`（active；不得切换或改名），基点 `acf72ed4b80c34f0ec92ef462f02155557fc8fe4`。
- iOS 美式单词“点了没声音”回退代码在 `535aa1c` / Pages run `45175726808` 已部署：iPhone/iPad 上有道 `type=2` 音频失败或超时后尝试系统 `en-US` 语音。自动测试模拟了媒体失败回退，但**尚未在 iPhone 16 Pro Max／iOS 27 真机验证**，不能声称真机问题已确认解决。
- 组 0–9 安全切分词音频：403 个在 `e54a810` / Pages run `45177816478` 部署，另 925 个在 `d44a7b3` / Pages run `45184494757` 部署。
- 新增组 10–19 的 **1,082 个**安全切分词音频已在 `38e7973d` 提交推送；Pages run `45190478870` 已成功打包并部署，Service Worker 缓存版本为 `lexio-shell-v120-word-audio-batch-004`。此部署不代表逐条人工听检或 iOS 真机验证。

## 用户约束与真实范围

- 新录音一律沿用 `voice-00 / en-US`；不改用其他音色。
- 不得把 PocketSphinx 对齐、FFmpeg 解码或模拟浏览器测试说成人工逐条听检／真机测试。
- 被语音生成审核阻止的内容不得换音色、拆分或改写来绕过审核。
- `.tmp-voice/words-unique.json` 有 **9,830** 条唯一词条；应用内置词库有 **28,414** 条记录。9,830 是当前子队列，不等于全库 20,000+ 的完整范围；若目标是全库，必须先核对并补齐队列。
- 当前有 **2,425 个**队列词条映射（5 个用户确认样音 + 2,420 个经自动对齐切分的队列音频），队列仍有 **7,405** 条没有本地逐词音频。完整词库远未完成。
- 五个原始样音 `comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough` 经用户听检确认；用户另试听六词 review sample，确认 `voice-00` 音色合适并要求继续。**新增队列片段尚未逐条人工听检**；音色认可不等于听检了每个切片。

## 组 0–19 的批量结果

- `.tmp-voice/words/word-groups.json` 将 9,830 条待录词分为 70 组；每组约 112–163 条，朗读文本约 1,255–1,320 字符。十段一轮的合并 TTS 产量较大，但来源段数不等于安全成品数；每组仍须对齐并保守检查边界。
- 组 0–9 的十段 `voice-00 / en-US` 合并音频在 `.tmp-voice/words/next-batch-002/`，原始试跑覆盖 1,423 条。安全切出 **1,328** 个逐词 MP3 并部署（组 0、1、3 为 403；组 2、4–9 为 925）。另有 **95 条**因相邻词没有可靠静音边界而跳过，未发布。
- 本轮生成了组 10–19 的十段合并音频（`.tmp-voice/words/next-batch-003/b10.mp3` 至 `b19.mp3`）。生成前排除了 **4 个已映射词**，避免重复；剩余 1,336 行经 PocketSphinx 和低能量切点检查后，切出 **1,082 个**逐词 MP3，FFmpeg 解码 1,082/1,082 成功，与已有映射无重名，且全都在 9,830 词队列中。
- 组 10 的 145 行精确对齐失败，安全起见全部留待处理，未切片或发布。组 11–19 有 **109 行**因低能量安全切点不足而跳过；不能强行切开语音。完整报告在 `.tmp-voice/words/next-batch-003/safe-cut-report.json`。这批总计考虑 1,336 个未映射行，1,082 个发布，254 个保留（145 对齐失败 +109 不安全边界）。
- 目前组 0–19 已切出并发布 **2,410** 个批量队列音频（1,328 + 1,082）；加五个原始样音后映射总数为 **2,425**。生产 `media/voice/` 总量 **20,469 个 MP3**；`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 当前含 **2,900 个发布 MP3**及清单/状态报告。
- 当前队列剩余 **7,405** 条；其中包含 95 + 254 个既有批次跳过/失败项。队列与 28,414 条内置词库仍未完全对齐。以组密度粗算 20,000 条约需 140–150 段源音频（约 14–15 个 10 段回合），但不包括对齐失败重做、安全性/听检、部署；没有可信墙钟完成时间。

## 资源、自动测试与发布

- `index.html` 的 `selectedWordRecordings` 与 `media/voice/word-audio-manifest.json` 有一致的 **2,425** 个映射；Service Worker `bulkAssets` 已登记新增离线资源。
- 最新批次 1,082 个 MP3 已全部 FFmpeg 解码。`npm test`（含所有词映射、离线资源和 iOS 模拟回退）、`node --check sw.js`、根仓库 `git diff --check` 均通过；ZIP 无坏块，2,900 个档案 MP3 与 production 文件逐个一致。Pages run `45190478870` 已成功部署。
- 472 个 `voice-00 / en-US` 词典短语和三条精确改写例句音频保留。501 个旧改写目标中，仅三条准确目标句映射到录音，其他 498 条仍待正确录音。
- GitHub Actions 对旧 Node 运行时有非阻断弃用提示；本次打包与 Pages 部署均成功。

## 后续工作

1. **无需新窗口。** 本轮 10 个语音生成文件额度已用完；同一对话下一轮可继续。建议先把组 10 的 145 个未映射词分成两段、留出更清楚停顿后重录，再用剩余额度从组 20 开始；绝不把原失败长段硬切。
2. 继续同一 `voice-00 / en-US`，核对本地映射以免重录，批量生成后逐组 PocketSphinx 对齐、FFmpeg 解码和静音检查。只发布安全片段；把失败项和行数留在 manifest/report。
3. 用户在 iPhone 16 Pro Max／iOS 27 上的真实单词发音回归仍待做；记录 Safari 或主屏 App、网络状态、测试词和是否有提示，不把模拟测试当成真机通过。
4. 先对齐 9,830 词队列与 28,414 条内置词库以及 20,000+ 目标；在安全切分率与全流程耗时稳定前，不承诺全量完成时间。

## 相关路径

- 应用与映射：`lexio-pwa-full/index.html`
- Service Worker：`lexio-pwa-full/sw.js`
- 词音频清单与说明：`lexio-pwa-full/media/voice/word-audio-manifest.json`、`lexio-pwa-full/media/voice/README.md`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 词队列与分组：`lexio-pwa-full/.tmp-voice/words-unique.json`、`lexio-pwa-full/.tmp-voice/words/word-groups.json`
- 组 0–9 临时源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-002/`
- 组 10–19 临时源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-003/`
- 根目录归档包：`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip`
