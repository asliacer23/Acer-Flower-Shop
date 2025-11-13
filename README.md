# Petal Swift - Flower Shop POS System

A modern, fullstack flower shop Point of Sale system built with React, TypeScript, Vite, TailwindCSS, shadcn/ui, and Framer Motion.

## Features

### For Guests
- Browse products with search, filter, and sort
- Add items to cart (stored in localStorage)
- Checkout with name, address, and payment method
- Responsive design with dark/light mode

### For Buyers (Registered Users)
- All guest features
- Persistent cart across sessions
- Order history and tracking
- Profile management
- Wishlist (coming soon)

### For Admins
- Product management dashboard
- Order management and status updates
- Customer overview
- Sales analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS with custom design tokens
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router v6 with lazy loading

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/        # Header, Footer, PageWrapper
│   ├── ui/           # shadcn/ui components
│   └── ProductCard.tsx
├── context/          # Auth, Theme, Cart contexts
├── hooks/            # Custom hooks
├── pages/            # All route pages
├── routes/           # Centralized routing
├── services/         # Mock API services
├── types/            # TypeScript types
└── App.tsx
```

## Design System

The app uses a nature-inspired color palette:

- **Primary**: Vibrant floral pink (HSL: 340 85% 55%)
- **Secondary**: Soft sage green (HSL: 150 25% 85%)
- **Accent**: Warm peachy tone (HSL: 25 90% 70%)

All colors are defined in `src/index.css` using HSL format and can be customized via CSS variables.

## Data Storage

Currently, all data is stored in localStorage:

- **Cart**: `cart-{userId}` or `cart-guest`
- **User**: `flower-shop-user`
- **Orders**: `flower-shop-orders`
- **Theme**: `flower-shop-theme`

### When Ready for Backend

To connect a real backend, enable **Lovable Cloud** through the Lovable interface. Then:

1. Replace mock services in `src/services/` with real API calls
2. Set up database tables:

```sql
-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  name text,
  email text,
  wishlist text[] default array[]::text[],
  primary key (id)
);

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  category text not null,
  image text,
  stock integer default 0,
  featured boolean default false
);

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  customer_name text not null,
  address text not null,
  payment_method text not null,
  status text default 'pending',
  total decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Order items table
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders on delete cascade,
  product_id uuid references public.products,
  quantity integer not null,
  price decimal(10,2) not null
);

-- User roles table (security best practice)
create type public.app_role as enum ('buyer', 'admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  role app_role not null,
  unique(user_id, role)
);

-- Security function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

3. Set up Row Level Security (RLS) policies
4. Update service files to use Supabase client

## Authentication

Mock authentication is currently in place:
- Use any email with "admin" in it to get admin access
- All other emails get buyer access
- No real password verification (will be replaced with real auth)

## Deployment

Open [Lovable](https://lovable.dev/projects/e13e0f5a-829b-4db5-8842-45673b8d5a35) and click on Share → Publish.

## License

MIT
