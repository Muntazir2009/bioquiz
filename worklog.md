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
