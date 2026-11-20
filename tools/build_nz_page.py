# Builds the New Zealand guide page (accredited employers, Immigration New Zealand). Run from the repo root.
# No company list here: INZ publishes a search tool, not a downloadable list.
import os, re

_src = open(os.path.join(os.path.dirname(__file__), "build_ie_nl_pages.py"), encoding="utf-8").read()
exec(_src[:_src.index("# ---------------------------------------------------------------- Ireland")])

NZ = "new-zealand-accredited-employers.html"
TODAY = "2026-11-20"
TOOL = "https://immigration.govt.nz/work/requirements-for-work-visas/approved-employers/accredited-employer-list"
body = (GD +
        '          <p class="gd-answer">To get New Zealand\'s main work visa, the Accredited Employer Work Visa (AEWV), your job offer must come from an employer accredited by Immigration New Zealand. There are more than 28,000 accredited employers. Immigration New Zealand does not publish them as one list. It has an official search tool, updated daily, where you check an employer by name.</p>\n'
        + switch(NZ) +
        f'          <p><a class="btn btn-gold" style="white-space:normal;text-align:center;max-width:100%;box-sizing:border-box" href="{TOOL}" target="_blank" rel="noopener">Open the official search tool</a></p>\n'
        '          <p class="gd-note"><b>Accreditation is not a job offer.</b> It means the employer is approved to hire workers from overseas. It does not mean it is hiring now. Also, employers can choose not to have their accreditation published, so a missing name does not always mean the employer is not accredited. Ask the employer.</p>\n'
        '          <h2>How to check an employer</h2>\n          <ol class="gd-steps">\n'
        '            <li><b>Open the official search tool.</b> It is on the Immigration New Zealand website.</li>\n'
        '            <li><b>Search by name or number.</b> Use the company name, the trading name, or the New Zealand Business Number (NZBN).</li>\n'
        '            <li><b>Check before you accept an offer.</b> The employer must be accredited and must have an approved job for you.</li>\n'
        '            <li><b>Never pay for a job.</b> A real employer does not charge you for a job offer or a visa.</li>\n          </ol>\n'
        '          <h2>The Accredited Employer Work Visa at a glance</h2>\n'
        '          <div class="gd-tw spc-tw"><table><thead><tr><th></th><th>What Immigration New Zealand says</th></tr></thead><tbody>'
        '<tr><td>Length of stay</td><td>Up to 5 years, based on the job offered</td></tr>'
        '<tr><td>Cost</td><td>From NZD $1,540</td></tr>'
        '<tr><td>Processing time</td><td>80% of applications within 5 weeks</td></tr>'
        '<tr><td>Job offer</td><td>Full-time, at least 30 hours a week, from an accredited employer with an approved job</td></tr>'
        '<tr><td>Skills</td><td>2 years or more of relevant work experience, or a qualification at level 4 or higher on the New Zealand framework</td></tr>'
        '<tr><td>Residence</td><td>Can lead to a resident visa</td></tr>'
        '</tbody></table></div>\n'
        '          <p>Costs and times change. Check the current figures on immigration.govt.nz before you apply.</p>\n'
        '          <h2>The three steps of the scheme</h2>\n          <ol class="gd-steps">\n'
        '            <li><b>Employer accreditation.</b> The employer gets approved by Immigration New Zealand.</li>\n'
        '            <li><b>Job check.</b> The employer gets the specific job approved.</li>\n'
        '            <li><b>Your visa application.</b> You apply for the Accredited Employer Work Visa with that job offer.</li>\n          </ol>\n'
        '          <h2>Visas that need an accredited employer</h2>\n'
        '          <ul><li>Accredited Employer Work Visa (AEWV)</li><li>Care Workforce Work to Residence Visa</li><li>Skilled Migrant Category Resident Visa</li></ul>\n'
        '          {FAQ}\n          '
        '<h2>Sources</h2><ul class="gd-src">'
        f'<li><a href="{TOOL}" target="_blank" rel="noopener">Immigration New Zealand: Accredited employer list (search tool)</a></li>'
        '<li><a href="https://www.immigration.govt.nz/aewv" target="_blank" rel="noopener">Immigration New Zealand: Accredited Employer Work Visa</a></li>'
        '<li><a href="https://www.immigration.govt.nz/about-us/news-centre/accredited-employer-work-visa-aewv-key-information-and-statistics" target="_blank" rel="noopener">Immigration New Zealand: AEWV key information and statistics</a></li></ul>\n'
        '          <p class="gd-src">U Hirable is not connected to Immigration New Zealand.</p>\n' + GD_END)
faq = [
    ("Is there a list of accredited employers in New Zealand?", "Immigration New Zealand has an official search tool, updated daily, where you check an employer by company name, trading name or NZBN. It is not published as one downloadable list."),
    ("How many accredited employers are there in New Zealand?", "More than 28,000, according to Immigration New Zealand figures from March 2026."),
    ("What job offer do I need for the Accredited Employer Work Visa?", "A full-time offer of at least 30 hours a week from an accredited employer that has an approved job."),
    ("How long can I stay on an Accredited Employer Work Visa?", "Up to 5 years, based on the job offered."),
    ("An employer is not in the search tool. Is it not accredited?", "Not always. Employers can choose not to have their accreditation published, so ask the employer directly."),
]
out = render(shell("uk-visa-sponsors.html"), NZ, f"New Zealand Accredited Employers ({YEAR}): How to Check an Employer",
             "How to check if a New Zealand employer is accredited to hire you from overseas, with the official search tool and the Accredited Employer Work Visa rules.",
             "Official INZ search", "New Zealand accredited employers", "How to check if a New Zealand employer can hire you from overseas.", body, faq,
             [("Home", ""), ("New Zealand accredited employers", NZ)], TODAY, TODAY)
open(NZ, "w", encoding="utf-8", newline="\n").write(out)
update_sitemap({NZ: TODAY})
print("New Zealand page built")
