import {WASI, File, OpenFile, PreopenDirectory, ConsoleStdout} from '@bjorn3/browser_wasi_shim';
let module, clb;
async function bytes(url){const r=await fetch(url);if(!r.ok)throw Error(`HTTP ${r.status}`);return new Uint8Array(await r.arrayBuffer());}
self.onmessage=async({data:{id,text,voice}})=>{
 try {
  module ||= await WebAssembly.compile(await bytes('./flite.wasm'));
  const output=new File([]), files=[['speech.wav',output]];
  if(voice==='clb'){clb ||= await bytes('./clb.flitevox');files.push(['clb.flitevox',new File(clb,{readonly:true})]);}
  const wasi=new WASI(['flite','-voice',voice==='clb'?'clb.flitevox':'slt','-set','duration_stretch=1.33','-t',text,'-o','speech.wav'],[],[new OpenFile(new File([])),ConsoleStdout.lineBuffered(()=>{}),ConsoleStdout.lineBuffered(()=>{}),new PreopenDirectory('.',files)]);
  const inst=await WebAssembly.instantiate(module,{wasi_snapshot_preview1:wasi.wasiImport});
  if(wasi.start(inst)!==0 || output.data.length<=44) throw Error('No speech samples');
  const wav=output.data.slice().buffer;self.postMessage({id,wav},[wav]);
 }catch(e){self.postMessage({id,error:String(e.message||e)});}
};
