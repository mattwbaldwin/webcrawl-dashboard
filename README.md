# Webcrawl Dashboard

Next.js dashboard for Webcrawl - geocaching for the internet.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_EXTENSION_ID=your-extension-id  # optional, for extension sync
```

### 3. Configure Supabase Auth

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Add your site URL to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local dev)
   - `https://your-domain.com/auth/callback` (for production)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Dashboard**: View stats, browse caches and trails
- **Trail View**: Step-by-step trail progress with locked/unlocked states
- **Cache Detail**: View clue, log finds, see message after finding
- **Google Auth**: Sign in with Google via Supabase
- **Extension Sync**: Sends auth to browser extension (if installed)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard - stats, trails, recent caches |
| `/trail/[id]` | Trail detail with cache list |
| `/cache/[id]` | Cache detail with clue and find logging |
| `/auth/callback` | OAuth callback handler |

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + Database)
- **Tailwind CSS** (Styling)
- **TypeScript**

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Or connect your GitHub repo to Vercel for automatic deploys.

Don't forget to:
1. Add environment variables in Vercel
2. Add your production URL to Supabase redirect URLs
3. Update Google OAuth authorized domains
