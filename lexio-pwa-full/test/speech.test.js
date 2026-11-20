// Exercise the actual shipped worker and both voices, not a mocked media API.
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const assets = path.join(__dirname, '../speech');
global.self = {};
global.fetch = async name => new Response(await fs.readFile(path.join(assets, name)));
require('../speech/worker.js');
(async () => {
  let previous;
  for (const voice of ['slt', 'clb']) {
    let result;
    self.postMessage = response => { result = response; };
    await self.onmessage({data:{id:1, voice, text:'Could we schedule a meeting for Tuesday morning?'}});
    assert.ok(result.wav, result.error);
    const wave = Buffer.from(result.wav);
    assert.equal(wave.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wave.toString('ascii', 8, 12), 'WAVE');
    const pos = wave.indexOf('data', 12);
    assert.ok(pos >= 12);
    const bytes = wave.readUInt32LE(pos + 4);
    const rate = wave.readUInt32LE(24);
    assert.ok(bytes > rate * 2, 'at least a second of PCM');
    let peak = 0;
    for (let i=pos+8;i<pos+8+bytes;i+=2) peak=Math.max(peak,Math.abs(wave.readInt16LE(i)));
    assert.ok(peak > 500, 'the recording is not silent');
    if (previous) assert.ok(!previous.equals(wave), 'different voices');
    previous=wave;
    console.log(`✓ ${voice.toUpperCase()} generated ${(bytes/2/rate).toFixed(2)} s of PCM; peak ${peak}`);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
