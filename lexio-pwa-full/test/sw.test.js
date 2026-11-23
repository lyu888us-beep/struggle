'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const registrations = {};
const entries = new Map();
let fetchCalls = 0;
let putDelayMs = 0;
let onPutFinished = () => {};

function requestKey(request) {
  return typeof request === 'string' ? request : request.url;
}
const cache = {
  async match(request) {
    const response = entries.get(requestKey(request));
    return response ? response.clone() : undefined;
  },
  async put(request, response) {
    if (putDelayMs) await new Promise(resolve => setTimeout(resolve, putDelayMs));
    entries.set(requestKey(request), response.clone());
    onPutFinished();
  },
  async keys() {
    return [...entries.keys()].map(url => ({ url }));
  },
};
const cacheStorage = { open: async () => cache, keys: async () => [] };
const ctx = {
  URL,
  Request,
  Response,
  caches: cacheStorage,
  setTimeout,
  clearTimeout,
  console,
  fetch: async request => {
    fetchCalls++;
    const range = request instanceof Request && request.headers.get('range');
    if (range) {
      return new Response('par', {
        status: 206,
        headers: { 'Content-Range': 'bytes 3-5/11', 'Content-Type': 'audio/mpeg' },
      });
    }
    return new Response('network-mp3', {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' },
    });
  },
  self: {
    registration: { scope: 'https://lexio.test/' },
    location: { origin: 'https://lexio.test' },
    clients: { claim: async () => {} },
    addEventListener(type, listener) { registrations[type] = listener; },
  },
};
vm.runInNewContext(source, ctx);

(async () => {
  const shell = vm.runInNewContext('SHELL_URLS', ctx);
  const bulk = vm.runInNewContext('bulkAssets', ctx);
  assert.equal(vm.runInNewContext('CACHE_NAME', ctx), 'lexio-shell-v124-word-audio-batch-008');
  assert.ok(shell.includes('./data/daily-conversation.json'));
  assert.ok(!shell.includes('./media/install-guide.mp4'), 'install guide video is lazy-loaded, not part of the shell');
  assert.ok(bulk.length > 25000, 'full offline pack remains available as an opt-in');

  const wordManifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'media', 'voice', 'word-audio-manifest.json'), 'utf8'));
  const wordPaths = [...new Set(Object.values(wordManifest.clips).map(id => `./media/voice/${id}.mp3`))];
  const firstPath = wordPaths[0];
  const secondPath = wordPaths[1];
  const thirdPath = wordPaths[2];
  const progress = [];
  const client = { postMessage: message => progress.push(message) };
  let initialFetches = fetchCalls;
  const warmResult = await vm.runInNewContext('warmAssets', ctx)([firstPath, './not-in-the-offline-manifest.mp3'], 'priority', client);
  assert.deepEqual(JSON.parse(JSON.stringify(warmResult)), { done: 1, total: 1, failed: 0, complete: true, ok: true });
  assert.equal(fetchCalls, initialFetches + 1, 'priority warming fetches only explicitly selected assets');
  assert.ok(progress.some(message => message.type === 'offline-cache-progress' && message.scope === 'priority' && message.complete));

  initialFetches = fetchCalls;
  const cachedAgain = await vm.runInNewContext('warmAssets', ctx)([firstPath], 'priority', client);
  assert.equal(cachedAgain.done, 1);
  assert.equal(fetchCalls, initialFetches, 'cached audio is not downloaded again');

  initialFetches = fetchCalls;
  const [duplicateA, duplicateB] = await Promise.all([
    vm.runInNewContext('localAsset', ctx)(secondPath),
    vm.runInNewContext('localAsset', ctx)(secondPath),
  ]);
  assert.equal(fetchCalls, initialFetches + 1, 'simultaneous requests for one MP3 share a single fetch');
  assert.notEqual(duplicateA, duplicateB, 'each consumer receives its own readable Response clone');

  const audioUrl = new URL(thirdPath, 'https://lexio.test/').href;
  const pendingWaits = [];
  let networkResponsePromise;
  let cacheWriteFinished = false;
  putDelayMs = 100;
  onPutFinished = () => { cacheWriteFinished = true; };
  registrations.fetch({
    request: new Request(audioUrl),
    waitUntil(promise) { pendingWaits.push(promise); },
    respondWith(promise) { networkResponsePromise = Promise.resolve(promise); },
  });
  const firstPlayResponse = await networkResponsePromise;
  assert.equal(firstPlayResponse.status, 200);
  assert.ok(firstPlayResponse.body, 'cache misses return the original network stream');
  assert.equal(cacheWriteFinished, false, 'first playback does not wait for Cache Storage to finish');
  assert.equal(await firstPlayResponse.text(), 'network-mp3');
  await Promise.all(pendingWaits);
  assert.equal(cacheWriteFinished, true, 'network audio is cached in the background');
  putDelayMs = 0;

  const cachedRangeWaits = [];
  let cachedRangePromise;
  registrations.fetch({
    request: new Request(audioUrl, { headers: { Range: 'bytes=0-2' } }),
    waitUntil(promise) { cachedRangeWaits.push(promise); },
    respondWith(promise) { cachedRangePromise = Promise.resolve(promise); },
  });
  const cachedRange = await cachedRangePromise;
  assert.equal(cachedRange.status, 206);
  assert.equal(cachedRange.headers.get('content-range'), 'bytes 0-2/11');
  assert.equal(await cachedRange.text(), 'net');
  await Promise.all(cachedRangeWaits);

  console.log('✓ staged offline audio cache, cache-hit reuse, streaming first play, and byte-range playback');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
