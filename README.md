# 🥗 Nourish Box – Recipe Selling Platform

**Nourish Box** is a recipe-selling web application built for chefs to upload, manage, and sell their recipes online. Customers can browse recipes, order them (with physical delivery for now), and leave “I Tried This” feedback after cooking the meal. This MVP is built using **Next.js** with **Firebase** for both database and media storage, and **Paystack** for payments.

---

## 🔧 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Pages & API Routes)
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Media Storage**: [Firebase Storage](https://firebase.google.com/products/storage)
- **Authentication**: Firebase Auth (optional)
- **Payment Gateway**: [Paystack](https://paystack.com/)
- **Styling**: Tailwind CSS, Shadcn UI
- **Animation**: Framer Motion

---

## 🔐 Environment Variables

Create a `.env.local` file in the root of the Next.js project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY=...
FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
FIREBASE_PROJECT_ID=...

PAYSTACK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
JWT_SECRET=your_jwt_secret
```

---

## 🗂️ Firebase Setup

### 🔥 Firestore Collections

- `recipes`
  - `id`, `title`, `description`, `ingredients[]`, `imageUrl`, `videoUrl`, `price`, `featured`, `createdAt`
- `users`
  - `uid`, `name`, `email`, `favorites[]`, `role (user/admin)`
- `orders`
  - `id`, `userId`, `recipeIds[]`, `status (pending/delivered)`, `createdAt`, `paymentRef`
- `comments`
  - `id`, `userId`, `recipeId`, `content ("I tried this!")`, `createdAt`

### 🖼️ Firebase Storage Structure

- `/recipe-images/{recipeId}/image.jpg`
- `/recipe-videos/{recipeId}/video.mp4`

---

## 📦 Folder Structure (Simplified)

```
nourish-box/
├── components/
├── pages/
│   ├── index.tsx          // Home page
│   ├── recipes/           // All recipes and individual recipe pages
│   ├── cart.tsx
│   ├── favorites.tsx
│   ├── profile.tsx
│   ├── order-history.tsx
│   ├── admin/             // Admin dashboard
│   └── api/               // API routes (Next.js backend)
├── lib/                   // Firebase setup, utils, helpers
├── public/
├── styles/
└── .env.local
```

---

## 💸 Paystack Integration

1. Customer clicks **Order** or **Checkout**
2. Paystack Web Checkout opens
3. On success, backend (API route) verifies transaction with Paystack secret key
4. Firestore `orders` document is created with delivery status
5. Admin dashboard shows new orders and payment alerts

---

## 🧪 Scripts

```bash
npm install      # Install dependencies
npm run dev      # Run development server
npm run build    # Build for production
npm run start    # Start production server
```

---

## 🚀 Upcoming Features

- Digital delivery of recipes (PDF or access after payment)
- Improved comment interaction system
- Analytics & dashboard improvements for the chef
- Notification system (email/SMS)
