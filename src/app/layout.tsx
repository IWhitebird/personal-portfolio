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
import { getContent } from "@/lib/cms/content";
import { RESUME_PATH } from "@/lib/resume";
import { allProjects, socialLinks, xHandle } from "@/lib/cms/select";
import { homeGraph } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
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

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { profile } = content;
  const handle = xHandle(content);

  return {
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
      ...(handle ? { creator: `@${handle}` } : {}),
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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0f14" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7f9" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  const { profile } = content;
  const socials = socialLinks(content);

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
          <TopNav name={profile.name} socials={socials} showBlog={content.posts.length > 0} />
          {children}
          <ResumeHost src={RESUME_PATH} />
          <ChatLauncher
            suggestions={content.chat.suggestions}
            socials={socials.map(({ key, href }) => ({ key, href }))}
            projects={allProjects(content).map((p) => ({ name: p.name, liveUrl: p.liveUrl, githubUrl: p.githubUrl }))}
            resumePath={RESUME_PATH}
          />
        </ThemeProvider>
        {/* Both scripts are served by Vercel's edge; elsewhere they would only 404. */}
        {process.env.VERCEL ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
        <JsonLd data={homeGraph(content)} />
      </body>
    </html>
  );
}
