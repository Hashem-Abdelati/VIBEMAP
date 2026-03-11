# CTP NYC

**Check the Place (CTP) before you go.**

ctp is a real-time social city pulse map for New York City (will expand into new places). Users discover the vibe of places before they go, LIKE coffee shops, libraries, gyms, bars, parks, and more, through fast community "pings" from people who are there right now.

---

## Features

- **Interactive NYC Map** — Mapbox-powered map with category markers, crowd indicators, and trending pulses
- **Live Vibe Pings** — Drop a ping in under 10 seconds: crowd level, noise, study-friendliness, WiFi quality
- **Real-time Feed** — Live feed of recent pings across NYC
- **Trust System** — Community credibility scoring: New Contributor → Trusted Local → Top Spotter
- **Saved Places** — Bookmark spots and get notified when they trend
- **Category Filters** — Coffee, Study, Library, Gym, Bar, Food, Park
- **Trending Layer** — See what spots are hot right now
- **In-app Notifications** — Alerts for saved places trending or getting new pings
- **Anti-spam** — Rate limiting, duplicate detection, trust-weighted pings
- **40+ NYC Places Seeded** — Manhattan, Brooklyn, Queens across all categories

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourname/hotmap-nyc
cd hotmap-nyc
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hotmap_nyc"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ij..."
NEXTAUTH_URL="http://localhost:3000"
```

**Getting a Mapbox token:**
1. Sign up at [account.mapbox.com](https://account.mapbox.com)
2. Create a public access token
3. Paste it as `NEXT_PUBLIC_MAPBOX_TOKEN`

### 3. Set up the database

```bash
# Create PostgreSQL database
createdb hotmap_nyc

# Push schema
npm run db:push

# Seed with NYC places and sample data
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Demo login

After seeding, use these credentials:
- **Email:** `demo@hotmapnyc.com`
- **Password:** `password123`

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # login, signup, logout, /me
│   │   ├── places/        # list, detail, save/unsave
│   │   ├── pings/         # create, list, vote
│   │   ├── users/saved/   # saved places
│   │   ├── notifications/ # read, mark read
│   │   └── search/        # search + filter
│   ├── dashboard/         # Main map page
│   ├── place/[id]/        # Place detail
│   ├── auth/              # login, signup
│   ├── saved/             # Saved places
│   ├── notifications/     # Notifications
│   ├── profile/           # User profile
│   └── page.tsx           # Landing page
├── components/
│   ├── map/               # MapView, FilterBar, PlacePanel
│   ├── places/            # PlaceCard
│   ├── pings/             # PingModal, LiveFeed
│   ├── auth/              # AuthProvider
│   └── layout/            # Navbar
├── lib/
│   ├── prisma.ts          # DB client
│   ├── auth.ts            # JWT, cookies, rate limiting
│   ├── trust.ts           # Trust scoring engine
│   ├── api.ts             # API utilities
│   └── store.ts           # Zustand state
└── types/
    └── index.ts           # TypeScript types + constants
```

---

## Data Model

| Model | Purpose |
|-------|---------|
| `User` | Account with email + username |
| `Profile` | Borough, interests, avatar |
| `TrustScore` | Score, badge, ping count, upvotes |
| `Place` | Name, location, category, vibe aggregates |
| `Ping` | Vibe tags, crowd/noise level, optional note |
| `PingVote` | Helpful/not helpful votes on pings |
| `SavedPlace` | User ↔ Place bookmarks |
| `Notification` | In-app alerts for saved places |

---

## Design System

- **Theme:** Dark urban, NYC energy
- **Primary accent:** Electric orange-amber (`hsl(28, 100%, 55%)`)
- **Live indicator:** Electric cyan (`hsl(186, 100%, 50%)`)
- **Typography:** Syne (display) + DM Sans (body) + DM Mono (data)
- **Pattern:** Glass cards, subtle grid, neon glow effects

---

## Trust Score System

| Action | Effect |
|--------|--------|
| Submit a ping | +0.5 score |
| Receive an upvote | +1.0 score |
| Spam flags | Decreases score |

| Badge | Score Threshold |
|-------|----------------|
| 🌱 New Contributor | 0–29 |
| ⭐ Trusted Local | 30–74 |
| 🏆 Top Spotter | 75+ |

---

## Anti-spam

- Users can't ping the same place within 5 minutes
- Max 10 pings per user per 30 minutes
- Pings are weighted by trust score
- Pings expire after 3 hours

---

## Future Features

- WebSocket real-time updates
- "Best times to visit" ML predictions
- Crowd prediction models
- Neighborhood activity heatmap
- Push notifications (PWA)
- Place photo uploads
- Weekly digest emails
- Leaderboard by neighborhood

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` 14 | App Router, SSR, API routes |
| `prisma` | ORM + migrations |
| `mapbox-gl` + `react-map-gl` | Interactive maps |
| `zustand` | Client state management |
| `bcryptjs` + `jsonwebtoken` | Auth |
| `date-fns` | Timestamp formatting |
| `framer-motion` | Animations |
| `zod` | Input validation |

---

```bash
# Production build test
npm run build
```

---

Built with 🗽 for NYC explorers everywhere.
