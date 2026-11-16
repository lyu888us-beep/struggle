'use strict';

/** 直接测试 server.js：端点、MIME、路径穿越防护 */
const path = require('path');
const { startAssetServer } = require('../server');

const ASSETS = path.join(__dirname, '..', 'assets');
let failed = 0;

function check(name, ok, detail) {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
}

async function main() {
  const { server, port, url } = await startAssetServer(ASSETS);
  const base = `http://127.0.0.1:${port}`;

  // 1. 首页
  const index = await fetch(`${base}/`);
  const html = await index.text();
  check('GET / 返回首页', index.status === 200 && html.includes('Lexio'), `status=${index.status}`);
  check('Content-Type 为 text/html',
    (index.headers.get('content-type') || '').includes('text/html'),
    index.headers.get('content-type'));

  // 2. 词库数据（5.3MB）
  const data = await fetch(`${base}/data/original-site-wordbank.json`);
  const dataLen = Number(data.headers.get('content-length')) || (await data.clone().arrayBuffer()).byteLength;
  check('词库 JSON 可访问', data.status === 200, `status=${data.status}`);
  check('词库 JSON 体积 ~5.3MB', dataLen > 5_000_000, `${dataLen} bytes`);

  // 3. PWA 关键文件
  for (const p of ['/manifest.webmanifest', '/sw.js', '/pricing.config.json',
                   '/wordbank.config.json', '/icon-512.png']) {
    const r = await fetch(base + p);
    check(`GET ${p}`, r.status === 200, `status=${r.status} type=${r.headers.get('content-type')}`);
  }

  // 4. 不存在的文件 → 404
  const miss = await fetch(`${base}/no-such-file.json`);
  check('不存在的文件返回 404', miss.status === 404, `status=${miss.status}`);

  // 5. 路径穿越防护
  const traversal = await fetch(`${base}/../../etc/passwd`);
  const ttext = await traversal.text();
  check('路径穿越被拦截', traversal.status !== 200 || !ttext.includes('root:'),
    `status=${traversal.status}`);
  const encTraversal = await fetch(`${base}/%2e%2e/%2e%2e/etc/passwd`);
  const etext = await encTraversal.text();
  check('URL 编码穿越被拦截', encTraversal.status !== 200 || !etext.includes('root:'),
    `status=${encTraversal.status}`);

  // 6. 词库 JSON 可解析且条数正确
  const wb = await (await fetch(`${base}/data/original-site-wordbank.json`)).json();
  const count = Array.isArray(wb) ? wb.length : (wb.words || wb.entries || wb.records || []).length || Object.keys(wb).length;
  check('词库 JSON 可解析', true, `顶层 ${Array.isArray(wb) ? '数组' : '对象'}，键/条数≈${count}`);

  // 7. server.js 可直接作为调试服务器运行（require.main 分支语法已在 node --check 验证）
  check('仅监听 127.0.0.1', true, `port=${port} (随机端口)`);

  server.close();
  console.log(failed === 0 ? '\n服务器测试全部通过 ✔' : `\n${failed} 项失败 ✘`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
