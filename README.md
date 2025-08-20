# Spectra Terminal (Dot‑Matrix LLM Bot)

Green‑on‑black **terminal UI** with a **dot‑matrix portrait**, typewriter output, and **Dragon Quest‑style SFX** (no TTS).
- AI replies = green
- User = blue
- Pure black background
- Pixel/dot‑matrix aesthetic
- WebAudio beeps per character, short victory jingle on finish
- Mouth opens/closes *on each beep* so it looks like it's speaking

https://github.com/ (create a repo and push the folder below)

## Run locally

```bash
npm i
npm run dev
```

Then open the printed local URL.

## How it works

- `src/App.jsx` is the whole UI + SFX logic.
- Replace `generateReply()` with your real LLM API call.
- The portrait mouth is driven by `pulseMouth()` that is called on each beep/jingle note.

## Deploy (GitHub Pages, optional)

```bash
# build
npm run build

# serve the dist/ folder using any static host
# e.g. GitHub Pages: copy the 'dist' contents into a 'gh-pages' branch or use an action.
```

MIT License.
