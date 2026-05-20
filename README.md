# BioQuiz — Cloudflare Pages Deployment

The biology workspace. Seven beautifully crafted modules — quizzes, AI research, a 3D cell viewer, organelles, slides and solutions, all in one calm workspace.

## 🚀 Deploy to Cloudflare Pages via GitHub

### Prerequisites
1. A [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. A [GitHub account](https://github.com/signup)
3. [Node.js 18+](https://nodejs.org/) and npm installed locally

### Step 1: Create Cloudflare Resources

Install Wrangler CLI and login:
```bash
npm install -g wrangler
wrangler login
```

Create D1 database:
```bash
wrangler d1 create bioquiz-db
```
Copy the `database_id` from the output and paste it into `wrangler.toml` (replace `YOUR_D1_DATABASE_ID`).

Create R2 bucket:
```bash
wrangler r2 bucket create bioquiz-uploads
```

### Step 2: Initialize Database

Generate Prisma client:
```bash
npm run db:generate
```

Push schema to D1 (local for testing):
```bash
npm run db:migrate
```

Push schema to D1 (production):
```bash
npm run db:migrate:prod
```

### Step 3: Push to GitHub

1. Create a new repository on GitHub
2. Push this code:
```bash
git init
git add .
git commit -m "Initial commit: BioQuiz v2.0 for Cloudflare Pages"
git remote add origin https://github.com/YOUR_USERNAME/bioquiz.git
git branch -M main
git push -u origin main
```

### Step 4: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **"Create a project"** → **"Connect to Git"**
3. Select your GitHub repository
4. Configure build settings:
   - **Framework preset**: Next.js (Static Export) or None
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
5. Add environment variables (if needed):
   - `ADMIN_PASSWORD` — your admin password (optional, defaults to "0613")
6. Click **"Save and Deploy"**

### Step 5: Bind D1 and R2

After the first deployment, bind your D1 database and R2 bucket:

1. Go to your Pages project → **Settings** → **Bindings**
2. Add **D1 database** binding:
   - Variable name: `DB`
   - D1 database: `bioquiz-db`
3. Add **R2 bucket** binding:
   - Variable name: `BUCKET`
   - R2 bucket: `bioquiz-uploads`
4. Redeploy for bindings to take effect

---

## 🏗️ Architecture

| Component | Cloudflare Service |
|-----------|-------------------|
| Frontend | Pages (Next.js SSR/SSG) |
| Database | D1 (SQLite at the edge) |
| File Storage | R2 (S3-compatible object storage) |
| Real-time | Polling (5s interval, no WS needed) |

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── api/              # API routes (D1 + R2)
│   ├── components/
│   │   ├── site/             # App-specific components
│   │   └── ui/               # shadcn/ui components
│   └── lib/
│       ├── db.ts             # Prisma + D1 adapter
│       ├── file-storage.ts   # R2 storage layer
│       ├── modules.ts        # Module definitions
│       └── session.ts        # Client session utils
├── public/                   # Static HTML modules & assets
├── prisma/
│   └── schema.prisma         # Database schema
├── wrangler.toml             # Cloudflare bindings config
└── next.config.ts            # Next.js config
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run locally with Wrangler (D1 + R2 emulation)
npm run pages:dev

# Or standard Next.js dev (without D1/R2)
npm run dev
```

## ⚠️ Notes

- **Admin password** is hardcoded as `0613` — change it in the API route files before deploying to production
- **WebSocket** is not available on Cloudflare Pages — the FilePanel uses polling instead
- **Static HTML modules** (quiz.html, etc.) are served from `/public` and work as-is
- **Chat widget** loads from `/public/chat-widget_v30.js` — update it if needed
