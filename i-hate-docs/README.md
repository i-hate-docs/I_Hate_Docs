# I Hate Docs

The AI Document OS — Edit, chat with, summarize, redesign, and translate PDFs powered by AI.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI**: OpenAI-compatible API (via Supabase Edge Functions)
- **PDF**: pdf.js (rendering), pdf-lib (annotation export)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An OpenAI API key (or compatible provider)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase project URL and anon key
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Start dev server
npm run dev
```

### Supabase Setup

1. Run the migration SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor
2. Deploy the Edge Functions:
   ```bash
   supabase functions deploy ai-chat
   supabase functions deploy ai-summarize
   supabase functions deploy ai-translate
   ```
3. Set Edge Function secrets in Supabase Dashboard:
   ```
   OPENAI_API_KEY=sk-...
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   ```

### Project Structure

```
src/
  components/
    ai/         AIPanel, chat components
    layout/     AppShell, Sidebar, Topbar
    pdf/        PDFViewer
    ui/         Toast, CommandPalette
  hooks/        useAuth, useDocuments, useAI
  lib/          supabase client, constants
  pages/        Landing, Auth, Dashboard, Workspace, Documents, Agents, ...
  stores/       Zustand app store
  styles/       Global CSS with Tailwind + design tokens
  types/        TypeScript interfaces
supabase/
  functions/    Edge Functions (ai-chat, ai-summarize, ai-translate)
  migrations/   Database schema + RLS policies
```

## Features

- PDF upload and viewing (pdf.js)
- AI chat with documents (OpenAI via Supabase Edge Functions)
- Document library with search, filters, star/unstar
- AI Agents interface
- Presentation generator
- AI Redesign before/after
- Research Mode (equations, LaTeX, citations)
- Multi-document split view
- User authentication (Supabase Auth)
- Row Level Security (RLS) on all data
- Premium dark glassmorphism UI
