export type Image = {
  src: string;
  alt?: string;
};

export type Link = {
  text: string;
  href: string;
};

export type SocialLink = {
  platform: string;
  href: string;
};

export type SiteConfig = {
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
  subtitle: 'Engineering Manager & Builder',
  description:
    'Engineering Manager from Brisbane, Australia. I build side projects and write about software engineering, leadership, and learning.',
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
