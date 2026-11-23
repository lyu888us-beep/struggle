# Lexio 发音补录与发布交接

> 后续窗口从此状态继续。新增录音只用用户确认的 `voice-00 / en-US`；不要试听新音色、重做已有录音，也不要把队列或临时合并音频说成已发布的逐词 MP3。

## 分支与发布状态

- 仓库：`lyu888us-beep/struggle`
- 当前固定分支：`arena/749eb136-struggle`（active；不得切换或改名），基点 `acf72ed4b80c34f0ec92ef462f02155557fc8fe4`。
- iOS 美式单词“点了没声音”回退代码在 `535aa1c` / Pages run `45175726808` 已部署：iPhone/iPad 上有道 `type=2` 音频失败或超时后尝试系统 `en-US` 语音。自动测试模拟了媒体失败回退，但**尚未在 iPhone 16 Pro Max／iOS 27 真机验证**，不能声称真机问题已确认解决。
- 先前 403 个安全切分词音频在 `e54a810` / Pages run `45177816478` 已部署；后续状态交接在 `b7b7b52` 已推送，该文档提交的 Pages run 未确认。
- **当前新增的 925 个安全切分 MP3 已复制到生产媒体目录、加入词映射/manifest/Service Worker 离线清单与 ZIP，但本轮测试、提交和部署尚待完成。** 完成并确认 Pages run 后，更新本节状态；不要将本轮准备中的工作说成线上已发布。

## 用户约束与真实范围

- 新录音一律沿用 `voice-00 / en-US`；不改用其他音色。
- 不得把 PocketSphinx 对齐、FFmpeg 解码或模拟浏览器测试说成人工逐条听检／真机测试。
- 被语音生成审核阻止的内容不得换音色、拆分或改写来绕过审核。
- `.tmp-voice/words-unique.json` 有 **9,830** 条唯一词条；应用内置词库有 **28,414** 条记录。9,830 是当前子队列，不等于全库 20,000+ 的完整范围；若目标是全库，必须先核对并补齐队列。
- 当前本地集成 **1,343 个**队列词条映射（5 个先前由用户认可的样音 + 1,338 个经自动对齐切分的新词音频）；该队列仍有 **8,487** 条没有本地逐词音频。完整词库远未完成。
- 五个原始样音 `comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough` 经用户听检确认。用户另试听了六词 review sample，确认 `voice-00` 音色合适并要求继续。**新增批次的 1,338 个片段均未逐条人工听检**；用户对音色的认可不等于听检了每个切片。

## 1,423 词试跑批次结果

- `.tmp-voice/words/word-groups.json` 将 9,830 条待录词分为 70 组；每组约 112–163 条，朗读文本约 1,255–1,320 字符。批量合并 TTS 比逐词调用更高效，但 TTS 源音频数量不等于成品数：每组仍须安全对齐、切分并检查。
- 此次 10 个 `voice-00 / en-US` 合并源音频位于 `lexio-pwa-full/.tmp-voice/words/next-batch-002/b0.mp3` 至 `b9.mp3`，原始文本覆盖 **1,423** 个队列词条。
- 源组 0、1、3 已安全切出 **403** 个词音频，随 `e54a810` / run `45177816478` 部署；FFmpeg 解码 403/403 通过。
- 源组 2、4–9 的 1,020 条里，第二轮保守切点检查新切出 **925** 个 MP3；FFmpeg 解码 925/925 通过，与已有映射无重名，且 925 个词都在队列中。本地映射数因此由 418 增至 **1,343**，媒体 MP3 数由 18,462 增至 **19,387**，Service Worker 离线版本升至 `lexio-shell-v119-word-audio-batch-003`。这些改动尚未验证整套测试或 Pages 部署。
- 仍有 **95 条**因相邻词间没有可靠静音边界而跳过（组 2: 2、组 4: 2、组 5: 2、组 6: 47、组 7: 7、组 8: 24、组 9: 11）。未强行切开、未纳入映射或发布。继续先改善停顿/对齐验证，不能强行在发音中间切片。
- 临时源音频及报告在 `.tmp-voice/words/next-batch-002/`；925 个暂存成品在 `.tmp-voice/words/aligned-next-batch-002-partial/`；已发布目录副本为 `media/voice/w-*.mp3`。合并源音频不算独立词条 MP3。
- 队列剩余 8,487 条，其中包括这 95 个跳过项；尚未确定后续各批的安全切分率和端到端吞吐，因此仍**不能给 20,000+ 全量目标一个可信完成时间**。

