import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta" 
});

export const metadata: Metadata = {
  title: "FeedbackOS - Product Feedback Lifecycle Tracker",
  description: "Turn raw customer feedback into an autonomous, traceable product lifecycle.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-[#F5F8F6] text-[#1E332E] antialiased">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}