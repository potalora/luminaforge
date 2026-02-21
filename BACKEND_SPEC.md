# LuminaForge — Backend Technical Specification

## 1. Architecture Philosophy

**The backend is intentionally minimal.** The core product — parametric geometry generation and 3D preview — runs entirely client-side. The backend exists only for features that inherently require server persistence or processing.

### What Runs Client-Side (No Backend Needed)
- All geometry generation (JSCAD in Web Worker)
- 3D preview rendering (Three.js)
- STL/3MF/OBJ export (serialization in worker)
- Basic sharing (URL hash parameter encoding)
- Preset loading (static JSON bundled with frontend)

### What Requires a Backend
- Persistent share links (short URLs with stored parameter snapshots)
- User accounts & saved designs (Phase 4+)
- Analytics event collection
- Community gallery / user submissions (Phase 5+)
- Rate limiting on share link creation

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | **Vercel Serverless Functions** (Edge) | Zero-config with Next.js, global edge deployment |
| Database | **Vercel KV** (Redis) or **Turso** (SQLite at edge) | Minimal data, fast reads, serverless-native |
| Auth | **NextAuth.js** v5 | When user accounts are added (Phase 4+) |
| Analytics | **Vercel Analytics** + **PostHog** (self-hostable) | Privacy-friendly, event tracking |
| CDN/Hosting | **Vercel** | Automatic with Next.js deployment |
| Monitoring | **Vercel Logs** + **Sentry** | Error tracking, performance monitoring |

### Why Not a Traditional Backend?
- No heavy computation server-side (geometry is client-side)
- No file storage needed (exports happen client-side)
- No real-time features (no WebSockets needed)
- Traffic is bursty (serverless scales automatically)
- Cost optimization: Pay per request, not per server hour

---

## 3. API Routes

### 3.1 Share Links

```
POST /api/share
GET  /api/share/[id]
```

**Create Share Link**
```typescript
// POST /api/share
// Body: { params: DesignParams, thumbnail?: string (base64) }
// Response: { id: string, url: string }

// Route: src/app/api/share/route.ts

import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  const { params, thumbnail } = await request.json();
  
  // Validate params schema
  const validated = validateDesignParams(params);
  if (!validated.success) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  
  const id = nanoid(8); // Short, URL-friendly ID
  
  await kv.set(`share:${id}`, {
    params: validated.data,
    thumbnail,
    createdAt: Date.now(),
  }, { ex: 60 * 60 * 24 * 365 }); // 1 year TTL
  
  return Response.json({
    id,
    url: `https://luminaforge.app/s/${id}`,
  });
}
```

**Resolve Share Link**
```typescript
// GET /api/share/[id]
// Response: { params: DesignParams, thumbnail?: string }

// Route: src/app/api/share/[id]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await kv.get(`share:${params.id}`);
  
  if (!data) {
    return Response.json({ error: 'Design not found' }, { status: 404 });
  }
  
  return Response.json(data);
}
```

**Share Link Page (SSR)**
```typescript
// src/app/s/[id]/page.tsx — Server component that loads share data,
// renders OG meta tags for social preview, then redirects to editor
// with params loaded.

export async function generateMetadata({ params }) {
  const data = await fetch(`/api/share/${params.id}`).then(r => r.json());
  return {
    title: `LuminaForge — Shared ${data.params.type}`,
    description: `A custom ${data.params.type} design`,
    openGraph: {
      images: data.thumbnail ? [{ url: data.thumbnail }] : [],
    },
  };
}
```

---

### 3.2 Analytics Events

```
POST /api/analytics
```

```typescript
// Lightweight event tracking — no PII
interface AnalyticsEvent {
  event: 
    | 'page_view'
    | 'editor_open'
    | 'preset_loaded'
    | 'param_changed'
    | 'export_stl'
    | 'export_3mf'
    | 'share_created'
    | 'share_viewed';
  properties?: Record<string, string | number>;
  timestamp: number;
}

// Events are batched client-side and sent every 30s or on page unload
// via navigator.sendBeacon for reliability
```

---

### 3.3 User Accounts & Saved Designs (Phase 4+)

```
GET    /api/designs           — List user's saved designs
POST   /api/designs           — Save a new design
GET    /api/designs/[id]      — Get a specific design
PUT    /api/designs/[id]      — Update a design
DELETE /api/designs/[id]      — Delete a design
```

#### Database Schema (Turso/SQLite)

```sql
-- Users (managed by NextAuth)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',   -- 'free' | 'premium'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved Designs
CREATE TABLE designs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  object_type TEXT NOT NULL,  -- 'vase' | 'lamp'
  params JSON NOT NULL,       -- Full DesignParams serialized
  thumbnail TEXT,             -- Base64 or URL to stored image
  is_public BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Share Links (alternative to KV for persistence)
