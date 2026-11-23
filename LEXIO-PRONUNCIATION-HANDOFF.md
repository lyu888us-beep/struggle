# Lexio 发音补录与发布交接

> 后续继续沿用用户已确认的 `voice-00 / en-US`，不要试听或换用新音色。批次 004 已完成集成、测试、归档、推送与 Pages 部署。新增队列词仍未逐条人工听检，iPhone 真机也未验证。暂时不需要另开对话窗口；继续下一批前先对齐队列与全库目标，并保持保守安全切分。

## 分支与发布状态（截至 2026-11-20）

- 仓库：`lyu888us-beep/struggle`
- 当前固定分支：`arena/749eb136-struggle`（active；不得切换或改名），基点 `acf72ed4b80c34f0ec92ef462f02155557fc8fe4`。
- 当前分支最新交接提交：`1963eec5`，已推送。批次 004 的应用代码、清单、测试、说明和 1,250 个新 MP3 在其前一提交 `ed68ef7f`（`Publish 1,250 safe voice-00 word clips`）；Pages workflow `deploy-lexio-pages` 对该应用提交的 run **45193368197** 成功。Node 20 弃用警告非阻断。
- Service Worker 缓存版本：`lexio-shell-v121-word-audio-batch-005`。
- 最新站点部署不表示人工逐条听检或 iOS 真机验证。
- iOS 美式单词“点了没声音”回退代码在 `535aa1c` / Pages run `45175726808` 已部署：iPhone/iPad 上有道 `type=2` 音频失败或超时后尝试系统 `en-US` 语音。自动测试模拟了媒体失败回退，但**尚未在 iPhone 16 Pro Max／iOS 27 真机验证**，不能声称真机问题已确认解决。
- 根目录本机的 `VOICE-00-WORD-REVIEW.mp3` 是用户已确认音色的试听文件，目前未跟踪且不属于本次生产发布包；不要误当成逐词生产录音。

## 用户约束与真实范围

- 新录音一律沿用 `voice-00 / en-US`；不改用其他音色。
- 不得把 PocketSphinx 对齐、FFmpeg 解码或模拟浏览器测试说成人工逐条听检／真机测试。
- 被语音生成审核阻止的内容不得换音色、拆分或改写来绕过审核。
- 不得强切语音或发布不安全边界的词；无法保守对齐的词保持未映射，并记录跳过原因。
- `.tmp-voice/words-unique.json` 有 **9,830** 条唯一词条；应用内置词库有 **28,414** 条记录。9,830 是当前子队列，不等于全库 20,000+ 的完整范围；若目标是全库，必须先核对并补齐队列。
- 当前 9,830 项队列有 **3,675** 条逐词本地映射（五个用户确认样音 + 3,670 个自动生成队列词音频），**6,155** 条仍未映射。完整词库远未完成。
- 五个原始样音 `comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough` 经用户听检确认；用户另试听 review sample，确认 `voice-00` 音色合适并要求继续。**新增队列片段尚未逐条人工听检**；音色认可不等于听检了每个切片。

## 已完成队列批次

- `.tmp-voice/words/word-groups.json` 将 9,830 条当前队列分为 70 组；每组约 112–163 条。批次来源段数不等于安全成品数；每组仍须对齐并保守检查边界。
- 组 0–9 的初始合并音频在 `.tmp-voice/words/next-batch-002/`，试跑覆盖 1,423 条。安全切出 **1,328** 个逐词 MP3 并部署（组 0、1、3 为 403；组 2、4–9 为 925）。另有 **95 条**因相邻词没有可靠静音边界而跳过，未强切、未发布。
- 批次 003 首次覆盖组 10–19：组 10 原 145 行长音频精确对齐失败，整组未切片；组 11–19 切出 **1,082** 个安全 MP3，另 **109 行**因切点不安全而跳过。失败报告在 `.tmp-voice/words/next-batch-003/safe-cut-report.json`。1,082 个已在 `38e7973d` / Pages run `45190478870` 部署。
- 批次 004 使用 **10 段** `voice-00 / en-US` 音频：组 10 拆成 `10a`、`10b` 重试，再处理组 20–27。安全切分报告合计 **1,285 行**，PocketSphinx 对齐没有失败；保守边界检查生成 **1,250 个**安全片段，另 **35 行**跳过。拆分详情：
  - 组 10 重试 145 行：`10a` 72/72 安全；`10b` 71 个安全、2 个边界不安全；合计 **143 发布、2 跳过**。
  - 组 20–27 合计 1,140 行：**1,107 发布、33 跳过**。逐组安全成品数为组 20:129、21:129、22:137、23:152、24:146、25:146、26:133、27:135。
  - 全部 1,250 个新 MP3 均通过 FFmpeg 解码；ID、队列归属和冲突检查通过。PocketSphinx/FFmpeg 结果不是人耳审核。报告和源文件在 `.tmp-voice/words/next-batch-004/`；不安全的 35 项没有发布或登记为可播放。
