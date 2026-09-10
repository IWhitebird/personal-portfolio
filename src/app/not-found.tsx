import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main" className="container-x flex min-h-svh flex-col items-start justify-center py-24">
      <p className="font-mono text-[13px] text-muted">404</p>
      <h1 className="display mt-3 text-[2.625rem] tracking-[-0.015em] text-fg">There is nothing at this address.</h1>
      <p className="mt-4 max-w-[48ch] text-[17px] text-muted">The link may be out of date. Everything else is one click away.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to the start
      </Link>
    </main>
  );
}
