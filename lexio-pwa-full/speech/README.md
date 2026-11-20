# Offline American sentence voices

The default SLT voice is built into `flite.wasm` from `@echogarden/flite-wasi@0.1.1` (unchanged; see LICENSE-Flite.txt). CLB is loaded only if selected. `clb.flitevox` is the unmodified [CMU US female CLB voice](https://github.com/associationconsonne/FliteVoices/blob/33ee8bae1d057ccc2e206912ca401f9ba3a69808/eng-USA-female%3Bclb.flitevox); its CMU license and original credits are embedded in the file header. These voices are alternatives, not copies of the remote dictionary narrator.

`worker.js` bundles `worker.source.mjs` and `@bjorn3/browser_wasi_shim@0.4.2` (MIT; license included). To rebuild in a temporary npm directory with that dependency and `esbuild@0.28.2`, copy the source into it and run `npx esbuild worker.source.mjs --bundle --format=iife --minify --outfile=worker.js`. The PWA requires no external TTS endpoint or npm install at runtime. Speech is generated locally, one utterance at a time; WAV output is not stored in the repository.
