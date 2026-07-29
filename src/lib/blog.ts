export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  status: "coming-soon";
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-isnt-my-business-showing-up-on-google",
    title: "Why Isn't My Business Showing Up on Google?",
    excerpt:
      "The most common reasons local service businesses don't rank — and which ones you can fix this month.",
    status: "coming-soon",
  },
  {
    slug: "how-to-get-more-leads-for-hvac-plumbing-landscaping",
    title: "How to Get More Leads for Your HVAC, Plumbing, or Landscaping Business",
    excerpt:
      "A practical breakdown of the channels that actually produce booked jobs for local trades.",
    status: "coming-soon",
  },
  {
    slug: "do-contractors-need-a-website",
    title: "Do Contractors Need a Website in 2026?",
    excerpt:
      "Short answer: yes. Longer answer: here's what happens to your booking rate when you don't have one.",
    status: "coming-soon",
  },
  {
    slug: "how-to-get-more-5-star-reviews",
    title: "How to Get More 5-Star Reviews for Your Local Business",
    excerpt:
      "A simple, non-spammy system for turning happy customers into public reviews without begging.",
    status: "coming-soon",
  },
];
