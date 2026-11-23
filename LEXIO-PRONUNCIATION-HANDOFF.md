# Lexio 发音补录与发布交接

> 后续继续沿用用户已确认的 `voice-00 / en-US`，不要试听或换用新音色。批次 006（组 38–47）已生成、保守切片、集成、归档、推送并部署；1,326 个安全片段发布，78 项继续留空。批次 007（组 48–57）源文本已准备，尚未生成音频。每批只发布通过安全检查的片段；未通过切点/片段质量检查的词继续留空。新增队列词仍未逐条人工听检，iPhone 真机也未验证。

## 分支与发布状态（截至 2026-11-20）

- 仓库：`lyu888us-beep/struggle`
- 当前固定分支：`arena/749eb136-struggle`（active；不得切换或改名），基点 `acf72ed4b80c34f0ec92ef462f02155557fc8fe4`。
- 批次 006 的应用代码、清单、测试、README、归档和 1,326 个安全 MP3 在提交 `f4145eaaf706621d68394b4f80810ea614492ec7`（`Publish 1,326 safe voice-00 word clips`），已推送。
- GitHub Pages workflow `deploy-lexio-pages` run **45204512200** 对提交 `f4145eaa` 部署成功。Node 20 / Actions v4 弃用提示非阻断。
- Service Worker 缓存版本：`lexio-shell-v123-word-audio-batch-007`。
- 批次 005 提交 `34079232`、Pages run **45202613075** 部署成功；批次 004 的部署 run **45193368197** 成功，之后说明/归档更正 run **45194350190** 也成功。
- 批次 006 发布后全量核对 ZIP：6,703 个档案 MP3 与生产目录对应文件逐一字节一致，ZIP 完整性通过；其中单词映射 6,228 个。
- 部署不代表人工逐条听检或 iOS 真机验证。
- 本轮核对 `.tmp-voice/words/aligned-next-batch-001`、`aligned-next-batch-002`、`aligned-next-batch-002-partial`、`aligned-next-batch-002-safe`、`aligned-next-batch-003-safe`、`aligned-next-batch-004-safe`：此前这些目录中的 MP3 均已在生产目录逐个存在且字节一致，没有旧批次安全片段漏部署。部分中间目录内容可能互相重叠，不可把目录文件数相加当成新增数。
- iOS 美式单词“点了没声音”回退代码在 `535aa1c` / Pages run `45175726808` 已部署：iPhone/iPad 上有道 `type=2` 音频失败或超时后尝试系统 `en-US` 语音。自动测试模拟了媒体失败回退，但**尚未在 iPhone 16 Pro Max／iOS 27 真机验证**，不能声称真机问题已确认解决。
- 根目录本机的 `VOICE-00-WORD-REVIEW.mp3` 是用户已确认音色的试听文件，目前未跟踪且不属于生产发布包；不要误当成逐词生产录音。

## 用户约束与真实范围

- 新录音一律沿用 `voice-00 / en-US`；不改用其他音色。
- 不得把 PocketSphinx 对齐、FFmpeg 解码或模拟浏览器测试说成人工逐条听检／真机测试。
- 被语音生成审核阻止的内容不得换音色、拆分或改写来绕过审核。
- 不得强切语音或发布不安全边界的词；无法保守对齐的词保持未映射，并记录跳过原因。
- `.tmp-voice/words-unique.json` 有 **9,830** 条唯一词条；应用内置词库有 **28,414** 条记录。9,830 是当前子队列，不等于全库 20,000+ 的完整范围；若目标是全库，必须先核对并补齐队列。
- 当前 9,830 项队列有 **6,228** 条逐词本地映射（五个用户确认样音 + 6,223 个自动生成队列词音频），**3,602** 条仍未映射。完整词库远未完成。
- 五个原始样音 `comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough` 经用户听检确认；用户另试听 review sample，确认 `voice-00` 音色合适并要求继续。**新增队列片段尚未逐条人工听检**；音色认可不等于听检了每个切片。

## 已完成队列批次

- `.tmp-voice/words/word-groups.json` 将 9,830 条当前队列分为 70 组；每组约 112–163 条。批次来源段数不等于安全成品数；每组仍须对齐并保守检查边界。
- 组 0–9 的初始合并音频在 `.tmp-voice/words/next-batch-002/`，试跑覆盖 1,423 条。安全切出 **1,328** 个逐词 MP3 并部署（组 0、1、3 为 403；组 2、4–9 为 925）。另有 **95 条**因相邻词没有可靠静音边界而跳过，未强切、未发布。
- 批次 003 首次覆盖组 10–19：组 10 原 145 行长音频精确对齐失败，整组未切片；组 11–19 切出 **1,082** 个安全 MP3，另 **109 行**因切点不安全而跳过。失败报告在 `.tmp-voice/words/next-batch-003/safe-cut-report.json`。1,082 个已在 `38e7973d` / Pages run `45190478870` 部署。
- 批次 004 使用 **10 段** `voice-00 / en-US` 音频：组 10 拆成 `10a`、`10b` 重试，再处理组 20–27。安全切分报告合计 **1,285 行**，PocketSphinx 对齐没有失败；保守边界检查生成 **1,250 个**安全片段，另 **35 行**跳过。拆分详情：
  - 组 10 重试在排除已映射样词 `comfortable` 后有 145 行：`10a` 72/72 安全；`10b` 71 个安全、2 个边界不安全；合计 **143 发布、2 跳过**。
  - 组 20–27 在排除已映射词 `entrepreneur`、`essential` 后合计 1,140 行：**1,107 发布、33 跳过**。逐组安全成品数为组 20:129、21:129、22:137、23:152、24:146、25:146、26:133、27:135。
  - 全部 1,250 个新 MP3 均通过 FFmpeg 解码；ID、队列归属和冲突检查通过。PocketSphinx/FFmpeg 结果不是人耳审核。报告和源文件在 `.tmp-voice/words/next-batch-004/`；不安全的 35 项没有发布或登记为可播放。该批在 `ed68ef7f` / Pages run `45193368197` 部署。
