# Mashsia POS - Monorepo Setup Guide

This is a pnpm monorepo containing the Mashsia Point of Sale system with multiple applications and shared packages.

## Repository Structure

```
Mashsia_POS/
├── apps/
│   ├── api/                 # Fastify backend server
│   ├── dashboard/           # Next.js admin dashboard
│   ├── kiosk/               # (To be implemented)
│   └── pos-terminal/        # Vite + React + Tauri desktop app
├── packages/
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   └── types/               # Shared TypeScript types
├── deployments/             # Docker compose files for different environments
├── infrastructure/          # Terraform configurations
├── nginx/                   # Nginx configurations
└── docker-compose.yml       # Development environment
```

## Applications

### API (`apps/api/`)
- **Framework**: Fastify
- **Language**: TypeScript
- **Purpose**: RESTful API backend
- **Key Features**:
  - JWT authentication
  - PostgreSQL with Drizzle ORM
  - Email notifications
  - Inventory management
  - Order processing
  - Payment handling

### Dashboard (`apps/dashboard/`)
- **Framework**: Next.js 16
- **Language**: TypeScript + React 19
- **Purpose**: Admin dashboard
- **Features**:
  - Modern UI with Tailwind CSS
  - Babel React Compiler for performance
  - Integration with `@mashsia/ui` components

### POS Terminal (`apps/pos-terminal/`)
- **Framework**: Vite + React 19 + Tauri
- **Language**: TypeScript
- **Purpose**: Desktop POS application
- **Features**:
  - Native desktop app with Tauri
  - Real-time inventory updates via WebSocket
  - Order management UI
  - Integration with `@mashsia/ui` components

### Kiosk (`apps/kiosk/`)
- **Status**: Placeholder for future development
- **Purpose**: Customer-facing kiosk interface

## Shared Packages

### UI Package (`packages/ui/`)
Centralized React component library built with shadcn/ui.

**Key Features:**
- Pre-configured shadcn/ui components
- Tailwind CSS v4 with theme system
- Ready for both Next.js and Vite apps
- Exports utility functions and component bases

**Usage:**
```tsx
import { Button } from '@mashsia/ui/components/button'
import { cn } from '@mashsia/ui'
```

**Adding Components:**
```bash
cd packages/ui
npx shadcn-ui@latest add [component-name]
```

See [packages/ui/README.md](./packages/ui/README.md) for detailed documentation.

### Types Package (`packages/types/`)
Shared TypeScript type definitions across applications.

## Getting Started

### Prerequisites
- Node.js 18+ (check exact version in pnpm-workspace.yaml)
- pnpm 8+ (this project uses pnpm workspaces)
- Docker & Docker Compose (for database and services)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Mashsia_POS
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

   This installs dependencies for all workspaces (apps and packages) at once.

3. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. **Start development services:**
   ```bash
   docker-compose up -d
   ```

   This starts PostgreSQL and other required services.

5. **Set up the database:**
   ```bash
   cd apps/api
   pnpm db:generate  # Generate migrations
   pnpm db:push      # Apply migrations
   pnpm db:seed      # Seed with sample data
   ```

### Development

Each application has its own development server:

```bash
# API Server (runs on http://localhost:3000)
cd apps/api
pnpm dev

# Dashboard (runs on http://localhost:3001)
cd apps/dashboard
pnpm dev

# POS Terminal (runs on http://localhost:1420)
cd apps/pos-terminal
pnpm dev

# Or run all from root (if scripts are configured)
pnpm dev --recursive
```

### Building

```bash
# Build all applications
pnpm build --recursive

# Build specific app
cd apps/dashboard && pnpm build
```

## Monorepo Workspace Management

### Adding Dependencies

**To root workspaces:**
```bash
pnpm add package-name -w
```

**To a specific app:**
```bash
pnpm add package-name --filter=@mashsia/dashboard
```

**To shared UI package:**
```bash
pnpm add package-name --filter=@mashsia/ui
```

### Shared Dependencies

via `pnpm-workspace.yaml` catalog:
- `react: 19.2.4`
- `react-dom: 19.2.4`
- `typescript: ^5`
- `tailwindcss: ^4`
- And more...

### Using Workspace Packages

Reference other workspace packages with `workspace:*`:
```json
{
  "dependencies": {
    "@mashsia/ui": "workspace:*"
  }
}
```

## Database

The project uses PostgreSQL with Drizzle ORM.

### Database Commands (in `apps/api/`)
```bash
pnpm db:generate  # Generate new migrations
pnpm db:push      # Apply migrations to database
pnpm db:migrate   # Run pending migrations
pnpm db:reset     # Reset database
pnpm db:seed      # Seed database
pnpm db:studio    # Open Drizzle Studio GUI
```

## Scripts Reference

### Root Level
```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages
pnpm dev            # Run all dev servers (if configured)
pnpm clean          # Clean build artifacts
```

### Per Application
Check individual `package.json` files in each app directory.

## Docker & Deployment

### Development Environment
```bash
docker-compose up -d    # Start all services
docker-compose down     # Stop all services
```

### Production Environments
```bash
docker-compose -f deployments/docker-compose.prod.yml up -d
docker-compose -f deployments/docker-compose.pi.yml up -d  # For Raspberry Pi
```

## Code Quality

### Type Checking
```bash
pnpm type-check --recursive
```

### Linting
```bash
pnpm lint --recursive
```

## Environment Variables

Example `.env`:
```bash
# API
DATABASE_URL=postgresql://user:password@localhost:5432/mashsia
JWT_SECRET=your-secret-key
API_PORT=3000

# Tauri (POS Terminal)
VITE_API_URL=http://localhost:3000

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Dependencies Overview

### Core Libraries
- **React 19.2.4** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool for POS Terminal

### Backend
- **Fastify** - Web server
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### Frontend
- **Next.js 16** - React framework (Dashboard)
- **Tauri** - Desktop app framework (POS Terminal)

### UI & Components
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** - Utility-first CSS

## Troubleshooting

### Dependency Issues
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port Conflicts
- API: 3000
- Dashboard: 3001
- POS Terminal: 1420
- PostgreSQL: 5432

### Build Failures
```bash
# Clean build artifacts
pnpm clean --recursive
pnpm build --recursive
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `pnpm test --recursive`
4. Submit a pull request

## Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tauri Documentation](https://tauri.app/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Fastify Documentation](https://www.fastify.io/)

## License

ISC
