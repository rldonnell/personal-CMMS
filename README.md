# Four Winds Home CMMS

A free, lightweight home maintenance tracker — a promotional tool for [Four Winds CMMS](https://fourwindscmms.com).

## What It Does

Tracks routine maintenance for three home systems:
- **HVAC** — filter changes, tune-ups, ductwork, CO detectors
- **Water Heater** — T&P valve tests, sediment flushes, anode rods
- **Pool** — water chemistry, filter cleaning, shock schedules

Ships with pre-loaded maintenance schedules based on industry standards. Users can add custom tasks too.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | Neon Postgres (free tier) |
| Auth | JWT (jose) via httpOnly cookies |
| Styling | Tailwind CSS |
| Hosting | Vercel |

## Setup

### 1. Clone and install
```bash
git clone https://github.com/rldonnell/fourwinds-home-cmms.git
cd fourwinds-home-cmms
npm install
```

### 2. Set up Neon Postgres
1. Go to [neon.tech](https://neon.tech) or create via Vercel Storage
2. Create a new project/database
3. Copy the connection string

### 3. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local with your Neon connection string and a JWT secret
```

### 4. Create tables and seed data
```bash
node lib/db-setup.mjs
node lib/db-seed.mjs
```

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy to Vercel
```bash
vercel
# Or push to GitHub and connect via Vercel dashboard
```

Make sure to add the same env vars (DATABASE_URL, JWT_SECRET) in Vercel → Settings → Environment Variables.

## How It Works

1. User signs up with name, email, and optional company
2. Account is created instantly — no email verification needed
3. Default equipment and maintenance tasks are auto-created for all 3 categories
4. User sees a dashboard with overdue/upcoming tasks
5. Clicking a category shows all tasks with filters (overdue, due soon, upcoming)
6. Marking a task "Done" logs the completion and schedules the next occurrence
7. Users can add custom maintenance tasks per category
8. Subtle CTAs throughout point to the full Four Winds CMMS product

## Lead Capture

Every signup captures:
- First name, last name
- Email address
- Company (optional)

This data lives in the `users` table in Neon Postgres. You can query it directly or build an admin page / export to your CRM.

## File Structure

```
fourwinds-home-cmms/
├── app/
│   ├── api/
│   │   ├── auth/         # signup, login, logout, me
│   │   ├── dashboard/    # summary stats endpoint
│   │   └── tasks/        # CRUD + complete
│   ├── dashboard/
│   │   ├── [category]/   # HVAC, Water Heater, Pool views
│   │   ├── layout.js     # Sidebar + auth check
│   │   └── page.js       # Main dashboard
│   ├── globals.css
│   ├── layout.js
│   └── page.js           # Landing page + signup form
├── lib/
│   ├── auth.js           # JWT helpers
│   ├── db.js             # Neon connection
│   ├── db-setup.mjs      # Create tables
│   ├── db-seed.mjs       # Seed categories + templates
│   └── seed-data.js      # Template definitions
├── middleware.js          # Protects /dashboard routes
├── vercel.json
└── package.json
```
