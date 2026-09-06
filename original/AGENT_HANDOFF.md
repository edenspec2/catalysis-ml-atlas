# AGENT HANDOFF — Catalysis ML Knowledge Graph / Atlas

**Project state:** v7  
**Handoff date:** 2026-09-06  
**Primary goal:** maintain and expand an interactive research knowledge graph of machine learning in catalysis, with emphasis on homogeneous/asymmetric catalysis, catalyst/ligand design, small-data ML, Bayesian/active learning, mechanistic ML, 3D representations, MLIPs, HTE/autonomous experimentation, and related literature.

## 1. Start here

Open:

- `catalysis_ml_atlas_v7.html` — current interactive visualization.
- `graph_catalysis_v7.json` — canonical graph data source.
- `papers_catalysis_v7.csv` — paper-centric table.
- `catalysis_ml_literature_knowledge_base.md` — narrative literature notebook and metadata analysis.

The HTML is intentionally a **single-file research atlas**. It uses CDN-loaded JavaScript libraries (`3d-force-graph`, `three.js`, `three-spritetext`) and embeds the graph data directly in the file.

## 2. User intent / design requirements

The user is a chemistry PhD researcher working in catalysis + ML. The graph should help answer research questions, not merely display metadata.

Important user preferences and requirements already implemented:

1. Dark / black visual style.
2. 3D network that can be rotated manually.
3. **No uncontrollable auto-spin.** Keep auto-rotation OFF by default.
4. Paper links should be directly accessible.
5. Clicking a selected node again should clear focus / go back.
6. A dedicated **Anat Milo** research neighborhood is important because she is the user's PI.
7. Prepared filtering for themes such as:
   - catalysis
   - deep learning
   - Bayesian optimization / active learning
   - HTE / autonomous labs
   - ligand discovery
   - mechanistic ML
   - transfer / few-shot
   - MLIPs / transition-state search
8. The user wants **paper-only views** in addition to metadata graphs.
9. The user wants workflows / scientific pipelines represented explicitly.
10. The tool should help reveal scientific trends, research gaps, competing representations, and group-specific research directions.

Do **not** regress to a constantly spinning force-graph demo or a dense all-node view as the default.

## 3. Current corpus

Current v7 graph statistics:

- Papers: **55**
- Total nodes: **555**
- Metadata edges: **767**
- Paper-to-paper similarity edges: **164**
- Curated story views: **6**

Node-type counts:

- author: 203
- method: 136
- paper: 55
- program: 1
- topic: 152
- workflow: 8

## 4. Data model

### Node types

`paper`
- bibliographic and interpretive metadata
- typical fields:
  - `id`
  - `label`
  - `type = "paper"`
  - `year`
  - `journal`
  - `doi`
  - `url`
  - `paper_type`
  - `relevance`
  - `chemistry`
  - `data_regime`
  - `validation`
  - `why`
  - `citations`
  - `citation_date`
  - `derived_authors`
  - `derived_topics`
  - `derived_methods`
  - `derived_workflows`
  - `paradigm`
  - `groups`

`author`
- `id`, `label`, `type = "author"`

`topic`
- conceptual research topic

`method`
- model / representation / experimental or computational method

`workflow`
- synthesis node representing a recurring research workflow; **not a paper**

`program`
- research-program / spotlight node, currently especially used for the Anat Milo cluster

### Metadata edge relations

Common edge types:
- `authored`: author → paper
- `about`: paper → topic
- `uses`: paper → method
- `exemplified_by`: workflow → paper
- `includes_work`: program → paper
- `emphasizes`: program → topic/method
- `led_by`: program → author
- `uses_or_targets`: workflow → topic/method

### Paper-to-paper similarity edges

Stored separately in `paper_similarity_edges`.

These edges are derived from overlaps in:
- authors
- topics
- methods
- workflows

Current weighting lineage in v6/v7:
- shared author: high weight
- shared workflow: medium-high
- shared topic: medium
- shared method: lower

Each similarity edge may have:
- `score`
- `reason`
- `density` (`sparse`, `normal`, `dense`)

These are **derived navigation edges**, not bibliographic citations.

## 5. Current visualization architecture

v7 intentionally separates three concepts:

### A. View — what nodes are shown
- Papers only
- Papers + authors
- Papers + topics
- Papers + methods
- Papers + workflows
- Full metadata graph

### B. Layout — how visible papers are organized
- Network
- Timeline
- Research paradigm
- PI / group

### C. Color — what color means
- Research paradigm
- PI / group
- Year
- Node type

This separation is important. Preserve it.

## 6. Current paradigm classifier

Papers are assigned a primary `paradigm`. Current categories include:

- Physical / interpretable
- 3D / deep learning
- Mechanistic ML
- Ligand-space / screening
- Bayesian / active learning
- Autonomous / HTE
- Transfer / few-shot
- MLIP / TS acceleration
- Inverse / generative
- Other / mixed

The classifier is intentionally interpretable and keyword/tag-driven. It is not a learned classifier.

