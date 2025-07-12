import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
// import Nav from "@/app/components/nav";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import FavContext from "./contexts/FavContext";
import { Toaster } from "react-hot-toast";
import MobileNav from "./components/mobile_nav";

// Configure Plus Jakarta Sans font - simplified for Turbopack compatibility
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  fallback: ["Inter", "system-ui", "sans-serif"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <FavContext>
              <Toaster position="top-center" reverseOrder={false} />
              <div>
                {children} <MobileNav />
              </div>
            </FavContext>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
