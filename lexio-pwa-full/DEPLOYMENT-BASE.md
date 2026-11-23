# Deployment source base

This branch carries a targeted Lexio overlay, not a wholesale copy of the pronunciation branch. The existing PWA source and 17,569 legacy voice MP3s are materialized at deploy time from GitHub commit `41e3e170c1d7be74ea9712548c33abe6bf4f73a5`; this branch overlays the audited application files and 480 new/approved MP3s. The GitHub Pages artifact is therefore complete while this branch avoids duplicating the 315 MB legacy voice corpus.

The pin is intentional and must be changed only with a reviewed source update. From a clean checkout, `lexio-pwa-full/media/voice/` contains the newly integrated assets; `npm test` and Pages deployment use the pinned base plus this overlay.
