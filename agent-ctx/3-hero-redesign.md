---
Task ID: 3
Agent: Hero Redesign Agent
Task: Redesign Hero section with Aceternity/Magic UI inspired design

Work Log:
- Read worklog.md for context (Task 1 already had a basic Aceternity-inspired hero)
- Read existing Hero.tsx (~15 DOM nodes, basic spotlight + gradient text)
- Read globals.css (existing hero CSS with spotlight, orbs, gradient text)

CSS Changes (globals.css):
- Added `@property --hero-border-angle` for CSS Houdini moving border animation
- Enhanced `.hero-spotlight`: wider (50% width), taller (100% height), more dramatic gradient with multi-stop, stronger opacity
- Updated spotlight keyframes: wider rotation range (-3deg to 3deg), better opacity cycling
- Enhanced `.hero-gradient-text`: 4-color gradient stops (250→200→160→250 hue), larger background-size (300%), longer animation (8s)
- Dark mode gradient text more vivid: oklch(0.85 0.16 200) peak vs previous oklch(0.85 0.12 200)
- Slightly increased orb sizes (420px/320px) and opacity for more visible atmosphere
- Added `.hero-cta-border`: conic-gradient with rotating `--hero-border-angle` variable, 1.5px padding for border width
- Added `.hero-cta-inner`: inner container with 10.5px border-radius
- Added `@keyframes border-rotate`: animates `--hero-border-angle` from 0 to 360deg
- Added `@supports not` fallback for browsers without conic-gradient: static gradient border + `::before` glow animation
- Added `.hero-pill`: hover transition (transform, border-color, background-color) with subtle lift
- Added `.hero-pill:hover` and `.dark .hero-pill:hover` variants
- Added `.hero-stat-divider`: 3px dot divider for stats row
- Added `.hero-badge-pulse`: keyframe animation with green box-shadow pulse on badge
- Updated reduced motion: disables all new animations (gradient-text, cta-border, badge-pulse, pill transitions)

Hero.tsx Changes:
- Status badge: added `hero-badge-pulse` class for animated green glow
- Primary CTA "Browse modules": wrapped in `hero-cta-border` div for Aceternity moving border effect
- Inner CTA link: uses `hero-cta-inner` class, removed `rounded-lg` (border-radius handled by wrapper)
- Feature pills: added `hero-pill` class for hover effects + `cursor-default`
- Stats row: new section below feature pills with "7 Modules · Real-time sync · File sharing · AI-Powered"
- Stats use `hero-stat-divider` dots between items
- Animation delays: staggered (0ms → 60ms → 130ms → 200ms → 280ms → 360ms)
- Total DOM nodes: ~22 (within the ~20-25 target)

Technical Notes:
- `@property --hero-border-angle` is CSS Houdini - supported in Chrome/Edge/Safari, NOT in Firefox < 128
- Fallback: `@supports not (background: conic-gradient(...))` provides a static gradient border with subtle glow animation
- All animations use GPU-composited properties (transform, opacity) or CSS custom properties
- No JavaScript animation runtime - pure CSS throughout
- Works in both light and dark mode
- prefers-reduced-motion fully supported

Zero lint errors (excluding upload/ directory), dev server compiling successfully.
