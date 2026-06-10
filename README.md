# SK Freelancing — AI Cold Outreach CRM

A full-stack Next.js collaborative platform for managing web design cold outreach to local NJ businesses.

**Tech stack:** Next.js 14 · TypeScript · Tailwind CSS · Prisma · SQLite/PostgreSQL · Google Gemini

---

## Features

- **AI Business Analysis** — Gemini-powered reports: problems, website features, automations, cold call scripts
- **Lead CRM** — 44 pre-loaded local businesses, scoring 1–99, custom StatusDropdown with animations
- **Kanban Tasks** — Backlog → In Progress → Review → Completed with drag-and-drop style moves
- **Team Chat** — Channels (general, leads, projects, ai-ideas) persisted to database
- **AI Assistant** — Full chat interface with Gemini, quick prompts for sales scripts/emails/proposals
- **Analytics Dashboard** — 6 chart types: pipeline, industry, score distribution, location performance
- **Bulk Import** — CSV/Excel/paste with auto column detection, deduplication, auto-scoring
- **Mobile-first** — Bottom navigation, responsive layout, optimized for cold calling on-the-go

---

## Quick Start (3 steps)

### 1. Install
```bash
npm install
```

### 2. Setup database
```bash
# On Mac/Linux:
npm run db:push
npm run db:seed

# On Windows PowerShell (run separately):
npm run db:push
npm run db:seed
```

### 3. Run
```bash
npm run dev
```

Open http://localhost:3000 → redirects to `/dashboard`

---

## Environment Variables

Copy `.env.example` → `.env` and fill in:

```env
# SQLite for local dev (default)
DATABASE_URL="file:./dev.db"

# Get free key from aistudio.google.com
GEMINI_API_KEY="your-key-here"

# App
NEXT_PUBLIC_APP_NAME="SK Freelancing"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Without `GEMINI_API_KEY`: the app fully works, AI features show a setup prompt.
With it: real Gemini 1.5 Flash analysis per business.

---

## All Routes

| Route | Description |
|---|---|
| `/dashboard` | Overview stats, pipeline, quick actions |
| `/leads` | Full CRM table with custom status dropdowns, filters, sort |
| `/leads/[id]` | Individual lead — AI report with 4 tabs |
| `/tasks` | Kanban board — Backlog/In Progress/Review/Completed |
| `/chat` | Team messaging with channels |
| `/ai` | Claude AI assistant with sales quick prompts |
| `/analytics` | 6 charts — pipeline, industry, score dist, location |
| `/analysis` | Batch AI analysis for all businesses |
| `/calls` | Mobile cold call queue with outcome logging |
| `/bulk-import` | CSV/Excel/paste import with auto-scoring |
| `/settings` | API config, locations, industries, team, roadmap |

---

## Deploy to Vercel

### Option A: Vercel + Neon PostgreSQL (Recommended)

1. Create free DB at [neon.tech](https://neon.tech)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Add env vars in Vercel dashboard:
   - `DATABASE_URL` = your Neon connection string
   - `NEXTAUTH_SECRET` = run `openssl rand -base64 32`
   - `NEXTAUTH_URL` = your Vercel deployment URL
   - `GEMINI_API_KEY` = free key from [aistudio.google.com](https://aistudio.google.com)
4. Deploy:
   ```bash
   npx vercel --prod
   ```
5. Run seed after first deploy:
   ```bash
   npx vercel env pull .env.local
   npx tsx prisma/seed.ts
   ```

### Option B: Vercel + Supabase

Same as Neon — use the Supabase PostgreSQL connection string.

---

## Database Commands

```bash
npm run db:push      # Apply schema changes
npm run db:seed      # Load 44 NJ businesses
npm run db:studio    # Open Prisma Studio (visual DB editor)
npm run db:reset     # Wipe + re-seed (destructive!)
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analytics/     # Analytics data API
│   │   ├── analyze/       # AI business analysis (Gemini)
│   │   ├── businesses/    # CRUD for leads
│   │   ├── bulk-import/   # CSV import with dedup + scoring
│   │   ├── locations/     # Dynamic location management
│   │   ├── messages/      # Team chat messages
│   │   ├── tasks/         # Kanban task CRUD
│   │   └── activities/    # Activity feed
│   ├── dashboard/         # Main overview
│   ├── leads/             # CRM table + detail view
│   ├── tasks/             # Kanban board
│   ├── chat/              # Team messaging
│   ├── ai/                # AI assistant
│   ├── analytics/         # Charts dashboard
│   ├── analysis/          # Batch AI analysis
│   ├── calls/             # Mobile call queue
│   ├── bulk-import/       # Import page
│   └── settings/          # Configuration
├── components/
│   ├── AppShell.tsx        # Sidebar + mobile nav
│   └── ui/
│       └── StatusDropdown.tsx  # Custom animated status picker
├── lib/
│   ├── prisma.ts           # DB client singleton
│   ├── ai.ts               # Anthropic API integration
│   └── scoring.ts          # Lead scoring algorithm (1–99)
└── types/
    └── index.ts            # TypeScript types + status config
prisma/
├── schema.prisma           # Full schema (Users, Businesses, Tasks, Messages...)
└── seed.ts                 # 44 businesses pre-loaded
```

---

## Lead Scoring Algorithm

Score 1–99, higher = better outreach target:

| Signal | Points |
|---|---|
| No website | +35 |
| 500+ reviews | +25 |
| 100–500 reviews | +18 |
| 30–100 reviews | +12 |
| Family owned | +10 |
| Phone number known | +10 |
| Rating 4.9+ | +8 |
| Rating 4.5+ | +5 |
| Large franchise/chain | −20 |

---

## Scaling

**Add a location** → Settings → Locations → type city → Add  
Automatically creates analytics filtering for that area.

**Add an industry** → Settings → Industries → type name → Add  
AI automatically generates industry-specific scripts and feature suggestions.

**Add more leads** → Bulk Import → CSV with any column names  
Auto-detected, deduplicated, scored, and added to tracker.

---

## StatusDropdown Component

Fully custom — zero native browser `<select>`:

```tsx
import StatusDropdown from '@/components/ui/StatusDropdown'

<StatusDropdown
  value={lead.status}
  onChange={(newStatus) => updateLead(lead.id, newStatus)}
  size="sm"  // or "md"
/>
```

Statuses with colors: New Lead, Researched, Contacted, Follow Up Needed, Interested, Demo Sent, Closed, Not Interested

---

## Future Features (scaffolded)

- AI email generator
- SMS automation (Twilio)
- Calendar scheduling (Cal.com)
- Proposal generator → PDF
- Chrome extension for Google Maps scraping
- Stripe payments / invoicing
- Full auth with NextAuth or Supabase Auth
