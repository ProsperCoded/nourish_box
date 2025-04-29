import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// If loading a variable font, you don't need to specify the font weight
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
