import "./globals.css";
import Navbar from "@/components/Navbar";
import { MotionDiv } from "@/components/MotionDiv";

export const metadata = {
  title: "CareerCoachAI",
  description: "AI-driven daily career progress tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 antialiased">
        <Navbar />
        <MotionDiv className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </MotionDiv>
      </body>
    </html>
  );
}
