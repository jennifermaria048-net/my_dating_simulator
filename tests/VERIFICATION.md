# Verification record

Validated on 7 November 2026.

## Automated

`node --test tests/story.test.js`: **8 tests passed**.

- All story nodes are reachable and linked to valid targets, chapters, and scenes.
- All **27 choice combinations** terminate at the expected affection-based ending.
- Points match the exact selected options; choices cannot be skipped or counted twice.
- State saves and resumes at every line, unanswered choice, and completed ending.
- Threshold checks: 21 is bittersweet; 22 is romantic.
- Invalid JSON, missing nodes, invalid choices, mismatched scores, blocked writes, and blocked storage access are handled safely.
- Names interpolate correctly; history records each line once.
- A replacement response provider works, with static fallback for empty or failed responses.
- Every declared background and expression exists on disk.

JavaScript syntax checks also passed for the UI, dialogue, and audio modules. Story/state modules are imported and executed by the test suite.

## Browser

Tested through the in-app browser against the local static HTTP server.

- Title screen, player name input, and Start/Continue.
- Complete high-affection playthrough: **30 points, “It was always you.”**
- Complete low-affection playthrough: **6 points, “Beneath the same moon.”**
- Reload at an unanswered choice: Continue restored the choice; advance remained disabled.
- Each selection changed affection and displayed the correct response and expression.
- Chapter and scene labels, campus/garden/beach backgrounds, and scene changes.
- First typewriter click revealed the same line (10 to 116 visible characters); Space then advanced to the next line.
- Story log displayed the recorded lines with speaker labels.
- Manual Save displayed “This moment is saved.”
- Returning to title and Continue restored a completed ending.
- Restart cancellation preserved the ending; confirming and submitting a new name reset affection to zero.
- Music controls, reduced motion, text-speed UI, and fullscreen activation.
- Desktop **1280×720**, phone **390×844**, and compact phone **320×568**.
- Corrected cramped compact-phone choice layout and rechecked it without horizontal overflow.
- Browser console: **no errors** in the final session.

Screenshots are in `docs/gameplay.png`, `docs/title-screen.png`, and `docs/bittersweet-ending.png`. These are verification captures of the actual application.

## Scope

No backend or Gemini integration is present. The automated provider test verifies the future integration boundary only. Browser QA verifies the browser's music toggle and Web Audio initialization; it does not measure audio quality. Font loading has Georgia/Arial fallbacks when offline.
