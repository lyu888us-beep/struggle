# Native media sentence playback

`flite.wasm` comes unmodified from `@echogarden/flite-wasi@0.1.1` (LICENSE-Flite.txt). The built-in CMU US SLT voice synthesizes normal-speed English locally. `sw.js` exposes a bounded, in-memory WAV media endpoint; the native player sets the rate to 0.75. Ten exact-text recordings in `media/voice` use the voice auditioned in chat rather than SLT. No voice selector or remote sentence synthesis endpoint is required. Word pronunciation is independent.

`engine.js` bundles `engine.source.mjs` with `@bjorn3/browser_wasi_shim@0.4.2` (MIT; license included). To rebuild, put the source in a temporary npm directory with that dependency and `esbuild@0.28.2`, then run `npx esbuild engine.source.mjs --bundle --format=iife --minify --outfile=engine.js`.
