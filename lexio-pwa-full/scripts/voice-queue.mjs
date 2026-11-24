// Produce the next recording batch from the shipped books instead of keeping
// a second copy of the wordbank. Duplicate sentences need only one MP3.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), read=p=>readFileSync(new URL(p,root),'utf8');
const html=read('index.html');
const clips=JSON.parse(html.match(/const selectedRecordings = (\{[\s\S]*?\});/)[1]);
const demo=vm.runInNewContext(html.match(/const SAMPLE_WORDS = (\[[\s\S]*?\n      \]);/)[1]);
const wordbank=JSON.parse(read('data/original-site-wordbank.json'));
const books=wordbank.books;
const phrases=JSON.parse(read('data/daily-conversation.json')).phrases;
const preservedMigrationTexts=new Set();
for(const migration of Object.values(wordbank.metadata.exampleTextMigrations||{})){
  const prior=Array.isArray(migration.from)?migration.from:[migration.from];
  for(const text of [...prior,...(migration.alsoFrom||[])])if(typeof text==='string'&&text.trim())preservedMigrationTexts.add(text.trim());
}
for(const retired of wordbank.metadata.retiredBundledWords||[]){
  if(typeof retired.example==='string'&&retired.example.trim())preservedMigrationTexts.add(retired.example.trim());
}
const sentences=new Map(),dictionaryFragments=new Map();
function add(target,text,source){
  text=text?.trim();if(!text||target.has(text))return;
  target.set(text,source);
}
function isDictionaryFragment(text){
  return text.startsWith('...')||(/^[a-z]/.test(text)&&!/[.!?]["'”)]?$/.test(text));
}
for(const {id,words} of [...books,{id:'demo',words:demo}]){
  // US grade-pack usage examples have no bundled voice-00 recordings; the app
  // accurately falls back to the device's en-US voice for these entries.
  if(/^us-grade-[1-9]$/.test(id))continue;
  for(const {example,word} of words){const text=example?.trim();if(!text)continue;
    // Incomplete dictionary examples are retained as phrase clips, never queued
    // or counted as complete sentences.
    add(isDictionaryFragment(text)?dictionaryFragments:sentences,text,`${id}:${word}`);
  }
}
for(const p of phrases)add(sentences,p.en,`phrase:${p.id}`);
const phraseOnly=[...dictionaryFragments].filter(([text])=>!sentences.has(text));
for(const [text,clip] of Object.entries(clips)){
  if(!sentences.has(text)&&!dictionaryFragments.has(text)&&!preservedMigrationTexts.has(text))throw Error(`Unmatched recording text: ${clip} (${text})`);
  if(!existsSync(new URL(`media/voice/${clip}.mp3`,root)))throw Error(`Missing recording file: ${clip} (${text})`);
}
const missing=[...sentences].filter(([text])=>!Object.hasOwn(clips,text));
const missingDictionaryPhrases=phraseOnly.filter(([text])=>!Object.hasOwn(clips,text));
const summary={
  uniqueRecordableSentences:sentences.size,
  recordedRecordableSentences:sentences.size-missing.length,
  pendingRecordableSentences:missing.length,
  uniqueDictionaryPhrases:phraseOnly.length,
  recordedDictionaryPhrases:phraseOnly.length-missingDictionaryPhrases.length,
  pendingDictionaryPhrases:missingDictionaryPhrases.length,
  missingMappedAudioFiles:0,
};
if(process.argv.includes('--pending')){
  for(const [text,source] of missing){const id=createHash('sha256').update(text).digest('hex').slice(0,16);
    console.log(JSON.stringify({voice_id:'voice-00',text,source,file:`media/voice/s-${id}.mp3`}));}
  if(missingDictionaryPhrases.length)console.error(JSON.stringify({
    note:'Dictionary fragments are reported separately and are not emitted as full-sentence jobs.',
    pendingDictionaryPhrases:missingDictionaryPhrases.length,
  }));
}else console.log(JSON.stringify(summary));
