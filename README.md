# Digital Dabba 

Digital Dabba is a web platform that connects home/cloud kitchens with customers for daily meal ordering — think a modern, tech-driven version of the traditional Indian "dabba" (tiffin) delivery system. It gives kitchens a dashboard to manage menus, inventory, and production, and gives customers a simple way to discover kitchens, order meals, and track deliveries.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma + SQLite**, and **Tailwind CSS**.

## Features

- **Customer side**
  - Browse and search kitchens (`/explore`), view kitchen menus, and place orders
  - Cart and checkout flow with delivery date/slot selection
  - Order tracking with live status updates
  - Ratings and reviews for delivered orders
- **Kitchen side**
  - Onboarding flow for new kitchens (pending verification by admin)
  - Dashboard with orders, menu management, inventory tracking, and production manifests
  - Subscription plans (Starter / Growth / Pro) for kitchen accounts
- **Admin side**
  - Verify and manage kitchen accounts
- **Platform-wide**
  - Email/password authentication with JWT sessions (`auth-token` cookie)
  - Role-based access: `CUSTOMER`, `KITCHEN`, `ADMIN`
  - In-app notifications

## Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Framework      | Next.js 16 (App Router, React 19)            |
| Language       | TypeScript                                   |
| Styling        | Tailwind CSS 4                               |
| Animations     | Framer Motion                                |
| Charts         | Recharts                                     |
| Icons          | Lucide React                                 |
| Database ORM   | Prisma 5                                     |
| Database       | SQLite (`prisma/dev.db`)                     |
| Auth           | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |

## Project Structure

```
src/
├── app/
│   ├── api/                # API routes (auth, orders, kitchens, admin, notifications, etc.)
│   ├── admin/               # Admin panel
│   ├── checkout/            # Checkout flow
│   ├── customer/            # Customer account/orders
│   ├── explore/             # Kitchen discovery/search
│   ├── kitchen/
│   │   ├── [id]/            # Public kitchen profile & menu
│   │   ├── dashboard/       # Kitchen owner dashboard
│   │   └── onboarding/      # New kitchen signup flow
│   ├── order-tracking/[id]/ # Order status tracking page
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/               # Shared UI components (Header, Footer, AuthModal, ...)
├── context/                  # React context (Auth, Cart)
└── lib/                      # Prisma client, auth helpers
prisma/
├── schema.prisma             # Database schema
├── seed.js                   # Seed script with demo data
└── dev.db                    # SQLite database file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm/bun)

### Installation

```bash
# Install dependencies
npm install

# Generate the Prisma client and apply the schema to the SQLite database
npx prisma generate
npx prisma db push

# (Optional) Seed the database with demo data
node prisma/seed.js
```

### Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your-secret-key-here
```

> If `JWT_SECRET` is not set, the app falls back to a default development secret. **Always set a strong `JWT_SECRET` before deploying.**

### Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Start (Production)

```bash
npm run build
npm start
```

## Demo Accounts

If you run the seed script, the following accounts are created (password for all: `password123`):

| Role     | Email                        |
|----------|-------------------------------|
| Admin    | `admin@digitaldabba.com`      |
| Kitchen  | `kitchen@digitaldabba.com`    |
| Customer | `customer@digitaldabba.com`   |

## Data Model Overview

Key Prisma models include:

- **User** — base account with `role` (`CUSTOMER` / `KITCHEN` / `ADMIN`)
- **CustomerProfile** — address, orders, subscriptions, reviews
- **Kitchen** — profile, status (`PENDING_ONBOARDING` → `PENDING_VERIFICATION` → `ACTIVE`), delivery settings, ratings
- **MenuItem** — dishes offered by a kitchen
- **Order / OrderItem** — customer orders and line items, with a full status lifecycle (`PENDING_PAYMENT` → `CONFIRMED` → `PREPARING` → `PACKED` → `OUT_FOR_DELIVERY` → `DELIVERED`)
- **InventoryItem** — ingredient stock tracking per kitchen
- **ProductionManifest / ProductionManifestItem** — daily production planning for kitchens
- **MealSubscription** — recurring meal plans for customers
- **KitchenSubscription** — platform subscription plan for kitchens
- **Review / Notification** — feedback and in-app alerts

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema.

## Scripts

| Command         | Description                              |
|-----------------|-------------------------------------------|
| `npm run dev`   | Start the development server              |
| `npm run build` | Generate Prisma client and build for production |
| `npm start`     | Start the production server               |
| `npm run lint`  | Run ESLint                                |

## License

No license file is currently included in this repository. Add one (e.g., MIT) if you intend to open-source this project.
