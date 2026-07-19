// The controlled vocabulary for content threads — durable topic areas that
// articles and projects belong to (multi-membership). Content files reference a
// thread by `slug` only; the title, blurb, description and order live here as the
// single source of truth for /threads and /threads/[slug]. Adding a thread slug to
// a content file that is absent from this list fails the build (see content-graph).
//
// `foreground: true` marks the two lead threads the homepage surfaces first.
// Order is the display order across the threads index and the homepage.

export interface Thread {
  slug: string;
  /** Full thread name, e.g. "Applied AI & ML". */
  title: string;
  /** One-line tagline shown under the title, e.g. "The headline." */
  blurb: string;
  /** The longer descriptive standfirst for the thread page + index. */
  description: string;
  /** Display order (1-based) across the threads index and homepage. */
  order: number;
  /** The two lead threads the lab-notebook homepage foregrounds. */
  foreground: boolean;
}

export const THREADS: Thread[] = [
  {
    slug: 'applied-ai',
    title: 'Applied AI & ML',
    blurb: 'The headline.',
    description:
      'Production RAG, fine-tunes and evals: what I shipped, and how I know it works. S3 Vectors in production as an AWS launch partner, plus the eval harness that keeps the claims honest.',
    order: 1,
    foreground: true,
  },
  {
    slug: 'systems',
    title: 'Systems & infrastructure',
    blurb: 'The engineering under it.',
    description:
      'Distributed systems, edge platforms and the infrastructure-as-code that keeps them honest, plus the incidents from when they broke.',
    order: 2,
    foreground: true,
  },
  {
    slug: 'side-projects',
    title: 'Side projects',
    blurb: 'Built for the house.',
    description:
      'Things I built because I wanted them to exist. A holiday planner, a game-night parlour, this site, the odd algorithm demo. Home-cooked software, shipped for an audience of a few.',
    order: 3,
    foreground: false,
  },
  {
    slug: 'leadership',
    title: 'Engineering leadership',
    blurb: 'Context, not the pitch.',
    description:
      'How I think about seniors, juniors and the teams around the work. It sits here as context: the site leads with what I build, not how I manage.',
    order: 4,
    foreground: false,
  },
];

export const THREAD_SLUGS: ReadonlySet<string> = new Set(THREADS.map((t) => t.slug));

export function getThread(slug: string): Thread | undefined {
  return THREADS.find((t) => t.slug === slug);
}
