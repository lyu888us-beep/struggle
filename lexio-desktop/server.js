'use strict';

/**
 * 内置本地静态服务器 —— Lexio 单机版核心。
 * 只监听 127.0.0.1（随机端口），完全离线可用，
 * 为 PWA 页面提供与原站一致的 HTTP 环境
 * （Service Worker / IndexedDB / fetch 相对路径都需要 HTTP 源）。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.md': 'text/plain; charset=utf-8',
};

function createAssetServer(assetsDir) {
  const root = path.resolve(assetsDir);

  return http.createServer((req, res) => {
    try {
      let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (urlPath === '/') urlPath = '/index.html';

      // 归一化并阻止路径穿越
      const normalized = path.normalize(urlPath).replace(/^([/\\])+/, '');
      const filePath = path.join(root, normalized);
      if (filePath !== root && !filePath.startsWith(root + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        });
        res.end(data);
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
  });
}

/** 启动服务器，listen 成功后 resolve { server, port, url } */
function startAssetServer(assetsDir) {
  return new Promise((resolve, reject) => {
    const server = createAssetServer(assetsDir);
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port, url: `http://127.0.0.1:${port}/index.html` });
    });
  });
}

module.exports = { createAssetServer, startAssetServer };

// 允许直接用 node server.js 调试：node server.js [assetsDir] [port]
if (require.main === module) {
  const assetsDir = path.join(__dirname, 'assets');
  const port = Number(process.argv[2]) || 4173;
  createAssetServer(assetsDir).listen(port, '0.0.0.0', () => {
    console.log(`[lexio] http://127.0.0.1:${port}/  (assets: ${assetsDir})`);
  });
}
