# Lexio 发音补录与发布交接

> 后续窗口从此状态继续。新录音只用用户确认的 `voice-00 / en-US`；不要试听新音色，不重复生成已有录音，也不要把队列或临时合并音频说成已发布的逐词 MP3。

## 分支与发布状态

- 仓库：`lyu888us-beep/struggle`
- 固定分支：`arena/749eb136-struggle`（active；不得切换或改名），基点 `acf72ed4b80c34f0ec92ef462f02155557fc8fe4`。
- 已部署基线 `4ad9b4f` / Pages run `45173204698`：上一轮 10 个单词已上线。
- 为处理 iOS 美式单词“点了没声音”，代码提交 `535aa1c` / Pages run `45175726808` 已成功：iPhone/iPad 上有道 `type=2` 音频错误或超时后现在会尝试系统 `en-US` 语音。自动测试模拟了媒体失败回退，但**尚未在 iPhone 16 Pro Max／iOS 27 真机验证**，所以这只是针对代码中高风险失败路径的修复，不可声称真机问题已确认解决。
- 本批 403 个逐词 MP3、映射、离线清单 v118、测试、README 和 ZIP 已在 `e54a810` 提交并推送；Pages run `45177816478` 的打包与部署均成功。当前分支工作区干净。
- `LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 已随本批更新为 893 个发布 MP3及清单备份；它不是 Pages 网站资源，也不包含源码补丁。

## 用户约束与真实范围

- 新录音一律沿用 `voice-00 / en-US`；不改用 `voice-01`、`voice-02` 或新候选音色。
- 不得把 PocketSphinx 对齐、FFmpeg 解码或模拟浏览器测试说成人工听检／真机测试。
- 被语音生成审核阻止的内容不得换音色、拆分或改写来绕过审核。
- `.tmp-voice/words-unique.json` 有 **9,830** 条唯一词条；应用内置词库测试统计为 **28,414 条词条**。9,830 是当前待录子队列，不等于全库 20,000+ 的完整范围；若目标是全库，必须先核对并补齐队列。
- 目前有 **418 个**队列词条对应实际本地 MP3（5 个用户确认样音 + 10 个首批词 + 本批 403 个），队列仍有 **9,412 个**没有本地逐词 MP3。完整词库远未完成。
- 五个样音 `comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough` 经用户听检确认；其余 413 个本地词音频尚未逐条人工听检。

## 本批批量生成结果（重要：分清临时音频与发布音频）

- `.tmp-voice/words/word-groups.json` 将 9,830 条拆成 70 组，每组 112–163 条，朗读文本约 1,255–1,320 字符；TTS 工具每次最多 10 个音频文件、每段最多 1,500 字符。按分组生成远比逐词调用有效：理论上约 70 段 TTS 可覆盖这 9,830 条，10 段一轮约 1,400 条；但每组必须能安全切成独立词条，不能只按源音频数量当成已完成。
- 本轮一次生成了 10 个 `voice-00 / en-US` 合并源音频，位于 `lexio-pwa-full/.tmp-voice/words/next-batch-002/b0.mp3` 至 `b9.mp3`，合计包含 1,423 条尚无音频的词条文本。它们是临时长音频，不是逐词成品，也没有发布。
- PocketSphinx 对齐及切点检查只对源组 0、1、3 找到安全切点；对应 **403 个**独立 MP3 在 `lexio-pwa-full/.tmp-voice/words/aligned-next-batch-002-safe/`，已复制到 `media/voice/`、加入映射和离线清单，并随 `e54a810` / Pages run `45177816478` 成功部署。FFmpeg 解码检查 403/403 成功；尚未逐条人工听检。
- 其余源组 2、4、5、6、7、8、9 共 1,020 条仍有临时合并音频，但切点检查发现至少一处没有可靠静音（组 6 有多处）；尚未切片、映射或发布。**不要强行在语音中间切开**。需要先改善停顿格式／切分验证；不要为了省调用重录已存在的组或绕过审核。
- 原队列中紧随首批十词的 `absorb`、`accomplish`、`acknowledge`、`adapt`、`appreciate` 已在本批 403 中；`assume`、`curiosity`、`distinguish`、`estimate`、`potential` 仍未加入本地映射。

## 已集成资源与代码

### 词语、短语、例句

- 单词映射 `index.html` 当前为 418 个，清单为 `media/voice/word-audio-manifest.json`；已发布映射包括 5 个已确认样音 + 10 个首批新词 + 403 个新词条。
- 生产媒体目录当前共 **18,462 个 MP3**（原有 17,569 + 累计新增 893）。累计新增为 472 个词典短语、3 个精确改写例句、5 个样音、10 个首批词和403 个本批逐词音频。
- Service Worker `lexio-shell-v118-word-audio-batch-002` 含 403 个新逐词 clip 离线资源，已随 `e54a810` / run `45177816478` 部署。
- 已导入 472 个 `voice-00 / en-US` 短语 MP3（原 173 + 后续 299）；另有三条精确改写例句音频：
  - `Take a slow breath before you begin speaking.`
  - `Let's count by tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, and one hundred.`
  - `In the Ohmic contacts of LED electrodes, carriers have different transmission mechanisms between a metal electrode and a semiconductor.`
