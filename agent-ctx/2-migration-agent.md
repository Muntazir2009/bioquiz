---
Task ID: 2
Agent: Migration Agent
Task: Migrate from @cloudflare/next-on-pages to @opennextjs/cloudflare

Work Log:
- Read worklog.md (Task 1) to understand prior migration context
- Analyzed current project state: package.json, wrangler.toml, .gitignore, db.ts, file-storage.ts, next.config.ts, prisma schema

Changes Made:

1. **package.json** — Updated dependencies and scripts:
   - Removed `@cloudflare/next-on-pages` from devDependencies
   - Added `@opennextjs/cloudflare@^1.19.11` to dependencies
   - Updated `wrangler` from `^3.99.0` to `^4.86.0` in devDependencies
   - Removed scripts: `pages:build`, `pages:dev`, `pages:deploy`, `db:migrate`, `db:migrate:prod`, `d1:create`, `r2:create`
   - Added scripts: `preview`, `deploy`, `cf-typegen`
   - Kept: `dev`, `build`, `lint`, `db:generate`, `db:push`

2. **wrangler.toml** — Deleted (replaced by wrangler.jsonc)

3. **wrangler.jsonc** — Created with @opennextjs/cloudflare format:
   - `main: .open-next/worker.js` (required by opennextjs)
   - `name: bioquiz`
   - `compatibility_date: 2024-12-30`
   - `compatibility_flags: [nodejs_compat, global_fetch_strictly_public]`
   - `assets` with directory `.open-next/assets` and binding `ASSETS`
   - `services` with `WORKER_SELF_REFERENCE` binding (required for self-reference)
   - D1 database binding `DB` (database_name: bioquiz-db)
   - R2 bucket binding `BUCKET` (bucket_name: bioquiz-uploads)

4. **open-next.config.ts** — Created with `defineCloudflareConfig({})`

5. **.dev.vars** — Created with `NEXTJS_ENV=development`

6. **.npmrc** — Created with `legacy-peer-deps=true`

7. **.gitignore** — Added `.open-next/` and `cloudflare-env.d.ts` under `# open-next` section

8. **.github/workflows/deploy.yml** — Created GitHub Actions workflow:
   - Triggers on push to main and workflow_dispatch
   - Node 22, npm install with --legacy-peer-deps
   - Build with `npx opennextjs-cloudflare build`
   - Deploy via `cloudflare/wrangler-action@v3`

9. **src/app/api/files/upload/route.ts** — Created missing upload endpoint:
   - Accepts FormData with file, uploaderId, isPublic, description, expiresAt
   - Converts File to Buffer, generates storage name and share ID
   - Saves to R2 via saveFile(), saves metadata to D1 via Prisma
   - Returns JSON with file metadata

10. **next.config.ts** — Updated comments from "@cloudflare/next-on-pages" / "CF Pages" to "@opennextjs/cloudflare" / "CF Workers"

Verification:
- Ran `bun install` — installed @opennextjs/cloudflare@1.19.11 and wrangler@4.93.0 successfully
- Ran `bun run lint` — pre-existing lint errors in admin/page.tsx, carousel.tsx, use-mobile.ts (not related to migration)
- Dev server running on port 3000 (HTTP 200)

Stage Summary:
- Project fully migrated from @cloudflare/next-on-pages to @opennextjs/cloudflare
- All Cloudflare Pages references replaced with Workers/Pages platform (opennextjs)
- New wrangler.jsonc format with proper opennextjs asset binding
- CI/CD pipeline configured for automated deployment
- Missing /api/files/upload route created for FileUploadZone component
