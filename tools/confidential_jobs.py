"""Jobs posted for a recruiting partner where the employer's name and salary must not be shown.
One list feeds three things: the job cards (jobs.js), the job pages, and the application form (apply-jobs.json).
Run from the repo root: python3 tools/confidential_jobs.py"""
import re, json, html

DATE = "2026-11-22"
TEMPLATE = "job-traba-product-engineer.html"
COMMON_NOTE = "The employer's name is shared with shortlisted candidates."
COMP = "Shared with shortlisted candidates during screening."

JOBS = [
 dict(id="regional-sales-manager-great-lakes", title="Regional Sales Manager, Great Lakes", industry="Industrial pumps & machinery",
  location="Remote, Great Lakes region", tags=["Remote", "Full-time", "About 75% travel", "US-based candidates"],
  brief="Grow sales of industrial pumps and control panels through distributors across the Great Lakes region.",
  eligibility="For candidates based in the Great Lakes region of the United States (IN, KY, MI, OH, West PA, WV, West NY). The application asks about your US work authorisation. " + COMMON_NOTE,
  overview="A manufacturer of industrial pumps is hiring a Regional Sales Manager for its Great Lakes territory. You build and run the channel strategy for the region, manage existing distributors, and bring in new channel partners. This is a field role for someone who wins new business, not only maintains accounts.",
  resp=["Meet or exceed annual sales and orders growth for the region.",
        "Build channel sales strategies and key account plans for each partner, with annual goals and quotas.",
        "Support channel partners with applications knowledge, pricing, and technical and commercial quotations.",
        "Find gaps in regional coverage and sign and onboard new channel partners.",
        "Log calls and activities and manage the pipeline in HubSpot."],
  req=["7+ years of outside sales, preferably in pump manufacturing or distributor management.",
       "Experience selling submersible pumps, or closely related: slurry pumps, municipal or industrial pumping and their controls.",
       "Strong record of selling through distributors and channel partners in industrial B2B field sales.",
       "HubSpot or a similar CRM. Power BI and ERP software are a plus.",
       "About 75% travel in the region, usually 2 to 3 nights a week, and some international travel.",
       "Clean driving record. Bachelor's degree preferred."],
  questions=[("text", "How many channel partners or distributors have you managed, and across which states? How did you bring in new business through them?"),
             ("text", "What is your experience with submersible pumps and electrical control panels? If none, with slurry pumps or municipal and industrial pumping?"),
             ("text", "Which CRM and ERP systems have you used, and how? Have you used HubSpot?"),
             ("text", "How many years of outside sales do you have, and how large was your territory (states, customer segments, annual revenue)?"),
             ("text", "This role needs about 75% travel, usually 2 to 3 nights a week, and some international travel. Are you comfortable with that? Any limits?"),
             ("yn", "Do you have a clean driving record?"),
             ("line", "Highest level of education"),
             ("line", "Have you applied to or interviewed with this employer before? If you are not sure, write \"not sure\".")]),
 dict(id="avp-inside-sales-manager-mortgage", title="AVP, Inside Sales Manager (Mortgage)", industry="Mortgage lending",
  location="Remote, United States", tags=["Remote", "Full-time", "Team leadership", "US-based candidates"],
  brief="Lead a call-centre team of account executives originating mortgage loans, and drive loan production.",
  eligibility="For candidates in the United States. The application asks about your US work authorisation. " + COMMON_NOTE,
  overview="A US mortgage lender is hiring an AVP, Inside Sales Manager. You manage a team of Account Executives and Senior Account Executives who originate mortgage loans through a call-centre model. You drive loan production, improve lead conversion, coach the team and keep the work within lending regulations. Hands-on experience in business-purpose lending, especially Fix & Flip loans, is a priority.",
  resp=["Lead the sales team, set daily priorities and deliver the production targets set by senior leadership.",
        "Track prospecting, applications, funded loan volume, origination revenue and conversion for each person and the team.",
        "Run regular pipeline and production reviews, unblock stalled loans and drive timely funding.",
        "Coach originators on private lending products, borrower engagement, negotiation and closing.",
        "Support recruiting, onboarding and ongoing training for the team.",
        "Report on sales performance to senior leadership and keep the team compliant with mortgage lending rules."],
  req=["Bachelor's degree in business, finance or a related field, or equivalent experience.",
       "5+ years in mortgage sales and operations.",
       "3+ years managing people and leading teams, highly preferred.",
       "Proven record of managing inside sales teams and driving loan production.",
       "Strong knowledge of mortgage products, underwriting guidelines and regulatory requirements.",
       "Loan origination systems, CRM platforms, and MS Word, Excel and PowerPoint."],
  questions=[("text", "What was the size of the team you managed in your most recent role and in your previous roles?"),
             ("text", "What was your loan closing volume per month: number of loans funded and total loan amount?"),
             ("line", "Have you applied to or interviewed with this employer before? If you are not sure, write \"not sure\".")]),
 dict(id="outside-loan-officer-private-lending", title="Outside Loan Officer, Private Lending (BPL / DSCR)", industry="Private real estate lending",
  location="Remote, United States", tags=["Remote", "Full-time", "Existing book of business", "US-based candidates"],
  brief="Originate and close business-purpose real estate loans nationwide, building on your own investor relationships.",
  eligibility="For candidates in the United States with an established book of business in private lending. The application asks about your US work authorisation. " + COMMON_NOTE,
  overview="A US private lender is hiring Outside Loan Officers nationwide. The role is for proven private lending, BPL and DSCR originators who already generate their own business, hold strong investor relationships and close at high volume. Company-provided leads add to your existing business. They do not replace it. You handle DSCR rental, Fix & Flip, bridge, ground-up construction and rental portfolio loans from first contact to funding.",
  resp=["Originate and manage DSCR, Fix & Flip, bridge, ground-up construction and other business-purpose loans through application, underwriting and closing.",
        "Build investor, sponsor and referral relationships to grow a national private lending platform.",
        "Convert company-generated, referral and self-sourced leads through timely outreach and disciplined follow-up.",
        "Assess borrower goals, credit, property cash flow, leverage and project feasibility, and recommend a financing structure.",
        "Work with operations, underwriting, processing and closing teams to fund loans efficiently.",
        "Meet monthly funded volume, revenue and production goals."],
  req=["2+ years of private lending or business-purpose real estate investment lending, with loan origination and direct-to-consumer sales results.",
       "Established investor relationships or a transferable book of business, strongly preferred.",
       "Strong knowledge of DSCR financing preferred. Fix & Flip, bridge, ground-up construction, rental portfolio and Non-QM experience is highly desirable.",
       "Able to evaluate financing scenarios, structure deals and manage a high-volume pipeline independently.",
       "Active NMLS licence preferred.",
       "High school diploma or GED required. Bachelor's degree in business or finance preferred."],
  questions=[("text", "Tell us about your experience developing relationships with investors, private lenders, borrowers or other real estate finance professionals."),
             ("line", "About how many active investor relationships do you personally maintain today?"),
             ("line", "How many of those relationships generated actual business for you in the past 12 months?"),
             ("line", "What sales volume or revenue did those relationships generate over the past 12 months?"),
             ("line", "Have you applied to or interviewed with this employer before? If you are not sure, write \"not sure\".")]),
 dict(id="director-of-sales-professional-staffing", title="Director of Sales, Professional Staffing", industry="Staffing & recruiting",
  location="Remote, United States", tags=["Remote", "Full-time", "Individual contributor", "Must live in the US"],
  brief="Win new enterprise and mid-market clients for professional staffing services. A senior sales role with no team to manage.",
  eligibility="You must live in the United States. The application asks about your US work authorisation. " + COMMON_NOTE,
  overview="A US staffing company is hiring a Director of Sales for its fully remote national sales team. This is a senior individual-contributor role focused on new client acquisition and revenue. It is not a people-management position. You sell a managed service for direct-hire recruiting, plus direct hire and contingent staffing services, to enterprise and mid-sized organisations across the United States. The role is for a hunter with an established network in professional staffing.",
  resp=["Prospect and win new Fortune 1000 and mid-market clients.",
        "Own the full sales process, from first outreach and discovery to contract and client onboarding.",
        "Build and deliver a business-development plan for sustainable revenue growth.",
        "Handle complex sales cycles with decision-makers in talent acquisition, procurement, HR, operations and executive leadership.",
        "Meet or exceed sales and revenue targets.",
        "Represent the company at industry conferences, networking events and client meetings."],
  req=["10+ years of successful professional staffing sales, including IT, finance and accounting, engineering or other professional disciplines.",
       "Proven record of winning new mid-market and enterprise clients in professional staffing.",
       "An established network with talent acquisition, procurement, MSP and contingent workforce decision-makers.",
       "Experience is not mainly in healthcare or light-industrial staffing.",
       "Bachelor's degree as a minimum.",
       "Able to travel to industry conferences two or three times a year. Zoom, Dynamics CRM, Excel, PowerPoint and Outlook."],
  questions=[("text", "How many years have you sold professional staffing services? Give details: contingent or direct hire, size of target companies, industries, job functions and geography."),
             ("text", "How many new clients did you sign in the last 12 months for contingent staffing? About how many job orders came from them, and in which industries and functions?"),
             ("text", "Have you sold contingent labour solutions to end clients, to MSPs, or both? Please explain."),
             ("text", "How many new clients did you sign in the last 12 months for direct hire staffing? About how many job orders came from them, and in which industries and functions?"),
             ("text", "Do you have experience selling MSP services or VMS? Please explain. (Preferred, not required.)"),
             ("line", "Highest level of education (degree completed)"),
             ("text", "Are you currently employed? If not, why did you leave your last employer?")]),
]

