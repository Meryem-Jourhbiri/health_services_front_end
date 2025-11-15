// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Health Portal",
  description: "Doctor & Patient portal built with Next.js and HeroUI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add "dark" here to enable HeroUI’s dark theme; use "light" or toggle class later if you want
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
