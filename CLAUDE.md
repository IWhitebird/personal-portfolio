# Personal Portfolio - Shreyas Patange (IWhitebird)

## Project Overview
Personal portfolio website for **Shreyas Patange**, SDE II at Skylark Labs. Deployed on **Vercel** with Vercel Analytics.

## Tech Stack
- **Framework**: React 18 (Create React App)
- **Styling**: Tailwind CSS 3 + custom CSS files per component
- **3D Background**: Three.js (v0.122 aliased as `spherethree`) — animated displacement sphere
- **Animations**: react-reveal (Fade/Zoom) for legacy components, framer-motion for newer ones, popmotion (spring), DecoderText (custom scramble effect)
- **Icons**: react-icons (Fi, Si, Bi, Ri, Ai, Fa, Hi, Md, Io)
- **PDF Resume**: react-pdf, Formspree for contact form
- **Fonts**: Montserrat (`font-mons`), Rajdhani (`font-rajdhani`), Poppins
- **Package manager**: bun (bun.lock present), also npm (package-lock.json)

## Architecture
```
src/
├── App.js                  # Root — MyContext provider, renders all sections
├── MyContext.jsx            # React context for theme mode (light/dark)
├── Constants/index.js       # All data: experienceData, skillsData, projectsData, technologies, educationData, achievementsData
├── assets/                  # Tech icons, project screenshots, resume SVG
├── components/
│   ├── Home/                # Hero — name (DecoderText), "Software Engineer", tagline, clock, social links, resume
│   ├── Experience/          # Work experience timeline (Skylark Labs, Heliverse) with framer-motion
│   ├── Projects/            # Project cards from projectsData
│   ├── About/               # Bio, education card, achievement badge, animated skill cloud
│   ├── Contact/             # Formspree form + dynamic footer
│   ├── Navbar/              # Bottom dock (5 items) + hamburger menu + ModeSwitch
│   ├── Sphere/              # Three.js displacement sphere background
│   ├── DecoderText/         # Custom text scramble animation
│   ├── Resume/              # PDF viewer modal
│   └── VisuallyHidden/      # Accessibility helper
├── hooks/                   # useInViewport, usePrefersReducedMotion, useWindowSize
└── utils/                   # three.js cleanup, style media breakpoints, transitions
```

## Page Sections (render order)
1. **ModeSwitch** — fixed dark/light toggle (top-right)
2. **DisplacementSphere** — animated 3D sphere background
3. **Home** — hero with name, "Software Engineer", tagline, clock, social links, resume
4. **Experience** — work timeline (Skylark Labs SDE II, Heliverse Tech Lead)
5. **Projects** — project cards (Gor, GeoQuiz, Silicon Pulse Store, Stock Analyzer)
6. **About** — bio, education, LeetCode achievement, skill cloud (~60 skills)
7. **Contact** — Formspree email form + footer
8. **Navbar** — fixed bottom dock (5 links: Home, Experience, Projects, About, Contact)

## Environment Variables
- `REACT_APP_PDF_LINK` — Google Drive file ID for resume PDF download
- `REACT_APP_MAIL_KEY` — Formspree form ID for contact form

## Scripts
- `bun start` / `npm start` — dev server
- `bun run build` / `npm run build` — production build

## Key Details
- Dark/light mode persisted to localStorage, CSS variables for theming
- Accent color: `#00ddff` (cyan) — used in timeline dots, skill hover, card hover, button hover
- Displacement sphere uses custom vertex/fragment shader with `spherethree` (Three.js v0.122)
- DecoderText uses Devanagari glyphs for scramble effect
- Social links: GitHub (IWhitebird), LeetCode, LinkedIn, Twitter/X
- Contact form POSTs to Formspree
