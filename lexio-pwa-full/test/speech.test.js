// Match each exact-text selected-voice recording to a playable, cached file.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'..');
(async()=>{
  const ctx={self:{addEventListener(){}},Response};vm.runInNewContext(fs.readFileSync(path.join(dir,'sw.js'),'utf8'),ctx);
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const recordings=JSON.parse(html.match(/const selectedRecordings = (\{[\s\S]*?\});/)[1]);
  const wordRecordings=JSON.parse(html.match(/const selectedWordRecordings = (\{[\s\S]*?\});/)[1]);
  const clips=Object.values(recordings);
  const demo=vm.runInNewContext(html.match(/const SAMPLE_WORDS = (\[[\s\S]*?\n      \]);/)[1]);
  for(const w of demo)assert.ok(recordings[w.example],w.word);
  const wordbank=JSON.parse(fs.readFileSync(path.join(dir,'data/original-site-wordbank.json')));
  const migrationTargets=new Set(Object.values(wordbank.metadata.exampleTextMigrations||{}).map(row=>row.to));
  const exactTargets=[
    'Take a slow breath before you begin speaking.',
    "Let's count by tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, and one hundred.",
    'In the Ohmic contacts of LED electrodes, carriers have different transmission mechanisms between a metal electrode and a semiconductor.'
  ];
  const mappedTargets=[...migrationTargets].filter(text=>Object.hasOwn(recordings,text));
  assert.deepEqual(mappedTargets.sort(),exactTargets.slice().sort());
  for(const text of exactTargets){
    const id='s-'+require('node:crypto').createHash('sha256').update(text).digest('hex').slice(0,16);
    assert.equal(recordings[text],id);
  }
  console.log('✓ 501 个改写目标已移除旧音频别名，仅保留 3 条精确目标句录音');
  const expectedWords=['comfortable','entrepreneur','rural','schedule','thorough'];
  assert.deepEqual(Object.keys(wordRecordings).sort(),expectedWords);
  for(const word of expectedWords){
    const id='w-'+require('node:crypto').createHash('sha256').update(word).digest('hex').slice(0,16);
    assert.equal(wordRecordings[word],id);
  }
  assert.ok(html.includes("selectedWordRecordings[String(entry.word).trim().toLowerCase()]"));
  const phrases=JSON.parse(fs.readFileSync(path.join(dir,'data/daily-conversation.json'))).phrases;
  assert.equal(phrases.length,1100);for(const p of phrases)assert.ok(recordings[p.en],p.en);
  console.log('✓ 24 张演示词卡和 11 个口语场景全部 1,100 句均有对应录音');
  const cached=vm.runInNewContext('bulkAssets',ctx);
  for(const clip of clips){const url=`./media/voice/${clip}.mp3`;assert.ok(cached.includes(url));const mp3=fs.readFileSync(path.join(dir,url));assert.ok(mp3.length>1000);
    const buf=mp3.buffer.slice(mp3.byteOffset,mp3.byteOffset+mp3.length);
    for(const [range,status,size] of [['bytes=0-1',206,2],['bytes=-9',206,9],[`bytes=${buf.byteLength}-`,416,0],[null,200,buf.byteLength]]){
      const r=ctx.mediaResponse(buf,new Request('https://example.org/',{headers:range?{Range:range}:{}}),'audio/mpeg');assert.equal(r.status,status);assert.equal((await r.arrayBuffer()).byteLength,size);
    }
  }
  console.log(`✓ ${clips.length} 条所选录音均已纳入离线资源，支持媒体范围读取`);
  for(const [word,clip] of Object.entries(wordRecordings)){
    const url=`./media/voice/${clip}.mp3`;
    assert.ok(cached.includes(url),`${word} missing from offline resources`);
    const mp3=fs.readFileSync(path.join(dir,url));
    assert.ok(mp3.length>1000,`${word} clip is missing or implausibly small`);
  }
  console.log(`✓ ${Object.keys(wordRecordings).length} 个获用户认可的单词样音已纳入 en-US 播放和离线资源`);
})().catch(e=>{console.error(e);process.exitCode=1;});
