# DATA SCHEMA

## Canonical source
`graph_catalysis_v7.json`

## Top-level keys

- `meta`
- `nodes`
- `edges`
- `paper_similarity_edges`
- `stories`

## Node identity
IDs are stable strings such as:
- `paper_*`
- `author_*`
- `topic_*`
- `method_*`
- `workflow_*`
- `program_*`

Do not rename existing IDs casually because edges refer to them.

## Paper node minimum
```json
{
  "id": "paper_example_2026",
  "label": "Paper title",
  "type": "paper",
  "year": 2026,
  "journal": "Journal",
  "doi": "10....",
  "url": "https://doi.org/...",
  "paper_type": "research",
  "relevance": "core catalysis",
  "chemistry": "...",
  "data_regime": "...",
  "validation": "...",
  "why": "...",
  "citations": "",
  "citation_date": ""
}
```

## Derived fields
Recompute after graph edits:
- `derived_authors`
- `derived_topics`
- `derived_methods`
- `derived_workflows`
- `paradigm`
- `groups`

## Similarity edges
These are derived and should be recomputed after metadata changes.
Never interpret them as citation edges.
