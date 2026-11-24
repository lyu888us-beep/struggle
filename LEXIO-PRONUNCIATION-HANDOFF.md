# Lexio 新窗口交接：美国年级词库、voice-00 补录与部署

> **先读本页。** 下方旧批次说明已经重整为当前核对状态；以 Git 中的词库、音频清单和 MP3 为准，不以旧 ZIP 或旧交接计数为准。

## 当前分支与发布

- 仓库：`lyu888us-beep/struggle`。
- 固定分支：`arena/749eb136-struggle`（active；不得切换、改名或推送到别的分支），分支基点 `acf72ed4b80c34f0ec92ef462f02155557fc8fe4`。
- 本轮开始时基线 HEAD 为 `a5b6b17434e4ba2c9f8c0191238281970a6cb300`（Pages run `45407407881` 成功）。本轮应用代码提交 `4826db74764492b2bc0640be210b2e625fbe7f86` 已推送；Pages run `45422436638` **成功**。部署结果随后补记到本交接并单独推送。该部署包含中文释义迁移、美式音标、美国年级 exact-only voice-00 逻辑、测试与审计，**没有新增美国年级 MP3**。后续每次推送后仍用 `gh run list --workflow deploy-lexio-pages.yml --limit 5` 核实部署结果；不能把 Git push 成功当成部署成功。
- 自动部署工作流：`.github/workflows/deploy-lexio-pages.yml`。推送本分支中 `lexio-pwa-full/**` 的改动会触发 GitHub Pages 部署。
- 上次完整测试命令：`cd lexio-pwa-full && npm test`，通过导航、语音、Service Worker 和美国年级语音审计。

## 当前美国 1—9 年级内容与发音状态

- 本机词库共 30,624 条分类记录；美国 1—9 年级共 2,300 条，数量依次 `175 / 175 / 250 / 250 / 250 / 300 / 300 / 300 / 300`。
- 2,300 条卡片 `meaning` 为中文；原英文保存在 `meaningEn`，带 `meaningSource` 与逐词 `wordFieldMigrations`。`BUNDLED_CONTENT_VERSION` 为 `school-grades-2026-11-v10`，测试覆盖旧英文释义精确迁移为中文且保留用户自定义释义。
- 美国年级卡显示美式音标，锁定 `en-US`，英式切换不可用。词头和例句只允许精确文本对应的 voice-00 音频；缺录或播放失败均不回退到设备语音、词典音频或其他词条录音。无词头录音时禁用按钮；无例句录音时不提供可点朗读按钮。
- 当前美国年级音频审计（`node scripts/us-grade-voice-audit.mjs`）：
  - 词头：`1,634 / 2,300` 有精确映射，**666** 个待录。
  - 现有例句：`2 / 1,942` 有精确映射，**1,940** 条待录。
  - 待录队列中未发现可直接恢复的散落精确文件；已映射录音缺失或映射错误为 **0**。
  - `node scripts/us-grade-voice-audit.mjs --pending` 输出精确任务 JSONL（共 2,606 行：666 个词头、1,940 条例句）。不要把“队列覆盖”说成已经录制。
- 全库 `voice-queue.mjs` 当前统计 19,376 条待管理的句例录音文本，17,428 条已有映射、1,948 条待录；其中 1,940 条是美国年级例句。471 个词典短语均有映射。
- 通用词音频的独立清单目前有 9,830 个词头映射（5 个用户确认样音 + 9,825 个生成片段，清单批次 001—010）；这**不等于**美国年级的 666 个待录词头已完成。

## 接手后的首要工作：继续 voice-00 补录并部署

1. 先在当前固定分支检查 `git status` 和 `LEXIO-PRONUNCIATION-HANDOFF.md`，再运行：
   ```bash
   cd lexio-pwa-full
   npm test
   node scripts/us-grade-voice-audit.mjs
   node scripts/us-grade-voice-audit.mjs --pending > /tmp/us-grade-voice-pending.jsonl
   ```
