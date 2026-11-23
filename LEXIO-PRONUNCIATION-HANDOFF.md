# Lexio 发音审计交接

> 给新对话窗口继续使用。以当前工作区和本文件为准；不要重复生成 voice 候选。

## 当前 Git 状态

- 仓库：`lyu888us-beep/struggle`
- 当前分支：`arena/749eb136-struggle`（active；不要切换或改名）
- 分支基点：`acf72ed4b80c34f0ec92ef462f02155557fc8fe4`
- 本文件提交时的 HEAD：`41e3e17`（提交交接文件后 HEAD 会再前进一个提交）
- 除本交接文件外，Lexio 源码修改仍在本地工作区、尚未提交。生成音频位于忽略的 `.tmp-voice/`，没有上传到 GitHub，也没有部署。
- Pages workflow `.github/workflows/deploy-lexio-pages.yml` 对 `lexio-pwa-full/**` 的 push 会触发部署；本交接文件在仓库根目录，只提交它不会触发 Pages 部署。

## 用户目标与约束

继续完成 Lexio 发音审计，覆盖词卡单词美音／英音、例句和短语、日常口语及其他朗读入口；明确区分程序检查、实际听检和 iPhone 真机测试，并报告异常。

- 设备：iPhone 16 Pro Max、iOS 27。此前美音正常；无声须按回归问题排查。
- 新录音只用用户已听过并确认正确的 `voice-00`、`en-US`。不要添加声音候选，也不要用 `voice-01`／`voice-02`。
- 不得把词典／PocketSphinx 程序检查说成人工逐条听检；不得声称未验证的录音正确。
- 对审核阻止的短语不得换声音或绕过审核。
- 用户最近要求“生成后立即部署，并部署之前生成的单词发音”，随后又要求制作此交接、上传 GitHub、换新窗口继续。部署尚未发生；新窗口应先完成下面的集成与检查，再 push 当前分支触发部署。

## 已完成的代码工作（当前仍未提交）

- `lexio-pwa-full/data/original-site-wordbank.json`：28,414 条词库记录；增加 731 条按稳定词条 ID 和精确旧／新文本匹配的例句迁移元数据。包含 729 行改写和 2 行 LED 修正；旧译文已隐藏，当前统计有译文 26,723 条。
- `lexio-pwa-full/index.html`：内容版本 `school-grades-2026-11-v3`；迁移只替换精确匹配的旧例句，保留不匹配的用户自定义例句。短语录音存在时可播放、缺失时显示待配音。
- `lexio-pwa-full/sw.js`：缓存版本当前为 `lexio-shell-v114-card-batch-84`。尚未纳入本轮新生成的音频资源；正式发布音频时必须补齐 `bulkAssets` 并再次升缓存版本。
- `lexio-pwa-full/scripts/cut-voice-batch.py`：已扩充 OOV 发音词典；本轮修复了 `np.arange` 浮点上界极小溢出造成的误报。`py_compile` 通过。
- `lexio-pwa-full/test/nav.test.js`：测试覆盖 731 条精确迁移及隐藏旧译文，并检查不覆盖用户自定义文本；此前 `npm test` 通过。最新脚本浮点修复之后尚未重新跑完整 `npm test`。
- `.gitignore` 忽略 `.venv/`、`.tmp-voice/` 临时产物。

## 已生成音频与状态

### 短语

- 所有录音使用 `voice-00`／`en-US`。
- 473 个缺录短语中，472 个可处理，1 个被内容审核阻止并保持排除。
- 此前已有 173 个临时切片，映射在 `.tmp-voice/phrases/partial-clips.json`，文件在 `.tmp-voice/stage-test/`、`stage-phrase-5/`、`stage-phrase-6/`、`stage-phrase-7/`。
- 本轮新生成并完成程序对齐／切分 299 个片段。完整临时映射：`.tmp-voice/phrases/final-candidate-clips/clips.json`；片段目录：`.tmp-voice/phrases/final-candidate-clips/`。切分 12 组分别为 32、36、49、1、47、48、8、1、29、1、36、11 条，总计 299。
- 299 条与先前 173 条无文本重叠；合计 472 条。未复制到 `media/voice/`、未加入 `selectedRecordings`／Service Worker、未部署。
- “a 100-watt bulb” 的口播形式已规范为 “a hundred watt bulb.”，对应 p2 音频已重录；`pending-audio.json` 和 `phrase-groups.json` 已同步。
- 进度摘要：`.tmp-voice/phrases/generation-status.json`。拒绝项、历史切分失败备注见同目录 `segmentation-review.json`（p9/p10 已通过拆分批次解决；该文件是历史记录）。

