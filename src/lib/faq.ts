export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "Is this really a one-time fee, or is there a catch?",
    answer:
      "One-time fee. You pay once for the build, you own the site, and there's no monthly platform charge afterward. The only ongoing costs are things you'd pay regardless of who builds your site — domain registration and hosting, both billed directly to you, not marked up by us.",
  },
  {
    question: "How long does a build actually take?",
    answer:
      "Most projects run 3–6 weeks from kickoff to launch, depending on tier and how quickly you can turn around content and photos. Pro-tier builds with custom photography direction can run longer — we'll give you a firm timeline once scope is locked.",
  },
  {
    question: "What happens after the launch support window ends?",
    answer:
      "Nothing breaks, nothing gets shut off — your site keeps running exactly as it did on day one. After the 30–60 day window, further changes are billed per our flat-fee fix-it menu or an hourly rate, whichever fits the request. No subscription, ever.",
  },
  {
    question: "Do I need to provide the photos and content myself?",
    answer:
      "You provide the raw material — photos of your work, your team, your service area — and we handle layout, copywriting direction, and structure. Growth and Pro tiers include more hands-on photography and content coordination if you'd rather not do it alone.",
  },
  {
    question: "Which trades do you work with?",
    answer:
      "Local service businesses generally — HVAC, plumbing, electrical, roofing, landscaping, cleaning, pest control, garage doors, junk removal, and similar. If your business books jobs from local customers searching online, it's very likely a fit.",
  },
  {
    question: "Can you help with SEO, or just the website itself?",
    answer:
      "Every build includes basic on-page SEO — proper structure, meta titles, mobile performance, schema markup. Growth and Pro tiers add service-area pages and individual service landing pages, which is where local SEO really compounds. Ongoing SEO campaigns are a separate add-on, not bundled by default.",
  },
  {
    question: "What if I don't like the design?",
    answer:
      "Every build includes structured revision rounds before launch, and we walk through direction with you before any development starts — you're never seeing a finished site for the first time. If something's genuinely not working, we fix it as part of the build, not as an extra charge.",
  },
  {
    question: "Do you build on WordPress, Wix, Squarespace, or something else?",
    answer:
      "We build custom, fast, code-based sites — not a page-builder template. That's why load times and Core Web Vitals are consistently better than typical small-business sites, and why your design isn't boxed in by someone else's theme.",
  },
];