js = lambda v: json.dumps(v, ensure_ascii=False)
def entry(j):
    arr = lambda xs: "[\n" + ",\n".join("      " + js(x) for x in xs) + "\n    ]"
    return f'''  {{
    id: {js(j["id"])},
    page: {js("job-" + j["id"] + ".html")},
    title: {js(j["title"])},
    company: "Confidential employer",
    industry: {js(j["industry"])},
    countries: ["United States"],
    location: {js(j["location"])},
    tags: {js(j["tags"])},
    brief: {js(j["brief"])},
    eligibility: {js(j["eligibility"])},
    applyLink: {js("apply.html?job=" + j["id"])},
    overview: {js(j["overview"])},
    responsibilities: {arr(j["resp"])},
    requirements: {arr(j["req"])},
    compensation: {js(COMP)}
  }},
'''

# 1) jobs.js: new entries go first; an entry that is already there is replaced.
s = open("jobs.js", encoding="utf-8").read()
for j in JOBS:
    s = re.sub(r'  \{\n    id: "' + re.escape(j["id"]) + r'",.*?\n  \},\n', "", s, flags=re.S)
m = re.search(r'\n  \{\n    id: "', s)
s = s[:m.start() + 1] + "".join(entry(j) for j in JOBS) + s[m.start() + 1:]
open("jobs.js", "w", encoding="utf-8").write(s)

