# Nourish Box - AI Coding Agent Instructions

## Project Overview

Nourish Box is a Next.js recipe marketplace where chefs sell recipes and customers browse/purchase
them. Uses Firebase for data/auth, Paystack for payments, and focuses on sleek UI with shadcn/ui
components.

## Architecture & Data Flow

### Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Firebase Firestore + Firebase Storage
- **Authentication**: Firebase Auth with Google OAuth
- **Payments**: Paystack integration
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Framer Motion
- **State**: React Context providers (Auth, Cart, Category, Favorites)

### Core Collections (Firestore)

```typescript
// Key collections in app/utils/schema/collection.enum.ts
(recipes,
  users,
  orders,
  transactions,
  deliveries,
  favorites,
  carts,
  categories,
  comments,
  site_content);
```

### Firebase Setup Pattern

- **Client-side**: `app/lib/firebase.ts` - standard Firebase v9+ setup
- **Server-side**: `app/api/lib/firebase-admin.ts` - Firebase Admin SDK
- **Environment**: Uses centralized `app/api/utils/config.env.ts` with ENV enum for all config

## Project Structure Patterns

### API Routes (`app/api/`)

- Each feature has its own folder (recipes, orders, paystack, etc.)
- **Response Pattern**: All API routes use `ResponseDto` class from `app/api/response.dto.ts`
- **Admin Utils**: Separate admin functions in `app/api/adminUtils/` using Firebase Admin SDK

### Firebase Service Layer (`app/utils/firebase/`)

- Client-side Firebase operations organized by domain
- Pattern: `{domain}.firebase.ts` (e.g., `recipes.firebase.ts`, `auth.firebase.ts`)
- **Batch Operations**: Use `chunkArray` helper for Firebase 'in' queries (max 10 items)

### Types & Schemas (`app/utils/types/` & `app/utils/schema/`)

- TypeScript interfaces for all data models
- Zod schemas for form validation (e.g., `checkout.schema.ts`)
- **Key Types**: Recipe, User, Order, Transaction, Delivery, Category

### Context Providers (`app/contexts/`)

- AuthContext: User authentication state
- CartContext: Shopping cart management
- CategoryContext: Recipe categories
- FavContext: User favorites

## Development Workflows

### Running the Project

```bash
npm run dev          # Development with Turbopack
npm run build        # Production build
npm run lint:fix     # ESLint + Prettier formatting
```

### Firebase Integration

- **Seeding**: Uncomment seeding code in `app/lib/firebase.ts` when needed
- **Admin Operations**: Use functions from `app/api/adminUtils/` for admin dashboard
- **Storage**: Cloudinary integration via `app/utils/firebase/storage.firebase.ts`

### Component Patterns

- **UI Components**: Use shadcn/ui components from `app/components/ui/`
- **Styling**: Tailwind with custom brand colors (check globals.css)
- **Animation**: Framer Motion for interactions (see admin layout)
- **Mobile-First**: Responsive design with mobile navigation

## Critical Development Patterns

### Admin Dashboard (`app/admin/`)

- **Layout**: Collapsible sidebar with role-based access control
- **Auth Guard**: 5-second grace period before redirect to login
- **Navigation**: Uses Lucide React icons, desktop/mobile responsive

### Payment Flow

1. Customer checkout → Paystack Web Checkout
2. Success callback → API verifies transaction
3. Creates Order + Transaction + Delivery records
4. Admin dashboard shows new orders

### Data Relationships

- **Recipe → Category**: `categoryId` field links to categories collection
- **User → Addresses**: Array of address objects within user document
- **Order → Transaction**: Linked via `transactionId`
- **Transaction → Delivery**: Linked via `deliveryId`

### Error Handling

- API routes return standardized `ResponseDto` responses
- Client-side uses react-hot-toast for user feedback
- Firebase operations wrapped in try-catch with console.error logging

## Code Conventions

### File Naming

- **Types**: `{domain}.type.ts` (e.g., `recipe.type.ts`)
- **Firebase**: `{domain}.firebase.ts` for client operations
- **Admin**: `{domain}.admin.ts` for server operations
- **Schemas**: `{domain}.schema.ts` for Zod validation

### Import Patterns

- Use absolute imports with `@/app/` prefix
- Firebase operations import from respective service files
- UI components import from `app/components/ui/`

### State Management

- Use Context providers for global state
- Local state with useState for component-specific data
- Firebase real-time listeners for live data updates

## Key Integration Points

### Authentication Flow

- Google OAuth via Firebase Auth
- User document auto-creation in `app/utils/firebase/auth.firebase.ts`
- Role-based access control (admin/user roles)

### Media Upload

- Cloudinary integration for recipe images/videos
- Firebase Storage as backup option
- Upload results include URL, publicId, and type

### Address Management

- Multiple addresses per user (new pattern)
- Legacy single address fields maintained for compatibility
- Primary address designation system

## Common Development Tasks

### Adding New Recipe Features

1. Update `Recipe` type in `app/utils/types/recipe.type.ts`
2. Modify Firebase operations in `app/utils/firebase/recipes.firebase.ts`
3. Update admin functions in `app/api/adminUtils/recipe.admin.ts`
4. Add UI components following shadcn/ui patterns

### Creating New API Endpoints

1. Create folder in `app/api/`
2. Use `ResponseDto` for consistent responses
3. Import config from `app/api/utils/config.env.ts`
4. Add admin counterpart in `app/api/adminUtils/` if needed

### Form Validation

- Use Zod schemas from `app/utils/schema/`
- Follow pattern in `checkout.schema.ts` for complex forms
- Phone number validation strips non-digits before validation
