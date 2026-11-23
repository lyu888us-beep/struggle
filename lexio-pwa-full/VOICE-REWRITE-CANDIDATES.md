> **当前状态更新（2026-11-23）：**下文各批次“已录”是历史生成记录。完整性复核发现 501 个改写目标曾复用旧音频；现只为 3 条已对齐精确目标保留录音，其余 498 条在应用中保持待配音。不要将下文历史批次标签解释为这 498 条已有正确音频。

# 待确认重写清单（v92 后：8 条已全部录制）

统计口径：全库 17,574 句，已录 16,898，待录 676。
其中 568 条命中历史排除清单、81 条为真实敏感内容，不再讨论。
下面 8 条已经用户确认「全部录」，于 v92 / 词卡 63 录制上线。

| # | 词卡来源 | 原文 | 建议朗读版 | 改动性质 | 状态 |
|---|---|---|---|---|---|
| 1 | cet4:nasty | I went to school with him e_SEnD he was nasty then and he’s nasty now. | I went to school with him. He was nasty then and he's nasty now. | `e_SEnD` 是丢失的断句标记，拆成两句 | ✅ 已录 v92 |
| 2 | ielts:endow | The ambassador has endowed a $1 million public-service fellowships programme. | The ambassador has endowed a one million dollar public-service fellowships programme. | 金额口头化 + `dollars`→`dollar` 单复数 | ✅ 已录 v92 |
| 3 | ielts:aggregate | (= as a group or in total), women outlive men by 7 or more years. | As a group, women outlive men by seven or more years. | 括号释义升格为主句 | ✅ 已录 v92 |
| 4 | ielts:freudian | The n&a is important in this discussion. | The letters n and a are important in this discussion. | `n&a` 展开为字母组合 | ✅ 已录 v92 |
| 5 | pep-4-2:PE class | I have a PE class on this Tuesday. | I have a PE class this Tuesday. | 去掉多余 `on` | ✅ 已录 v92 |
| 6 | pep-9-1:Thomas Watson | ”, or Thomas Watson of IBM declaring in 1943, “I think there is a world market for maybe five computers.” | Thomas Watson of IBM declared in nineteen forty three, I think there is a world market for maybe five computers. | 去掉残缺引号头 + `declaring`→`declared` | ✅ 已录 v92 |
| 7 | gaokao:tap | (= water that comes out of a tap) is usually heavily treated with chemicals. | Water that comes out of a tap is usually heavily treated with chemicals. | 括号释义升格为主语 | ✅ 已录 v92 |
| 8 | ielts:trespass | Stephen Leckar has 30 minutes to represent Jones, …（约 330 字符的法庭陈述） | 同原文，仅 `30`→thirty，补人名音素 `L EH K ER` | 纯数字口头化 | ✅ 已录 v92 |

## 先前明确建议放弃（状态更新见下）

> **v109 状态更新：** 用户在 v108 后指示“继续”，此前待录的 11 条现已于 v109 中性改写并录制，逐条对照见“第十四批”。下表保留原先的排除理由作为历史记录；其余项目的状态不因本次更新改变。

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

---

# 第二批待改写（v95 后，第 1–40 条）

这批是「疑似机翻」桶里**只剩语法/拼写缺陷**的句子，改法与原文一一对应。确认后我按批录制。

