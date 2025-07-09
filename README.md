# G Album - Dream To Reality

A modern, full-stack web application for G Album, a professional photo album creation and printing service.

## Quick Overview

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Email**: Resend
- **Deployment**: Vercel

## Services Offered

- Photo Album Printing
- Creative Works & Effects
- Album Pad Making
- Album Box Making
- Calendar Making
- Photography and Videography

## Key Features

### Public Website

- Responsive design with animations
- Gallery showcase
- Contact forms
- Newsletter subscription
- SEO optimized

### Admin Dashboard

- Role-based access (Super Admin, Admin, Editor, Visitor)
- Customer management with balance tracking
- Order management with payment tracking
- Album management
- Analytics dashboard
- Newsletter management
- Activity logs
- User management

## Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref your_project_ref

# Push migrations
supabase db push
```

## Project Structure

```
G-Album/
├── app/                    # Next.js pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── ...                # Public pages
├── components/            # React components
├── lib/                   # Utilities & services
├── config/                # Configuration
├── supabase/              # Database migrations
└── public/                # Static assets
```

## Key Files

- `config/about.ts` - Team and company info
- `config/contact.ts` - Contact details
- `lib/types/` - TypeScript definitions
- `lib/services/` - Business logic
- `supabase/migrations/` - Database schema

## Contact Info

- **Email**: galbum99@gmail.com
- **Phone**: +91 9514422244
- **Website**: galbum.net

---

**G Album** - Crafting memories into beautiful albums since 2018
