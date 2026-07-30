export const site = {
  name: "Orbit Studio",
  tagline: "Websites for local service businesses that actually book jobs.",
  description:
    "Orbit Studio builds fast, high-converting websites for HVAC, plumbing, electrical, roofing, and landscaping companies — fixed price, no subscriptions, real support after launch.",
  email: "conatctorbitstudio77@gmail.com",
  phone: "(555) 010-2040",
  city: "Edmundston",
  url: "https://orbitstudio.cc",
};

export const nav = [
  { label: "Our Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

export type Tier = {
  name: string;
  tagline: string;
  price: string;
  billingLabel: string;
  bestFor: string;
  includes: string[];
  featured?: boolean;
};

/** One-time packages — pay once, own it outright. */
export const tiers: Tier[] = [
  {
    name: "Orbit Launch",
    tagline:
      "A professional starting point for businesses that need a strong online presence.",
    price: "$869",
    billingLabel: "one-time",
    bestFor: "Owners who just need to stop losing jobs to a bad website.",
    includes: [
      "Custom responsive website design",
      "Up to 5 pages",
      "Mobile optimization",
      "Contact forms & Google Maps integration",
      "Basic SEO setup",
      "Launch & full ownership",
    ],
  },
  {
    name: "Orbit Pro",
    tagline:
      "A more advanced website designed for businesses ready to grow online.",
    price: "$1259",
    billingLabel: "one-time",
    bestFor: "Businesses ready to outgrow a basic starter site.",
    includes: [
      "Fully custom website design",
      "Up to 10 pages",
      "Premium animations & interactions",
      "Booking / inquiry system integration",
      "Advanced SEO foundation",
      "Analytics & performance optimization",
    ],
    featured: true,
  },
];

/** Optional monthly plans — separate from the one-time build, cancel anytime. */
export const carePlans: Tier[] = [
  {
    name: "Orbit Care",
    tagline: "Keeps your site secure, updated, and running smoothly.",
    price: "$89",
    billingLabel: "/month",
    bestFor: "Anyone who wants their site maintained without thinking about it.",
    includes: [
      "Security & software updates",
      "Uptime monitoring",
      "Monthly backups",
      "Minor content edits (up to 30 min/mo)",
      "Priority email support",
    ],
  },
  {
    name: "Orbit Growth",
    tagline: "Active marketing work to help the site bring in more business.",
    price: "$169",
    billingLabel: "/month",
    bestFor: "Businesses ready to actively grow leads from their website.",
    includes: [
      "Everything in Orbit Care",
      "Local SEO optimization",
      "Lead tracking & reporting",
      "Monthly strategy call",
      "Ongoing content / blog additions",
    ],
    featured: true,
  },
];

export const pricingFaqs = [
  {
    question: "Do the one-time packages have any recurring fees?",
    answer:
      "No. You pay once, the website is yours, and you own it outright. Care plans are entirely optional and separate.",
  },
  {
    question: "Can I switch to a care plan later?",
    answer:
      "Yes. Whether you bought a one-time site from us or built elsewhere, you can join any Orbit Care plan whenever you're ready — and change or cancel it anytime.",
  },
  {
    question: "What's the difference between Care and Growth?",
    answer:
      "Care plans keep your site secure, updated and healthy. Orbit Growth adds active marketing work — local SEO, lead tracking and monthly strategy — to help the site bring in business.",
  },
  {
    question: "Are these prices final?",
    answer:
      "They're starting anchors. Every project gets a firm quote after a real conversation about scope — no surprises later.",
  },
];

export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  result: string;
  summary: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "coming-soon-hvac",
    client: "First HVAC client",
    industry: "HVAC",
    result: "Case study in progress",
    summary:
      "We're onboarding our first cohort of local clients now. This slot is reserved for the first HVAC build — real results, published the day the site goes live.",
  },
  {
    slug: "coming-soon-plumbing",
    client: "First plumbing client",
    industry: "Plumbing",
    result: "Case study in progress",
    summary:
      "Reserved for the first plumbing company build. Every case study we publish links to a live, real site — no mockups.",
  },
  {
    slug: "coming-soon-landscaping",
    client: "First landscaping client",
    industry: "Landscaping",
    result: "Case study in progress",
    summary:
      "Reserved for the first landscaping build. Before/after gallery and lead numbers go here once the project ships.",
  },
];
