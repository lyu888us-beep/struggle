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
    'In the Ohmic contacts of LED electrodes, carriers have different transmission mechanisms between a metal electrode and a semiconductor.',
    'She remained faithful to her promise, even when the journey became difficult.',
    'Ten movies are released every year.',
    'He is gay and proud of his partner.',
    'Show your sister the photos from the trip.',
    'The teacher was merciful when she gave the class extra time.',
    'True strength is balanced by wisdom.',
    'The speaker gave a wonderful lecture on astronomy.',
    'The past can teach us something useful about the future.',
    'The photographer was shooting portraits outdoors.',
    'Tom is teaching me how to sail.',
    'Creating something creative yourself is a way of improving your creativity.',
    'He is addicted to solving crossword puzzles.',
    'For example, our library stays open until eight.',
    "I've noticed that having fun doesn't interfere at all with your studies.",
    'She was fourteen when she joined the school orchestra.'
  ];
  const mappedTargets=[...migrationTargets].filter(text=>Object.hasOwn(recordings,text));
  assert.ok(exactTargets.every(text=>mappedTargets.includes(text)),'known exact migration targets stay mapped');
  const manifestForMigratedTargets=JSON.parse(fs.readFileSync(path.join(dir,'media/voice/sentence-audio-manifest.json')));
  const generatedSentenceTexts=new Set(manifestForMigratedTargets.generatedBatches.flatMap(batch=>batch.items.map(item=>item.text)));
  for(const text of mappedTargets.filter(text=>!exactTargets.includes(text)))assert.ok(generatedSentenceTexts.has(text),`unexpected migrated target map without a generated exact clip: ${text}`);
  for(const text of exactTargets){
    const id='s-'+require('node:crypto').createHash('sha256').update(text).digest('hex').slice(0,16);
    assert.equal(recordings[text],id);
  }
  console.log('✓ 501 个改写目标不再依赖旧音频别名；已映射文本都能对应精确 voice-00 录音');
  const correctedExample='The hikers stayed on the trail so they would not molest the nesting birds.';
  const correctedEntry=wordbank.books.find(book=>book.id==='ielts').words.find(row=>row.id==='ielts::molest');
  assert.equal(correctedEntry.example,correctedExample);
  assert.equal(correctedEntry.exampleTranslation,'徒步者留在小径上，以免惊扰正在筑巢的鸟。');
  assert.ok(recordings[correctedExample],'safely corrected dictionary example has an exact recording map');
  assert.equal(recordings[correctedExample],'s-'+require('node:crypto').createHash('sha256').update(correctedExample).digest('hex').slice(0,16));
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
  const batch009=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-009-safe-pending-words-groups-70-77');
  assert.ok(batch009,'audited safe-cut batch 009 is recorded');
  assert.equal(batch009.words.length,1051);
  assert.equal(batch009.rowsConsidered,1149);
  assert.equal(batch009.skippedAlreadyMappedBeforeGeneration,0);
  assert.equal(batch009.unsafeBoundaries,54);
  assert.equal(batch009.skippedRows,98);
  assert.equal(batch009.skippedWords.length,98);
  assert.equal(batch009.skippedWords.filter(item=>item.reason==='unsafe-boundary').length,97);
  assert.equal(batch009.skippedWords.filter(item=>item.reason==='short-or-low-signal').length,1);
  assert.deepEqual(batch009.sourceGroups,[70,71,72,73,74,75,76,77]);
  assert.deepEqual(batch009.alignmentFailedGroups,[]);
  assert.equal(batch009.individuallyHumanListened,false);
  const batch010=wordManifest.generatedBatches.find(batch=>batch.id==='next-batch-010-safe-pending-words-groups-78-82');
  assert.ok(batch010,'final safe-cut batch 010 is recorded');
  assert.equal(batch010.words.length,98);
  assert.equal(batch010.rowsConsidered,98);
  assert.equal(batch010.skippedAlreadyMappedBeforeGeneration,0);
  assert.equal(batch010.decodedClips,98);
  assert.equal(batch010.unsafeBoundaries,0);
  assert.equal(batch010.skippedRows,0);
  assert.deepEqual(batch010.skippedWords,[]);
  assert.deepEqual(batch010.sourceGroups,[78,79,80,81,82]);
  assert.deepEqual(batch010.alignmentFailedGroups,[]);
  assert.equal(batch010.individuallyHumanListened,false);
  assert.equal(wordManifest.count,9830);
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
  const sentenceManifest=JSON.parse(fs.readFileSync(path.join(dir,'media/voice/sentence-audio-manifest.json')));
  assert.equal(sentenceManifest.voice_id,'voice-00');
  assert.equal(sentenceManifest.language,'en-US');
  const sentenceBatch001=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-001');
  assert.ok(sentenceBatch001,'first exact-text sentence batch is recorded');
  assert.equal(sentenceBatch001.itemsConsidered,10);
  assert.equal(sentenceBatch001.clipsPublished,10);
  assert.equal(sentenceBatch001.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch001.individuallyHumanListened,false);
  assert.equal(sentenceBatch001.items.length,10);
  for(const item of sentenceBatch001.items){
    const id='s-'+require('node:crypto').createHash('sha256').update(item.text).digest('hex').slice(0,16);
    assert.equal(item.clip,id);
    assert.equal(recordings[item.text],id);
    assert.equal(item.alignment,'PocketSphinx exact token sequence');
    assert.equal(item.ffmpegDecoded,true);
    const bytes=fs.readFileSync(path.join(dir,'media/voice',`${id}.mp3`));
    assert.equal(bytes.length,item.bytes);
    assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.ok(cached.includes(`./media/voice/${id}.mp3`));
  }
  console.log('✓ 句子补录批次 001：10 条逐词对齐、MP3 哈希和离线映射均通过（未人工听检）');
  const sentenceBatch002=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-002');
  assert.ok(sentenceBatch002,'safe correction sentence batch is recorded');
  assert.equal(sentenceBatch002.itemsConsidered,1);
  assert.equal(sentenceBatch002.clipsPublished,1);
  assert.equal(sentenceBatch002.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch002.individuallyHumanListened,false);
  assert.equal(sentenceBatch002.items.length,1);
  const correctedItem=sentenceBatch002.items[0];
  const correctedId='s-'+require('node:crypto').createHash('sha256').update(correctedExample).digest('hex').slice(0,16);
  assert.equal(correctedItem.text,correctedExample);
  assert.equal(correctedItem.source,'ielts:molest');
  assert.equal(correctedItem.clip,correctedId);
  assert.equal(correctedItem.alignment,'PocketSphinx exact token sequence');
  assert.equal(correctedItem.ffmpegDecoded,true);
  const correctedBytes=fs.readFileSync(path.join(dir,'media/voice',`${correctedId}.mp3`));
  assert.equal(correctedBytes.length,correctedItem.bytes);
  assert.equal(require('node:crypto').createHash('sha256').update(correctedBytes).digest('hex'),correctedItem.sha256);
  assert.ok(cached.includes(`./media/voice/${correctedId}.mp3`));
  console.log('✓ 被审核阻止的词典例句已替换并以精确文本映射发布（未重试原文、未人工听检）');
  const sentenceBatch003=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-003');
  assert.ok(sentenceBatch003,'exact-text sentence batch 003 is recorded');
  assert.equal(sentenceBatch003.itemsConsidered,5);
  assert.equal(sentenceBatch003.clipsPublished,5);
  assert.equal(sentenceBatch003.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch003.individuallyHumanListened,false);
  assert.equal(sentenceBatch003.items.length,5);
  const batch003Texts=[
    'Creating something creative yourself is a way of improving your creativity.',
    'He is addicted to solving crossword puzzles.',
    'For example, our library stays open until eight.',
    "I've noticed that having fun doesn't interfere at all with your studies.",
    'She was fourteen when she joined the school orchestra.'
  ];
  assert.deepEqual(sentenceBatch003.items.map(item=>item.text).sort(),batch003Texts.slice().sort());
  for(const item of sentenceBatch003.items){
    const id='s-'+require('node:crypto').createHash('sha256').update(item.text).digest('hex').slice(0,16);
    assert.equal(item.clip,id);
    assert.equal(recordings[item.text],id);
    assert.equal(item.alignment,'PocketSphinx exact token sequence');
    assert.equal(item.ffmpegDecoded,true);
    assert.equal(item.miniaudioDecoded,true);
    const bytes=fs.readFileSync(path.join(dir,'media/voice',`${id}.mp3`));
    assert.equal(bytes.length,item.bytes);
    assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.ok(cached.includes(`./media/voice/${id}.mp3`));
  }
  console.log('✓ 句子补录批次 003：5 条逐词对齐、MP3 双解码、哈希及离线映射通过（未人工听检）');
  const sentenceBatch004=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-004');
  assert.ok(sentenceBatch004,'grouped exact-text sentence batch 004 is recorded');
  assert.equal(sentenceBatch004.itemsConsidered,180);
  assert.equal(sentenceBatch004.clipsPublished,180);
  assert.equal(sentenceBatch004.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch004.individuallyHumanListened,false);
  assert.deepEqual(sentenceBatch004.sourceAudioGroups,['safe-001','safe-002','safe-003','safe-004','safe-005','safe-006','safe-007','safe-008','safe-009','safe-010']);
  assert.equal(sentenceBatch004.items.length,180);
  assert.equal(new Set(sentenceBatch004.items.map(item=>item.text)).size,180);
  for(const item of sentenceBatch004.items){
    const id='s-'+require('node:crypto').createHash('sha256').update(item.text).digest('hex').slice(0,16);
    assert.equal(item.clip,id);
    assert.equal(item.safe,true);
    assert.equal(recordings[item.text],id);
    assert.equal(item.alignment,'PocketSphinx exact token sequence');
    assert.equal(item.ffmpegDecoded,true);
    assert.equal(item.miniaudioDecoded,true);
    const bytes=fs.readFileSync(path.join(dir,'media/voice',`${id}.mp3`));
    assert.equal(bytes.length,item.bytes);
    assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.ok(cached.includes(`./media/voice/${id}.mp3`));
  }
  console.log('✓ 句子补录批次 004：180 条精确对齐、低能量切分、双解码、哈希及离线映射通过（未人工听检）');
  const sentenceBatch005=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-005');
  assert.ok(sentenceBatch005,'grouped exact-text sentence batch 005 is recorded');
  assert.equal(sentenceBatch005.itemsConsidered,179);
  assert.equal(sentenceBatch005.clipsPublished,179);
  assert.equal(sentenceBatch005.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch005.individuallyHumanListened,false);
  assert.deepEqual(sentenceBatch005.sourceAudioGroups,['safe-001','safe-002','safe-003','safe-004','safe-005','safe-006','safe-007','safe-008','safe-009','safe-010']);
  assert.equal(sentenceBatch005.items.length,179);
  assert.equal(new Set(sentenceBatch005.items.map(item=>item.text)).size,179);
  const batch005GroupCounts=Object.fromEntries([...new Set(sentenceBatch005.items.map(item=>item.group))].map(group=>[group,sentenceBatch005.items.filter(item=>item.group===group).length]));
  assert.equal(batch005GroupCounts['safe-001'],17);
  for(const group of sentenceBatch005.sourceAudioGroups.slice(1))assert.equal(batch005GroupCounts[group],18);
  for(const item of sentenceBatch005.items){
    const id='s-'+require('node:crypto').createHash('sha256').update(item.text).digest('hex').slice(0,16);
    assert.equal(item.clip,id);
    assert.equal(item.safe,true);
    assert.equal(recordings[item.text],id);
    assert.equal(item.alignment,'PocketSphinx exact token sequence');
    assert.equal(item.ffmpegDecoded,true);
    assert.equal(item.miniaudioDecoded,true);
    const bytes=fs.readFileSync(path.join(dir,'media/voice',`${id}.mp3`));
    assert.equal(bytes.length,item.bytes);
    assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.ok(cached.includes(`./media/voice/${id}.mp3`));
  }
  console.log('✓ 句子补录批次 005：179 条精确对齐、低能量切分、双解码、哈希及离线映射通过（未人工听检）');
  const sentenceBatch006=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-006');
  assert.ok(sentenceBatch006,'grouped and isolated exact-text sentence batch 006 is recorded');
  assert.equal(sentenceBatch006.itemsConsidered,58);
  assert.equal(sentenceBatch006.clipsPublished,58);
  assert.equal(sentenceBatch006.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch006.individuallyHumanListened,false);
  assert.equal(sentenceBatch006.isolatedReviewItemsPublished,7);
  assert.deepEqual(sentenceBatch006.sourceAudioGroups,['safe-011','safe-012','safe-013','isolated-017','isolated-018','isolated-020','isolated-024','isolated-032','isolated-033','isolated-042']);
  assert.equal(sentenceBatch006.items.length,58);
  assert.equal(new Set(sentenceBatch006.items.map(item=>item.text)).size,58);
  const batch006GroupCounts=Object.fromEntries([...new Set(sentenceBatch006.items.map(item=>item.group))].map(group=>[group,sentenceBatch006.items.filter(item=>item.group===group).length]));
  assert.equal(batch006GroupCounts['safe-011'],18);
  assert.equal(batch006GroupCounts['safe-012'],18);
  assert.equal(batch006GroupCounts['safe-013'],15);
  for(const group of sentenceBatch006.sourceAudioGroups.slice(3))assert.equal(batch006GroupCounts[group],1);
  for(const item of sentenceBatch006.items){
    const id='s-'+require('node:crypto').createHash('sha256').update(item.text).digest('hex').slice(0,16);
    assert.equal(item.clip,id);
    assert.equal(item.safe,true);
    assert.equal(recordings[item.text],id);
    assert.equal(item.alignment,'PocketSphinx exact token sequence');
    assert.equal(item.ffmpegDecoded,true);
    assert.equal(item.miniaudioDecoded,true);
    const bytes=fs.readFileSync(path.join(dir,'media/voice',`${id}.mp3`));
    assert.equal(bytes.length,item.bytes);
    assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.ok(cached.includes(`./media/voice/${id}.mp3`));
  }
  console.log('✓ 句子补录批次 006：58 条对齐、低能量切分、双解码、哈希及离线映射通过（7 条隔离例句单独生成；未人工听检）');
  const voiceQueue=spawnSync(process.execPath,['scripts/voice-queue.mjs'],{cwd:dir,encoding:'utf8'});
  assert.equal(voiceQueue.status,0,voiceQueue.stderr||voiceQueue.stdout);
  const queueSummary=JSON.parse(voiceQueue.stdout);
  assert.equal(queueSummary.uniqueRecordableSentences,17573);
  assert.equal(queueSummary.recordedRecordableSentences,17507);
  assert.equal(queueSummary.pendingRecordableSentences,66);
  assert.equal(queueSummary.uniqueDictionaryPhrases,472);
  assert.equal(queueSummary.recordedDictionaryPhrases,472);
  assert.equal(queueSummary.pendingDictionaryPhrases,0);
  assert.equal(queueSummary.missingMappedAudioFiles,0);
  console.log('✓ 句子与词典短语分开校验：17,573 条完整句中 66 条待补；472 个词典短语均已录制，映射音频文件齐全');
})().catch(e=>{console.error(e);process.exitCode=1;});
