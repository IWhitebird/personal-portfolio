import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { TopNav } from "@/components/nav/TopNav";
import { ResumeHost } from "@/components/resume/ResumeHost";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { JsonLd } from "@/components/ui/JsonLd";
import { allProjects, chatSuggestions, posts, profile, socialLinks } from "@/content";
import { homeGraph } from "@/lib/seo";
import { siteUrl, xHandle } from "@/lib/site";
import "./globals.css";

/**
 * Display serif for headings only, so one static weight is all that ships.
 * The variable cut with the `opsz` axis is 240 KB; this is a fraction of that.
 */
const serif = Newsreader({
  subsets: ["latin"],
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-serif-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: profile.seo.title,
    template: `%s | ${profile.name}`,
  },
  description: profile.seo.description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  formatDetection: { telephone: false },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title: profile.seo.title,
    description: profile.seo.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.seo.title,
    description: profile.seo.description,
    ...(xHandle ? { creator: `@${xHandle}` } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0f14" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7f9" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`}>
      <body className="min-h-svh">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-[14px] focus:text-bg"
          >
            Skip to content
          </a>
          <div aria-hidden className="grain" />
          <ScrollProgress />
          <TopNav name={profile.name} socials={socialLinks()} showBlog={posts().length > 0} />
          {children}
          <ResumeHost src={profile.resume.path} />
          <ChatLauncher
            suggestions={chatSuggestions}
            socials={socialLinks().map(({ key, href }) => ({ key, href }))}
            projects={allProjects().map((p) => ({ name: p.name, liveUrl: p.liveUrl, githubUrl: p.githubUrl }))}
            resumePath={profile.resume.path}
          />
        </ThemeProvider>
        {/* Both scripts are served by Vercel's edge; elsewhere they would only 404. */}
        {process.env.VERCEL ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
        <JsonLd data={homeGraph()} />
      </body>
    </html>
  );
}
