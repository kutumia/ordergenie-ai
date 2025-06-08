# OrderGenie AI – Monorepo Structure

This repo uses a future-proof, production-grade structure with all folders for MVP **and** later phases (multi-tenancy, AI, platform, etc.).

- **MVP/Phase 1:** Core restaurant + admin features (code-filled now)
- **Phase 2+**: Platform, AI, onboarding, and advanced features (empty or “// TODO” files for now)
- **Why:** Makes scaling, onboarding, and CI/CD simple

**Conventions:**
- Empty files = placeholder for future code (usually marked with `// TODO`)
- All folders committed to git for clarity
- Add your code as you reach each phase!

For a full explanation, see `docs/development/README.md`.

# docs/README.md
# OrderGenie AI Documentation

Welcome to the OrderGenie AI documentation. This comprehensive guide will help you understand, develop, and deploy the AI-powered restaurant ordering system.

## 📚 Documentation Structure

### 🚀 Getting Started
- [Development Setup](./development/getting-started.md)
- [Project Structure](./development/project-structure.md)
- [Environment Setup](./deployment/environment-variables.md)

### 🔧 Development
- [Development Guide](./development/README.md)
- [Coding Standards](./development/coding-standards.md)
- [Testing Guide](./development/testing-guide.md)

### 🌐 API Documentation
- [API Overview](./api/README.md)
- [Authentication](./api/authentication.md)
- [Restaurant API](./api/restaurant-api.md)
- [Menu API](./api/menu-api.md)
- [Orders API](./api/orders-api.md)
- [Webhooks](./api/webhooks.md)

### 🚀 Deployment
- [Deployment Guide](./deployment/README.md)
- [Vercel Deployment](./deployment/vercel-deployment.md)
- [Database Setup](./deployment/database-setup.md)

### 👥 User Guides
- [Admin Dashboard](./user-guides/admin-dashboard.md)
- [Restaurant Setup](./user-guides/restaurant-setup.md)
- [Order Management](./user-guides/order-management.md)

## 🎯 Project Phases

### Phase 1: Core MVP 🎯
- Restaurant management
- Menu system
- Order processing
- Admin dashboard
- Payment integration
- Kitchen printing

### Phase 2: SaaS Platform 🚀
- Multi-tenant architecture
- Restaurant onboarding
- Dynamic site generation
- Platform analytics
- Subscription billing

### Phase 3: AI Integration 🤖
- WhatsApp ordering
- Voice note processing
- Natural language understanding
- AI-powered insights
- Marketing automation

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **State Management**: Zustand
- **Testing**: Jest + Playwright
- **Deployment**: Vercel

## 🤝 Contributing

Please read our [Contributing Guide](./.github/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

- Email: support@ordergenie.ai
- Documentation: [docs.ordergenie.ai](https://docs.ordergenie.ai)
- Issues: [GitHub Issues](https://github.com/yourusername/ordergenie-ai/issues)

---

# docs/development/getting-started.md
# Getting Started with OrderGenie AI Development

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- PostgreSQL 15+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ordergenie-ai.git
cd ordergenie-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start development services**
```bash
# Start PostgreSQL, Redis, etc.
docker-compose up -d

# Or use local installations
```

5. **Setup database**
```bash
npx prisma migrate dev
npx prisma db seed
```

6. **Start development server**
```bash
npm run dev
```

7. **Open application**
```
http://localhost:3000
```

## 🗂️ Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Core utilities
├── services/           # Business logic
├── stores/             # State management
├── types/              # TypeScript types
└── hooks/              # Custom hooks
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📝 Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `npm run test`
4. Commit changes: `git commit -m "feat: your feature"`
5. Push branch: `git push origin feature/your-feature`
6. Create pull request

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Database GUI
npx prisma migrate dev  # Run migrations
npx prisma db seed      # Seed database

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run type-check      # TypeScript check
```

## 🆘 Troubleshooting

### Common Issues

**Database connection error**
```bash
# Reset database
docker-compose down -v
docker-compose up -d
npx prisma migrate reset
```

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Node modules issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

# docs/development/project-structure.md  
# Project Structure Guide

## 📁 Directory Overview

### `/src/app` - Next.js App Router
```
app/
├── (restaurant)/       # Customer-facing pages
├── admin/              # Admin dashboard
├── platform/           # Platform management
├── api/                # API endpoints
└── globals.css         # Global styles
```

### `/src/components` - React Components
```
components/
├── ui/                 # Base components (Button, Input)
├── forms/              # Form components
├── layout/             # Layout components
├── domain/             # Business components
├── providers/          # Context providers
└── templates/          # Page templates
```

### `/src/lib` - Core Libraries
```
lib/
├── db/                 # Database client
├── auth/               # Authentication
├── payments/           # Payment processing
├── printing/           # Kitchen printing
├── email/              # Email services
└── utils/              # Utilities
```

### `/src/services` - Business Logic
```
services/
├── restaurant/         # Restaurant management
├── menu/              # Menu operations
├── orders/            # Order processing
├── customers/         # Customer management
└── analytics/         # Analytics & reporting
```

## 🎯 Component Architecture

### UI Components (`/src/components/ui`)
Base reusable components following atomic design:
- **Atoms**: Button, Input, Label
- **Molecules**: SearchBar, MenuItem
- **Organisms**: MenuList, OrderSummary

### Domain Components (`/src/components/domain`)
Business-specific components:
- **Restaurant**: RestaurantCard, RestaurantSettings
- **Menu**: MenuCategories, MenuItemForm
- **Orders**: OrderCard, OrderStatus

## 🔄 Data Flow

```
Page → Service → Database
  ↓      ↓         ↓
Store ← Hook ← Component
```

1. **Pages** call **Services** for data
2. **Services** interact with **Database**
3. **Components** use **Hooks** for state
4. **Stores** manage global state

## 📋 Naming Conventions

### Files
- **Components**: PascalCase (`MenuCard.tsx`)
- **Services**: kebab-case (`menu.service.ts`)
- **Utilities**: kebab-case (`date-utils.ts`)
- **Types**: kebab-case (`restaurant.types.ts`)

### Functions
- **React Components**: PascalCase (`MenuCard`)
- **Hooks**: camelCase with `use` prefix (`useMenu`)
- **Services**: camelCase (`createOrder`)
- **Utilities**: camelCase (`formatCurrency`)

## 🎨 Styling Guidelines

### Tailwind CSS Classes
```tsx
// ✅ Good - Logical grouping
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">

// ❌ Avoid - Random order
<div className="shadow-md bg-white gap-4 rounded-lg p-4 items-center flex">
```

### Component Props
```tsx
// ✅ Good - Descriptive interfaces
interface MenuCardProps {
  menu: Menu;
  isEditing?: boolean;
  onEdit?: () => void;
}

// ❌ Avoid - Generic props
interface Props {
  data: any;
  callback?: Function;
}
```

## 🔐 Security Patterns

### API Routes
```typescript
// ✅ Good - Proper validation
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  const body = await request.json();
  const validated = MenuSchema.parse(body);
  // ... process validated data
}
```

### Database Queries
```typescript
// ✅ Good - Row Level Security
const orders = await prisma.order.findMany({
  where: {
    restaurantId: session.user.restaurantId,
    // Always filter by user's restaurant
  },
});
```
