# Output formats

## ARCHITECTURE.md

```
# <FeatureName>

## Purpose

{one sentence}

## Component tree

{tree diagram}

## Data flow

{how state moves between components. Parent→child props, context, URL state, server cache}

## State map

| Component | State | Source | Owner |
|-----------|-------|--------|-------|

## Existing components reused

| Component | Purpose | Path |
|-----------|---------|------|

## New components

| Component | Type | Purpose | Spec file |
|-----------|------|---------|-----------|
```

## Component stub

`component-specs/<ComponentName>/README.md`:

```
<ComponentName>

type: {type}
purpose:
componentStates:
  default:

props:
stateAndOwner:

renders:
slots:
dependencies:

notes:
  FILL_ME — use react-component-planner skill
```