A paper can conceptually belong to more than one category even though `paradigm` stores one primary category. A future version should consider:
- `primary_paradigm`
- `secondary_paradigms[]`

## 7. Current PI / group layer

Mapped groups currently include some of:

- Milo
- Sigman
- Doyle
- Hartwig
- Kulik
- Corminboeuf
- Schwaller
- Denmark
- Reid
- Abolhasani
- Sunoj
- Pidko
- Hong
- Other

The group label is derived from mapped author names. Multi-group papers can have multiple entries in `groups`.

### Anat Milo requirement

The Milo neighborhood should remain a first-class feature.

Relevant mapped directions include:
- target-specific dataset design
- reaction-scope prediction
- mechanistic modeling of cobalt HIE
- MoleCLIP / data-efficient learned representations
- small-data / interpretable catalysis

When extending the corpus, actively search for additional Milo-group catalysis / reaction prediction / representation papers and connect them to the program node.

## 8. Current curated story views

Current `stories` in the graph include:

- **2026 frontier**: Recent core catalysis at the representation, automation and physics frontier.
- **Small-data catalysis**: Sparse datasets, interpretable models, transfer and target-specific acquisition.
- **Autonomous catalysis**: Bayesian optimization, HTE, self-driving labs and closed-loop development.
- **Representation battle**: Physical descriptors vs ligand libraries vs 3D learned representations vs mechanistic states.
- **MLIP / TS layer**: Learned potentials and transition-state acceleration upstream of catalyst prediction.
- **Milo neighborhood**: Anat Milo and surrounding small-data, mechanistic and representation-learning literature.

Story filters should remain independent from layout and color.

## 9. Current important literature branches

The graph has deliberately emphasized these competing / complementary lineages:

### Reusable ligand representations
Examples:
- KRAKEN
- BUNNY
- reaction-agnostic ligand descriptor libraries
- bisphosphine descriptor databases

### Chemistry-first / interpretable small-data modeling
Examples:
- Sigman-style physical descriptors
- Reid local reaction-space work
- Denmark chemoinformatic catalyst selection
- mechanism-aware descriptor models

### Contextual mechanistic representations
Examples:
- catalyst-substrate / intermediate / TS contextual features
- Boltzmann / conformer-aware features
- mechanism-aware transfer

### Learned 3D representations
Examples:
- Hartwig/Perciano TS-informed 3D GNN work
- Libra-ML
- direct graph / learned representations

### Transfer and few-shot learning
Examples:
- Pd → Ni transfer learning
- meta-learning asymmetric catalysis
- sparse-data transferable selectivity models

### Bayesian / active / HTE
Examples:
- EDBO / EDBO+
- target-specific acquisition
- Minerva
- resource-efficient hydroformylation
- Flex-Cat
- Fast-Cat

### Physics acceleration
Examples:
- reactive MLIPs
- transition-state screening
- metadynamics + active learning
- foundation-MLIP / DFT perspectives

### Inverse catalyst design
Examples:
- Corminboeuf FLP design
- genetic / surrogate search over catalyst spaces

## 10. Metadata quality rules

The corpus is curated, not a formal systematic review.

**Important rule:** missing citation count means **not verified**, not zero.

Citation counts are date-stamped snapshots and can differ between:
- OpenAlex
- publisher sites
- Scopus
- Google Scholar

Do not silently mix citation providers.

Metadata completeness in current v7:

- year: 55/55 papers
- journal: 55/55 papers
- doi: 54/55 papers
- url: 55/55 papers
- chemistry: 55/55 papers
- data_regime: 55/55 papers
- validation: 55/55 papers
- why: 55/55 papers
- paradigm: 55/55 papers
- groups: 55/55 papers
- citations: 13/55 papers

### Verification standard for future additions

For each new paper, try to capture:

1. exact title
2. year
3. journal
4. DOI
5. stable paper URL
6. complete or clearly scoped author list
7. chemistry / catalytic transformation
8. dataset or experimental regime
9. model / representation / method
10. validation type
11. why it matters scientifically
12. topic tags
13. method tags
14. workflow connection
15. group / PI connection if applicable
16. citation count only if explicitly verified, with snapshot date

For contemporary literature, use current web verification.

## 11. Known limitations / technical debt

1. **HTML relies on CDNs.**
   - It may fail in a sandbox or offline environment.
   - A future robust version should vendor the required JS or provide a local-server option.

2. **Classification is mostly keyword/rule based.**
   - `paradigm` is useful but imperfect.
   - Papers with multiple paradigms are compressed to one primary label.

3. **Group assignment is author-name based.**
   - This can miss renamed/variant author spellings.
   - Normalize author identities more systematically.

4. **Paper-to-paper similarity is heuristic.**
   - Shared authors currently dominate.
   - Consider a configurable weighting UI.

5. **Some author lists may be incomplete.**
   - Especially older entries added during exploratory literature sweeps.

