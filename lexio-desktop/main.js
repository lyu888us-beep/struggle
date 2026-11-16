'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { startAssetServer } = require('./server');

const ASSETS_DIR = path.join(__dirname, 'assets');
const APP_TITLE = 'Lexio 乐词';

let mainWindow = null;
let assetServer = null;

function createMainWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 360,
    minHeight: 600,
    title: APP_TITLE,
    icon: path.join(ASSETS_DIR, 'icon-512.png'),
    autoHideMenuBar: true,
    backgroundColor: '#f7f8f4',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(url);

  // 阻止应用内打开新窗口，外链交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: 'deny' };
  });

  // 冒烟测试：LEXIO_SMOKE=1 时页面加载完成即退出（用于 CI/无显示环境验证）
  if (process.env.LEXIO_SMOKE) {
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('SMOKE_OK page-loaded');
      app.quit();
    });
    mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
      console.error('SMOKE_FAIL', code, desc);
      app.exit(1);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function bootstrap() {
  const { server, url } = await startAssetServer(ASSETS_DIR);
  assetServer = server;
  createMainWindow(url);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(bootstrap).catch((err) => {
    console.error('[lexio] 启动失败:', err);
    app.exit(1);
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('before-quit', () => {
    if (assetServer) {
      try {
        assetServer.close();
      } catch (_) {
        /* ignore */
      }
      assetServer = null;
    }
  });
}
