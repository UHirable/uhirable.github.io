// =========================================================
//  For Companies – partners & tools
//  To add a partner: copy one { ... } block (with the comma after it),
//  paste it, and change the text between the quotes.
//  logo: optional image file name (e.g. "partner-logo.png") – leave "" to show initials.
//  tag: small label above the name (default "Partner")   cta: button text (default "Hire Now")
//  deal: big highlighted perk (e.g. "$500 OFF")   perk: perk details
// =========================================================
const PARTNERS = [
  {
    name: "Oyster",
    popular: true,
    deal: "30 DAYS FREE",
    dealLabel: "Free to start",
    logo: "logo-oyster.png",
    tag: "Global Hiring & EOR",
    tagline: "Hire, pay and take care of your team in 180+ countries, with no setup fees.",
    perk: "30-day free trial for contractors + startups save up to $1,200",
    cta: "Start Free",
    roles: ["Employer of Record (120+ countries)", "Contractors (180+ countries)", "Global Payroll", "No Setup Fees", "Free Onboarding & Offboarding", "HR Expert Support", "Benefits & Perks", "Free Cost Calculator"],
    link: "https://oyster.partnerlinks.io/iqgrt27whv78"
  },
  {
    name: "Remote Leverage",
    deal: "$500 OFF",
    logo: "logo-remote-leverage.png",
    tag: "Remote Staffing",
    tagline: "Pre-vetted remote professionals for growing businesses.",
    perk: "Get $500 off when you hire through U Hirable",
    roles: ["Administrative", "Lead Generation (SDR)", "Sales (BDR)", "Social Media", "Marketing", "Accounting & Bookkeeping", "Customer Support", "Custom Role"],
    link: "https://remoteleverage.com/?via=amel-moussa-tantawy-sx4d"
  },
  {
    name: "Recruit CRM",
    deal: "FREE TRIAL",
    logo: "logo-recruit-crm.png",
    tag: "Recruiting Software",
    tagline: "The highest-rated ATS + CRM for recruitment agencies and in-house hiring teams.",
    perk: "Free trial with no time limit",
    cta: "Try it Free",
    roles: ["Applicant Tracking (ATS)", "Client CRM", "AI Resume Parsing", "Candidate Matching", "Email Sequences", "Chrome Sourcing Extension", "Reports & Dashboards", "24/7 Live Support"],
    link: "https://recruitcrm.io?fpr=uhirable"
  },
  {
    name: "Manatal",
    deal: "14-DAY FREE TRIAL",
    dealLabel: "No card needed",
    logo: "logo-manatal.png",
    tag: "AI Recruitment Software",
    tagline: "AI-powered ATS + CRM used by 10,000+ recruiting teams in 135+ countries.",
    perk: "14-day free trial, no credit card required",
    cta: "Try it Free",
    roles: ["Applicant Tracking (ATS)", "Recruitment CRM", "AI Candidate Recommendations", "AI Candidate Enrichment", "Candidate Sourcing", "Careers Page", "Reports & Analytics", "Unlimited Hiring Managers"],
    link: "https://www.manatal.com/?via=uhirable"
  },
  {
    name: "RemotePass",
    deal: "1ST MONTH FREE",
    logo: "logo-remotepass.png",
    tag: "Global Payroll & EOR",
    tagline: "Hire, onboard and pay your global team compliantly, all from one platform.",
    perk: "First month free when you sign up through U Hirable",
    cta: "Get Started",
    roles: ["Employer of Record (EOR)", "Contractor Payments", "Global Payroll", "Compliant Contracts", "Onboarding", "Time Off & Expenses", "Health Insurance", "Multi-currency Payouts"],
    link: "https://www.remotepass.com/re?grsf=amel-91f9uz"
  },
  {
    name: "greytHR",
    deal: "10% OFF",
    logo: "logo-greythr.png",
    tag: "HR & Payroll Software",
    tagline: "All-in-one HR and payroll trusted by 33,000+ companies across the GCC, India and 30+ countries.",
    perk: "10% off annual plans through U Hirable + a free account to start",
    cta: "Get 10% Off",
    roles: ["Payroll for UAE, KSA, Qatar, Oman, Bahrain & Kuwait", "WPS File Generation", "Multi-country Payroll", "Leave & Attendance", "Employee Self-Service App", "Performance Management", "Recruitment", "Expense Management"],
    link: "https://greythr.referralrock.com/l/AMELMOUSSA04/"
  },
  {
    name: "Kinetic Staff",
    deal: "SAVE UP TO 65%",
    dealLabel: "Free quote",
    logo: "logo-kinetic.png",
    tag: "Offshore Staffing",
    tagline: "Dedicated offshore professionals from the Philippines, with payroll, HR and admin handled for you.",
    perk: "Save up to 65% vs local hiring + a free quote and candidate shortlist in about a week",
    cta: "Get a Free Quote",
    roles: ["Customer Service", "Virtual Assistants", "Data Entry", "Technical Support", "Legal Assistants", "Finance & Accounting", "Sales & Marketing", "Web Developers", "Engineering Support"],
    link: "https://www.kineticstaff.com/share/v1/?ref=6ecA3tl&linkId=1"
  }
];