# 2) job pages, from an existing job page. No JobPosting data: the employer cannot be named.
T = open(TEMPLATE, encoding="utf-8").read()
tid = re.search(r'window\.JOB_ID = "([^"]+)"', T).group(1)
for j in JOBS:
    p = T.replace(tid, j["id"])
    t = html.escape(j["title"] + " · Remote · United States | U Hirable")
    d = html.escape(j["brief"] + " Employer name shared with shortlisted candidates.")
    p = re.sub(r"<title>.*?</title>", f"<title>{t}</title>", p, flags=re.S)
    p = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{d}">', p)
    p = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{html.escape(j["title"])}">', p)
    p = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{d}">', p)
    p = re.sub(r'<meta property="og:image" content=".*?">', '<meta property="og:image" content="https://uhirable.com/og-image.png">', p)
    p = re.sub(r'\s*<script type="application/ld\+json" id="ld-schema">.*?</script>', "", p, flags=re.S)
    def crumbs(m):
        d = json.loads(m.group(1)); d["itemListElement"][-1]["name"] = j["title"]
        return '<script type="application/ld+json" id="ld-crumbs">' + json.dumps(d, ensure_ascii=False) + "</script>"
    p = re.sub(r'<script type="application/ld\+json" id="ld-crumbs">(.*?)</script>', crumbs, p, flags=re.S)
    assert "Traba" not in p and "traba" not in p, j["id"]
    open("job-" + j["id"] + ".html", "w", encoding="utf-8").write(p)

# 3) the application form's questions
data = {j["id"]: {"title": j["title"], "where": j["location"], "page": "job-" + j["id"] + ".html", "note": j["eligibility"],
                  "questions": [{"type": t, "q": q} for t, q in j["questions"]]} for j in JOBS}
open("apply-jobs.json", "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False, indent=1))

# 4) sitemap and site search
for fn in ("sitemap.xml", "sitemap-pages.xml"):
    x = open(fn, encoding="utf-8").read()
    add = "".join(f'  <url><loc>https://uhirable.com/job-{j["id"]}.html</loc><lastmod>{DATE}</lastmod><priority>0.6</priority></url>\n' for j in JOBS if f'job-{j["id"]}.html' not in x)
    k = x.index("  <url><loc>https://uhirable.com/job-")
    open(fn, "w", encoding="utf-8").write(x[:k] + add + x[k:])
x = open("search-index.js", encoding="utf-8").read()
add = "".join(js({"t": j["title"], "d": "Confidential employer · " + j["location"], "u": "job-" + j["id"] + ".html", "k": "Job"}) + "," for j in JOBS if f'job-{j["id"]}.html' not in x)
open("search-index.js", "w", encoding="utf-8").write(x.replace("window.SEARCH_INDEX=[", "window.SEARCH_INDEX=[" + add, 1))
print("ok", len(JOBS))
