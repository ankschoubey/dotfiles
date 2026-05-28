---
name: react-architecture-decomposer
description: Decompose a feature idea into component boundaries, state ownership, data flow, and composition hierarchy. Outputs component-specs/ARCHITECTURE.md + stubs for react-component-planner to fill. Use when user says "architect", "decompose", "break down feature", "component tree", or has a messy feature idea that needs structuring.
---

# react-architecture-decomposer

Flow: **Grill** → **Decompose** → **Handoff to Planner**

**Principle**: External deps over custom. Reuse existing components before creating new ones. Each new component gets a spec stub for react-component-planner.

## 1. Start

Load [grill-with-docs](../../../../.claude/skills/grill-with-docs/SKILL.md) for interview approach (one-at-a-time, recommend, wait, explore codebase).

During grill, search existing codebase for components already available.

## 2. Interview areas

Ask one at a time. Skip what's clear.

- **Feature purpose** — one-sentence. What user problem does it solve?
- **User flows** — step-by-step. What screens/states does user navigate? (happy path + error path)
- **Data model** — entities, relationships, data sources (API, local state, URL params). What shape does each entity have?
- **State categories** — which is server state, client state, URL state, ephemeral UI state? How do they relate?
- **Existing components** — what reusable components already exist in codebase? Search. Can these compose for this feature?
- **Visual regions** — what major visual blocks does the UI divide into? (sidebar, header, list, detail panel, dialog, etc.)
- **Boundary candidates** — for each visual region: is it a new component, an existing one reused, or a variant of existing?
- **Dependencies** — what packages needed? (routing, forms, tables, charts, drag-and-drop, etc.)

## 3. Identify component topology

After interview, classify each component:

- **Type**: ui | layout | feature | page | provider
- **Ownership**: what data does it own vs receive?
- **Children**: what components does it compose?
- **Reuse**: existing component or new? If existing, name it.
- **State**: what state does it manage vs pass through?

Create a dependency diagram:

```
FeaturePage (page)
├── SearchBar (ui) — existing, reused
├── ResultsList (feature)
│   └── ResultCard (ui) — new
└── DetailPanel (feature)
    ├── Tabs (ui) — existing, reused
    └── DetailContent (ui) — new
```

## 4. Write outputs

See [REFERENCE.md](./REFERENCE.md) for exact formats.

Write `component-specs/ARCHITECTURE.md` with tree, data flow, state map, reused + new components.

For each new component, stub `component-specs/<ComponentName>/README.md` with known fields, mark unknowns as `FILL_ME`.

## 5. Handoff

User runs react-component-planner on each new component stub to fill details. ARCHITECTURE.md provides dependency context.
