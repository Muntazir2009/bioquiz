---
Task ID: 1
Agent: Main Agent
Task: Build Next.js admin panel for BioQuiz chat widget with Firebase RTDB

Work Log:
- Explored existing project structure (Next.js 16, TypeScript, Tailwind v4, shadcn/ui)
- Installed firebase@12.14.0 package
- Created src/lib/defaults.ts — WidgetConfig TypeScript type with 20+ config fields and DEFAULT_CONFIG object
- Created src/lib/firebase.ts — Firebase Realtime Database init, getConfig, setConfig, onConfigChange with graceful fallback when Firebase is not configured (empty config = local-only mode)
- Created src/lib/useWidgetConfig.ts — React hook with debounced 300ms Firebase writes, syncStatus state (synced/syncing/offline)
- Created src/components/admin/BackgroundBeams.tsx — Canvas-based animated beam effect (Aceternity-style)
- Created src/components/admin/SpotlightCard.tsx — Mouse-tracking radial gradient spotlight on cards
- Created src/components/admin/MovingBorder.tsx — Rotating conic-gradient border animation for active sidebar items
- Created src/components/admin/ShimmerButton.tsx — Hover shimmer sweep effect button
- Created src/components/admin/Sidebar.tsx — Dark glass sidebar with MovingBorder on active tab, 6 tabs
- Created src/components/admin/SyncBadge.tsx — Animated pulsing dot showing sync status
- Created src/components/admin/ConfigPanel.tsx — All 6 config tabs (Appearance, Behavior, Welcome, Quick Replies, AI Persona, Access Control)
- Created src/components/admin/LivePreview.tsx — iframe-based widget preview with postMessage
- Updated src/app/layout.tsx — Simplified for admin panel (Geist font, Sonner toaster)
- Updated src/app/page.tsx — Full admin panel layout with sidebar + tabbed config + live preview
- Fixed Firebase crash when config is empty (graceful local-only fallback)
- Fixed React lint error (ref update during render → moved to useEffect)
- Added allowedDevOrigins for preview domain
- Lint passes clean, dev server starts and serves pages correctly
- Verified with agent-browser: page renders with all 6 tabs, interactive elements, config fields

Stage Summary:
- Complete admin panel built at / route
- 6 config tabs: Appearance, Behavior, Welcome, Quick Replies, AI Persona, Access Control
- Dark glassmorphism aesthetic (#060608 bg, rgba(255,255,255,0.04) cards, #2EB9DF accent)
- Firebase RTDB integration with graceful offline fallback
- Debounced real-time sync (300ms write debounce)
- Aceternity UI effects: BackgroundBeams, SpotlightCard, MovingBorder, ShimmerButton
- Framer Motion page transitions
- All shadcn/ui components used (Input, Label, Switch, Slider, Textarea, Select, Separator)
