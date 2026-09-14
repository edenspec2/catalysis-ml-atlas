# Catalysis ML Atlas

Phone reading library and 3D research graph for machine learning in homogeneous catalysis.

**Live:** https://edenspec2.github.io/catalysis-ml-atlas/  
**Lab guide:** https://edenspec2.github.io/catalysis-ml-atlas/lab.html

## Run locally
```
npm ci
npm run build
npm test
npm run dev
```
Then open http://localhost:4173

## Use on a phone
Open the deployed URL in Safari or Chrome, then Add to Home Screen.
- Library: search papers, filter by chemistry / representation / Milo
- Inspect: n, validation, stack layer
- 3D atlas: rotate the graph (auto-rotate stays off)
- Export BibTeX for the current filter; Export my shelf to move saved / read / notes between browsers
- Propose a DOI: Discover latest → Details → Propose for the shared atlas (GitHub issue). Curators still write the scientific notes.

Saved papers stay on that phone/browser until you export the shelf. Keep PDFs in the group Zotero collection.

## Data
v7 corpus in `original/` is unchanged. `src/enrich.js` overlays Crossref years/authors, chemistry class, secondary paradigms, and representation class at build time.
Paper proposals use `.github/ISSUE_TEMPLATE/propose-paper.yml`.
