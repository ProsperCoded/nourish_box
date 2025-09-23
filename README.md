# 🥗 Nourish Box – Fresh Meal Kits Delivered

**Nourish Box** is a fully functional meal kit delivery platform that makes healthy cooking
accessible and convenient. Customers can browse pre-portioned meal kits, place orders with secure
payments, and track deliveries from kitchen to doorstep. Built with modern web technologies and
designed for scalability.

**Live Site**: [nourish-box.vercel.app](https://nourish-box.vercel.app)

---

## ✨ Key Features

### 🛒 **Customer Experience**

- **Browse & Search**: Discover meal kits with advanced filtering by category, price, and dietary
  preferences
- **Smart Cart**: Add multiple recipes with custom quantities, real-time price calculation
- **Secure Checkout**: Guest and registered user checkout with Paystack payment integration
- **Order Tracking**: Real-time delivery status updates with email notifications
- **User Profiles**: Manage addresses, view order history, and track favorites
- **Reviews & Ratings**: Rate and review meal kits after cooking

### 👨‍💼 **Admin Dashboard**

- **Order Management**: Process orders, update delivery status, manage inventory
- **Recipe Management**: Add/edit meal kits with media uploads and pricing
- **User Management**: View customer data, manage admin access
- **Business Rules**: Configure delivery fees, tax rates, and site content
- **Analytics**: Revenue tracking, popular recipes, customer insights
- **Email Notifications**: Automated order confirmations and status updates

### 🚚 **Delivery System**

- **Location-Based Pricing**: Dynamic delivery costs based on state/LGA
- **Address Management**: Multiple delivery addresses per customer
- **Status Tracking**: Pending → Packed → In Transit → Delivered workflow
- **Guest Orders**: Checkout without registration with delivery details

---

## 🔧 Tech Stack

### **Frontend**

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) +
  [React Icons](https://react-icons.github.io/react-icons/)
- **State Management**: React Context (Auth, Cart, Categories, Favorites)

### **Backend & Database**

- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore)
- **File Storage**: [Firebase Storage](https://firebase.google.com/products/storage) +
  [Cloudinary](https://cloudinary.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth) with Google Sign-In
- **API Routes**: Next.js API routes with server-side validation

### **Payments & Notifications**

- **Payment Gateway**: [Paystack](https://paystack.com/) (Nigeria-focused)
- **Email Service**: [Brevo](https://www.brevo.com/) (formerly Sendinblue)
- **Email Templates**: EJS templating for order confirmations and updates

### **Development Tools**

- **Language**: TypeScript with strict type checking
- **Linting**: ESLint + Prettier for code quality
- **Package Manager**: npm with lock file for dependency management

---

## 🗂️ Database Schema

### **Firebase Collections**

#### `recipes` - Meal Kit Catalog

```typescript
{
  id: string;
  name: string;
  description: string;
  displayMedia: { url: string; publicId: string; type: 'image' | 'video' };
  samples: Array<{ variant: string; media: MediaObject }>;
  duration: number; // cooking time in seconds
  price: number; // in NGN
  ingredients?: string[];
  numberOfIngredients?: number;
  servings?: number;
  difficulty?: string;
  categoryId?: string;
  order: number; // for sorting
  featured: boolean; // homepage display
  clicks: number; // analytics
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: { [key: number]: number };
  createdAt: string;
  updatedAt: string;
}
```

#### `users` - Customer & Admin Data

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses?: Address[]; // multiple delivery addresses
  role: 'admin' | 'user';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `orders` - Order Management

```typescript
{
  id: string;
  userId?: string; // optional for guest orders
  recipeIds: Array<{ recipeId: string; quantity: number }>;
  amount: number; // total in NGN
  deliveryId: string;
  deliveryStatus: 'pending' | 'packed' | 'in_transit' | 'delivered' | 'failed';
  receivedStatus: 'pending' | 'received' | 'failed';
  deliveryDate: string;
  deliveryDurationRange: string; // e.g. "2-3 days"
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `transactions` - Payment Records

```typescript
{
  id?: string;
  userId?: string; // optional for guest transactions
  email: string;
  reference: string; // Paystack reference
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: string;
  recipes: Array<{ recipeId: string; quantity: number }>;
  deliveryId: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `deliveries` - Shipping Information

```typescript
{
  deliveryId: string;
  transactionId?: string;
  deliveryName: string;
  deliveryEmail: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryLGA: string;
  deliveryNote: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `reviews` - Customer Feedback

```typescript
{
  id: string;
  userId: string;
  recipeId: string;
  orderId?: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `site_content` - Business Configuration

```typescript
{
  id: string;
  heroHeading: string;
  heroDescription: string;
  heroImage: MediaObject;
  businessRules: {
    deliveryFee: number;
    taxRate: number;
    taxEnabled: boolean;
  }
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id

# Paystack Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key

# Application
NEXT_PUBLIC_DOMAIN=https://nourish-box.vercel.app
JWT_SECRET=your_jwt_secret
```

---

## 📁 Project Structure

```
nourish-box/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard pages
│   │   ├── business-rules/       # Business configuration
│   │   ├── orders/              # Order management
│   │   ├── recipes/             # Recipe management
│   │   ├── site-content/        # Site content management
│   │   └── users/               # User management
│   ├── api/                     # API routes
│   │   ├── adminUtils/          # Admin utility functions
│   │   ├── business-rules/      # Business rules API
│   │   ├── categories/          # Category management
│   │   ├── delivery-costs/      # Delivery pricing
│   │   ├── email/               # Email notifications
│   │   ├── orders/              # Order processing
│   │   ├── paystack/            # Payment processing
│   │   ├── recipes/             # Recipe CRUD
│   │   ├── site-content/        # Site content API
│   │   ├── storage/             # File upload handling
│   │   └── utils/               # API utilities
│   ├── auth/                    # Authentication pages
│   ├── cart/                    # Shopping cart
│   ├── checkout/                # Checkout process
│   ├── components/              # Reusable UI components
│   │   ├── admin/               # Admin-specific components
│   │   └── ui/                  # Shadcn UI components
│   ├── contexts/                # React Context providers
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Firebase configuration
│   ├── profile/                 # User profile pages
│   ├── shop/                    # Product catalog
│   ├── utils/                   # Utility functions
│   │   ├── firebase/            # Firebase operations
│   │   ├── schema/              # Database schemas
│   │   └── types/               # TypeScript type definitions
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── metadata.ts              # SEO metadata
│   └── page.tsx                 # Homepage
├── lib/                         # Shared utilities
├── public/                      # Static assets
├── scripts/                     # Database seeding scripts
├── temp/                        # Temporary files
├── components.json              # Shadcn UI configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- Firebase project with Firestore and Storage enabled
- Paystack account for payments
- Brevo account for email notifications

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/nourish-box.git
   cd nourish-box
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up Firebase**
   - Create a Firebase project
   - Enable Firestore Database and Storage
   - Generate service account keys
   - Configure authentication with Google provider

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Customer site: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

---

## 💳 Payment Flow

### **Order Processing**

1. **Cart Management**: Users add meal kits with quantities
2. **Checkout**: Guest or registered user checkout with delivery details
3. **Payment Initialization**: Paystack payment link generated
4. **Payment Processing**: Customer completes payment via Paystack
5. **Verification**: Server verifies payment with Paystack API
6. **Order Creation**: Order and delivery records created in Firestore
7. **Notifications**: Email confirmations sent to customer and admins

### **Email Notifications**

- **Order Confirmation**: Customer receives order details and tracking info
- **Admin Notification**: Admins get new order alerts
- **Status Updates**: Customers notified of delivery status changes
- **Templates**: Professional EJS templates for all email types

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run format:fix       # Format and lint in one command

# Database
npm run seed:delivery-costs  # Seed delivery cost data
```

---

## 🔧 Key Features Implementation

### **Authentication System**

- Firebase Auth with Google Sign-In
- Guest checkout support
- Role-based access control (admin/user)
- One-tap authentication for new users

### **Shopping Cart**

- Persistent cart state with React Context
- Real-time price calculation
- Quantity management
- Guest and registered user support

### **Admin Dashboard**

- Comprehensive order management
- Recipe CRUD with media uploads
- User management and analytics
- Business rules configuration
- Real-time dashboard statistics

### **Delivery Management**

- Location-based delivery pricing
- Multiple address support
- Status tracking with email notifications
- Guest order delivery handling

### **Review System**

- Post-order rating and review
- Recipe rating aggregation
- Review moderation capabilities

---

## 🌟 Production Features

- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards
- **Mobile Responsive**: Optimized for all device sizes
- **Performance**: Image optimization, lazy loading, code splitting
- **Security**: Input validation, CSRF protection, secure API routes
- **Monitoring**: Error tracking and performance monitoring ready
- **Scalability**: Firebase auto-scaling, CDN-ready assets

---

## 📞 Support & Contact

- **Website**: [nourish-box.vercel.app](https://nourish-box.vercel.app)
- **Email**: hello@nourishboxng.com
- **Admin Access**: Contact for admin account setup

---

## 📄 License

This project is proprietary software. All rights reserved.
