import Link from "next/link";
import { SectionLink } from "@/components/nav/SectionLink";

type Props = { name: string; email?: string; resumePath: string; showBlog: boolean; year: number };

export function Footer({ name, email, resumePath, showBlog, year }: Props) {
  return (
    <footer className="container-x flex flex-col gap-4 border-t border-line py-10 text-[13px] text-muted md:flex-row md:items-center md:justify-between">
      <p>
        © {year} {name}
      </p>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {showBlog ? (
            <li>
              <Link href="/blog" className="link no-underline hover:underline">
                Blog
              </Link>
            </li>
          ) : null}
          <li>
            <a href={resumePath} className="link no-underline hover:underline" target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
          </li>
          {email ? (
            <li>
              <a href={`mailto:${email}`} className="link no-underline hover:underline">
                Email
              </a>
            </li>
          ) : null}
          <li>
            <SectionLink id="home" className="link no-underline hover:underline">
              Back to top
            </SectionLink>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
