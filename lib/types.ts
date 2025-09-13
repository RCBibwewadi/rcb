/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HeroContent {
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
}

export interface AboutContent {
  title: string;
  mainTitle: string;
  description1: string;
  description2: string;
  description3: string;
}

export interface BoardMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image: string;
  gradient: string;
  initial: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
}

export interface ContentData {
  hero: HeroContent;
  about: AboutContent;
  boardMembers: BoardMember[];
  projects: Project[];
  events: any[];   // you’ll define event structure later
  contact: any;    // same for contact
  siteConfig: {
    siteName: string;
    tagline: string;
    clubLogo: string;
    adminPassword: string;
  };
}
