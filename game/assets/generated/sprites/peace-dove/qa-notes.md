# Peace dove sprite QA

- Base lock: pass. The canonical image is complete true pixel art with a single readable right-facing dove, a consistently attached crimson balloon, hard edges, and a flat keyable background.
- `fly`: pass. Four distinct poses form a readable upstroke/downstroke cycle; the first and fourth frames return cleanly toward one another, identity and balloon placement remain stable, and no anatomy break or detached artifact is visible.
- Extraction: pass (`components`, 4/4 frames, no edge pixels, no chroma-adjacent pixels).
- Atlas: pass (`degraded_static_fallback: false`, absolute `frame_layout`, 97/100 automated score).
- Runtime source: `sprite-sheet-alpha.png` plus `manifest.json`; pre-curation `frames/` are not consumed by the game.
