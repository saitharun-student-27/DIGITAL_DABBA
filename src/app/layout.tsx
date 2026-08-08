import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Dabba — Cook What's Sold",
  description: "Fresh meals prepared from confirmed orders, not forecasts. The hyperlocal food-commerce and cloud-kitchen operating system.",
  keywords: "cloud kitchen, pre-order, zero food waste, meal prep, hyperlocal food, fresh meals",
  openGraph: {
    title: "Digital Dabba — Cook What's Sold",
    description: "Fresh meals prepared from confirmed orders, not forecasts. The hyperlocal food-commerce operating system.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FBFBF9] text-[#1E1E1E]">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
