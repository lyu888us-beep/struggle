// Match each exact-text selected-voice recording to a playable, cached file.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'..');
(async()=>{
  const ctx={self:{addEventListener(){}},Response};vm.runInNewContext(fs.readFileSync(path.join(dir,'sw.js'),'utf8'),ctx);
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const recordings=JSON.parse(html.match(/const selectedRecordings = (\{[\s\S]*?\});/)[1]);
  const clips=Object.values(recordings);
  const demo=vm.runInNewContext(html.match(/const SAMPLE_WORDS = (\[[\s\S]*?\n      \]);/)[1]);
  for(const w of demo)assert.ok(recordings[w.example],w.word);
  const phrases=JSON.parse(fs.readFileSync(path.join(dir,'data/daily-conversation.json'))).phrases;
  for(const scene of new Set(phrases.map(p=>p.category)))for(const p of phrases.filter(p=>p.category===scene).slice(0,10))assert.ok(recordings[p.en],p.en);
  console.log('✓ 24 张演示词卡和 11 个场景各前十句均有对应录音');
  const cached=vm.runInNewContext('bulkAssets',ctx);
  for(const clip of clips){const url=`./media/voice/${clip}.mp3`;assert.ok(cached.includes(url));const mp3=fs.readFileSync(path.join(dir,url));assert.ok(mp3.length>1000);
    const buf=mp3.buffer.slice(mp3.byteOffset,mp3.byteOffset+mp3.length);
    for(const [range,status,size] of [['bytes=0-1',206,2],['bytes=-9',206,9],[`bytes=${buf.byteLength}-`,416,0],[null,200,buf.byteLength]]){
      const r=ctx.mediaResponse(buf,new Request('https://example.org/',{headers:range?{Range:range}:{}}),'audio/mpeg');assert.equal(r.status,status);assert.equal((await r.arrayBuffer()).byteLength,size);
    }
  }
  console.log(`✓ ${clips.length} 条所选录音均已纳入离线资源，支持媒体范围读取`);
})().catch(e=>{console.error(e);process.exitCode=1;});
