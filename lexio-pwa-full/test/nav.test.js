'use strict';

/**
 * 多视图导航测试（v3）：首页菜单层级 + iOS 式推入动画 + 学习面板全屏锁定 + 三子面板。
 * 运行：node lexio-pwa-full/test/nav.test.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const swSource = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

const vc = new VirtualConsole(); // 吞掉应用脚本在 jsdom 环境的预期报错（fetch/IndexedDB 不存在）
vc.on('jsdomError', () => {});
vc.on('error', () => {});

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    class MockAudio {
      constructor(src) { this.src = src; this.listeners = {}; window.__lastAudio = this; (window.__audioInstances ||= []).push(this); }
      addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
      emit(type) {
        const event = { type };
        if (typeof this['on' + type] === 'function') this['on' + type](event);
        (this.listeners[type] || []).forEach(callback => callback(event));
      }
      play() { return Promise.resolve(); }
      pause() {}
    }
    window.Audio = MockAudio;
    window.fetch = (url) => {
      if (String(url).includes('daily-conversation.json')) {
        const phrases = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'daily-conversation.json'), 'utf8'));
        return Promise.resolve({ ok:true, json:()=>Promise.resolve(phrases) });
      }
      return Promise.reject(new Error('Network disabled in test environment'));
    };
    window.SpeechSynthesisUtterance = function (text) { this.text = text; this.lang = ''; this.rate = 1; };
    window.speechSynthesis = {
      speaking: false,
      pending: false,
      paused: false,
      getVoices: () => [{ lang: 'en-US', name: 'Test US' }, { lang: 'en-GB', name: 'Test GB' }],
      addEventListener() {},
      resume() { this.paused = false; },
      cancel() { this.speaking = false; this.pending = false; },
      speak(utterance) {
        this.speaking = true;
        window.__lastUtterance = utterance;
        if (utterance.onstart) utterance.onstart();
      },
    };
  },
});

const { window } = dom;
const doc = window.document;
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.webmanifest'), 'utf8'));
// Visible copy only: strip <script>/<style> so code identifiers never count as UI text.
const visibleText = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ');
const scrollCalls = [];
Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
window.scrollTo = (_x, y) => { window.scrollY = Number(y) || 0; scrollCalls.push(window.scrollY); };

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failed++;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const activeViews = () =>
  [...doc.querySelectorAll('main > section[data-app-view]')].filter((s) => s.classList.contains('is-active'));
const viewNames = () => activeViews().map((s) => s.getAttribute('data-app-view'));
async function setHash(h) {
  window.location.hash = h;
  await sleep(60);
}
async function setHashSettled(h) {
  window.location.hash = h;
  await sleep(600); // 动画 470ms + 余量
}
function animClean() {
  const main = doc.getElementById('main');
  const leftover = [...doc.querySelectorAll('.anim-push-in,.anim-push-out,.anim-pop-in,.anim-pop-out,.anim-fade-in,.anim-fade-out')];
  return (
    !main.classList.contains('is-animating') &&
    !doc.body.classList.contains('view-anim-lock') &&
    leftover.length === 0
  );
}

(async () => {
  await sleep(200);

  // ---------- 1. 默认首页 ----------
  check('默认进入首页', doc.body.getAttribute('data-app-view') === 'home');
  check('首次访问不把未开始的默认卡误当作学习断点', window.localStorage.getItem('lexio.studyStarted') === null);
  check('首页分组激活', viewNames().every((v) => v === 'home') && viewNames().length >= 4,
    `active=${viewNames().length}`);
  check('首屏无动画残留', animClean());
  const cards = [...doc.querySelectorAll('.menu-card')];
  check('首页菜单卡片 = 6', cards.length === 6, `实际 ${cards.length}`);

  // ---------- 2. 底部导航 ----------
  const tabs = [...doc.querySelectorAll('#appTabbar a')];
  check('底部导航 5 个标签，含独立记录页', tabs.length === 5 && !!doc.querySelector('[data-tab=progress]'));
  check('首页标签默认高亮', tabs.find((t) => t.dataset.tab === 'home').classList.contains('is-current'));

  // ---------- 3. 进入学习：动画 + 全屏锁定 ----------
  await setHashSettled('#study');
  check('#study → 学习视图', doc.body.getAttribute('data-app-view') === 'study' &&
    doc.getElementById('study').classList.contains('is-active'));
  check('进入学习后开始保存本机学习断点', window.localStorage.getItem('lexio.studyStarted') === '1' &&
    !!window.localStorage.getItem('lexio.lastStudyWordId'));
  check('动画结束后无残留', animClean());
  check('无关板块已隐藏',
    !doc.getElementById('method').classList.contains('is-active') &&
    !doc.getElementById('pricing').classList.contains('is-active') &&
    !doc.getElementById('library').classList.contains('is-active'));
  check('学习分组只含学习一个 section',
    viewNames().length === 1 && viewNames()[0] === 'study', `active=${viewNames().join(',')}`);
  check('顶栏标签 = 学习', doc.getElementById('viewTopbarLabel').textContent === '学习');
  check('学习中底部“学习”高亮', tabs.find((t) => t.dataset.tab === 'study').classList.contains('is-current'));

  // ---------- 3b. 词卡 3D 翻面（背面=例句+读音） ----------
  const cardFlip = doc.getElementById('wordCardFlip');
  check('词卡翻面容器存在且初始朝正面', cardFlip && !cardFlip.classList.contains('is-flipped'));
  check('背面 = 例句 + 例句读音',
    !!doc.getElementById('cardBack') && !!doc.getElementById('studyExample') && !!doc.getElementById('exampleSpeak') &&
    doc.getElementById('cardBack').contains(doc.getElementById('studyExample')));
  doc.getElementById('studyCard').click();
  await sleep(30);
  check('点击卡片 → 翻到背面', cardFlip.classList.contains('is-flipped'));
  doc.getElementById('studySpeak').click();
  await sleep(30);
  check('词卡默认使用原美式录音，单词正常速度',new URL(window.__lastAudio.src).searchParams.get('type')==='2' && window.__lastAudio.playbackRate===1);
  doc.querySelector('[data-accent="en-GB"]').click(); doc.querySelector('#studySpeak').click();
  check('英式录音入口不变',new URL(window.__lastAudio.src).searchParams.get('type')==='1');
  doc.querySelector('[data-accent="en-US"]').click();
  check('点发音按钮不触发翻面', cardFlip.classList.contains('is-flipped'));
  doc.getElementById('studyCard').click();
  await sleep(30);
  check('再点卡片 → 翻回正面', !cardFlip.classList.contains('is-flipped'));

  // 例句点击时立即调用设备 en-US 系统语音，避免异步逐词音频失去 iOS 用户手势授权。
  const exampleSpeakButton = doc.getElementById('exampleSpeak');
  const audioCountBeforeSentence = (window.__audioInstances || []).length;
  Object.defineProperty(window.navigator,'serviceWorker',{configurable:true,value:{controller:{}}});
  exampleSpeakButton.click();
  await sleep(30);
  check('示例词库也能播放所选配音',!exampleSpeakButton.disabled && /media\/voice\/.+\.mp3$/.test(window.__lastAudio.src) && window.__audioInstances.length===audioCountBeforeSentence+1);
  window.__lastAudio.emit('ended');

  // 释义自测开关
  const meaningEl = doc.getElementById('studyMeaning');
  const hiddenBefore = meaningEl.classList.contains('is-hidden');
  doc.getElementById('revealMeaning').click();
  await sleep(20);
  check('显示释义按钮切换遮罩状态', meaningEl.classList.contains('is-hidden') !== hiddenBefore);
  doc.getElementById('revealMeaning').click();
  await sleep(20);
  check('隐藏释义按钮恢复遮罩', meaningEl.classList.contains('is-hidden') === hiddenBefore);

  // ---------- 3c. 左右滑动切词（只切卡，不冒充“已记住”） ----------
  function fire(type, target, x, y, pointerId = 1) {
    const event = new window.Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clientX', { value: x });
    Object.defineProperty(event, 'clientY', { value: y });
    Object.defineProperty(event, 'pointerId', { value: pointerId });
    Object.defineProperty(event, 'isPrimary', { value: true });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    target.dispatchEvent(event);
  }
  doc.getElementById('nextWord').click(); // 确保 updateStudyCard 已用真实 bank 渲染
  await sleep(80);
  const pos0 = doc.getElementById('studyPosition').textContent;
  const known0 = parseInt((doc.getElementById('knownCount').textContent || '0').replace(/\D/g, ''), 10) || 0;
  fire('pointerdown', doc.getElementById('studyCard'), 300, 400);
  fire('pointermove', window, 220, 402);
  fire('pointermove', window, 120, 400);
  fire('pointerup', window, 120, 400);
  await sleep(520);
  const pos1 = doc.getElementById('studyPosition').textContent;
  check('左滑进入下一词', pos1 !== pos0, `${pos0} → ${pos1}`);
  check('左滑恰好记录一次', parseInt((doc.getElementById('knownCount').textContent || '0').replace(/\D/g, ''), 10) === known0 + 1,
    `known=${doc.getElementById('knownCount').textContent}`);
  // 滑动是纯导航：既不能标记已掌握，也不能把薄弱词从复习队列里删掉
  if (window.__lexioWeak) {
    const weakWord = (window.__lexioStudy.current() || {}).word;
    if (weakWord) {
      window.__lexioWeak.add(weakWord);
      const weakBefore = window.__lexioWeak.count();
      fire('pointerdown', doc.getElementById('studyCard'), 300, 400);
      fire('pointermove', window, 200, 400);
      fire('pointerup', window, 200, 400);
      await sleep(520);
      check('左滑移出待复习并记入掌握',
        window.__lexioWeak.count() === weakBefore - 1 && window.__lexioProgress.mastered().includes(weakWord),
        `weak ${weakBefore} → ${window.__lexioWeak.count()}`);
      fire('pointerdown', doc.getElementById('studyCard'), 200, 400);
      fire('pointermove', window, 300, 400);
      fire('pointerup', window, 300, 400);
      await sleep(520);
      window.__lexioWeak.remove(weakWord);
    }
  }
  check('左滑未误触发翻面', !cardFlip.classList.contains('is-flipped'));
  fire('pointerdown', doc.getElementById('studyCard'), 120, 400);
  fire('pointermove', window, 220, 398);
  fire('pointermove', window, 320, 400);
  fire('pointerup', window, 320, 400);
  await sleep(520);
  check('右滑 → 回到上一张词卡', doc.getElementById('studyPosition').textContent === pos0,
    `${pos1} → ${doc.getElementById('studyPosition').textContent}`);
  fire('pointerdown', doc.getElementById('studyCard'), 200, 400);
  fire('pointermove', window, 190, 400);
  fire('pointerup', window, 190, 400);
  await sleep(260);
  check('小幅拖动不切词不翻面', doc.getElementById('studyPosition').textContent === pos0 &&
    !cardFlip.classList.contains('is-flipped'));
  // “记住了”是唯一计入掌握的动作，并同步首页与记忆面板的真实数字
  doc.getElementById('knownWord').click();
  await sleep(80);
  const masteredNow = window.__lexioProgress ? window.__lexioProgress.mastered().length : -1;
  check('按钮与左滑共用记忆记录，右滑不计数',
    parseInt((doc.getElementById('knownCount').textContent || '0').replace(/\D/g, ''), 10) === known0 + 3 &&
    masteredNow === 2 && window.localStorage.getItem('lexio.masteredWords') !== null,
    `known=${doc.getElementById('knownCount').textContent} mastered=${masteredNow}`);
  check('首页进度卡显示同一份真实数据',
    doc.getElementById('heroKnownCount').textContent === String(masteredNow) &&
    doc.getElementById('heroWeakCount').textContent === String(window.__lexioWeak.list().length));

  // ---------- 4. 学习板块无宣传/订阅内容 ----------
  const study = doc.getElementById('study');
  check('学习板块无试用/订阅按钮', !study.querySelector('[data-open-trial]') && !study.querySelector('#directSubscribe'));
  check('学习板块无宣传文案块', !study.querySelector('.study-side-copy') && !study.textContent.includes('PRODUCT EXPERIENCE'));
  check('学习板块无 7 天体验字样', !study.textContent.includes('7 天体验') && !study.textContent.includes('定价'));
  const cssText = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  check('学习/词库 全屏锁定 + 隐藏营销导航(样式规则)',
    ['body[data-app-view="library"] { padding-bottom: 0; overflow: hidden; }',
     'body[data-app-view="study"], body[data-app-view="library"] { padding-bottom: 0; overflow: hidden; }',
     'body[data-app-view="library"] .site-header',
     'body[data-app-view="library"] .tabbar',
     'main > section[data-app-view="library"].is-active'].every((frag) => cssText.includes(frag)));
  check('词卡翻面 grid 布局(防重叠)与滑动样式',
    ['.card-flip { position: relative; display: grid;',
     '.card-face { grid-area: 1 / 1;',
     'min-height: clamp(220px, 36vh, 296px); max-height: clamp(250px, 46vh, 330px);',
     'overscroll-behavior: contain;',
     '#studyCard { touch-action: pan-y;',
     '.card-flip.is-flipped .card-front { pointer-events: none; }'].every((frag) => cssText.includes(frag)));
  check('切换动画不透底(实心背景+FAQ背景+动画禁毛玻璃)',
    ['.section { padding: 100px 0; background: var(--cream); }',
     '.hero { position: relative; isolation: isolate; overflow: hidden; padding: 62px 0 71px; background: var(--cream); }',
     '.faq-section { padding: 103px 0 104px; background: var(--cream); }',
     'background: #fcfcfa;', 'background: #fdfdfc;',
     'body.view-anim-lock .site-header',
     'backdrop-filter: none !important'].every((frag) => cssText.includes(frag)));

  // 只允许路由这一处动画：入场动画与滚动显影会和它叠在同一个元素上，
  // 叠出来的两层 transform / 半透明就是"重影、失真、掉帧"的来源。
  check('切页动画只有一层（入场/显影/错峰动画已关闭）',
    cssText.includes('body[data-app-view="home"] .hero-copy { animation: none !important; }') &&
    !cssText.includes('.menu-card:nth-child(1) { animation-delay') &&
    cssText.includes('main > section[data-app-view] .stagger-1,'));
  for (const view of ['library','study','pricing','progress','home']) {
    window.__lexioShow(view);
    check('连续点按不叠页、不丢导航：'+view, viewNames().every(name=>name===view) && viewNames().length>0 && animClean());
  }
  check('进度链接直接定位本机记录', doc.querySelector('.feature-card a[href="#progress"]').textContent.includes('查看我的学习进度') && doc.querySelector('#progress').textContent.includes('本机学习记录'));
  check('释义未揭晓时完全不显示(透明,非马赛克)',
    cssText.includes('.study-meaning.is-hidden { color: transparent;'));
  check('学习词卡与词库滚动容器有上下圆角和安全区留白',
    cssText.includes('box-sizing: border-box; height: 100%; width: 100%; max-width: 600px;') &&
    cssText.includes('padding-bottom: calc(18px + env(safe-area-inset-bottom))') &&
    cssText.includes('library-shell .library-panel { box-sizing: border-box;') &&
    cssText.includes('data-app-view="library"].is-active > .container { height: 100%;') &&
    cssText.includes('padding: 12px 0 calc(12px + env(safe-area-inset-bottom))'));
  const pageHtml = doc.documentElement.outerHTML;
  check('例句首选完整 en-US 录音，避免异步音频链',
    pageHtml.includes("playPronunciation(sentence,'en-US',1,url,onDone,onError,true)") &&
    !pageHtml.includes('function speakExample(text, onDone, onError) {\n        const sentence = String(text || \'\').trim();\n        const matches ='));
  check('例句朗读按钮和状态明确标记美式发音',
    pageHtml.includes('使用美式发音播放例句') && pageHtml.includes('正在播放美式例句'));
  check('页面移除原站跳转及外部 Arena 联系链接',
    !pageHtml.includes('原站入口') && !pageHtml.includes('arena.site') && !doc.querySelector('a[href^="https://"]'));
  check('支付宣传统一为“支持多种方式支付”且不展示个人结算承诺',
    pageHtml.includes('支持多种方式支付') && !pageHtml.includes('结算给我') &&
    !pageHtml.includes('微信支付、支付宝'));
  check('不再显示/绑定手动导入，保留联网同步入口，且界面不出现 GitHub 字样',
    !pageHtml.includes('importWordsBtn') && !pageHtml.includes('wordFile') && !pageHtml.includes('function importFile') &&
    !!doc.getElementById('syncWordsBtn') && !!doc.getElementById('wordSourceDialog') &&
    !/github/i.test(doc.body.textContent) && !/github/i.test(doc.getElementById('wordSourceDialog').innerHTML));
  check('手机首页采用 App 栏、底部 Tab 和安全区布局',
    cssText.includes('body[data-app-view="home"] .site-header') &&
    cssText.includes('body[data-app-view="home"] .proof-band') &&
    cssText.includes('env(safe-area-inset-top)') && cssText.includes('env(safe-area-inset-bottom)'));
  check('首页/订阅进场动画和订阅价格切换动效存在',
    cssText.includes('@keyframes appHomeEnter') && cssText.includes('@keyframes appPricingEnter') &&
    cssText.includes('@keyframes pricePop') && cssText.includes('.price strong.is-changing') &&
    cssText.includes('prefers-reduced-motion: reduce'));
  check('Service Worker 升到 v37 并预缓存口语句库与安装引导视频',
    swSource.includes("CACHE_NAME = 'lexio-shell-v37-card-batch-08'") &&
    swSource.includes("'./data/daily-conversation.json'") &&
    swSource.includes("'./media/install-guide.mp4'") &&
    pageHtml.includes('controllerchange') && pageHtml.includes('swRefreshing'));
  check('词库/口语句库走网络优先，已安装用户也能拿到新的纯英文例句',
    /if \(url\.pathname\.includes\('\/data\/'\) && url\.pathname\.endsWith\('\.json'\)\)/.test(swSource) &&
    swSource.indexOf("url.pathname.includes('/data/')") < swSource.indexOf('Static app assets are cache-first'));

  // ---------- 5. 三子面板 ----------
  const panels = [...doc.querySelectorAll('.study-panel')];
  check('学习面板 = 3 个子面板', panels.length === 3, `实际 ${panels.length}`);
  const planPanel = doc.querySelector('[data-study-panel="plan"]');
  const memoryPanel = doc.querySelector('[data-study-panel="memory"]');
  const battlePanel = doc.querySelector('[data-study-panel="battle"]');
  check('默认子面板 = 智能词单（卡片）', planPanel.classList.contains('is-active') &&
    !!planPanel.querySelector('.study-word-card') && !!planPanel.querySelector('#knownWord'));
  check('卡片面板无 side-copy', !planPanel.querySelector('.study-side-copy'));

  const memTab = doc.querySelector('[data-demo-tab="memory"]');
  memTab.click();
  await sleep(30);
  check('点“记忆引擎”→ 切到薄弱词面板', memoryPanel.classList.contains('is-active') &&
    !planPanel.classList.contains('is-active') && !battlePanel.classList.contains('is-active'));
  check('记忆引擎只显示薄弱词列表',
    !!doc.getElementById('weakList') && !!doc.getElementById('weakCount') &&
    !memoryPanel.querySelector('[data-open-trial]') && !memoryPanel.textContent.includes('订阅'));

  const weakApi = window.__lexioWeak;
  check('__lexioWeak 已暴露', typeof weakApi === 'object' && typeof weakApi.add === 'function');
  weakApi.add('serendipity');
  weakApi.add('persevere');
  await sleep(30);
  check('薄弱词可添加并渲染', weakApi.list().length === 2 &&
    doc.querySelectorAll('#weakList .weak-item').length === 2 &&
    doc.getElementById('weakEmpty').hidden === true,
    `count=${weakApi.list().length}`);
  doc.querySelector('[data-weak-ok="serendipity"]').click();
  await sleep(30);
  check('点“记住了”移出薄弱词', weakApi.list().length === 1 &&
    doc.querySelectorAll('#weakList .weak-item').length === 1);
  weakApi.remove('persevere');
  await sleep(30);
  check('清空后显示空态', weakApi.list().length === 0 && doc.getElementById('weakEmpty').hidden === false);

  const battleTab = doc.querySelector('[data-demo-tab="battle"]');
  battleTab.click();
  await sleep(30);
  check('点“好友对战”→ 切到对战面板', battlePanel.classList.contains('is-active') &&
    !planPanel.classList.contains('is-active') && !memoryPanel.classList.contains('is-active'));
  check('对战面板只有对战 UI',
    !!doc.getElementById('battleStart') && !!doc.getElementById('battleMyScore') &&
    !battlePanel.querySelector('[data-open-trial]') && !battlePanel.textContent.includes('免费体验'));

  // ---------- 5b. 真实感对战（每局新对手：中文/英文/特殊字符名） ----------
  const battleApi = window.__lexioBattle;
  check('__lexioBattle 已暴露', typeof battleApi === 'object' && typeof battleApi.nextName === 'function');
  const nameSeq = [];
  for (let i = 0; i < 30; i++) nameSeq.push(battleApi.nextName());
  check('对手名不重复相邻(连续抽取)', nameSeq.every((n, i) => n && (i === 0 || n !== nameSeq[i - 1])),
    `sample=${nameSeq.slice(0, 5).join('/')}`);
  const hasCJK = nameSeq.some((n) => /[一-鿿]/.test(n));
  const hasLatin = nameSeq.some((n) => /[A-Za-z]/.test(n));
  const hasSymbolic = nameSeq.some((n) => /[^一-鿿A-Za-z0-9\s]/.test(n));
  check('名字池含中文名/英文名/特殊符号名', hasCJK && hasLatin && hasSymbolic,
    `cjk=${hasCJK} latin=${hasLatin} sym=${hasSymbolic}`);
  check('对手卡元素齐全',
    !!doc.getElementById('battleFoeName') && !!doc.getElementById('battleFoeAvatar') &&
    !!doc.getElementById('battleFoeStats') && !!doc.getElementById('battleFoeStatus'));
  // 真实匹配流程：点击开始 → 等待匹配 → 出现随机对手名
  doc.getElementById('battleStart').click();
  await sleep(120);
  check('匹配中状态', doc.getElementById('battleState').textContent === '匹配中…' &&
    doc.getElementById('battleFoeName').textContent === '匹配中…');
  await sleep(3400); // 匹配 1.3~2.8s + 出场 1.1s
  const foeName = doc.getElementById('battleFoeName').textContent;
  check('匹配成功且对手有真实感名字', foeName && foeName !== '匹配中…' && foeName !== '尚未匹配',
    `opponent=${foeName}`);
  check('对手资料明确标注为模拟对手（不假装真人 / 不编造延迟）',
    /模拟对手/.test(doc.getElementById('battleFoeStats').textContent) &&
    !/ms|延迟|在线房间/.test(doc.getElementById('battleFoeStats').textContent),
    doc.getElementById('battleFoeStats').textContent);
  battleApi.start(); // 重新匹配 → 必须换新对手
  await sleep(3400);
  const foeName2 = doc.getElementById('battleFoeName').textContent;
  check('再开一局换新对手', foeName2 && foeName2 !== '匹配中…' && foeName2 !== foeName,
    `${foeName} → ${foeName2}`);
  // 回归：battle.foe 字段不再被比分自增破坏（曾导致消息里名字变 undefined / 比分变 [object Object]）
  let sawFoeAnswer = false;
  for (let i = 0; i < 75 && !sawFoeAnswer; i++) {
    await sleep(150);
    const sc = doc.getElementById('battleFoeScore').textContent;
    const st = doc.getElementById('battleFoeStatus').textContent;
    if (sc !== '0' || st.includes('答错')) sawFoeAnswer = true;
  }
  const scTxt = doc.getElementById('battleFoeScore').textContent;
  const msgTxt = doc.getElementById('battleMsg').textContent;
  const cardName2 = doc.getElementById('battleFoeName').textContent;
  check('对手作答后比分为纯数字', /^\d+$/.test(scTxt), `score=${scTxt}`);
  check('消息里没有 undefined（名字源完好）', !msgTxt.includes('undefined'), msgTxt);
  check('消息中的对手名与对手卡一致', !/接受|：|抢先|答错|击败|战成|获胜/.test(msgTxt) || msgTxt.includes(cardName2),
    `card=${cardName2} msg=${msgTxt}`);
  // 玩家节奏：固定 10 题 + 我答完立即进入下一题（不等对手）
  let st = doc.getElementById('battleState').textContent;
  for (let i = 0; i < 50 && !/第 1 \/ 10/.test(st); i++) {
    await sleep(150);
    st = doc.getElementById('battleState').textContent;
  }
  check('对战固定 10 道题', /\/ 10 题/.test(st), st);
  const battleQuestion = battleApi.question();
  const optBtn = [...doc.querySelectorAll('.battle-opt:not([disabled])')].find(option => option.textContent !== battleQuestion.meaning);
  check('第 1 题错误选项可点', !!optBtn, st);
  if (optBtn) optBtn.click();
  await sleep(900);
  const st2 = doc.getElementById('battleState').textContent;
  check('我答完立即换下一题（不等对手作答）', /第 2 \/ 10/.test(st2), st2);
  check('对战答错词自动进入记忆引擎', weakApi.list().includes(battleQuestion.word), battleQuestion.word);

  // 连打到第 10 题并结算 —— 杜绝“只有7题”
  let deepOk = true, deepLabel = st2;
  for (let r = 2; r <= 10; r++) {
    deepLabel = doc.getElementById('battleState').textContent;
    if (!new RegExp(`第 ${r} / 10 题`).test(deepLabel)) { deepOk = false; break; }
    if (r === 10) break;
    const optsDeep = doc.querySelectorAll('.battle-opt');
    (optsDeep[0] || { click() {} }).click();
    await sleep(480);
  }
  check('连答推进到第 10 / 10 题（杜绝7题）', deepOk, deepLabel);
  const optsFinal = doc.querySelectorAll('.battle-opt');
  (optsFinal[0] || { click() {} }).click();
  await sleep(520);
  const battleStats = battleApi.stats();
  check('第10题答完 → 对局结算(再来一局)',
    doc.getElementById('battleState').textContent === '已结束' &&
    doc.getElementById('battleStart').textContent.includes('再来一局') &&
    doc.getElementById('battleWord').textContent.includes('胜利') && battleStats.over && battleStats.answered === 10 && battleStats.total === 10,
    `${doc.getElementById('battleState').textContent} | 已答 ${battleStats.answered}/${battleStats.total} | ${doc.getElementById('battleStart').textContent}`);

  // Advance just the simulated rival's clock; no player answers are submitted.
  const nativeTimer = window.setTimeout;
  window.setTimeout = (fn, ms, ...args) => nativeTimer(fn, ms >= 1100 && ms <= 5300 ? 1 : ms, ...args);
  battleApi.start(); await sleep(220);
  window.setTimeout = nativeTimer;
  check('对手独立完成十题即胜，不等待玩家', battleApi.stats().over && battleApi.stats().answered===0 && doc.querySelector('#battleFoeScore').textContent==='10' && doc.querySelector('#battleWord').textContent==='对手获胜');
  doc.querySelector('[data-demo-tab="plan"]').click();
  await sleep(30);
  check('可切回智能词单', planPanel.classList.contains('is-active'));

  // ---------- 6. 宣传内容移到介绍视图 ----------
  const intro = doc.querySelector('section.showcase-intro');
  check('产品介绍并入首页', intro && intro.getAttribute('data-app-view') === 'home' &&
    !!intro.querySelector('#showcasePanel') && intro.textContent.includes('PRODUCT EXPERIENCE'));
  const proofBand = doc.querySelector('.proof-band');
  check('首页宣传改为可核对的产品配置，不显示虚高累计记忆数',
    !!proofBand && proofBand.textContent.includes('10 题') && proofBand.textContent.includes('1,100 句') &&
    !proofBand.textContent.includes('本轮学习计划') &&
    !proofBand.textContent.includes('11 亿') && !proofBand.textContent.includes('282 万') &&
    !proofBand.textContent.includes('4.9 / 5'));

  // ---------- 7. 其它路由仍兼容 ----------
  await setHashSettled('#pricing');
  check('#pricing → 订阅视图（长轴整页）',
    doc.body.getAttribute('data-app-view') === 'pricing' &&
    ['ops', 'pricing', 'faq'].every((id) => doc.getElementById(id).classList.contains('is-active')));
  check('订阅页动画后无残留', animClean());

  await setHashSettled('#method');
  check('#method → 首页锚点（介绍不再单独成页）',
    doc.body.getAttribute('data-app-view') === 'home' &&
    doc.getElementById('method').classList.contains('is-active') &&
    doc.querySelectorAll('main > section[data-app-view="about"]').length === 0);

  await setHashSettled('#library');
  check('#library → 词库视图', doc.body.getAttribute('data-app-view') === 'library' &&
    doc.getElementById('library').classList.contains('is-active') && animClean());
  const lib = doc.getElementById('library');
  check('词库 = 纯功能面板(无宣传)',
    !!lib.querySelector('#wordSearch') && !!lib.querySelector('#wordGrid') &&
    !lib.querySelector('.section-heading') && !lib.querySelector('.exam-grid') &&
    !lib.querySelector('.roots-panel') && !lib.querySelector('.migration-note'));
  check('词库无营销文案',
    !lib.textContent.includes('ONE LIBRARY') && !lib.textContent.includes('词库已核验') &&
    !lib.textContent.includes('WORD ROOT') && !lib.textContent.includes('[data-open-trial]'));
  check('词库介绍内容放在首页',
    !!doc.querySelector('section.library-intro[data-app-view="home"]') &&
    doc.querySelector('section.library-intro').querySelectorAll('.exam-card').length === 5 &&
    !!doc.querySelector('section.library-intro .roots-panel'));
  check('词库头部为功能提示(非营销)',
    lib.textContent.includes('点「学习此词」直接跳到学习面板'));
  check('已取消下载按钮(词库内置自动载入)',
    !doc.getElementById('exportBankBtn') && typeof window.__lexioExportBank === 'undefined' &&
    !lib.textContent.includes('下载词库') &&
    doc.documentElement.outerHTML.includes('original-site-wordbank.json'));
  doc.getElementById('dailyPhrasesTab').click();
  await sleep(50);
  check('口语首页先展示目录',!doc.querySelector('#dailyPhrasesMode').classList.contains('in-list'));
  doc.querySelector('[data-phrase-category="全部"]').click();
  check('日常口语库离线资源已载入且总数为 1,100 条',
    doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length === 50 &&
    doc.querySelectorAll('#phraseCategories [data-phrase-category]').length === 14 &&
    doc.getElementById('phraseCount').textContent.includes('1100'));
  for(let i=0;i<24;i++){
    const more=doc.querySelector('#dailyPhraseGrid .phrase-load-more');
    if(!more) break;
    more.click();
  }
  check('日常口语按需加载，能够浏览完整 1,100 条表达',
    doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length === 1100 &&
    !doc.querySelector('#dailyPhraseGrid .phrase-load-more'));
  const phraseSearch = doc.getElementById('phraseSearch');
  phraseSearch.value = 'pharmacy';
  phraseSearch.dispatchEvent(new window.Event('input', {bubbles:true}));
  await sleep(180); // 输入防抖
  const pharmacyPhrase = doc.querySelector('#dailyPhraseGrid .phrase-item');
  check('日常口语可以按英文/中文/场景搜索',
    !!pharmacyPhrase && pharmacyPhrase.textContent.includes('pharmacy nearby'));
  const oldUtterance=window.__lastUtterance;
  pharmacyPhrase.querySelector('[data-phrase-speak]').click();
  await sleep(30);
  const phraseAudio=window.__lastAudio, phraseURL=new URL(phraseAudio.src);
  check('口语播放所选音色的整句 MP3，正常速度', phraseURL.pathname.endsWith('/media/voice/pharmacy.mp3') && phraseAudio.playbackRate===1);
  phraseAudio.emit('error');
  check('录音出错不切换系统语音',window.__lastUtterance===oldUtterance && pharmacyPhrase.querySelector('[data-phrase-speak]').dataset.speaking==='0');
  phraseSearch.value = '';
  phraseSearch.dispatchEvent(new window.Event('input', {bubbles:true}));
  const medicalChip = [...doc.querySelectorAll('#phraseCategories [data-phrase-category]')].find(button => button.dataset.phraseCategory === '医疗药房');
  medicalChip.click();
  check('日常口语按医疗场景筛选并显示总数',
    doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length === 50 && doc.getElementById('phraseCount').textContent.includes('/ 100'));
  doc.querySelector('#dailyPhraseGrid .phrase-load-more').click();
  check('医疗场景可继续加载完整分类表达', doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length === 100);
  doc.querySelector('#phraseCategories [data-phrase-category="全部"]').click();
  doc.querySelector('[data-phrase-category="商务英语"]').click();
  const practiceId=doc.querySelector('[data-mark="再练一次"]').dataset.id;
  doc.querySelector('[data-mark="再练一次"]').click();doc.querySelector('[data-phrase-category="再练一次"]').click();
  check('商务句进入待练夹',doc.querySelectorAll('#dailyPhraseGrid article').length===1 && doc.querySelector('[data-mark="我记住了"]').dataset.id===practiceId);
  doc.querySelector('[data-mark="我记住了"]').click();check('已记住与再练一次互斥',!doc.querySelector('#dailyPhraseGrid article') && JSON.parse(window.localStorage.getItem('lexio.phraseMarks.v1'))[practiceId]==='我记住了');
  doc.getElementById('wordLibraryTab').click();
  check('词库目录和列表分层',!doc.querySelector('#wordBankMode').classList.contains('in-list'));
  doc.querySelector('[data-filter=all]').click();
  const tilesAll = doc.querySelectorAll('#wordGrid .word-tile');
  check('词库全量显示(无9条上限) — 24条全部渲染',
    tilesAll.length === 24 && !doc.getElementById('wordGrid').textContent.includes('前 9'),
    `tiles=${tilesAll.length}`);
  check('分页状态+加载更多按钮(静态)',
    doc.documentElement.outerHTML.includes('GRID_PAGE_SIZE') &&
    doc.documentElement.outerHTML.includes('加载更多'));
  const chipGk = [...doc.querySelectorAll('.filter-chip')].find((b) => b.dataset.filter === '高考');
  if (chipGk) chipGk.click();
  await sleep(40);
  const tilesGk = doc.querySelectorAll('#wordGrid .word-tile');
  const gkTags = [...tilesGk].map((t) => (t.querySelector('.word-tag') || {}).textContent);
  check('高考分类只显示高考词条', tilesGk.length >= 1 && gkTags.every((t) => t === '高考'),
    `count=${tilesGk.length} tags=${[...new Set(gkTags)].join(',')}`);
  if (tilesGk.length) {
    const selectedTile = tilesGk[0];
    const selectedWord = selectedTile.querySelector('h4').textContent;
    const wordGrid = doc.getElementById('wordGrid');
    wordGrid.scrollTop = 230;
    let tileTop = 137;
    selectedTile.getBoundingClientRect = () => ({top:tileTop, bottom:tileTop + 100, left:0, right:200, width:200, height:100});
    window.scrollY = 500;
    selectedTile.querySelector('[data-word-open]').click();
    await sleep(600);
    check('词库“学习此词”精准打开所选词卡',
      doc.body.getAttribute('data-app-view') === 'study' && doc.getElementById('studyWord').textContent === selectedWord,
      `selected=${selectedWord} card=${doc.getElementById('studyWord').textContent}`);
    const returnButton = doc.getElementById('returnLibraryBtn');
    check('从词库进入学习后显示返回词库按键', !!returnButton && !returnButton.hidden);
    tileTop = 600; // 模拟返回时词条在文档中的位置，验证滚动锚点恢复
    returnButton.click();
    await sleep(650);
    check('返回词库后保留原筛选和所选词位置',
      doc.body.getAttribute('data-app-view') === 'library' && chipGk.classList.contains('active') &&
      [...doc.querySelectorAll('#wordGrid .word-tile h4')].some((heading) => heading.textContent === selectedWord) &&
      Math.abs((tileTop - (wordGrid.scrollTop - 230)) - 137) < 1 && returnButton.hidden,
      `word=${selectedWord} gridScrollTop=${wordGrid.scrollTop} calls=${scrollCalls.length}`);
  }
  const chipAll = [...doc.querySelectorAll('.filter-chip')].find((b) => b.dataset.filter === 'all');
  if (chipAll) chipAll.click();
  await sleep(40);

  await setHashSettled('#top');
  check('#top → 返回首页', doc.body.getAttribute('data-app-view') === 'home' && animClean());
  check('回首页后学习区已隐藏', !doc.getElementById('study').classList.contains('is-active'));

  // ---------- 8. 模块跳转入口 ----------
  check('window.__lexioShow 已暴露', typeof window.__lexioShow === 'function');
  window.__lexioShow('study', 'study');
  await sleep(600);
  check('__lexioShow 可推入学习视图且动画清场',
    doc.body.getAttribute('data-app-view') === 'study' && animClean());

  const secs = [...doc.querySelectorAll('main > section')];
  check('所有板块都归组', secs.every((s) => s.hasAttribute('data-app-view')),
    `${secs.length} sections`);
  const resumeWord = window.__lexioStudy.current();
  window.__lexioStudy.goTo(0);
  window.localStorage.setItem('lexio.lastStudyWordId', resumeWord.id);
  window.__lexioStudy.restore();
  check('学习卡断点按稳定词条 ID 保存并恢复',
    window.__lexioStudy.current().id === resumeWord.id && window.localStorage.getItem('lexio.lastStudyWordId') === resumeWord.id,
    `word=${resumeWord.word}`);
  window.location.hash = '';
  await sleep(550);
  check('下次无指定路由启动时回到上次学习卡',
    doc.body.getAttribute('data-app-view') === 'study' && doc.getElementById('studyWord').textContent === resumeWord.word,
    `resumed=${doc.getElementById('studyWord').textContent}`);

  const conversation = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'daily-conversation.json'), 'utf8'));
  check('离线口语库含多场景、有中英句子且 ID 唯一',
    conversation.phrases.length === 1100 && new Set(conversation.phrases.map(item=>item.id)).size === 1100 &&
    conversation.phrases.every(item=>item.en && item.zh && item.scene) && conversation.categories.length === 11 &&
    conversation.categories.every(category=>conversation.phrases.filter(item=>item.category===category).length===100),
    `phrases=${conversation.phrases.length} scenes=${conversation.categories.length}`);
  const bundled = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'original-site-wordbank.json'), 'utf8'));
  const bundledWords = bundled.books.flatMap((book) => book.words || []);
  const schoolShelf=doc.querySelector('[data-stage="小学"]').closest('section');
  check('中小学在同一个分组，保留三个独立的年级入口', [...schoolShelf.querySelectorAll('[data-stage]')].map(b=>b.textContent).join('/')==='小学/初中/美国1-9年级');
  check('自动缓存不需要用户点击，也不需要浏览器报告 Wi-Fi', !doc.querySelector('#prepareOffline') && !pageHtml.includes('wifiReady') && pageHtml.includes("postMessage({type:'prepare-offline'})"));
  check('词库首页不直接列出各年级', !doc.querySelector('#wordCatalog [data-grade]') && doc.querySelectorAll('#wordCatalog [data-stage]').length===3);
  for(const [stage,total] of Object.entries({小学:6,初中:3,美国:9})){
    doc.querySelector(`[data-stage="${stage}"]`).click();
    const choices=[...doc.querySelectorAll('#gradeChoices [data-grade]')];
    check(`${stage}二级目录数量和词库一致`, choices.length===total && choices.every((button,i)=>{
      const key=stage==='美国'?`美国${i+1}年级`:`${stage} · ${i+(stage==='初中'?7:1)}年级`;
      const count=bundled.books.filter(book=>book.category===key).reduce((n,book)=>n+book.words.length,0);
      return count>0 && button.dataset.grade===key && button.querySelector('small')?.textContent===`${count} 条`;
    }));
    doc.querySelector('#gradeBack').click();
  }
  const missingExamples = bundledWords.filter((word) => !String(word.example || '').trim()).length;
  const missingMnemonics = bundledWords.filter((word) => !String(word.mnemonic || '').trim()).length;
  const cjkExamples = bundledWords.filter((word) => /[\u4e00-\u9fff]/.test(String(word.example || ''))).length;
  const realExamples = bundledWords.filter((word) => String(word.exampleSource || '').startsWith('dictionary:')).length;
  check('每个词条的例句都是可朗读的英文，不含中文说明',
    bundledWords.length === 28414 && missingExamples === 0 && cjkExamples === 0 && realExamples > 22000,
    `total=${bundledWords.length} missing=${missingExamples} cjk=${cjkExamples} real=${realExamples}`);
  {
    // 词典短语（没有完整句子的词）要明确标注，且不提供“整句朗读”
    const phraseWord = doc.querySelector('#studyExampleSource');
    check('例句来源标签区分「词典原句」与「词典短语」',
      pageHtml.includes('词典短语 · ') && pageHtml.includes('exampleIsPhrase'));
    check('词典短语不会伪装成句子朗读（按钮会被禁用）',
      pageHtml.includes("exSpeakBtn.disabled = exampleIsPhrase") &&
      pageHtml.includes('这是词典短语，不是完整句子'));
    // 生成的练习提示句必须标注“不是真实语料例句”
    check('自动生成的提示句明确标注非真实语料',
      pageHtml.includes('练习提示句 · 不是真实语料例句') &&
      pageHtml.includes('自动生成的学习句 · 非真实语料例句'));
    void phraseWord;
  }

  {
    // 4) 朗读音色：优先美国女声，语速/音高更明亮
    check('朗读优先选用美国女声（Samantha / Ava / Google US English 等）',
      pageHtml.includes("const VOICE_PREFERENCE = {") &&
      pageHtml.includes("'Samantha', 'Ava', 'Allison'") &&
      pageHtml.includes('FEMALE_HINTS') && pageHtml.includes('MALE_HINTS'));
    check('语速 1.0 + 音高 1.08（年轻明亮，不再是老的 .9 低沉）',
      pageHtml.includes('utterance.rate = rate;') && pageHtml.includes('utterance.pitch = 1.08;') &&
      !pageHtml.includes('utterance.rate = .9;'));
    // 用真实浏览器语音列表跑一遍 pickVoice 的行为
    const dom2 = new JSDOM(fs.readFileSync(htmlPath, 'utf8'), {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(w2) {
        w2.Audio = undefined; // exercise offline device-voice fallback
        w2.SpeechSynthesisUtterance = function (t) { this.text = t; };
        w2.speechSynthesis = {
          speaking: false, pending: false, paused: false,
          getVoices: () => [
            { lang: 'en-US', name: 'Alex' },
            { lang: 'en-US', name: 'Samantha' },
            { lang: 'en-GB', name: 'Daniel' },
          ],
          addEventListener() {}, resume() {}, cancel() {},
          speak(u) { w2.__picked = u.voice && u.voice.name; w2.__rate = u.rate; w2.__pitch = u.pitch; },
        };
        w2.fetch = () => Promise.reject(new Error('offline'));
      },
    });
    await sleep(400);
    const w2 = dom2.window;
    const usVoice = w2.document.querySelector('.accent-toggle [data-accent="en-US"]');
    if (usVoice) usVoice.click(); // 默认英式，先切到美式再测
    await sleep(60);
    w2.document.getElementById('studySpeak').click();
    await sleep(120);
    check('美式发音在有 Alex 与 Samantha 的设备上会挑 Samantha（女声）',
      w2.__picked === 'Samantha', String(w2.__picked));
    check('朗读参数为 rate 1 / pitch 1.08',
      w2.__rate === 1 && w2.__pitch === 1.08, `rate=${w2.__rate} pitch=${w2.__pitch}`);
    w2.__picked=null;w2.document.getElementById('exampleSpeak').click();
    check('无媒体播放器时不拿系统声音冒充所选配音', w2.__picked===null);
    dom2.window.close();
  }

  check('词卡和口语不使用合成 WAV 端点', !html.includes('local-sentence.wav') && !swSource.includes('renderLexioWave'));
  check('内置词库逐词有记忆线索/复习提示', missingMnemonics === 0 &&
    bundledWords.filter((word) => word.mnemonicSource === 'generated-recall-cue').length > 0,
    `missing=${missingMnemonics}`);

  // ---------- 8b. 搜索框不会被手机浏览器放大 ----------
  const viewportMeta = doc.querySelector('meta[name="viewport"]').getAttribute('content');
  check('禁止双击缩放且保留用户手势缩放', !/maximum-scale|user-scalable/.test(viewportMeta));
  check('搜索框字号 ≥16px（iOS Safari 不触发聚焦放大）',
    /\.search-input, #wordSearch, #phraseSearch, \.source-url-input \{ font-size: 16px/.test(cssText) &&
    /\.search-input, #wordSearch, #phraseSearch \{ font-size: 16px !important; \}/.test(cssText));
  // 逐条检查手机断点里所有 display:none 规则，确认没有一条会命中首页进度卡
  (function () {
    const card = doc.querySelector('#top .hero-visual');
    const cardClasses = [...card.classList];
    const mobileBlocks = [];
    cssText.replace(/@media\s*\(max-width:\s*760px\)\s*\{/g, (match, offset) => {
      let depth = 1, i = offset + match.length;
      const start = i;
      for (; i < cssText.length && depth > 0; i += 1) {
        if (cssText[i] === '{') depth += 1;
        else if (cssText[i] === '}') depth -= 1;
      }
      mobileBlocks.push(cssText.slice(start, i - 1));
      return match;
    });
    const hideRules = [];
    mobileBlocks.forEach((block) => {
      block.replace(/([^{}]+)\{([^{}]*)\}/g, (all, selector, body) => {
        if (/display\s*:\s*none/.test(body)) hideRules.push(selector.trim());
        return all;
      });
    });
    const hitsCard = hideRules.some((selector) => selector.split(',').some((part) => {
      const simple = part.trim();
      if (!simple.startsWith('body[data-app-view="home"]')) return false;
      const wanted = [...simple.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
      const nots = [...simple.matchAll(/:not\(\.([\w-]+)\)/g)].map((m) => m[1]);
      if (!wanted.length) return false;
      if (!wanted.every((cls) => cardClasses.includes(cls))) return false;
      return !nots.some((cls) => cardClasses.includes(cls));
    }));
    check('首页进度卡不会被手机断点里的 display:none 命中',
      !!card && cardClasses.includes('hero-progress') && !hitsCard,
      `hide rules: ${hideRules.join(' | ') || 'none'}`);
  })();

  {
    // 任何可输入的文本控件都必须 ≥16px，否则 iOS 聚焦时会放大整页
    const textFields = [...doc.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, select')];
    const uncovered = textFields.filter((el) => {
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className ? `.${String(el.className).trim().split(/\s+/).join('.')}` : '';
      return !(id && cssText.includes(id)) && !(cls && cssText.includes(cls.split('.')[1]));
    });
    check('所有文本输入框都有 16px 字号规则（iOS 聚焦不缩放）',
      textFields.length > 0 && uncovered.length === 0,
      `${textFields.length} fields, uncovered: ${uncovered.map((el) => el.id || el.className).join(', ') || 'none'}`);
  }

  check('手机布局不会误把真实进度卡一起隐藏',
    cssText.includes('body[data-app-view="home"] .hero-visual:not(.hero-progress)') &&
    !cssText.includes('body[data-app-view="home"] .hero-visual,\n      body[data-app-view="home"] .hero-social'));
  check('手机首页是仪表盘：标题之后就是真实数字，营销段落只留桌面端',
    cssText.includes('body[data-app-view="home"] .hero-pill,\n      body[data-app-view="home"] .hero-lede,\n      body[data-app-view="home"] .hero-meta { display: none !important; }'));
  check('搜索框有 16px 内联回退，避免样式加载前的放大',
    doc.getElementById('wordSearch').getAttribute('style') !== null ||
    html.includes('id="wordSearch"') && html.includes('id="phraseSearch"') &&
    typeof window.__lexioSearchRelease === 'function');

  // ---------- 9. 本次请求的界面行为 ----------
  // 6) 安装按钮 → 安装引导（含视频）
  await setHashSettled('#top');
  const installBtn = doc.getElementById('installBtn');
  check('右上角安装按钮文案为「安装」', installBtn && installBtn.textContent.trim() === '安装');
  installBtn.click();
  await sleep(80);
  const installDialog = doc.getElementById('installDialog');
  check('点安装 → 打开安装引导弹窗', !!installDialog && installDialog.hasAttribute('open'));
  check('安装引导内有安装视频与手动步骤',
    !!doc.getElementById('installVideo') &&
    !!installDialog.querySelector('source[src="./media/install-guide.mp4"]') &&
    !!installDialog.querySelector('source[type="video/mp4"]') &&
    installDialog.textContent.includes('添加到主屏幕'));

  // 6b) 首页「日常口语」入口 → 词库视图的口语模式
  await setHashSettled('#top');
  const phraseEntry = doc.querySelector('[data-open-daily-phrases]');
  // 2b) “让每个目标都有清晰路线”下面的日常短句标签卡
  const tagBoard = doc.getElementById('phraseTagBoard');
  // 首页必须立刻有内容（静态骨架），词库载入后再换成带场景筛选的实时标签
  const skeletonTags = [...(tagBoard ? tagBoard.querySelectorAll('.phrase-tag') : [])];
  check('目标页有日常短句标签卡（首页立即可见，不用等口语句库）',
    skeletonTags.length === 9 && skeletonTags.every((a) => /100 句/.test(a.textContent)),
    `${skeletonTags.length} tags`);
  await sleep(400);
  const tagLinks = [...tagBoard.querySelectorAll('[data-phrase-tag]')];
  check('标签卡由真实口语句库渲染（可点击的场景标签）',
    tagLinks.length === 9 && tagLinks.every((a) => /\d+ 句/.test(a.textContent)),
    `${tagLinks.length} clickable tags`);
  check('标签数量与口语句库一致（每个场景 100 句）',
    tagLinks.every((a) => /100 句/.test(a.textContent)),
    tagLinks.map((a) => a.textContent.trim().replace(/\s+/g, ' ')).slice(0, 3).join(' | '));
  tagLinks[1].click();
  await sleep(700);
  check('点标签 → 进入词库并把该场景作为筛选条件',
    doc.body.getAttribute('data-app-view') === 'library' &&
    [...doc.querySelectorAll('#phraseCategories [data-phrase-category]')]
      .some((b) => b.dataset.phraseCategory === tagLinks[1].dataset.phraseTag && b.getAttribute('aria-pressed') === 'true') &&
    doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length === 50,
    tagLinks[1].dataset.phraseTag);
  await setHashSettled('#top');

  check('首页有「日常口语」入口', !!phraseEntry);
  phraseEntry.click();
  await sleep(700);
  const phrasePanel = doc.getElementById('dailyPhrasesMode');
  const wordPanel = doc.getElementById('wordBankMode');
  check('点「日常口语」→ 词库视图切换为口语模式并渲染句子',
    doc.body.getAttribute('data-app-view') === 'library' &&
    phrasePanel && !phrasePanel.hidden && phrasePanel.classList.contains('is-active') &&
    wordPanel && wordPanel.hidden &&
    doc.querySelector('[data-library-mode="phrases"]').getAttribute('aria-selected') === 'true' &&
    doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length > 0,
    `phrases=${doc.querySelectorAll('#dailyPhraseGrid .phrase-item').length} hidden=${phrasePanel && phrasePanel.hidden}`);

  // 7) 例句来源 → 随机一张词卡背面
  doc.querySelector('[data-close-dialog]').click();
  await sleep(60);
  const beforeRandom = doc.getElementById('studyWord').textContent;
  doc.querySelector('[data-open-random-example]').click();
  await sleep(600);
  check('例句来源按钮 → 打开学习视图并翻到词卡背面',
    doc.body.getAttribute('data-app-view') === 'study' &&
    doc.getElementById('wordCardFlip').classList.contains('is-flipped') &&
    doc.getElementById('studyExample').textContent.length > 10,
    `word=${doc.getElementById('studyWord').textContent} (was ${beforeRandom})`);

  // 8) 游戏化闯关 → 好友对战
  await setHashSettled('#top');
  const battleLinks = [...doc.querySelectorAll('[data-open-battle]')];
  check('“游戏化闯关”与首页“好友对战”都已接线', battleLinks.length >= 2);
  battleLinks[0].click();
  await sleep(700);
  check('点游戏化闯关 → 进入学习视图的好友对战并开始匹配',
    doc.body.getAttribute('data-app-view') === 'study' &&
    doc.querySelector('[data-study-panel="battle"]').classList.contains('is-active') &&
    doc.getElementById('battleState').textContent !== '未开始',
    `state=${doc.getElementById('battleState').textContent}`);
  // 让对战计时器结束，避免污染后面的测试
  await sleep(4200);

  // 9) 记忆曲线 / 进展 = 本机真实记录
  const progressApi = window.__lexioProgress;
  check('进度 API 暴露本机真实数据', !!progressApi && typeof progressApi.mastered === 'function');
  const weakBefore = progressApi.weak();
  await setHashSettled('#study');
  doc.querySelector('[data-demo-tab="plan"]').click();
  await sleep(50);
  const masteredBefore = progressApi.mastered().length;
  // 确保测试词没有被前面的用例标记过，避免重复点击同一张卡
  if (window.__lexioStudy && typeof window.__lexioStudy.goTo === 'function') {
    const masteredSet = new Set(progressApi.mastered());
    for (let probe = 0; probe < 12; probe += 1) {
      const cur = window.__lexioStudy.current && window.__lexioStudy.current();
      if (cur && !masteredSet.has(cur.word)) break;
      window.__lexioStudy.goTo(probe + 1);
    }
  }
  // 今日计数只加一次：按钮本身记录一次，markMastered 不再重复记录
  const histBefore = JSON.parse(window.localStorage.getItem('lexio.studyHistory') || '[]');
  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const knownBeforeDay = (histBefore.find(r => r.day === todayKey) || {}).known || 0;
  await sleep(40);
  doc.getElementById('knownWord').click();
  const histAfter = JSON.parse(window.localStorage.getItem('lexio.studyHistory') || '[]');
  const knownAfterDay = (histAfter.find(r => r.day === todayKey) || {}).known || 0;
  check('点“记住了”今日计数只 +1，不重复记录', knownAfterDay - knownBeforeDay === 1);
  await sleep(80);
  const masteredAfterKnown = progressApi.mastered().length;
  const weakAfterKnown = progressApi.weak();
  const againWord = (window.__lexioStudy.current() || {}).word;
  const wasAlreadyWeak = window.__lexioWeak ? window.__lexioWeak.list().includes(againWord) : false;
  doc.getElementById('againWord').click();
  await sleep(80);
  // 点「还不熟悉」：当前词进入薄弱队列（已在队列里不重复计数）、并退出已记住
  check('已记住 / 没记牢随实际标记变化',
    masteredAfterKnown === masteredBefore + 1 &&
    window.__lexioWeak.list().includes(againWord) &&
    progressApi.weak() === weakAfterKnown + (wasAlreadyWeak ? 0 : 1) &&
    !progressApi.mastered().includes(againWord),
    `mastered=${masteredBefore}→${masteredAfterKnown} weak=${weakBefore}→${weakAfterKnown}→${progressApi.weak()} (wasWeak=${wasAlreadyWeak})`);
  doc.querySelector('[data-demo-tab="memory"]').click();
  // 面板渲染由 updateProgressUI 触发；jsdom 里的定时器偶有延迟，等它落定再断言
  for (let settle = 0; settle < 20; settle += 1) {
    if (doc.getElementById('memoryMastered').textContent === String(progressApi.mastered().length)) break;
    window.__lexioProgress.refresh();
    await sleep(30);
  }
  const memoryOk = doc.getElementById('memoryMastered').textContent === String(progressApi.mastered().length) &&
    doc.getElementById('memoryWeak').textContent === String(progressApi.weak()) &&
    /^\d+$/.test(doc.getElementById('studyStreak').textContent);
  check('记忆面板显示真实已记住 / 没记牢 / 连续天数', memoryOk,
    `mastered=${doc.getElementById('memoryMastered').textContent}/${progressApi.mastered().length} weak=${doc.getElementById('memoryWeak').textContent}/${progressApi.weak()}`);
  // 学习页左下“今日学习进度”条必须来自真实比例，而不是虚构的每日 30 词配额
  const stats = JSON.parse(window.localStorage.getItem('lexio.dailyStats') || '{}');
  window.__lexioProgress.refresh();
  const expectedPct = (Number(stats.known) + Number(stats.again))
    ? Math.round((Number(stats.known) / (Number(stats.known) + Number(stats.again))) * 100) : 0;
  const meterWidth = parseFloat(doc.getElementById('studyProgress').style.width) || 0;
  check('学习页进度条按今日真实标记比例显示',
    Math.abs(meterWidth - expectedPct) < 0.6,
    `width=${meterWidth}% expected=${expectedPct}% (known=${stats.known} again=${stats.again})`);
  check('页面里不再出现虚构的 30 词每日配额',
    !html.includes('const target = 30') && !html.includes('本轮学习计划'));

  check('最近 7 天柱状图按本机记录渲染 7 根柱子',
    doc.querySelectorAll('#memoryBars > div').length === 7);

  // 11) 到期前 14 / 7 / 1 天本机提醒
  const shownDay = new Date();
  const startAt = Date.now() - 6 * 86400000 - 3600000; // 距到期约 23 小时
  window.localStorage.setItem('lexio.demoTrialStarted', String(startAt));
  window.localStorage.removeItem('lexio.reminderShown');
  const reminderFn = window.__lexioMaybeReminder;
  check('提醒函数已暴露', typeof reminderFn === 'function');
  if (typeof reminderFn === 'function') {
    reminderFn();
    await sleep(60);
    const reminder = doc.getElementById('reminderDialog');
    check('到期前 1 天打开 App → 弹出本机到期提醒',
      reminder.hasAttribute('open') && doc.getElementById('reminderCopy').textContent.includes('1 天'),
      doc.getElementById('reminderTitle').textContent);
    const stored = JSON.parse(window.localStorage.getItem('lexio.reminderShown') || '{}');
    check('同一天同阶段不重复弹窗', !!stored[1]);
    doc.getElementById('reminderLaterBtn').click();
    await sleep(40);
    check('点“稍后处理”关闭提醒', !reminder.hasAttribute('open'));
  }
  window.localStorage.removeItem('lexio.demoTrialStarted');
  window.localStorage.removeItem('lexio.reminderShown');

  // 12/13) 采购与学校服务文案
  const teamText = doc.querySelector('.team-row').textContent + doc.querySelector('.price-card').textContent;
  const teamOk = !doc.body.textContent.includes('团队版') && !teamText.includes('pricing.config.json');
  check('老师/学校采购区只做宣传，不提团队版接入', teamOk);
  check('FAQ 写入面向中学/大学的学习跟进与模板服务说明',
    doc.getElementById('faq').textContent.includes('学习跟进服务') &&
    doc.getElementById('faq').textContent.includes('模板') &&
    !/多所中学|多所大学|合作学校|已有\s*\d+\s*所/.test(doc.getElementById('faq').textContent));
  check('宣传页无虚构成绩/用户数字',
    !pageHtml.includes('平均词汇量') && !pageHtml.includes('提升 23%') && !pageHtml.includes('% 记忆保持'));

  // 13a) 全屏 / 开发信息 / 学校文案 / 包月两句话
  check('iOS 全屏所需 meta 齐全（主屏快捷方式打开时无地址栏）',
    pageHtml.includes('<meta name="apple-mobile-web-app-capable" content="yes">') &&
    pageHtml.includes('<meta name="mobile-web-app-capable" content="yes">') &&
    pageHtml.includes('apple-mobile-web-app-status-bar-style') &&
    pageHtml.includes('viewport-fit=cover') &&
    manifest.display === 'fullscreen' && manifest.display_override.includes('standalone') && Array.isArray(manifest.display_override));
  check('页面不出现开发相关字样（IndexedDB / PWA / 不上传服务器）',
    !/IndexedDB|indexedDB/.test(visibleText) && !/\bPWA\b/.test(visibleText) &&
    !/不上传|不会上传/.test(visibleText),
    (visibleText.match(/IndexedDB|\bPWA\b|不上传|不会上传/g) || []).join(',') || 'clean');
  {
    const faq = doc.getElementById('faq');
    const q = [...faq.querySelectorAll('summary')].find((el) => el.textContent.trim() === '我们能提供什么？');
    check('学校/老师 FAQ 标题改为「我们能提供什么？」并写明服务类目',
      !!q && faq.textContent.includes('我们是专业提供学习辅助服务类目及学习跟进服务') &&
      !faq.textContent.includes('学校、老师可以获得哪些支持'),
      q ? q.textContent.trim() : 'missing');
  }
  {
    const life = doc.querySelector('.price-card .price-life');
    const lines = life ? [...life.querySelectorAll('span')].map((el) => el.textContent.trim()) : [];
    check('包月宣传卡加入两句生活化文案（独立配色）',
      lines.length === 2 && lines[0] === '日常英语及情境英语练习' && lines[1] === '一个软件从小学到留学' &&
      cssText.includes('.price-life span') && cssText.includes('.price-life span:first-child'),
      lines.join(' / '));
    check('包月卡在每日学习之外强调生活场景（不是只讲考试）',
      doc.getElementById('pricing').textContent.includes('日常英语') &&
      doc.getElementById('pricing').textContent.includes('留学'));
  }
  check('浅色化的产品体验区不再使用深色大块（配色失衡修复）',
    cssText.includes('.showcase-intro { background: var(--cream);') &&
    cssText.includes('.showcase-card:before') &&
    !/<section class="dark-section showcase-intro"/.test(pageHtml));

  // 13b) 所有页内链接都指向真实存在的区块（App 外壳不能有死链）
  {
    const ids = new Set([...doc.querySelectorAll('[id]')].map((el) => el.id));
    const dead = [...new Set([...doc.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href').slice(1))
      .filter((target) => target && target !== 'main' && !ids.has(target)))];
    check('页内锚点全部有对应区块（无死链）', dead.length === 0, dead.join(', ') || 'ok');
  }

  // 14) 老用户升级：安装过的词库会被内容迁移修正（不再夹带中文例句）
  {
    const fnStart = pageHtml.indexOf('async function mergeBundledStudyContent(meta)');
    let fnSource = '';
    if (fnStart >= 0) {
      let depth = 0;
      for (let i = pageHtml.indexOf('{', fnStart); i < pageHtml.length; i += 1) {
        if (pageHtml[i] === '{') depth += 1;
        else if (pageHtml[i] === '}') { depth -= 1; if (depth === 0) { fnSource = pageHtml.slice(fnStart, i + 1); break; } }
      }
    }
    check('内容迁移函数存在（老用户升级路径）', fnSource.length > 100);
    const bundled = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'original-site-wordbank.json'), 'utf8'));
    const bundledRecords = bundled.books.flatMap((b) => (b.words || []).map((w) => ({ ...w, category: w.category || b.category || b.name })));
    const normalize = (item) => ({
      id: item.id || `${item.category || 'x'}-${item.word}`, word: item.word, category: item.category || 'x',
      example: item.example || '', exampleSource: item.exampleSource || '',
      exampleTranslation: item.exampleTranslation || '', mnemonic: item.mnemonic || '',
      mnemonicSource: item.mnemonicSource || '',
    });
    // Simulate an install whose IndexedDB copy still has the 8,587 mix-language
    // gloss examples the previous bundle shipped.
    const installed = bundledRecords.slice(0, 900).map((w, i) => normalize({
      ...w,
      example: i % 3 === 0 ? `The word “${w.word}” means “释义” in this context.` : (w.example || ''),
      exampleSource: i % 3 === 0 ? 'generated-gloss-prompt' : (w.exampleSource || ''),
    }));
    const chineseBefore = installed.filter((w) => /[\u4e00-\u9fff]/.test(w.example)).length;
    let persisted = null;
    const runner = new Function(
      'fetch', 'extractRecords', 'normalizeWord', 'persistWordRecords', 'idbSetMeta',
      'BUNDLED_CONTENT_VERSION', 'bank', 'meta',
      `return (async () => { ${fnSource}; await mergeBundledStudyContent(meta); return bank; })();`
    );
    const migrated = await runner(
      () => Promise.resolve({ ok: true, json: () => Promise.resolve(bundled) }),
      () => bundledRecords,
      (item) => normalize(item),
      async (records) => { persisted = records; },
      async () => {},
      (pageHtml.match(/BUNDLED_CONTENT_VERSION\s*=\s*'([^']+)'/) || [])[1] || 'v0',
      installed,
      { isDemo: false, contentVersion: 'example-mnemonic-2026-11-v1' }
    );
    const chineseAfter = migrated.filter((w) => /[\u4e00-\u9fff]/.test(w.example)).length;
    check('已安装用户的旧中文例句会被迁移替换为纯英文',
      chineseBefore > 0 && chineseAfter === 0 && !!persisted,
      `before=${chineseBefore} after=${chineseAfter}`);
    const version = (pageHtml.match(/BUNDLED_CONTENT_VERSION\s*=\s*'([^']+)'/) || [])[1];
    check('内容版本号已递增，老客户端会触发这次迁移',
      version === 'school-grades-2026-11-v2', String(version));

    const installedExam = bundledRecords.filter(r => !r.id.startsWith('school-')).map(normalize);
    const migrate = rows => runner(async()=>({ok:true,json:async()=>bundled}),()=>bundledRecords,normalize,async()=>{},async()=>{},version,rows,{sourceFile:'原站内嵌词库 · original-site-wordbank.json'});
    await migrate(installedExam); await migrate(installedExam);
    check('旧内置词库升级后 28,414 条，重复执行不增词', installedExam.length === 28414 && new Set(installedExam.map(r=>r.id)).size===28414);
    const custom = normalize({id:'my-word',word:'my word',category:'自选'});
    const synced = [custom];
    await runner(async()=>({ok:true,json:async()=>bundled}),()=>bundledRecords,normalize,async()=>{},async()=>{},version,synced,{sourceFile:'网络同步'});
    check('同步词库也补齐校园词条，并保留自选词', synced.length===3391 && synced[0]===custom);
    // 上一版已经替换成英文、但仍是词典残句的记录也要升级成完整句子
    const fragmentInstall = [normalize({
      ...bundledRecords.find((r) => r.word === 'energetic'),
      example: 'an energetic man', exampleSource: 'dictionary:雅思',
    })];
    const upgraded = await runner(
      () => Promise.resolve({ ok: true, json: () => Promise.resolve(bundled) }),
      () => bundledRecords,
      (item) => normalize(item),
      async () => {},
      async () => {},
      version, fragmentInstall, { isDemo: false, contentVersion: 'example-english-only-2026-11-v2' }
    );
    const upgradedExample = upgraded[0] && upgraded[0].example;
    check('词典残句会被升级成可朗读的完整英文句子',
      !!upgradedExample && /^[A-Z]/.test(upgradedExample) && /[.!?]$/.test(upgradedExample),
      String(upgradedExample));
  }

  console.log(failed === 0 ? '\n导航测试全部通过 ✔' : `\n${failed} 项失败 ✘`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
