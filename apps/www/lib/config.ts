export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const siteConfig = {
  name: "Think Throo",
  url: "https://thinkthroo.com",
  ogImage: "https://thinkthroo.com/logo.jpg",
  description: "Enforce codebase architecture in your pull requests",
  links: {
    twitter: "https://x.com/thinkthroo",
    github: "https://github.com/ramu-narasinga/thinkthroo",
    youtube: "https://www.youtube.com/@ramu-narasinga",
    learningPlatform: "https://app.thinkthroo.com/architecture",
    consultation: "https://cal.com/team-thinkthroo-dxiovj/consultation",
    /** GitHub OAuth entry on the platform app — use for marketing CTAs */
    appLogin: "https://app.thinkthroo.com/login",
  },
};

export type SiteConfig = typeof siteConfig;
