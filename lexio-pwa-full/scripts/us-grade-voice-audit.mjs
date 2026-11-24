#!/usr/bin/env node
// Audit existing exact voice-00 recordings for the US Grade 1–9 pack.
// `node scripts/us-grade-voice-audit.mjs --pending` emits missing exact-text
// headwords and examples as JSONL; it never invents text or chooses another clip.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const html=read('index.html');
const parseObject=name=>{
  const match=html.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\});`));
  if(!match)throw new Error(`Could not find ${name} in index.html`);
  return JSON.parse(match[1]);
};
const selectedWords=parseObject('selectedWordRecordings');
const selectedSentences=parseObject('selectedRecordings');
const wordManifest=JSON.parse(read('media/voice/word-audio-manifest.json'));
const sentenceManifest=JSON.parse(read('media/voice/sentence-audio-manifest.json'));
const payload=JSON.parse(read('data/original-site-wordbank.json'));
const gradeBooks=payload.books.filter(book=>/^us-grade-[1-9]$/.test(book.id));
const expectedCounts=[175,175,250,250,250,300,300,300,300];
if(gradeBooks.length!==9)throw new Error(`Expected 9 US grade books, found ${gradeBooks.length}`);
for(let i=0;i<gradeBooks.length;i++){
  if(gradeBooks[i].words.length!==expectedCounts[i])throw new Error(`${gradeBooks[i].id}: unexpected count ${gradeBooks[i].words.length}`);
}
if(wordManifest.voice_id!=='voice-00'||sentenceManifest.voice_id!=='voice-00'){
  throw new Error('The published word and sentence manifests must both identify voice-00.');
}
if(wordManifest.language!=='en-US'||sentenceManifest.language!=='en-US'){
  throw new Error('US grade audio must be en-US.');
}
const wordRows=gradeBooks.flatMap(book=>book.words.map(word=>({...word,bookId:book.id})));
const meaningMigrations=payload.metadata?.wordFieldMigrations||{};
const uniqueWords=new Map();
for(const row of wordRows){
  const key=String(row.word||'').trim().toLowerCase();
  if(!key)throw new Error(`Empty headword in ${row.bookId}`);
  if(uniqueWords.has(key))throw new Error(`Duplicate US grade headword: ${key}`);
  uniqueWords.set(key,row);
  if(!/[\u3400-\u9fff]/.test(String(row.meaning||'')))throw new Error(`Non-Chinese US grade meaning: ${row.id}`);
  if(!String(row.meaningEn||'').trim())throw new Error(`Lost original English gloss: ${row.id}`);
  if(!String(row.meaningSource||'').trim())throw new Error(`Missing meaning attribution: ${row.id}`);
  const migration=meaningMigrations[row.id]?.meaning;
  const fromValues=Array.isArray(migration?.from)?migration.from:[migration?.from];
  if(migration?.to!==row.meaning||!fromValues.includes(row.meaningEn))throw new Error(`Missing exact old-English-to-Chinese migration: ${row.id}`);
}
const wordManifestClips=wordManifest.clips||{};
const sentenceManifestClips=new Map();
for(const batch of sentenceManifest.generatedBatches||[]){
  for(const item of batch.items||[]){
    if(sentenceManifestClips.has(item.text)&&sentenceManifestClips.get(item.text)!==item.clip){
      throw new Error(`Conflicting sentence manifest entries for exact text: ${item.text}`);
    }
    sentenceManifestClips.set(item.text,item.clip);
  }
}
const gradeExamples=new Map();
for(const row of wordRows){
  const text=String(row.example||'').trim();
  if(text&&!gradeExamples.has(text))gradeExamples.set(text,row);
}
const sha=(text,length=16)=>createHash('sha256').update(text).digest('hex').slice(0,length);
const wordAudio={mapped:[],missing:[],orphanExact:[],invalid:[]};
for(const [text,row] of uniqueWords){
  const expected=`w-${sha(text)}`;
  const mapped=selectedWords[text];
  const manifest=wordManifestClips[text];
  const file=`media/voice/${expected}.mp3`;
  if(manifest&&manifest!==expected){
    wordAudio.invalid.push({text,row,mapped,manifest,expected,reason:'word-manifest-id-mismatch'});
  }else if(mapped){
    if(mapped!==expected||manifest!==mapped)wordAudio.invalid.push({text,row,mapped,manifest,expected});
    else if(!existsSync(new URL(file,root)))wordAudio.invalid.push({text,row,mapped,reason:'mapped-file-missing'});
    else wordAudio.mapped.push(text);
  }else if(existsSync(new URL(file,root))){
    wordAudio.orphanExact.push({text,row,file});
  }else wordAudio.missing.push({text,row});
}
const sentenceAudio={mapped:[],missing:[],orphanExact:[],invalid:[]};
for(const [text,row] of gradeExamples){
  const expected=`s-${sha(text)}`;
  const mapped=selectedSentences[text];
  const manifest=sentenceManifestClips.get(text);
  const file=`media/voice/${expected}.mp3`;
  if(manifest&&manifest!==expected){
    sentenceAudio.invalid.push({text,row,mapped,manifest,expected,reason:'sentence-manifest-id-mismatch'});
  }else if(mapped){
    if(mapped!==expected||(manifest&&manifest!==mapped))sentenceAudio.invalid.push({text,row,mapped,manifest,expected});
    else if(!existsSync(new URL(file,root)))sentenceAudio.invalid.push({text,row,mapped,reason:'mapped-file-missing'});
    else sentenceAudio.mapped.push(text);
  }else if(existsSync(new URL(file,root))){
    sentenceAudio.orphanExact.push({text,row,file});
  }else sentenceAudio.missing.push({text,row});
}
if(wordAudio.invalid.length||sentenceAudio.invalid.length){
  console.error(JSON.stringify({wordAudioInvalid:wordAudio.invalid,sentenceAudioInvalid:sentenceAudio.invalid},null,2));
  throw new Error('Existing US grade voice mappings fail exact-ID/file validation.');
}
const wordReady=[...wordAudio.missing.map(item=>item.text),...wordAudio.orphanExact.map(item=>item.text)];
const exampleReady=[...sentenceAudio.missing.map(item=>item.text),...sentenceAudio.orphanExact.map(item=>item.text)];
const summary={
  voiceId:'voice-00',
  language:'en-US',
  grades:gradeBooks.map(book=>({id:book.id,count:book.words.length})),
  wordHeadwords:uniqueWords.size,
  mappedHeadwordClips:wordAudio.mapped.length,
  missingHeadwordClips:wordAudio.missing.length,
  exactHeadwordFilesNotMapped:wordAudio.orphanExact.length,
  uniqueExistingExamples:gradeExamples.size,
  mappedExampleClips:sentenceAudio.mapped.length,
  missingExampleClips:sentenceAudio.missing.length,
  exactExampleFilesNotMapped:sentenceAudio.orphanExact.length,
  mappedFilesMissingOrWrong:wordAudio.invalid.length+sentenceAudio.invalid.length,
};
if(process.argv.includes('--pending')){
  for(const text of wordReady){
    const row=uniqueWords.get(text);
    const clip=`w-${sha(text)}`;
    console.log(JSON.stringify({type:'word',voice_id:'voice-00',language:'en-US',text,word:row.word,wordId:row.id,bookId:row.bookId,clip,file:`media/voice/${clip}.mp3`,existingExactFile:wordAudio.orphanExact.some(item=>item.text===text)}));
  }
  for(const text of exampleReady){
    const row=gradeExamples.get(text);
    const clip=`s-${sha(text)}`;
    console.log(JSON.stringify({type:'example',voice_id:'voice-00',language:'en-US',text,word:row.word,wordId:row.id,bookId:row.bookId,clip,file:`media/voice/${clip}.mp3`,existingExactFile:sentenceAudio.orphanExact.some(item=>item.text===text)}));
  }
}else{
  console.log(JSON.stringify(summary,null,2));
}
