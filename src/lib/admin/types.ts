export type QuoteStatus = "new" | "contacted" | "won" | "lost";

export type Quote = {
  id: string;
  created_at: string;
  status: QuoteStatus;
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string;
  industry: string;
  has_website: "yes" | "no" | null;
  current_website: string | null;
  competitor_url: string | null;
  package_interested: string | null;
  timeline: string | null;
  features: string[];
  content_ready: string | null;
  additional_notes: string | null;
};

export type CaseStudyRecord = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  industry: string;
  summary: string;
  results: string | null;
  thumbnail_url: string | null;
  published: boolean;
  display_order: number;
};

export type BlogPostRecord = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  published: boolean;
  published_at: string | null;
};