- 批次 005 为组 28–37 生成了 **10 段** `voice-00 / en-US` 源音频，共 **1,387 行**。PocketSphinx 未报告对齐失败；保守边界与片段质量检查发布 **1,227 个**安全 MP3，另 **160 行**未发布，报告中有 **83 个不安全边界**。无强切。逐组安全数：28:142、29:148、30:123、31:78、32:87、33:85、34:153、35:124、36:152、37:135。FFmpeg 解码 **1,227/1,227** 通过；队列归属、映射冲突检查通过。完整报告及音源在 `.tmp-voice/words/next-batch-005/`；安全切片不是人工听检。
- 批次 006 为组 38–47 生成了 **10 段** `voice-00 / en-US` 源音频，共 **1,404 行**。PocketSphinx 未报告对齐失败；保守切分发布 **1,326 个**安全 MP3，另 **78 行**未发布，报告记录 **40 个不安全边界**，没有强切。逐组安全数：38:135、39:104、40:140、41:142、42:146、43:132、44:144、45:114、46:139、47:130。FFmpeg 解码 **1,326/1,326** 通过；队列归属、映射冲突检查通过。完整报告及音源在 `.tmp-voice/words/next-batch-006/`；安全切片不是人工听检。
- 截至组 0–47，清单共登记 **6,223** 个自动生成的队列词音频（另有 5 个用户确认样音），词清单合计 **6,228** 条；当前 9,830 项队列中余 **3,602** 条未映射，包含各批因切点/质量检查未发布的词。
- 生产 `lexio-pwa-full/media/voice/` 目前有 **24,272 个 MP3**。`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 有 **6,703 个发布 MP3**；ZIP 内全部 6,703 个 MP3 与生产文件逐一字节比对一致，`testzip()` 通过。

## 资源、自动测试与发布

- `index.html` 的 `selectedWordRecordings` 与 `media/voice/word-audio-manifest.json` 一致记录 **6,228** 个词映射；Service Worker `bulkAssets` 已登记新增离线资源，缓存版本为 v123。
- 批次 006 的 `npm test` 全部通过（导航与语音测试），`node --check sw.js` 通过，`git diff --check` 通过。
- ZIP 检查：6,703 个档案 MP3 与生产文件内容逐一字节一致；ZIP 无损坏；词映射 6,228 个；批次 006 报告 1,326 个安全片段、78 个跳过、40 个不安全边界。
- Pages run **45204512200** 成功部署批次 006。Actions 的 Node 20 / v4 弃用提示不影响部署。
- 472 个 `voice-00 / en-US` 词典短语和三条精确改写例句音频保留。501 个旧改写目标中，仅三条准确目标句映射到录音，其他 498 条仍待正确录音；审核阻止的一条短语继续排除，不得换音色／拆分／改写绕过。
- 注意：`node scripts/voice-queue.mjs` 当前会因一条仍有文件的旧映射 `...Connecticut Ave., one of the main arteries of Washington.` 被句子筛选规则排除而报错；MP3 文件确实存在。这是口语短语队列脚本的旧片段过滤诊断，不代表逐词音频漏部署。逐词批次从 `.tmp-voice/words-unique.json` 和 `word-groups.json` 核对。

## 后续工作

1. 先核对 9,830 条当前队列、28,414 条应用内置词条和 20,000+ 目标之间的范围与去重关系；明确需要补录的目标集合前，不宣称全覆盖或给出确定完成时间。
2. 批次 007 已在 `.tmp-voice/words/next-batch-007/` 准备组 48–57 的源文本：原有 1,422 行中排除 4 个已有映射，待生成 **1,418 行**，分为 10 段、每段约 1,300 字符。当前还没有 `b48.mp3`–`b57.mp3`；本轮语音生成额度已耗尽，下一轮沿用 `voice-00 / en-US` 生成后再转 WAV、对齐、FFmpeg 解码并保守检查边界。仅发布安全片段，保留失败及跳过报告，不得强切。
3. 批次 001–006 所有未发布项仍保持未映射（例如批次 006 的 78 项和批次 005 的 160 项）；不可将其计为已覆盖。自动对齐、解码、测试不等于人工听检。
4. 用户在 iPhone 16 Pro Max／iOS 27 上的真实单词发音回归仍待做；记录 Safari 或主屏 App、网络状态、测试词和是否有提示，不把模拟测试当成真机通过。

## 相关路径

- 应用与映射：`lexio-pwa-full/index.html`
- Service Worker：`lexio-pwa-full/sw.js`
- 词音频清单与说明：`lexio-pwa-full/media/voice/word-audio-manifest.json`、`lexio-pwa-full/media/voice/README.md`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 词队列与分组：`lexio-pwa-full/.tmp-voice/words-unique.json`、`lexio-pwa-full/.tmp-voice/words/word-groups.json`
- 组 0–9 临时源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-002/`
- 组 10–19 首次源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-003/`
- 组 10 重试、20–27 源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-004/`
- 组 28–37 源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-005/`
- 组 38–47 源与报告：`lexio-pwa-full/.tmp-voice/words/next-batch-006/`
- 组 48–57 已准备的源文本：`lexio-pwa-full/.tmp-voice/words/next-batch-007/`
- 根目录归档包：`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip`
