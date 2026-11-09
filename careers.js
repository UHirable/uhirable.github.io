// =========================================================
//  Career Boost – tools for job seekers
//  To add a tool: copy one { ... } block (with the comma after it),
//  paste it, and change the text between the quotes.
//  logo: image file name, or leave "" and set logoText (e.g. "GR")
//  deal: big highlighted perk   dealLabel: small label above it   perk: perk details
//  steps: optional 3 short steps   cta: button text
//  roles starting with "AI " show as colorful AI tags
//  Only show real perks offered by the company (no made-up discounts).
// =========================================================
const CAREER_TOOLS = [
  {
    name: "Taplio",
    popular: true,
    logo: "logo-taplio.png",
    tag: "LinkedIn Growth",
    tagline: "Grow your LinkedIn presence with AI: write better posts, schedule content and see what works.",
    deal: "7 DAYS FREE",
    dealLabel: "Free trial",
    perk: "Full Pro access free for 7 days + 30-day money-back guarantee",
    cta: "Try Taplio Free",
    roles: ["AI Post Writer", "AI Content Ideas", "AI Carousel Maker", "Post Scheduling", "LinkedIn Analytics", "Engagement Tools"],
    link: "https://taplio.com/?via=uhirable"
  },
  {
    name: "AIApply",
    logo: "logo-aiapply.png",
    tag: "AI Job Search Agent",
    tagline: "An AI agent that finds jobs that fit you every day, writes a tailored resume and cover letter for each one, and applies for you.",
    deal: "FREE TO START",
    dealLabel: "Free plan",
    perk: "Start for free; paid plans unlock unlimited auto-apply and more AI tools",
    cta: "Try AIApply Free",
    roles: ["AI Auto-Apply", "AI Job Matching", "AI Resume Tailoring", "AI Cover Letter", "AI Interview Practice", "Application Tracker"],
    link: "https://www.aiapply.co/?via=uhirable"
  },
  {
    name: "LoopCV",
    logo: "logo-loopcv.png",
    tag: "AI Auto-Apply",
    tagline: "Upload your CV once and let AI apply to matching jobs for you on LinkedIn, Indeed, Glassdoor and 20+ job boards.",
    deal: "FREE TO START",
    dealLabel: "No credit card",
    perk: "Free plan to start, no credit card required + free AI cover letter tool",
    cta: "Start Free with LoopCV",
    roles: ["AI Job Application Agent", "AI Auto-Apply", "AI CV Builder", "AI CV Checker", "AI Cover Letter", "AI Mock Interview", "AI Career Coach", "AI Question Answering", "Recruiter Email Finder", "Job Application Tracker", "20+ Job Boards"],
    link: "https://loopcv.pro/?via=uhirable"
    },
  {
    name: "SkillSyncer",
    logo: "logo-skillsyncer.png",
    tag: "Resume Scanner & Job Tracker",
    tagline: "Scan your resume against any job description, find the missing keywords and track every application in one place.",
    deal: "FREE PLAN",
    dealLabel: "Free forever",
    perk: "Free weekly resume scans + 1 year of Premium free for students with a .edu email",
    steps: ["Paste the job description", "Upload your resume", "Add the missing keywords"],
    cta: "Scan My Resume Free",
    roles: ["AI Auto-Optimize", "AI Bullet Point Writer", "Resume Match Score", "Keyword Gap Analysis", "Job Application Tracker", "Chrome Extension for LinkedIn & Indeed", "Free Premium for Students"],
    link: "https://skillsyncer.com/?via=uhirable"
  },
  {
    name: "Contra",
    logo: "logo-contra.png",
    logoText: "Co",
    tag: "Freelance Platform",
    tagline: "Find freelance work, show your portfolio and get paid, with 0% commission taken from your earnings.",
    deal: "0% COMMISSION",
    dealLabel: "Free to join",
    perk: "Free to join; keep 100% of what you earn from clients",
    cta: "Join Contra Free",
    roles: ["Freelance Jobs", "Portfolio Website", "Contracts & Invoices", "Commission-free Payments"],
    link: "https://on.contra.com/RgQhmJ"
  }
];
