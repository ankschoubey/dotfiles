---
name: react-component-planner
description: Plan React components through structured interview covering type, purpose, component states, props, state, renders, slots, architecture notes. Saves spec to component-specs/<Name>/README.md for implementation. Use when user says "plan component", "design component", "component spec", or when starting a new React component.
---

# react-component-planner

Flow: **Grill** → **Spec** → **Handoff**

**Principle**: Prioritize external deps over custom code. Always ask "is there a library for this?" before designing custom behavior. Surface existing packages (radix-ui, react-aria, cmdk, downshift, react-hook-form, etc.) during interview. Spec must list chosen deps.

## 1. Start

Load [grill-with-docs](../../../../.claude/skills/grill-with-docs/SKILL.md) for interview approach (one-at-a-time, recommend, wait, explore codebase).

## 2. Interview areas

Ask one at a time. Skip what's clear. Cover (maps to spec fields below):

- **Type** — ui (leaf), layout (arrangement), feature (composite), page (route-level), provider (context/wrapper)
- **Purpose** — one-sentence, where used, what problem it solves
- **Component states** — describe each state's behavior. Each becomes a Storybook story + play test. Default, data (loading/empty/error), interaction (hover→tooltip, focus→outline, drag→offset), permissions (auth gating), responsiveness (mobile→icon only), accessibility (screen reader announcement, focus trap)
- **Props** — list with types, required/optional, defaults, controlled vs uncontrolled. Naming conventions. Forward ref?
- **State & owner** — internal state vs lifted/prop-drilled. Who owns what. Side effects (fetch, subs, animations)
- **Renders** — JSX structure. What tags, what conditionals. Key elements for styling hooks.
- **Slots** — children, render props, compound components (Select.Option). Layout vs content.
- **Dependencies** — external packages needed (radix-ui, react-aria, remeda, date-fns, etc.). Prefer libraries over custom.
- **Notes** — performance (memo/virtualization/lazy), test strategy, architecture concerns, future refactors.

## 3. Write spec

Write `component-specs/<ComponentName>/README.md`:

```
<ComponentName>

type: ui | layout | feature | page | provider
purpose:
componentStates:
  default:
  data:
    loading:
    empty:
    error:
  interaction:
    - hover: tooltip visible
    - focus: outline highlight
  permissions:
    - anonymous: show login prompt
    - user: show content
  responsiveness:
    - mobile: icon only, no label
    - tablet: icon + short label
    - desktop: full layout
  accessibility:
    - screen reader announces status on change
    - keyboard: Enter toggles, Escape closes

props:
stateAndOwner:

renders:
slots:
dependencies:

notes:
```

## 4. Handoff

Spec at `component-specs/<ComponentName>/README.md` is structured for implementation skill to consume.

## Proactive

User says "build X component" → load this skill first to plan before implementing.
