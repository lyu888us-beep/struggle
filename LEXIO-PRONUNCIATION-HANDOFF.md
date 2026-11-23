# Lexio 发音补录与发布交接

> 给后续对话窗口继续使用。新声音已获用户确认，不要重复试听音色候选，也不要重新生成已存在的录音。

## 当前分支与交接文件

- 仓库：`lyu888us-beep/struggle`
- 固定工作分支：`arena/749eb136-struggle`（active；不得切换或改名）
- 分支基点：`acf72ed4b80c34f0ec92ef462f02155557fc8fe4`
- 交接文档初次提交 `908e5a7`；真实音频包曾在 `a6c5100` 先行上传到 GitHub 根目录。
- 先前 480 个资源已在 `839c59d` 集成、推送并由 Pages run `45171863549` 成功部署。
- 本轮新增的 10 个单词 clip 使用同一 voice-00 生成并通过 PocketSphinx 对齐，已在 `4ad9b4f` 集成并推送；Pages run `45173204698` 的打包和部署两个 job 均成功。此前 480 个资源没有重生成。
- 最近两次 Pages run 均只有 GitHub Actions Node.js 20 弃用提示，不影响部署。
- 根目录 `LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 本轮已更新为 490 个音频及清单备份；不包含源码补丁，也不在 Pages 网站目录中。干净 clone 可直接从当前分支读取应用代码和 `media/voice/` 中的已跟踪 MP3。
- `.github/workflows/deploy-lexio-pages.yml` 对 `lexio-pwa-full/**` 的 push 会触发 Pages 部署；仅提交根目录文档或 ZIP 不会触发部署。

## 用户约束

- 所有新录音沿用用户已试听认可的 **`voice-00` / `en-US`**；不要增加新音色候选或改用 `voice-01`、`voice-02`。
- iPhone 目标设备为 iPhone 16 Pro Max、iOS 27。程序测试和自动对齐不能替代真机测试，也不能替代逐条人工听检。
- 不得把 PocketSphinx 对齐或 FFmpeg 解码说成人工听检；不得把未生成的词库队列说成已生成音频。
- 被内容审核阻止的短语继续排除，不得改音色或绕过审核。
- 用户要求生成后立即部署；五个已确认单词样音在 `839c59d` 部署，本轮新增十词已随 `4ad9b4f` 部署。9,830 个唯一词条队列中目前仅 15 个有本地单词 MP3（五个已确认样音 + 十个新批次），并未生成完整词库。

## 已集成的音频与代码

### 短语和改写例句

- 缺录短语共 473 条：472 条可处理，另 1 条仍因内容审核被排除。
- 已导入 **472 个 `voice-00` / `en-US` 短语 MP3**：先前的 173 条加本轮的 299 条；两组文本没有重叠。对应 `selectedRecordings` 映射和本地 MP3 位于 `lexio-pwa-full/media/voice/`。
- 三条精确改写例句 MP3 已通过 PocketSphinx 文本对齐，按精确文本 SHA-256 ID 加入映射：
  - `Take a slow breath before you begin speaking.`
  - `Let's count by tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, and one hundred.`
  - `In the Ohmic contacts of LED electrodes, carriers have different transmission mechanisms between a metal electrode and a semiconductor.`
- 例句迁移有 731 条记录、501 种目标文本。已移除 501 个目标文本复用旧音频的错误映射；只为上述 3 个准确音频加回映射，其余 498 个目标无匹配录音时继续显示待配音，不播放旧音频。

### 单词样音

- 用户已试听认可的 5 个样音：`comfortable`、`rural`、`schedule`、`entrepreneur`、`thorough`。
- 已生成并部署的十个队列单词：`persevere`、`deliberate`、`subtle`、`resilient`、`comprehensive`、`ambitious`、`contribute`、`essential`、`accessible`、`significant`。使用 `voice-00`／`en-US` 逐词生成，PocketSphinx 自动对齐成功；尚未逐条人工听检。
- 接下来按队列顺序待生成十词为：`absorb`、`accomplish`、`acknowledge`、`adapt`、`appreciate`、`assume`、`curiosity`、`distinguish`、`estimate`、`potential`。本回合的生成请求因达到 10 段上限而未产出音频；待后续回合使用同一 `voice-00`／`en-US` 生成。
- 这 15 个单词已加入 `selectedWordRecordings`，随 `4ad9b4f` 部署；其美音 `en-US` 入口播放本地 MP3，英音及其他词的路线不变。
- `.tmp-voice/words-unique.json` 和 `word-groups.json` 的 9,830 项只是生成队列／元数据；只有上述 15 个单词现有实际 MP3，不能称全库已生成。

### 数量与离线资源

- 本轮累计新增生产音频 **490 个 MP3**（472 短语 + 3 条精确改写例句 + 5 个已确认样音 + 10 个新队列单词），共 7,925,168 字节；原有 17,569 个文件，当前工作区合计 18,059 个 MP3。
- Service Worker 离线资源已加入本批十个新 clip，缓存版本升至 `lexio-shell-v116-word-audio-batch-001`。
- `LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 内含相同的 490 个发布音频、472 条短语映射、15 个单词映射、3 条目标句映射及原始目标句录音备份。

## 检查与听检边界

- **程序检查已通过：**`npm test`（导航、迁移、15 个单词映射、离线清单及媒体范围请求），`node --check sw.js`，`git diff --check`，切音脚本 `py_compile`。
- **音频帧检查已通过：**FFmpeg 成功解码累计新增 490/490 个 MP3；472 个短语自动对齐／切片、3 条精确改写句及本批 10 个单词自动文本对齐成功。这些仍属于程序检查。
- **人工听检：**用户只确认过五个单词样音的声音正确；本批 10 个单词、472 个短语、3 条精确改写句和原有全库录音未逐条人工听检。
- **真机复测：**iPhone 16 Pro Max／iOS 27 尚未完成。

## 接下来

1. 后续新增录音仍沿用 `voice-00 / en-US`，不得重生成已存在的音频。
2. 安排 iPhone 16 Pro Max／iOS 27 实测，检查离线短语、例句、15 个本地单词音频、英式单词及普通美音回退。只有前五个样音经过用户听检确认；其余录音未逐条人工听检。
3. 继续处理剩余 498 条改写句的正确录音、9,830 个唯一单词音频生成队列及其他读音入口；不得将待生成元数据计作已生成文件，也不得声称已完成全库听检。

## 相关文件

- 应用与映射：`lexio-pwa-full/index.html`
- 词库及 731 条例句迁移：`lexio-pwa-full/data/original-site-wordbank.json`
- 离线资源：`lexio-pwa-full/sw.js`
- 语音资产说明：`lexio-pwa-full/media/voice/README.md`
- 测试：`lexio-pwa-full/test/nav.test.js`、`lexio-pwa-full/test/speech.test.js`
- 切音／对齐程序：`lexio-pwa-full/scripts/cut-voice-batch.py`
- 可选音频备份包（根目录）：`LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip`