6. **Citation metadata is sparse.**
   - Do not infer missing counts.

7. **The corpus is biased toward groups deliberately investigated.**
   - It is not an unbiased census of catalysis ML.

8. **3D graph is visually useful but not always analytically optimal.**
   - Preserve 3D, but consider adding a stable 2D analytic view.

## 12. High-priority continuation tasks

### Priority 1 — Make the atlas easier to reason with
Recommended:
- add **secondary paradigm tags**
- add explicit **chemistry class**:
  - asymmetric hydrogenation
  - C-H activation / functionalization
  - cross-coupling
  - hydroformylation
  - organocatalysis
  - biocatalysis
  - main-group catalysis
  - electrocatalysis
  - etc.
- add **data regime** normalization:
  - n < 50
  - 50–200
  - 200–1000
  - >1000
  - virtual/computational
- add **validation regime**:
  - random split
  - scaffold/OOD
  - cross-substrate
  - cross-ligand
  - cross-reaction
  - prospective experimental
  - autonomous closed-loop

### Priority 2 — Improve scientific comparisons
Add preset comparison views:
- descriptors vs 3D learned representations
- free ligand vs catalyst-state representation
- small-data vs HTE
- retrospective vs prospective validation
- static descriptors vs conformer ensembles
- Bayesian selection vs diversity selection
- transfer across metals
- MLIP-generated physics vs DFT-generated physics

### Priority 3 — Expand literature systematically
Add more papers, especially:
- 2020–2024 foundations
- Denmark catalyst-selection / QSSR lineage
- Doyle reaction-development / Bayesian / transfer work
- Sigman descriptor + HTE + mechanism papers
- Milo group catalysis and representation papers
- Hartwig catalyst/selectivity modeling
- Kulik transition-metal-complex ML
- Corminboeuf inverse design
- Duarte reactive MLIPs
- Schwaller autonomous chemistry
- Jensen / Abolhasani self-driving catalysis
- Ackermann ML / electrochemical reaction optimization
- organocatalysis and biocatalysis ML
- negative / failure-analysis papers, not just success stories

### Priority 4 — Better layouts
Consider:
- 2D UMAP-like paper view based on metadata similarity
- Sankey / alluvial:
  `group → paradigm → chemistry → validation`
- matrix:
  `paper × method`
- timeline by research group
- group-to-group collaboration graph
- citation-impact vs generality scatter plot
- dataset-size vs representation-complexity plot

### Priority 5 — Robustness
- create an offline/local version of the atlas
- separate data (`graph.json`) from visualization source
- add a small build script so HTML is reproducible
- validate JSON schema automatically
- add duplicate-paper detection by DOI

## 13. Suggested project structure for next agent

```text
catalysis_ml_atlas/
├── AGENT_HANDOFF.md
├── README.md
├── DATA_SCHEMA.md
├── NEXT_STEPS.md
├── catalysis_ml_atlas_v7.html
├── graph_catalysis_v7.json
├── papers_catalysis_v7.csv
├── catalysis_ml_literature_knowledge_base.md
└── manifest.json
```

## 14. Safe editing workflow

When extending:

1. Load `graph_catalysis_v7.json`.
2. Add/modify paper nodes first.
3. Normalize authors/topics/methods.
4. Add metadata edges.
5. Recompute paper similarity edges.
6. Recompute derived paper fields (`derived_*`, `paradigm`, `groups`).
7. Regenerate CSV.
8. Regenerate HTML.
9. Verify:
   - paper count
   - duplicate DOI count
   - broken URLs / missing DOI where expected
   - every paper reachable in paper-only mode
   - Milo spotlight still works
   - auto-rotation remains OFF by default
10. Preserve previous version as a rollback artifact.

## 15. Scientific principles for the project

This project should not become a generic AI-paper catalog.

The user cares about:
- chemically meaningful representations
- small-data behavior
- physical interpretability
- conformer / Boltzmann ensembles
- stereoelectronic descriptors
- catalyst-state / mechanism-aware features
- transferability
- prospective experimental usefulness
- workflows that actually lead to better catalysts or reactions

When deciding whether to add a paper, prefer papers that clarify one of those questions.

## 16. Current project question to keep in mind

A central research theme motivating the atlas is:

> **What representation of a catalyst is sufficiently reusable to transfer across catalytic systems, while still being chemically contextual enough to capture the actual catalytic environment?**

Relevant competing answers currently represented:
- reusable free-ligand descriptor libraries
- chemist-designed local steric/electronic descriptors
- conformer/Boltzmann ensemble descriptors
- catalyst-substrate / intermediate descriptors
- TS-informed 3D GNNs
- pretrained learned molecular representations
- MLIP-generated physical ensembles

This question is especially relevant to the user's own research direction.

---

## 17. Deliverable expectation for the next agent

Do not only add papers.

A useful iteration should:
1. improve the data,
2. improve one scientific view,
3. improve one interaction / usability feature,
4. leave the graph in a reproducible state,
5. update this handoff or changelog.
