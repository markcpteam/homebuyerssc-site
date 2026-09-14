import re, glob, json, os, collections

ROOT='/root/hbsc/src'
files = sorted(glob.glob(f'{ROOT}/content/**/*.md', recursive=True)) + \
        sorted(glob.glob(f'{ROOT}/components/*.astro')) + \
        sorted(glob.glob(f'{ROOT}/pages/**/*.astro', recursive=True)) + \
        sorted(glob.glob(f'{ROOT}/layouts/*.astro'))

# (category, severity, regex, note)
RULES = [
 # ---- UNVERIFIED STATISTICS ----
 ('STAT','HIGH', r'\b\d+\s*(?:in|out of)\s*\d+\b', 'ratio stat'),
 ('STAT','HIGH', r'\b\d{1,3}\s*(?:to|-)\s*\d{1,3}\s*(?:%|percent)', 'percentage range'),
 ('STAT','HIGH', r'\b\d{1,3}\s*(?:%|percent)\s+of\b', 'percentage of X'),
 ('STAT','HIGH', r'\$[\d,]+\s*(?:to|-)\s*\$?[\d,]+', 'dollar range'),
 ('STAT','MED',  r'\b(?:studies show|research shows|data shows|statistics show|experts (?:say|agree))\b', 'appeal to unnamed authority'),
 ('STAT','MED',  r'\b(?:on average|typically run|usually run|average(?:s)? (?:about|around)|national average)\b', 'average claim'),
 ('STAT','MED',  r'\b(?:most|majority of)\s+(?:buyers|sellers|homeowners|lenders|investors|agents)\b', 'unquantified majority claim'),

 # ---- OVER-PROMISING / GUARANTEES ----
 ('PROMISE','HIGH', r'\b(?:guarantee[ds]?|guaranteed|we promise|rest assured|no risk|risk-free|zero risk)\b', 'guarantee language'),
 ('PROMISE','HIGH', r'\b(?:always|never)\s+(?:pay|close|buy|accept|get|have|offer|require)\w*\b', 'absolute always/never'),
 ('PROMISE','HIGH', r'\b(?:the )?(?:best|fastest|cheapest|highest|lowest|top|#1|number one|leading)\s+(?:cash )?(?:buyer|offer|price|way|option|company|choice)\b', 'superlative'),
 ('PROMISE','MED',  r'\bwe (?:will|can) (?:always|guarantee|ensure|make sure)\b', 'commitment on behalf of company'),
 ('PROMISE','MED',  r'\bany (?:condition|house|situation|property)\b', 'absolute "any" claim'),
 ('PROMISE','MED',  r'\b(?:hassle[- ]free|stress[- ]free|worry[- ]free|painless|effortless|simple as)\b', 'friction-free promise'),
 ('PROMISE','MED',  r'\bno (?:obligation|fees|commissions|repairs|showings|surprises|hidden)\b', 'absolute no-X claim (verify policy)'),
 ('PROMISE','HIGH', r'\bfair (?:cash )?(?:offer|price)\b', '"fair offer" subjective promise'),
 ('PROMISE','MED',  r'\b(?:instantly|immediately|same day|24 hours|overnight)\b', 'speed absolute'),

 # ---- LEGAL ADVICE FRAMING ----
 ('LEGAL','HIGH', r'\byou (?:must|are required to|have to|are legally|are obligated)\b', 'imperative legal instruction'),
 ('LEGAL','HIGH', r'\byou (?:can|cannot|can\'t|may not) legally\b', 'legal capability assertion'),
 ('LEGAL','HIGH', r'\b(?:you should|we recommend you|make sure you) (?:file|sign|petition|serve|record|evict|disclose|claim)\b', 'directive legal action'),
 ('LEGAL','MED',  r'\b(?:is|are) (?:legal|illegal|lawful|unlawful|not allowed|prohibited)\b', 'legality assertion'),
 ('LEGAL','MED',  r'\bthe law (?:requires|says|states|prohibits)\b', 'law assertion'),
 ('LEGAL','MED',  r'\b(?:statute of limitations|liable|liability|breach of contract|sue|lawsuit|damages)\b', 'legal-risk terminology'),

 # ---- TAX ADVICE ----
 ('TAX','HIGH', r'\byou (?:will|won\'t|will not|would) owe\b', 'tax outcome assertion'),
 ('TAX','HIGH', r'\b(?:no|zero|little or no) (?:capital gains|taxes?) (?:tax)?\b', 'tax outcome assertion'),
 ('TAX','MED',  r'\b(?:stepped-up basis|step-up in basis|capital gains|tax basis|estate tax|inheritance tax)\b', 'tax topic'),

 # ---- FAIR HOUSING ----
 ('FAIRHOUSING','HIGH', r'\b(?:family[- ]friendly|safe (?:neighborhood|area|part)|good schools|bad (?:neighborhood|area)|desirable (?:area|neighborhood)|up[- ]and[- ]coming|sketchy|rough (?:area|part))\b','area/demographic characterization'),
 ('FAIRHOUSING','HIGH', r'\b(?:crime rate|high crime|low crime|declining neighborhood)\b', 'crime characterization'),
 ('FAIRHOUSING','MED',  r'\b(?:perfect for|ideal for|great for)\s+(?:families|couples|singles|retirees|young|seniors|students)\b', 'buyer-type steering'),

 # ---- BUSINESS CLAIMS NEEDING VERIFICATION ----
 ('BIZCLAIM','HIGH', r'\b(?:500\+?|over 500|hundreds of)\s+(?:transactions|purchases|homes|houses|deals)\b', 'transaction count'),
 ('BIZCLAIM','HIGH', r'\b4\.8\b|\b25 (?:Google )?reviews\b', 'review stats'),
 ('BIZCLAIM','HIGH', r'\bA\+\b|\bBBB accredited\b|\baccredited business\b', 'BBB claim'),
 ('BIZCLAIM','MED',  r'\b(?:family[- ](?:run|owned)|locally owned|local(?:ly)? (?:family|owned))\b', 'ownership characterization'),
 ('BIZCLAIM','MED',  r'\b(?:since|for over) (?:2017|\d+ years)\b', 'tenure claim'),
 ('BIZCLAIM','MED',  r'\blicense (?:number|#)\s*\d+', 'license claim'),
 ('BIZCLAIM','MED',  r'\b(?:as few as|as little as|in as little as)\s+\d+\s*(?:days?|weeks?)\b', 'speed claim about company'),

 # ---- HEALTH / VULNERABLE ----
 ('HEALTH','MED', r'\b(?:mental health|hoarding disorder|dementia|Alzheimer|illness|diagnosis|medical condition)\b', 'health reference'),

 # ---- COMPETITOR ----
 ('COMPETITOR','MED', r'\b(?:scam|rip[- ]?off|predatory|dishonest|shady|crooked)\b', 'disparagement risk'),
 ('COMPETITOR','MED', r'\b(?:iBuyer|Opendoor|Offerpad|Zillow|HomeLight|Angi)\b', 'names a competitor/third party'),
]