| # | 原文 | 建议朗读版 | 缺陷 |
|---|---|---|---|
| 1 | Tom is teaching me to how to sail | Tom is teaching me how to sail. | 多 `to` |
| 2 | Ten movies are elected every year | Ten movies are released every year. | 动词误用（elect→release） |
| 3 | My lunch was an apple and pears and pomegranate | My lunch was an apple, a pear, and a pomegranate. | 冠词/单复数 |
| 4 | He is on goods terms with all of his classmates | He is on good terms with all of his classmates. | `goods`→`good` |
| 5 | My wife's underwear is all old, I want to buy her some new ones online | My wife's underwear is all old; I want to buy her some new ones online. | 逗号粘连 |
| 6 | The use of mosquito lure female mosquitoes. | The use of a mosquito lure attracts female mosquitoes. | 缺谓语 |
| 7 | I like dolphin. | I like dolphins. | 单复数 |
| 8 | I ordered a sesame seed buns for the veggie burgers | I ordered sesame seed buns for the veggie burgers. | 冠词多余 |
| 9 | Nothing lasts forever, not for a long time, anyone can find an excuse to go ahead | Nothing lasts forever; anyone can find an excuse to move on. | 语义打结 |
| 10 | The train had already left when we got to station | The train had already left when we got to the station. | 缺冠词 |
| 11 | Thus I tell you don't just go alone | So I tell you, don't go alone. | 连接词 |
| 12 | Analysts content that the stock market is due for a technical rally | Analysts contend that the stock market is due for a technical rally. | `content`→`contend` |
| 13 | She moistenend the soil round the plant. | She moistened the soil around the plant. | 拼写 |
| 14 | I to the kindergarten at the age of three. | I went to kindergarten at the age of three. | 缺动词 |
| 15 | We brunch in Sundays | We brunch on Sundays. | 介词 |
| 16 | Either as a waiter at a restaurant or a bartender, both are OK | Either a waiter at a restaurant or a bartender is fine. | 句法 |
| 17 | Because I want to be a translator | I study English because I want to be a translator. | 残句补全 |
| 18 | I talked to him on the telephone yesterday night | I talked to him on the telephone last night. | 时间状语 |
| 19 | What do you have the first period? | What do you have first period? | 多 `the` |
| 20 | The governor also expressed concerned over the deteriorating standard of education in the country. | The governor also expressed concern over the deteriorating standard of education in the country. | `concerned`→`concern` |
| 21 | We require the agency in our market for your precision apparatus. | We require an agent in our market for your precision apparatus. | `agency`→`agent` |
| 22 | Here you should use plural pronoun. | Here you should use a plural pronoun. | 缺冠词 |
| 23 | She rented a flat close the to the city centre | She rented a flat close to the city centre. | 词序 |
| 24 | Although the production of electric fans was reduced in February, it still beats January | Although production of electric fans fell in February, it still beat January. | 时态 |
| 25 | The owner of this house has two twins | The owner of this house has twins. | 冗余数词 |
| 26 | It is presently very difficult to calm down and treat oneself with a book | It is hard to calm down and treat oneself to a book these days. | 搭配 |
| 27 | Every nation should help each other | Every nation should help the others. | 搭配 |
| 28 | I hope to graduate at the exams. | I hope to graduate with good exam results. | 介词 |
| 29 | Coldness sometimes don't mean apathy. It's just a tool to avoid being hurt | Coldness sometimes doesn't mean apathy. It's just a tool to avoid being hurt. | 主谓一致 |
| 30 | In Netherlands you can see windmills wherever you go | In the Netherlands you can see windmills wherever you go. | 缺冠词 |
| 31 | There something undeniably soulful about the eerie whine of the highland bagpipes. | There is something undeniably soulful about the eerie whine of the Highland bagpipes. | 缺系动词 |
| 32 | The apprentice lingered his work. | The apprentice lingered over his work. | 缺介词 |
| 33 | Inside, it's very hot, but outside its freezing | Inside, it's very hot, but outside it's freezing. | `its`→`it's` |
| 34 | Common units of volume are cubic centimeter. | Common units of volume are the cubic centimetre and the litre. | 单复数 |
| 35 | English stills bears the imprint of the Norman invasion | English still bears the imprint of the Norman invasion. | `stills`→`still` |
| 36 | Mathematics are the foundation of all sciences | Mathematics is the foundation of all sciences. | 主谓一致 |
| 37 | An hexagon has six sides | A hexagon has six sides. | `An`→`A` |
| 38 | The gas station just neighbours to the motel. | The gas station is right next to the motel. | 搭配 |
| 39 | She fell of her horse | She fell off her horse. | `of`→`off` |
| 40 | You have done it totally incorrect! | You have done it totally incorrectly! | 副词形式 |

**建议放弃（语义已不可复原）**：`When chickens pancake-shape maintain, the tractor must have won again`、`She was really of the cold frog.`、`Creating creativity itself is improving creativity`、`Steam is water is the gaseous state`、`Since namely namely misconceive, that explanation clear nice.`、`Different is, the exam in the life often does not have person invigilate.`

---

# 第三批改写（v97 已录，40 条）

语义断裂、按词卡目标词重建的句子（已按用户「允许重写」确认执行）：

| 原文 | 朗读版 | 保留目标词 |
|---|---|---|
| Creating creativity itself is improving creativity | Creating something creative yourself is a way of improving your creativity. | creativity |
| I've noticed that having fun doesn't interfere at all with your studies. I just can't | I've noticed that having fun doesn't interfere at all with your studies. | interfere |
| This person's worldview is officially unhealthy | This person's worldview is rather unhealthy. | worldview |
| The turkeys in my grandfather's farm are very noisy, I can't wait for them to get eaten | The turkeys on my grandfather's farm are very noisy. | turkey |
| A woman is ever fickle and changeable | Public opinion is fickle and changeable. | fickle |
| Mother-in-law and daughter-in-law are a tempest and hailstorm | Their argument was a tempest in a teapot. | tempest |
| She is your indispensable oxygen, carbon dioxide is not essential you me. | She is indispensable to your team. | indispensable |
| Lines AB and CD are parallel. AB | Lines A B and C D are parallel. | parallel |
| In the Ohmic contacts of LED electrodes, carriers have different transmission mechanisms be- tween metal electrode and semiconductor. | 同句，修复断词 `between`、补冠词 | ohmic |
| In the wagon. | The children were sitting in the wagon. | wagon |
| The interaction between user and expert system arising from the expert system 's use. | The interaction between the user and the expert system arises from the expert system's use. | interaction |
| There isa certain logicin their choice of architect. | There is a certain logic in their choice of architect. | logic |
| Because we need to give profit to the capital, otherwise we get no capital. | Because we need to give a return to capital; otherwise we get no capital. | capital |
| Before welcoming a beautiful tomorrow, every rich man will ensure that he gets sufficient rest! | Everyone needs sufficient rest before a big day. | sufficient |
| He is fantasizing the ideal wife | He is fantasizing about the ideal wife. | fantasize |
| Steam is water is the gaseous state | Steam is water in the gaseous state. | gaseous |
| When there is no tigers in mountains, the monkey becomes the king | When there are no tigers in the mountains, the monkey becomes the king. | tiger |
| She knelt down, hands on the thighs, breathe in the smell of sulfur. | She knelt down, hands on her thighs, breathing in the smell of sulfur. | kneel |
| His body type is born balanced! Wide shoulders, slim waist, belly not popping outwards | He is naturally well built: wide shoulders, slim waist, no belly. | waist |
| Objective To observe the disinfection effect of gastroscope by ozone water. | Objective: to observe the disinfection effect of ozone water on the gastroscope. | disinfection |
| Dairy source of protein and calcium. | Dairy is a source of protein and calcium. | dairy |
| Ideological application of a theory | The ideological application of a theory is always risky. | ideological |
| Was immensely more important to the project as a scientist than as an administrator | She was immensely more important to the project as a scientist than as an administrator. | immensely |
| An acutely debilitating virus | An acutely debilitating virus swept through the camp. | debilitating |
| The abolition of capital punishment | The abolition of capital punishment took years. | abolition |
| Irreversible momentum toward revolution | The reforms gained irreversible momentum. | irreversible |
| Interested tapered off | Interest in the project tapered off. | taper |
| The boy fell of fright when he saw a ghost | The boy fell down in fright when he saw a ghost. | fright |
| I'm only reading the scraps on news on the Internet, but, well, I get the general picture | I'm only reading scraps of news on the Internet, but I get the general picture. | scraps |
| She seems to devote all her effects to her career. | She seems to devote all her efforts to her career. | devote |
| Entry of pool is prohibited | Entry to the pool is prohibited. | entry |
| Men are portly and women are stout | The men are portly and the women are stout. | portly |
| These are all languages of the Altaic language family group | These are all languages of the Altaic family. | Altaic |
| Asked for a collar on program trading in the stock market | He asked for a collar on program trading in the stock market. | collar |
| The United States are a republic | The United States is a republic. | republic |
| The fort flanked on a swamp. | The fort flanked a swamp. | flank |
| These students work hard, but it's not that much efficient. | These students work hard, but they are not that efficient. | efficient |
| Want to be an assistant judge or notary. | I want to be an assistant judge or a notary. | notary |
| I can't remember when was the last time I've seen him smile | I can't remember the last time I saw him smile. | remember |
| An igneous desert atmosphere | The igneous rock was hard and dark. | igneous |

## 第四批：模板/说明片段自动改写（v98 已录）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| The word monkey-pox appears in this sentence. | The monkey-pox virus spreads through close contact. | monkey-pox |
| The word cretaceous appears in this sentence. | The cretaceous period ended with a giant asteroid impact. | cretaceous |
| They used northwest in the sentence. | The wind blew from the northwest all night long. | northwest |
| Please read goodby in context. | He waved goodby as the train pulled away. | goodby |
| They used mesozoic in the sentence. | The mesozoic era is known as the age of reptiles. | mesozoic |
| Please read northwest in context. | The northwest region is famous for its deep forests. | northwest |
| The word martian appears in this sentence. | The martian landscape looks red and dusty. | martian |
| Please read roost in context. | The chickens roost on the fence at night. | roost |
| The word capillary appears in this sentence. | Blood flows through tiny capillary vessels. | capillary |
| They used peruvian in the sentence. | Peruvian food is famous for its fresh ceviche. | peruvian |
| NOTE The supply cord may be specially prepared and only available from the manufacturer or its service agent. A specially prepared cord may include a part of the appliance. | The supply cord for this appliance may only be replaced by the manufacturer. | appliance |
| give them an airing. | The committee gave the proposal an airing. | airing |
| Well, we know nitrogen has what? | Nitrogen makes up most of the air we breathe. | nitrogen |
| She wrote a note about the /. | She wrote a note about the boycott. | boycott |
| They used life-saving in the sentence. | This life-saving device can rescue people from floods. | life-saving |
| They used pleistocene in the sentence. | Many pleistocene animals disappeared during the ice age. | pleistocene |
| The word mesozoic appears in this sentence. | Dinosaurs lived during the mesozoic era. | mesozoic |
| Please read cretaceous in context. | Fossils from the cretaceous period are found in this valley. | cretaceous |
| The word egyptian appears in this sentence. | The egyptian pyramids were built thousands of years ago. | egyptian |
| Please read mesozoic in context. | Mesozoic fossils were discovered near the river bank. | mesozoic |
| The word ruminant appears in this sentence. | A cow is a ruminant animal that chews its food twice. | ruminant |
| Please read caledonian in context. | The caledonian forest is home to many rare birds. | caledonian |
| Please read cuneiform in context. | Cuneiform writing was used in ancient Mesopotamia. | cuneiform |
| Please read trance in context. | The DJ played a trance beat all night long. | trance |
| In order to see and use this exciting feature, you will need to open and clear out all your existing unopened Mystery Boxes. | Please clear out the old boxes from the storage room. | clear out |
| So if we just sketch that. | Let me sketch that picture on the paper. | sketch |
| (= it is likely) that he will commit the same crime again. | The odds are that he will commit the same crime again. | odds |
| Everyone said the room was /. | The golfer shouted fore before he swung his club. | fore |
| They used washing-machine in the sentence. | She put the dirty clothes into the washing machine. | washing-machine |
| The word southeast appears in this sentence. | The storm is moving toward the southeast coast. | southeast |
| Please read molt in context. | The snake will molt its skin in the spring. | molt |
| The word pleistocene appears in this sentence. | The pleistocene epoch lasted until about twelve thousand years ago. | pleistocene |
| They used southeast in the sentence. | They live in the southeast part of the country. | southeast |
| They used invertebrate in the sentence. | An octopus is a smart invertebrate animal. | invertebrate |
| The word proterozoic appears in this sentence. | The proterozoic eon lasted for billions of years. | proterozoic |
| The word northeast appears in this sentence. | The northeast coast has very cold winters. | northeast |
| Please read broadway in context. | We watched a musical on broadway last night. | broadway |
| Date of last revision of this page: 2010-11-03 | The date of the last revision of this page is November third. | revision |
| With the compliments of J. Smith & Son. J. | He paid her a compliment on her new dress. | compliment |
| RSVP opened a session (2) with QFS. | Please RSVP to the invitation by Friday. | RSVP |
| {"COLLOINEXA":["sexual repression"]} | The people lived under political repression for many years. | repression |
| I am writing to confirm /enquire/inform you… | I am writing to enquire about the meeting time. | enquire |


## 第五批：敏感内容自动改写（v99 已录）

从敏感内容队列中选取 40 条，将原句改写为非露骨、语境中性的英语例句，并保留词卡目标词（必要时使用自然屈折形式）。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| I'm not gay, but I like to masturbate with other males | He is gay and proud of his partner. | gay |
| Life is a sexually transmitted terminal disease. | The doctor said the illness was terminal. | terminal |
| She likes wearing boxer briefs, she doesn't like briefs, and also doesn't like thongs | He put on his boxer shorts before bed. | boxer |
| I want to pluck your facial hair | She plucked a few strands of facial hair. | facial |
| The film reinforces the idea that women should be pretty and dumb. | The teacher reinforced the lesson with a quiz. | reinforce |
| Femdom is short for Female Domination | The old empire's domination lasted for centuries. | domination |
| I don't like using dildos, I prefer real cocks | The cock crowed at dawn in the farmyard. | cock |
| Life is a fatal sexually transmitted disease. | The accident was fatal for the driver. | fatal |
| She had been raped and stabbed. | Rape is a serious crime punished by the law. | rape |
| I've got a big cock! | The cock strutted around the farmyard. | cock |
| I am reaching the climax | We are reaching the top of the hill. | reach |
| My boss tried to cop a feel but I slapped his hand before he got any further. | The cop wrote down the details of the accident. | cop |
| Shove a stick up your ass | He is as brave as a lion. | as |
| In Amsterdam the girls all stand in the windows shimmering as tantalising as tropical fish beyond the gleam of aquarium glass. | We watched the tropical fish swimming in the aquarium. | aquarium |
| Tell your sister her thong is showing | Show your sister the photos from the trip. | show |
| Every dumbass with a camera thinks he is a photographer | My sister works as a professional photographer. | photographer |
| The "drop the T" movement was started by a guy who now identifies as ex-gay | The movement started in a small town and grew quickly. | movement |
| It meant that I, a humble Negro girl, had just as much chance as anybody in the sight and love of God. | The term Negro appears in some older books, but it is now considered outdated. | negro |
| What is oral sex? | What is oral hygiene? | oral |
| The extracurricular activities of a philandering husband | She joined many extracurricular activities at school. | extracurricular |
| Your see-through dress really excites me | The good news excites me a lot. | excite |
| We know the rapist stalks his victims at night. | A leopard stalked its prey in the dark. | stalk |
| There is no greater insult to life than premature ejaculation. | Premature birth can pose serious health risks. | premature |
| However, it seems that just because it's a 'low risk day' doesn't mean that you won't get pregnant from intravaginal ejaculation. | She did not know she was pregnant until the test. | pregnant |
| "What's the difference between erotic and kinky?" "Erotic is when you use a feather and kinky is when you use a whole chicken." | A soft feather landed on the table. | feather |
| She was wearing pink panties under the skirt | She was wearing a pink jacket under the coat. | pink |
| Even if we don't get lucky on the first try we can just keep fucking till I get pregnant. | She visited the clinic after learning she was pregnant. | pregnant |
| I don't give a rat's ass | He is as strong as an ox. | as |
| She doesn't like oral sex. | The dentist gave her a thorough oral examination. | oral |
| I like it when you talk dirty to me! | I like it when you talk to me about your day. | like |
| That's not what I mean. Sex discrimination, female discrimination, whatever, men and women are just different. | The law protects people from discrimination at work. | discrimination |
| Tom has a tiny dick | Tom has a tiny desk in his room. | tiny |
| She's got a nice ass | She is as tall as her brother. | as |
| He is really a queer fellow! | He is really a quiet fellow. | fellow |
| If so, this would add to a growing list of physiological and biological markers of sexual orientation. | The doctor studied the physiological effects of exercise. | physiological |
| Erectile dysfunction | The doctor explained the cause of the heart dysfunction. | dysfunction |
| Please take off all your clothes except your underpants and bra | Everyone left the room except the teacher. | except |
| Sami had Layla perform oral sex on him. | Sami asked Layla to give an oral report. | oral |
| Tatoeba: Where debates are hotter than two rabbits making babies in a sock! | The baby rabbit slept in its nest. | baby |
| Claudio had long hair and smoked pot | Claudio had long hair and smoked cigarettes. | smoke |


## 第六批：敏感内容自动改写（v100 已录）

从剩余内容中选取 40 条涉及暴力、成瘾、歧视、自伤等敏感语境的例句，改写为日常、非露骨或支持性表述，并保留词卡目标词（必要时使用自然屈折形式）。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| That was the only way we could defend ourselves against all this terrible shooting | The photographer was shooting portraits outdoors. | shooting |
| Many children die of starvation in Africa | Local aid workers distribute food to prevent starvation. | starvation |
| One morning I shot an elephant in my pyjamas | The elephant splashed water with its trunk. | elephant |
| Belladonna and red arsenic are deadly poisons. | The guide showed us how to recognize poison ivy. | poison |
| That fateful meeting of the U.N. when...it declared war on North Korea | That fateful choice changed the story's direction. | fateful |
| Men are hunters, and women are prey | A hunter quietly observed the deer from a trail. | hunter |
| 13 people were summarily executed (= killed without any trial or legal process) by the guerrillas. | The computer will execute the command after confirmation. | execute |
| An awful lot of people (= a large number of people) died in the war. | An awful lot of people enjoy the summer festival. | awful |
| More people commit suicide at Christmas than at any other time. | Suicide prevention services offer confidential support to people in crisis. | suicide |
| Over 500 people died during last year’s flu epidemic. | The town prepared early for the annual flu epidemic. | epidemic |
| Interracial conflict | The school hosted a discussion about interracial families. | interracial |
| Maybe he thought you were gay | He is gay and proud to be himself. | gay |
| After careful examination, it can be seen that the skull was smashed to pieces | She broke the chocolate bar into small pieces. | piece |
| He narrowly escaped an assassination attempt (= when someone tries but fails to kill someone else). | The historical novel explores a failed assassination attempt. | assassination |
| Many criminals in the United States are addicted to drugs | He is addicted to solving crossword puzzles. | addicted |
| A true German can't stand the French, yet willingly he drinks their wines | The restaurant offers a selection of local wines. | wine |
| I cannot forbid a person to marry several wives, for it does not contradict Scripture | Several students volunteered to help after class. | several |
| They are all cannibals here, except me, I'm just being eaten | Everyone except the teacher brought a notebook. | except |
| The warmongers kept up their drumbeat on Iraq | A steady drumbeat guided the dancers. | drumbeat |
| 250 people were killed in the blast. | The fireworks ended with a bright blast of color. | blast |
| Wonderful, marvelous. Police always are servants of upper caste, money, politicians. You cant expect justice for dalits in this country. | The sunrise over the mountains was marvelous. | marvelous |
| Murrow’s evidence was enough to convict Hayes of murder. | The scientist presented clear evidence for her conclusion. | evidence |
| Hundreds and thousands of africans are thrown into gaol each year under pass laws. | The character in the novel spent one night in gaol. | gaol |
| The poor murdered girl must be revenged. | She decided that forgiveness was better than revenge. | revenge |
| I am really tired of living | Living near the coast has always been her dream. | living |
| Guns can be life-savers when used properly | The museum displayed an antique gun from the nineteenth century. | gun |
| Don't shoot the devil in the back. You might miss | The photographer plans to shoot portraits outdoors. | shoot |
| My father died of a subarachnoid hemorrhage when I was fourteen | She was fourteen when she joined the school orchestra. | fourteen |
| Your random firing will scare away the prey | They sat around the fire and told stories. | fire |
| Tom's not breathing | Take a slow breath before you begin speaking. | breath |
| Two people were killed in a head-on collision (= between two vehicles that are moving directly towards each other) on highway 218. | The report described a minor collision in a parking lot. | collision |
| I always keep my gun handy just in case. | Keep a flashlight handy during a storm. | handy |
| The bullet lodged in the sergeant's leg, shattering his thigh bone. | A popcorn kernel lodged between the couch cushions. | lodge |
| Years of resistance to misfortune ended when the settlers' village was overcome by the savages and their hopes and lives came to the bitter end. | The hikers faced resistance from strong winds. | resistance |
| They shot him at point blank range with an automatic rifle. | The museum displayed an antique rifle behind glass. | rifle |
| She has gone from being a healthy, fit, and sporty young woman to being a cripple. | Heavy traffic can cripple the city's public transit system. | cripple |
| A man pointed a gun at them and pulled the trigger. | A sudden drop in temperature can trigger the alarm. | trigger |
| Guards! Slap that vile woman's face! | The guard checked tickets at the entrance. | guard |
| Tom confided in his friend that he was going to hang himself | Tom confided in his friend about his plans for the future. | friend |
| Every time I fall in love, Dad tells me the girl is my half sister | Please tell me where the nearest library is. | tell |


## 第七批：敏感内容自动改写（v101 已录）

从剩余内容中选取 40 条涉及战争、暴力、歧视、成瘾或其他敏感语境的例句，改写为日常、非露骨或尊重性的表达，并保留词卡目标词（必要时使用自然屈折形式）。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| Sought merciful treatment for the captives | The teacher was merciful when she gave the class extra time. | merciful |
| The killers will be brought to justice(= caught and punished ). | The judge worked to ensure justice for everyone. | justice |
| If you're not a loser by nature, then people won't trust you | Nobody is a loser for asking a thoughtful question. | loser |
| Your soul has been condemned to hell | She put her whole soul into the song. | soul |
| Yesterday night, I was almost bitten to death by the laboratory mosquitoes. | The laboratory studies how insects help pollinate plants. | laboratory |
| The might of the army is "invincible," according to state media but the refugees are rather cynical about the ill equipped force. | The team felt invincible after winning its first match. | invincible |
| He was sent on over 200 missions before being killed in action. | The rescue mission brought clean water to the village. | mission |
| The reproductive or generative organs | The biology class studied reproductive health. | reproductive |
| Southern men, Northern women | The northern lights shimmered above the frozen lake. | northern |
| The bomb went off at 9.30 in the morning. | The bath bomb makes bubbles in warm water. | bomb |
| So it seems that cloud of odorless deadly gas had a silver lining after all | Every challenge has a silver lining if we learn from it. | silver |
| They battled against other Indian tribes, but rarely fought with the whites. | The two teams rarely disagree during practice. | rarely |
| The attackers were said to be taking revenge on the 14-year-old, claiming he was a school bully. | She chose kindness rather than revenge. | revenge |
| To investigate, his team injected cocaine, capsaicin or both at once into the abdomens of several groups of about 30 mice. | The health class discussed how cocaine can harm the brain. | cocaine |
| I'm not very Chinese. For example, I don't believe that Taiwan is Chinese territory | For example, our library stays open until eight. | example |
| Afrikaners are the people originated in South Africa | Africa is home to many languages, landscapes, and cultures. | africa |
| The police is searching for an escaped prisoner | We search the garden every spring for new flowers. | search |
| She’s deaf and dumb (= unable to hear or speak ) and communicates using sign language. | She is deaf and uses sign language to communicate. | deaf |
| We flew over 200 combat missions in the war. | The museum exhibit describes combat history in the region. | combat |
| She was blind, deaf, and dumb. | My grandfather is deaf and enjoys films with captions. | deaf |
| Godwin's law teaches us that any infinite discussion about an arbitrary subject converges to a Nazi comparison. | The committee chose an arbitrary date for the picnic. | arbitrary |
| I can't believe he had the balls to ask the boss for a raise | The soccer ball rolled under the bench. | ball |
| A man can no more become a woman than a monkey can develop into a man | Children develop new skills through practice. | develop |
| When only death remains, the last resort is to beg for food | She did not have to beg; her neighbors gladly shared their lunch. | beg |
| Afflict with the plague | A lack of sunlight can afflict plants that grow indoors. | afflict |
| The group are holding two tourists hostage (= keeping them as hostages). | The rescued hostage was reunited with her family. | hostage |
| Indeed, dwarf tossing is an Olympic sport! | Pluto is a dwarf planet that orbits the sun. | dwarf |
| The plane crashed, killing all 200 people aboard. | Everyone was safely aboard the ferry before it left the dock. | aboard |
| I aimed at a sparrow, but shot down a goose | A goose walked along the pond’s edge. | goose |
| Europeans tried to civilise the tribe | European museums preserve many historical works of art. | european |
| There was a look of sheer terror (= complete terror) on his face. | The child overcame her terror of thunderstorms. | terror |
| He’s been in a lot of trouble – drugs, guns, blackmail – the list is endless. | The road seemed endless as we drove across the desert. | endless |
| At least 50 people died when a bus plunged into a river. | The diver plunged into the pool after checking the water. | plunge |
| Everybody knows that Cold War is the confrontation between two nations | The confrontation between the two chess players ended with a handshake. | confrontation |
| Though I may be in the jaws of death, I am as a firm as a rock | Her firm handshake made a strong first impression. | firm |
| China has the means to destroy your aircraft carriers | The storm may destroy the old fence. | destroy |
| I shot the horse because it had trouble breathing | Take a slow breath before you begin speaking. | breath |
| His successor died after only 15 months in office. | The successor continued the project with a fresh plan. | successor |
| It is a prevalent belief, according to a nationwide poll in the United States, that Muslims are linked with terrorism. | A prevalent belief is that regular exercise supports good health. | prevalent |
| He's only 24 years old and a drug addict. | He is a crossword addict who solves puzzles each morning. | addict |


## 第八批：敏感内容自动改写（v102 已录）

从剩余内容中选取 40 条含战争、死亡、歧视、药物或其他敏感语境的例句，改写为日常、非露骨或尊重性的表达，并保留词卡目标词（必要时使用自然屈折形式）。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| On a rainy day, we keep guests; Heaven keeps you, but I won't | The painting shows heaven as a peaceful garden. | heaven |
| He was sentenced to prison and stripped of his rank (= had his rank taken from him). | She earned the highest rank in her class. | rank |
| Comrades! Let's transform Moscow into a model communist city | He met his old comrade at the reunion. | comrade |
| Baldry’s 20-year prison sentence was commuted to three years. | She commutes to work by train each morning. | commute |
| The army massacred more than 150 unarmed civilians. | The museum exhibit honors those lost in a historical massacre. | massacre |
| The atomic bomb is the offspring of 20th century physics. | The young bird is the offspring of two nesting robins. | offspring |
| My message is "If you try to smuggle drugs you are stupid." | Customs officers help prevent people from trying to smuggle protected plants. | smuggle |
| Trump is a Russian asset. | A reliable laptop is a valuable asset for any student. | asset |
| Invasive cancer cells | The gardener removed an invasive vine from the fence. | invasive |
| Prepare to launch torpedoes | A torpedo-shaped fish darted through the water. | torpedo |
| St. Stephen, the first Christian martyr | The history book describes a martyr who stood up for justice. | martyr |
| Everybody rushing about on some incomprehensible errand someone forced him to do at pain of death. | She ran a quick errand to the post office. | errand |
| In its more extreme variants, cis ideology can include denial of the empirical reality of intersex and transgender people. | Their ideology emphasizes cooperation and shared responsibility. | ideology |
| A teenage mother was accused of smothering her 3-month-old daughter. | The child smothered the cake in chocolate sauce. | smother |
| Spirits of Heaven and Earth, heed my call; manifest swiftly by divine decree! | Good team spirit made the event more enjoyable. | spirit |
| Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. | A wooden rod supported the young tomato plant. | rod |
| Karl Marx says, "The history of all hitherto existing societies is the history of class struggles." | Hitherto, the library had closed at five each evening. | hitherto |
| Scientists first conceived the idea of the atomic bomb in the 1930’s. | She conceived a clever plan for the school festival. | conceive |
| Weeks of aerial bombardment had destroyed factories and motorways. | Aerial photographs show the river winding through the valley. | aerial |
| He lured her to his home and shot her with his father's gun. | Bright flowers lure butterflies into the garden. | lure |
| The bombs ignited a fire which destroyed some 60 houses. | Dry leaves can ignite quickly in hot weather. | ignite |
| Russia is sending battleships, marines, and landing craft tanks against Syria, and submarine equiment against Iran. | She learned to craft a bowl from clay. | craft |
| A surgical air strike | The surgical team prepared the room for the operation. | surgical |
| A sorrowful tale of death and despair | The sorrowful ending of the story still offered hope. | sorrowful |
| A frightful crime of decapitation | The weather turned frightful during the storm. | frightful |
| Murdering elephants, tigers and other endangered species is not just cruel; it's also illegal. | It is illegal to park in front of the fire exit. | illegal |
| The best hairdressers are gay | A gay hairdresser opened a studio near the park. | gay |
| Karl Marx said: "Workers of the world, unite!" | Every worker deserves a safe and respectful workplace. | worker |
| While camping, Tom gave Mary dysentery by not thoroughly cleaning the pots and pans | The soup simmered in a large pot on the stove. | pot |
| Ethnic amalgamation ethnic assimilation and ethnic fusion of culture are three kinds of different phenomena in ethnic relation. | Assimilation helps the body turn food into useful nutrients. | assimilation |
| The two men face execution (= They will be killed as a punishment ). | Program execution begins when you press the start button. | execution |
| In Junethe civil war intensified. | The rain began to intensify as evening approached. | intensify |
| But "the hostile part can be mobilized from time to time, " by what he calls "anti-immigrant entrepreneurs. | The immigrant family opened a small bakery in their new town. | immigrant |
| Side effects from prescribed drugs are being reported with increasing frequency (= more and more often). | The bus service runs at high frequency during rush hour. | frequency |
| A wife is usually considered unqualified to testify against her husband | She felt unqualified for the role until she received more training. | unqualified |
| Drugged and senseless | It is senseless to waste clean water. | senseless |
| Tom slit his own throat. | She slit the envelope open with a letter opener. | slit |
| Your father is a gorilla | A gorilla rested quietly in the shade at the zoo. | gorilla |
| The death toll has risen to 83. | The toll for crossing the bridge is collected at the gate. | toll |
| "In anthropology, you can't equate third gender with homosexuality," he said. | In anthropology, researchers study how cultures change over time. | anthropology |


## 第九批：敏感内容自动改写（v103 部分上线）

本批从剩余敏感语境中选取 40 条进行中性改写。27 条于 v103 安全切分上线；另 13 条所在 WAV 的句间找不到安全切点，未作不可靠切分。该组已于 v104 拆为 11 句与 2 句两段重新合成、复核切分并发布。

### v103 已安全切分上线（27 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| Her body was coffined | The museum displayed a replica of an ancient coffin. | coffin |
| In Spain, they wear red boxers or knickers on Christmas | Spain is known for its art, music, and regional traditions. | spain |
| My mother often slaps passers-by | He gave the dusty rug a quick slap outside. | slap |
| He had even contemplated suicide. | She paused to contemplate the painting. | contemplate |
| So it seems that cloud of odorless deadly gas had a silver lining after all. | The warning label said the chemical could be deadly if swallowed. | deadly |
| The waste can be fatal if swallowed. Police are investigating what caused the reservoir to break. | The reservoir supplies fresh water to several nearby towns. | reservoir |
| The unhappy event made him put an end to himself. | The school hosted a spring event for families. | event |
| Capitalism is poverty | The debate compared capitalism with other economic systems. | capitalism |
| God said, "Let there be light!" | The word God appears in many historical texts. | god |
| Who needs science when you've got guns? | The museum displayed antique guns in a glass case. | gun |
| illegal aliens entering the country. | The alien in the story landed on Earth at night. | alien |
| Torture and summary execution (= execution without a trial or any legal process ) are common. | The program's execution finished in a few seconds. | execution |
| Don't you think the name "The Sacred War" sounds a bit sarcastic? | The team treated the old trophy as a sacred symbol of school history. | sacred |
| Staff use the poison to exterminate moles and rabbits. | The gardeners worked to exterminate invasive weeds from the path. | exterminate |
| The separation of church and state | The separation of powers helps keep government balanced. | separation |
| The way we kill animals appals a lot of people. | The litter on the beach appals visitors. | appal |
| She developed a malignant tumour in her breast. | The doctor explained that malignant cells can spread. | malignant |
| Police appealed for wit­nesses after a woman was kidnapped at gunpoint. | The police stopped the kidnap plot before anyone was harmed. | kidnap |
| There were many conspiracy theories (= beliefs that something is the result of a conspiracy) surrounding Princess Diana’s death. | The novel follows a conspiracy that reaches the highest levels of government. | conspiracy |
| An ultrasound in this case revealed no fetus, only a "snowstorm" effect. | A snowstorm closed the mountain road for several hours. | snowstorm |
| The American mission is to eliminate communism from the world | The class compared communism with other political systems. | communism |
| Operation Yoav was a military operation carried out by Israel in its war for independence | The hospital scheduled the operation for early morning. | operation |
| Fadil didn't mean to shoot someone | The studio will shoot a family portrait next weekend. | shoot |
| Between you and me, the fat ugly man is on a diet. | The ugly duckling grew into a beautiful swan. | ugly |
| Landmines still kill or maim about 300 people every month. | Protective gear can prevent accidents from maiming workers. | maim |
| The kidnappers were demanding a ransom of $250,000. | The ransom note in the mystery novel revealed a hidden clue. | ransom |
| He applied for asylum in 1987 after fleeing the police back home. | She applied for asylum after leaving an unsafe situation at home. | asylum |

### v103 暂缓条目，已于 v104 拆组重录发布（13 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| Released the prisoner for humanitarian reasons | The group provided humanitarian aid after the flood. | humanitarian |
| Chinese people have the most patriotic stomachs. | She felt patriotic while watching the national team. | patriotic |
| The defendant was convicted of high treason (= treason of the worst kind) and sentenced to death. | The history book describes a trial for treason. | treason |
| Religion is just organised superstition with a bestseller. | An old superstition warns against opening an umbrella indoors. | superstition |
| Tom wrote propaganda online without pay for the government, but cried when everyone in his hometown was massacred by the government. | The professor taught students to recognize propaganda in the media. | propaganda |
| Israel, which has tried for years to mobilise international action against Iran, suddenly appears more sanguine. | Local volunteers mobilise quickly when neighbors need help. | mobilise |
| Zelensky is a war hero | The firefighter became a local hero after the rescue. | hero |
| Many criminals in America are addicted to drugs | The pharmacist explained how to take the drug safely. | drug |
| Nowadays it's not possible to protect oneself against weapons of mass destruction | It is important to be kind to oneself while learning something new. | oneself |
| An ounce of wit that is bought is worse a pound that is taught | The bakery weighed a pound of flour for the recipe. | pound |
| Are you an idiot? | I called myself an idiot when I forgot my keys. | idiot |
| The "anti-woke" propaganda being imported into your country's media comes straight from actual fascists. | The class studied how propaganda can shape public opinion. | propaganda |
| The tip of the spear was dipped in a deadly poison. | The warning label says the poison is deadly if swallowed. | deadly |


## 第十批：敏感内容自动改写（v105 已录）

从剩余队列中选取 40 条涉及健康、暴力、战争、政治、宗教、身份或其他敏感语境的例句，改写为中性、日常表达，并保留词卡目标词。所有 40 条均在本批分组合成后通过对齐与安全静音切分。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| It's been said that one should not smell deer musk when pregnant | A deer paused beside the path before crossing the meadow. | deer |
| Gambling site lets users bet on which species will go extinct because of the oil spill in the Gulf of Mexico. | We watched the sunset over the Gulf from a quiet beach. | gulf |
| There are two major political parties in the United States: the conservative Republican Party, and the liberal Democratic Party. | The team used a conservative estimate when planning its budget. | conservative |
| Cancer can be cured easily if it is found in its first phase. | The project entered a new phase after the review. | phase |
| Europeans drink, on average, 12.5 liters of pure alcohol per year | The European art festival attracted visitors from many countries. | european |
| In a horrifying chain of events, Christopher Columbus once bit his own lip | A chain of events led to the town's annual festival. | chain |
| Investigate thoroughly the bushes where the enemy may be hiding | The puppy tried to hide behind the chair. | hide |
| Cancer can be cured easily if it is found in its first phase | The kitten curled up in its soft bed. | its |
| By 1944, Fletcher had command of a B-17 bomber and a ten-man crew. | The pilot gave the crew a clear command before takeoff. | command |
| The best refutation of the imaginary Malthusian laws of "land depletion" is the practice of Soviet collective farming. | The collective chose to plant a garden for the neighborhood. | collective |
| They hymned their love of God | The choir chose a familiar hymn for the winter concert. | hymn |
| These may either be the drug in question or some analogue of it that. | The engineers tested an analogue model of the new bridge. | analogue |
| The reclamation of delinquent children | The reclamation project restored wetlands along the river. | reclamation |
| The Eastern religions | The eastern sky glowed pink as the sun rose. | eastern |
| Yes, people usually curse at someone they are acquainted with | The old tale tells of a curse that fades at sunrise. | curse |
| Death holds no terrors for (= does not frighten) me. | The suspenseful music created a sense of terror in the film. | terror |
| Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. | A wooden rod helped support the young tree. | rod |
| He had been questing for religious belief from an early age. | Her quest for knowledge led her to a new library. | quest |
| It should not be limited or constrained by any transcendent standards or moral laws that do not derive from politics itself, whether a law of God or some kind of transcendent moral order or code. | We can derive a simple rule from the test results. | derive |
| Germany is expecting about 1.5 million asylum seekers this year | The town expects many visitors during the summer festival. | expect |
| If you sign up to Facebook, your information will be sent to intelligence agencies | The app keeps your information private and secure. | information |
| In front of the Buddhist Hall, a sign says: "Beware of all the life under your steps." | The school hall was decorated for the spring concert. | hall |
| The proletarians lose nothing in this revolution but their chains | A sturdy chain secured the gate during the storm. | chain |
| I lost my father to a subarachnoid haemorrhage when I was fourteen | She joined the orchestra when she was fourteen. | fourteen |
| Silvio Berlusconi is an Italian politician, the current Prime Minister of Italy, as well as a successful entrepreneur. | The minister answered questions at the community meeting. | minister |
| There are two things in the world that cannot wait: 1. Filial piety, 2. Doing good. | Her piety was reflected in quiet acts of kindness. | piety |
| The inherent antagonism of capitalism and socialism | Their antagonism faded as they began to work together. | antagonism |
| Through this incision, the abdominal cavity is distended with carbon dioxide gas. | Warm air can distend a balloon. | distend |
| Arriving late is a woman’s prerogative. | Choosing the music is the host's prerogative. | prerogative |
| Anorexics may overeat before purging themselves or vomiting. | The librarian will purge outdated records from the archive. | purge |
| There are no rules about when to transfuse and who to do it to. | Doctors may transfuse blood when a patient needs it. | transfuse |
| Europeans tried to civilize the tribe | The European museum displayed art from across the continent. | european |
| No one can deprive of your human rights | Everyone has the right to ask questions. | right |
| Tom biked 30 km to the store to buy strawberries for his pregnant wife | They stopped at the store to buy fruit for the picnic. | store |
| One out of 455 women doesn't realize she's pregnant until the twentieth week of pregnancy | The twentieth chapter introduces a new character. | twentieth |
| Operation Yoav was a military operation carried out by Israel in its war for independence. | The military museum displayed uniforms from different eras. | military |
| In the Netherlands they want to ban the Qur'an | The Netherlands is known for its canals and cycling routes. | netherlands |
| I am going to shoot! | The film crew will shoot a short scene in the garden. | shoot |
| It's not an issue if he argues with his wife, but he shouldn't hit her | His wife joined him for a walk through the garden. | wife |
| Predatory capitalists | The owl is a predatory bird that hunts at night. | predatory |


## 第十一批：敏感内容自动改写（v106 已录）

继续处理中性化可改写的敏感语境，选取 40 条涉及性别刻板印象、政治/宗教表述、战争、药物、健康或身份描述的例句；改写为自然日常英文并保留目标词。为避免句间无静音，本批分成九段合成；40 条均通过对齐和安全切分。既有明确排除项未改写，仍留在待录队列。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| The feelings of "love at first sight" and "faithful unto death" are unrealistic; this sort of unrealistic and illusory feeling is not what we need. | She remained faithful to her promise, even when the journey became difficult. | faithful |
| Danger past, God forgotten | The past can teach us something useful about the future. | past |
| This pub has very beautiful waitresses | The waitress brought a fresh glass of water to our table. | waitress |
| Breathless at thought of what I had done | We were breathless after climbing the hill together. | breathless |
| Contradictory attributes of unjust justice and loving vindictiveness | The report contained contradictory details, so we checked the original notes. | contradictory |
| Chechens have inclinations towards independence | She walked toward the garden gate as the sun went down. | toward |
| The security level, as established by the Department of Homeland Security, is orange | After many years abroad, she returned to her homeland. | homeland |
| Translation is like a woman. If it is beautiful, it is not faithful. If it is faithful, it is most certainly not beautiful. | The faithful dog stayed close to its owner on the hike. | faithful |
| Tatoeba: As if the geek invasion wasn't enough. | A sudden invasion of ladybugs covered the garden plants. | invasion |
| Day and day I take pains to enquire myself my reason for doing so, in no time will I stoop so low as to beg you sympathy, though I can feel your scoff all the time. | She called the library to enquire about its opening hours. | enquire |
| His teachings are incorporated in a profound book Daode Jing which Taoists regard as the final authority and doctrines of the religion. | The teacher's advice had a profound effect on the student's confidence. | profound |
| Without love, the best in the bud before killing! | A small bud opened in the warm morning sunlight. | bud |
| "God knows," she muttered, "what's happening in that madman's mind." | She muttered a quiet reminder to herself before the meeting. | mutter |
| That has been an evil rabbit. | The old story shows how kindness can overcome evil. | evil |
| The Bantu population of Sierra Leone | Bantu languages are spoken in many regions of Africa. | bantu |
| The more you follow the fear, the more you live like a lower mammal. | A whale is a large mammal that lives in the ocean. | mammal |
| He kept reading the Quran for months | She read a new chapter of the novel each month. | month |
| When a Chinese girl gets old, her family becomes nervous | She felt nervous before her first school performance. | nervous |
| The laser cow in WHAT THE CAR? is both hilarious and terrifying! | The cow stood quietly beside the fence. | cow |
| It is said that Dutch are tolerant | The Dutch museum displayed paintings from the seventeenth century. | dutch |
| His body type is born balanced! Wide shoulders, slim waist, belly not popping outwards. | A slim path wound through the quiet garden. | slim |
| We evolved to stay away from poo, from bodily fluids, from mucous, from foods that have gone off, from worms in the garden. | Mucous membranes help protect the inside of the nose. | mucous |
| Belushi imitates a giant pimple by squeezing his cheeks and spewing chewed food out of his mouth. | The pharmacist suggested a gentle cream for the pimple. | pimple |
| Europeans tried to civilise the tribe. | The tribe shared stories and music at the community gathering. | tribe |
| You're bleeding everywhere; I'll help you up | Bright tulips bloomed everywhere in the park. | everywhere |
| The majority of Irani are Persian Shiite Muslims | Persian carpets are known for their detailed patterns. | persian |
| Traditionally, we eat fried foods on Hanukah | The family traditionally shares a festive meal at year's end. | traditionally |
| A wealthy class parasitic upon the labor of the masses | Some parasitic plants draw nutrients from a host plant. | parasitic |
| Political consequences of incomplete military success | The report is incomplete without its final section. | incomplete |
| Communism will never be reached in my lifetime | She collected postcards throughout her lifetime. | lifetime |
| Many countries have abolished capital punishment | The coach chose encouragement instead of punishment. | punishment |
| The lions ravened the bodies | A raven perched on the fence and watched the field. | raven |
| However, apart from Buddhists, hardly anyone can consistently follow this principle | She practiced consistently and improved a little each day. | consistently |
| The Old Testament forbids eating shellfish | The market sells fresh shellfish every morning. | shellfish |
| Pakistan is a Muslim country | Pakistan is home to mountains, rivers, and diverse landscapes. | pakistan |
| Socrates refused to flee and died by drinking hemlock | The nature guide pointed out hemlock growing beside the trail. | hemlock |
| The sacrificed newborn doesn't fear the tiger | The newborn slept peacefully in a warm crib. | newborn |
| Our feckless opposition party didn't do enough to stop him | The opposition proposed a different plan at the town meeting. | opposition |
| They endured five years of privation during the World War II. | The museum exhibit describes daily life during World War Two. | world war ii |
| The CIA had requested our help to penetrate a drug ring operating out of Munich. | Munich is known for its parks, museums, and historic architecture. | munich |


## 第十二批：敏感尾项、模板/说明和标记（v107 已录）

本批依用户指定顺序，先完成 11 条剩余可安全中性改写的敏感/刻板印象例句，再处理 26 条模板、说明或带说话人标记的片段，最后口头化 3 条时间/数字内容。分九段合成；40 条均通过对齐和安全静音切分。明确排除项继续保留在待录队列。

### 敏感语境尾项（11 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| In conversation among the small grasses, do not offend the big tree | Fresh grass covered the hillside after the spring rain. | grass |
| ‘I’m a prisoner in my own home.’ ‘Nonsense!’ | The children laughed at the nonsense in the cartoon. | nonsense |
| This is the ideology to which my speech is written. | Her ideology emphasizes cooperation and respect for nature. | ideology |
| The Nobel Prize is awarded annually on December 10, the day of Alfred Nobel's death | Our neighborhood holds its harvest festival annually in October. | annually |
| A little church with a squat tower | A squat stone tower stands beside the old town hall. | squat |
| Mr. Goat Butt never told me there would be a partner | The young goats butt heads as they play in the meadow. | butt |
| This man is like a filthy electronic without a battery. | An electronic timer helps the baker keep track of the oven. | electronic |
| Next to China, Switzerland is an abandoned village | A quiet village rests beside a lake in the Alps. | village |
| Esperanto, an official language of the European Union, now! | The city issued an official notice about the library's new hours. | official |
| The government has agreed to underwrite the project with a grant of £5 million. | A local foundation agreed to underwrite the community arts program. | underwrite |
| Put some clothes on, don't you feel sick of yourself? | I felt sick after eating too much candy. | sick |

### 模板/说明及标记片段（26 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| Exploring hidden treasures behind waterfalls is one of my favorite parts of WHAT THE CAR? | They found a hidden treasure beneath the old lighthouse. | treasure |
| The level editor in WHAT THE CAR? lets you create your own wacky challenges. | The video editor trimmed the clips before the film was shown. | editor |
| Rice: No, I only have a handbag. | She packed a notebook and a water bottle in her handbag. | handbag |
| Rachael:Do you like our owl? | An owl settled quietly on a branch at dusk. | owl |
| I can't stop laughing at the jetpack-powered car in "WHAT THE CAR?"! | We shared a laugh while playing a silly racing game. | laugh |
| We gonna mosh through the marsh, take us right through the doors. | The trail passed through a quiet marsh filled with birds. | marsh |
| Kids open their presents in Christmas morning | The children opened their presents on Christmas morning. | present |
| Ankle, ankle, where are you? | My ankle felt stiff after the long walk. | ankle |
| I like how WHAT THE CAR? combines racing with fun puzzle gameplay and exploration | The science museum encourages exploration through hands-on exhibits. | exploration |
| The word roost appears in this sentence. | The hens returned to the roost just before sunset. | roost |
| If human life is convex, we can optimize it | A convex lens bends light toward a single point. | convex |
| No, but a fridge and a stove. | The fridge and stove were delivered this morning. | fridge |
| Why should you spring my cricket bat? | She practiced cricket with a new bat after school. | cricket |
| In WHAT THE CAR?, you play as a car with legs, racing through absurdly creative levels | Each level of the course introduces a new skill. | level |
| Nearly lost Chinese etiquette terms. | Good etiquette helps guests feel welcome at a formal dinner. | etiquette |
| We could reprint at a cost of X, or she had found a service that would affix stickers over the price to correct at a cost of X. | She will affix a label to each folder. | affix |
| I love how WHAT THE CAR? combines racing with quirky puzzles and exploration | The research team planned an exploration of the forest. | exploration |
| He-heh... there's a tale behind that, for that place | My grandfather told a tale about a lighthouse. | tale |
| B Thank you. Have a good day. | Have a good day, and thanks for your help. | have a good day! |
| How long does it take to go from... to... by train? | The train travels from Boston to New York each morning. | from... to... |
| A a story. | She wrote a story about a lost kitten. | story |
| This table shows the differences between... and... | A narrow path runs between the lake and the forest. | between... and... |
| Let the tea set and tea combine perfectly. | The tea set matched the cups and tray. | tea set |
| I think Gama-Go is one of the coolest like, quintessential San Francisco places to go check out. | Let's check out the new art exhibit after lunch. | check out |
| Everything he said is all my lines! | She wrote a line of dialogue for the play. | line |
| Not only…but also. | She is not only kind but also thoughtful. | not only ... but also |

### 时间与数字口头化（3 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| The lighted dial of her watch said 1.20. | The lighted dial made it easy to see the time. | dial |
| This evening’s performance will begin at 8.00 pm. | This evening's performance will begin at eight o'clock. | performance |
| Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred | Let's count by tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, and one hundred. | eighty |

## 第十三批：模板/说明、标记与可改写病句（v108 已录）

本批从当前队列中处理所有 43 条未被明确排除、且可安全修复或改写的句子：先处理 6 条模板/说明或数量单位片段，再处理 37 条可改写病句与用法问题。剩余 11 条均是既有明确排除项，保留待录，不删除、不配音。分九段合成；43 条全部通过对齐与安全静音切分。

### 模板/说明、数字与单位片段（6 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, hundred | Let's count by tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, and one hundred. | sixty |
| Two and three halves to London, please | Halve the recipe if you are cooking for two. | halve |
| Reading some books which contain humor or humorous stories is another. | Her gentle humor helped everyone feel at ease. | humor |
| To open the window. | Please open the window to let in some fresh air. | window |
| TO eat with a knife and fork. | I eat my salad with a fork. | fork |
| What's the area of Canada in square kilometer? | The trail is five kilometers long. | kilometer |

### 可改写病句与用法修复（37 条）

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| It is not just to prefer strength to good wisdom | True strength is balanced by wisdom. | strength |
| Your wonderful lecture was pearls before swine | The speaker gave a wonderful lecture on astronomy. | wonderful |
| My father is only fifteen years old | She began learning the violin when she was fifteen. | fifteen |
| When chickens pancake-shape maintain, the tractor must have won again | The chicken scratched at the ground beside the barn. | chicken |
| She was really of the cold frog. | A frog rested on a cool stone beside the pond. | frog |
| My father bought me a digital watch for birthday present. | My father bought me a digital watch for my birthday. | digital |
| Is the wire live? I can tell just by touching it | The wire connects the lamp to its power source. | wire |
| Of course you're the one providing, go! | She is providing fresh fruit for the picnic. | providing |
| Sami's bed smells of bed | The bed stood beside the window. | bed |
| Cold worlds shake from the oar. | She used an oar to guide the canoe across the lake. | oar |
| The trend of half permanent enterprise management culture towards normalization direction. | The normalization of the records made them easier to compare. | normalization |
| He a man! Hell! He was a hollow sham. | The old painting turned out to be a sham. | sham |
| A sports bra should only be worn for working out, and not in any non-sports situations | A light jacket is useful in many different situations. | situation |
| We strive to paddle to follow the stream, however, we are unsure if how and when we will reach the horizon. | They used a paddle to steer the canoe downstream. | paddle |
| This moment will nap, you will have a dream; But this moment study,you will interpret a dream. | She took a short nap after finishing her homework. | nap |
| Then the deal is that when you sell the house they subtract -you've got to pay this. | We subtract the ticket cost from our total budget. | subtract |
| We had seen Jone swimming across the river | We swam across the river together. | across |
| Since namely namely misconceive, that explanation clear nice. | People sometimes misconceive the purpose of a simple rule. | misconceive |
| I help you? | Can I help you carry those books? | help |
| What did Hi say? | What did you say about the new story? | say |
| Where 'is my cap? | Where is my cap? | where |
| I'm from the Canada. | I am from Canada. | from |
| Are you from UK? | Are you from the UK? | uk |
| I use your pencil? | May I use your pencil? | pencil |
| I have some rice, please? | Could I have some rice, please? | rice |
| I like eating vegetable. | I like eating fresh vegetables. | vegetable |
| I I'm still very hungry. | I am still very hungry. | still |
| I turn on the light? | Could you turn on the light? | light |
| He schoolbag are cheap and nice. | His schoolbag is sturdy and inexpensive. | schoolbag |
| It's a English book. | It's an English book. | english book |
| I try on these gloves? | May I try on these gloves? | try |
| I Let's go to the playground. | Let's go to the playground after school. | playground |
| I have a music class on this Friday. | I have a music class this Friday. | friday |
| What do you do on this Saturday? | What do you want to do this Saturday? | saturday |
| We'll swim on this weekend. | We will go swimming this weekend. | weekend |
| Everything is no problem. | There is no problem with the plan. | problem |
| My favorite food is dumpling. | My favorite dumpling is filled with vegetables. | dumpling |

## 第十四批：此前保留的 11 条尾项（v109 已录）

应用户在 v108 之后“继续”的指示，本批将此前队列中保留的 11 条纳入处理。原始英文仍作为例句映射键；朗读版中性化原有宗教、政治、犯罪或机翻语境，并修复模板与病句，同时保留目标词。所有词典发音检查无缺项，三段录音均通过对齐和安全静音切分。

| 原句 | 改写后朗读 | 保留目标词 |
|---|---|---|
| I am napoleon, I am emperor… burned it! | The emperor welcomed visitors to the palace. | emperor |
| Local legend has it that (= says that) the island was the original Garden of Eden. | According to local legend, a hidden spring flows beneath the old bridge. | legend |
| The Swiss keyboard doesn't have a ß. | I use a keyboard to type notes for class. | keyboard |
| Excuse me each other a debate on the web, the virtual space, the interaction between people often with a mask, this month, the mirror with water flowers have what differentiation? | The chart shows clear differentiation between the two plant species. | differentiation |
| Taoism was founded on the teachings of Laozi, a sage born in 604 B.C. in present-day Henan Province. | The province opened a new library for local families. | province |
| It used materials is 0.4 millimeter stainless steel spring steel of powder coatings. | The screw is only one millimeter wide. | millimeter |
| Different is, the exam in the life often does not have person invigilate. | Two teachers will invigilate the final exam. | invigilate |
| On May 18, a young Japanese couple was arrested after their one-year-old baby was found wrapped in a plastic bag and dumped in a gutter. | This lunch box is made from recycled plastic. | plastic |
| Go down this street/road until you reach the 1st/2nd/… traffic lights. Turn right/left. Atthe end of the road/street you'll see the … | At the next intersection, turn right for the library or turn left for the park. | turn right/left |
| For the nursling of plantlets, the soil of the rotten leaves was the best materials, and the survival rate could be up to 80%. | The repair bill can be up to one hundred dollars. | be up to |
| I regret some of my posts about President @realDonaldTrump last week. They went too far. | I regret leaving my umbrella at home on a rainy day. | regret |