### 单词与精确改写句

- 用户已试听并认可 5 个 voice-00 单词样音：`comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough`。单独 MP3 在 `.tmp-voice/words/samples/`，合并试听文件是 `word-pronunciation-samples.mp3`。它们**尚未集成或部署**；全库 9,830 个唯一单词、70 批仍未开始生成。
- 本轮额外生成 3 条精确目标句音频（尚未做 PocketSphinx 对齐、切音或集成）：
  - `.tmp-voice/phrases/exact-targets/breath.mp3` — `Take a slow breath before you begin speaking.`
  - `.tmp-voice/phrases/exact-targets/count-by-tens.mp3` — `Let's count by tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, and one hundred.`
  - `.tmp-voice/phrases/exact-targets/led-semiconductor.mp3` — `In the Ohmic contacts of LED electrodes, carriers have different transmission mechanisms between a metal electrode and a semiconductor.`
- 这三句分别解决两处重复目标来源冲突和 LED 音频文本不一致风险，但由于尚未对齐／映射，不能称为已修复。
- **部署前必须处理已知映射风险：**当前 `selectedRecordings` 有 501 个例句改写目标键，全部复用了旧 MP3；基线中 501 个目标文本原本均无映射。不能把这些别名当作文本与音频匹配。集成时应移除未验证目标的旧音频映射，只加入已精确生成并验证的目标（目前 3 条），其余目标保持“本句暂无录音／待配音”，直到正确音频完成。

## 检查状态（不要混为一谈）

- **程序级：**本轮 299 个新短语均由 PocketSphinx 按 `spoken` 逐词对齐，安全静音切分成功，输出文件均存在；这是自动对齐，不是人工听检。
- **人工听检：**用户只确认了上述 5 个单词样音的声音正确。299 个短语、3 条精确改写句、既有全库 MP3 均未逐条人工听检。
- **真机：**iPhone 16 Pro Max／iOS 27 尚未复测。
- **现有统计：**旧版测试检查 17,572 条原有录音映射及每日口语资源；迁移、交互测试之前通过。新音频尚未加入映射，所以这些旧测试结果不代表新资产已发布。

## 新窗口的下一步（按顺序）

1. 先 `git status --short`，确认仍在 `arena/749eb136-struggle`，工作区包含本交接记录所述未提交源码修改和 `.tmp-voice/` 音频。
2. 校验 `.tmp-voice/phrases/final-candidate-clips/clips.json` 299 项和 `partial-clips.json` 173 项：文件完整、无映射冲突；随后复制 472 个 MP3 到 `lexio-pwa-full/media/voice/`。
3. 对 3 条 `.tmp-voice/phrases/exact-targets/*.mp3` 运行文本对齐检查，复制并映射为文本哈希 `s-<sha256(text)[:16]>`；修复 501 个目标键的旧音频别名风险，不能播放不匹配的旧录音。
4. 将 5 个已获用户认可的单词样音复制到 `media/voice/`，按 `w-<sha256(word)[:16]>` 命名；在 `index.html` 加 `selectedWordRecordings` 并仅为这些词的 `en-US` 入口播放本地 voice-00 录音。英音和其余单词路线保持原状；本轮只覆盖 5 个样词，不是全库 9,830 词。
5. 更新 `sw.js` 离线音频清单和缓存版本（当前 v114），同步更新语音测试与 `media/voice/README.md`。
6. 运行 `npm test`、`node --check sw.js`、`git diff --check`，核对每个 manifest ID 对应文件、数量和音频帧；记录这些是程序检查，不是听检。
7. 按用户要求部署：只提交并 push 到当前分支 `arena/749eb136-struggle`。部署工作流监听 `lexio-pwa-full/**` 的 push；push 后用 `gh run list`／`gh run watch` 确认 Pages 部署结果。不要切分支、不要谎称 iPhone 测试或全库听检已通过。
8. 部署后安排 iPhone 16 Pro Max／iOS 27 实测；继续处理剩余 498 条改写句的正确配音、单词全库发音、全库听检及其他读音按钮。

## 重要文件

- 词库迁移：`lexio-pwa-full/index.html`、`lexio-pwa-full/data/original-site-wordbank.json`
- 切音脚本：`lexio-pwa-full/scripts/cut-voice-batch.py`
- Service Worker：`lexio-pwa-full/sw.js`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 临时短语计划：`lexio-pwa-full/.tmp-voice/phrases/pending-audio.json`
- 临时完整切音映射：`lexio-pwa-full/.tmp-voice/phrases/final-candidate-clips/clips.json`
- 临时进度：`lexio-pwa-full/.tmp-voice/phrases/generation-status.json`
