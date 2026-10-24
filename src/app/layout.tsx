import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "IdeaProbe — Validate Before You Build",
  description:
    "Structured idea validation: research, competitor mapping, simulated personas, and evidence-grounded insights to help founders decide what to build next.",
  keywords: "startup validation, idea validation, market research, founder tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Suspense fallback={<aside className="sidebar" role="navigation" />}>
            <Sidebar />
          </Suspense>
          <main className="main-content">
            <Suspense fallback={<div className="page-container">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
