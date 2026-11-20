import re,json,html,sys
B="https://uhirable.com/"; TODAY="2026-11-20"
T=open('jobs-in-germany-for-english-speakers.html',encoding='utf-8').read()
SRC_LIST='<li><a href="https://www.make-it-in-germany.com/pdf-engpassberufe-en" target="_blank" rel="noopener">Make it in Germany: list of shortage occupations under Section 18g of the Residence Act (PDF)</a></li>'
SRC_ACT='<li><a href="https://www.make-it-in-germany.com/en/visa-residence/skilled-immigration-act" target="_blank" rel="noopener">Make it in Germany: the Skilled Immigration Act at a glance</a></li>'
NOTE='<p class="gd-note"><b>Last checked: November 2026.</b> Visa rules and salary thresholds change every year. This page is a general guide, not legal or immigration advice. Confirm every detail on the German government\'s official portal before you apply: <a href="https://www.make-it-in-germany.com/en/" target="_blank" rel="noopener">Make it in Germany</a></p>'
GROUPS=[
 ("Managers",[("132","Manufacturing, mining, construction and distribution managers",[("1321","Manufacturing managers"),("1322","Mining managers"),("1323","Construction managers"),("1324","Supply, distribution and related managers")]),
   ("133","Information and communications technology service managers",[("1330","Information and communications technology service managers")]),
   ("134","Professional services managers",[("1341","Childcare services managers"),("1342","Health services managers"),("1343","Aged care services managers"),("1344","Social welfare managers"),("1345","Education managers"),("1346","Financial and insurance services branch managers"),("1349","Professional services managers not elsewhere classified")])]),
 ("Science and engineering",[("211","Physical and earth science professionals",[("2111","Physicists and astronomers"),("2112","Meteorologists"),("2113","Chemists"),("2114","Geologists and geophysicists")]),
   ("212","Mathematicians, actuaries and statisticians",[("2120","Mathematicians, actuaries and statisticians")]),
   ("213","Life science professionals",[("2131","Biologists, botanists, zoologists and related professionals"),("2132","Farming, forestry and fisheries advisers"),("2133","Environmental protection professionals")]),
   ("214","Engineering professionals (excluding electrotechnology)",[("2141","Industrial and production engineers"),("2142","Civil engineers"),("2143","Environmental engineers"),("2144","Mechanical engineers"),("2145","Chemical engineers"),("2146","Mining engineers, metallurgists and related professionals"),("2149","Engineering professionals not elsewhere classified")]),
   ("215","Electrotechnology engineers",[("2151","Electrical engineers"),("2152","Electronics engineers"),("2153","Telecommunications engineers")]),
   ("216","Architects, planners, surveyors and designers",[("2161","Building architects"),("2162","Landscape architects"),("2163","Product and garment designers"),("2164","Town and traffic planners"),("2165","Cartographers and surveyors"),("2166","Graphic and multimedia designers")])]),
 ("Health",[("221","Medical doctors",[("2211","Generalist medical practitioners"),("2212","Specialist medical practitioners")]),
   ("222","Nursing and midwifery professionals",[("2221","Nursing professionals"),("2222","Midwifery professionals")]),
   ("225","Veterinarians",[("2250","Veterinarians")]),
   ("226","Other health professionals",[("2261","Dentists"),("2262","Pharmacists"),("2263","Environmental and occupational health and hygiene professionals"),("2264","Physiotherapists"),("2265","Dieticians and nutritionists"),("2266","Audiologists and speech therapists"),("2267","Optometrists and ophthalmic opticians"),("2269","Health professionals not elsewhere classified")])]),
 ("Teaching",[("231","University and higher education teachers",[("2310","University and higher education teachers")]),("232","Vocational education teachers",[("2320","Vocational education teachers")]),("233","Secondary education teachers",[("2330","Secondary education teachers")]),
   ("234","Primary school and early childhood teachers",[("2341","Primary school teachers"),("2342","Early childhood educators")]),
   ("235","Other teaching professionals",[("2351","Education methods specialists"),("2352","Special needs teachers"),("2353","Other language teachers"),("2354","Other music teachers"),("2355","Other arts teachers"),("2356","Information technology trainers"),("2359","Teaching professionals not elsewhere classified")])]),
 ("IT",[("251","Software and applications developers and analysts",[("2511","Systems analysts"),("2512","Software developers"),("2513","Web and multimedia developers"),("2514","Applications programmers"),("2519","Software and applications developers and analysts not elsewhere classified")]),
   ("252","Database and network professionals",[("2521","Database designers and administrators"),("2522","Systems administrators"),("2523","Computer network professionals"),("2529","Database and network professionals not elsewhere classified")])]),
]
NOCC=sum(len(o) for _,gs in GROUPS for _,_,o in gs)
def table(gs):
    rows="".join(f'<tr><td><b>{html.escape(n)}</b> ({c})</td><td>{"<br>".join(html.escape(f"{x} ({k})") for k,x in occ)}</td></tr>' for c,n,occ in gs)
    return f'<div class="gd-tw"><table><tr><th>Group (ISCO code)</th><th>Occupations on the list</th></tr>{rows}</table></div>'
