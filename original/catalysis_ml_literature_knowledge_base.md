---
title: Catalysis ML Literature Knowledge Base
snapshot_date: 2026-09-06
scope: Machine learning in catalysis, emphasizing 2025-2026 homogeneous and molecular catalysis plus selected foundational work
paper_count: 55
note: Executive counts below still describe the 4 Sep 2026 39-paper sweep. The live atlas is the 55-paper v7 graph plus v8 enrichment.
author_count: 121
topic_count: 119
method_count: 99
---

# Catalysis ML Literature Knowledge Base

> Snapshot: 4 September 2026. This file consolidates the papers and metadata collected for the catalysis-ML knowledge graph. It is designed as a living research notebook, not a formal systematic review.

## How to read this file

- **Core catalysis** means the ML or data-science method is applied directly to catalyst discovery, selectivity, mechanism, ligand design, or reaction optimization.
- **Catalysis-enabling methodology** means the method is broader but directly useful for catalytic ML workflows.
- **Overview** includes reviews, perspectives, and methodological viewpoints.
- **Citation counts are intentionally sparse.** Only counts explicitly retained in the graph are reported. Missing means not verified, not zero.
- Topic and method tags are reconstructed from graph edges, so papers can belong to several paradigms at once.

# 1. Executive synthesis

The collected literature suggests that catalysis ML in 2025-2026 is not converging on one modeling recipe. Several pipelines are instead becoming complementary:

1. **Physical and interpretable descriptors remain strong for small catalytic datasets.** Sigman-style multivariate models, steric/electronic descriptors, conformer ensembles, and mechanism-informed representations remain central when data are limited and chemical interpretation matters.
2. **3D learned representations are becoming a serious alternative.** Newer Hartwig/Perciano work uses mechanistically relevant 3D or transition-state-like structures as inputs to deep models, rather than asking the network to infer everything from 2D connectivity.
3. **Transfer learning is becoming chemically motivated.** Pd-to-Ni transfer and sparse-data transfer studies use shared mechanism or shared catalytic states to define what should transfer.
4. **Dataset design is becoming a scientific variable.** Target-specific acquisition, local reaction-space coverage, overlapping HTE matrices, negative controls, and uncertainty-guided experiment selection are increasingly treated as important as model architecture.
5. **Bayesian optimization and autonomous experimentation are operational.** Minerva, EDBO-style workflows, and Flex-Cat connect models directly to HTE and analytical feedback.
6. **MLIPs and transition-state acceleration are moving upstream.** Instead of using quantum chemistry only as a preprocessing bottleneck, newer workflows use learned potentials to accelerate conformer sampling, TS searches, pathways, and catalyst screening.
7. **Inverse design is emerging but remains constrained by representation quality and chemistry filters.** Virtual catalyst spaces become useful when synthetic accessibility, mechanism, and stability constraints are included.

## Central representation question

> Should a catalyst be represented by a reusable free-ligand vector, a chemistry-engineered descriptor set, or a reaction-contextual 3D catalytic state?

KRAKEN/BUNNY occupy the reusable-ligand end. Mechanism-aware ensemble models move toward contextual physical chemistry. Hartwig/Perciano-style models move toward learned 3D representations of mechanistically meaningful structures. Duarte/MLIP approaches attack the simulation bottleneck upstream.

# 2. Metadata overview

**Total mapped papers:** 39  
**Mapped authors with at least one paper:** 121  
**Mapped topics:** 119  
**Mapped methods:** 99  
**Proposed workflow nodes:** 8

## 2.1 Papers by year

| Year | Count |
|---|---:|
| 2025 | 24 |
| 2026 | 14 |
| 2022 | 1 |

## 2.2 Papers by relevance class

| Class | Count |
|---|---:|
| core catalysis | 32 |
| overview | 4 |
| catalysis-enabling methodology | 3 |

## 2.3 Papers by publication type

| Type | Count |
|---|---:|
| research | 34 |
| perspective | 2 |
| preprint | 1 |
| review | 1 |
| viewpoint | 1 |

## 2.4 Most represented journals

| Journal | Count |
|---|---:|
| JACS | 12 |
| ACS Catalysis | 9 |
| Chemical Science | 4 |
| Nature Communications | 3 |
| Nature | 2 |
| Digital Discovery | 2 |
| ACS Central Science | 2 |
| iScience | 1 |
| JCTC | 1 |
| Nature Catalysis | 1 |
| ChemRxiv | 1 |
| Chemistry - A European Journal | 1 |

# 3. Research-paradigm analysis

The categories below overlap by design. One paper may simultaneously be a descriptor paper, a mechanistic paper, and an HTE or optimization paper.

| Paradigm | Mapped papers | 2025 | 2026 | Interpretation |
|---|---:|---:|---:|---|
| Physical / interpretable descriptors | 11 | 6 | 4 | Still the strongest chemistry-first route for sparse catalytic datasets, especially selectivity and mechanism. |
| Deep learning / learned representations | 8 | 5 | 3 | Growing quickly, with a move from generic 2D graphs toward mechanistically selected 3D structures. |
| Transfer / few-shot / meta-learning | 5 | 3 | 2 | A route to reuse information across metals, ligand families, reactions, and data-poor targets. |
| Bayesian optimization / active learning | 6 | 4 | 2 | Moves ML from passive prediction to choosing the next experiment. |
| HTE / autonomous experimentation | 6 | 3 | 3 | Turns reaction optimization into a closed or semi-closed experimental loop. |
| Mechanism-aware / mechanistic ML | 6 | 5 | 1 | Uses proposed catalytic states or multiple mechanistic regimes rather than one global correlation. |
| MLIPs / transition-state acceleration | 4 | 3 | 1 | Targets the expensive physics layer and can make conformational and mechanistic exploration scalable. |
| Ligand-space / virtual screening | 9 | 5 | 3 | Precomputes or searches broad catalyst spaces before experimental testing. |
| Inverse / generative catalyst design | 4 | 2 | 2 | Searches from desired function toward structures, but depends strongly on chemical constraints and reliable surrogates. |

## 3.1 What appears to be changing from 2025 to 2026

- **Representation is becoming more contextual.** Free-molecule descriptors are increasingly supplemented by conformer ensembles, catalyst-substrate complexes, mechanistic states, and transition-state-informed 3D structures.
- **Deep learning is becoming more chemically supervised.** Rather than simply using a larger GNN, newer work increasingly uses chemical reasoning to decide which 3D state the network should see.
- **The experimental loop is becoming part of the model.** Bayesian optimization, HTE, uncertainty, and autonomy shift the question from what the model predicts to what should be measured next.
- **Transferability is becoming an explicit validation target.** Cross-metal, cross-ligand-family, cross-reaction, and structural OOD tests are becoming more informative than random splits.
- **Mechanistic heterogeneity is being treated as signal rather than noise.** Several studies allow different substrates or conditions to occupy different physical regimes.

# 4. Most represented authors / groups

| Author | Papers in this map |
|---|---:|
| Matthew S. Sigman | 12 |
| Anat Milo | 4 |
| David Dalmau | 4 |
| Jamie A. Cadge | 3 |
| Juan V. Alegre-Requena | 3 |
| Abigail G. Doyle | 2 |
| Clemence Corminboeuf | 2 |
| Gunther H. Weber | 2 |
| Inbal L. Eshel | 2 |
| John F. Hartwig | 2 |
| Jolene P. Reid | 2 |
| Jules Schleinitz | 2 |
| Masha Elkin | 2 |
| Matthew Avaylon | 2 |
| Michael W. Mahoney | 2 |
| Monica H. Perez-Temprano | 2 |
| N. Ian Rinehart | 2 |
| Nicholas Hadler | 2 |
| Philippe Schwaller | 2 |
| Ruben Laplaza | 2 |
| Sarah E. Reisman | 2 |
| Sergio Barranco | 2 |
| Simone Gallarati | 2 |
| Talita Perciano | 2 |
| Aida Nova | 1 |
| Ajnabiul Hoque | 1 |
| Alba Carretero-Cerdán | 1 |
| Aleria Garcia Roca | 1 |
| Alexander J. M. Miller | 1 |
| Alán Aspuru-Guzik | 1 |
| Amit H. Bermano | 1 |
| Andrea Palone | 1 |
| Ankit Mondal | 1 |
| Arnau Call | 1 |
| Blake E. Ocampo | 1 |

**Interpretation:** these are counts inside this curated graph, not career publication counts. They reflect the literature sweep and therefore over-represent the groups intentionally targeted.

# 5. Most common topics

| Topic | Connected papers |
|---|---:|
| Small data | 11 |
| Enantioselectivity | 8 |
| Asymmetric catalysis | 6 |
| Deep learning | 5 |
| Transfer learning | 4 |
| Bayesian optimization | 3 |
| Conformer ensembles | 3 |
| HTE | 3 |
| Homogeneous catalysis | 3 |
| Ligand optimization | 3 |
| Mechanistic discovery | 3 |
| Regioselectivity | 3 |
| Statistical modeling | 3 |
| 3D molecular representation | 2 |
| Active learning | 2 |
| Autonomous experimentation | 2 |
| Catalyst design | 2 |
| Catalyst discovery | 2 |
| Classification | 2 |
| Dataset design | 2 |
| Generative models | 2 |
| Hydroformylation | 2 |
| Interpretable ML | 2 |
| Ligand descriptor libraries | 2 |
| Ligand screening | 2 |
| MLIPs | 2 |
| Physical descriptors | 2 |
| Reactive MLIPs | 2 |
| AI roadmap | 1 |
| Automated featurization | 1 |
| Automated model selection | 1 |
| Automation | 1 |
| Benchmarking | 1 |
| Best practices | 1 |
| Boltzmann / ensemble representation | 1 |
| C-H functionalization | 1 |
| C-H oxidation | 1 |
| CO2 hydrogenation | 1 |
| Catalysis | 1 |
| Catalysis datasets | 1 |

