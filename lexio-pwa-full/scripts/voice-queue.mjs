// Produce the next recording batch from the shipped books instead of keeping
// a second copy of the wordbank. Duplicate sentences need only one MP3.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), read=p=>readFileSync(new URL(p,root),'utf8');
const html=read('index.html');
const clips=JSON.parse(html.match(/const selectedRecordings = (\{[\s\S]*?\});/)[1]);
const demo=vm.runInNewContext(html.match(/const SAMPLE_WORDS = (\[[\s\S]*?\n      \]);/)[1]);
const books=JSON.parse(read('data/original-site-wordbank.json')).books;
const phrases=JSON.parse(read('data/daily-conversation.json')).phrases;
const sentences=new Map();
function add(text,source){
  text=text?.trim();if(!text || sentences.has(text))return;
  sentences.set(text,source);
}
for(const {id,words} of [...books,{id:'demo',words:demo}]){
  for(const {example,word} of words){const text=example?.trim();
    // Same dictionary-fragment rule as the study card; these are not sentences.
    if(text && !text.startsWith('...') && !(/^[a-z]/.test(text)&&!/[.!?]["'”)]?$/.test(text)))add(text,`${id}:${word}`);
  }
}
for(const p of phrases)add(p.en,`phrase:${p.id}`);
for(const [text,clip] of Object.entries(clips)){
  if(!sentences.has(text)||!existsSync(new URL(`media/voice/${clip}.mp3`,root)))throw Error(`Unmatched recording: ${clip}`);
}
const missing=[...sentences].filter(([text])=>!Object.hasOwn(clips,text));
if(process.argv.includes('--pending')){
  for(const [text,source] of missing){const id=createHash('sha256').update(text).digest('hex').slice(0,16);
    console.log(JSON.stringify({voice_id:'voice-00',text,source,file:`media/voice/s-${id}.mp3`}));}
}else console.log(JSON.stringify({uniqueSentences:sentences.size,recorded:Object.keys(clips).length,pending:missing.length}));
