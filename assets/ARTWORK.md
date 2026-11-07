# Artwork provenance and prompt set

All seven PNG illustrations were created for this prototype with the built-in image generation tool (not the API/CLI fallback). The three environments are standalone images. Gabriel's four portrait sprites use real alpha transparency and are independently replaceable. Expression variants were generated as edits of the original smiling sprite to preserve identity, clothes, pose, and framing. No scraped character art or external audio is included.

Saved files:

- `backgrounds/campus.png`
- `backgrounds/garden.png`
- `backgrounds/beach.png`
- `characters/gabriel-smiling.png`
- `characters/gabriel-happy.png`
- `characters/gabriel-embarrassed.png`
- `characters/gabriel-serious.png`

## Campus — illustration-story

Create a beautiful 16:9 wide anime visual novel background illustration, no people, no lettering, no UI. Romantic Japanese university campus in late afternoon, elegant cream stone academic building with tall arched windows on the right, lush pink cherry blossom trees framing the left and top, paved walkway curving through courtyard, peach sunlight glowing through petals, distant blue mountains. Detailed painterly anime film background, rich indigo shadows, soft rose and warm ivory palette, cinematic atmospheric depth. Entire landscape fills image edge to edge. Lower quarter is softly shaded open path. Exquisite finished environment artwork.

## Garden — illustration-story

Create a 16:9 wide anime visual novel background illustration, no people, no text, no UI. A beautiful secluded university garden at golden hour. Winding flagstone path, old wooden bench beneath flowering pink cherry trees, lush flowering shrubs, tiny white flowers, ivy pergola on the right, golden sunlight streaming between leaves. Intimate romantic atmosphere, cinematic painterly anime film background with exquisite detail, rose peach lavender colors and deep blue-green shadows. Edge to edge full landscape, comfortable open space in center for a character sprite.

## Beach — illustration-story

Create a 16:9 wide anime visual novel background illustration, no people, no text, no UI. Dreamlike quiet beach at night, luminous large full moon in upper left, a long trail of silver light on the calm ocean, violet and midnight blue sky scattered with tiny stars and delicate clouds tinged pink, waves lapping at lavender sand, distant headland on right, lush grass in foreground corners. Romantic cinematic painterly anime film background with exquisite detail and atmospheric soft light. Edge to edge full landscape.

## Gabriel smiling — illustration-story

Create a single polished anime dating sim character sprite, transparent background, no scenery, no lettering. One attractive adult male university student aged 22 named Gabriel, shown from top of head to mid thigh, facing viewer, slightly turned shoulders. Tousled deep chestnut brown hair with soft fringe, warm amber brown eyes, gentle smiling expression, slightly playful, light warm skin. Cream open-collar shirt with rolled sleeves, loose navy cardigan with fine pale trim, dark tailored trousers, one hand casually tucked in pocket, other relaxed. Elegant shoujo anime illustration, refined expressive face, beautiful clean line art and softly painted warm shading. Character centered fully within canvas with small margins, no cast shadow or background.

## Expression edits — identity-preserve

Reference/edit target for each: `characters/gabriel-smiling.png`. Transparent background enabled.

Each edit used this prompt, replacing EXPRESSION with the exact text below:

> Use case: identity-preserve. Edit the provided anime character sprite. Change ONLY Gabriel's facial expression to EXPRESSION. Keep exactly the same character identity, hair, clothes, pose, size, framing, body, illustration style, color and lighting. Preserve a truly transparent background, no backdrop or added scenery, no text. One single character sprite from head to mid thigh.

- **happy**: happy, with a bright warm closed-eye laugh, joyful smile
- **embarrassed**: embarrassed, with a soft shy smile, pink blush on both cheeks, eyes looking slightly away
- **serious**: serious and tender, mouth closed and a thoughtful gentle gaze, subtly vulnerable

The original tool outputs are retained outside the project; the complete selected assets are copied into these project directories. The app references only project-local assets.
