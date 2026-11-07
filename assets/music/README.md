# Ambient score

The prototype synthesizes its original four-chord ambient score through `js/audio.js` using the browser Web Audio API. There are no external audio files, downloads, or audio-service requests. Music is optional and begins after player interaction; it pauses while the tab is hidden.

To replace it with a recorded track, place a properly licensed file in this directory and update the isolated `AmbientAudio` implementation, preserving its `setEnabled(boolean)` interface.
