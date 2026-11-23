// Verify exact-text recordings, manifests, MP3 frames and offline range handling.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.join(__dirname,'..');
const hash=(text,prefix='s')=>prefix+'-'+crypto.createHash('sha256').update(text).digest('hex').slice(0,16);
function hasMpegFrame(buf){
  let start=0;
  if(buf.length>=10&&buf.toString('ascii',0,3)==='ID3'){
    const b=buf.subarray(6,10);
    const tagSize=((b[0]&0x7f)<<21)|((b[1]&0x7f)<<14)|((b[2]&0x7f)<<7)|(b[3]&0x7f);
    start=10+tagSize+((buf[5]&0x10)?10:0);
  }
  const limit=Math.min(buf.length-3,start+256);
  for(let i=start;i<limit;i++){
    if(buf[i]!==0xff||(buf[i+1]&0xe0)!==0xe0)continue;
    const version=(buf[i+1]>>3)&3,layer=(buf[i+1]>>1)&3,bitrate=(buf[i+2]>>4)&15,sample=(buf[i+2]>>2)&3;
    if(version!==1&&layer!==0&&bitrate>0&&bitrate<15&&sample<3)return true;
  }
  return false;
}
(async()=>{
  const ctx={self:{addEventListener(){}},Response};vm.runInNewContext(fs.readFileSync(path.join(dir,'sw.js'),'utf8'),ctx);
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const recordings=JSON.parse(html.match(/const selectedRecordings = (\{[\s\S]*?\});/)[1]);
  const wordRecordings=JSON.parse(html.match(/const selectedWordRecordings = (\{[\s\S]*?\});/)[1]);
  const clips=[...new Set(Object.values(recordings))];
  const demo=vm.runInNewContext(html.match(/const SAMPLE_WORDS = (\[[\s\S]*?\n      \]);/)[1]);
  for(const w of demo)assert.ok(recordings[w.example],w.word);
  const daily=JSON.parse(fs.readFileSync(path.join(dir,'data/daily-conversation.json'))).phrases;
  assert.equal(daily.length,1100);for(const p of daily)assert.ok(recordings[p.en],p.en);
  console.log('✓ 演示词卡与 11 个日常口语场景的录音映射存在');

  const manifestDir=path.join(dir,'voice-manifests');
  const phraseManifest=JSON.parse(fs.readFileSync(path.join(manifestDir,'phrase-clips.json')));
  const wordManifest=JSON.parse(fs.readFileSync(path.join(manifestDir,'word-samples.json')));
  const exactTargets=JSON.parse(fs.readFileSync(path.join(manifestDir,'exact-targets.json')));
  assert.equal(phraseManifest.voice_id,'voice-00');assert.equal(phraseManifest.language,'en-US');
  assert.equal(Object.keys(phraseManifest.clips).length,472);
  for(const [text,id] of Object.entries(phraseManifest.clips)){
    assert.equal(id,hash(text));assert.equal(recordings[text],id,text);
  }
  assert.equal(wordManifest.voice_id,'voice-00');assert.equal(wordManifest.language,'en-US');
  assert.equal(wordManifest.userApprovedVoiceSample,true);assert.equal(Object.keys(wordManifest.clips).length,5);
  assert.deepEqual(wordRecordings,wordManifest.clips);
  for(const [word,id] of Object.entries(wordRecordings))assert.equal(id,hash(word,'w'),word);
  assert.equal(exactTargets.length,3);
  for(const target of exactTargets){
    assert.equal(target.voice_id,'voice-00',target.label);assert.equal(target.language,'en-US',target.label);
    assert.equal(recordings[target.text],target.clip_id,target.label);
    assert.equal(target.clip_id,hash(target.text),target.label);
  }
  const bank=JSON.parse(fs.readFileSync(path.join(dir,'data/original-site-wordbank.json')));
  const migrationTargets=new Set(Object.values(bank.metadata.exampleTextMigrations||{}).map(x=>x.to));
  assert.equal(Object.keys(bank.metadata.exampleTextMigrations||{}).length,731);
  const exactMigrationTargets=new Set(exactTargets.filter(x=>migrationTargets.has(x.text)).map(x=>x.text));
  const mappedRewrites=[...migrationTargets].filter(text=>Object.hasOwn(recordings,text));
  assert.deepEqual(new Set(mappedRewrites),exactMigrationTargets);
  assert.equal([...migrationTargets].filter(text=>!Object.hasOwn(recordings,text)).length,498);
  console.log('✓ 472 条短语、5 个已批准单词样音、3 条精确改写句映射正确；498 条改写句保持待配音');

  const cached=vm.runInNewContext('bulkAssets',ctx);
  const allClipIds=new Set([...clips,...Object.values(wordRecordings)]);
  for(const target of exactTargets)allClipIds.add(target.clip_id);
  for(const clip of allClipIds){
    const url=`./media/voice/${clip}.mp3`;
    assert.ok(cached.includes(url),`not precached: ${clip}`);
    const mp3=fs.readFileSync(path.join(dir,url));
    assert.ok(mp3.length>1000,`too small: ${clip}`);assert.ok(hasMpegFrame(mp3),`no MPEG frame: ${clip}`);
    const buf=mp3.buffer.slice(mp3.byteOffset,mp3.byteOffset+mp3.length);
    for(const [range,status,size] of [['bytes=0-1',206,2],['bytes=-9',206,9],[`bytes=${buf.byteLength}-`,416,0],[null,200,buf.byteLength]]){
      const r=ctx.mediaResponse(buf,new Request('https://example.org/',{headers:range?{Range:range}:{}}),'audio/mpeg');
      assert.equal(r.status,status,`${clip} ${range}`);assert.equal((await r.arrayBuffer()).byteLength,size,`${clip} ${range}`);
    }
  }
  console.log(`✓ ${allClipIds.size} 个关联 MP3 均存在、含 MPEG 帧、纳入离线清单并支持范围读取`);
  assert.ok(html.includes("playPronunciation(entry.word, 'en-US', 1, './media/voice/' + approvedSample + '.mp3'"));
  console.log('✓ 仅用户确认的五个单词样音走本地 en-US voice-00 路由；其他词及英音保持原路径');
})().catch(e=>{console.error(e);process.exitCode=1;});
