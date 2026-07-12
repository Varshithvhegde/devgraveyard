*This is a submission for [Weekend Challenge: Passion Edition](https://dev.to/challenges/weekend-2026-07-09)*

## What I Built

Every developer has a graveyard of side projects — started with fire, abandoned quietly on a Tuesday. They deserved better than an empty GitHub repo gathering digital dust.

**DevGraveyard** is a gothic memorial platform where developers give their abandoned passion projects a proper burial. Connect your GitHub, pick a dead repo, carve its epitaph — and watch Gemini AI write a dramatic breakup letter from you to the project.

<!-- 📸 UPLOAD: 01_landing_howItWorks.jpg here -->

Here's what it does:

- ⚰️ **Bury a project** — 3-step burial wizard: pick a repo → choose cause of death (*"Never Made it Past Localhost"*, *"Ran Out of Weekend"*, *"It Was Complicated"*...) → write an epitaph
- 🪦 **Real tombstone data** — pulls your actual commit history: peak obsession streak, most commits in a single day, last commit message (*your final words*)
- 🤖 **AI Eulogy** — Google Gemini writes a dramatic breakup letter from you to the project, referencing your real commit data
- 🕯️ **Community mourning** — light candles, leave RIP messages, vote to resurrect projects
- 🌐 **3D Graveyard** — a full Three.js interactive cemetery: bare trees, fireflies, flickering candles, soul wisps, resurrection pulse rings. Click any tombstone to interact

My own `ARweave` repo had 56 commits, a 2-day peak streak, 30 commits on its best day. Cause of death: *"Never Made it Past Localhost."* Last words: *"feat: overlay plane in 3D builder — drag/scale image on marker, position saved to DB and restored in AR viewer."*

It worked until it worked.

---

## Demo

🔗 **Live → [devgraveyard.varshithvhegde.in](https://devgraveyard.varshithvhegde.in/)**

{% embed https://youtu.be/tuC1dbbjSGw %}

---

## Code

{% github Varshithvhegde/devgraveyard %}

---

## How I Built It

### The Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Auth + Database | Supabase (GitHub OAuth, Postgres, Row Level Security) |
| AI | Google Gemini `gemini-2.5-flash` |
| 3D | Three.js + React Three Fiber + @react-three/drei |
| Animations | Motion (Framer Motion successor) |
| Deployment | Vercel |

---

### Step 1 — Burying a Project

When you click **"Bury a Project"**, a 3-step wizard walks you through:

1. **Choose Victim** — your GitHub repos load via the API. Already-buried repos show an *"already buried"* badge and are disabled so you can't bury the same project twice.
2. **Write the Epitaph** — pick a cause of death from a curated list or write your own. Add an optional epitaph (100 chars max). In the background we fetch your full commit history.
3. **Confirm Burial** — a live tombstone preview renders with your real data before you commit.

<!-- 📸 UPLOAD: 05_bury_cause_of_death.jpg here -->

<!-- 📸 UPLOAD: 07_bury_confirm_preview.jpg here -->

---

### Step 2 — Commit History as Emotional Data

This is the technical heart of the project. When you bury a repo, we paginate through the entire commit history via the GitHub API and compute what I call **"obsession data"**:

```typescript
// From src/lib/github/analyze.ts
export function computePeakObsession(commits: GitHubCommit[]) {
  // commits per day → longest consecutive streak
  // latest commit between midnight–5am → "latest night session"
  // max commits in a single day → "best day"
  // ...
}
```

These numbers feed directly into the tombstone — and into the Gemini prompt. A project that died after 30 commits on its best day tells a different story than one with 3 total commits.

---

### Step 3 — The AI Eulogy

The eulogy prompt is carefully engineered to produce something specific, not generic:

```
Write exactly 3 paragraphs. Format as a letter FROM the developer
TO the project. Tone: dramatic, darkly funny, genuinely melancholic.
Opening: "Dear {repo_name},"
Reference at least 2 of these real data points:
  - Peak obsession: 30 commits in a single day
  - Latest night session: 2:34 AM  
  - Cause of death: "Never Made it Past Localhost"
  - Last commit message: "feat: overlay plane in 3D builder..."
Close with: "Yours, but not anymore, — A Tired Developer"
Max 250 words. No markdown.
```

The results are genuinely surprising. Gemini knows you committed at 2 AM. It writes about that specific obsession. Here's what it produced for my `ARweave` project:

<!-- 📸 UPLOAD: 12_eulogy_complete.jpg here -->

> *"I remember the fervor, the peak obsession when I clocked 30 commits in a single day, mapping out every PLpgSQL schema and every front-end interaction. We built features that felt so robust within the confines of our little local development environment. You were a vibrant, if demanding, companion, demanding all my CPU cycles and mental bandwidth..."*

The eulogy reveals with a typewriter animation when first generated, then persists in Supabase forever.

---

### Step 4 — The 3D Graveyard

The 3D view at `/graveyard-3d` is a full Three.js scene built with React Three Fiber.

**The tombstone shape** is a single `ExtrudeGeometry` from a `THREE.Shape` — a rectangle with `absarc` for the semicircular arch. Much cleaner than a box + half-cylinder:

```typescript
function makeTombShape() {
  const w = 0.34, h = 0.95;
  const shape = new THREE.Shape();
  shape.moveTo(-w, 0);
  shape.lineTo(-w, h);
  shape.absarc(0, h, w, Math.PI, 0, false); // perfect semicircle
  shape.lineTo(w, 0);
  return shape;
}
```

**Animations in the scene:**
- Tombstones **rise from underground** on load, staggered by index (ease-out cubic)
- `FlickerCandle` — cone flame with per-frame scale noise + matching `PointLight` intensity flicker
- `SoulWisps` — glowing orbs float upward from tombstones with candles lit
- `ResurrectPulse` — an expanding `ringGeometry` on the ground below voted tombstones
- 55 firefly particles with sine-wave drift
- Fog, stars, bare winter trees, directional moonlight

**You can light candles and vote to resurrect directly from the 3D panel** — it calls the real API and the stone reacts in real time.

<!-- 📸 UPLOAD: 17_3d_info_panel.jpg here -->

---

### The Public Graveyard Wall

Every buried project joins the public memorial wall at `/graveyard`, sortable by newest, most mourned, or most resurrection votes.

<!-- 📸 UPLOAD: 18_graveyard_list.jpg here -->

---

### Design Philosophy

The entire aesthetic is built around one idea: **this should feel like a real memorial, not a joke**. Developers genuinely grieve abandoned projects. The tombstones use engraved text, chiseled dividers, moss at the base. The AI eulogy takes commit data seriously. The community features are real interactions — your candle is stored in a database, your RIP message has an author and a timestamp.

The passion isn't just the theme. It's the subject matter.

---

## Prize Categories

**🏆 Best Use of Google AI**

DevGraveyard uses **Google Gemini** (`gemini-2.5-flash`) as the emotional core of the product. The eulogy generation prompt is engineered to reference specific real data points from the user's commit history — producing output that feels genuinely personal rather than generic AI text.

The key insight: the AI isn't just generating *content*, it's transforming raw GitHub telemetry (commit counts, timestamps, last message) into something that makes you *feel* the loss of a project you actually cared about.

The eulogy is generated once per tombstone (owner only), stored permanently in Supabase, and revealed with a typewriter animation. It costs one API call and lasts forever — the project's eulogy becomes part of its memorial.

---

*Built in a weekend. My `ARweave` repo will never see production. But now it has a tombstone. That's something.*

⚰️ **[devgraveyard.varshithvhegde.in](https://devgraveyard.varshithvhegde.in/)**
