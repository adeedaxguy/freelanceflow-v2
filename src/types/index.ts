export type Role = "USER" | "ADMIN";
export type LeadStatus = "NEW" | "PROPOSAL_SENT" | "REPLIED" | "CLOSED";
export type CampaignStatus = "DRAFT" | "RUNNING" | "COMPLETED";
export type EmailStatus = "SENT" | "DELIVERED" | "OPENED" | "READY_TO_SEND" | "BOUNCED" | "FAILED";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  niche: string | null;
  bio: string | null;
  rate: number | null;
  portfolio: string | null;
  avatarUrl: string | null;
  suspended: boolean;
  createdAt: Date;
}

export interface Lead {
  id: string;
  userId: string;
  company: string;
  domain: string;
  email: string | null;
  phone: string | null;
  confidence: number | null;
  niche: string | null;
  status: LeadStatus;
  savedAt: Date;
}

export interface SentEmail {
  id: string;
  userId: string;
  leadId: string | null;
  subject: string;
  body: string;
  sentAt: Date;
  status: EmailStatus;
  lead?: Lead | null;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  niche: string | null;
  status: CampaignStatus;
  emailCount: number;
  createdAt: Date;
}

export interface Template {
  id: string;
  userId: string | null;
  name: string;
  niche: string | null;
  subject: string;
  body: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  published: boolean;
  coverImage: string | null;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: string | null;
  metaDescription?: string | null;
  author?: string | null;
  tags?: string[];
  focusKeyword?: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
  createdAt: Date;
}

export interface HunterLead {
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  confidence: number;
  type?: string;
  company?: string;
  domain: string;
}

export interface HunterResponse {
  data: {
    domain: string;
    organization: string;
    emails: HunterEmail[];
    webmail: boolean;
    pattern?: string;
  };
  meta: {
    results: number;
    limit: number;
    offset: number;
    params: {
      domain?: string;
      company?: string;
      type?: string;
    };
  };
}

export interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  first_name?: string;
  last_name?: string;
  position?: string;
  linkedin?: string;
  twitter?: string;
  phone_number?: string;
}

export interface DashboardStats {
  leadsFound: number;
  emailsSent: number;
  openRate: number;
  responses: number;
  emailsThisMonth: { date: string; count: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalLeads: number;
  totalEmails: number;
  activeCampaigns: number;
  signupsOverTime: { date: string; count: number }[];
  emailsOverTime: { date: string; count: number }[];
}

export type NicheOption = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

export const NICHES: NicheOption[] = [
  { id: "web-development",   label: "Web Development",     icon: "🌐", description: "Frontend & Backend dev" },
  { id: "mobile-apps",       label: "Mobile Apps",         icon: "📱", description: "iOS & Android" },
  { id: "ui-ux-design",      label: "UI/UX Design",        icon: "🎨", description: "Product & interface design" },
  { id: "copywriting",       label: "Copywriting",         icon: "✍️", description: "Web copy & content" },
  { id: "seo",               label: "SEO & Content",       icon: "🔍", description: "Rankings & traffic" },
  { id: "video-editing",     label: "Video Editing",       icon: "🎬", description: "YouTube & social" },
  { id: "graphic-design",    label: "Graphic Design",      icon: "🖼️", description: "Branding & visuals" },
  { id: "social-media",      label: "Social Media",        icon: "📣", description: "Strategy & management" },
  { id: "meta-ads",          label: "Meta Ads",            icon: "🎯", description: "Facebook & Instagram ads" },
  { id: "data-science",      label: "Data Science",        icon: "📊", description: "Analytics & ML" },
  { id: "devops",            label: "DevOps & Cloud",      icon: "☁️", description: "AWS, GCP, Azure" },
  { id: "wordpress",         label: "WordPress",           icon: "📝", description: "Sites & plugins" },
  { id: "shopify",           label: "Shopify / E-commerce",icon: "🛒", description: "Stores & conversion" },
  { id: "email-marketing",   label: "Email Marketing",     icon: "📧", description: "Campaigns & funnels" },
  { id: "consulting",        label: "Business Consulting", icon: "💼", description: "Strategy & growth" },
  { id: "photography",       label: "Photography",         icon: "📷", description: "Commercial & editorial" },
  // ── New niches ──────────────────────────────────────────────────────────────
  { id: "blockchain",        label: "Blockchain / Web3",   icon: "🔗", description: "DeFi, NFTs & smart contracts" },
  { id: "cybersecurity",     label: "Cybersecurity",       icon: "🔒", description: "Pentesting & security audits" },
  { id: "game-development",  label: "Game Development",    icon: "🎮", description: "Unity, Unreal & more" },
  { id: "technical-writing", label: "Technical Writing",   icon: "📄", description: "API docs & user guides" },
  { id: "virtual-assistant", label: "Virtual Assistant",   icon: "🤖", description: "Admin, scheduling & research" },
];
