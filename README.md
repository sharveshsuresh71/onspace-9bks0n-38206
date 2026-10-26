# MYTHOS — The Living Beast Universe

A React, TypeScript, Vite, and Three.js browser sanctuary. The real-time world—not a static render—is the primary interface.

## Implemented

- Real-time procedural dragon preview: body, four limbs, wings, jaw, horns, eyes, and articulated tail. Explicitly labeled as a placeholder, not a production realistic rig.
- Frame-independent creature state controller with idle, attention, patrol/follow, walk, run, takeoff, fly, glide, land, sleep, play, roar, and safe ember demonstration.
- Smooth bounded circular flight, altitude transitions, banking, wingbeats, patrol movement, and direct keyboard translation.
- Orbit, damped follow, and cinematic orbit camera modes.
- Astral Sanctuary, Emberfall Crater, and Moonveil Forest with distinct geometry, lighting, fog, particles, and atmosphere.
- Five procedural material palettes; uploaded production assets retain original materials.
- Companion care, energy costs, sleep recovery, bond growth, and local-device progression persistence.
- Browser voice recognition, typed command parsing, scripted companion dialogue, optional speech synthesis, and synthesized audio cues.
- Self-contained GLB dragon upload pipeline with local-device persistence, grounded normalization, animation clip inspection, automatic matching for every creature state, manual clip bindings, model-facing adjustment, one-shot timing, repeated-command replay, and 300 ms crossfades. Missing animations do not fabricate skeletal motion.
- Custom JPG/PNG/WebP scene backgrounds in fixed-image or 360° equirectangular mode. Panoramas supply scene background and image-based environmental lighting.
- Separate GLB environment uploads that replace built-in terrain while retaining the dragon, cameras, particles, and sanctuary command system. Scene scale is adjustable; presets disable custom assets without deleting them.
- Locally stored roar, breath/attack, wing/flight, and ambient recordings, with browser format validation, previews, master volume, mute, and user-started looping ambience.
- Responsive scene-first HUD, accessible controls, keyboard reference, journal, and scene error boundary.

## Controls

| Input | Action |
| --- | --- |
| Mouse drag / touch drag | Orbit the camera |
| Scroll / pinch | Zoom |
| W / A / S / D | Translate dragon on world axes within sanctuary bounds |
| Shift + W / A / S / D | Faster translation |
| Space | Take off, or land while airborne |
| C | Cycle orbit / follow / cinematic camera |
| F | Follow a sanctuary patrol route |
| R | Return and land |
| Escape | Close the current panel |

Use the companion panel to type or speak commands such as `fly`, `glide`, `follow`, `feed`, `rest`, `wake`, `play`, `roar`, and `show your fire`.

## Production asset pipeline

### Dragon and commands

Open **Companion / Creature atelier** and upload an embedded-texture GLB (100 MB maximum). Models load through GLTFLoader and AnimationMixer. Clips, durations, and track counts are logged; the UI displays available clip names. State mappings use descriptive aliases, with manual dropdown overrides for names such as `Action.001`. Select `No clip` to use transform-only behavior. One-shot clips for takeoff, landing, attention, roar, play, and attack determine their state duration; idle and locomotion clips loop. Repeated commands replay the active action. Crossfades take 300 ms, and fully faded actions are stopped. Prefer in-place locomotion clips; animation root-motion extraction is not implemented.

The loaded dragon is centered, grounded, and normalized to seven world units on its longest axis. The procedural creature faces local -X; use 0/90/180/270-degree model-facing adjustment to align the uploaded asset. Uploaded textures and materials remain unchanged. WASD switches ground animation to walk/run and moves the dragon smoothly rather than continuing its automatic patrol simultaneously.

### Backgrounds and 3D environments

Open the **globe icon or sanctuary name**. Backgrounds support JPG, PNG, or WebP up to 20 MB. Fixed-image mode preserves the cinematic backdrop composition; 360-degree mode expects a 2:1 equirectangular sky and uses it for the Three.js background and environmental lighting. Normal image mode does not allocate a Three.js panorama texture.

Upload a separate self-contained GLB environment (150 MB maximum) to replace generated terrain. Scene geometry is centered, grounded to y=0, and normalized to 30 units on its longest axis. A 0.5–2.0× scene-scale control adjusts its size. The imported scene's embedded objects remain intact, but animation playback for environment clips is not implemented. Custom scene collision is not enabled: creature movement still uses the fixed y=0 floor and ±5-unit X/Z bounds. Presets turn off custom backgrounds and terrain without deleting their files; enable the upload checkboxes to return to them.

### Sound recordings

Open the **speaker icon / Creature sound studio**. GLB generally does not embed playable audio; sound is supplied separately. Upload MP3, WAV, OGG, M4A, AAC, or WebM recordings supported by the browser. Roar, breath/attack, and wing recordings have a 20 MB limit; ambience has a 30 MB limit. Metadata is checked before storing. Recordings play for their mapped commands, with one active cue at a time. Ambience loops only after the user clicks Play. Preview, mute, and volume controls are available. Without a matching recording, commands use synthesized cues, not recorded dragon audio. Browser speech synthesis remains available for scripted dialogue.

### Local persistence and cleanup

Uploaded files are stored in IndexedDB on this device and restored as fresh object URLs after reload. Animation mappings, scene preferences, and master volume use localStorage. If storage is unavailable or full, uploads still work for the session and the UI reports the limitation. Object URLs are revoked on replacement, deletion, and unmount. Superseded asynchronous GLB/texture loads are discarded; animations, geometries, materials, textures, and audio are cleaned up. No uploaded asset is sent to a server. Clearing browser site data removes local saves.

## Scope and remaining work

This is a working frontend sanctuary foundation, not the complete production platform described in the master brief. Dialogue is explicitly scripted, not connected to an AI service. Follow is a predefined patrol, not live player tracking. Realistic skeletal poses require matching animations in the supplied dragon GLB; the app cannot invent missing clips. Uploaded recordings provide creature audio, while synthesized cues remain the fallback. Bond, energy, interaction count, appearance, realm, uploaded assets, clip bindings, and world/audio preferences persist on the same device where storage is available. No backend, account system, cross-device synchronization, rider view, custom terrain collision, obstacle-aware navigation, animation root-motion extraction, or production LOD pipeline is connected.
