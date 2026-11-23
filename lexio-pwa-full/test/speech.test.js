// Match each exact-text selected-voice recording to a playable, cached file.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
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
  const wordManifest=JSON.parse(fs.readFileSync(path.join(dir,'media/voice/word-audio-manifest.json')));
  assert.equal(wordManifest.voice_id,'voice-00');
  const approvedWords=wordManifest.userApprovedSampleWords;
  const generatedBatchWords=wordManifest.generatedBatches.flatMap(batch=>batch.words);
  const partialBatch=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-002-safe-partial-groups-2-4-9');
  assert.ok(partialBatch,'prior partial safe-cut batch is recorded');
  assert.equal(partialBatch.words.length,925);
  assert.equal(partialBatch.rowsConsidered,1020);
  assert.equal(partialBatch.skippedForUnsafeCutBoundaries,95);
  assert.equal(partialBatch.individuallyHumanListened,false);
  const nextBatch=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-003-safe-partial-groups-10-19');
  assert.ok(nextBatch,'current safe-cut batch is recorded');
  assert.equal(nextBatch.words.length,1082);
  assert.equal(nextBatch.rowsConsidered,1336);
  assert.equal(nextBatch.skippedAlreadyMappedBeforeGeneration,4);
  assert.equal(nextBatch.skippedForUnsafeCutBoundaries,109);
  assert.equal(nextBatch.skippedForAlignmentFailure,145);
  assert.deepEqual(nextBatch.alignmentFailedGroups,[10]);
  assert.equal(nextBatch.individuallyHumanListened,false);
  const latestBatch=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-004-safe-groups-10a-10b-20-27');
  assert.ok(latestBatch,'latest safe-cut batch is recorded');
  assert.equal(latestBatch.words.length,1250);
  assert.equal(latestBatch.rowsConsidered,1285);
  assert.equal(latestBatch.retriedAlignmentFailureRowsFromGroup10,145);
  assert.equal(latestBatch.skippedAlreadyMappedBeforeGeneration,2);
  assert.equal(latestBatch.skippedForUnsafeCutBoundaries,35);
  assert.equal(latestBatch.individuallyHumanListened,false);
  const batch005=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-005-safe-groups-28-37');
  assert.ok(batch005,'new safe-cut batch is recorded');
  assert.equal(batch005.words.length,1227);
  assert.equal(batch005.rowsConsidered,1387);
  assert.equal(batch005.skippedAlreadyMappedBeforeGeneration,0);
  assert.equal(batch005.unsafeBoundaries,83);
  assert.equal(batch005.skippedRows,160);
  assert.deepEqual(batch005.alignmentFailedGroups,[]);
  assert.equal(batch005.individuallyHumanListened,false);
  const batch006=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-006-safe-groups-38-47');
  assert.ok(batch006,'next safe-cut batch is recorded');
  assert.equal(batch006.words.length,1326);
  assert.equal(batch006.rowsConsidered,1404);
  assert.equal(batch006.skippedAlreadyMappedBeforeGeneration,0);
  assert.equal(batch006.unsafeBoundaries,40);
  assert.equal(batch006.skippedRows,78);
  assert.deepEqual(batch006.alignmentFailedGroups,[]);
  assert.equal(batch006.individuallyHumanListened,false);
  const batch007=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-007-safe-groups-48-57');
  assert.ok(batch007,'next safe-cut batch is recorded');
  assert.equal(batch007.words.length,1213);
  assert.equal(batch007.rowsConsidered,1418);
  assert.equal(batch007.skippedAlreadyMappedBeforeGeneration,4);
  assert.equal(batch007.unsafeBoundaries,110);
  assert.equal(batch007.skippedRows,205);
  assert.deepEqual(batch007.alignmentFailedGroups,[]);
  assert.equal(batch007.individuallyHumanListened,false);
  const batch008=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-008-safe-groups-58-67');
  assert.ok(batch008,'new safe-cut batch is recorded');
  assert.equal(batch008.words.length,1240);
  assert.equal(batch008.rowsConsidered,1397);
  assert.equal(batch008.skippedAlreadyMappedBeforeGeneration,0);
  assert.equal(batch008.unsafeBoundaries,87);
  assert.equal(batch008.skippedRows,157);
  assert.deepEqual(batch008.sourceGroups,[58,59,60,61,62,63,64,65,66,67]);
  assert.deepEqual(batch008.alignmentFailedGroups,[]);
  assert.equal(batch008.individuallyHumanListened,false);
  assert.equal(wordManifest.count,8681);
  const expectedWords=[...approvedWords,...generatedBatchWords].sort();
  assert.equal(wordManifest.count,expectedWords.length);
  assert.deepEqual(Object.keys(wordRecordings).sort(),expectedWords);
  assert.deepEqual(Object.keys(wordManifest.clips).sort(),expectedWords);
  for(const word of expectedWords){
    const id='w-'+require('node:crypto').createHash('sha256').update(word).digest('hex').slice(0,16);
    assert.equal(wordRecordings[word],id);
    assert.equal(wordManifest.clips[word],id);
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
  console.log(`✓ ${Object.keys(wordRecordings).length} 个单词音频已纳入 en-US 播放和离线资源（5 个此前确认样音 + ${generatedBatchWords.length} 个累计生成）`);
  const voiceQueue=spawnSync(process.execPath,['scripts/voice-queue.mjs'],{cwd:dir,encoding:'utf8'});
  assert.equal(voiceQueue.status,0,voiceQueue.stderr||voiceQueue.stdout);
  const queueSummary=JSON.parse(voiceQueue.stdout);
  assert.equal(queueSummary.pendingRecordableSentences,498);
  assert.equal(queueSummary.uniqueDictionaryPhrases,473);
  assert.equal(queueSummary.recordedDictionaryPhrases,472);
  assert.equal(queueSummary.pendingDictionaryPhrases,1);
  assert.equal(queueSummary.missingMappedAudioFiles,0);
  console.log('✓ 句子与词典短语分开校验：498 个完整文本待补、1 个短语保持单独待审、现有映射音频文件均存在');
})().catch(e=>{console.error(e);process.exitCode=1;});
