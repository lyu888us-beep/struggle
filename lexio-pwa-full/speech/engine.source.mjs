import {WASI,File,OpenFile,PreopenDirectory,ConsoleStdout} from '@bjorn3/browser_wasi_shim';
let compiled;
// Called by the same-origin service worker. No device speech engine or
// asynchronous user-gesture handoff: Safari reads the result as a media URL.
self.renderLexioWave=async (text,loadBytes)=>{
  if(!compiled) compiled=Promise.resolve().then(loadBytes).then(b=>WebAssembly.compile(b)).catch(e=>{compiled=null;throw e;});
  const module=await compiled,output=new File([]);
  const wasi=new WASI(['flite','-voice','slt','-t',text,'-o','speech.wav'],[],[new OpenFile(new File([])),ConsoleStdout.lineBuffered(()=>{}),ConsoleStdout.lineBuffered(()=>{}),new PreopenDirectory('.',[['speech.wav',output]])]);
  const instance=await WebAssembly.instantiate(module,{wasi_snapshot_preview1:wasi.wasiImport});
  if(wasi.start(instance)!==0 || output.data.length<=44)throw Error('Empty sentence waveform');
  return output.data.slice().buffer;
};
