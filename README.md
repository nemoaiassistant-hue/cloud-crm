# CloudCRM

A self-hosted CRM platform — a custom alternative to GoHighLevel, built for multi-tenant businesses.

Built by [Cloud Hak](https://cloud-hak.com) as our own CRM infrastructure.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Backend:** Next.js API Routes (serverless functions) + Supabase
- **Database:** PostgreSQL via Supabase (Row Level Security)
- **Auth:** Supabase Auth (email/password)
- **Hosting:** Vercel

## Features (Phase 1 — MVP)

- **Contacts** — Full CRUD, tags, search, filter, CSV import/export
- **Pipelines** — Kanban board with drag-and-drop stage management
- **Opportunities** — Track deals across pipeline stages with values
- **Tasks** — Assignment, priorities, due dates, status tracking
- **Conversations** — Unified inbox with message threads
- **Dashboard** — Summary cards, activity feed, pipeline overview
- **REST API v1** — Full CRUD endpoints for all resources
- **Multi-tenant** — Business/location scoping with Row Level Security
- **Auth** — Login, register, user roles (admin/staff/viewer)

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### Setup

1. **Clone the repo:**
```bash
git clone https://github.com/nemoaiassistant-hue/cloud-crm.git
cd cloud-crm
npm install
```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run `supabase/migrations/001_initial_schema.sql`
   - (Optional) Run `supabase/seed.sql` for demo data (Airway Clinic)

3. **Configure environment:**
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase URL and anon key:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run development server:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables (Supabase URL + anon key)
4. Deploy

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/contacts` | List/Create contacts |
| GET/PUT/DELETE | `/api/v1/contacts/[id]` | Get/Update/Delete contact |
| POST | `/api/v1/contacts/[id]/tags` | Add tags to contact |
| GET/POST | `/api/v1/pipelines` | List/Create pipelines |
| GET/PUT/DELETE | `/api/v1/pipelines/[id]` | Get/Update/Delete pipeline |
| GET/POST | `/api/v1/pipelines/[id]/stages` | List/Add stages |
| GET/POST | `/api/v1/opportunities` | List/Create opportunities |
| GET/PUT/DELETE | `/api/v1/opportunities/[id]` | Get/Update/Delete opportunity |
| GET/POST | `/api/v1/tasks` | List/Create tasks |
| GET/PUT/DELETE | `/api/v1/tasks/[id]` | Get/Update/Delete task |
| GET/POST | `/api/v1/conversations` | List/Create conversations |
| GET | `/api/v1/conversations/[id]` | Get conversation |
| GET/POST | `/api/v1/conversations/[id]/messages` | List/Send messages |

## Project Structure

```
cloud-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, Register pages
│   │   ├── (dashboard)/      # CRM pages (Contacts, Pipelines, Tasks, etc.)
│   │   └── api/v1/           # REST API routes
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── pipelines/        # Kanban board components
│   │   ├── conversations/    # Inbox components
│   │   └── sidebar.tsx       # Main navigation
│   ├── lib/
│   │   ├── supabase/         # Server + client clients
│   │   └── validations/      # Zod schemas
│   └── types/                # TypeScript types
├── supabase/
│   ├── migrations/           # SQL schema
│   └── seed.sql              # Demo data
└── package.json
```

## Roadmap

### Phase 2 — Marketing & Automation
- Chatbot widget (embeddable, replaces GHL chatbot)
- Workflows (trigger/action automation)
- Lead capture forms
- Calendar/booking

### Phase 3 — Growth
- Email campaigns with templates
- Custom reporting + analytics
- Stripe billing integration
- Mobile app (PWA)

## License

Proprietary — Cloud Hak
