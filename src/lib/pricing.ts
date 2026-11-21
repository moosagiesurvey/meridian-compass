export type PricingPackage = {
  name: string;
  price: string;
  sub: string;
  items: readonly string[];
  best: string;
  bonus?: boolean;
};

export const WEBSITE_PACKAGES: readonly PricingPackage[] = [
  {
    name: "Get Online",
    price: "R10,000",
    sub: "once-off build + R999/month Meridian Care",
    items: [
      "Custom site, up to 6 pages",
      "Mobile-first, fast-loading design",
      "Domain, SSL & managed hosting",
      "Backups, security & maintenance",
      "Google Analytics & technical support",
    ],
    best: "A professional website with ongoing care.",
  },
  {
    name: "Get Found",
    price: "R7,500",
    sub: "once-off build + R3,500/month visibility retainer",
    items: [
      "Everything in Get Online",
      "Monthly on-page SEO",
      "Google Business Profile management",
      "Keyword tracking & monthly report",
      "Local search improvements",
    ],
    best: "Businesses ready to rank on Google and Maps consistently.",
  },
  {
    name: "Get Chosen",
    price: "R7,500",
    sub: "once-off build + R6,500/month + growth bonus",
    items: [
      "Everything in Get Found",
      "AI search visibility",
      "Local map ranking optimisation",
      "Dedicated tracked call & lead number",
      "Quarterly strategy review",
    ],
    best: "Full SEO, AI visibility and growth tracking.",
    bonus: true,
  },
];

export const VISIBILITY_PACKAGES: readonly PricingPackage[] = [
  {
    name: "SEO Essentials",
    price: "R3,500",
    sub: "per month · no lock-in",
    items: [
      "Monthly on-page SEO",
      "Google Business Profile management",
      "Keyword tracking & monthly report",
      "Local search improvements",
      "Cancel anytime, no contract",
    ],
    best: "Existing sites seeking Google and Maps visibility.",
  },
  {
    name: "SEO + AI Growth",
    price: "R6,500",
    sub: "per month + growth bonus",
    items: [
      "Everything in SEO Essentials",
      "AI search visibility",
      "Local map ranking optimisation",
      "Dedicated tracked call & lead number",
      "Quarterly strategy review",
    ],
    best: "Businesses that want full visibility and growth tracking.",
    bonus: true,
  },
];
