# ⚰️ DevGraveyard

> A memorial for your abandoned side projects. They deserved better than an empty GitHub repo gathering digital dust.

**Live → [devgraveyard.varshithvhegde.in](https://devgraveyard.varshithvhegde.in)**

---

## What is this?

Every developer has a graveyard of passion projects — started with fire, abandoned quietly on a Tuesday. DevGraveyard gives them a proper burial.

- **Bury a project** — connect GitHub, pick a dead repo, choose a cause of death (*"Never Made it Past Localhost"*, *"Ran Out of Weekend"*, *"It Was Complicated"*...), write an epitaph
- **Real tombstone data** — pulls your actual commit history: peak streak, most commits in a day, last commit message as "final words"
- **AI Eulogy** — Google Gemini writes a dramatic breakup letter from you to the project, referencing your real commit data
- **Community mourning** — light candles, leave RIP messages, vote to resurrect projects
- **3D Graveyard** — a full Three.js interactive cemetery at `/graveyard-3d`. Click tombstones, light candles, orbit the scene

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database + Auth | Supabase (GitHub OAuth, Postgres, RLS) |
| AI | Google Gemini `gemini-2.5-flash` |
| 3D | Three.js + React Three Fiber + @react-three/drei |
| Animations | Motion (Framer Motion) |
| UI | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Varshithvhegde/devgraveyard.git
cd devgraveyard
npm install
```

### 2. Set up Supabase

Create a new project at [supabase.com](https://supabase.com), then run the schema:

```bash
# Paste the contents of supabase-schema.sql into your Supabase SQL editor
# Or use the CLI:
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db query --linked -f supabase-schema.sql
```

Enable **GitHub** as an OAuth provider in your Supabase Auth settings.
Set the callback URL to: `https://your-domain.com/auth/callback`

### 3. Get a Gemini API key

Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and create a free API key.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── graveyard/            # Public tombstone wall
│   ├── graveyard-3d/         # Three.js 3D cemetery
│   ├── bury/                 # Burial wizard
│   ├── tombstone/[id]/       # Individual tombstone
│   ├── my-graveyard/         # Your buried projects
│   └── api/                  # API routes
│       ├── tombstones/       # CRUD for tombstones
│       ├── candles/          # Light / snuff candles
│       ├── rip-messages/     # Condolences
│       ├── resurrect/        # Resurrection votes
│       ├── eulogy/           # Gemini AI generation
│       └── github/           # GitHub API proxy
├── components/
│   ├── tombstone/            # TombstoneCard, Grid, Filters
│   ├── burial/               # 3-step burial wizard
│   ├── community/            # Candle, Vote, RIP message
│   ├── eulogy/               # AI eulogy display
│   ├── graveyard3d/          # Three.js scene
│   ├── landing/              # Hero, Stats, HowItWorks
│   └── shared/               # Fireflies, ScrollReveal, etc.
└── lib/
    ├── github/               # API client + commit analysis
    ├── gemini/               # Eulogy prompt + generation
    └── supabase/             # Client, server, admin
```

---

## Database Schema

Five tables — see [`supabase-schema.sql`](./supabase-schema.sql) for the full schema with RLS policies and triggers.

```
users              → GitHub profile (auto-created on OAuth)
tombstones         → buried projects with all commit stats
candles            → one per user per tombstone
rip_messages       → condolence messages
resurrection_votes → one vote per user per tombstone
```

A `tombstone_stats` view aggregates candle/message/vote counts.

---

## How the AI Eulogy Works

When the owner clicks "Generate AI Eulogy", we send Gemini a prompt built from real commit data:

```
Peak obsession: 30 commits in a single day
Latest night session: 2:34 AM
Last commit: "feat: reset endpoint + spec examples support"
Cause of death: "Never Made it Past Localhost"
Total commits: 56

Write a 3-paragraph breakup letter FROM the developer TO the project.
Opening: "Dear {repo_name},"
Closing: "Yours, but not anymore, — A Tired Developer"
```

The eulogy is stored permanently in Supabase after the first generation.

---

## Deployment

Push to GitHub and connect to [Vercel](https://vercel.com). Add all environment variables from `.env.example`. Update the Supabase callback URL to your production domain.

```bash
# Or deploy directly
npx vercel --prod
```

---

## Built For

[DEV Weekend Challenge: Passion Edition](https://dev.to/challenges/weekend-2026-07-09) — July 2026

**Prize category:** Best Use of Google AI

---

Built by [@Varshithvhegde](https://github.com/Varshithvhegde)
