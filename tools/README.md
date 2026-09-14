# risk-audit.py

Scans every content file and template for claims that could create exposure.

Run it: `python3 tools/risk-audit.py`

Categories checked:

- STAT: unverified statistics (percentages, dollar ranges, ratios, "on average")
- PROMISE: guarantees, superlatives, absolutes, subjective offer promises
- LEGAL: imperative legal instructions, bare legality assertions
- TAX: tax outcome assertions
- FAIRHOUSING: area, crime, or buyer-type characterization
- BIZCLAIM: company claims needing verification (transaction count, reviews, BBB, tenure)
- HEALTH: health references
- COMPETITOR: named competitors and disparagement risk

It flags candidates, not errors. Many hits are correct usage. Full detail is written
to audit_results.json next to wherever you run it.

Run this before any content goes live, and after any batch of new articles.
