'use strict';

/**
 * 冒烟测试：在无显示器、无 Electron 二进制的环境下
 * 验证 main.js → server.js → PWA 页面整条链路。
 *
 * 原理：把 require('electron') 替换为最小可用 mock，
 * loadURL 时真实发起 HTTP 请求到内置服务器，
 * 页面加载成功即触发 did-finish-load（等同真实 Electron 行为）。
 *
 * 运行：node test/smoke.js   （或 npm run smoke:mock）
 */

const Module = require('module');
const path = require('path');
const fs = require('fs');

const APP_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(APP_DIR, 'assets');

const events = { app: {}, windows: [] };

function createElectronMock() {
  class BrowserWindow {
    constructor(options) {
      this.options = options;
      this._handlers = {};
      this._webContentsHandlers = {};
      this.webContents = {
        setWindowOpenHandler: (fn) => {
          this._openHandler = fn;
        },
        on: (event, cb) => {
          (this._webContentsHandlers[event] ||= []).push(cb);
        },
        _emit: (event, ...args) => {
          for (const cb of this._webContentsHandlers[event] || []) cb(...args);
        },
      };
      events.windows.push(this);
    }
    setMenuBarVisibility() {}
    on(event, cb) {
      (this._handlers[event] ||= []).push(cb);
    }
    isMinimized() {
      return false;
    }
    restore() {}
    focus() {}
    loadURL(url) {
      this._url = url;
      fetch(url)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
          const body = await res.text();
          if (!/<!DOCTYPE html>/i.test(body) && !/<html/i.test(body)) {
            throw new Error('响应不是 HTML 页面');
          }
          if (!body.includes('Lexio')) throw new Error('页面缺少 Lexio 标识');
          this._bodyLength = body.length;
          // 模拟渲染进程完成加载
          setImmediate(() => this.webContents._emit('did-finish-load'));
        })
        .catch((err) => {
          this._loadError = err;
          setImmediate(() => this.webContents._emit('did-fail-load', -1, String(err)));
        });
    }
    get bodyLength() {
      return this._bodyLength;
    }
  }

  const app = {
    whenReady: () => Promise.resolve(),
    requestSingleInstanceLock: () => true,
    on: (event, cb) => {
      (events.app[event] ||= []).push(cb);
    },
    quit: () => {
      events.quitRequested = true;
      finish(0);
    },
    exit: (code) => finish(code || 0),
  };

  const shell = {
    openExternal: (url) => {
      events.openedExternal = url;
    },
  };

  return { app, shell, BrowserWindow };
}

let finished = false;
function finish(code) {
  if (finished) return;
  finished = true;
  setTimeout(() => process.exit(code), 50);
}

// 拦截 require('electron')
const electronMock = createElectronMock();
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'electron') return path.join(__dirname, 'electron-mock-id.js');
  return origResolve.call(this, request, ...args);
};
require.cache[path.join(__dirname, 'electron-mock-id.js')] = {
  id: path.join(__dirname, 'electron-mock-id.js'),
  filename: path.join(__dirname, 'electron-mock-id.js'),
  loaded: true,
  exports: electronMock,
};

// 与 main.js 的 SMOKE 分支约定一致
process.env.LEXIO_SMOKE = '1';

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

// main.js 冒烟日志钩子
const origLog = console.log;
console.log = (...args) => {
  if (String(args[0]).startsWith('SMOKE_')) console.log('[main]', ...args);
  else origLog(...args);
};

require(path.join(APP_DIR, 'main.js'));

// 超时保护
setTimeout(() => {
  if (!finished) {
    check('页面加载(SMOKE_OK)', false, '超时 15s 未完成');
    report(1);
  }
}, 15000);

function report(code) {
  console.log('\n--- 冒烟测试结果 ---');
  for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`);
  const failed = checks.filter((c) => !c.ok).length;
  console.log(failed === 0 ? '\n全部通过 ✔' : `\n${failed} 项失败 ✘`);
  origExit(code); // 必须用原始 process.exit，避免递归
}

// 等待 main.js 走完全流程（SMOKE_OK 打印后 app.quit 触发 finish）
const origExit = process.exit;
process.exit = (code) => {
  const win = events.windows[0];
  check('窗口创建', !!win, win ? win.options.title : '无窗口');
  check('窗口标题为 Lexio 乐词', !!win && win.options.title === 'Lexio 乐词');
  check('页面加载成功', !!win && win._url && !win._loadError,
    win ? (win._loadError ? String(win._loadError) : `HTTP OK (${win.bodyLength} bytes)`) : '');
  check('页面含 Lexio 标识', !!win && win._bodyLength > 10000);
  check('已请求 quit（正常退出路径）', !!events.quitRequested || code === 0);
  report(code || 0);
};