2. 继续生成美国年级缺少的 **666 个词头 + 1,940 条例句**，只用用户此前确认的 `voice-00 / en-US`。必须沿用同一已批准音色，不能试听/换用新音色，不能用设备 TTS、别的声音或错配录音填空。若当前执行环境不能调用原有 voice-00 生成渠道，不要擅自替代；先说明阻塞并请求可用的原渠道。
3. 精确文件名规则：词头为 `w-` + `sha256(trimmed lowercase headword)` 前 16 位；例句为 `s-` + `sha256(trimmed exact example text)` 前 16 位。录音和映射必须逐项与待录 JSONL 的 `text` 精确一致。
4. 音频切片必须按原批次的保守安全边界流程：先对齐，再检查边界并解码；有歧义/不安全就跳过，不能强切，也不能用重新拆分、换声线或改写审核阻止文本来绕过安全审核。自动对齐、文件解码、脚本测试都不等于逐条人耳听检；必须在报告中分别标注。
5. 仅把通过检查的 MP3 加入 `lexio-pwa-full/media/voice/`，并同步更新 `index.html` 精确映射、voice manifest、Service Worker 离线资源清单和相关测试。更新语音审计结果、未完成数及交接文档；运行完整 `npm test`、`git diff --check`，然后只推送当前分支并核实 Pages workflow 成功。部署成功不代表真机试听或逐条人耳审核通过。

## 内容释义与许可限制（不可弱化）

- 释义生成材料：`lexio-pwa-full/scripts/build_us_grade_meanings.py`、`data/us-grade-meaning-overrides.json`、`data/us-grade-chinese-meanings.json`；2,300 条原始词包在 `data/original-site-wordbank.json`。
- ECDICT 候选来自固定仓库提交 `39cfb9672c0906b63569e0453c2e6abfb9ab182a`，CSV SHA-256 `d1ecbdf9ee2b920afb6f430ca6b6bb9f559588cf0dff86e04bd255f9390843cc`。上游仓库的 MIT LICENSE 文本已与该固定版本核对，但其仓库级 MIT 声明**不能证明混合来源底层数据逐项均可再分发**。
- 词典候选覆盖率、字符检查、词性匹配和 72 条定向人工覆盖都不代表 2,300 条译义完成逐条语义审校；在完成审校和许可核验前，不要宣称词条数据已完成完整语义审校或底层数据许可已完全厘清。

## 现有语音资产与历史注意事项

- 生产源文件以 `lexio-pwa-full/media/voice/`、`media/voice/word-audio-manifest.json`、`media/voice/sentence-audio-manifest.json` 和 HTML 精确映射为准。当前生产目录约 28,373 个 MP3；这些音频不是本轮生成。
- 根目录 `LEXIO-PRONUNCIATION-BUNDLE-2026-11.zip` 是旧归档快照（约 56.9 MB、7,919 个 MP3），不包含当前生产目录的全部资产；不要据此判断当前录音覆盖率，也不要无必要地重打包/推送这个大 ZIP。
- `.tmp-voice/` 是忽略/本机暂存目录；里面即使有原始 WAV、切片或报告，也不能默认已提交或已部署。先与 Git 中 manifest、HTML 映射及生产 MP3 逐项核验。批次 008 的 1,240 个安全词音频已经出现在当前 9,830 词头映射中，不要重复发布。
- 根目录 `VOICE-00-WORD-REVIEW.mp3` 是已确认音色的试听样本，不是任何词条的生产录音；不要加入应用音频清单或提交。
- 批次 001—010 的通用词音频曾按 voice-00/en-US 生成；旧交接中的“批次 008 待生成”“7,441 已映射”等数字已过时，以当前 manifest 与本页美国年级语音审计计数为准。
- iPhone 16 Pro Max／iOS 27 真机回归仍未确认；模拟浏览器测试不能当作真机测试。

## 相关路径

- 应用：`lexio-pwa-full/index.html`
- Service Worker：`lexio-pwa-full/sw.js`
- 美国年级词库：`lexio-pwa-full/data/original-site-wordbank.json`
- 释义脚本/覆盖：`lexio-pwa-full/scripts/build_us_grade_meanings.py`、`lexio-pwa-full/data/us-grade-meaning-overrides.json`
- 美国年级音频审计/通用队列：`lexio-pwa-full/scripts/us-grade-voice-audit.mjs`、`lexio-pwa-full/scripts/voice-queue.mjs`
- 语音 manifest：`lexio-pwa-full/media/voice/word-audio-manifest.json`、`sentence-audio-manifest.json`
- 测试：`lexio-pwa-full/test/nav.test.js`、`speech.test.js`、`sw.test.js`
- Pages workflow：`.github/workflows/deploy-lexio-pages.yml`