CREATE TABLE share_links (
  id TEXT PRIMARY KEY,        -- nanoid
  params JSON NOT NULL,
  thumbnail TEXT,
  view_count INTEGER DEFAULT 0,
  created_by TEXT REFERENCES users(id),  -- nullable for anonymous shares
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Community Gallery (Phase 5+)
CREATE TABLE gallery_submissions (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL REFERENCES designs(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT,                  -- comma-separated
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Authentication (Phase 4+)

### NextAuth.js Configuration

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { TursoAdapter } from '@auth/turso-adapter';

export const { handlers, auth } = NextAuth({
  adapter: TursoAdapter(tursoClient),
  providers: [
    GitHub({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET }),
    Google({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id;
      session.user.plan = user.plan;
      return session;
    },
  },
});
```

### Auth Strategy
- **No auth required** for core functionality (generate, preview, export, share)
- **Auth required** for: saving designs, community gallery submission
- **Social login only** (GitHub + Google) — no password management
- **Free tier**: 5 saved designs
- **Premium tier**: Unlimited saves + advanced features

---

## 5. Infrastructure & Deployment

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],  // US East primary, edge functions global
  "env": {
    "KV_REST_API_URL": "@kv-url",
    "KV_REST_API_TOKEN": "@kv-token",
    "TURSO_DATABASE_URL": "@turso-url",
    "TURSO_AUTH_TOKEN": "@turso-token"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/s/:id",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=3600, stale-while-revalidate=86400" }
      ]
    }
  ]
}
```

### Environment Variables

```bash
# .env.local

# Vercel KV (share links)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Turso (user data — Phase 4+)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Auth (Phase 4+)
NEXTAUTH_URL=https://luminaforge.app
NEXTAUTH_SECRET=
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
POSTHOG_HOST=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## 6. Rate Limiting & Security

### Rate Limits

| Endpoint | Limit | Window | Strategy |
|----------|-------|--------|----------|
| POST /api/share | 30 | 1 hour | IP-based via Vercel KV |
| GET /api/share/[id] | 300 | 1 hour | IP-based |
| POST /api/analytics | 100 | 1 minute | IP-based |
| POST /api/designs | 50 | 1 hour | User-based (authed) |

### Security Measures
- **Input validation**: Zod schemas for all API inputs, parameter ranges enforced
- **CORS**: Restrict to `luminaforge.app` origin
- **CSP headers**: Strict Content Security Policy
- **No user-uploaded files**: All geometry is generated, no file upload attack surface
- **Share link IDs**: nanoid (cryptographically random), no sequential enumeration
- **Thumbnail storage**: Base64 in DB with size limit (50KB max), validated as PNG/JPEG

---

## 7. Cost Estimation

### Vercel (Pro Plan — $20/month)

| Resource | Free Tier | Estimated Usage | Monthly Cost |
|----------|-----------|-----------------|-------------|
| Serverless invocations | 1M | ~100K | $0 |
| Edge function invocations | 10M | ~500K | $0 |
| Bandwidth | 1TB | ~50GB | $0 |
| Vercel KV operations | 150K | ~50K | $0 |
| KV storage | 256MB | ~10MB | $0 |

**Total estimated cost at launch: $20/month** (just the Vercel Pro plan for custom domain + analytics).

### At Scale (10K+ daily users)

| Resource | Estimated | Monthly Cost |
|----------|-----------|-------------|
| Vercel Pro | — | $20 |
| Turso (Phase 4+) | 10GB | $0 (free tier) |
| PostHog Cloud | 1M events | $0 (free tier) |
| Sentry | 5K errors | $0 (free tier) |
| Domain | — | ~$1 |
| **Total** | | **~$21/month** |

The client-side architecture keeps server costs near zero regardless of scale. The primary cost driver would be Vercel bandwidth if 3D thumbnails are stored server-side.

---

## 8. Monitoring & Observability

### Metrics to Track
- API response times (P50, P95, P99)
- Share link creation rate
- Export counts by format
- Error rates by endpoint
- KV storage utilization

### Alerting
- API error rate > 5%
- Response time P95 > 1000ms
- KV storage > 80% capacity
- Failed share link resolutions > 10/hour (potential abuse)

### Logging
- Structured JSON logs via Vercel
- No PII in logs (no IP addresses, no email addresses)
- Request IDs for tracing
