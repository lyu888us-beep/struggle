// Produce the next recording batch from the shipped books instead of keeping
// a second copy of the wordbank. Duplicate sentences need only one MP3.
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), read=p=>readFileSync(new URL(p,root),'utf8');
const html=read('index.html');
const clips=JSON.parse(html.match(/const selectedRecordings = (\{[\s\S]*?\});/)[1]);
const PINNED_BASE='41e3e170c1d7be74ea9712548c33abe6bf4f73a5';
const localAudioCount=readdirSync(new URL('media/voice/',root)).filter(name=>name.endsWith('.mp3')).length;
let pinnedAudioNames=null;
if(localAudioCount<17000){
  const repoRoot=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'}).trim();
  const hasBase=spawnSync('git',['cat-file','-e',`${PINNED_BASE}^{commit}`],{cwd:repoRoot,stdio:'ignore'}).status===0;
  if(!hasBase)execFileSync('git',['fetch','--no-tags','origin',PINNED_BASE],{cwd:repoRoot,stdio:'inherit'});
  pinnedAudioNames=new Set(execFileSync('git',['ls-tree','-r','--name-only',PINNED_BASE,'lexio-pwa-full/media/voice'],{cwd:repoRoot,encoding:'utf8'})
    .trim().split(/\r?\n/).map(path=>path.slice(path.lastIndexOf('/')+1)));
}
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
    // Dictionary fragments stay outside the sentence queue unless an exact
    // voice-00 clip is present; then include them in recording/file validation.
    const fragment=text && (text.startsWith('...') || (/^[a-z]/.test(text)&&!/[.!?]["'”)]?$/.test(text)));
    if(text && (!fragment || Object.hasOwn(clips,text)))add(text,`${id}:${word}`);
  }
}
for(const p of phrases)add(p.en,`phrase:${p.id}`);
for(const [text,clip] of Object.entries(clips)){
  const local=existsSync(new URL(`media/voice/${clip}.mp3`,root));
  const presentInPinnedBase=pinnedAudioNames?.has(`${clip}.mp3`);
  if(!sentences.has(text)||(!local&&!presentInPinnedBase))throw Error(`Unmatched recording: ${clip}`);
}
const missing=[...sentences].filter(([text])=>!Object.hasOwn(clips,text));
if(process.argv.includes('--pending')){
  for(const [text,source] of missing){const id=createHash('sha256').update(text).digest('hex').slice(0,16);
    console.log(JSON.stringify({voice_id:'voice-00',text,source,file:`media/voice/s-${id}.mp3`}));}
}else console.log(JSON.stringify({uniqueSentences:sentences.size,recorded:Object.keys(clips).length,pending:missing.length}));
