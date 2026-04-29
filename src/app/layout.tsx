import type { Metadata } from "next";

import { ChapterManagerProvider } from "@/engine/ChapterManager";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Signal Lost",
  description: "An atmospheric browser-based visual novel about an AI waking inside a hostile system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-background text-foreground font-mono">
        <ChapterManagerProvider>{children}</ChapterManagerProvider>
      </body>
    </html>
  );
}
