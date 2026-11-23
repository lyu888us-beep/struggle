const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, spawnSync, execFileSync } = require('node:child_process');

const BASE = '41e3e170c1d7be74ea9712548c33abe6bf4f73a5';
const appRoot = process.cwd();
const voiceDir = path.join(appRoot, 'media', 'voice');
const voiceCount = fs.existsSync(voiceDir)
  ? fs.readdirSync(voiceDir).filter(name => name.endsWith('.mp3')).length
  : 0;

function runTests(cwd) {
  for (const file of ['test/nav.test.js', 'test/speech.test.js']) {
    const result = spawnSync(process.execPath, [file], { cwd, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${file} failed with status ${result.status}`);
  }
}

function copyOverlay(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (['node_modules', '.tmp-voice', '.venv', '.git'].includes(entry.name)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyOverlay(from, to);
    else if (entry.isSymbolicLink()) {
      fs.rmSync(to, { recursive: true, force: true });
      fs.symlinkSync(fs.readlinkSync(from), to);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

function materializeBase(repoRoot, destination) {
  return new Promise((resolve, reject) => {
    const archive = spawn('git', ['archive', '--format=tar', BASE, 'lexio-pwa-full'], { cwd: repoRoot });
    const extract = spawn('tar', ['-x', '-C', destination]);
    let archiveCode, extractCode, rejected = false;
    const fail = error => { if (!rejected) { rejected = true; reject(error); } };
    const finish = () => {
      if (archiveCode === undefined || extractCode === undefined || rejected) return;
      if (archiveCode !== 0 || extractCode !== 0) fail(new Error('Could not materialize pinned Lexio base.'));
      else resolve();
    };
    archive.on('error', fail); extract.on('error', fail);
    archive.stderr.pipe(process.stderr); extract.stderr.pipe(process.stderr);
    archive.stdout.on('error', fail); extract.stdin.on('error', fail);
    archive.stdout.pipe(extract.stdin);
    archive.on('close', code => { archiveCode = code; finish(); });
    extract.on('close', code => { extractCode = code; finish(); });
  });
}

(async () => {
  if (voiceCount >= 17000) {
    // The Pages workflow already assembled the pinned base and the overlay.
    runTests(appRoot);
    return;
  }
  let repoRoot;
  try {
    repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: appRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    throw new Error('Full voice corpus is absent and this checkout is not inside a Git repository.');
  }
  const hasBase = spawnSync('git', ['cat-file', '-e', `${BASE}^{commit}`], {
    cwd: repoRoot, stdio: 'ignore',
  }).status === 0;
  if (!hasBase) {
    console.log(`Fetching pinned Lexio source/media base ${BASE} for the full regression suite…`);
    execFileSync('git', ['fetch', '--no-tags', 'origin', BASE], { cwd: repoRoot, stdio: 'inherit' });
  }
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lexio-test-base-'));
  const site = path.join(temp, 'lexio-pwa-full');
  try {
    await materializeBase(repoRoot, temp);
    copyOverlay(appRoot, site);
    const modules = path.join(appRoot, 'node_modules');
    if (fs.existsSync(modules) && !fs.existsSync(path.join(site, 'node_modules'))) {
      fs.symlinkSync(modules, path.join(site, 'node_modules'), 'dir');
    }
    runTests(site);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