- 累计组 0–27 有 **3,670** 个自动生成的逐词队列音频，加五个用户确认样音，共 **3,675** 个单词映射；组 0–27 的未映射/跳过队列项仍在 6,155 个余项内，后续必须继续核对，不能直接重录而覆盖已发布 ID。
- 生产 `lexio-pwa-full/media/voice/` 目前有 **21,719 个 MP3**。`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 已更新至 **4,150 个发布 MP3**，包括逐词音频、短语、例句及映射文件；ZIP 内 4,150 个 MP3 与生产文件逐一比对一致，`testzip()` 通过。

## 资源、自动测试与发布

- `index.html` 的 `selectedWordRecordings` 与 `media/voice/word-audio-manifest.json` 一致记录 **3,675** 个词映射；Service Worker `bulkAssets` 已登记新增离线资源。
- 批次 004 的 `npm test` 全部通过（导航与语音测试），`node --check sw.js` 通过，`git diff --check` 通过。
- ZIP 检查：4,150 个档案 MP3 与生产文件内容完全一致；ZIP 无损坏；词映射 3,675 个；批次 004 报告 1,250 个安全片段、35 个跳过。
- Pages run **45193368197** 成功部署 `ed68ef7f`。GitHub Actions 有 Node 20 弃用提示，不影响部署结果。
- 472 个 `voice-00 / en-US` 词典短语和三条精确改写例句音频保留。501 个旧改写目标中，仅三条准确目标句映射到录音，其他 498 条仍待正确录音；审核阻止的一条短语继续排除，不得换音色／拆分／改写绕过。

## 后续工作

1. 先核对 9,830 条当前队列、28,414 条应用内置词条和 20,000+ 目标之间的范围与去重关系；明确需要补录的目标集合前，不宣称全覆盖或给出确定完成时间。
2. 再从尚未覆盖的后续组继续，优先排除已有映射，沿用 `voice-00 / en-US`；逐组对齐、FFmpeg 解码并做保守静音边界检查。仅发布安全片段，保留失败及跳过报告。不可因批量效率而强切。
3. 用户在 iPhone 16 Pro Max／iOS 27 上的真实单词发音回归仍待做；记录 Safari 或主屏 App、网络状态、测试词和是否有提示，不把模拟测试当成真机通过。
4. 需新一批语音生成时可在本对话后续轮次继续，单轮生成工具最多 10 个片段；当前无需另开窗口。若之后上下文需交接，使用本文件中的准确计数和分支状态。

## 相关路径

- 应用与映射：`lexio-pwa-full/index.html`
- Service Worker：`lexio-pwa-full/sw.js`
- 词音频清单与说明：`lexio-pwa-full/media/voice/word-audio-manifest.json`、`lexio-pwa-full/media/voice/README.md`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 词队列与分组：`lexio-pwa-full/.tmp-voice/words-unique.json`、`lexio-pwa-full/.tmp-voice/words/word-groups.json`
- 组 0–9 临时源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-002/`
- 组 10–19 首次源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-003/`
- 组 10 重试、20–27 源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-004/`
- 根目录归档包：`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip`
