# 待确认重写清单（v91 之后）

统计口径：全库 17,574 句，已录 16,890，待录 684。
其中 568 条命中历史排除清单、81 条为真实敏感内容，不再讨论。
下面 8 条是**语义可辨、只差一处修补**的条目，需要你确认改动方式后才会录。

| # | 词卡来源 | 原文 | 建议朗读版 | 改动性质 | 建议 |
|---|---|---|---|---|---|
| 1 | cet4:nasty | I went to school with him e_SEnD he was nasty then and he’s nasty now. | I went to school with him. He was nasty then and he's nasty now. | `e_SEnD` 是丢失的断句标记，拆成两句 | 录 |
| 2 | ielts:endow | The ambassador has endowed a $1 million public-service fellowships programme. | The ambassador has endowed a one million dollar public-service fellowships programme. | 金额口头化 + `dollars`→`dollar` 单复数 | 录 |
| 3 | ielts:aggregate | (= as a group or in total), women outlive men by 7 or more years. | As a group, women outlive men by seven or more years. | 括号释义升格为主句 | 录（会改变句首结构） |
| 4 | ielts:freudian | The n&a is important in this discussion. | The letters n and a are important in this discussion. | `n&a` 展开为字母组合 | 录（原句语法不通） |
| 5 | pep-4-2:PE class | I have a PE class on this Tuesday. | I have a PE class this Tuesday. | 去掉多余 `on` | 录 |
| 6 | pep-9-1:Thomas Watson | ”, or Thomas Watson of IBM declaring in 1943, “I think there is a world market for maybe five computers.” | Thomas Watson of IBM declared in nineteen forty three, I think there is a world market for maybe five computers. | 去掉残缺引号头 + `declaring`→`declared` | 录 |
| 7 | gaokao:tap | (= water that comes out of a tap) is usually heavily treated with chemicals. | Water that comes out of a tap is usually heavily treated with chemicals. | 括号释义升格为主语 | 录（会改变句首结构） |
| 8 | ielts:trespass | Stephen Leckar has 30 minutes to represent Jones, …（约 330 字符的法庭陈述） | 同原文，仅 `30`→thirty，补人名音素 `L EH K ER` | 纯数字口头化 | 录（句子很长） |

## 明确建议放弃（不要录）

| 词卡来源 | 原文 | 原因 |
|---|---|---|
| cet6:odds | (= it is likely) that he will commit the same crime again. | 主句缺失，残缺 |
| gaokao:revision | Date of last revision of this page: 2010-11-03 | 网页模板残留 |
| kaoyan:appliance | NOTE The supply cord may be specially prepared… | 说明书片段，非例句 |
| kaoyan:boycott / kaoyan:fore | She wrote a note about the /. / Everyone said the room was /. | `/` 替换后主语丢失 |
| pep-7-2:turn right/left | Go down this street/road until you reach the 1st/2nd/… traffic lights… | 对话模板拼接，无法成句 |
| cet6:differentiation | Excuse me each other a debate on the web… | 机翻病句，无法还原原意 |
| ielts:invigilate | Different is, the exam in the life often does not have person invigilate. | 机翻病句 |
| gaokao:emperor | I am napoleon, I am emperor… burned it! | 机翻病句 |
| gaokao:keyboard | The Swiss keyboard doesn't have a ß. | 单个变音字母，无法朗读 |
| cet6:province / gaokao:legend | Taoism… / Garden of Eden… | 宗教内容，按既有标准排除 |
| pep-9-1:regret | I regret some of my posts about President @realDonaldTrump… | 政治人物；`@` 无法朗读 |
| pep-5-2:RSVP | RSVP opened a session (2) with QFS. | 缩写串，语义不明 |
| cet6:craft / cet6:cocaine / kaoyan:kidnap / ielts:plastic | … | 军火、毒品、绑架、弃婴等内容 |
| pep-8-1:be up to | For the nursling of plantlets, the soil of the rotten leaves was the best materials… | 农业机翻，`materials` 数不一致 |
| kaoyan:millimeter | It used materials is 0.4 millimeter stainless steel spring steel of powder coatings. | 机翻病句 |
| pep-4-1:schoolbag | He schoolbag are cheap and nice. | 机翻病句 |
| ielts:proterozoic | The word proterozoic appears in this sentence. | 元语言学模板句 |
| pep-7-1:How about…? | Er…How about some tea? | 已在 v91 录成 "Er, how about some tea?" |