results = collections.defaultdict(list)
for f in files:
    txt = open(f, encoding='utf-8').read()
    lines = txt.split('\n')
    for i, line in enumerate(lines, 1):
        for cat, sev, rx, note in RULES:
            for m in re.finditer(rx, line, re.I):
                results[(cat,sev)].append({
                    'file': f.replace(ROOT+'/',''),
                    'line': i,
                    'note': note,
                    'match': m.group(0)[:60],
                    'context': line.strip()[:170],
                })

out='/tmp/claude-0/-home-claude/8aae4845-0ebd-53a3-8b1b-044ee68af890/scratchpad/audit_results.json'
json.dump({f'{k[0]}|{k[1]}':v for k,v in results.items()}, open(out,'w'), indent=1)

print(f"Files scanned: {len(files)}\n")
print(f"{'CATEGORY':<14}{'SEV':<6}{'HITS':>6}  {'FILES':>6}")
print('-'*40)
tot=0
for (cat,sev),v in sorted(results.items(), key=lambda x:(x[0][0], x[0][1]!='HIGH')):
    nf=len({h['file'] for h in v}); tot+=len(v)
    print(f"{cat:<14}{sev:<6}{len(v):>6}  {nf:>6}")
print('-'*40)
print(f"{'TOTAL':<20}{tot:>6}")
