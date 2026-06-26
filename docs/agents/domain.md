# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

**Single-context repo.**

## Before exploring, read these

- **`DOMAIN.md`** at the repo root — this is the project's glossary / ubiquitous language (Spanish term
  ↔ English identifier + meaning). It plays the role that `CONTEXT.md` plays in the default skills.
  **There is no `CONTEXT.md`; do not create one** — `DOMAIN.md` is the single source for domain language.
- The broader specs, indexed in **`CLAUDE.md`** ("Índice de documentos"): `PRD.md`, `STACK.md`,
  `SANITY-SCHEMA.md`, `ARCHITECTURE.md`, `FILTERS.md`, `DESIGN.md`, `LAYOUT.md`, `TESTING.md`,
  `ANALYTICS.md`, `SEO.md`. Read the ones relevant to the area you're touching.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. Created lazily by
  `/domain-modeling` when decisions actually get resolved; if the directory is absent, proceed silently.

## Use the glossary's vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test
name), use the term as defined in `DOMAIN.md`. Code, GROQ, `features/*` folders and component names in
**English**; Sanity editor labels and URLs/content per the naming convention in `CLAUDE.md`. Don't
drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in `DOMAIN.md` yet, that's a signal — either you're inventing language the
project doesn't use (reconsider), or there's a real gap (note it for `/domain-modeling`, and the change
goes in `DOMAIN.md`/`SANITY-SCHEMA.md`, not in N places).

## Flag ADR conflicts

If your output contradicts an existing ADR (or a decision already written in a spec), surface it
explicitly rather than silently overriding:

> _Contradicts ADR-0007 / `ARCHITECTURE.md §4` — but worth reopening because…_
