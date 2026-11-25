// =========================================================
//  Get Paid to Train AI – platforms that pay for AI work
//  To add a platform: copy one { ... } block (with the comma after it),
//  paste it, and change the text between the quotes.
//  deal: how it pays (big)   dealLabel: small label above it   perk: pay details
//  countries: one short line   roles: tags (those starting with "AI " show as AI tags)
//  src: short name used to count clicks
//  Only facts checked on the platform's own pages.
// =========================================================
const TRAIN_AI = [
  {
    name: "Mercor",
    src: "mercor",
    tag: "Hourly AI Contracts",
    tagline: "Remote hourly contracts on AI projects, for people with experience in a field.",
    countries: "Depends on the listing. Read its location line.",
    deal: "PAID HOURLY",
    dealLabel: "How it pays",
    perk: "An hourly rate on each listing, paid weekly through Stripe or Wise",
    cta: "Apply on Mercor",
    roles: ["Software & Machine Learning", "Medicine", "Law", "Finance & Accounting", "Science & Research", "Business", "Remote"],
    link: "https://t.mercor.com/vU87Z"
  },
  {
    name: "Terac",
    src: "terac",
    tag: "Paid Studies",
    tagline: "Paid studies for one profession at a time, project-based or one-time.",
    countries: "Depends on the study. Many name the US, or the US, UK, Canada, Australia and New Zealand.",
    deal: "PAID PER STUDY",
    dealLabel: "How it pays",
    perk: "A rate on each study. Withdraw to your bank account, minimum $12.50",
    cta: "Open Terac",
    roles: ["AI Training Tasks", "Assessments", "Interviews", "Voice Recordings", "Engineers", "Accountants", "Product Managers", "Marketers"],
    link: "https://terac.com/refer/bc955b86"
  },
  {
    name: "Clickworker",
    src: "clickworker",
    tag: "Micro-Tasks",
    tagline: "Small tasks from your phone or computer. Pick the ones you want and work when you want.",
    countries: "Many countries. Registration closes for a country when there is no work for it.",
    deal: "PAID PER TASK",
    dealLabel: "How it pays",
    perk: "Paid weekly. PayPal, Payoneer and other methods, depending on your country",
    cta: "Join Clickworker",
    roles: ["AI Training Tasks", "Surveys", "Voice Recordings", "Photos & Videos", "Web Research", "App Testing", "Text Writing", "iOS & Android App"],
    link: "https://www.clickworker.com/clickworker?customer=false&utm_source=31810917&utm_campaign=CW4CW&utm_medium=email"
  }
];
