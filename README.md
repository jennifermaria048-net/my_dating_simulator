# Under the Moonlight

A complete, illustrated visual novel about Gabriel (Gubbi), your childhood best friend. Three chapters, three meaningful choices, and two affection-based endings. Built with HTML, CSS, vanilla JavaScript, and JSON. No application backend, database, authentication, AI API, or runtime package dependencies.

## Play locally

From this folder, run:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open **http://127.0.0.1:4173** in your browser. `npm start` runs the same static file server. Python only serves the files during development; there is no server-side game logic. Do not open `index.html` with `file://`: browsers restrict module and JSON loading there. Any ordinary static web host can serve this folder as-is.

Click **Start Story**, enter your name, and begin. Click the dialogue panel or press Space/Enter to continue. Click during the typewriter animation to reveal the full line. Choices must be selected before the story can advance. All progress saves automatically in this browser, including unanswered choices and completed endings. The Save button also gives a visible confirmation. Continue restores the exact saved line.

Settings include text speed, reduced motion, and an optional original synthesized ambient score. Music starts only after interaction. There are story-log, fullscreen, return-to-title, and confirmed restart controls. Restart only replaces progress once a new name is submitted. Browser storage restrictions are handled gracefully, with a message when persistent saving is unavailable.

## Structure

```text
index.html                  Accessible application shell and dialogs
css/style.css               Cinematic 16:9 desktop and responsive mobile presentation
js/main.js                  Screen rendering, events, transitions, controls
js/story.js                 Branching story engine and response-provider boundary
js/gameState.js             State, save validation, storage, settings
js/dialogue.js              Interruptible typewriter renderer
js/audio.js                 Original local Web Audio score
data/story.json             Chapters, scenes, dialogue, choices, conditions, endings
assets/backgrounds/         Three independently replaceable illustrations
assets/characters/          Four transparent Gabriel expressions
assets/music/               Audio integration notes
assets/ARTWORK.md            Asset provenance and generation prompts
tests/story.test.js         Story graph, all 27 paths, saves, provider, assets
```

## Story and relationship rules

The opening choices award +10, +5, or +2 affection; the garden and beach choices use the same scale. Total affection ranges from 6 to 30. A score of **22 or higher** leads to the romantic ending; lower scores lead to the bittersweet ending. Each choice has its own Gabriel response. Points are awarded exactly once. A new game resets affection, decisions, and history.

Add content by defining nodes in `data/story.json`, linking `next` or choice-option targets, and adding chapters to `chapters`. Every visible node declares its chapter and scene. Supported node types are `narration`, `dialogue`, `choice`, `response`, `condition`, and `ending`. Add characters and expression URLs to `characters`; rendering uses that registry. Backgrounds and sprites are separate files. Missing expressions fall back to the default sprite, then an intentional silhouette; backgrounds retain a CSS environment fallback.

## Future AI integration

`StoryEngine` accepts a response provider, defaulting to `StaticDialogueProvider`. Only `response` nodes call `getResponse({ node, playerName, relationship, chapter })`. Each has a stable `responseSlot` and a predefined fallback. Narration, player dialogue, choices, affection, conditions, and endings remain deterministic. Return a string (with optional `{playerName}`), or throw/return an empty value to use the static fallback. Provider output is rendered with `textContent`.

A future `GeminiService` can implement that provider interface without changing the renderer. No Gemini integration exists in this prototype. Keep any future secret API key in an appropriately secured service, not in frontend files.

## Validation

With Node.js available (development checks only):

```powershell
npm test
```

Tests cover all 27 combinations, exact scores and the ending threshold, choice locks, duplicate-click protection, save/resume at every line, completed-ending saves, corrupted or inaccessible storage, name handling, response-provider fallbacks, story graph integrity, and asset existence.

Browser QA covered complete romantic (30 points) and bittersweet (6 points) playthroughs; restoring an unanswered choice after reload; reset/cancel; expression changes; settings; and 1280×720, 390×844, and 320×568 layouts. See `tests/VERIFICATION.md` for details.

Illustrations are generated for this project. Typography uses Cormorant Garamond and DM Sans through Google Fonts, with local Georgia/Arial fallbacks if offline. All game illustrations, story data, and music synthesis are local.