# 6. Most common methods

| Method | Connected papers |
|---|---:|
| Statistical modeling | 5 |
| Random forest | 3 |
| DFT | 2 |
| DFT descriptors | 2 |
| Fine-tuning | 2 |
| High-throughput experimentation | 2 |
| Perspective | 2 |
| xTB | 2 |
| 3D deep learning | 1 |
| 3D graph neural network | 1 |
| Ab initio molecular dynamics | 1 |
| Acquisition functions | 1 |
| Atom-level attribution | 1 |
| Automated ML workflow | 1 |
| Automated TS database | 1 |
| Automated structure generation | 1 |
| Batch acquisition | 1 |
| Bayesian hyperparameter optimization | 1 |
| Benchmark task design | 1 |
| Boltzmann averaging | 1 |
| Bond-electron representation | 1 |
| Catalyst-structure representation | 1 |
| Catalytic-intermediate descriptors | 1 |
| Charge and steric descriptors | 1 |
| Chemistry-informed descriptors | 1 |
| Classification models | 1 |
| Clusterwise linear regression | 1 |
| Conformer selection | 1 |
| Contrastive representation learning | 1 |
| Cost-sensitive learning | 1 |
| Cross-metal overlap | 1 |
| DFT descriptor library | 1 |
| Data-driven screening | 1 |
| Delta learning | 1 |
| Descriptor analysis | 1 |
| Descriptor library | 1 |
| Diversity selection | 1 |
| EDBO+ | 1 |
| Equivariant message passing | 1 |
| Experimental mechanistic analysis | 1 |

# 7. Proposed workflow map

The workflow nodes below are synthesis constructs added to the knowledge graph. They are not paper titles. They summarize recurring pipelines across the literature.

## Autonomous HTE optimization workflow

Connect Bayesian optimization to HTE and analytics.

1. Search space
2. Initial HTE
3. Surrogate
4. Bayesian optimization
5. Next batch
6. Analytics
7. Update

**Representative mapped papers:** Minerva: Parallel Reaction Optimisation; Flex-Cat Autonomous Homogeneous Catalysis; Data Science Development of Heteroleptic Pd Fluorination Catalyst

## Direct GNN reaction workflow

Learn reaction/catalyst representations end-to-end from graphs instead of hand-built descriptors.

1. Graphs
2. Encoder
3. Reaction aggregation
4. GNN/Transformer
5. Prediction
6. Attribution
7. OOD validation

**Representative mapped papers:** HCat-GNet; ML for Catalytic Asymmetric Reactions of Simple Alkenes; Data-Efficient Molecular Image Representation Learning (MoleCLIP)

## Few-shot / meta-learning workflow

Learn across tasks, then adapt to a new catalytic task using very few examples.

1. Multi-task corpus
2. Shared representation
3. Task training
4. Few-shot examples
5. Adapt
6. Validate

**Representative mapped papers:** Meta-learning for Asymmetric Catalysis; Pd to Ni Transfer Learning for Atroposelective Suzuki Coupling; Data-Efficient Molecular Image Representation Learning (MoleCLIP)

## Mechanism-aware transfer workflow

Represent catalyst, substrate, and mechanistic state, then transfer across related reactions.

1. Mechanistic hypothesis
2. Catalyst-state templates
3. Conformer ensemble
4. Cheap QM
5. Contextual features
6. Transfer model
7. OOD prediction
8. Experiment

**Representative mapped papers:** Transferable Enantioselectivity Models from Sparse Data; Pd to Ni Transfer Learning for Atroposelective Suzuki Coupling; Data-Driven Mechanistic Analysis of Co(III) Hydrogen Isotope Exchange; Statistical Modeling in Ligand-Controlled Bismuth Catalysis

## Reactive MLIP mechanism workflow

Build a reactive potential with active learning and use it for pathways and sampling.

1. Initial QM
2. Train MLIP
3. Enhanced sampling
4. Uncertainty
5. New QM
6. Retrain
7. Mechanistic analysis

**Representative mapped papers:** CaTS: Transition-State Screening for Catalyst Discovery; Reactive ML Potential for Organometallic TS Search and Ligand Screening; Active Learning + Metadynamics for Reactive MLIPs

## Reusable ligand-space workflow

Precompute ligand space, select a compact experimental screen, fit a model, then search the full ligand space.

1. Ligand library
2. Conformer generation
3. Descriptors
4. Diversity selection
5. Small screen
6. Model
7. Virtual ranking
8. Prospective test

**Representative mapped papers:** KRAKEN: Organophosphorus Ligand Discovery Platform; BUNNY N,N-Bidentate Ligand Descriptor Library; Data Science-Guided Ni Homo-Diels-Alder; Data-Driven Discovery of N-Oxyl HAT Catalysts

## TS-informed 3D deep-learning workflow

Use mechanistically relevant 3D catalyst-substrate or transition-state structures as learned representations.

1. Experimental outcomes
2. 3D mechanistic structures
3. TS/catalyst representation
4. 3D GNN
5. Baseline comparison
6. Structural extrapolation
7. Prospective prediction

**Representative mapped papers:** 3D Deep Learning for Ru Ketone Hydrogenation Enantioselectivity; Libra-ML for Rh Hydroformylation Regioselectivity

## Target-specific active-learning workflow

Choose the next experiments to maximize information for a specific target.

1. Seed data
2. Model + uncertainty
3. Acquisition
4. Experiment
5. Retrain
6. Repeat

**Representative mapped papers:** Target-specific Data Sets for Regioselectivity; Local Reaction Space in Asymmetric Catalysis; Probability Guided Chemical Reaction Scopes

# 8. Anat Milo research cluster

**Mapped Milo papers:** 4

