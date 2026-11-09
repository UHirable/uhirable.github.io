// CV vs Job Match Checker — runs 100% in the browser. Nothing is uploaded.
(() => {
  const $ = (s) => document.querySelector(s);
  const fileIn = $("#cm-file"), drop = $("#cm-drop"), fileOut = $("#cm-filestat"), cvText = $("#cm-cvtext"), jobTa = $("#cm-job"), go = $("#cm-go"), res = $("#cm-result"), err = $("#cm-err");
  const STOP = new Set(("the and for with that this from your you are our will have has not but can all any more than into over per via each new who their they them its was were been being also such as of to in on at by an a or is it be we us i we're you'll you're we'll about across after along among around because before between both during either every here how if may might must need other out own same should so some still then there these those through under until up very what when where which while why within without work working role team company looking join experience experienced years year strong ability able across including include etc plus required require requirements preferred bonus nice responsibilities responsible day days week weeks month months remote hybrid onsite on-site full-time part-time position candidate candidates ideal opportunity benefits salary apply application job jobs description skills skill knowledge understanding excellent good great best well high level senior junior lead mid build building develop developing drive driving help helping support supporting ensure ensuring manage managing own owning deliver delivering grow growing create creating make making use using used get got take takes").split(" "));
  const SYN = [["machine learning","ml"],["artificial intelligence","ai"],["javascript","js"],["typescript","ts"],["postgresql","postgres"],["kubernetes","k8s"],["gcp","google cloud"],["aws","amazon web services"],["azure","microsoft azure"],["power bi","powerbi"],["node.js","node","nodejs"],["react","react.js","reactjs"],["vue.js","vue"],["next.js","nextjs"],["c#","c sharp"],["llm","large language models","llms"],["nlp","natural language processing"],["crm","customer relationship management"],["seo","search engine optimization"],["ux","user experience"],["ui","user interface"],["business development","bdr"],["sdr","sales development"],["account executive","ae"],["p&l","profit and loss"],["fp&a","financial planning and analysis"],["kpis","key performance indicators","kpi"],["qa","quality assurance"],["ci/cd","continuous integration","ci"],["human resources","hr"],["bachelor's degree","bachelor","bachelors","bsc","ba"],["master's degree","master","masters","msc","mba"],["doctorate","phd"],["excel","microsoft excel","ms excel"],["google sheets","sheets"],["microsoft office","ms office"],["project management"],["product management","product manager"],["a/b testing","a/b tests","ab testing","experimentation"],["data visualization","dashboards","dashboard"],["communication","communication skills"],["problem solving","problem-solving"],["budgeting","budget","budgets"],["stakeholder management","stakeholder","stakeholders","cross-functional","cross functional"],["patient care","patient-centered care","bedside care"],["recruiting","recruitment","talent acquisition","hiring"],["english","fluent english"],["arabic","fluent arabic"]];
  const SKILLS = [".net","a/b testing","acca","account executive","account management","accounting","accounts payable","accounts receivable","acls","active directory","adobe","adobe photoshop","adobe xd","after effects","agile","airflow","aml","amplitude","analyst","analytics","android","angular","animation","ansible","api","applicant tracking","arabic","asana","ashby","ats","audit","autocad","aws","azure","b2b","b2c","backend","background checks","bamboohr","bank reconciliation","banking","barista","bash","bdr","benefits","bigquery","biotech","blender","bls","boolean search","brand management","bsn","budget","budgeting","bullhorn","c#","c++","call center","candidate experience","canva","cashier","celta","cerner","charting","chef","ci/cd","civil","claims","classroom management","clinical","closing","cma","coaching","cold calling","communication","community management","compensation","compliance","confluence","consulting","content","content marketing","controller","copywriting","cpa","credit","crm","css","curriculum development","customer service","customer success","customer support","cybersecurity","cypress","dashboards","data analyst","data engineer","data entry","data scientist","data visualization","databricks","dbt","deep learning","delta","demos","design","design systems","devops","dispatch","django","docker","driver","e-commerce","editing","elasticsearch","electrical","email marketing","employer branding","engineering manager","english","enterprise","epic","erp","etl","excel","executive search","facebook ads","figma","finance","financial modeling","financial reporting","fintech","flask","fleet","forecasting","fp&a","french","freshdesk","frontend","full stack","full-cycle recruiting","ga4","gaap","game","gcp","german","git","github actions","gitlab ci","google ads","google analytics","google classroom","google sheets","google workspace","graphql","greenhouse","hadoop","headhunting","healthcare","hospitality","hotjar","hr","hris","html","hubspot","hvac","icims","icu","ielts","ifrs","illustrator","inbound","infection control","inside sales","insurance","intercom","interviewing","inventory","inventory management","investment banking","ios","iso 9001","italian","itil","iv therapy","java","javascript","jenkins","jira","job descriptions","kafka","kanban","klaviyo","kotlin","kpis","kubernetes","kyc","laravel","lead generation","leadership","lean","learning and development","legal","lending","lesson planning","lever","linkedin","linkedin recruiter","linux","live chat","llm","logistics","looker","looker studio","machine learning","mailchimp","maintenance","marketing","matlab","mechanical","medication administration","mentoring","merchandising","meta ads","metabase","microservices","microsoft office","microsoft teams","microsoft word","mid-market","mixpanel","mobile","modeling","mongodb","moodle","mortgage","motion","mysql","negotiation","netsuite","next.js","nlp","node","notion","numpy","nurse","nursing","odoo","offer negotiation","office 365","okrs","onboarding","operations","oracle","outbound","outreach","pals","pandas","partnerships","patient assessment","patient care","payroll","performance management","pharma","phlebotomy","photoshop","php","pipedrive","pipeline","plc","pmp","postgresql","power apps","power automate","power bi","powerpoint","prds","premiere","presentation","prince2","private equity","problem solving","process improvement","procurement","product","product management","product manager","program manager","project management","project manager","prospecting","prototyping","python","pytorch","qa","quality assurance","quickbooks","quota","rails","react","real estate","recruiter","recruiting","redis","redshift","reporting","research","rest","rest apis","retail","risk","risk management","rn","roadmap","ruby","rust","saas","safety","sales","salesforce","sap","scada","scala","scikit-learn","screening","scrum","sdr","security","selenium","sem","seo","sharepoint","shopify","six sigma","sketch","sla","slack","smartrecruiters","snowflake","social media","solidworks","sourcing","spanish","spark","spring","spss","sql","sql server","stakeholder","stakeholder management","statistics","successfactors","supply chain","swift","tableau","talent","talent acquisition","talent pipeline","taleo","tax","tdd","teacher","teaching","team management","technical recruiting","technical support","tefl","tensorflow","terraform","tesol","testing","ticketing","tiktok ads","time management","toefl","training","trello","triage","troubleshooting","typescript","ui","underwriting","unit testing","unity","unreal","upselling","usability testing","user interviews","user research","ux","valuation","vat","vendor management","ventilator","video","vital signs","vue","warehouse","webflow","wireframing","wms","wordpress","workable","workday","wound care","writing","xero","zendesk","zoho","zoom"];
  // Phrase-level synonyms: things people write that imply a skill/keyword.
  for (const g of SYN) if (!SKILLS.includes(g[0])) SKILLS.push(g[0]);
  const INDUSTRY = new Set(["insurance","law","legal","security","product","content","video","design","research","game","mobile","safety","risk","credit","banking","finance","retail","healthcare","pharma","biotech","fintech","enterprise","hospitality","real estate","e-commerce","consulting","mortgage","lending","investment banking","private equity","mid-market","civil","mechanical","electrical","motion","animation","cloud","devops","data engineer","data scientist","data analyst","analyst","engineering manager","product manager","project manager","program manager","recruiter","teacher","nurse","driver","chef","barista","cashier","controller","talent","hr","testing","modeling","maintenance","dispatch","fleet","warehouse","claims","underwriting","compliance","audit","tax"]);
  const PHRASES = [[/\b(led|lead|managed|manage|supervised|supervise|mentored|coached|headed)\b[^.]{0,40}\b(team|people|engineers|analysts|staff|reports|members)\b/, "leadership"],[/\b(built|build|created|designed|developed|maintained)\b[^.]{0,30}\b(dashboards?|reports?|visuali[sz]ations?)\b/, "data visualization"],[/\b(a ?\/ ?b|ab) ?test/, "a/b testing"],[/\bpresent(ed|ing)?\b[^.]{0,30}\b(stakeholders?|leadership|executives?|clients?)\b/, "presentation"],[/\b(stakeholder|cross[- ]functional)\b/, "stakeholder management"],[/\b(hired|hiring|recruit(ed|ing)?|sourc(ed|ing))\b/, "recruiting"],[/\bsourc(e|ed|ing)\b/, "sourcing"],[/\b(golang|go lang|go programming|written in go|\(go\)|go\/|go,? (rust|python|java|c\+\+|kotlin))\b/, "golang"],[/\b(rstudio|r studio|r programming|r language|r markdown|tidyverse|ggplot|python and r|r and python|r,? sql|sql,? r|\(r\))\b/, "r"],[/\b(emergency room|emergency department|er nurse|a&e)\b/, "emergency room"],[/\b(machine learning|\bml models?|\bml engineer)\b/, "machine learning"],[/\b(artificial intelligence|\bai models?|\bai tools?|generative ai|gen ai)\b/, "artificial intelligence"],[/\b(managed|manage|led|lead|supervised|supervise|oversaw|oversee)\b[^.]{0,12}\b\d{1,4}\s+(riders|drivers|agents|staff|employees|people|nurses|engineers|developers|reps|sales|associates|workers|team members|direct reports)\b/, "leadership"],[/\b(interview(ed|ing)?|spoke with|talked to)\b[^.]{0,20}\b(users|customers)\b/, "user research"],[/\bvendors?\b/, "vendor management"],[/\binventor(y|ies)\b/, "inventory management"],[/\bkpis?\b/, "kpis"],[/\b(ci pipelines?|ci \/ cd|ci\/cd|continuous (integration|delivery|deployment)|github actions|gitlab ci|jenkins|circleci)\b/, "ci/cd"],[/\b(email (flows?|campaigns?|automation|sequences?)|klaviyo|mailchimp|newsletters?)\b/, "email marketing"],[/\b(inbound|outbound|qualified) leads?\b|\bprospecting\b|\bbooked meetings\b/, "lead generation"],[/\b(cold calls?|cold calling)\b/, "cold calling"],[/\b(prepared|built|owned|managed)\b[^.]{0,20}\bbudgets?\b/, "budgeting"],[/\bforecasts?\b/, "forecasting"],[/\b(lesson plans?|lesson planning)\b/, "lesson planning"],[/\b(prepared|preparing|prep)\b[^.]{0,30}\b(ielts|toefl)\b/, "ielts"],[/\b(product (manager|owner)|roadmaps?|prds?)\b/, "product management"],[/\broadmaps?\b/, "roadmap"],[/\b(design systems?)\b/, "design systems"],[/\bprototyp(e|es|ed|ing)\b/, "prototyping"],[/\b(usability (tests?|testing|studies))\b/, "usability testing"],[/\b(dashboards?)\b/, "data visualization"],[/\b(patient care|caring for patients|bedside)\b/, "patient care"],[/\b(reports?|reporting)\b[^.]{0,25}\b(leadership|management|executives?|weekly|monthly)\b|\b(weekly|monthly)\b[^.]{0,12}\breports?\b/, "reporting"],[/\b(end[- ]to[- ]end|full[- ]cycle|full[- ]life[- ]cycle)\b[^.]{0,20}\b(hiring|recruit(ing|ment))\b/, "full-cycle recruiting"],[/\b(hiring|recruit(ing|ment))\b[^.]{0,20}\b(end[- ]to[- ]end|full[- ]cycle)\b/, "full-cycle recruiting"],[/\b(report(ed|ing)? on|reports?\b[^.]{0,20}\b(metrics|kpis|analytics))/, "reporting"],[/\b(forecast|forecasting|budget(ing)?)\b/, "forecasting"],[/\b(negotiat(ed|ing|ion))\b/, "negotiation"],[/\b(wrote|writing|authored|copy)\b/, "writing"],[/\b(trained|training|onboard(ed|ing)?)\b/, "training"],[/\b(automat(ed|ion|ing))\b/, "automation"],[/\b(scal(ed|ing)|high[- ]traffic|distributed systems?)\b/, "scalability"],[/\b(unit|integration|e2e|end[- ]to[- ]end) test(s|ing)\b/, "qa"],[/\b(data pipelines?|etl|elt)\b/, "data pipelines"],[/\b(rest(ful)?|api)s?\b/, "api"],[/\b(agile|scrum|sprint|kanban)\b/, "agile"],[/\b(okr|kpi)s?\b/, "kpis"],[/\b(cold[- ]call|outreach|prospect(ed|ing))\b/, "outbound"],[/\b(closed|closing|quota|pipeline)\b/, "sales"],[/\b(churn|retention|nps|csat)\b/, "customer success"],[/\b(figma|wireframe|prototype|mockup)s?\b/, "ux"],[/\b(seo|organic traffic|backlinks?)\b/, "seo"],[/\b(campaign|paid (ads|media)|ppc|google ads|meta ads)\b/, "marketing"],[/\b(p&l|profit and loss|gross margin|ebitda)\b/, "finance"],[/\b(reconcil(ed|iation)|month[- ]end|general ledger|gl)\b/, "accounting"],[/\b(fine[- ]tun(ed|ing)|rag|prompt|llm|gpt|transformer)s?\b/, "llm"],[/\b(docker|kubernetes|k8s|terraform|ci\/cd)\b/, "devops"],[/\b(aws|gcp|azure|cloud)\b/, "cloud"],[/\b(remote|distributed) (team|work)/, "remote collaboration"],[/\b(bilingual|fluent|native)\b[^.]{0,15}\b(arabic|english|french|german|spanish)\b/, "languages"]];
  const SOFT = new Set(["leadership","communication","presentation","stakeholder","stakeholder management","negotiation","training","coaching","mentoring","writing","agile","remote collaboration","languages","problem solving","teamwork","collaboration","time management","adaptability","attention to detail","critical thinking","creativity","organization","customer service"]);
  const BAD = [["responsible for","Start with a verb: \"Led\", \"Built\", \"Grew\"."],["hard worker","Show it with a result instead."],["hardworking","Show it with a result instead."],["team player","Give an example of cross-team work."],["references available","Remove; recruiters ask when needed."],["detail-oriented","Prove it: \"zero reporting errors in 2 years\"."],["go-getter","Replace with a measurable win."],["think outside the box","Replace with a concrete idea you shipped."],["results-driven","Replace with the actual results."],["synergy","Plain language works better."],["duties included","Start with a verb instead."],["self-motivated","Show it with an initiative you started."],["excellent communication skills","Give an example: presented to 50+ stakeholders."],["objective:","Replace with a 2-line summary targeted at this role."],["curriculum vitae","Remove the title; your name is the title."]];
  const SUGGEST = { default: (k) => `Add a line where you used ${k}, e.g. "Used ${k} to …" with a number.` };
  function suggestion(k, soft) {
    const NAMES = { dbt: "dbt", "power bi": "Power BI", sql: "SQL", aws: "AWS", gcp: "GCP", "ci/cd": "CI/CD", llm: "LLM", nlp: "NLP", ml: "ML", ai: "AI", api: "API", seo: "SEO", crm: "CRM", hr: "HR", ux: "UX", ui: "UI", kpis: "KPIs", "fp&a": "FP&A", php: "PHP", ios: "iOS", "c++": "C++", "c#": "C#", ".net": ".NET", javascript: "JavaScript", typescript: "TypeScript", bigquery: "BigQuery", hubspot: "HubSpot", quickbooks: "QuickBooks", netsuite: "NetSuite", powerpoint: "PowerPoint", mongodb: "MongoDB", postgresql: "PostgreSQL", mysql: "MySQL", "scikit-learn": "scikit-learn", pytorch: "PyTorch", tensorflow: "TensorFlow", "node.js": "Node.js", "next.js": "Next.js" };
    const K = NAMES[k] || k.replace(/\b\w/g, (m) => m.toUpperCase());
    if (soft) return `Add one bullet that shows ${k}, e.g. "Led a cross-team project that …".`;
    if (/\b(sql|python|r|java|typescript|javascript|go|rust|c\+\+|c#|php|ruby|scala|kotlin|swift)\b/.test(k)) return `Add to Skills and to one bullet: "Wrote ${K} to …".`;
    if (/\b(tableau|power bi|looker|excel|dbt|airflow|snowflake|bigquery|redshift|databricks|spark|kafka|salesforce|hubspot|figma|jira|sap|netsuite|quickbooks)\b/.test(k)) return `Add to Tools and to one bullet: "Built … in ${K}".`;
    if (/\b(aws|gcp|azure|docker|kubernetes|terraform|ci\/cd|devops|cloud)\b/.test(k)) return `Add to Skills and one bullet: "Deployed … on ${K}".`;
    return SUGGEST.default(k);
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (t) => { let x = " " + t.toLowerCase().replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/[\/|·•;,()\[\]]/g, " $& ").replace(/\s+/g, " ") + " "; for (const g of SYN) { const canon = g[0]; for (const a of g) { if (a === canon) continue; x = x.split(" " + a + " ").join(" " + canon + " ").split(" " + a + ",").join(" " + canon + ",").split(" " + a + ".").join(" " + canon + "."); } } return x; };
  const tokens = (t) => (t.match(/[a-z][a-z0-9+#.\-\/&]{1,}/g) || []).map((w) => w.replace(/[.\-\/]+$/, "")).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));
  const esc_ = (k) => k.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
  const hasExact = (text, k) => new RegExp("(^|[^a-z0-9])" + esc_(k) + "($|[^a-z0-9])").test(text);
  const INGOK = new Set(["budgeting","forecasting","calling","planning","reporting","interviewing","prototyping","wireframing","screening","onboarding","charting","ticketing","sourcing","modeling","modelling","troubleshooting","closing","hiring","coaching","mentoring","training","negotiating","presenting","scheduling","invoicing","auditing","pricing","upselling"]);
  const stem = (w) => w.length > 3 ? (INGOK.has(w) ? w.replace(/ings?$/, "") : w.replace(/(ies|ied|ed|es|s)$/, "")) : w;
  const stemCache = new Map();
  const stemTokens = (text) => { if (stemCache.has(text)) return stemCache.get(text); const a = text.split(/[^a-z0-9+#.]+/).filter(Boolean).map(stem); if (stemCache.size > 8) stemCache.clear(); stemCache.set(text, a); return a; };
  const has = (text, k) => {
    if (hasExact(text, k)) return true;
    if (k.includes("/") && hasExact(text, k.replace(/\//g, " / "))) return true;
    const kt = k.split(/[^a-z0-9+#.]+/).filter(Boolean).map(stem); if (!kt.length || kt.some((w) => w.length < 3)) return false;
    const tt = stemTokens(text); outer: for (let i = 0; i <= tt.length - kt.length; i++) { for (let j = 0; j < kt.length; j++) if (tt[i + j] !== kt[j]) continue outer; return true; } return false;
  };
  const dprep = (t) => t.toLowerCase().replace(/[’']\s?(\d\d)\b/g, (m, y) => (+y <= 30 ? " 20" : " 19") + y).replace(/\b(since|from)\s+((?:19|20)\d\d)\b(?!\s*(?:-|–|to|until))/g, "$2 - present").replace(/حتى الآن|حتى الان|حتي الان|الحالي|حاليا|حالياً|الآن|الان|till now|until now|to date|ongoing/g, "present");
  function years(t) { t = dprep(t); let explicit = 0; for (const x of t.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs|year)/g)) explicit = Math.max(explicit, +x[1]); if (explicit) return explicit; const yrs = [...t.matchAll(/\b(20\d\d|19\d\d)\b/g)].map((x) => +x[1]).filter((y) => y <= new Date().getFullYear()); if (!yrs.length) return 0; const sorted = [...new Set(yrs)].sort((a, b) => a - b); const start = sorted.length > 3 ? sorted[1] : sorted[0]; const end = /present|current/.test(t) ? new Date().getFullYear() : Math.max(...yrs); return Math.min(25, Math.max(0, end - start)); }
  function jobYears(t) { const m = t.match(/(\d{1,2})\s*\+?\s*(?:-|to)?\s*(\d{1,2})?\s*\+?\s*(?:years|yrs)/); return m ? +m[1] : 0; }
  const GENERIC = new Set("small large big testing test tests present current previous data team teams tools tool insights insight business customer customers client clients product products service services platform platforms solution solutions process processes projects project systems system technical technology environment environments people person results result performance quality time global world international local based location office english emea apac latam north america europe".split(" "));
  function distinctive(jobN, jSkills) {
    const freq = {}; for (const w of tokens(jobN)) freq[w] = (freq[w] || 0) + 1;
    const part = (w) => jSkills.some((k) => k !== w && k.split(/[\s\/&.-]+/).includes(w));
    return Object.keys(freq).filter((w) => w.length > 3 && !SKILLS.includes(w) && !GENERIC.has(w) && !part(w)).sort((a, b) => freq[b] - freq[a]).slice(0, 40);
  }
  const TITLE_WORDS = /\b(engineer|developer|manager|analyst|designer|scientist|lead|director|specialist|coordinator|consultant|associate|executive|representative|recruiter|accountant|attorney|lawyer|nurse|teacher|architect|administrator|assistant|officer|head of|vp|president|intern|researcher|partner|controller|marketer|writer|editor|technician|operator|agent|advisor|strategist|planner|supervisor|owner|founder|chief)\b/i;
  function jobTitle(job) {
    const lines = job.split(/\n/).map((l) => l.trim()).filter(Boolean);
    let m = job.match(/(?:job title|position|role)\s*[:\-]\s*([^\n]{3,80})/i); if (m) return m[1].trim();
    m = job.match(/(?:hiring (?:a|an)|looking for (?:a|an)|seeking (?:a|an)|searching for (?:a|an))\s+([^\n.,]{3,80}?)(?:\s+(?:to|who|with|that)\b|[.,\n])/i); if (m) return m[1].trim();
    const cand = lines.slice(0, 8).find((l) => l.length < 90 && TITLE_WORDS.test(l) && !/\b(is|are|we|our|the company)\b/i.test(l)); if (cand) return cand.replace(/\s*[\(\|–-].*$/, "");
    const any = lines.find((l) => l.length < 90 && TITLE_WORDS.test(l)); if (any) return any.replace(/\s*[\(\|–-].*$/, "");
    return "";
  }
  // must-have vs nice-to-have split of the job text
  function splitJob(job) {
    const low = job.toLowerCase(); const i = low.search(/(nice[- ]to[- ]have|preferred|bonus points|a plus|plus:|it would be great|good to have)/);
    return i > 200 ? { must: job.slice(0, i), nice: job.slice(i) } : { must: job, nice: "" };
  }
  const EDU = [["phd","doctorate"],["mba"],["master's","masters","msc","m.sc","ms degree"],["bachelor's","bachelors","bsc","b.sc","ba degree","bs degree","undergraduate degree","university degree","college degree"],["cpa"],["cfa"],["pmp"],["cissp"],["aws certified"],["scrum master","csm"],["shrm","phr"],["six sigma"],["juris doctor","jd","law degree"],["md ","medical degree"],["rn ","registered nurse"]];
  const LANGS = ["english","arabic","french","german","spanish","portuguese","italian","dutch","mandarin","chinese","japanese","korean","hindi","urdu","turkish","russian","polish","swedish"];
  const PII = [[/\b(date of birth|dob|born on|age:\s*\d{2})\b/i,"Date of birth / age"],[/\b(married|single|divorced|marital status)\b/i,"Marital status"],[/\b(nationality|religion)\b/i,"Nationality / religion"],[/\b(photo|photograph)\b/i,"Photo"],[/\b(national id|passport (no|number)|ssn|social security)\b/i,"ID or passport number"]];
  const STRONG_VERBS = /^(led|built|designed|launched|grew|increased|reduced|cut|saved|delivered|managed|owned|created|developed|implemented|drove|improved|automated|scaled|negotiated|closed|hired|trained|shipped|optimi[sz]ed|migrated|architected|established|generated|won|secured|streamlined|transformed|coached|mentored|achieved|exceeded|boosted|accelerated)\b/i;
  function bulletAudit(cv) {
    const ls = cv.split(/\n/).map((l) => l.replace(/^[\s•\-*·▪●]+/, "").trim()).filter((l) => l.length > 25 && l.length < 300 && /[a-z]/i.test(l) && !/^[A-Z\s&]{6,}$/.test(l));
    const bullets = ls.filter((l) => /^(\w+ed|\w+ing|[A-Z]\w+ )/i.test(l) && l.split(" ").length >= 5).slice(0, 40);
    const noNum = bullets.filter((l) => !/\d/.test(l)); const weak = bullets.filter((l) => !STRONG_VERBS.test(l)); const long = bullets.filter((l) => l.split(" ").length > 30);
    return { total: bullets.length, noNum: noNum.length, weak: weak.length, long: long.length, weakEx: weak.slice(0, 2), noNumEx: noNum.slice(0, 2) };
  }
  function summaryDraft(cv, r, title) {
    const have = r.have || years(norm(cv)); const seen = []; const ROLEW = /^(recruiter|engineer|manager|analyst|designer|developer|consultant|accountant|attorney|lawyer|nurse|teacher|director|associate|executive|representative|specialist)s?$/;
    const skills = [...r.hardHit].filter((k) => k.length > 2 && !GENERIC.has(k) && !LANGS.includes(k) && !ROLEW.test(k) && !["full", "cycle", "degree", "fluent", "partners", "hiring", "management", "english"].includes(k)).filter((k) => { const st = k.slice(0, 5); if (seen.includes(st)) return false; seen.push(st); return true; }).slice(0, 3);
    const langsHave = r.langs.filter((l) => l.ok).map((l) => l.k.charAt(0).toUpperCase() + l.k.slice(1));
    const nums = (cv.match(/[^.\n]*\b\d{2,}[%+kKmM]?\b[^.\n]*/g) || []).map((x) => x.trim()).filter((x) => x.length > 30 && x.length < 160 && !/\b(19|20)\d\d\b/.test(x) && !/@|\+\d|phone|linkedin/i.test(x));
    const t = title ? title.replace(/^(senior|junior|lead)\s+/i, (m) => m) : "professional";
    let out = `${t.charAt(0).toUpperCase() + t.slice(1)}${have ? ` with ${have}+ years of experience` : ""}${skills.length ? ` in ${skills.slice(0, -1).join(", ")}${skills.length > 1 ? " and " : ""}${skills[skills.length - 1]}` : ""}.`;
    if (nums[0]) out += " " + nums[0].replace(/^[a-z]/, (m) => m.toUpperCase()).replace(/[.;,]$/, "") + ".";
    const soft = r.softHit.filter((k) => !["languages", "stakeholder"].includes(k)); if (soft.length) out += ` Strong ${soft.slice(0, 2).join(" and ")}.`; if (langsHave.length > 1) out += ` ${langsHave.join(" and ")} speaker.`;
    return out;
  }

  // years in roles similar to the job title (e.g. recruiting roles only), from dated CV entries
  const FAM = [[/recruit|talent|sourc|headhunt/, /recruit|talent acquisition|talent partner|sourc|headhunt|hiring/], [/engineer|developer|software|programmer|\bsde\b|\bswe\b/, /engineer|developer|software|programm/], [/sales|account executive|business development|\bbdr\b|\bsdr\b/, /sales|account executive|business development|\bbdr\b|\bsdr\b/], [/market|growth|\bseo\b/, /market|growth|\bseo\b/], [/attorney|lawyer|counsel|legal/, /attorney|lawyer|counsel|legal/], [/nurse|\brn\b/, /nurse|\brn\b/], [/design|\bux\b|\bui\b/, /design|\bux\b|\bui\b/], [/product (manager|owner|lead)/, /product/], [/project manager|program manager|\bpmo\b/, /project|program/], [/analyst|analytics|data/, /analy|data/], [/accountant|accounting|finance|financial|controller|bookkeep/, /account|financ|controller|bookkeep/], [/teacher|tutor|instructor/, /teach|tutor|instruct/], [/customer (support|service|success)/, /customer|support|success/], [/\bhr\b|human resources|people/, /\bhr\b|human resources|people/]];
  const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  function roleRegex(title) {
    const t = (title || "").toLowerCase().replace(/\b(senior|junior|lead|principal|staff|global|technical|head of|associate|assistant|chief|sr|jr|remote|contract|intern|i|ii|iii)\b/g, " ");
    for (const [k, re] of FAM) if (k.test(t)) return re;
    const stems = t.split(/[^a-z]+/).filter((w) => w.length > 3 && !GENERIC.has(w)).map((w) => w.replace(/(ers?|ing|ments?|ors?|ists?|ians?)$/, "")).filter((w) => w.length > 3);
    return stems.length ? new RegExp(stems.join("|")) : null;
  }
  function relYears(cvRaw, title) {
    const fam = roleRegex(title); if (!fam) return { found: false, years: 0 };
    const t = dprep(cvRaw).replace(/[–—]/g, "-").replace(/\s+/g, " ");
    const D = "(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?,?\\s+)?(?:(\\d{1,2})[\\/.])?((?:19|20)\\d\\d)";
    const re = new RegExp(D + "\\s*(?:-|to|until)?\\s*(?:" + D + "|(present|current|now|today))?", "g");
    const now = new Date(), nowF = now.getFullYear() + now.getMonth() / 12, iv = [];
    for (const m of t.matchAll(re)) {
      const head = t.slice(m.index + m[0].length, m.index + m[0].length + 110);
      if (!fam.test(head) || /certif|course|award|diploma|degree|bachelor|master|bsc|msc|mba/.test(head.slice(0, 60))) continue;
      const sm = m[1] ? MON[m[1]] : (+m[2] || 1), sy = +m[3]; const start = sy + (sm - 1) / 12; if (start > nowF) continue;
      let end;
      if (m[6]) end = +m[6] + ((m[4] ? MON[m[4]] : (+m[5] || 12)) - 1) / 12 + 1 / 12; else end = nowF; // "present" or an open date = ongoing
      if (end > start) iv.push([start, Math.min(end, nowF)]);
    }
    if (!iv.length) return { found: false, years: 0 };
    iv.sort((a, b) => a[0] - b[0]); let sum = 0, cs = iv[0][0], ce = iv[0][1];
    for (const [s, e] of iv.slice(1)) { if (s <= ce) ce = Math.max(ce, e); else { sum += ce - cs; cs = s; ce = e; } } sum += ce - cs;
    return { found: true, years: Math.max(1, Math.round(sum)) };
  }
  function phraseHits(text) { const out = new Set(); for (const [re, k] of PHRASES) if (re.test(text)) out.add(k); return out; }
  function analyse(cv, job) {
    const jobCore = (() => { const lines = job.split(/\n/); const out = []; let skip = false; for (const ln of lines) { const t = ln.trim(); const head = t.length < 70 && !/[.:;]$/.test(t) && /^[^a-z]*[A-Za-z]/.test(t); if (head && /^(what we offer|what'?s in it for you|about (us|the company|the team|[A-Z][\w&. ]+)|who we are|our (company|story|mission|values|culture)|company (overview|description)|benefits|perks|compensation|equal (opportunity|employment)|eeo|diversity|why (join|work|us)|the company|our offer|we offer)\b/i.test(t)) { skip = true; continue; } if (head && /^(requirements?|qualifications?|what (you|we)'?ll (need|bring|do|be doing)|what we('re| are) looking for|responsibilit|your (role|profile|responsibilities|experience|skills)|skills|must[- ]have|nice[- ]to[- ]have|the role|role overview|job description|about the role|key (duties|responsibilities|skills)|duties|experience|you (have|are|will)|ideal candidate|minimum|preferred|bonus)/i.test(t)) skip = false; if (!skip) out.push(ln); } return out.length > 3 ? out.join("\n") : job; })();
    const c = norm(cv), j = norm(jobCore);
    const cPh = phraseHits(c), jPh = phraseHits(j);
    const hasC = (k) => has(c, k) || cPh.has(k);
    let jSkills = [...new Set([...SKILLS.filter((k) => !INDUSTRY.has(k) && has(j, k)), ...jPh])]; jSkills = jSkills.filter((k) => !/[\s\/-]/.test(k) ? !jSkills.some((o) => o !== k && o.split(/[\s\/-]+/).includes(k)) : true);
    const hit = jSkills.filter(hasC), miss = jSkills.filter((k) => !hasC(k));
    const firstLine = norm(job.split("\n").find((l) => l.trim()) || ""); const dist = distinctive(j, jSkills).filter((w) => !has(firstLine, w)); const dHit = dist.filter((w) => has(c, w)); const dMiss = dist.filter((w) => !has(c, w)).slice(0, 8);
    const sk = jSkills.length ? hit.length / jSkills.length : (dist.length ? dHit.length / dist.length : 0.5);
    const kw = dist.length ? dHit.length / dist.length : sk;
    const need = jobYears(j); let have = years(c); let total = have;
    let ex = need ? Math.min(1, have / need) : 0.85; if (!need && !have) ex = 0.7;
    const titleLine = jobTitle(job).toLowerCase(); const rel = relYears(cv, titleLine); const expl = (() => { let e = 0; for (const x of dprep(c).matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs|year)/g)) e = Math.max(e, +x[1]); return e; })(); let yearsNote = ""; if (rel.found) { if (expl && Math.abs(expl - rel.years) >= 3) yearsNote = ` You wrote ${expl} years; your dated roles in this field add up to about ${rel.years}. Make them consistent.`; have = rel.years; if (total < have) total = have; ex = need ? Math.min(1, have / need) : ex; } const tTok = tokens(norm(titleLine)).slice(0, 6); const tHit = tTok.filter((w) => has(c, w)).length; const tb = tTok.length ? tHit / tTok.length : 0.5;
    const overall = Math.round(100 * (0.55 * sk + 0.25 * ex + 0.2 * tb));
    // summary / headline check: do the first ~300 chars of the CV contain the job title words?
    const top = norm(cv.slice(0, 400)); const titleInTop = tTok.length ? tTok.filter((w) => has(top, w)).length / tTok.length : 0;
    // bad phrases
    const bad = BAD.filter(([p]) => c.includes(" " + p) || c.includes(p + " ")).map(([p, tip]) => ({ p, tip }));
    const hardMiss = miss.filter((k) => !SOFT.has(k)), softMiss = miss.filter((k) => SOFT.has(k));
    const hardHit = hit.filter((k) => !SOFT.has(k)), softHit = hit.filter((k) => SOFT.has(k));
    const sj = splitJob(job); const mustN = norm(sj.must), niceN = norm(sj.nice);
    const mustMiss = miss.filter((k) => has(mustN, k) || phraseHits(mustN).has(k)), niceMiss = miss.filter((k) => !mustMiss.includes(k) && sj.nice && (has(niceN, k) || phraseHits(niceN).has(k)));
    const density = jSkills.map((k) => { const re = new RegExp("(^|[^a-z0-9])" + k.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "($|[^a-z0-9])", "g"); return { k, job: (j.match(re) || []).length, cv: (c.match(re) || []).length }; }).filter((x) => x.job >= 2).sort((a, b) => (b.job - b.cv) - (a.job - a.cv)).slice(0, 8);
    const edu = EDU.filter((g) => g.some((t) => j.includes(" " + t))).map((g) => ({ k: g[0].replace(/\s+$/, ""), ok: g.some((t) => c.includes(" " + t)) }));
    const langs = LANGS.filter((l) => has(j, l)).map((l) => ({ k: l, ok: has(c, l) }));
    const pii = PII.filter(([re]) => re.test(cv)).map(([, n]) => n);
    const bullets = bulletAudit(cv);
    const words = cv.trim().split(/\s+/).length; const ideal = total >= 8 ? [550, 850] : total >= 3 ? [400, 700] : [300, 550];
    return { overall: Math.max(5, Math.min(98, overall)), sk: Math.round(sk * 100), kw: Math.round(kw * 100), tb: Math.round(tb * 100), ex: Math.round(ex * 100), hit, miss, hardHit, softHit, hardMiss, softMiss, dHit: dHit.slice(0, 10), dMiss, need, have, total, relFound: rel.found, yearsNote, titleInTop, titleWords: tTok, title: titleLine, bad, mustMiss, niceMiss, density, edu, langs, pii, bullets, words, ideal };
  }
  function formatCheck(meta, text) {
    const issues = [], warns = [], good = [];
    if (!meta) { if (text) good.push("Text file: readable by any ATS."); return { issues, warns, good }; }
    if (meta.docx) {
      if (meta.tables > 0) issues.push({ t: `${meta.tables} table${meta.tables > 1 ? "s" : ""} in the layout`, d: "Many ATS read Word tables cell by cell and scramble the order. Use plain paragraphs and tabs instead of tables for layout." });
      if (meta.textBoxes > 0) issues.push({ t: `${meta.textBoxes} text box${meta.textBoxes > 1 ? "es" : ""}`, d: "Text inside text boxes is often skipped by ATS. Move it into the main body." });
      if (!meta.tables && !meta.textBoxes) good.push("No tables or text boxes: reads in order.");
    }
    if (meta.pages > 2) warns.push({ t: `${meta.pages} pages`, d: "ATS reads it fine, but recruiters skim: aim for 1 page (under 10 years of experience) or 2 pages max." }); else good.push(`${meta.pages} page${meta.pages > 1 ? "s" : ""}: good length.`);
    if (meta.images > 0) issues.push({ t: `${meta.images} image${meta.images > 1 ? "s" : ""} or graphic${meta.images > 1 ? "s" : ""}`, d: "ATS can't read text inside images, photos, icons or skill bars. Use plain text." }); else good.push("No images or graphics: ATS-safe.");
    if (!meta.docx) { if (meta.cols) issues.push({ t: "Two-column layout", d: "Long text in two side-by-side columns: many ATS read across the page and scramble it. Use a single column." }); else if (meta.sideDates) warns.push({ t: "Dates in a side column", d: "Most ATS read this fine. For 100% safety put dates on the same line as the company name." }); else good.push("Single column: reads in order."); }
    const odd = (meta.fonts || []).filter((f) => !/arial|helvetica|calibri|times|georgia|verdana|cambria|garamond|roboto|open ?sans|lato|inter|segoe|tahoma|trebuchet|sans-serif|serif|liberation|dejavu|noto|carlito|symbol/i.test(f));
    if (odd.length) warns.push({ t: "Unusual fonts", d: "Stick to Arial, Calibri, Helvetica or Georgia so every ATS and reader renders it." }); else good.push("Standard fonts.");
    if ((meta.chars || 0) < 300) issues.push({ t: "Very little selectable text", d: "If your CV is a scanned image or exported as a picture, ATS reads nothing. Export from Word/Google Docs as a text PDF." });
    return { issues, warns, good };
  }
  function verdict(p) {
    if (p >= 75) return ["🎯 STRONG MATCH", "Apply now.", "Your CV already speaks the job's language. Tailor the summary line to this role and send it today.", "g"];
    if (p >= 55) return ["👍 GOOD MATCH", `Add ${"{n}"} keywords, then apply.`, "Your CV covers most of the must-haves. Recruiters and ATS filters look for the exact words in the ad, so add the missing ones where they're true for you.", "g"];
    if (p >= 35) return ["🤔 PARTIAL MATCH", "Fix the gaps before you apply.", "You match some requirements but important ones are missing. Add real experience with the missing keywords, or target a closer role.", "y"];
    return ["⚠️ WEAK MATCH", "This one is a stretch.", "Most of the must-haves aren't on your CV. Apply only if you can honestly add the missing skills, or use Lilo to find roles closer to your profile.", "r"];
  }
  let cv = "", lastResult = null; const FROM_CARD = location.hash === "#from-card";
  async function loadFile(f) {
    if (!f) return; fileOut.hidden = false; fileOut.className = "cm-file"; fileOut.textContent = "📄 " + f.name + " · reading…";
    try {
      const t = await Promise.race([window.UA_readFile(f), new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 20000))]);
      if (!t || t.trim().length < 80) throw new Error("empty");
      cv = t; cvText.value = ""; fileOut.textContent = "📄 " + f.name + " · read ✓ (" + Math.round(t.split(/\s+/).length) + " words)"; if (FROM_CARD && jobTa.value.trim().length >= 60) go.click();
    } catch (e) { cv = ""; fileOut.className = "cm-file bad"; const scanned = window.UA_lastMeta && window.UA_lastMeta.pages && !(window.UA_lastMeta.chars > 0); fileOut.textContent = scanned ? "⚠ " + f.name + " has no selectable text: it looks like a scanned image or a picture. ATS can't read it either. Export a text PDF from Word/Google Docs, or paste your CV text below." : "Couldn't read " + f.name + ". Try a PDF or Word file with selectable text, or paste your CV text below."; }
  }
  fileIn.addEventListener("change", () => loadFile(fileIn.files[0]));
  try { const jj = sessionStorage.getItem("uh-cm-job"); if (jj && FROM_CARD) { jobTa.value = jj; sessionStorage.removeItem("uh-cm-job"); } } catch (e) {}
  if (FROM_CARD) { const hs = document.querySelector(".cm-hl span"); if (hs) hs.textContent = "Upload your CV and we'll compare it with this job's full description. Nothing leaves your browser."; }
  try { const t = sessionStorage.getItem("uh-cv-text"); if (t && location.hash === "#from-builder") { cv = t; fileOut.hidden = false; fileOut.className = "cm-file"; fileOut.textContent = "📄 CV from the builder · loaded ✓"; sessionStorage.removeItem("uh-cv-text"); $("#cm-job").focus(); } } catch (e) {}
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => loadFile(e.dataTransfer.files[0]));
  async function jobFromLink(u) {
    const m = u.match(/job-([a-z0-9-]+)\.html/); if (!m) return null;
    if (!window.JOBS) { const r = await fetch("jobs.js?v=42").then((x) => x.text()); window.JOBS = new Function(r + ";return JOBS;")(); }
    const j = window.JOBS.find((x) => x.id === m[1]); if (!j) return null;
    return [j.title, j.company, j.brief, j.overview, ...(j.requirements || []), ...(j.responsibilities || []), j.compensation].filter(Boolean).join("\n");
  }
  go.addEventListener("click", async () => {
    err.hidden = true; const cvIn = cv || cvText.value.trim(); let job = jobTa.value.trim();
    if (cvIn.length < 80) { err.hidden = false; err.textContent = "Add your CV first: upload a PDF/Word file or paste the text."; return; }
    if (/^https?:\/\/\S+$/.test(job)) {
      if (/uhirable\.github\.io\/(jobs\/)?job-/.test(job)) { job = await jobFromLink(job); }
      else { err.hidden = false; err.innerHTML = "I can't open links from other sites. Open the job page, select the description (Ctrl+A), copy it (Ctrl+C) and paste it here."; return; }
    }
    if (!job || job.length < 60) { err.hidden = false; err.textContent = "Paste the full job description (at least a few lines) so I can compare it properly."; return; }
    const r = analyse(cvIn, job); const [badge, head, body, cls] = verdict(r.overall);
    const n = r.miss.length;
    lastResult = { pct: r.overall, badge, head };
    $("#cm-ring").style.setProperty("--p", r.overall); $("#cm-pct").textContent = r.overall + "%";
    $("#cm-badge").textContent = badge; $("#cm-badge").className = "cm-badge " + cls;
    $("#cm-head").textContent = head.replace("{n}", n); $("#cm-body").textContent = body;
    $("#cm-b1").style.setProperty("--w", r.sk + "%"); $("#cm-v1").textContent = r.sk + "%";
    $("#cm-b2").style.setProperty("--w", r.ex + "%"); $("#cm-v2").textContent = r.ex + "%";
    $("#cm-b3").style.setProperty("--w", r.tb + "%"); $("#cm-v3").textContent = r.tb + "%";
    const found = [...r.hardHit, ...r.softHit].slice(0, 20), missing = [...r.hardMiss, ...r.softMiss].slice(0, 16);
    $("#cm-found-n").textContent = found.length; $("#cm-miss-n").textContent = missing.length;
    const pill = (k, soft) => `<span class="${soft ? "soft" : ""}">${esc(k)}</span>`;
    const noSkills = !r.hit.length && !r.miss.length;
    $("#cm-found").innerHTML = found.length ? found.map((k) => pill(k, SOFT.has(k))).join("") : noSkills ? "<span>Not enough job details to compare skills</span>" : "<span>No clear keyword matches</span>";
    $("#cm-miss").innerHTML = missing.length ? missing.map((k) => pill(k, SOFT.has(k))).join("") : noSkills ? "<span>Not enough job details to compare skills</span>" : "<span>Nothing important missing 🎉</span>";
    const hv = r.relFound ? `about ${r.have} in similar roles (${r.total} in total)` : `about ${r.have || "0"}`; $("#cm-exp").textContent = (r.yearsNote || "") + " "; $("#cm-exp").textContent = (r.need ? (r.have >= r.need ? `The ad asks for ${r.need}+ years; your CV shows ${hv}. ✓` : `The ad asks for ${r.need}+ years; your CV shows ${hv}. Make your years of experience in this field explicit.`) : (r.have ? `Your CV shows ${hv} years of experience.` : "Add your years of experience clearly (e.g. \"4+ years in sales\").")) + (r.yearsNote || "");
    // suggestions: one ready line per missing keyword
    const sug = [...r.hardMiss, ...r.softMiss].slice(0, 6);
    $("#cm-sug").innerHTML = sug.length ? sug.map((k) => `<li><b>${esc(k)}</b><span>${esc(suggestion(k, SOFT.has(k)))}</span></li>`).join("") : (noSkills ? "<li><b>Not enough job details</b><span>The job description doesn't list clear skills, so this score is only a rough estimate. Read the full description before applying.</span></li>" : "<li><b>Nothing to add</b><span>Your CV already covers the must-haves. Tailor the summary and apply.</span></li>");
    // headline check
    const hl = $("#cm-headline");
    if (r.titleWords.length) { hl.className = "cm-note " + (r.titleInTop >= 0.5 ? "ok" : "warn"); hl.innerHTML = r.titleInTop >= 0.5 ? `<b>✓ Headline matches.</b> The top of your CV already mentions "${esc(r.titleWords.slice(0, 3).join(" "))}".` : `<b>✗ Headline doesn't match.</b> Put the job title (${esc(r.titleWords.slice(0, 3).join(" "))}) in your first 2 lines: that's the first thing ATS and recruiters look at.`; hl.hidden = false; } else hl.hidden = true;
    // bad phrases
    const bp = $("#cm-bad");
    if (r.bad.length) { bp.hidden = false; $("#cm-bad-list").innerHTML = r.bad.map((x) => `<li><b>"${esc(x.p)}"</b><span>${esc(x.tip)}</span></li>`).join(""); } else bp.hidden = true;
    // format check
    const fc = formatCheck(window.UA_lastMeta, !window.UA_lastMeta && cv === "" ? cvIn : null);
    const fmt = $("#cm-format");
    if (fc.issues.length || fc.warns.length || fc.good.length) { fmt.hidden = false; $("#cm-fmt-list").innerHTML = fc.issues.map((x) => `<li class="bad"><b>✗ ${esc(x.t)}</b><span>${esc(x.d)}</span></li>`).join("") + fc.warns.map((x) => `<li class="warn"><b>⚠ ${esc(x.t)}</b><span>${esc(x.d)}</span></li>`).join("") + fc.good.map((g) => `<li class="ok"><b>✓ ${esc(g)}</b></li>`).join(""); $("#cm-fmt-h").textContent = fc.issues.length ? `ATS format check: ${fc.issues.length} issue${fc.issues.length > 1 ? "s" : ""}` : fc.warns.length ? `ATS format check: OK, ${fc.warns.length} tip${fc.warns.length > 1 ? "s" : ""}` : "ATS format check: all clear"; } else fmt.hidden = true;
    // must-have vs nice-to-have
    const mh = $("#cm-must"); if (r.mustMiss.length || r.niceMiss.length) { mh.hidden = false; $("#cm-must-list").innerHTML = (r.mustMiss.length ? `<li class="bad"><b>✗ Must-have, missing (${r.mustMiss.length})</b><div>${r.mustMiss.map((k) => `<span>${esc(k)}</span>`).join("")}</div><small>These are in the requirements section. Missing them usually means an automatic reject.</small></li>` : `<li class="ok"><b>✓ All must-haves covered</b></li>`) + (r.niceMiss.length ? `<li class="warn"><b>⚠ Nice-to-have, missing (${r.niceMiss.length})</b><div>${r.niceMiss.map((k) => `<span>${esc(k)}</span>`).join("")}</div><small>Optional. Add only if true.</small></li>` : ""); } else mh.hidden = true;
    // education, languages, pii, bullets, length
    const ex = []; r.edu.forEach((e) => ex.push({ ok: e.ok, t: (e.ok ? "✓ " : "✗ ") + e.k.toUpperCase() + (e.ok ? " found" : " required by the ad, not on your CV") })); r.langs.forEach((l) => ex.push({ ok: l.ok, t: (l.ok ? "✓ " : "✗ ") + l.k.charAt(0).toUpperCase() + l.k.slice(1) + (l.ok ? " listed" : " requested, add your level") }));
    const eb = $("#cm-extra"); if (ex.length) { eb.hidden = false; $("#cm-extra-list").innerHTML = ex.map((x) => `<li class="${x.ok ? "ok" : "bad"}"><b>${esc(x.t)}</b></li>`).join(""); } else eb.hidden = true;
    const pb = $("#cm-pii"); if (r.pii.length) { pb.hidden = false; $("#cm-pii-list").innerHTML = r.pii.map((p) => `<li class="warn"><b>⚠ ${esc(p)}</b><span>Not needed for US, UK or EU applications and can trigger bias filters. Remove it unless the ad asks.</span></li>`).join(""); } else pb.hidden = true;
    const bu = $("#cm-bullets"); const B = r.bullets; if (B.total >= 3) { bu.hidden = false; const pctNum = Math.round(100 * (B.total - B.noNum) / B.total), pctVerb = Math.round(100 * (B.total - B.weak) / B.total); $("#cm-bullets-body").innerHTML = `<div class="cm-bars"><div><span>Start with a strong verb</span><i style="--w:${pctVerb}%"></i><em>${pctVerb}%</em></div><div><span>Include a number</span><i style="--w:${pctNum}%"></i><em>${pctNum}%</em></div></div><p class="cm-tiny">${B.total} experience lines checked.${B.long ? ` ${B.long} are over 30 words, split them.` : ""}</p>` + (B.noNumEx.length ? `<p class="cm-tiny"><b>Add a number to lines like:</b> "${esc(B.noNumEx[0].slice(0, 110))}…"</p>` : "") + (B.weakEx.length ? `<p class="cm-tiny"><b>Start with a verb:</b> "${esc(B.weakEx[0].slice(0, 110))}…"</p>` : ""); } else bu.hidden = true;
    const ln = $("#cm-length"); ln.hidden = false; ln.className = "cm-note " + (r.words < r.ideal[0] ? "warn" : r.words > r.ideal[1] ? "warn" : "ok"); ln.innerHTML = r.words < r.ideal[0] ? `<b>Short CV: ${r.words} words.</b> For your level aim for ${r.ideal[0]}–${r.ideal[1]}. Add results and tools to each role.` : r.words > r.ideal[1] ? `<b>Long CV: ${r.words} words.</b> For your level aim for ${r.ideal[0]}–${r.ideal[1]}. Cut old roles to one line each.` : `<b>✓ Good length: ${r.words} words</b> (ideal for your level: ${r.ideal[0]}–${r.ideal[1]}).`;
    // summary draft
    // before / after
    const key = "uh-cm-last"; try { const prev = JSON.parse(sessionStorage.getItem(key) || "null"); const ba = $("#cm-before"); if (prev && prev.job === job.slice(0, 200) && prev.pct !== r.overall) { ba.hidden = false; ba.className = "cm-note " + (r.overall > prev.pct ? "ok" : "warn"); ba.innerHTML = `<b>${r.overall > prev.pct ? "📈" : "📉"} Was ${prev.pct}%, now ${r.overall}%.</b> ${r.overall > prev.pct ? "Your edits worked." : "Your last version scored higher."}`; } else ba.hidden = true; sessionStorage.setItem(key, JSON.stringify({ job: job.slice(0, 200), pct: r.overall })); } catch (e) {}
    res.hidden = false; res.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.goatcounter && goatcounter.count) try { goatcounter.count({ path: "cv-match/check", title: "CV match check", event: true }); } catch (e) {}
  });
  // ---- Share my score (image generated in the browser, no personal data) ----
  async function shareImage() {
    if (!lastResult) return;
    const W = 1080, H = 1080, cv2 = document.createElement("canvas"); cv2.width = W; cv2.height = H; const x = cv2.getContext("2d");
    const g = x.createRadialGradient(W * .3, H * .2, 50, W * .5, H * .5, 900); g.addColorStop(0, "#2f3cff"); g.addColorStop(.5, "#0112ff"); g.addColorStop(1, "#070a4a"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "800 64px Plus Jakarta Sans, Arial, sans-serif"; x.fillText("My CV vs the job", W / 2, 150);
    x.fillStyle = "#ffd23f"; x.font = "700 30px Plus Jakarta Sans, Arial, sans-serif"; x.fillText("checked in 30 seconds, free", W / 2, 205);
    const cx = W / 2, cy = 520, R = 230; x.lineWidth = 48; x.strokeStyle = "rgba(255,255,255,.14)"; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
    const grd = x.createLinearGradient(cx - R, cy, cx + R, cy); grd.addColorStop(0, "#ffe27a"); grd.addColorStop(1, "#f5b70a"); x.strokeStyle = grd; x.lineCap = "round"; x.beginPath(); x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lastResult.pct / 100); x.stroke();
    x.fillStyle = "#fff"; x.beginPath(); x.arc(cx, cy, R - 40, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#141a52"; x.font = "800 150px Plus Jakarta Sans, Arial, sans-serif"; x.fillText(lastResult.pct + "%", cx, cy + 50);
    x.font = "800 28px Plus Jakarta Sans, Arial, sans-serif"; x.fillStyle = "#1a7a3c"; x.fillText(lastResult.badge.replace(/^\S+\s/, ""), cx, cy + 115);
    x.fillStyle = "#fff"; x.font = "700 34px Plus Jakarta Sans, Arial, sans-serif"; x.fillText(lastResult.head.replace("{n}", "a few"), W / 2, 830);
    x.fillStyle = "#ffd23f"; x.font = "800 30px Plus Jakarta Sans, Arial, sans-serif"; x.fillText("Check yours free, no sign-up", W / 2, 930);
    x.fillStyle = "#fff"; x.font = "700 26px Plus Jakarta Sans, Arial, sans-serif"; x.fillText("uhirable.github.io/cv-match", W / 2, 975);
    x.font = "800 24px Plus Jakarta Sans, Arial, sans-serif"; x.fillStyle = "rgba(255,255,255,.7)"; x.fillText("U HIRABLE", W / 2, 1030);
    const blob = await new Promise((r) => cv2.toBlob(r, "image/png")); const file = new File([blob], "my-cv-match-score.png", { type: "image/png" });
    const text = `My CV scored ${lastResult.pct}% against the job I'm applying to. Free check, no sign-up: https://uhirable.github.io/cv-match.html`;
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text, title: "My CV match score" }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-cv-match-score.png"; a.click();
    const li = $("#cm-share-li"); if (li) { li.hidden = false; li.href = "https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(text); }
    if (window.goatcounter && goatcounter.count) try { goatcounter.count({ path: "cv-match/share", title: "CV match share", event: true }); } catch (e) {}
  }
  const sb = $("#cm-share"); if (sb) sb.addEventListener("click", shareImage);
  const lilo = $("#cm-lilo"); if (lilo) lilo.addEventListener("click", (e) => { const b = document.getElementById("ua-btn"); if (b) { e.preventDefault(); b.click(); } });
})();
