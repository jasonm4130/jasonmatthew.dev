type Link = {
  text: string;
  href: string;
};

type SocialLink = {
  platform: string;
  href: string;
};

type SiteConfig = {
  website: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  headerNavLinks: Link[];
  footerNavLinks: Link[];
  socialLinks: SocialLink[];
  postsPerPage: number;
  projectsPerPage: number;
};

const siteConfig: SiteConfig = {
  website: 'https://jasonmatthew.dev',
  title: 'Jason Matthew',
  subtitle: 'Building AI systems, shipping code, leaving things better',
  description:
    'Engineer from Brisbane, Australia. I build AI systems and cloud infrastructure at scale, ship side projects, and write about what I learn along the way.',
  author: 'Jason Matthew',
  headerNavLinks: [
    { text: 'Home', href: '/' },
    { text: 'Projects', href: '/projects' },
    { text: 'Blog', href: '/blog' },
    { text: 'About', href: '/about' },
  ],
  footerNavLinks: [
    { text: 'About', href: '/about' },
    { text: 'Contact', href: '/contact' },
  ],
  socialLinks: [
    { platform: 'github', href: 'https://github.com/jasonm4130' },
    { platform: 'linkedin', href: 'https://www.linkedin.com/in/jasonm4130/' },
    { platform: 'x', href: 'https://twitter.com/jasonm4130' },
  ],
  postsPerPage: 8,
  projectsPerPage: 8,
};

export default siteConfig;
