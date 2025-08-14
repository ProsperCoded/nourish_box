import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import MobileNav from './components/mobile_nav';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CategoryProvider } from './contexts/CategoryContext';
import FavContext from './contexts/FavContext';
import './globals.css';
import { metadata } from './metadata';

// Configure Plus Jakarta Sans font - simplified for Turbopack compatibility
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
});

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${jakarta.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <CategoryProvider>
              <FavContext>
                <Toaster position='top-center' reverseOrder={false} />
                <div>
                  {children} <MobileNav />
                </div>
              </FavContext>
            </CategoryProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
