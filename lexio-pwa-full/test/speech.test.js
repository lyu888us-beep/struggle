// Real WASM synthesis plus the native media byte-range path used by Safari.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'..');global.self={};require('../speech/engine.js');
(async()=>{
  const pcm=await self.renderLexioWave('Can we meet on Tuesday morning?',()=>fs.readFileSync(path.join(dir,'speech/flite.wasm')));
  const wave=Buffer.from(pcm);assert.equal(wave.toString('ascii',0,4),'RIFF');const start=wave.indexOf('data')+8;let peak=0;for(let i=start;i<wave.length;i+=2)peak=Math.max(peak,Math.abs(wave.readInt16LE(i)));
  assert.ok(peak>500);console.log('✓ 本地女声生成非静音 WAV，峰值',peak);
  const ctx={self:{addEventListener(){}},importScripts(){},Response};vm.runInNewContext(fs.readFileSync(path.join(dir,'sw.js'),'utf8'),ctx);
  for(const [range,status,size] of [['bytes=0-1',206,2],['bytes=-9',206,9],[`bytes=${wave.length}-`,416,0],[null,200,wave.length]]){
    const r=ctx.mediaResponse(pcm,new Request('https://example.org/',{headers:range?{Range:range}:{}}),'audio/wav');assert.equal(r.status,status);assert.equal((await r.arrayBuffer()).byteLength,size);
  }
  console.log('✓ 媒体支持完整读取、起始探测、尾部范围和越界处理');
})().catch(e=>{console.error(e);process.exitCode=1;});