- 例句迁移有 731 条记录、501 种目标文本。错误旧别名已移除，只为上述 3 条准确目标句恢复录音；其余 498 个目标仍待正确录音。

### iOS 美音播放路径

- 旧实现对 iPhone/iPad 的未录制美音单词依赖有道在线 `dictvoice type=2`，远程媒体失败时禁用了系统语音回退；JSDOM 测试此前只验证 `Audio.play()` 被调用，并不验证可听输出。
- `535aa1c` 已部署此路径的系统语音回退，并新增“模拟远程媒体错误后必须尝试系统 `en-US`”测试。它能覆盖代码错误分支，不证明用户真机已恢复。

## 检查与听检边界

- 最近 `npm test` 通过，包括 418 个单词映射、离线媒体资源及模拟 iOS 远程音频失败后的回退；`node --check sw.js`、`git diff --check` 通过。
- 本批 403 个逐词 MP3 已由 FFmpeg 全部解码；源组 0、1、3 的 PocketSphinx 自动对齐及切点检查通过。源组 2、4–9 有不安全切点，未发布。
- 本批和此前新增音频都未逐条人工听检；iPhone 16 Pro Max／iOS 27 真机回归尚未完成。

## 接下来

1. 403 个音频已发布；不要重生成。下一步为尚未安全切片的源组 2、4–9 调整停顿或切分验证，先用小组试验确认不会切断发音，再处理剩余队列。
2. 请用户在 iPhone 16 Pro Max／iOS 27 上验证美音恢复；若仍无声，记录浏览器（Safari 或主屏 App）、联网状态、词条、点击后有无提示，再据此继续定位。不要把模拟测试当成真机通过。
3. 继续对齐完整生成范围：当前 9,830 条唯一词队列与应用 28,414 条词库不是同一个规模。按现有组密度，20,000 条约需 140–150 段源音频，即至少约 14–15 个 10 段工具回合，且不包括切分失败重做、部署与真机验证；不能承诺具体墙钟时长。
4. 用户要求生成后立即部署；任何审核阻止内容照规则排除，不换音色、不拆分绕过。

## 相关路径

- 应用与单词映射：`lexio-pwa-full/index.html`
- Service Worker：`lexio-pwa-full/sw.js`
- 词音频清单：`lexio-pwa-full/media/voice/word-audio-manifest.json`
- 音频说明：`lexio-pwa-full/media/voice/README.md`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 切分脚本：`lexio-pwa-full/scripts/cut-voice-batch.py`
- 队列：`lexio-pwa-full/.tmp-voice/words-unique.json`、`lexio-pwa-full/.tmp-voice/words/word-groups.json`
- 本批十段原始合并音频：`lexio-pwa-full/.tmp-voice/words/next-batch-002/`
- 当前安全切片暂存目录：`lexio-pwa-full/.tmp-voice/words/aligned-next-batch-002-safe/`
- 根目录音频备份包：`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip`
