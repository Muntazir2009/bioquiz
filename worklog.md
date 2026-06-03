---
Task ID: 1
Agent: Main
Task: Fix GIF buffering/lag and declutter GIF section in chat widget

Work Log:
- Analyzed current GIF implementation in /public/chat-widget.js (14K+ lines)
- Identified root causes: messages load full `original` GIF (5-10MB), no `decoding="async"`, CSS masonry layout with column-count causing clutter, no viewport-based GIF freezing
- Changed GIF picker CSS from `column-count:2` masonry to `display:grid; grid-template-columns:repeat(2,1fr); gap:6px` with `aspect-ratio:4/3` for clean uniform grid
- Changed picker thumbnails to use `fixed_width_downsampled` (web-optimized ~200px) instead of `fixed_width`
- Changed message GIFs to use `fixed_width` URL (~200px) instead of `original` (5-10MB) for chat display
- Added `gifUrlFull` field to store original URL for lightbox viewing
- Updated `sendGifGlobal()` and `sendGifDm()` to accept and store `gifUrlFull` parameter
- Added `decoding="async"` to all GIF img tags for non-blocking decode
- Added `bq-gif-loading`/`bq-gif-loaded` CSS classes with blur-to-clear transition
- Updated lightbox to use `data-full` attribute for HD quality on click
- Added IntersectionObserver in v38 patch to freeze offscreen GIFs (replaces src with 1x1 placeholder to free decode memory, restores on scroll back)
- Removed random skeleton heights (now using `aspect-ratio:4/3` for consistency)
- Added `object-fit:cover` to picker item images for uniform cropping
- Bumped WIDGET_VERSION to 50.0.0 and version.json to 50.0.0
- All 9 code verification checks pass via HTTP

Stage Summary:
- GIF picker now uses clean CSS grid with uniform aspect-ratio cards instead of messy masonry
- Messages load ~200px web-optimized GIFs instead of 5-10MB originals (10-20x smaller)
- Lightbox still shows full-quality original GIFs via `data-full` attribute
- Offscreen GIFs are frozen to reduce memory/CPU usage
- All GIFs decode asynchronously and show loading state with blur effect

---
Task ID: 2
Agent: Main
Task: Add physics and design to swipe reply + fix replies-to-replies text

Work Log:
- Analyzed 4 overlapping swipe-to-reply implementations (v19, v20, v21 WA-style, v22 pointer events)
- Identified reply text bug: `fire()` extracted text via `bqbbl.innerText` which included reply preview text (.bqrp), causing replies-to-replies to show the parent reply's text instead of the actual message
- Identified edit-preserve bug: looked for `.bqreply, .bq-replyref` but actual class is `.bqrp` — reply previews were lost during edits
- Disabled v19 `attachSwipe()` and v22 `wireSwipeReply()` — only v21 WA-style swipe is now active
- Replaced v21 WA swipe with physics-enhanced version:
  - Spring physics snap-back (stiffness=320, damping=28) using requestAnimationFrame
  - Velocity tracking with smoothed readings
  - Exponential rubber-band resistance beyond max drag (Math.exp decay)
  - Reply preview popup (`.bq-wa-reply-preview`) showing sender name + message snippet while swiping
  - Glow trail behind swiped bubble (`::before` gradient)
  - Green glow on trigger state
- Fixed all 3 text extraction points (v19 fire(), v21 fire(), doAction reply) to clone bubble and remove .bqrp before extracting text
- Fixed edit-preserve code to look for `.bqrp` instead of legacy `.bqreply, .bq-replyref`
- Added media type descriptions for GIF/Image/Sticker/Voice replies
- Added `data-reply-key` to reply previews for scroll-to-original on click
- Added v39 patch with click-to-scroll-to-original-message functionality
- Reply previews now clickable and highlight the original message
- Bumped version to 51.0.0
- All 16 code verification checks pass, no syntax errors

Stage Summary:
- Swipe-to-reply now has spring physics with velocity-aware snap-back
- Reply preview popup appears while swiping showing sender + snippet
- Glow trail follows the swiped bubble
- Replies-to-replies now show the correct message text (not the parent reply)
- Reply previews are preserved during message edits
- Clicking a reply preview scrolls to and highlights the original message
- Duplicate swipe handlers (v19, v22) disabled to prevent conflicts