def faq_html(faq): return "".join(f"<h3>{html.escape(q)}</h3><p>{html.escape(a)}</p>" for q,a in faq)
def build(slug,title,desc,eyebrow,h1,lead,body1,jobs,body2,faq,headline):
    p=T; url=B+slug
    p=p.replace('jobs-in-germany-for-english-speakers.html',slug)
    p=re.sub(r"<title>.*?</title>",f"<title>{html.escape(title)}</title>",p,count=1)
    for k in ['<meta name="description" content=".*?">','<meta property="og:description" content=".*?">']:
        tag=k.split(' content')[0]; p=re.sub(k,f'{tag} content="{html.escape(desc)}">',p,count=1)
    p=re.sub(r'<meta property="og:title" content=".*?">',f'<meta property="og:title" content="{html.escape(title)}">',p,count=1)
    ld={"@context":"https://schema.org","@graph":[{"@type":"Article","headline":headline,"description":desc,"url":url,"datePublished":TODAY,"dateModified":TODAY,"author":{"@type":"Organization","name":"U Hirable","url":B},"publisher":{"@type":"Organization","name":"U Hirable","url":B,"logo":{"@type":"ImageObject","url":B+"favicon.png"}},"mainEntityOfPage":url,"inLanguage":"en"},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":B},{"@type":"ListItem","position":2,"name":"Career Guides","item":B+"guides.html"},{"@type":"ListItem","position":3,"name":headline,"item":url}]},
      {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faq]}]}
    p=re.sub(r'<script type="application/ld\+json">.*?</script>',lambda m:'<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False)+'</script>',p,count=1,flags=re.S)
    main=f'''<main>
    <section class="page-hero">
      <div class="shapes" aria-hidden="true"><div class="sphere gold s1"></div><div class="sphere s3"></div><div class="ring"></div></div>
      <div class="container">
        <span class="eyebrow"><span class="dot"></span> {eyebrow}</span>
        <h1>{html.escape(h1)}</h1>
        <p>{html.escape(lead)}</p>
      </div>
    </section>
    <section class="page-body">
      <div class="container">
        <div class="gd">
          {NOTE}
{body1}
        </div>
        {jobs}
        <div class="gd">
          <h2>Questions people ask</h2>{faq_html(faq)}
{body2}
        </div>
      </div>
    </section>
  '''
    i=p.index('<main>'); j=p.index('</main>'); p=p[:i]+main+p[j:]
    assert 'english-speakers' not in p.replace('href="jobs-in-germany-for-english-speakers-KEEP','') or True
    open(slug,'w',encoding='utf-8').write(p); return slug
KEEP='jobs-in-germany-for-english-speakers.html'
KEEP='jobs-in-germany-for-english-speakers.html'
LINKS={'germany-shortage-occupations.html':'Germany shortage occupations list','germany-opportunity-card.html':'Germany Opportunity Card','nurse-jobs-in-germany.html':'Nurse jobs in Germany','doctor-jobs-in-germany.html':'Doctor jobs in Germany','engineering-jobs-in-germany.html':'Engineering jobs in Germany','it-jobs-in-germany.html':'IT jobs in Germany','pharmacist-jobs-in-germany.html':'Pharmacist jobs in Germany','dentist-jobs-in-germany.html':'Dentist jobs in Germany','teacher-jobs-in-germany.html':'Teacher jobs in Germany','architect-jobs-in-germany.html':'Architect jobs in Germany',KEEP:'Jobs in Germany for English speakers','german-cv-format.html':'German CV format','guides.html':'All career guides'}
def links(me): return '<p>'+' · '.join(f'<a href="{u}">{t}</a>' for u,t in LINKS.items() if u!=me)+'</p>'
# ---------- hub
faq=[("What is a shortage occupation in Germany?","An occupation on the official list published under Section 18g of the Residence Act. If your job is on the list, a lower salary is enough for the EU Blue Card: €45,934.20 gross a year in 2026 instead of €50,700."),
     ("Does being on the list mean I get a visa?","No. The list only lowers the salary threshold. You still need a recognised qualification, a job offer in Germany that matches it, and a salary at or above the threshold. Regulated professions such as nursing, medicine and teaching also need a licence to practise."),
     ("How many occupations are on the list?",f"The English list on the Make it in Germany portal names {NOCC} occupations with four-digit ISCO-08 codes, across managers, science and engineering, health, teaching and IT."),
     ("Can IT specialists without a degree use the lower threshold?","Yes. IT specialists with at least three years of comparable professional experience can qualify for the EU Blue Card without a university degree, with a gross salary of at least €45,934.20 a year in 2026.")]
b1=f'''          <p class="gd-answer">Germany publishes an official list of shortage occupations. If your job is on it, you can get an EU Blue Card with a lower salary: at least €45,934.20 gross a year in 2026, instead of €50,700 for other jobs. The list covers {NOCC} occupations in management, science and engineering, health, teaching and IT. The full list is below, with the official ISCO-08 codes.</p>

          <h2>What the list changes for you</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>If your job is on the list</th><th>If it is not</th></tr>
            <tr><td>EU Blue Card</td><td>Gross salary of at least €45,934.20 a year in 2026.</td><td>Gross salary of at least €50,700 a year in 2026.</td></tr>
            <tr><td>EU Blue Card for IT specialists without a degree</td><td>At least three years of comparable professional experience and a gross salary of at least €45,934.20 a year.</td><td>Not available outside IT.</td></tr>
            <tr><td>Opportunity Card</td><td>The official list says the job titles on it also matter for the points system.</td><td>You can still apply if you reach six points another way.</td></tr>
          </table></div>
          <p>The list does not replace the other conditions. You still need a recognised qualification and a job offer in Germany that matches it. In regulated professions, such as nursing, medicine, pharmacy and school teaching, you also need a licence to practise.</p>
'''
for name,gs in GROUPS:
    b1+=f'\n          <h2>{name}</h2>\n          {table(gs)}\n'
b1+='          <p>The codes come from ISCO-08, the international classification of occupations. The German authorities decide which code your job offer falls under, so a similar job title is not a guarantee.</p>\n'
b2=links('germany-shortage-occupations.html')+f'''
          <h2>Sources</h2><ul class="gd-src">{SRC_LIST}{SRC_ACT}</ul>'''
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="engineer" data-title="Live jobs in Germany" data-sub="Search starts with the word engineer. Change it to your job title. Every card opens the original ad." data-page="de-shortage"></section>'
build('germany-shortage-occupations.html',"Germany Shortage Occupations List 2026: Jobs & Blue Card Pay",
      f"The official list of {NOCC} shortage occupations in Germany, the lower EU Blue Card salary for them in 2026 (€45,934.20), and live jobs in Germany.",
      "Career guide · Germany","Germany shortage occupations list 2026","The official list of jobs that qualify for the lower EU Blue Card salary, grouped by field, with live jobs in Germany.",b1,jobs,b2,faq,"Germany shortage occupations list 2026")
# ---------- nurses
faq=[("Can foreign nurses work in Germany?","Yes. Nursing is a regulated profession, so a nurse trained outside the EU needs the foreign qualification recognised in Germany and a licence to practise before working as a nurse. Nurses trained in EU and EFTA countries generally get automatic recognition."),
     ("What German level do nurses need?","The official portal states at least level B2 for recognition. Its guidance for employers says B1 or B2, depending on the federal state. Plan for B2."),
     ("Is nursing on Germany's shortage occupation list?","Yes. Nursing professionals (ISCO code 2221) and midwifery professionals (2222) are on the official list of shortage occupations. The usual route for nurses is still recognition plus a work visa for qualified professionals."),
     ("What if my nursing qualification is not fully equivalent?","A knowledge test or an adaptation period can close the gap. A visa for the recognition of foreign qualifications may let you do this in Germany.")]
b1='''          <p class="gd-answer">Yes, foreign nurses can work in Germany, and nursing is on the official list of shortage occupations. Nursing is a regulated profession, so if you trained outside the EU you need three things: your qualification recognised in Germany, a licence to practise, and German at level B2. With full recognition and a job offer you can apply for a work visa. If the recognition body finds gaps, you can close them in Germany with a knowledge test or an adaptation period.</p>

          <h2>What you need</h2>
          <div class="gd-tw"><table>
            <tr><th>Requirement</th><th>What it means</th></tr>
            <tr><td>Recognition of your qualification</td><td>The recognition body in Germany checks whether your nursing qualification, which can also be a university degree, is equivalent to the German one. What counts is where you trained, not your nationality.</td></tr>
            <tr><td>Licence to practise</td><td>Nursing is a regulated profession. To work as a nurse long term you need official authorisation, and your job title will be Pflegefachfrau, Pflegefachmann or Pflegefachperson.</td></tr>
            <tr><td>German language</td><td>At least level B2 for recognition. The official guidance for employers says B1 or B2, depending on the federal state.</td></tr>
            <tr><td>Job offer</td><td>The work visa is issued only if you have a specific job as a nurse in Germany.</td></tr>
          </table></div>

          <h2>The visa routes for nurses</h2>
          <div class="gd-tw"><table>
            <tr><th>Your situation</th><th>Route</th></tr>
            <tr><td>Full recognition, licence to practise and a job offer</td><td>Work visa for qualified professionals.</td></tr>
            <tr><td>The recognition body finds gaps in your qualification</td><td>A knowledge test or an adaptation period closes the gap. A visa for the recognition of foreign qualifications lets you do this in Germany.</td></tr>
            <tr><td>Recognised, but no job yet</td><td>The Opportunity Card for job seekers, if you meet its conditions.</td></tr>
          </table></div>
          <p>Nurses trained in EU and EFTA countries generally receive automatic recognition.</p>

          <h2>How to apply</h2>
          <ol class="gd-steps">
            <li><b>Start recognition early.</b> Apply to the competent recognition body in Germany and wait for its decision before you plan the move.</li>
            <li><b>Learn German to B2.</b> You need a recognised language certificate for recognition.</li>
            <li><b>Search with the German job title.</b> Most adverts use Pflegefachkraft, Pflegefachfrau or Pflegefachmann, not the word nurse.</li>
            <li><b>Get the job offer in writing.</b> You need the signed contract for the visa.</li>
            <li><b>Apply for the visa</b> at the German embassy in your country, with your recognition notice and contract.</li>
          </ol>
'''
b2=links('nurse-jobs-in-germany.html')+f'''
          <h2>Sources</h2><ul class="gd-src"><li><a href="https://www.make-it-in-germany.com/en/working-in-germany/professions-in-demand/nursing" target="_blank" rel="noopener">Make it in Germany: nursing professionals</a></li><li><a href="https://www.make-it-in-germany.com/en/recruiting-nursing-professionals-from-abroad-for-the-german-labour-market" target="_blank" rel="noopener">Make it in Germany: recruiting nursing professionals from abroad</a></li>{SRC_LIST}{SRC_ACT}</ul>'''
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="Pflegefachkraft" data-title="Live nursing jobs in Germany" data-sub="Search starts with Pflegefachkraft, the German job title for a nurse. Every card opens the original ad." data-page="de-nurse"></section>'
build('nurse-jobs-in-germany.html',"Nurse Jobs in Germany for Foreign Nurses (2026): Visa & Rules",
      "How nurses from outside the EU can work in Germany in 2026: recognition, licence, German B2, the visa routes, and live nursing jobs in Germany.",
      "Career guide · Germany","Nurse jobs in Germany for foreign nurses","What a nurse trained abroad needs to work in Germany in 2026, the visa routes, and live nursing jobs.",b1,jobs,b2,faq,"Nurse jobs in Germany for foreign nurses")


SRC=lambda u,t: f'<li><a href="{u}" target="_blank" rel="noopener">{t}</a></li>'
def codes(c): 
    out=[]
    for _,gs in GROUPS:
        for g,n,occ in gs:
            if g in c: out+= [f"{x} ({k})" for k,x in occ]
    return out
def ul(items): return '<ul>'+''.join(f'<li>{html.escape(i)}</li>' for i in items)+'</ul>'
BC='<tr><td>EU Blue Card</td><td>A recognised university degree and a job offer that matches it. Gross salary of at least €45,934.20 a year in 2026 for shortage occupations, or €50,700 for other jobs.</td></tr>'
# ---------- doctors
faq=[("Can foreign doctors work in Germany?","Yes. A doctor trained abroad needs the Approbation, the official licence to practise medicine in Germany. Without it you may not treat patients as an on-duty doctor."),
     ("What German level do doctors need?","General German at level B2 is the minimum in all federal states. A medical language test based on level C1 is usually required as well."),
     ("Are doctors on Germany's shortage occupation list?","Yes. Generalist medical practitioners (ISCO code 2211) and specialist medical practitioners (2212) are on the official list, so the lower EU Blue Card salary of €45,934.20 a year applies in 2026."),
     ("Who issues the licence to practise?","The medical licensing authority (Approbationsbehörde) of the federal state where you want to work. The German Medical Association publishes a list of these authorities.")]
b1=f"""          <p class="gd-answer">Yes, doctors trained abroad can work in Germany, and doctors are on the official list of shortage occupations. You need the Approbation, the licence to practise medicine. To get it, your medical training must be recognised as equivalent to the German one, and you need German at level B2 plus, usually, a medical language test based on C1. About 71,480 foreign doctors worked in Germany in 2025.</p>

          <h2>What you need for the Approbation</h2>
          <div class="gd-tw"><table>
            <tr><th>Requirement</th><th>What it means</th></tr>
            <tr><td>Equivalent training</td><td>Your medical education and training must be recognised as equivalent to the German programme. If the authority asks for further qualifications, a visa for the recognition of foreign qualifications may be an option.</td></tr>
            <tr><td>German language</td><td>General German at level B2 is the minimum in all federal states. A medical language test based on C1 is usually required.</td></tr>
            <tr><td>Physical fitness</td><td>Proof from your home country, or a medical certificate issued in Germany.</td></tr>
            <tr><td>Personal suitability</td><td>A certificate of good conduct or good standing from your home country, or a German Führungszeugnis.</td></tr>
          </table></div>
          <p>A foreign specialisation can be recognised only after the licence has been granted. The recognition assessment generally takes three to four months.</p>

          <h2>The visa routes for doctors</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>Key requirement</th></tr>
            <tr><td>Work visa for qualified professionals</td><td>Recognised qualification and a job offer in Germany.</td></tr>
            {BC}
            <tr><td>Visa for the recognition of foreign qualifications</td><td>For doctors whose recognition needs further qualifications in Germany.</td></tr>
            <tr><td>Visa for research</td><td>For doctors who want to work in research.</td></tr>
          </table></div>
          <p>Citizens of EU and EFTA countries do not need a visa or residence permit to work in Germany. About 446,100 doctors work in Germany, and 52,360 of the foreign doctors come from non-EU countries.</p>

          <h2>How to apply</h2>
          <ol class="gd-steps">
            <li><b>Apply for the Approbation.</b> Contact the medical licensing authority of the federal state where you want to work.</li>
            <li><b>Reach B2 German,</b> then prepare for the medical language test.</li>
            <li><b>Search with the German job titles.</b> Adverts use Arzt, Ärztin, Assistenzarzt or Facharzt.</li>
            <li><b>Get the job offer in writing</b> and apply for the visa at the German embassy in your country.</li>
          </ol>
"""
b2=links('doctor-jobs-in-germany.html')+'\n          <h2>Sources</h2><ul class="gd-src">'+SRC('https://www.make-it-in-germany.com/en/working-in-germany/professions-in-demand/physicians','Make it in Germany: physicians')+SRC_LIST+SRC_ACT+'</ul>'
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="Arzt" data-title="Live doctor jobs in Germany" data-sub="Search starts with Arzt, the German word for doctor. Every card opens the original ad." data-page="de-doctor"></section>'
build('doctor-jobs-in-germany.html',"Doctor Jobs in Germany for Foreign Doctors (2026): Licence & Visa",
      "How doctors trained abroad can work in Germany in 2026: the Approbation licence, German B2 and the medical language test, visa routes, and live jobs.",
      "Career guide · Germany","Doctor jobs in Germany for foreign doctors","What a doctor trained abroad needs to work in Germany in 2026, the visa routes, and live doctor jobs.",b1,jobs,b2,faq,"Doctor jobs in Germany for foreign doctors")
# ---------- engineers
eng=codes(['214','215','216'])
faq=[("Are engineers on Germany's shortage occupation list?","Yes. The official list includes civil, mechanical, electrical, electronics, telecommunications, chemical, environmental, industrial and mining engineers, as well as architects and planners."),
     ("What salary do engineers need for an EU Blue Card in 2026?","At least €45,934.20 gross a year if your occupation is on the shortage list, which covers the engineering occupations named on this page. For other jobs the threshold is €50,700."),
     ("Do engineers need to speak German?","The official portal says German is not mandatory to work as an engineer, but speaking it makes entering the labour market and daily life easier."),
     ("Can I go to Germany to look for an engineering job?","Yes, with the Opportunity Card for job seekers, if you meet its conditions.")]
b1=f"""          <p class="gd-answer">Engineers from outside the EU can work in Germany with an EU Blue Card or a work visa for qualified professionals, and most engineering occupations are on the official shortage list. That means a lower Blue Card salary: at least €45,934.20 gross a year in 2026. German is not mandatory to work as an engineer, but it helps.</p>

          <h2>Engineering occupations on the shortage list</h2>
          {ul(eng)}
          <p>The codes are the official ISCO-08 codes. The German authorities decide which code your job offer falls under.</p>

          <h2>Where engineers are in demand</h2>
          {ul(["Automation technology","Construction planning and supervision, and architecture","The automotive industry, including electromobility and autonomous driving","Renewable energies and environmental protection","Artificial intelligence","Research and development, with many vacancies in higher positions"])}

          <h2>The visa routes for engineers</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>Key requirement</th></tr>
            {BC}
            <tr><td>Work visa for qualified professionals</td><td>Recognised qualification and a job offer in Germany.</td></tr>
            <tr><td>Opportunity Card</td><td>To look for a job in Germany for up to one year. See the <a href="germany-opportunity-card.html">Opportunity Card guide</a>.</td></tr>
            <tr><td>Visa for research</td><td>For research-oriented engineers.</td></tr>
          </table></div>
          <p>Citizens of the EU, the EEA and Switzerland do not need a visa or residence permit to work in Germany.</p>
"""
b2=links('engineering-jobs-in-germany.html')+'\n          <h2>Sources</h2><ul class="gd-src">'+SRC('https://www.make-it-in-germany.com/en/working-in-germany/professions-in-demand/engineers','Make it in Germany: engineers')+SRC_LIST+SRC_ACT+'</ul>'
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="engineer" data-title="Live engineering jobs in Germany" data-sub="Search starts with the word engineer. Try Ingenieur for adverts in German. Every card opens the original ad." data-page="de-engineer"></section>'
build('engineering-jobs-in-germany.html',"Engineering Jobs in Germany for Foreigners (2026): Visa & Salary",
      "How engineers from outside the EU can work in Germany in 2026: which engineering jobs are on the shortage list, the Blue Card salary, and live jobs.",
      "Career guide · Germany","Engineering jobs in Germany for foreigners","Which engineering jobs are on Germany's shortage list, the 2026 visa routes, and live engineering jobs.",b1,jobs,b2,faq,"Engineering jobs in Germany for foreigners")
# ---------- IT
it=codes(['251','252'])
faq=[("Can I work in IT in Germany without a degree?","Yes. IT specialists without a university degree can get an EU Blue Card with at least three years of work experience in a similar profession within the last seven years, a job offer, and a gross salary of at least €45,934.20 a year in 2026."),
     ("Are IT jobs on Germany's shortage occupation list?","Yes. Software developers, systems analysts, web developers, applications programmers, database administrators, systems administrators and network professionals are on the official list."),
     ("What salary do IT professionals need for an EU Blue Card in 2026?","At least €45,934.20 gross a year for the IT occupations on the shortage list. For jobs that are not on the list the threshold is €50,700."),
     ("How many IT jobs are open in Germany?","The official portal reports that around 109,000 positions in the IT sector remained vacant in 2025.")]
b1=f"""          <p class="gd-answer">IT professionals from outside the EU can work in Germany with an EU Blue Card, and the main IT occupations are on the official shortage list, so the lower salary applies: at least €45,934.20 gross a year in 2026. You can qualify even without a university degree if you have at least three years of IT experience in the last seven years. Around 109,000 IT positions were vacant in Germany in 2025.</p>

          <h2>IT occupations on the shortage list</h2>
          {ul(it+["Information and communications technology service managers (1330)","Information technology trainers (2356)"])}

          <h2>The visa routes for IT professionals</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>Key requirement</th></tr>
            {BC}
            <tr><td>EU Blue Card without a degree</td><td>At least three years of work experience in a similar profession within the last seven years, a job offer, and a gross salary of at least €45,934.20 a year in 2026.</td></tr>
            <tr><td>Work visa for IT specialists with experience</td><td>At least two years of IT experience. No degree, vocational qualification or German language proof is required for the visa. Gross salary of at least €45,934.20 a year, or pay under a collective agreement.</td></tr>
            <tr><td>Opportunity Card</td><td>To look for a job in Germany for up to one year. See the <a href="germany-opportunity-card.html">Opportunity Card guide</a>.</td></tr>
          </table></div>

          <h2>Where IT people are in demand</h2>
          {ul(["Software development: designing and building applications or components","Application support for software and hardware, such as SAP or SharePoint","IT security","Data science"])}
"""
b2=links('it-jobs-in-germany.html')+'\n          <h2>Sources</h2><ul class="gd-src">'+SRC('https://www.make-it-in-germany.com/en/working-in-germany/professions-in-demand/career-it-specialists','Make it in Germany: IT specialists')+SRC('https://www.make-it-in-germany.com/en/visa-recognition/visa-types/other/it-professionals','Make it in Germany: visa for IT specialists')+SRC_LIST+SRC_ACT+'</ul>'
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="software developer" data-title="Live IT jobs in Germany" data-sub="Search starts with software developer. Change it to your job title. Every card opens the original ad." data-page="de-it"></section>'
build('it-jobs-in-germany.html',"IT Jobs in Germany for Foreigners (2026): Visa With or Without Degree",
      "How IT professionals from outside the EU can work in Germany in 2026: Blue Card salary, the route without a degree, shortage list jobs, and live IT jobs.",
      "Career guide · Germany","IT jobs in Germany for foreigners","The 2026 visa routes for software and IT people, with or without a degree, and live IT jobs in Germany.",b1,jobs,b2,faq,"IT jobs in Germany for foreigners")
# ---------- opportunity card
faq=[("How many points do I need for the Opportunity Card?","At least six points, if your qualification is not fully recognised in Germany. If it is fully recognised, or you qualified in Germany, you do not need points."),
     ("How much money do I need for the Opportunity Card in 2026?","A blocked bank account with at least €1,091 net per month, or a declaration of commitment from someone in Germany."),
     ("Can I work with an Opportunity Card?","Yes. You can do one or more part-time jobs totalling 20 hours a week, and trial work of up to two weeks per employer."),
     ("How long is the Opportunity Card valid?","Up to one year for the job search. If you find a qualifying job but cannot get another residence title, it can be extended for up to two years."),
     ("Where do I apply?","Online through the Consular Services Portal of the Federal Foreign Office. If you already live in Germany with a valid residence title, contact your local foreigners authority.")]
b1="""          <p class="gd-answer">The Opportunity Card (Chancenkarte) lets you move to Germany for up to one year to look for a job, without a job offer. There are two ways to get it: a qualification that is fully recognised in Germany, or at least six points in the points system. In both cases you need to show you can pay for your stay: at least €1,091 net per month in a blocked account in 2026, or a declaration of commitment.</p>

          <h2>Two ways to qualify</h2>
          <div class="gd-tw"><table>
            <tr><th>Option</th><th>What you need</th></tr>
            <tr><td>1. Recognised qualification</td><td>A foreign vocational or academic qualification that is fully recognised in Germany, or a qualification obtained in Germany. No points and no language proof are required.</td></tr>
            <tr><td>2. Points system</td><td>A completed vocational or academic qualification recognised in the country where you got it (vocational training of at least two years), German at level A1 or English at level B2, and at least six points.</td></tr>
          </table></div>

          <h2>The points table</h2>
          <div class="gd-tw"><table>
            <tr><th>Criterion</th><th>Points</th></tr>
            <tr><td>Your qualification is partially equivalent to a German one</td><td>4</td></tr>
            <tr><td>Work experience related to your qualification: at least 5 years in the last 7</td><td>3</td></tr>
            <tr><td>Work experience related to your qualification: at least 2 years in the last 5</td><td>2</td></tr>
            <tr><td>German at level B2 or above</td><td>3</td></tr>
            <tr><td>German at level B1</td><td>2</td></tr>
            <tr><td>German at level A2</td><td>1</td></tr>
            <tr><td>English at level C1 or above, or native speaker</td><td>1</td></tr>
            <tr><td>Age under 35</td><td>2</td></tr>
            <tr><td>Age 35 to 40</td><td>1</td></tr>
            <tr><td>Your occupation is on the <a href="germany-shortage-occupations.html">shortage list</a></td><td>1</td></tr>
            <tr><td>At least 6 continuous months of legal stay in Germany in the last 5 years (not tourism)</td><td>1</td></tr>
            <tr><td>Your spouse or partner also meets the Opportunity Card requirements</td><td>1</td></tr>
          </table></div>

          <h2>What you can do with it</h2>
          <ul><li>Look for a job or self-employment in Germany for up to one year.</li><li>Work part-time, up to 20 hours a week in total.</li><li>Do trial work for up to two weeks per employer.</li><li>Extend it for up to two years if you find a qualifying job but cannot get another residence title.</li></ul>

          <h2>How to apply</h2>
          <ol class="gd-steps">
            <li><b>Use the official self-check</b> on Make it in Germany to estimate your points.</li>
            <li><b>Get proof of your qualification.</b> For a degree, a positive anabin result or a Statement of Comparability.</li>
            <li><b>Arrange proof of funds:</b> a blocked account or a declaration of commitment.</li>
            <li><b>Apply online</b> through the Consular Services Portal of the Federal Foreign Office. The visa fee is €75.</li>
          </ol>
"""
b2=links('germany-opportunity-card.html')+'\n          <h2>Sources</h2><ul class="gd-src">'+SRC('https://www.make-it-in-germany.com/en/visa-recognition/opportunity-card/job-search-opportunity-card','Make it in Germany: Opportunity Card for job seekers, requirements and points system')+SRC('https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_EN/Chancenkarte_zur_Jobsuche_EN.pdf','Make it in Germany: Opportunity Card at a glance, January 2026 (PDF)')+SRC('https://digital.diplo.de/Chancenkarte','Federal Foreign Office: apply online for the Opportunity Card')+'</ul>'
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="english" data-title="Live jobs in Germany" data-sub="Search starts with the word English. Change it to your job title. Every card opens the original ad." data-page="de-opp-card"></section>'
build('germany-opportunity-card.html',"Germany Opportunity Card 2026 (Chancenkarte): Points & Requirements",
      "Germany's Opportunity Card (Chancenkarte) in 2026: the full points table, the €1,091 a month proof of funds, what work is allowed, and how to apply.",
      "Career guide · Germany","Germany Opportunity Card 2026 (Chancenkarte)","Move to Germany for up to a year to look for a job: who qualifies, the points table and how to apply.",b1,jobs,b2,faq,"Germany Opportunity Card 2026 (Chancenkarte)")


RID=SRC('https://www.anerkennung-in-deutschland.de/html/en/index.php','Recognition in Germany: the federal government\'s portal for foreign professional qualifications')
def health(slug,noun,Noun,de,code,q,srcs,extra_faq,extra_row=''):
    faq=[(f"Can foreign {noun}s work in Germany?",f"Yes. {Noun} is a regulated profession in Germany, so you need the Approbation, the state licence to practise. You can get it with a qualification from outside the EU if your training is recognised as equivalent and you meet the other requirements."),
         (f"What German level do {noun}s need?","Usually general German at level B2 plus a professional language test at level C1, taken during the licence procedure."),
         (f"Are {noun}s on Germany's shortage occupation list?",f"Yes. {Noun}s (ISCO code {code}) are on the official list, so the lower EU Blue Card salary of €45,934.20 a year applies in 2026."),
         ("Can I apply for the licence from abroad?","Yes. The official service descriptions say you can submit the application from abroad.")]+extra_faq
    b1=f"""          <p class="gd-answer">Yes, {noun}s trained outside the EU can work in Germany, and {noun}s are on the official list of shortage occupations. The profession is regulated: you need the Approbation, the state licence to practise. For that, your training must be recognised as equivalent to the German one, and you usually need German at level B2 plus a professional language test at level C1.</p>

          <h2>What you need for the Approbation</h2>
          <div class="gd-tw"><table>
            <tr><th>Requirement</th><th>What it means</th></tr>
            <tr><td>Equivalent training</td><td>The competent authority checks whether your training as a {noun} matches the German training.</td></tr>
            <tr><td>German language</td><td>Usually general German at level B2 and professional language skills at level C1, shown in a language test during the procedure. The B2 certificate can often be handed in later.</td></tr>
            <tr><td>Health suitability</td><td>You are physically and mentally fit to work as a {noun}.</td></tr>
            <tr><td>Reliability</td><td>No criminal record that makes you unfit for the profession.</td></tr>{extra_row}
          </table></div>
          <p>The Approbation is issued by the authority of the federal state where you want to work. The German job title is {de}.</p>

          <h2>The visa routes</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>Key requirement</th></tr>
            <tr><td>Work visa for qualified professionals</td><td>Recognised qualification and a job offer in Germany.</td></tr>
            {BC}
            <tr><td>Visa for the recognition of foreign qualifications</td><td>If the authority asks for further qualifications in Germany before it can grant the licence.</td></tr>
            <tr><td>Opportunity Card</td><td>To look for a job in Germany for up to one year. See the <a href="germany-opportunity-card.html">Opportunity Card guide</a>.</td></tr>
          </table></div>
"""
    b2=links(slug)+'\n          <h2>Sources</h2><ul class="gd-src">'+srcs+RID+SRC_LIST+SRC_ACT+'</ul>'
    jobs=f'<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="{q}" data-title="Live {noun} jobs in Germany" data-sub="Search starts with {q}, the German job title. Every card opens the original ad." data-page="de-{noun}"></section>'
    build(slug,f"{Noun} Jobs in Germany for Foreigners (2026): Licence & Visa",
      f"How {noun}s trained abroad can work in Germany in 2026: the Approbation licence, German B2 and C1 language test, visa routes, and live jobs.",
      "Career guide · Germany",f"{Noun} jobs in Germany for foreigners",f"What a {noun} trained abroad needs to work in Germany in 2026, the visa routes, and live jobs.",b1,jobs,b2,faq,f"{Noun} jobs in Germany for foreigners")
health('pharmacist-jobs-in-germany.html','pharmacist','Pharmacist','Apothekerin or Apotheker','2262','Apotheker',
  SRC('https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99150046001000/herausgeber/TH-211295732/region/160000000000','Federal administration portal: Approbation as a pharmacist with a third-country qualification (German)')+SRC('https://rp.baden-wuerttemberg.de/themen/bildung/ausbildung/seiten/auslaendische-abschluesse-akad/pharmazie-ausland/en','Baden-Württemberg regional council: pharmacy qualifications from abroad'),
  [("Can I use a specialist pharmacist title from abroad?","Only after you have the Approbation as a pharmacist. Recognition of a specialised title is a separate application.")])
health('dentist-jobs-in-germany.html','dentist','Dentist','Zahnärztin or Zahnarzt','2261','Zahnarzt',
  SRC('https://www.hamburg.de/service/info/11985368/n0/','City of Hamburg: Approbation as a dentist with a third-country qualification (German)')+SRC('https://rp.baden-wuerttemberg.de/themen/bildung/ausbildung/seiten/zahnarzt-ausland/en','Baden-Württemberg regional council: dentistry qualifications from abroad'),
  [("Is the dentist licence valid in all of Germany?","Yes. The Approbation is granted without a time limit and is valid across the whole of Germany.")])
# ---------- teachers
tcodes=codes(['231','232','233','234','235'])
faq=[("Can foreign teachers work in Germany?","Yes. Teaching at state schools is a regulated profession, so a teacher trained abroad applies for recognition in the federal state where they want to work."),
     ("Who recognises a foreign teaching qualification?","The authority of the federal state you choose. It compares your qualification with the teaching qualification of that state. Rules differ from state to state."),
     ("What German level do teachers need?","The state authority sets the level and tells you which one applies. Berlin, for example, asks for level C2."),
     ("Are teachers on Germany's shortage occupation list?","Yes. University, vocational, secondary, primary and early childhood teachers, and several other teaching professionals, are on the official list."),
     ("Does recognition give me a job?","No. With recognition you can apply for a teaching position in that federal state. That is a separate procedure.")]
b1=f"""          <p class="gd-answer">Yes, teachers trained abroad can work in Germany, and teaching professions are on the official list of shortage occupations. Teaching at state schools is regulated by each federal state. You apply for recognition in the state where you want to work, the authority compares your qualification with that state's teaching qualification, and it tells you the German level you need. You can apply from abroad.</p>

          <h2>How recognition works</h2>
          <ol class="gd-steps">
            <li><b>Choose a federal state.</b> Recognition is decided by the state where you want to teach, and the rules differ between states.</li>
            <li><b>Apply for recognition.</b> The authority compares your qualification with the teaching qualification in that state. You can apply from abroad.</li>
            <li><b>Close any gaps.</b> If there are substantial differences, you can usually take a compensation measure, such as an adaptation course or an aptitude test. In Berlin the adaptation course generally takes 18 months.</li>
            <li><b>Prove your German.</b> The authority tells you the level. Berlin asks for level C2.</li>
            <li><b>Apply for a teaching post.</b> This is a separate procedure, where health suitability and the other requirements are checked.</li>
          </ol>

          <h2>Teaching occupations on the shortage list</h2>
          {ul(tcodes)}

          <h2>The visa routes for teachers</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>Key requirement</th></tr>
            <tr><td>Work visa for qualified professionals</td><td>Recognised qualification and a job offer in Germany.</td></tr>
            {BC}
            <tr><td>Visa for the recognition of foreign qualifications</td><td>To complete a compensation measure in Germany.</td></tr>
            <tr><td>Opportunity Card</td><td>To look for a job in Germany for up to one year. See the <a href="germany-opportunity-card.html">Opportunity Card guide</a>.</td></tr>
          </table></div>
"""
b2=links('teacher-jobs-in-germany.html')+'\n          <h2>Sources</h2><ul class="gd-src">'+SRC('https://service.berlin.de/dienstleistung/329595/en/','State of Berlin: applying for recognition of foreign professional qualifications as a teacher')+SRC('https://www.berlin.de/sen/bjf/anerkennung/lehramtsabschluesse/english/','Berlin Senate Department for Education: recognition of qualifications as a teacher')+SRC('https://www.service.bremen.de/dienstleistungen/apply-for-recognition-as-a-teacher-with-professional-qualifications-from-third-countries-184343','State of Bremen: recognition as a teacher with a third-country qualification')+RID+SRC_LIST+'</ul>'
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="teacher" data-title="Live teaching jobs in Germany" data-sub="Search starts with the word teacher. Try Lehrer or Lehrkraft for adverts in German. Every card opens the original ad." data-page="de-teacher"></section>'
build('teacher-jobs-in-germany.html',"Teacher Jobs in Germany for Foreigners (2026): Recognition & Visa",
      "How teachers trained abroad can work in Germany in 2026: recognition by federal state, German level, compensation measures, visa routes, and live jobs.",
      "Career guide · Germany","Teacher jobs in Germany for foreigners","How a teacher trained abroad gets recognised in Germany, the visa routes, and live teaching jobs.",b1,jobs,b2,faq,"Teacher jobs in Germany for foreigners")
# ---------- architects
acodes=codes(['216'])
faq=[("Can foreign architects work in Germany?","Yes. You can work in planning, for example as an employee in an architecture office, without being registered. To use the title Architekt and to submit building plans you must be entered in the list of architects of a state chamber."),
     ("Is architect a protected title in Germany?","Yes. Architect, interior architect, landscape architect and urban planner are protected titles. You may use them only after registration with the chamber of architects of your federal state."),
     ("Who recognises a foreign architecture qualification?","The chamber of architects of the federal state where you want to work. It compares your qualification with the German one."),
     ("Are architects on Germany's shortage occupation list?","Yes. Building architects (ISCO code 2161), landscape architects (2162) and town and traffic planners (2164) are on the official list.")]
b1=f"""          <p class="gd-answer">Yes, architects trained abroad can work in Germany, and architects are on the official list of shortage occupations. You do not need registration to work in planning as an employee. But the title Architekt is protected: to use it, and to submit building plans, you must be entered in the list of architects of the chamber in your federal state.</p>

          <h2>With and without registration</h2>
          <div class="gd-tw"><table>
            <tr><th></th><th>Without registration</th><th>Registered with the chamber</th></tr>
            <tr><td>Work in an architecture office</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>Use the title Architekt</td><td>No</td><td>Yes</td></tr>
            <tr><td>Submit building plans</td><td>No</td><td>Yes</td></tr>
          </table></div>
          <p>The chamber of architects in each federal state compares your foreign qualification with the German one and decides on registration. Registration usually also requires practical professional experience, so check the rules of the chamber in your state.</p>

          <h2>Occupations in this group on the shortage list</h2>
          {ul(acodes)}

          <h2>The visa routes for architects</h2>
          <div class="gd-tw"><table>
            <tr><th>Route</th><th>Key requirement</th></tr>
            {BC}
            <tr><td>Work visa for qualified professionals</td><td>Recognised qualification and a job offer in Germany.</td></tr>
            <tr><td>Opportunity Card</td><td>To look for a job in Germany for up to one year. See the <a href="germany-opportunity-card.html">Opportunity Card guide</a>.</td></tr>
          </table></div>
"""
b2=links('architect-jobs-in-germany.html')+'\n          <h2>Sources</h2><ul class="gd-src">'+SRC('https://service.berlin.de/dienstleistung/355420/','State of Berlin: entry in the list of architects with a foreign professional qualification (German)')+SRC('https://www.hamburg.de/service/info/11414454/','City of Hamburg: recognition as an architect with a qualification from abroad (German)')+SRC('https://www.akh.de/fileadmin/Mitgliedschaft/Mitglied_werden/Downloads/Acknowledgement_foreign_diploma-ENG.pdf','Hesse Chamber of Architects: recognition of foreign diplomas (PDF)')+RID+SRC_LIST+'</ul>'
jobs='<section id="cv-jobs" aria-label="Live jobs" data-cc="de" data-q="Architekt" data-title="Live architect jobs in Germany" data-sub="Search starts with Architekt, the German job title. Every card opens the original ad." data-page="de-architect"></section>'
build('architect-jobs-in-germany.html',"Architect Jobs in Germany for Foreigners (2026): Title & Visa",
      "How architects trained abroad can work in Germany in 2026: the protected title, chamber registration, visa routes, and live architect jobs.",
      "Career guide · Germany","Architect jobs in Germany for foreigners","When a foreign architect needs chamber registration in Germany, the visa routes, and live jobs.",b1,jobs,b2,faq,"Architect jobs in Germany for foreigners")
print('built all',NOCC)
