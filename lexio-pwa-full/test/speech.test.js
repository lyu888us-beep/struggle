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
  const revisedEntries=[
    ['cet4::negro','This term is now considered outdated and offensive.','这个词如今被认为过时且具有冒犯性。'],
    ['kaoyan::negro','This term is now considered outdated and offensive.','这个词如今被认为过时且具有冒犯性。'],
    ['cet4::fantasize','She fantasized about traveling around the world.','她幻想着环游世界。'],
    ['ielts::capillary','Water rises through narrow capillary tubes in a plant stem.','水会沿着植物茎中的狭窄毛细管上升。'],
    ['gaokao::underwear','She packed a clean pair of underwear for the trip.','她为旅行准备了一套干净的内衣。'],
    ['cet4::cripple','This word can be offensive when used to refer to people with disabilities.','这个词用于指称残障人士时可能具有冒犯性。'],
    ['kaoyan::gay','A gay couple opened a bookstore near the park.','一对同性伴侣在公园附近开了一家书店。'],
    ['cet6::odds','The odds of rain are high this afternoon.','今天下午下雨的可能性很大。'],
    ['cet6::cripple','This word can be offensive when used to refer to people with disabilities.','这个词用于指称残障人士时可能具有冒犯性。'],
    ['kaoyan::cripple','This word can be offensive when used to refer to people with disabilities.','这个词用于指称残障人士时可能具有冒犯性。'],
    ['ielts::cripple','This word can be offensive when used to refer to people with disabilities.','这个词用于指称残障人士时可能具有冒犯性。'],
    ['ielts::odds','The odds of rain are high this afternoon.','今天下午下雨的可能性很大。']
  ];
  const sourceRows=new Map(wordbank.books.flatMap(book=>book.words||[]).map(row=>[row.id,row]));
  const greetingExample="Hi, how's your day going?";
  const greetingTranslation='嗨，今天过得怎么样？';
  for(const [id,oldExample] of [
    ['cet4::hi','Sami said that Layla was his girlfriend'],
    ['school-pep-7-1-3','His glasses are blue.'],
  ]){
    const row=sourceRows.get(id),migration=wordbank.metadata.exampleTextMigrations[id];
    assert.equal(row.example,greetingExample,`${id} uses a greeting example for hi`);
    assert.equal(row.exampleTranslation,greetingTranslation);
    assert.equal(row.exampleSource,'Lexio · 日常口语');
    assert.equal(migration.from,oldExample);
    assert.equal(migration.to,greetingExample);
    assert.equal(recordings[greetingExample],'daily-1','corrected greeting example uses its exact existing voice clip');
  }
  for(const [id,text,translation] of revisedEntries){
    const row=sourceRows.get(id),migration=wordbank.metadata.exampleTextMigrations[id];
    assert.equal(row.example,text);
    assert.equal(row.exampleTranslation,translation);
    assert.equal(migration.to,text);
    assert.ok(Array.isArray(migration.alsoFrom)&&migration.alsoFrom.length>0,`${id} retains prior published text for migration`);
  }
  assert.ok(revisedEntries.every(([,text])=>Object.hasOwn(recordings,text)),'all safely revised examples have exact published audio');
  assert.equal(wordbank.metadata.stats.withExampleTranslation,26736);
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
  assert.ok(mappedTargets.includes(greetingExample),'corrected greeting reuses its exact daily-conversation recording');
  const manifestForMigratedTargets=JSON.parse(fs.readFileSync(path.join(dir,'media/voice/sentence-audio-manifest.json')));
  const generatedSentenceTexts=new Set(manifestForMigratedTargets.generatedBatches.flatMap(batch=>batch.items.map(item=>item.text)));
  for(const text of mappedTargets.filter(text=>!exactTargets.includes(text)&&text!==greetingExample))assert.ok(generatedSentenceTexts.has(text),`unexpected migrated target map without a generated exact clip: ${text}`);
  for(const text of exactTargets){
    const id='s-'+require('node:crypto').createHash('sha256').update(text).digest('hex').slice(0,16);
    assert.equal(recordings[text],id);
  }
  console.log(`✓ ${mappedTargets.length} 个改写目标不再依赖旧音频别名；已映射文本都能对应精确 voice-00 录音`);
  const correctedExample='The hikers stayed on the trail so they would not molest the nesting birds.';
  const correctedEntry=wordbank.books.find(book=>book.id==='ielts').words.find(row=>row.id==='ielts::molest');
  assert.equal(correctedEntry.example,correctedExample);
  assert.equal(correctedEntry.exampleTranslation,'徒步者留在小径上，以免惊扰正在筑巢的鸟。');
  assert.ok(recordings[correctedExample],'safely corrected dictionary example has an exact recording map');
  assert.equal(recordings[correctedExample],'s-'+require('node:crypto').createHash('sha256').update(correctedExample).digest('hex').slice(0,16));
  const wordManifest=JSON.parse(fs.readFileSync(path.join(dir,'media/voice/word-audio-manifest.json')));
  assert.equal(wordManifest.voice_id,'voice-00');
  const reviewedThe=(wordManifest.humanReviewedWordClips||[]).find(item=>item.word==='the');
  assert.ok(reviewedThe&&reviewedThe.userConfirmed,'the crop has explicit user confirmation');
  assert.equal(reviewedThe.clipId,wordManifest.clips.the);
  assert.equal(reviewedThe.cacheRevision,'review-2026-11-20');
  assert.equal(reviewedThe.reviewedOn,'2026-11-20');
  assert.equal(reviewedThe.cropStartSeconds,133.172);
  assert.equal(reviewedThe.cropEndSeconds,134.2);
  assert.ok(html.includes("const selectedWordAudioRevisions = { the: 'review-2026-11-20' };"));
  assert.ok(html.includes('wordAudioUrl(entry.word, localWordClip)'));
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
    const fileUrl=`./media/voice/${clip}.mp3`;
    const cacheUrl=word==='the'?`${fileUrl}?rev=${reviewedThe.cacheRevision}`:fileUrl;
    assert.ok(cached.includes(cacheUrl),`${word} missing from offline resources`);
    const mp3=fs.readFileSync(path.join(dir,fileUrl));
    assert.ok(mp3.length>1000,`${word} clip is missing or implausibly small`);
  }
  console.log(`✓ ${Object.keys(wordRecordings).length} 个单词音频已纳入 en-US 播放和离线资源（5 个原始确认样音 + ${generatedBatchWords.length} 个生成片段；the 修复版另经用户确认）`);
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
  console.log('✓ 句子补录批次 006：58 条对齐、切分检查、双解码、哈希及离线映射通过（7 条隔离例句单独生成；未人工听检）');
  const sentenceBatch007=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-007');
  assert.ok(sentenceBatch007,'context-reviewed isolated exact-text sentence batch 007 is recorded');
  assert.equal(sentenceBatch007.itemsConsidered,10);
  assert.equal(sentenceBatch007.clipsPublished,10);
  assert.equal(sentenceBatch007.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch007.individuallyHumanListened,false);
  assert.equal(sentenceBatch007.isolatedReviewItemsPublished,10);
  assert.equal(sentenceBatch007.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch007.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch007.contextualReview.items.length,10);
  assert.deepEqual(sentenceBatch007.contextualReview.items.map(item=>item.group),['isolated-015','isolated-016','isolated-025','isolated-026','isolated-027','isolated-030','isolated-038','isolated-043','isolated-048','isolated-049']);
  assert.deepEqual(sentenceBatch007.sourceAudioGroups,['isolated-015','isolated-016','isolated-025','isolated-026','isolated-027','isolated-030','isolated-038','isolated-043','isolated-048','isolated-049']);
  assert.equal(sentenceBatch007.items.length,10);
  assert.equal(new Set(sentenceBatch007.items.map(item=>item.text)).size,10);
  for(const item of sentenceBatch007.items){
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
  console.log('✓ 句子补录批次 007：10 条隔离例句单独录制、精确对齐、双解码、哈希及离线映射通过（未人工听检）');
  const sentenceBatch008=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-008');
  assert.ok(sentenceBatch008,'context-reviewed isolated exact-text sentence batch 008 is recorded');
  assert.equal(sentenceBatch008.itemsConsidered,10);
  assert.equal(sentenceBatch008.clipsPublished,10);
  assert.equal(sentenceBatch008.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch008.individuallyHumanListened,false);
  assert.equal(sentenceBatch008.isolatedReviewItemsPublished,10);
  assert.equal(sentenceBatch008.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch008.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch008.contextualReview.items.length,10);
  assert.deepEqual(sentenceBatch008.contextualReview.items.map(item=>item.group),['isolated-041','isolated-050','isolated-052','isolated-056','isolated-057','isolated-060','isolated-063','isolated-064','isolated-066','isolated-067']);
  assert.deepEqual(sentenceBatch008.sourceAudioGroups,['isolated-041','isolated-050','isolated-052','isolated-056','isolated-057','isolated-060','isolated-063','isolated-064','isolated-066','isolated-067']);
  assert.equal(sentenceBatch008.items.length,10);
  assert.equal(new Set(sentenceBatch008.items.map(item=>item.text)).size,10);
  for(const item of sentenceBatch008.items){
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
  console.log('✓ 句子补录批次 008：10 条隔离例句单独录制、精确对齐、双解码、哈希及离线映射通过（未人工听检）');
  const sentenceBatch009=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-009');
  assert.ok(sentenceBatch009,'context-reviewed and safely revised batch 009 is recorded');
  assert.equal(sentenceBatch009.itemsConsidered,10);
  assert.equal(sentenceBatch009.clipsPublished,9);
  assert.equal(sentenceBatch009.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch009.deferredAfterGenerationFailure,1);
  assert.equal(sentenceBatch009.individuallyHumanListened,false);
  assert.equal(sentenceBatch009.isolatedReviewItemsPublished,9);
  assert.equal(sentenceBatch009.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch009.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch009.contextualReview.items.length,10);
  assert.deepEqual(sentenceBatch009.sourceAudioGroups,['isolated-019','isolated-028','isolated-036','isolated-054','isolated-058','isolated-068','isolated-069','isolated-073','isolated-079']);
  assert.deepEqual(sentenceBatch009.reviewedSourceGroups,['isolated-019','isolated-028','isolated-036','isolated-054','isolated-058','isolated-068','isolated-069','isolated-073','isolated-079','isolated-084']);
  assert.equal(sentenceBatch009.items.length,9);
  assert.equal(new Set(sentenceBatch009.items.map(item=>item.text)).size,9);
  const capillaryDeferred='Water rises through narrow capillary tubes in a plant stem.';
  assert.equal(sentenceBatch009.generationFailureReplacements.length,1);
  assert.equal(sentenceBatch009.generationFailureReplacements[0].source,'ielts:capillary');
  assert.equal(sentenceBatch009.generationFailureReplacements[0].replacementText,capillaryDeferred);
  assert.equal(sentenceBatch009.generationFailureReplacements[0].originalRetried,false);
  assert.ok(!sentenceBatch009.items.some(item=>item.text===capillaryDeferred),'batch 009 correctly records the replacement as deferred at that time');
  const sentenceBatch010=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-010');
  assert.ok(sentenceBatch010,'deferred safe replacement is completed in its own batch');
  assert.equal(sentenceBatch010.itemsConsidered,1);
  assert.equal(sentenceBatch010.clipsPublished,1);
  assert.equal(sentenceBatch010.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch010.resolvesDeferredReplacementFrom,'sentence-batch-009 / isolated-084');
  assert.equal(sentenceBatch010.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch010.contextualReview.items.length,1);
  assert.equal(sentenceBatch010.generationFailureReplacements[0].originalRetried,false);
  assert.equal(sentenceBatch010.generationFailureReplacements[0].replacementText,capillaryDeferred);
  const capillaryItem=sentenceBatch010.items[0];
  const capillaryId='s-'+require('node:crypto').createHash('sha256').update(capillaryDeferred).digest('hex').slice(0,16);
  assert.equal(capillaryItem.text,capillaryDeferred);
  assert.equal(capillaryItem.source,'ielts:capillary');
  assert.equal(capillaryItem.clip,capillaryId);
  assert.equal(recordings[capillaryDeferred],capillaryId);
  assert.equal(capillaryItem.alignment,'PocketSphinx exact token sequence');
  assert.equal(capillaryItem.ffmpegDecoded,true);
  assert.equal(capillaryItem.miniaudioDecoded,true);
  const capillaryBytes=fs.readFileSync(path.join(dir,'media/voice',`${capillaryId}.mp3`));
  assert.equal(capillaryBytes.length,capillaryItem.bytes);
  assert.equal(require('node:crypto').createHash('sha256').update(capillaryBytes).digest('hex'),capillaryItem.sha256);
  assert.ok(cached.includes(`./media/voice/${capillaryId}.mp3`));
  for(const item of sentenceBatch009.items){
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
  console.log('✓ 句子补录批次 009：9 条精确对齐和双解码发布；安全 capillary 替代录音在批次 010 后续补齐（原句未重试；未人工听检）');
  console.log('✓ 句子补录批次 010：此前递延的 capillary 替代句独立录制、精确对齐、双解码，并发布到离线资源（未人工听检）');
  const sentenceBatch011=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-011');
  assert.ok(sentenceBatch011,'next context-reviewed sentence batch is recorded');
  assert.equal(sentenceBatch011.itemsConsidered,9);
  assert.equal(sentenceBatch011.clipsPublished,9);
  assert.equal(sentenceBatch011.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch011.individuallyHumanListened,false);
  assert.equal(sentenceBatch011.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch011.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch011.contextualReview.items.length,9);
  assert.deepEqual(sentenceBatch011.sourceAudioGroups,['isolated-next-001','isolated-next-002','isolated-next-003','isolated-next-004','isolated-next-005','isolated-next-006','isolated-next-007','isolated-next-008','isolated-next-009']);
  assert.equal(sentenceBatch011.items.length,9);
  assert.equal(new Set(sentenceBatch011.items.map(item=>item.text)).size,9);
  for(const item of sentenceBatch011.items){
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
  console.log('✓ 句子补录批次 011：9 条逐项语境复核、精确对齐、双解码及离线资源验证通过（未人工听检）');
  const sentenceBatch012=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-012');
  assert.ok(sentenceBatch012,'next context-reviewed sentence batch is recorded');
  assert.equal(sentenceBatch012.itemsConsidered,10);
  assert.equal(sentenceBatch012.clipsPublished,10);
  assert.equal(sentenceBatch012.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch012.individuallyHumanListened,false);
  assert.equal(sentenceBatch012.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch012.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch012.contextualReview.items.length,10);
  assert.deepEqual(sentenceBatch012.sourceAudioGroups,['isolated-next-010','isolated-next-011','isolated-next-012','isolated-next-013','isolated-next-014','isolated-next-015','isolated-next-016','isolated-next-017','isolated-next-018','isolated-next-019']);
  assert.equal(sentenceBatch012.items.length,10);
  assert.equal(new Set(sentenceBatch012.items.map(item=>item.text)).size,10);
  for(const item of sentenceBatch012.items){
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
  console.log('✓ 句子补录批次 012：10 条逐项语境复核、精确对齐、双解码及离线资源验证通过（未人工听检）');
  const sentenceBatch013=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-013');
  assert.ok(sentenceBatch013,'context-reviewed and revised example batch 013 is recorded');
  assert.equal(sentenceBatch013.itemsConsidered,10);
  assert.equal(sentenceBatch013.clipsPublished,10);
  assert.equal(sentenceBatch013.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch013.individuallyHumanListened,false);
  assert.equal(sentenceBatch013.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch013.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch013.contextualReview.items.length,10);
  assert.equal(sentenceBatch013.safeExampleRevisions.length,8);
  assert.ok(sentenceBatch013.safeExampleRevisions.every(row=>row.originalRetried===false));
  assert.deepEqual(sentenceBatch013.sourceAudioGroups,['isolated-next-020','isolated-next-021','isolated-next-022','isolated-next-023','isolated-next-024','isolated-next-025','isolated-next-026','isolated-next-027','isolated-next-028','isolated-next-029']);
  assert.equal(sentenceBatch013.items.length,10);
  assert.equal(new Set(sentenceBatch013.items.map(item=>item.text)).size,10);
  for(const item of sentenceBatch013.items){
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
  for(const revision of sentenceBatch013.safeExampleRevisions)assert.ok(!Object.hasOwn(recordings,revision.previousText),`retired wording has no stale audio alias: ${revision.source}`);
  console.log('✓ 句子补录批次 013：10 条逐项复核、8 条多词库安全例句迁移、精确对齐、双解码及离线资源验证通过（未人工听检）');
  const sentenceBatch014=sentenceManifest.generatedBatches.find(batch=>batch.id==='sentence-batch-014');
  assert.ok(sentenceBatch014,'final pending sentence batch is recorded');
  assert.equal(sentenceBatch014.itemsConsidered,7);
  assert.equal(sentenceBatch014.clipsPublished,7);
  assert.equal(sentenceBatch014.skippedAfterSafetyChecks,0);
  assert.equal(sentenceBatch014.individuallyHumanListened,false);
  assert.equal(sentenceBatch014.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch014.contextualReview.automatedKeywordFlagsAreSafetyVerdicts,false);
  assert.equal(sentenceBatch014.contextualReview.items.length,7);
  assert.deepEqual(sentenceBatch014.sourceAudioGroups,['isolated-next-030','isolated-next-031','isolated-next-032','isolated-next-033','isolated-next-034','isolated-next-035','isolated-next-036']);
  assert.equal(sentenceBatch014.items.length,7);
  assert.equal(new Set(sentenceBatch014.items.map(item=>item.text)).size,7);
  for(const item of sentenceBatch014.items){
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
  console.log('✓ 句子补录批次 014：最后 7 条逐项语境复核、精确对齐、双解码及离线资源验证通过（未人工听检）');
  const voiceQueue=spawnSync(process.execPath,['scripts/voice-queue.mjs'],{cwd:dir,encoding:'utf8'});
  assert.equal(voiceQueue.status,0,voiceQueue.stderr||voiceQueue.stdout);
  const queueSummary=JSON.parse(voiceQueue.stdout);
  assert.equal(queueSummary.uniqueRecordableSentences,17572);
  assert.equal(queueSummary.recordedRecordableSentences,17572);
  assert.equal(queueSummary.pendingRecordableSentences,0);
  assert.equal(queueSummary.uniqueDictionaryPhrases,472);
  assert.equal(queueSummary.recordedDictionaryPhrases,472);
  assert.equal(queueSummary.pendingDictionaryPhrases,0);
  assert.equal(queueSummary.missingMappedAudioFiles,0);
  console.log('✓ 句子与词典短语分开校验：17,572 条完整句和 472 个词典短语全部已录制，映射音频文件齐全');
})().catch(e=>{console.error(e);process.exitCode=1;});
