# Next.js SaaS Boilerplate

A production-ready Next.js 15 boilerplate with authentication, multi-tenancy, RBAC, and internationalization.

## Features

- **Authentication** - NextAuth v5 with credentials provider
- **Multi-tenancy** - Complete tenant isolation with slug-based identification
- **RBAC** - Role-based access control with CASL permissions
- **i18n** - Internationalization support (English, Vietnamese, French)
- **API Routes** - Hono for fast, type-safe API endpoints
- **Database** - PostgreSQL with Drizzle ORM
- **UI** - shadcn/ui components with Tailwind CSS
- **Code Quality** - Biome for linting and formatting

## Getting Started

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL and AUTH_SECRET
   ```

3. **Push database schema**
   ```bash
   bunx drizzle-kit push
   ```

4. **Run development server**
   ```bash
   bun --bun dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Lint code with Biome
bun format       # Format code with Biome
```

## Deployment

### Docker

1. **Build the image**
   ```bash
   docker build -t nextjs-saas .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your_database_url" \
     -e AUTH_SECRET="your_auth_secret" \
     nextjs-saas
   ```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Auth**: Better Auth
- **Database**: PostgreSQL + Drizzle ORM
- **API**: Hono
- **UI**: shadcn/ui + Tailwind CSS v4
- **Permissions**: CASL
- **Code Quality**: Biome
