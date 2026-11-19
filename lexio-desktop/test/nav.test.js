'use strict';

/**
 * 多视图导航测试（v3）：首页菜单层级 + iOS 式推入动画 + 学习面板全屏锁定 + 三子面板。
 * 运行：node test/nav.test.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const htmlPath = path.join(__dirname, '..', '..', 'lexio-pwa-full', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const vc = new VirtualConsole(); // 吞掉应用脚本在 jsdom 环境的预期报错（fetch/IndexedDB 不存在）
vc.on('jsdomError', () => {});
vc.on('error', () => {});

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
});

const { window } = dom;
const doc = window.document;

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
  check('首页分组激活', viewNames().every((v) => v === 'home') && viewNames().length >= 5,
    `active=${viewNames().length}`);
  check('首屏无动画残留', animClean());
  const cards = [...doc.querySelectorAll('.menu-card')];
  check('首页菜单卡片 = 6', cards.length === 6, `实际 ${cards.length}`);

  // ---------- 2. 底部导航 ----------
  const tabs = [...doc.querySelectorAll('#appTabbar a')];
  check('底部导航 4 个标签', tabs.length === 4);
  check('首页标签默认高亮', tabs.find((t) => t.dataset.tab === 'home').classList.contains('is-current'));

  // ---------- 3. 进入学习：动画 + 全屏锁定 ----------
  await setHashSettled('#study');
  check('#study → 学习视图', doc.body.getAttribute('data-app-view') === 'study' &&
    doc.getElementById('study').classList.contains('is-active'));
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
  check('点发音按钮不触发翻面', cardFlip.classList.contains('is-flipped'));
  doc.getElementById('studyCard').click();
  await sleep(30);
  check('再点卡片 → 翻回正面', !cardFlip.classList.contains('is-flipped'));

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
  check('对手资料(胜率/场数/延迟)已显示', /胜率/.test(doc.getElementById('battleFoeStats').textContent),
    doc.getElementById('battleFoeStats').textContent);
  battleApi.start(); // 重新匹配 → 必须换新对手
  await sleep(3400);
  const foeName2 = doc.getElementById('battleFoeName').textContent;
  check('再开一局换新对手', foeName2 && foeName2 !== '匹配中…' && foeName2 !== foeName,
    `${foeName} → ${foeName2}`);

  doc.querySelector('[data-demo-tab="plan"]').click();
  await sleep(30);
  check('可切回智能词单', planPanel.classList.contains('is-active'));

  // ---------- 6. 宣传内容移到介绍视图 ----------
  const intro = doc.querySelector('section.showcase-intro');
  check('宣传语块移入介绍视图', intro && intro.getAttribute('data-app-view') === 'about' &&
    !!intro.querySelector('#showcasePanel') && intro.textContent.includes('PRODUCT EXPERIENCE'));

  // ---------- 7. 其它路由仍兼容 ----------
  await setHashSettled('#pricing');
  check('#pricing → 订阅视图（长轴整页）',
    doc.body.getAttribute('data-app-view') === 'pricing' &&
    ['ops', 'pricing', 'faq'].every((id) => doc.getElementById(id).classList.contains('is-active')));
  check('订阅页动画后无残留', animClean());

  await setHashSettled('#method');
  const aboutTotal = doc.querySelectorAll('main > section[data-app-view="about"]').length;
  const aboutActive = doc.querySelectorAll('main > section[data-app-view="about"].is-active').length;
  check('#method → 介绍视图（全部介绍板块激活）',
    doc.body.getAttribute('data-app-view') === 'about' &&
    doc.getElementById('method').classList.contains('is-active') &&
    aboutActive === aboutTotal && aboutTotal >= 5,
    `active=${aboutActive}/${aboutTotal}`);

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
  check('词库介绍内容移入介绍视图',
    !!doc.querySelector('section.library-intro[data-app-view="about"]') &&
    doc.querySelector('section.library-intro').querySelectorAll('.exam-card').length === 5 &&
    !!doc.querySelector('section.library-intro .roots-panel'));
  check('词库头部为功能提示(非营销)',
    lib.textContent.includes('点「学习此词」直接跳到学习面板'));

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

  console.log(failed === 0 ? '\n导航测试全部通过 ✔' : `\n${failed} 项失败 ✘`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
