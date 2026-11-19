'use strict';

/**
 * 多视图导航测试：验证「首页菜单 → 各功能独立页」的层级路由。
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

(async () => {
  await sleep(150);

  // 1. 默认首页
  check('默认进入首页', doc.body.getAttribute('data-app-view') === 'home');
  check('首页分组激活（hero+菜单+…）', viewNames().every((v) => v === 'home') && viewNames().length >= 5,
    `active=${viewNames().length}`);
  check('学习/词库/订阅初始隐藏',
    !doc.getElementById('study').classList.contains('is-active') &&
    !doc.getElementById('pricing').classList.contains('is-active') &&
    !doc.getElementById('library').classList.contains('is-active'));

  // 2. 首页菜单
  const cards = [...doc.querySelectorAll('.menu-card')];
  check('首页菜单卡片 = 6', cards.length === 6, `实际 ${cards.length}`);
  check('菜单含学习/词库/订阅入口',
    ['study', 'library', 'pricing'].every((id) => cards.some((c) => c.getAttribute('href') === '#' + id)));

  // 3. 底部导航
  const tabs = [...doc.querySelectorAll('#appTabbar a')];
  check('底部导航 4 个标签', tabs.length === 4);
  check('首页标签默认高亮', tabs.find((t) => t.dataset.tab === 'home').classList.contains('is-current'));

  // 4. 路由切换
  await setHash('#study');
  check('#study → 学习视图', doc.body.getAttribute('data-app-view') === 'study' &&
    doc.getElementById('study').classList.contains('is-active'));
  check('学习视图隐藏无关板块（method/pricing）',
    !doc.getElementById('method').classList.contains('is-active') &&
    !doc.getElementById('pricing').classList.contains('is-active'));
  check('顶栏标签 = 学习', doc.getElementById('viewTopbarLabel').textContent === '学习');
  check('底部“学习”高亮', tabs.find((t) => t.dataset.tab === 'study').classList.contains('is-current'));

  await setHash('#pricing');
  const pricingViews = viewNames();
  check('#pricing → 订阅视图（定价+运维+FAQ 三板块整页）',
    doc.body.getAttribute('data-app-view') === 'pricing' &&
    ['ops', 'pricing', 'faq'].every((id) => doc.getElementById(id).classList.contains('is-active')),
    `active=${pricingViews.join(',')}`);
  check('顶栏标签 = 订阅', doc.getElementById('viewTopbarLabel').textContent === '订阅');

  await setHash('#method');
  const aboutCount = doc.querySelectorAll('main > section[data-app-view="about"].is-active').length;
  check('#method → 介绍视图（方法+效果+故事 三板块）',
    doc.body.getAttribute('data-app-view') === 'about' &&
    doc.getElementById('method').classList.contains('is-active') &&
    doc.getElementById('stories').classList.contains('is-active') &&
    aboutCount === 3, `about active=${aboutCount}`);
  check('顶栏标签 = 介绍', doc.getElementById('viewTopbarLabel').textContent === '介绍');

  await setHash('#library');
  check('#library → 词库视图', doc.body.getAttribute('data-app-view') === 'library' &&
    doc.getElementById('library').classList.contains('is-active'));

  await setHash('#faq');
  check('#faq → 落到订阅视图', doc.body.getAttribute('data-app-view') === 'pricing');

  await setHash('#top');
  check('#top → 返回首页', doc.body.getAttribute('data-app-view') === 'home');

  // 5. 模块脚本跳转入口存在（学习按钮从词库跳学习页）
  check('window.__lexioShow 已暴露', typeof window.__lexioShow === 'function');
  window.__lexioShow('study', 'study');
  await sleep(60);
  check('__lexioShow 可切换到学习视图', doc.body.getAttribute('data-app-view') === 'study');

  // 6. 全部 section 都有分组归属
  const secs = [...doc.querySelectorAll('main > section')];
  check('所有板块都归组', secs.every((s) => s.hasAttribute('data-app-view')),
    `${secs.length} sections`);

  console.log(failed === 0 ? '\n导航测试全部通过 ✔' : `\n${failed} 项失败 ✘`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