## 资源与应用状态

- `index.html` 的 `selectedWordRecordings` 和 `media/voice/word-audio-manifest.json` 各有 1,343 个一致映射；新增批次保留 95 条不安全边界的统计。所有新增音频都已加进 `sw.js` 的 `bulkAssets` 预缓存列表。
- 生产媒体目录现在有 **19,387 个 MP3**（原有 17,569 个 + 累计新增 1,818 个）。累计新增包括 472 个缺录词典短语、3 个精确改写例句、5 个样音、10 个首批词、403 个安全切分词和本轮 925 个安全切分词。
- `LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 已更新为包含 1,818 个新增发布 MP3 及映射/状态清单的备份包；不是 Pages 网站资源，也不单独包含可部署源码。
- 新增批次逐词文件已全部由 FFmpeg 解码，但尚未逐条人工听检。整套 `npm test`、`node --check sw.js`、`git diff --check`、ZIP 校验及部署状态仍需在本次发布前核实。
- 原有 472 个 `voice-00 / en-US` 词典短语（原 173 + 后续 299），及三条精确改写例句音频保留。501 个旧改写目标中，只有三条准确生成并对齐的目标句恢复本地录音，其余 498 条仍待正确录音。

## iOS 美音播放问题

- 旧实现对 iPhone/iPad 未录制美音单词依赖有道在线 `dictvoice type=2`；远程媒体失败时禁用了系统语音回退。JSDOM 测试此前只验证 `Audio.play()` 被调用，并不证明可听输出。
- `535aa1c` 已部署系统语音回退及“模拟远程媒体错误后必须尝试系统 `en-US`”测试。此修复覆盖代码中高风险失败路径，不证明用户真机已恢复；仍待用户在实际 iPhone 16 Pro Max／iOS 27 上验证。

## 下一步

1. 上述测试、媒体存在性/离线映射、925 个新片段与 95 个跳过项的记录，以及 ZIP 1,818 个 MP3 的逐文件一致性核对均已通过。
2. 提交并推送当前固定分支，确认 Pages Actions 完成并成功部署；更新本节具体提交和 run 状态。
3. 部署后告知用户本批精确结果和检查状态；不要把自动对齐说成人工听检。真机 iOS 测试仍单独待办。
4. 继续生成时优先用同一 `voice-00 / en-US` 合并批次；对齐后保守检查安全切点，保留不能可靠切开的词。不要重生成已发布内容，不要绕过审核。
5. 继续先对齐 9,830 队列与 28,414 条内置词库以及 20,000+ 目标。以现有组密度估算 20,000 条约需 140–150 段源音频（约 14–15 个 10 段工具回合），不含失败切分重做、校验、部署与真机验证；没有可信的墙钟 ETA。

## 相关路径

- 应用、词映射：`lexio-pwa-full/index.html`
- Service Worker：`lexio-pwa-full/sw.js`
- 词音频清单：`lexio-pwa-full/media/voice/word-audio-manifest.json`
- 语音档案说明：`lexio-pwa-full/media/voice/README.md`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 词队列：`lexio-pwa-full/.tmp-voice/words-unique.json`、`lexio-pwa-full/.tmp-voice/words/word-groups.json`
- 原始合并音频及安全切分报告：`lexio-pwa-full/.tmp-voice/words/next-batch-002/`
- 本轮安全切片暂存目录：`lexio-pwa-full/.tmp-voice/words/aligned-next-batch-002-partial/`
- 根目录音频备份包：`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip`
