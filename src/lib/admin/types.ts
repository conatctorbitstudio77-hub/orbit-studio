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
  website_url: string | null;
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

export type SiteStatus = "live" | "in_progress" | "planned";

export type ClientRecord = {
  id: string;
  created_at: string;
  business_name: string;
  contact_name: string | null;
  industry: string | null;
  site_status: SiteStatus;
  quote_id: string | null;
};

export type CalendarEventType = "Deadline" | "Deliverable" | "Meeting";
export type CalendarEventSource = "manual" | "booking";

export type CalendarEventRecord = {
  id: string;
  created_at: string;
  event_date: string;
  event_time: string | null;
  title: string;
  type: CalendarEventType;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: CalendarEventSource;
};

export type SiteSettingsRecord = {
  id: true;
  hero_title: string | null;
  hero_subtitle: string | null;
  updated_at: string;
};

export type PricingTierKind = "one-time" | "monthly";

export type PricingTierRecord = {
  id: string;
  created_at: string;
  kind: PricingTierKind;
  name: string;
  tagline: string | null;
  price: string;
  billing_label: string;
  best_for: string | null;
  includes: string[];
  featured: boolean;
  display_order: number;
};

export type FaqRecord = {
  id: string;
  created_at: string;
  question: string;
  answer: string;
  display_order: number;
};
