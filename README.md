# StoreForge AI

An AI-powered SaaS platform for creating, designing, optimizing, and launching complete ecommerce dropshipping stores.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, Zustand
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth:** JWT with httpOnly cookies, bcryptjs
- **AI:** OpenAI GPT-4o
- **Payments:** PayPal
- **Cache:** Redis (optional, falls back to in-memory)

## Prerequisites

- Node.js 18+ (recommended: 20+)
- PostgreSQL 14+
- Redis (optional)
- OpenAI API key
- PayPal Developer account

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd storeforge-ai
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. At minimum, you need:

```
DATABASE_URL="postgresql://user:password@localhost:5432/storeforge?schema=public"
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
ENCRYPTION_KEY="your-32-character-encryption-key!!"
OPENAI_API_KEY="sk-..."
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up PostgreSQL database

```bash
# Create the database
createdb storeforge

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Add environment variables
4. Connect to a PostgreSQL database (Neon, Supabase, Railway, etc.)
5. Deploy

**Important:** Vercel uses Postgresless deployments. You need an external PostgreSQL database.

### Docker

```bash
docker build -t storeforge-ai .
docker run -p 3000:3000 storeforge-ai
```

### Self-hosted

```bash
# Build
npm run build

# Start
npm start
```

## Database Setup

### Using Neon (Serverless PostgreSQL)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Using Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database > Connection string
4. Copy to `DATABASE_URL`

### Using Railway

1. Create account at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy the connection string

## Features

### Authentication
- Email/password registration and login
- JWT with access/refresh token rotation
- Role-based access (USER/ADMIN)
- CSRF protection

### AI Store Builder
- 13-question guided questionnaire
- AI-generated store blueprints
- Product research with scoring system
- Branding, SEO, and marketing content generation

### AI Agents
1. Store Strategy Agent
2. Product Research Agent
3. Branding Agent
4. Web Design Agent
5. SEO Agent
6. Conversion Optimization Agent
7. Marketing Agent
8. Integration Setup Agent
9. Compliance/Policy Agent
10. Launch Checklist Agent

### Store Management
- Multi-store support
- Store pages CMS
- Integration hub (29+ tools)
- Optimization scoring

### Admin Dashboard
- User management
- Store project overview
- AI usage tracking
- Subscription management

## API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/auth/me` - Get current user

### Store Projects
- `GET /api/store-projects` - List stores
- `POST /api/store-projects` - Create store
- `GET /api/store-projects/:id` - Get store
- `PATCH /api/store-projects/:id` - Update store
- `DELETE /api/store-projects/:id` - Delete store

### Questionnaire
- `POST /api/questionnaire` - Save answers + generate blueprint

### Products
- `POST /api/products/research` - AI product research
- `GET /api/products/research` - List candidates
- `POST /api/products/select` - Select products

### AI Generation
- `POST /api/ai/generate` - Run AI agent

### Pages
- `GET /api/pages` - List store pages
- `POST /api/pages` - Create page
- `GET /api/pages/:id` - Get page
- `PATCH /api/pages/:id` - Update page

### Integrations
- `GET /api/integrations` - List integrations
- `POST /api/integrations` - Connect integration

### Optimization
- `GET /api/optimization` - Get scores
- `POST /api/optimization` - Calculate scores

### Billing
- `GET /api/billing` - Get subscription
- `POST /api/billing/upgrade` - Upgrade plan

### Admin
- `GET /api/admin/dashboard` - Admin stats
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users` - Update user role

## Subscription Plans

| Plan | Stores | AI Edits | Products | Price |
|------|--------|----------|----------|-------|
| Free | 1 | Limited | 10 | $0 |
| Starter | 3 | 50/month | 20 | $29/mo |
| Pro | 10 | Unlimited | 100 | $79/mo |
| Agency | 50 | Unlimited | 500 | $199/mo |

## Security

- JWT with httpOnly cookies (not accessible via JavaScript)
- CSRF protection on API routes
- Rate limiting on auth endpoints
- Security headers (CSP, HSTS, X-Frame-Options)
- Encrypted API key storage
- Role-based access control
- Audit logging

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/    # Authenticated dashboard pages
│   ├── admin/          # Admin panel
│   ├── api/            # API routes
│   └── (auth)/         # Login/signup pages
├── components/
│   ├── ui/             # Reusable UI components
│   └── sidebar.tsx     # Navigation sidebar
├── lib/
│   ├── ai/             # AI agents and generation
│   ├── auth/           # Authentication utilities
│   └── api/            # API response helpers
└── stores/             # Zustand state stores
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens (32+ chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (32+ chars)
- `ENCRYPTION_KEY` - Key for encrypting API keys (32 chars)
- `OPENAI_API_KEY` - OpenAI API key

### Optional
- `REDIS_URL` - Redis connection (falls back to in-memory)
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` - For billing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For OAuth
- `SHOPIFY_*` / `WOOCOMMERCE_*` - For direct store integration
- `KLAVIYO_API_KEY` / `MAILCHIMP_API_KEY` - For email marketing
- `GA_MEASUREMENT_ID` / `META_PIXEL_ID` / `TIKTOK_PIXEL_ID` - For analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License. See LICENSE file for details.

## Disclaimer

This platform is for educational and business purposes. No guarantees of profit or revenue are made. Users are responsible for their own business decisions and compliance with applicable laws and regulations.