- **[Data-Driven Mechanistic Analysis of Co(III) Hydrogen Isotope Exchange](https://doi.org/10.1038/s41929-025-01447-x)** (2025, Nature Catalysis)
  - Shows reaction conditions can switch the operative catalytic mechanism.
- **[Data-Efficient Molecular Image Representation Learning (MoleCLIP)](https://doi.org/10.1039/D5SC00907C)** (2025, Chemical Science)
  - Milo-group alternative to handcrafted descriptors for data-efficient catalysis tasks.
- **[Probability Guided Chemical Reaction Scopes](https://www.cambridge.org/engage/chemrxiv/article-details/67a66bde6dde43c908fb7a13)** (2025, ChemRxiv)
  - Reframes reaction scope as a probabilistic condition-suitability problem.
- **[Target-specific Data Sets for Regioselectivity](https://doi.org/10.1021/jacs.4c15902)** (2025, JACS)
  - Shows that strategically chosen small datasets can beat larger random datasets.

## 8.1 Milo cluster themes

**Topics:** Small data (3), Cobalt catalysis (1), Hydrogen isotope exchange (1), Mechanistic discovery (1), Reaction conditions (1), Statistical modeling (1), Catalysis datasets (1), Deep learning (1), Foundation models (1), Molecular representation learning (1), Catalysis (1), Classification (1), Prospective prediction (1), Reaction-scope design (1), Active learning (1), Dataset design (1), Regioselectivity (1)

**Methods:** Catalytic-intermediate descriptors (1), Experimental mechanistic analysis (1), Multivariable linear regression (1), Contrastive representation learning (1), Fine-tuning (1), Image foundation model (1), Probabilistic classification (1), Reaction-condition classification (1), Acquisition functions (1), Target-specific sampling (1), Uncertainty (1)

## 8.2 Repeated collaborators in the mapped Milo subset

| Collaborator | Shared mapped papers |
|---|---:|
| Inbal L. Eshel | 2 |
| Monica H. Perez-Temprano | 2 |
| Sergio Barranco | 2 |
| Jiayu Zhang | 1 |
| Marco Di Matteo | 1 |
| Amit H. Bermano | 1 |
| Hadas Shalit Peleg | 1 |
| Yonatan Harnik | 1 |
| Shahar Barkai | 1 |
| Alba Carretero-Cerdán | 1 |
| Jules Schleinitz | 1 |
| Sarah E. Reisman | 1 |

## 8.3 Position of the Milo program relative to the wider field

The mapped Milo work sits at the intersection of three directions:

1. **Chemically interpretable and mechanistic modeling**, exemplified by the Co(III) hydrogen-isotope-exchange work.
2. **Dataset and scope design**, including target-specific data acquisition and probability-guided reaction-scope prediction.
3. **Data-efficient learned representations**, represented by MoleCLIP.

This creates a bridge between the chemistry-first small-data tradition and newer representation-learning and transfer-learning approaches.

# 9. Citation metadata

Only citation counts explicitly stored in the graph are included. Missing counts mean not checked or not retained, not zero.

| Paper | Verified cited-by count | Snapshot |
|---|---:|---|
| [KRAKEN: Organophosphorus Ligand Discovery Platform](https://doi.org/10.1021/jacs.1c09718) | 293 | 2026-09-03 |
| [FlowER: Electron Flow Matching](https://doi.org/10.1038/s41586-025-09426-9) | 18 | 2026-09-03 |
| [Minerva: Parallel Reaction Optimisation](https://doi.org/10.1038/s41467-025-61803-0) | 16 | 2026-09-03 |
| [Target-specific Data Sets for Regioselectivity](https://doi.org/10.1021/jacs.4c15902) | 13 | 2026-09-03 |
| [Active Learning + Metadynamics for Reactive MLIPs](https://doi.org/10.1039/D5DD00261C) | 9 | 2026-09-03 |
| [Meta-learning for Asymmetric Catalysis](https://doi.org/10.1038/s41467-025-58854-8) | 6 | 2026-09-03 |
| [Conformer-weighted Bisphosphine Descriptor Library](https://doi.org/10.1039/D5SC04691B) | 4 | 2026-09-03 |
| [Transferable Enantioselectivity Models from Sparse Data](https://doi.org/10.1038/s41586-026-10239-7) | 3 | 2026-09-03 |
| [Data Science-Guided Ni Homo-Diels-Alder](https://doi.org/10.1021/jacs.5c09948) | 3 | 2026-09-03 |

# 10. Full paper index

| # | Year | Paper | Journal | Class | Type | Authors | Topics | Methods |
|---:|---:|---|---|---|---|---|---|---|
| 1 | 2026 | [3D Deep Learning for Ru Ketone Hydrogenation Enantioselectivity](https://doi.org/10.1021/jacs.6c07313) | JACS | core catalysis | research | Evelyn Ramirez, Gunther H. Weber, Jan Gerit Brandenburg, John F. Hartwig, Joscha Hoche, Masha Elkin, +5 more | 3D molecular representation, Asymmetric catalysis, Deep learning, Enantioselectivity, HTE, +1 more | 3D graph neural network, High-throughput experimentation, Transition-state-informed representation |
| 2 | 2026 | [50,688-Reaction C–N Coupling Dataset](https://doi.org/10.1021/jacs.6c05959) | JACS | core catalysis | research | Jayabrata Das, Tim Cernak, Xueying Zhang | Benchmarking, Large experimental datasets, Mechanistic diversity, Negative controls, Transferability | Benchmark task design, Cross-metal overlap, Systematic HTE |
| 3 | 2026 | [Boosting Computational Catalysis and Reactivity with AI](https://doi.org/10.1021/jacs.5c17786) | JACS | overview | perspective | Clemence Corminboeuf, Kjell Jorner, Philippe Schwaller | Computational catalysis, Generative AI, LLMs, MLIPs, Reaction discovery | Perspective |
| 4 | 2026 | [BUNNY N,N-Bidentate Ligand Descriptor Library](https://doi.org/10.1021/acscatal.6c02585) | ACS Catalysis | core catalysis | research | Abigail G. Doyle, Jules Schleinitz, Matthew S. Sigman, Neyci E. Gutiérrez-Valencia, Therese H. Wild | Cross-scaffold modeling, Ligand descriptor libraries, Mechanistic interpretation, Transfer learning | DFT descriptor library, Diversity selection, Statistical modeling |
| 5 | 2026 | [Cost-Effective QM Workflows for Molecular ML](https://doi.org/10.1021/acscatal.6c02583) | ACS Catalysis | core catalysis | research | David Dalmau, Juan V. Alegre-Requena, Matthew S. Sigman | Automated featurization, Cheap QM, Descriptor pipelines, Small data | Automated ML workflow, MORFEUS, RDKit, xTB |
| 6 | 2026 | [Flex-Cat Autonomous Homogeneous Catalysis](https://doi.org/10.1038/s41467-026-74425-x) | Nature Communications | core catalysis | research | Alexander J. M. Miller, Milad Abolhasani | Autonomous experimentation, Bayesian optimization, HTE, Hydroformylation, Ligand optimization | GC-FID feedback, Gaussian-process surrogate, Hierarchical Bayesian optimization, Robotic experimentation |
| 7 | 2026 | [Foundation MLIPs and DFT in Homogeneous Catalysis](https://doi.org/10.1002/chem.71022) | Chemistry - A European Journal | overview | perspective | Julen Munarriz, Maxime Ferrer, Ruben Laplaza, Thijs Stuyver | DFT, Foundation MLIPs, Homogeneous catalysis, Transition states, Uncertainty | Perspective |
| 8 | 2026 | [Inverse Design of FLPs for CO2 Hydrogenation](https://doi.org/10.1039/D5SC09530A) | Chemical Science | core catalysis | research | Clemence Corminboeuf, Ruben Laplaza, Shubhajit Das, Thanapat Worakul | CO2 hydrogenation, Design rules, Inverse catalyst design, Metal-free catalysis, Virtual chemical space | Genetic algorithm, Surrogate models, Synthetic-complexity constraints |
| 9 | 2026 | [Libra-ML for Rh Hydroformylation Regioselectivity](https://doi.org/10.1021/jacs.6c11602) | JACS | core catalysis | research | Golsa Gheibi, Gunther H. Weber, Jeremy Nicolai, Jiaqing Chen, John F. Hartwig, Masha Elkin, +6 more | 3D molecular representation, Deep learning, Hydroformylation, Regioselectivity, Transition-metal catalysis | 3D deep learning, Catalyst-structure representation, Libra-ML |
| 10 | 2026 | [ML for Catalytic Asymmetric Reactions of Simple Alkenes](https://doi.org/10.1039/D5DD00483G) | Digital Discovery | core catalysis | research | Ajnabiul Hoque, Divya Chenna, Nupur Jain, Raghavan B. Sunoj | Asymmetric catalysis, Enantioselectivity, Imbalanced data, Representation comparison, Small data | Cost-sensitive learning, Fingerprints, Graph representations, SMILES models |
| 11 | 2026 | [ML in Homogeneous Catalysis: Basic Concepts and Best Practices](https://doi.org/10.1021/acscatal.5c06439) | ACS Catalysis | overview | viewpoint | David Dalmau, Juan V. Alegre-Requena, Susana Garcia-Abellan | Best practices, Homogeneous catalysis, Model validation, Small data | Viewpoint / methodology guidance |
| 12 | 2026 | [ML-Assisted Ligand Optimization in Shearilicine Synthesis](https://doi.org/10.1021/jacs.5c21637) | JACS | core catalysis | research | Fu-Qiang Ni, Z. Wang | Asymmetric catalysis, Ligand optimization, Synthetic application, Virtual screening | Support vector regression, Virtual ligand screening |
| 13 | 2026 | [Predictive Statistical Analysis of Au(I) C-H Functionalization Selectivity](https://doi.org/10.1021/acscatal.6c03184) | ACS Catalysis | core catalysis | research | Matthew S. Sigman, Omar Arto, Pablo Barrio, Shounak Hinge, Simone Gallarati | C-H functionalization, Conformational effects, Diastereoselectivity, Interpretable ML, Regioselectivity | Multivariate regression, Steric descriptors, Univariate regression |
| 14 | 2026 | [Transferable Enantioselectivity Models from Sparse Data](https://doi.org/10.1038/s41586-026-10239-7) | Nature | core catalysis | research | Abigail G. Doyle, Erin M. Bucci, Matthew S. Sigman, Simone Gallarati | Conformer ensembles, Enantioselectivity, Mechanism-aware descriptors, Small data, Transfer learning | Boltzmann averaging, Statistical modeling, TS/intermediate ensembles, xTB |
| 15 | 2025 | [Active Learning + Metadynamics for Reactive MLIPs](https://doi.org/10.1039/D5DD00261C) | Digital Discovery | core catalysis | research | Fernanda Duarte, Hanwen Zhang, Tristan Johnston-Wood, Valdas Vitartas, Veronika Jurásková | Active learning, Enhanced sampling, Reaction dynamics, Reactive MLIPs | Iterative QM labeling, Machine-learned interatomic potentials, Metadynamics |
| 16 | 2025 | [AI Approaches to Homogeneous Catalysis with Transition Metal Complexes](https://doi.org/10.1021/acscatal.5c01202) | ACS Catalysis | overview | review | Aida Nova, Carlos Moran-Gonzalez, Jonathan Burnage, Vladimir Balcells | AI roadmap, Automation, Catalyst design, Generative models, Homogeneous catalysis | Review / perspective |
| 17 | 2025 | [CaTS: Transition-State Screening for Catalyst Discovery](https://doi.org/10.1021/acscatal.5c03945) | ACS Catalysis | catalysis-enabling methodology | research | Huasheng Feng, Jiangjie Qiu, Jun Yin, Wentao Li, Xiangya Xu | Catalyst discovery, Deep learning, High-throughput computation, MLIPs, Transition-state screening | Automated structure generation, Machine-learning force field, NEB, SHAP |
| 18 | 2025 | [Conformer-weighted Bisphosphine Descriptor Library](https://doi.org/10.1039/D5SC04691B) | Chemical Science | core catalysis | research | Jamie A. Cadge, Matthew S. Sigman, Sierra D. Hart | Boltzmann / ensemble representation, Conformer ensembles, Ligand descriptors, Small data | Conformer selection, Statistical modeling, Weighted physical descriptors |
| 19 | 2025 | [Data Science Development of Heteroleptic Pd Fluorination Catalyst](https://doi.org/10.1021/jacs.5c11929) | JACS | core catalysis | research | Aleria Garcia Roca, David Dalmau, Matthew S. Sigman, Mohammad H. Samha, Serhii Vasylevskyi, Shubham Deolka | Bayesian optimization, Catalyst development, HTE, Palladium catalysis, Substrate-scope design | EDBO+, High-throughput experimentation, Multi-objective Bayesian optimization, Random forest |
| 20 | 2025 | [Data Science-Guided Ni Homo-Diels-Alder](https://doi.org/10.1021/jacs.5c09948) | JACS | core catalysis | research | Cedric Lozano, Jamie A. Cadge, Matthew S. Sigman, Sarah E. Reisman | Classification, KRAKEN, Ligand screening, Reaction development | Classification models, Descriptor library, Experimental validation |
| 21 | 2025 | [Data-Driven Discovery of N-Oxyl HAT Catalysts](https://doi.org/10.1021/acscentsci.4c01919) | ACS Central Science | core catalysis | research | Cheng Yang, Corey R. J. Stephenson, Matthew S. Sigman, Stephen Maldonado, Therese Wild, Yulia Rakova | Catalyst discovery, Descriptor screening, Experimental validation, HAT catalysis | Data-driven screening, Physical descriptors, Statistical modeling |
| 22 | 2025 | [Data-Driven Mechanistic Analysis of Co(III) Hydrogen Isotope Exchange](https://doi.org/10.1038/s41929-025-01447-x) | Nature Catalysis | core catalysis | research | Anat Milo, Inbal L. Eshel, Jiayu Zhang, Marco Di Matteo, Monica H. Perez-Temprano, Sergio Barranco | Cobalt catalysis, Hydrogen isotope exchange, Mechanistic discovery, Reaction conditions, Statistical modeling | Catalytic-intermediate descriptors, Experimental mechanistic analysis, Multivariable linear regression |
| 23 | 2025 | [Data-Efficient Molecular Image Representation Learning (MoleCLIP)](https://doi.org/10.1039/D5SC00907C) | Chemical Science | catalysis-enabling methodology | research | Amit H. Bermano, Anat Milo, Hadas Shalit Peleg, Yonatan Harnik | Catalysis datasets, Deep learning, Foundation models, Molecular representation learning, Small data | Contrastive representation learning, Fine-tuning, Image foundation model |
| 24 | 2025 | [FlowER: Electron Flow Matching](https://doi.org/10.1038/s41586-025-09426-9) | Nature | core catalysis | research | Connor W. Coley, Joonyoung F. Joung | Chemical constraints, Generative models, Mechanism prediction, Reaction foundation models | Bond-electron representation, Fine-tuning, Flow matching |
| 25 | 2025 | [HCat-GNet](https://doi.org/10.1016/j.isci.2025.111881) | iScience | core catalysis | research | Eduardo Aguilar-Bejarano, Grazziela P. Figueredo, Simon Woodward | Enantioselectivity, Graph neural networks, Interpretability, Ligand optimization | Atom-level attribution, GNN, SMILES / graph representation |
| 26 | 2025 | [Local Reaction Space in Asymmetric Catalysis](https://doi.org/10.1021/acscatal.5c01051) | ACS Catalysis | core catalysis | research | Jolene P. Reid | Asymmetric catalysis, Dataset design, Enantioselectivity, Local reaction space, Small data | Radius-based random forest, Random forest, Targeted training-set design |
| 27 | 2025 | [Meta-learning for Asymmetric Catalysis](https://doi.org/10.1038/s41467-025-58854-8) | Nature Communications | core catalysis | research | José Miguel Hernández-Lobato, Sukriti Singh | Enantioselectivity, Few-shot learning, Meta-learning, Transfer learning | Few-shot prediction, Prototypical networks |
| 28 | 2025 | [Minerva: Parallel Reaction Optimisation](https://doi.org/10.1038/s41467-025-61803-0) | Nature Communications | core catalysis | research | Joshua W. Sin, Philippe Schwaller, Siu Lun Chau | Autonomous experimentation, Bayesian optimization, High-throughput experimentation, Multi-objective optimization | Batch acquisition, HTE automation, Surrogate modeling |
| 29 | 2025 | [ML Workflows Beyond Linear Models in Low-Data Regimes](https://doi.org/10.1039/D5SC00996K) | Chemical Science | catalysis-enabling methodology | research | David Dalmau, Juan V. Alegre-Requena, Matthew S. Sigman | Automated model selection, Catalysis workflows, Nonlinear models, Small data | Bayesian hyperparameter optimization, Gradient boosting, ROBERT, Random forest |
| 30 | 2025 | [Pd to Ni Transfer Learning for Atroposelective Suzuki Coupling](https://doi.org/10.1021/jacs.5c00838) | JACS | core catalysis | research | Li-Cheng Xu, Li-Gao Liu, Shuo-Qing Zhang, Xin Hong, Xin-Yuan Xu | Asymmetric catalysis, Cross-metal transfer, Ligand prediction, Small data, Transfer learning | Delta learning, Similarity-based sampling, Transfer learning |
| 31 | 2025 | [Predictive Modeling of Enantioselective Mn C-H Oxidation](https://doi.org/10.1021/acscatal.4c05659) | ACS Catalysis | core catalysis | research | Andrea Palone, Arnau Call, Jordan P. Liles, Matthew S. Sigman, Miquel Costas | C-H oxidation, Enantioselectivity, Manganese catalysis, Physical descriptors, Statistical modeling | DFT descriptors, Multiple linear regression, Predictive statistical modeling |
| 32 | 2025 | [Probability Guided Chemical Reaction Scopes](https://www.cambridge.org/engage/chemrxiv/article-details/67a66bde6dde43c908fb7a13) | ChemRxiv | core catalysis | preprint | Anat Milo, Inbal L. Eshel, Monica H. Perez-Temprano, Sergio Barranco, Shahar Barkai | Catalysis, Classification, Prospective prediction, Reaction-scope design, Small data | Probabilistic classification, Reaction-condition classification |
| 33 | 2025 | [QM + ML Design of Low-Valent Fe Catalysts for N2 Reduction](https://doi.org/10.1021/jacs.5c00099) | JACS | core catalysis | research | Ankit Mondal, Chandrasekhar Nettem, Gopalan Rajaraman | Catalyst design, Mechanistic ML, Nitrogen reduction, Quantum chemistry, Transition-metal complexes | Ab initio molecular dynamics, DFT, Machine learning |
| 34 | 2025 | [Reactive ML Potential for Organometallic TS Search and Ligand Screening](https://doi.org/10.1021/acs.jctc.5c01047) | JCTC | core catalysis | research | Kun Tang, Qilei Liu, Yujing Zhao | Deep learning, Ligand screening, Organometallic catalysis, Reactive MLIPs, Transition-state search | Automated TS database, Equivariant message passing, Reactive machine-learning potential |
| 35 | 2025 | [Sharpless AD Enantioselectivity Prediction](https://doi.org/10.1021/acscentsci.5c00900) | ACS Central Science | core catalysis | research | Blake E. Ocampo, Scott E. Denmark | Enantioselectivity, Literature mining, Physical descriptors, Prospective validation | Chemistry-informed descriptors, Statistical / ML modeling |
| 36 | 2025 | [Statistical Modeling in Ligand-Controlled Bismuth Catalysis](https://doi.org/10.1021/jacs.5c11854) | JACS | core catalysis | research | Hoonchul Choi, Jamie A. Cadge, Josep Cornella, Lucas Mele, Matthew S. Sigman, Philipp D. Engel, +1 more | Chemodivergence, Ligand effects, Main-group catalysis, Mechanistic discovery, Statistical modeling | Charge and steric descriptors, DFT, Statistical modeling |
| 37 | 2025 | [Target-specific Data Sets for Regioselectivity](https://doi.org/10.1021/jacs.4c15902) | JACS | core catalysis | research | Alba Carretero-Cerdán, Anat Milo, Jules Schleinitz, Sarah E. Reisman | Active learning, Dataset design, Regioselectivity, Small data | Acquisition functions, Target-specific sampling, Uncertainty |
| 38 | 2025 | [Top-Down Mechanistic Elucidation with ML](https://doi.org/10.1021/acscatal.5c02264) | ACS Catalysis | core catalysis | research | Jolene P. Reid | Asymmetric catalysis, Interpretable ML, Mechanistic discovery, Model heterogeneity | Clusterwise linear regression, Descriptor analysis |
| 39 | 2022 | [KRAKEN: Organophosphorus Ligand Discovery Platform](https://doi.org/10.1021/jacs.1c09718) | JACS | core catalysis | research | Alán Aspuru-Guzik, Gabriel dos Passos Gomes, Matthew S. Sigman, Tobias Gensch | Catalyst screening, Conformer ensembles, Ligand descriptor libraries, Virtual ligand space | DFT descriptors, ML surrogate models, PCA / chemical-space mapping |

# 11. Detailed paper records

## 1. 3D Deep Learning for Ru Ketone Hydrogenation Enantioselectivity

**Metadata:** 2026 | JACS | research | core catalysis

- **Authors:** Evelyn Ramirez, Gunther H. Weber, Jan Gerit Brandenburg, John F. Hartwig, Joscha Hoche, Masha Elkin, Matthew Avaylon, Michael W. Mahoney, N. Ian Rinehart, Nicholas Hadler, Talita Perciano
- **DOI:** 10.1021/jacs.6c07313
- **Paper link:** https://doi.org/10.1021/jacs.6c07313
- **Chemistry:** Noyori-type Ru-catalyzed ketone hydrogenation
- **Data regime:** Literature data plus >1,000 in-house HTE examples
- **Validation:** Extrapolation to structures distinct from training
- **Topics:** 3D molecular representation, Asymmetric catalysis, Deep learning, Enantioselectivity, HTE, Transition-state representation
- **Methods:** 3D graph neural network, High-throughput experimentation, Transition-state-informed representation
- **Workflow(s):** TS-informed 3D deep-learning workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Major move toward learned 3D representations built on enantiodetermining TS geometry.

## 2. 50,688-Reaction C–N Coupling Dataset

**Metadata:** 2026 | JACS | research | core catalysis

- **Authors:** Jayabrata Das, Tim Cernak, Xueying Zhang
- **DOI:** 10.1021/jacs.6c05959
- **Paper link:** https://doi.org/10.1021/jacs.6c05959
- **Chemistry:** Pd/Ni/Cu C–N coupling
- **Data regime:** 50,688 reactions; 33 complexes; 166 ligands; 17 bases; 4 solvents; 3 temperatures
- **Validation:** Dense cross-metal condition overlap and metal-free controls
- **Topics:** Benchmarking, Large experimental datasets, Mechanistic diversity, Negative controls, Transferability
- **Methods:** Benchmark task design, Cross-metal overlap, Systematic HTE
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Demonstrates that dataset architecture and controls can be more important than simply maximizing substrate diversity.

## 3. Boosting Computational Catalysis and Reactivity with AI

**Metadata:** 2026 | JACS | perspective | overview

- **Authors:** Clemence Corminboeuf, Kjell Jorner, Philippe Schwaller
- **DOI:** 10.1021/jacs.5c17786
- **Paper link:** https://doi.org/10.1021/jacs.5c17786
- **Chemistry:** Computational catalysis and chemical reactivity
- **Data regime:** Perspective
- **Validation:** N/A
- **Topics:** Computational catalysis, Generative AI, LLMs, MLIPs, Reaction discovery
- **Methods:** Perspective
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Connects ML potentials, generative models, LLMs, mechanism, and automation in one roadmap.

## 4. BUNNY N,N-Bidentate Ligand Descriptor Library

**Metadata:** 2026 | ACS Catalysis | research | core catalysis

- **Authors:** Abigail G. Doyle, Jules Schleinitz, Matthew S. Sigman, Neyci E. Gutiérrez-Valencia, Therese H. Wild
- **DOI:** 10.1021/acscatal.6c02585
- **Paper link:** https://doi.org/10.1021/acscatal.6c02585
- **Chemistry:** Ni cross-electrophile coupling; N,N-bidentate ligands
- **Data regime:** ~1,100 ligands; 31-ligand representative screen
- **Validation:** Two Ni-CEC case studies; cross-ligand-family modeling
- **Topics:** Cross-scaffold modeling, Ligand descriptor libraries, Mechanistic interpretation, Transfer learning
- **Methods:** DFT descriptor library, Diversity selection, Statistical modeling
- **Workflow(s):** Reusable ligand-space workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Extends reusable ligand-space ideas beyond phosphines to N,N-bidentate ligands.

## 5. Cost-Effective QM Workflows for Molecular ML

**Metadata:** 2026 | ACS Catalysis | research | core catalysis

- **Authors:** David Dalmau, Juan V. Alegre-Requena, Matthew S. Sigman
- **DOI:** 10.1021/acscatal.6c02583
- **Paper link:** https://doi.org/10.1021/acscatal.6c02583
- **Chemistry:** General molecular ML / catalysis examples
- **Data regime:** Low-cost descriptor generation across molecular datasets
- **Validation:** Benchmarks against higher-cost QM descriptor workflows
- **Topics:** Automated featurization, Cheap QM, Descriptor pipelines, Small data
- **Methods:** Automated ML workflow, MORFEUS, RDKit, xTB
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Turns physical descriptor generation into reusable software infrastructure.

## 6. Flex-Cat Autonomous Homogeneous Catalysis

**Metadata:** 2026 | Nature Communications | research | core catalysis

- **Authors:** Alexander J. M. Miller, Milad Abolhasani
- **DOI:** 10.1038/s41467-026-74425-x
- **Paper link:** https://doi.org/10.1038/s41467-026-74425-x
- **Chemistry:** Rh-catalyzed hydroformylation
- **Data regime:** 680 experiments; 16 phosphorus ligands; mixed discrete/continuous search
- **Validation:** Closed-loop optimization of activity and regioselectivity
- **Topics:** Autonomous experimentation, Bayesian optimization, HTE, Hydroformylation, Ligand optimization
- **Methods:** GC-FID feedback, Gaussian-process surrogate, Hierarchical Bayesian optimization, Robotic experimentation
- **Workflow(s):** Autonomous HTE optimization workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Current benchmark for physically closed-loop homogeneous catalyst optimization.

## 7. Foundation MLIPs and DFT in Homogeneous Catalysis

**Metadata:** 2026 | Chemistry - A European Journal | perspective | overview

- **Authors:** Julen Munarriz, Maxime Ferrer, Ruben Laplaza, Thijs Stuyver
- **DOI:** 10.1002/chem.71022
- **Paper link:** https://doi.org/10.1002/chem.71022
- **Chemistry:** Homogeneous catalysis and mechanistic computation
- **Data regime:** Perspective
- **Validation:** N/A
- **Topics:** DFT, Foundation MLIPs, Homogeneous catalysis, Transition states, Uncertainty
- **Methods:** Perspective
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Frames the emerging division of labor between fast foundation potentials and high-accuracy electronic structure.

## 8. Inverse Design of FLPs for CO2 Hydrogenation

**Metadata:** 2026 | Chemical Science | research | core catalysis

- **Authors:** Clemence Corminboeuf, Ruben Laplaza, Shubhajit Das, Thanapat Worakul
- **DOI:** 10.1039/D5SC09530A
- **Paper link:** https://doi.org/10.1039/D5SC09530A
- **Chemistry:** Frustrated Lewis pair catalysis for direct CO2 hydrogenation
- **Data regime:** Virtual space on the order of 10^9 FLP candidates
- **Validation:** Mechanistic design rules plus constrained optimization
- **Topics:** CO2 hydrogenation, Design rules, Inverse catalyst design, Metal-free catalysis, Virtual chemical space
- **Methods:** Genetic algorithm, Surrogate models, Synthetic-complexity constraints
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

A strong example of inverse catalyst design over a huge chemically defined space.

## 9. Libra-ML for Rh Hydroformylation Regioselectivity

**Metadata:** 2026 | JACS | research | core catalysis

- **Authors:** Golsa Gheibi, Gunther H. Weber, Jeremy Nicolai, Jiaqing Chen, John F. Hartwig, Masha Elkin, Matthew Avaylon, Michael W. Mahoney, N. Ian Rinehart, Nicholas Hadler, Ross Maciejewski, Talita Perciano
- **DOI:** 10.1021/jacs.6c11602
- **Paper link:** https://doi.org/10.1021/jacs.6c11602
- **Chemistry:** Rh-catalyzed hydroformylation of terminal olefins
- **Data regime:** Experimental catalyst/substrate outcomes with 3D catalyst representations
- **Validation:** Comparison with existing representations and out-of-sample outcomes
- **Topics:** 3D molecular representation, Deep learning, Hydroformylation, Regioselectivity, Transition-metal catalysis
- **Methods:** 3D deep learning, Catalyst-structure representation, Libra-ML
- **Workflow(s):** TS-informed 3D deep-learning workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Shows 3D learned representations can model a multistep homogeneous catalytic cycle.

## 10. ML for Catalytic Asymmetric Reactions of Simple Alkenes

**Metadata:** 2026 | Digital Discovery | research | core catalysis

- **Authors:** Ajnabiul Hoque, Divya Chenna, Nupur Jain, Raghavan B. Sunoj
- **DOI:** 10.1039/D5DD00483G
- **Paper link:** https://doi.org/10.1039/D5DD00483G
- **Chemistry:** Catalytic asymmetric reactions of simple alkenes
- **Data regime:** Sparse and imbalanced literature reaction datasets
- **Validation:** Representation/model comparisons across asymmetric reaction sets
- **Topics:** Asymmetric catalysis, Enantioselectivity, Imbalanced data, Representation comparison, Small data
- **Methods:** Cost-sensitive learning, Fingerprints, Graph representations, SMILES models
- **Workflow(s):** Direct GNN reaction workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Useful comparison of learned and predefined representations under realistic data imbalance.

## 11. ML in Homogeneous Catalysis: Basic Concepts and Best Practices

**Metadata:** 2026 | ACS Catalysis | viewpoint | overview

- **Authors:** David Dalmau, Juan V. Alegre-Requena, Susana Garcia-Abellan
- **DOI:** 10.1021/acscatal.5c06439
- **Paper link:** https://doi.org/10.1021/acscatal.5c06439
- **Chemistry:** Homogeneous catalysis
- **Data regime:** Methodological overview
- **Validation:** N/A
- **Topics:** Best practices, Homogeneous catalysis, Model validation, Small data
- **Methods:** Viewpoint / methodology guidance
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Practical reference for building and evaluating catalysis ML models.

## 12. ML-Assisted Ligand Optimization in Shearilicine Synthesis

**Metadata:** 2026 | JACS | research | core catalysis

- **Authors:** Fu-Qiang Ni, Z. Wang
- **DOI:** 10.1021/jacs.5c21637
- **Paper link:** https://doi.org/10.1021/jacs.5c21637
- **Chemistry:** Enantioselective Pd-catalyzed alpha-arylation in total synthesis
- **Data regime:** >120 BI-DIME-type ligands virtually screened
- **Validation:** New ligands improved a difficult asymmetric arylation
- **Topics:** Asymmetric catalysis, Ligand optimization, Synthetic application, Virtual screening
- **Methods:** Support vector regression, Virtual ligand screening
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Illustrates ML ligand optimization inside a demanding total-synthesis problem.

## 13. Predictive Statistical Analysis of Au(I) C-H Functionalization Selectivity

**Metadata:** 2026 | ACS Catalysis | research | core catalysis

- **Authors:** Matthew S. Sigman, Omar Arto, Pablo Barrio, Shounak Hinge, Simone Gallarati
- **DOI:** 10.1021/acscatal.6c03184
- **Paper link:** https://doi.org/10.1021/acscatal.6c03184
- **Chemistry:** Au(I)-catalyzed cycloisomerization of 1-bromoalkynes
- **Data regime:** Curated substrate set with conformational/steric features
- **Validation:** OOD substrates including a complex target
- **Topics:** C-H functionalization, Conformational effects, Diastereoselectivity, Interpretable ML, Regioselectivity
- **Methods:** Multivariate regression, Steric descriptors, Univariate regression
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Modern example of interpretable statistical modeling applied directly to catalyst-controlled selectivity.

## 14. Transferable Enantioselectivity Models from Sparse Data

**Metadata:** 2026 | Nature | research | core catalysis

- **Authors:** Abigail G. Doyle, Erin M. Bucci, Matthew S. Sigman, Simone Gallarati
- **DOI:** 10.1038/s41586-026-10239-7
- **Paper link:** https://doi.org/10.1038/s41586-026-10239-7
- **Chemistry:** Ni-catalyzed asymmetric C(sp3) couplings
- **Data regime:** Sparse catalytic datasets across related reactions
- **Validation:** Unseen ligands and reaction partners; optimization of weak scope examples
- **Topics:** Conformer ensembles, Enantioselectivity, Mechanism-aware descriptors, Small data, Transfer learning
- **Methods:** Boltzmann averaging, Statistical modeling, TS/intermediate ensembles, xTB
- **Workflow(s):** Mechanism-aware transfer workflow
- **Verified citation count:** 3 (snapshot 2026-09-03)

**Why it matters:**

Makes the representation reaction-contextual by encoding proposed catalytic states rather than only free ligands.

## 15. Active Learning + Metadynamics for Reactive MLIPs

**Metadata:** 2025 | Digital Discovery | research | core catalysis

- **Authors:** Fernanda Duarte, Hanwen Zhang, Tristan Johnston-Wood, Valdas Vitartas, Veronika Jurásková
- **DOI:** 10.1039/D5DD00261C
- **Paper link:** https://doi.org/10.1039/D5DD00261C
- **Chemistry:** Reactive molecular systems; explicit/implicit solvent examples
- **Data regime:** Typically 5–10 initial configurations then active learning
- **Validation:** Reactive PES / competing pathways
- **Topics:** Active learning, Enhanced sampling, Reaction dynamics, Reactive MLIPs
- **Methods:** Iterative QM labeling, Machine-learned interatomic potentials, Metadynamics
- **Workflow(s):** Reactive MLIP mechanism workflow
- **Verified citation count:** 9 (snapshot 2026-09-03)

**Why it matters:**

Automates generation of reaction-quality ML potentials with minimal initial data.

## 16. AI Approaches to Homogeneous Catalysis with Transition Metal Complexes

**Metadata:** 2025 | ACS Catalysis | review | overview

- **Authors:** Aida Nova, Carlos Moran-Gonzalez, Jonathan Burnage, Vladimir Balcells
- **DOI:** 10.1021/acscatal.5c01202
- **Paper link:** https://doi.org/10.1021/acscatal.5c01202
- **Chemistry:** Transition-metal homogeneous catalysis
- **Data regime:** Perspective across computational and experimental literature
- **Validation:** N/A
- **Topics:** AI roadmap, Automation, Catalyst design, Generative models, Homogeneous catalysis
- **Methods:** Review / perspective
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Field-level map of datasets, representations, algorithms, catalyst optimization, and inverse design.

## 17. CaTS: Transition-State Screening for Catalyst Discovery

**Metadata:** 2025 | ACS Catalysis | research | catalysis-enabling methodology

- **Authors:** Huasheng Feng, Jiangjie Qiu, Jun Yin, Wentao Li, Xiangya Xu
- **DOI:** 10.1021/acscatal.5c03945
- **Paper link:** https://doi.org/10.1021/acscatal.5c03945
- **Chemistry:** Metal-organic complex catalyst screening
- **Data regime:** 10,000 small-molecule TS reactions; 327 catalyst examples; >1,000 screened complexes
- **Validation:** DFT validation of top candidates
- **Topics:** Catalyst discovery, Deep learning, High-throughput computation, MLIPs, Transition-state screening
- **Methods:** Automated structure generation, Machine-learning force field, NEB, SHAP
- **Workflow(s):** Reactive MLIP mechanism workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Moves catalyst screening from static properties toward kinetically relevant TS energies.

## 18. Conformer-weighted Bisphosphine Descriptor Library

**Metadata:** 2025 | Chemical Science | research | core catalysis

- **Authors:** Jamie A. Cadge, Matthew S. Sigman, Sierra D. Hart
- **DOI:** 10.1039/D5SC04691B
- **Paper link:** https://doi.org/10.1039/D5SC04691B
- **Chemistry:** Bisphosphine-ligated Pd complexes
- **Data regime:** Descriptor-library + prior catalytic modeling datasets
- **Validation:** Improved predictive statistics in prior case studies
- **Topics:** Boltzmann / ensemble representation, Conformer ensembles, Ligand descriptors, Small data
- **Methods:** Conformer selection, Statistical modeling, Weighted physical descriptors
- **Workflow(s):** -
- **Verified citation count:** 4 (snapshot 2026-09-03)

**Why it matters:**

Treats conformer choice as a core part of the molecular representation.

## 19. Data Science Development of Heteroleptic Pd Fluorination Catalyst

**Metadata:** 2025 | JACS | research | core catalysis

- **Authors:** Aleria Garcia Roca, David Dalmau, Matthew S. Sigman, Mohammad H. Samha, Serhii Vasylevskyi, Shubham Deolka
- **DOI:** 10.1021/jacs.5c11929
- **Paper link:** https://doi.org/10.1021/jacs.5c11929
- **Chemistry:** Heteroleptic Pd-catalyzed fluorination of arylboronic acids
- **Data regime:** HTE matrix plus data-science-guided scope selection
- **Validation:** Experimentally optimized catalyst and mechanistic follow-up
- **Topics:** Bayesian optimization, Catalyst development, HTE, Palladium catalysis, Substrate-scope design
- **Methods:** EDBO+, High-throughput experimentation, Multi-objective Bayesian optimization, Random forest
- **Workflow(s):** Autonomous HTE optimization workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

End-to-end BO + HTE + scope-design catalyst-development workflow.

## 20. Data Science-Guided Ni Homo-Diels-Alder

**Metadata:** 2025 | JACS | research | core catalysis

- **Authors:** Cedric Lozano, Jamie A. Cadge, Matthew S. Sigman, Sarah E. Reisman
- **DOI:** 10.1021/jacs.5c09948
- **Paper link:** https://doi.org/10.1021/jacs.5c09948
- **Chemistry:** Ni-catalyzed homo-Diels-Alder
- **Data regime:** Small experimental ligand screen embedded in KRAKEN space
- **Validation:** Discovery of a chiral ligand / reaction development
- **Topics:** Classification, KRAKEN, Ligand screening, Reaction development
- **Methods:** Classification models, Descriptor library, Experimental validation
- **Workflow(s):** Reusable ligand-space workflow
- **Verified citation count:** 3 (snapshot 2026-09-03)

**Why it matters:**

Concrete example of a reusable descriptor library driving experimental catalyst discovery.

## 21. Data-Driven Discovery of N-Oxyl HAT Catalysts

**Metadata:** 2025 | ACS Central Science | research | core catalysis

- **Authors:** Cheng Yang, Corey R. J. Stephenson, Matthew S. Sigman, Stephen Maldonado, Therese Wild, Yulia Rakova
- **DOI:** 10.1021/acscentsci.4c01919
- **Paper link:** https://doi.org/10.1021/acscentsci.4c01919
- **Chemistry:** N-oxyl hydrogen-atom-transfer catalysts
- **Data regime:** Catalyst library with physical descriptors and reactivity
- **Validation:** Discovery and experimental testing of new catalysts
- **Topics:** Catalyst discovery, Descriptor screening, Experimental validation, HAT catalysis
- **Methods:** Data-driven screening, Physical descriptors, Statistical modeling
- **Workflow(s):** Reusable ligand-space workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Direct descriptor-driven catalyst discovery rather than only post hoc rationalization.

## 22. Data-Driven Mechanistic Analysis of Co(III) Hydrogen Isotope Exchange

**Metadata:** 2025 | Nature Catalysis | research | core catalysis

- **Authors:** Anat Milo, Inbal L. Eshel, Jiayu Zhang, Marco Di Matteo, Monica H. Perez-Temprano, Sergio Barranco
- **DOI:** 10.1038/s41929-025-01447-x
- **Paper link:** https://doi.org/10.1038/s41929-025-01447-x
- **Chemistry:** Co(III)-catalyzed site-selective C-H deuteration
- **Data regime:** Broad substrate/deuterium-source experimental matrix
- **Validation:** Mechanistic interpretation across sources and substrates
- **Topics:** Cobalt catalysis, Hydrogen isotope exchange, Mechanistic discovery, Reaction conditions, Statistical modeling
- **Methods:** Catalytic-intermediate descriptors, Experimental mechanistic analysis, Multivariable linear regression
- **Workflow(s):** Mechanism-aware transfer workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Shows reaction conditions can switch the operative catalytic mechanism.

## 23. Data-Efficient Molecular Image Representation Learning (MoleCLIP)

**Metadata:** 2025 | Chemical Science | research | catalysis-enabling methodology

- **Authors:** Amit H. Bermano, Anat Milo, Hadas Shalit Peleg, Yonatan Harnik
- **DOI:** 10.1039/D5SC00907C
- **Paper link:** https://doi.org/10.1039/D5SC00907C
- **Chemistry:** Property/reactivity prediction including homogeneous catalysis datasets
- **Data regime:** Large unlabeled image pretraining then small labeled tasks
- **Validation:** Benchmarks vs image- and graph-based representations
- **Topics:** Catalysis datasets, Deep learning, Foundation models, Molecular representation learning, Small data
- **Methods:** Contrastive representation learning, Fine-tuning, Image foundation model
- **Workflow(s):** Direct GNN reaction workflow, Few-shot / meta-learning workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Milo-group alternative to handcrafted descriptors for data-efficient catalysis tasks.

## 24. FlowER: Electron Flow Matching

**Metadata:** 2025 | Nature | research | core catalysis

- **Authors:** Connor W. Coley, Joonyoung F. Joung
- **DOI:** 10.1038/s41586-025-09426-9
- **Paper link:** https://doi.org/10.1038/s41586-025-09426-9
- **Chemistry:** General organic reaction mechanisms
- **Data regime:** Large reaction corpora with mechanistic representation
- **Validation:** OOD reaction classes; mechanism recovery
- **Topics:** Chemical constraints, Generative models, Mechanism prediction, Reaction foundation models
- **Methods:** Bond-electron representation, Fine-tuning, Flow matching
- **Workflow(s):** -
- **Verified citation count:** 18 (snapshot 2026-09-03)

**Why it matters:**

Moves reaction ML from text-like prediction toward constrained electron redistribution.

## 25. HCat-GNet

**Metadata:** 2025 | iScience | research | core catalysis

- **Authors:** Eduardo Aguilar-Bejarano, Grazziela P. Figueredo, Simon Woodward
- **DOI:** 10.1016/j.isci.2025.111881
- **Paper link:** https://doi.org/10.1016/j.isci.2025.111881
- **Chemistry:** Asymmetric homogeneous catalysis
- **Data regime:** Benchmark asymmetric reaction datasets
- **Validation:** Prospective new ligand class in Rh 1,4-addition
- **Topics:** Enantioselectivity, Graph neural networks, Interpretability, Ligand optimization
- **Methods:** Atom-level attribution, GNN, SMILES / graph representation
- **Workflow(s):** Direct GNN reaction workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Directly contrasts learned molecular representations with handcrafted catalyst descriptors.

## 26. Local Reaction Space in Asymmetric Catalysis

**Metadata:** 2025 | ACS Catalysis | research | core catalysis

- **Authors:** Jolene P. Reid
- **DOI:** 10.1021/acscatal.5c01051
- **Paper link:** https://doi.org/10.1021/acscatal.5c01051
- **Chemistry:** Asymmetric catalysis in sparse reaction spaces
- **Data regime:** Small catalytic datasets with controlled local vs distant training examples
- **Validation:** Interpolation and extrapolation tests around target reactions
- **Topics:** Asymmetric catalysis, Dataset design, Enantioselectivity, Local reaction space, Small data
- **Methods:** Radius-based random forest, Random forest, Targeted training-set design
- **Workflow(s):** Target-specific active-learning workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Shows that target-neighborhood coverage can matter more than maximizing global training-set diversity.

## 27. Meta-learning for Asymmetric Catalysis

**Metadata:** 2025 | Nature Communications | research | core catalysis

- **Authors:** José Miguel Hernández-Lobato, Sukriti Singh
- **DOI:** 10.1038/s41467-025-58854-8
- **Paper link:** https://doi.org/10.1038/s41467-025-58854-8
- **Chemistry:** Asymmetric hydrogenation of olefins
- **Data regime:** Literature-derived multi-task / few-shot setting
- **Validation:** Out-of-sample catalytic tasks
- **Topics:** Enantioselectivity, Few-shot learning, Meta-learning, Transfer learning
- **Methods:** Few-shot prediction, Prototypical networks
- **Workflow(s):** Few-shot / meta-learning workflow
- **Verified citation count:** 6 (snapshot 2026-09-03)

**Why it matters:**

Tests whether shared knowledge across reactions can reduce the data needed for a new catalytic task.

## 28. Minerva: Parallel Reaction Optimisation

**Metadata:** 2025 | Nature Communications | research | core catalysis

- **Authors:** Joshua W. Sin, Philippe Schwaller, Siu Lun Chau
- **DOI:** 10.1038/s41467-025-61803-0
- **Paper link:** https://doi.org/10.1038/s41467-025-61803-0
- **Chemistry:** Ni Suzuki; Pd Buchwald-Hartwig; process chemistry
- **Data regime:** 96-well iterative experimental batches
- **Validation:** Closed-loop experimental optimization
- **Topics:** Autonomous experimentation, Bayesian optimization, High-throughput experimentation, Multi-objective optimization
- **Methods:** Batch acquisition, HTE automation, Surrogate modeling
- **Workflow(s):** Autonomous HTE optimization workflow
- **Verified citation count:** 16 (snapshot 2026-09-03)

**Why it matters:**

Strong example of ML as an experimental decision engine rather than a final predictor.

## 29. ML Workflows Beyond Linear Models in Low-Data Regimes

**Metadata:** 2025 | Chemical Science | research | catalysis-enabling methodology

- **Authors:** David Dalmau, Juan V. Alegre-Requena, Matthew S. Sigman
- **DOI:** 10.1039/D5SC00996K
- **Paper link:** https://doi.org/10.1039/D5SC00996K
- **Chemistry:** Low-data chemical modeling with catalysis relevance
- **Data regime:** Eight datasets with 18-44 observations
- **Validation:** Interpolation, extrapolation, and de novo prediction benchmarks
- **Topics:** Automated model selection, Catalysis workflows, Nonlinear models, Small data
- **Methods:** Bayesian hyperparameter optimization, Gradient boosting, ROBERT, Random forest
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Shows properly tuned nonlinear models can be competitive even in very small chemical datasets.

## 30. Pd to Ni Transfer Learning for Atroposelective Suzuki Coupling

**Metadata:** 2025 | JACS | research | core catalysis

- **Authors:** Li-Cheng Xu, Li-Gao Liu, Shuo-Qing Zhang, Xin Hong, Xin-Yuan Xu
- **DOI:** 10.1021/jacs.5c00838
- **Paper link:** https://doi.org/10.1021/jacs.5c00838
- **Chemistry:** Atroposelective Ni-catalyzed Suzuki-Miyaura coupling
- **Data regime:** 310 Pd reactions plus 21 Ni/Sadphos ligand points
- **Validation:** Predicted ligand enabled a new Ni catalytic reaction
- **Topics:** Asymmetric catalysis, Cross-metal transfer, Ligand prediction, Small data, Transfer learning
- **Methods:** Delta learning, Similarity-based sampling, Transfer learning
- **Workflow(s):** Few-shot / meta-learning workflow, Mechanism-aware transfer workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Clear demonstration of mechanistically motivated knowledge transfer from Pd to Ni.

## 31. Predictive Modeling of Enantioselective Mn C-H Oxidation

**Metadata:** 2025 | ACS Catalysis | research | core catalysis

- **Authors:** Andrea Palone, Arnau Call, Jordan P. Liles, Matthew S. Sigman, Miquel Costas
- **DOI:** 10.1021/acscatal.4c05659
- **Paper link:** https://doi.org/10.1021/acscatal.4c05659
- **Chemistry:** Mn-catalyzed enantioselective oxidation of nonactivated methylene C-H bonds
- **Data regime:** Catalyst/substrate selectivity data with computed descriptors
- **Validation:** Structure-selectivity interpretation and predictive tests
- **Topics:** C-H oxidation, Enantioselectivity, Manganese catalysis, Physical descriptors, Statistical modeling
- **Methods:** DFT descriptors, Multiple linear regression, Predictive statistical modeling
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Shows interpretable modeling of subtle stereoelectronic effects in C-H oxidation.

## 32. Probability Guided Chemical Reaction Scopes

**Metadata:** 2025 | ChemRxiv | preprint | core catalysis

- **Authors:** Anat Milo, Inbal L. Eshel, Monica H. Perez-Temprano, Sergio Barranco, Shahar Barkai
- **DOI:** -
- **Paper link:** https://www.cambridge.org/engage/chemrxiv/article-details/67a66bde6dde43c908fb7a13
- **Chemistry:** Condition suitability and reaction-scope prediction
- **Data regime:** Small curated catalytic reaction scopes
- **Validation:** External targets and reaction-condition classification
- **Topics:** Catalysis, Classification, Prospective prediction, Reaction-scope design, Small data
- **Methods:** Probabilistic classification, Reaction-condition classification
- **Workflow(s):** Target-specific active-learning workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Reframes reaction scope as a probabilistic condition-suitability problem.

## 33. QM + ML Design of Low-Valent Fe Catalysts for N2 Reduction

**Metadata:** 2025 | JACS | research | core catalysis

- **Authors:** Ankit Mondal, Chandrasekhar Nettem, Gopalan Rajaraman
- **DOI:** 10.1021/jacs.5c00099
- **Paper link:** https://doi.org/10.1021/jacs.5c00099
- **Chemistry:** Low-valent Fe/CAAC homogeneous catalysts for N2-to-NH3 conversion
- **Data regime:** Computational catalyst and dynamics data
- **Validation:** QM/MD mechanistic analysis linked to ML-derived design variables
- **Topics:** Catalyst design, Mechanistic ML, Nitrogen reduction, Quantum chemistry, Transition-metal complexes
- **Methods:** Ab initio molecular dynamics, DFT, Machine learning
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Represents computational catalyst discovery driven by mechanistic QM data.

## 34. Reactive ML Potential for Organometallic TS Search and Ligand Screening

**Metadata:** 2025 | JCTC | research | core catalysis

- **Authors:** Kun Tang, Qilei Liu, Yujing Zhao
- **DOI:** 10.1021/acs.jctc.5c01047
- **Paper link:** https://doi.org/10.1021/acs.jctc.5c01047
- **Chemistry:** Organometallic ethylene hydrogenation and ligand screening
- **Data regime:** Automated reactive training data for organometallic pathways
- **Validation:** PES/IRC and screening benchmarks against quantum chemistry
- **Topics:** Deep learning, Ligand screening, Organometallic catalysis, Reactive MLIPs, Transition-state search
- **Methods:** Automated TS database, Equivariant message passing, Reactive machine-learning potential
- **Workflow(s):** Reactive MLIP mechanism workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Targets the expensive TS-search layer limiting contextual catalyst modeling.

## 35. Sharpless AD Enantioselectivity Prediction

**Metadata:** 2025 | ACS Central Science | research | core catalysis

- **Authors:** Blake E. Ocampo, Scott E. Denmark
- **DOI:** 10.1021/acscentsci.5c00900
- **Paper link:** https://doi.org/10.1021/acscentsci.5c00900
- **Chemistry:** Sharpless asymmetric dihydroxylation
- **Data regime:** 1,007 literature reactions
- **Validation:** Prospective experimental substrates
- **Topics:** Enantioselectivity, Literature mining, Physical descriptors, Prospective validation
- **Methods:** Chemistry-informed descriptors, Statistical / ML modeling
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Strong example of literature curation plus chemically interpretable representations plus real external validation.

## 36. Statistical Modeling in Ligand-Controlled Bismuth Catalysis

**Metadata:** 2025 | JACS | research | core catalysis

- **Authors:** Hoonchul Choi, Jamie A. Cadge, Josep Cornella, Lucas Mele, Matthew S. Sigman, Philipp D. Engel, Vytautas Peciukenas
- **DOI:** 10.1021/jacs.5c11854
- **Paper link:** https://doi.org/10.1021/jacs.5c11854
- **Chemistry:** Ligand-controlled high-valent bismuth catalysis
- **Data regime:** Ligand series plus mechanistic calculations and experiments
- **Validation:** Mechanistic model tied to alternative reductive-elimination pathways
- **Topics:** Chemodivergence, Ligand effects, Main-group catalysis, Mechanistic discovery, Statistical modeling
- **Methods:** Charge and steric descriptors, DFT, Statistical modeling
- **Workflow(s):** Mechanism-aware transfer workflow
- **Verified citation count:** not checked / not retained

**Why it matters:**

Extends data-driven ligand analysis beyond transition-metal catalysis.

## 37. Target-specific Data Sets for Regioselectivity

**Metadata:** 2025 | JACS | research | core catalysis

- **Authors:** Alba Carretero-Cerdán, Anat Milo, Jules Schleinitz, Sarah E. Reisman
- **DOI:** 10.1021/jacs.4c15902
- **Paper link:** https://doi.org/10.1021/jacs.4c15902
- **Chemistry:** C–H functionalization / regioselectivity
- **Data regime:** Literature data plus actively selected subsets
- **Validation:** Prospective experiments on complex targets
- **Topics:** Active learning, Dataset design, Regioselectivity, Small data
- **Methods:** Acquisition functions, Target-specific sampling, Uncertainty
- **Workflow(s):** Target-specific active-learning workflow
- **Verified citation count:** 13 (snapshot 2026-09-03)

**Why it matters:**

Shows that strategically chosen small datasets can beat larger random datasets.

## 38. Top-Down Mechanistic Elucidation with ML

**Metadata:** 2025 | ACS Catalysis | research | core catalysis

- **Authors:** Jolene P. Reid
- **DOI:** 10.1021/acscatal.5c02264
- **Paper link:** https://doi.org/10.1021/acscatal.5c02264
- **Chemistry:** Asymmetric catalysis
- **Data regime:** Small-to-medium reaction datasets
- **Validation:** Computational and experimental follow-up of inferred regimes
- **Topics:** Asymmetric catalysis, Interpretable ML, Mechanistic discovery, Model heterogeneity
- **Methods:** Clusterwise linear regression, Descriptor analysis
- **Workflow(s):** -
- **Verified citation count:** not checked / not retained

**Why it matters:**

Uses ML to discover distinct mechanistic regimes instead of forcing one global structure–selectivity relationship.

## 39. KRAKEN: Organophosphorus Ligand Discovery Platform

**Metadata:** 2022 | JACS | research | core catalysis

- **Authors:** Alán Aspuru-Guzik, Gabriel dos Passos Gomes, Matthew S. Sigman, Tobias Gensch
- **DOI:** 10.1021/jacs.1c09718
- **Paper link:** https://doi.org/10.1021/jacs.1c09718
- **Chemistry:** Organophosphorus ligands; homogeneous catalysis
- **Data regime:** 1,558 DFT ligands; >300,000 ML-predicted ligands
- **Validation:** Retrospective catalysis case studies / ligand selection
- **Topics:** Catalyst screening, Conformer ensembles, Ligand descriptor libraries, Virtual ligand space
- **Methods:** DFT descriptors, ML surrogate models, PCA / chemical-space mapping
- **Workflow(s):** Reusable ligand-space workflow
- **Verified citation count:** 293 (snapshot 2026-09-03)

**Why it matters:**

Blueprint for reusable, precomputed ligand chemical spaces.

# 12. Cross-cutting research questions suggested by the map

## 12.1 Representation

- When do **Boltzmann-averaged physical descriptors** outperform a single minimum-energy conformer?
- When does a **free-ligand representation** fail because catalyst-substrate interactions dominate?
- Can a **3D learned representation** recover the same chemical factors identified by Sterimol, buried volume, NBO/NPA, dipoles, and conformational analysis?
- Can one build a representation that is reusable like KRAKEN/BUNNY but becomes contextual when the ligand is placed around a metal or catalytic intermediate?

## 12.2 Transferability

- Which information transfers reliably across metals, for example Pd to Ni?
- Does mechanistic similarity predict transfer better than structural similarity?
- How should catalyst, substrate, and reaction-condition information be factorized for few-shot learning?
- What constitutes a genuinely difficult out-of-domain split for catalysis?

## 12.3 Dataset design

- Should experimental campaigns optimize coverage, target relevance, mechanistic discrimination, or uncertainty reduction?
- How much do negative data and control reactions improve reliability?
- Can deliberately overlapping condition matrices make cross-metal or cross-reaction transfer identifiable?

## 12.4 Physics acceleration

- Can foundation MLIPs make reaction-contextual ensemble representations cheap enough for routine use?
- Which catalytic problems can tolerate MLIP geometries and energies, and which still require high-level DFT?
- Can uncertainty in MLIP-generated conformer or TS ensembles propagate into the final selectivity model?

## 12.5 Scientific interpretation

- Can a model identify when the operative mechanism changes instead of forcing a single global relationship?
- How should local mechanistic regimes be represented statistically?
- Can learned representations be converted into experimentally actionable chemical hypotheses?

# 13. Apparent gaps and opportunities

Based on this literature map, several spaces appear less saturated than standard yield or selectivity regression:

1. **Context-adaptive ligand representations.** A representation between static reusable ligand libraries and fully bespoke TS calculations.
2. **Ensemble-aware learned models.** Models that explicitly ingest conformer populations rather than a single 3D structure.
3. **Stereoelectronic local fields.** Joint steric/electronic descriptors tied to orientation, donor direction, charge, dipole, and accessible approach geometries.
4. **Mechanism-aware uncertainty.** Uncertainty that increases when a reaction may cross into a different mechanistic regime, not only when molecular fingerprints are distant.
5. **Cross-dataset catalytic pretraining.** Pretraining on many small, mechanistically diverse catalytic datasets without destroying reaction-specific interpretability.
6. **MLIP-to-descriptor pipelines.** Use fast learned potentials to generate physical conformer/intermediate ensembles, then compress them into interpretable descriptors for small-data models.
7. **Prospective benchmarks for small-data catalysis.** Standard tasks where the real goal is discovering a useful ligand, substrate scope, or mechanism rather than maximizing random-split R2.

# 14. Data-quality and provenance notes

- The graph was assembled from the literature sweep in this conversation, with emphasis on 2025-2026 catalysis ML.
- KRAKEN is retained as an older foundational reference because it anchors the reusable ligand-space lineage.
- Some entries are preprints, reviews, perspectives, or enabling-method papers rather than direct catalyst-discovery studies. These are tagged separately.
- Author lists for some highly collaborative papers may be incomplete if only the principal mapped authors were captured during the literature sweep.
- Citation metadata is intentionally conservative. Blank means unverified.
- Quantitative analysis in this file describes this curated corpus, not the entire field.

# 15. Companion files

- `knowledge_graph_catalysis_3d.html` - interactive 3D visualization.
- `graph_catalysis_expanded.json` - graph data source.
- `papers_catalysis_expanded.csv` - tabular paper metadata from the prior graph build.
