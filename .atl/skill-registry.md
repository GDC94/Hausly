# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`. Sub-agents do NOT read this registry or individual SKILL.md files.

- **Policy** (qué skills usa el proyecto y cuándo): [`specs/SKILLS.md`](../specs/SKILLS.md) — fuente de verdad de la curación (18 de 45 skills).
- **Auto-load por contexto**: ver `CLAUDE.md` §Agent skills.
- **Override de dominio**: donde una compact rule diga `CONTEXT.md`, en ESTE repo el glosario es `specs/DOMAIN.md` (no hay `CONTEXT.md`; no crear uno). Ver [`specs/agents/domain.md`](../specs/agents/domain.md). Para `impeccable`, `PRODUCT.md` ≈ `specs/PRD.md` + `specs/DESIGN.md`.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Rutas/RSC/data/metadata en Next.js | `next-best-practices` | `~/.claude/skills/next-best-practices/SKILL.md` |
| Perf y bundle React/Next | `vercel-react-best-practices` | `~/.claude/skills/vercel-react-best-practices/SKILL.md` |
| Schemas/GROQ/TypeGen/Studio Sanity | `sanity-best-practices` | `~/.claude/skills/sanity-best-practices/SKILL.md` |
| Lógica pura test-first | `tdd` | `~/.claude/skills/tdd/SKILL.md` |
| Tokens/component library Tailwind v4 | `tailwind-design-system` | `~/.claude/skills/tailwind-design-system/SKILL.md` |
| Figma/mockup → Tailwind v4 | `pixel-perfect-tailwind` | `~/.claude/skills/pixel-perfect-tailwind/SKILL.md` |
| Review UI / accesibilidad | `web-design-guidelines` | `~/.claude/skills/web-design-guidelines/SKILL.md` |
| Page load / CWV / bundle | `performance-optimization` | `~/.claude/skills/performance-optimization/SKILL.md` |
| Lenguaje ubicuo / ADRs | `domain-modeling` | `~/.claude/skills/domain-modeling/SKILL.md` |
| Diseñar interfaces de módulo | `codebase-design` | `~/.claude/skills/codebase-design/SKILL.md` |
| Bug difícil / regresión de perf | `diagnose` | `~/.claude/skills/diagnose/SKILL.md` |
| Review adversarial pre-merge | `judgment-day` | `~/.claude/skills/judgment-day/SKILL.md` |
| Conversación → PRD | `to-prd` | `~/.claude/skills/to-prd/SKILL.md` |
| PRD/plan → issues (slices verticales) | `to-issues` | `~/.claude/skills/to-issues/SKILL.md` |
| Crear un issue | `issue-creation` | `~/.claude/skills/issue-creation/SKILL.md` |
| Triage de issues | `triage` | `~/.claude/skills/triage/SKILL.md` |
| Abrir un PR | `branch-pr` | `~/.claude/skills/branch-pr/SKILL.md` |
| Diseñar/pulir/auditar UI | `impeccable` | `~/.claude/skills/impeccable/SKILL.md` |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### next-best-practices
**Trigger:** When writing, reviewing, or debugging Next.js code to detect and prevent common architectural and performance issues
- Use `next/image` for all images; configure `sizes` attribute for responsiveness and blur placeholders for LCP
- Always use `next/font` for font loading; integrate with Tailwind CSS and preload critical subsets
- Use Server Components by default; mark client boundaries with `'use client'` only where needed for interactivity
- Async `params` and `searchParams` in layouts/pages; async `cookies()` and `headers()` in Route Handlers and Actions
- Create parallel/concurrent fetches with `Promise.all()` to avoid data waterfalls; use Suspense for streaming
- Place error handling with `error.tsx`, `not-found.tsx`, and use `notFound()`, `redirect()`, `forbidden()`, `unauthorized()`
- Server-incompatible packages must be imported client-side; CSS import into components, not via link tags
- Detect invalid patterns: async Client Components, non-serializable props, invalid hook usage without Suspense boundaries
- Define `generateMetadata()` dynamically and generate OG images with `next/og` for SEO
- Use `route.ts` for GET/POST/PUT/DELETE; avoid conflict with `page.tsx` GET handler; prefer Server Actions for mutations
- Implement `generateStaticParams()` for dynamic routes; use `output: 'standalone'` with cache handlers for self-hosting

### vercel-react-best-practices
**Trigger:** When writing, reviewing, or refactoring React/Next.js code to ensure optimal performance and bundle size
- Eliminate waterfalls: move `await` into branches where used; use `Promise.all()` for independent operations; defer non-blocking work with `after()`
- Parallelize independent fetches with `Promise.all()` and use Suspense for streaming; restructure components to avoid sequential data loading
- Import directly from modules, never from barrel files; use `next/dynamic` for heavy components; defer third-party scripts to post-hydration
- Extract memoized components for expensive work; hoist default non-primitive props; split hooks with independent dependencies
- Use `React.cache()` for per-request deduplication; implement LRU cache for cross-request caching; minimize data serialized to client
- Use `startTransition()` for non-urgent updates and `useDeferredValue()` to keep input responsive; defer expensive renders
- Deduplicate with SWR on client; use passive event listeners for scroll; cache localStorage/sessionStorage reads
- Avoid inline components, no-op conditionals, and unnecessary memoization of primitives; derive state during render, not in effects
- Batch CSS changes via classes or `cssText`; use `Map` for O(1) repeated lookups; hoist RegExp and static I/O outside loops
- Use `content-visibility` for long lists; animate SVG wrapper not the element; reduce SVG coordinate precision; suppress expected hydration mismatches

### sanity-best-practices
**Trigger:** When designing Sanity schemas, writing GROQ queries, integrating with a frontend framework, or working with Visual Editing and page builders
- Define all schema types with `defineType()` or `defineField()`; validate with custom validators; deprecate fields via `hidden: true` with migration docs
- Write GROQ queries with type safety: use `defineQuery()` for client-side; optimize with projection (named fragments, count aggregation, field selection)
- Set up TypeGen; import generated types into your client; use TypeScript for all Sanity-powered queries and mutations
- Implement Visual Editing with Presentation Tool and Stega encoding; enable live preview using subscription hooks
- Use embedded Studio in Next.js App Router; place at `/studio` route
- Build Page Builder with portable array of blocks; map block `_type` to components
- Use Sanity's image URL builder; configure responsive `sizes`; generate LQIP with `fit=max&q=30&w=200`
- Localize at field level or document level; keep `/studio` separate from frontend code
- Migrate content with `@portabletext/block-tools` for HTML-to-Portable-Text; use GROQ patches for bulk updates

### tdd
**Trigger:** When the user wants to build features or fix bugs test-first, mentions red-green-refactor, or requests integration tests
- Write ONE test that verifies ONE behavior; write minimal code to pass, then next test (vertical slices, never horizontal)
- Tests describe public behavior, not implementation; use public APIs only; refactors must not break passing tests
- Avoid mocking internal collaborators; use real code paths through public interfaces (integration-style)
- Confirm the interface and prioritized behaviors with the user before writing any test code
- Never write all tests first then all implementation; that produces brittle tests coupled to imagined behavior
- Refactor ONLY after all tests pass; never refactor while RED; extract duplication and deepen modules
- Domain language: read `specs/DOMAIN.md` (este repo NO usa `CONTEXT.md`) and respect ADRs in the area touched
- Identify deep modules (small interface, deep implementation) for testability; cross-check with `codebase-design`
- One test → one implementation → repeat; each cycle responds to what the previous result taught

### tailwind-design-system
**Trigger:** When creating component libraries, implementing design systems, or standardizing UI patterns with Tailwind CSS v4
- Define all design tokens in `@theme` blocks; use OKLCH colors; semantic names (`--color-primary`, `--color-destructive`)
- Use `@import "tailwindcss"` for v4; replace `tailwind.config.ts` entirely with CSS-first config
- Build components with CVA (Class Variance Authority) for type-safe variants; compose with `cn()` (clsx + tailwind-merge)
- Dark mode with `@custom-variant dark (&:where(.dark, .dark *))` and scoped token overrides in `.dark`
- Define animations as `--animate-*` in `@theme` with matching `@keyframes`; `@starting-style` for entry
- Compound components with React 19 ref-as-prop (no `forwardRef`)
- Responsive grid via CVA variants + breakpoint prefixes (`sm:`, `lg:`, `xl:`)
- Accessibility: ARIA, focus rings (`--color-ring`), disabled states; validate contrast
- Never use `tailwind.config.ts`, arbitrary values, or hardcoded colors; extend `@theme`
- Use `@utility` for reusable custom utilities; `@theme inline`/`static` for variable scoping

### pixel-perfect-tailwind
**Trigger:** When converting a Figma or design mockup to Tailwind CSS v4, implementing a design pixel-perfect, or building responsive layouts with custom tokens and grid
- Content first: semantic unstyled markup (h1, p, ul, a, img) readable as plain document before classes
- Extract tokens from mockup (breakpoints, `--color-*`, `--font-*`, sizes) into `@theme`
- Mobile-first: flex + `grid place-items-center`; layer `sm:`/`lg:`/`xl:` for responsive
- Art-direct grid with lookup maps of complete classes, never string interpolation
- Use `grid-rows-subgrid` when blocks must share parent's row rhythm/baseline
- Layer `hover:`/`focus:` states; token-based focus rings
- Animations in `@theme @keyframes`; stagger via `--loop-index`; guard motion with `motion-safe:`
- Measure exact spacing/metrics/colors; match breakpoints where layout changes; verify side-by-side
- Arbitrary values only for one-off design-specific values; tokens for everything systemic
- Never use `tailwind.config.ts`; CSS-first `@theme` (Tailwind v4)

### web-design-guidelines
**Trigger:** Review UI code for Web Interface Guidelines compliance ("review my UI", "check accessibility", "audit design", "review UX")
- Fetch fresh guidelines from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` before each review
- Read specified files or prompt for file/pattern if none given
- Apply all rules from the fetched guidelines without modification
- Output findings in terse `file:line` format
- Load latest rule set every session; do not cache

### performance-optimization
**Trigger:** Optimize performance — page load, bundle size, queries, bottlenecks; React optimization, lazy loading, caching, code splitting, profiling
- Measure first with Lighthouse / Web Vitals before proposing optimizations
- Prevent unnecessary re-renders with `React.memo`; memoize computed values with `useMemo`
- Code splitting with `lazy()` + `Suspense`; route-based splitting by default
- Remove N+1 queries (joins/includes); add indexes for frequent lookups
- Cache (Redis/in-memory) with expiration to avoid stale data
- Optimize images with Next.js Image, WebP, responsive sizing
- Reduce bundle via tree-shaking (specific exports); analyze with bundle analyzer
- Targets: LCP < 2.5s, FID < 100ms, CLS < 0.1 as convergence criteria
- Never optimize without an identified bottleneck; don't sacrifice readability for marginal gains

### domain-modeling
**Trigger:** Build/sharpen the project's domain model — ubiquitous language, record an architectural decision (ADR)
- Glossary in `specs/DOMAIN.md` (este repo NO usa `CONTEXT.md`; no crear uno) — glossary only, zero implementation details
- Challenge conflicting terms immediately; propose precise canonical terms for vague/overloaded language
- Stress-test definitions with edge-case scenarios; update inline as terms resolve
- Write ADRs in `docs/adr/` ONLY when all three hold: hard to reverse, surprising without context, genuine trade-off
- Check code against glossary; surface contradictions explicitly (don't silently override)
- For changes to domain language, edit `specs/DOMAIN.md`/`specs/SANITY-SCHEMA.md`, not N places

### codebase-design
**Trigger:** Design/improve a module's interface, find deepening opportunities, place a seam, make code more testable
- Use exact terms: Module, Interface, Implementation, Adapter, Seam, Leverage, Locality, Depth (don't substitute component/service/boundary)
- Design interfaces as small surface + large implementation: fewer methods, simpler params, hide complexity
- Deletion test: if deleting a Module eliminates complexity across N callers, it earned its keep
- Place the seam where behavior varies; one adapter = hypothetical seam, two = real seam needing abstraction
- Accept dependencies as parameters (not created internally); return results instead of side effects
- Testability through the Interface: callers and tests cross the same seam (e.g. core `createLead` with injected deps)
- Avoid shallow modules (large interface ≈ thin implementation); measure depth-as-leverage
- Write tests at the Module's Interface level, exercising real bug patterns at call sites

### diagnose
**Trigger:** Hard bugs and performance regressions — "diagnose"/"debug this", something broken/throwing/failing/slow
- Build a deterministic feedback loop (Phase 1) BEFORE hypothesising: failing test, curl, CLI fixture, headless browser, bisection
- Treat the loop as a product: fast, deterministic, sharp signal
- Reproduce the bug deterministically (Phase 2); confirm it's the user's failure mode, not a different bug
- Generate 3–5 ranked falsifiable hypotheses (Phase 3) before testing any
- Instrument selectively (Phase 4): breakpoints > logs; tag logs `[DEBUG-prefix]` for cleanup
- For perf regressions, baseline first, then bisect; logs usually mislead
- Regression test at the correct seam (Phase 5); if no seam exists, that's the finding
- Cleanup (Phase 6): remove all `[DEBUG-...]`, verify repro gone, document the correct hypothesis
- Do NOT proceed past Phase 1 without a deterministic loop

### judgment-day
**Trigger:** Parallel adversarial review — "judgment day", "dual review", "juzgar", "que lo juzguen"
- Resolve skills via this registry before launching judges; inject `## Project Standards` into all delegations
- Launch Judge A and Judge B in parallel (async); each blind to the other
- Classify every WARNING: real (bug/security/data loss on normal usage) vs theoretical (contrived scenario)
- Synthesize: Confirmed (both), Suspect (one), Contradiction (disagree), INFO (theoretical)
- Present verdict table; ASK before fixing — respect user decision
- Delegate a separate Fix Agent only for Confirmed CRITICALs / real WARNINGs; scope across touched files
- Re-launch both judges after fixes (Round 2); APPROVED only at 0 CRITICALs + 0 real WARNINGs
- After 2 fix iterations, ASK user whether to continue; never declare APPROVED until judges pass clean

### to-prd
**Trigger:** Turn the current conversation into a PRD and publish it to the issue tracker
- Explore the repo and respect ADRs in the area touched; sketch test seams (prefer existing, highest point)
- Confirm test seams with the user before writing the PRD
- Template sections: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes
- User stories extensive, format "As an <actor>, I want a <feature>, so that <benefit>"
- Implementation Decisions MUST omit specific file paths; snippets only for decision-rich state machines/reducers/schemas/types
- Testing Decisions specify which modules are tested and reference prior art
- Publish to tracker with `ready-for-agent` label

### to-issues
**Trigger:** Break a plan/spec/PRD into independently-grabbable issues using tracer-bullet vertical slices
- Gather context from conversation or fetch the referenced issue; explore using domain glossary + ADRs
- Look for prefactoring ("make the change easy, then make the easy change")
- Each issue is a complete VERTICAL slice (schema→API→UI→tests), NOT a horizontal layer
- A completed slice is demoable/verifiable on its own
- Present breakdown as numbered list with Title, Blocked by, User stories
- Quiz user on granularity/dependencies/merge-split; iterate until approved
- Publish in dependency order (blockers first) so real identifiers can be referenced

### issue-creation
**Trigger:** Creating a GitHub issue, reporting a bug, or requesting a feature
- Search existing issues before creating (avoid duplicates)
- Use a template (bug report or feature request); questions go to Discussions, not issues
- This repo's triage roles: category (`bug`/`enhancement`) + state (`needs-triage`/`needs-info`/`ready-for-agent`/`ready-for-human`/`wontfix`) — see `specs/agents/labels.md`
- Issues live in `GDC94/Hausly` via `gh` CLI — see `specs/agents/tracker.md`
- Provide clear repro/expected/actual for bugs; problem + proposed solution + affected area for features

### triage
**Trigger:** Move issues/PRs through triage roles — categorise, verify, grill, write agent-ready briefs
- Every triage comment MUST start with: `> *This was generated by AI during triage.*`
- Exactly one category role (`bug`/`enhancement`) + one state role per issue; flag conflicts
- Verify the claim before grilling (reproduce bug / confirm PR diff); explore codebase for redundancy + prior rejection
- `ready-for-agent`: post an agent brief comment; `ready-for-human`: same brief + why it can't be delegated
- `needs-info`: post "What we've established" / "What we still need"; `wontfix` (rejected): record + close
- PRs externos NO son superficie de triage (este repo) — ver `specs/agents/tracker.md`
- Quick override ("move #42 to ready-for-agent"): trust maintainer, apply role, skip grilling

### branch-pr
**Trigger:** Creating a pull request, opening a PR, or preparing changes for review
- Every PR MUST link an issue with `Closes #N` / `Fixes #N` / `Resolves #N`
- Branch name MUST match `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$`
- Conventional commits: `type(scope): description`; NO `Co-Authored-By` trailers (regla del proyecto)
- PR body: linked issue + Summary (1-3 bullets) + Changes table + Test plan
- Exactly one `type:*` label matching the commit type (`feat`→feature, `fix`→bug, `docs`→docs, `refactor`→refactor, `chore/style/test/build/ci`→chore, `perf`→feature)
- El agente NUNCA pushea a `main`; rama desde `main`, PR, el merge (squash) lo decide el usuario

### impeccable
**Trigger:** Design, redesign, critique, audit, polish, animate, or otherwise improve a frontend interface
- Before design work load product context: en este repo `PRODUCT.md` ≈ `specs/PRD.md` + `specs/DESIGN.md` (tokens) + `specs/LAYOUT.md` (anatomía)
- Never use `#000` or `#fff`; tint every neutral toward brand hue (chroma 0.005–0.01)
- Dark vs light: write one sentence of physical scene to force the choice
- Cap body line length 65–75ch; hierarchy via scale + weight contrast (≥1.25 ratio between steps)
- Vary spacing for rhythm; cards only when best affordance; nested cards always wrong
- Do NOT animate CSS layout properties; ease-out exponential curves (quart/quint/expo), no bounce/elastic
- Absolute bans: side-stripe borders, gradient text, glassmorphism-by-default, hero-metric template, identical card grids, modal-as-first-thought
- No em dashes; avoid category-reflex and second-order-reflex color choices
- The visual sources of truth remain `specs/DESIGN.md` (tokens) + `specs/LAYOUT.md` (anatomy); the skill is the tool, the specs are the law

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| CLAUDE.md | `CLAUDE.md` | Índice + reglas + workflow + auto-load de skills. Referencia todos los specs. |
| Skills policy | `specs/SKILLS.md` | Qué skills usa el proyecto y cuándo (curación 18/45). |
| PRD | `specs/PRD.md` | Producto: qué y por qué. Entrada. |
| Stack | `specs/STACK.md` | Next.js, Sanity, Tailwind v4, shadcn, Vitest/Playwright/lhci, Vercel, PostHog, Biome/pnpm. |
| Dominio | `specs/DOMAIN.md` | Glosario / lenguaje ubicuo (reemplaza a CONTEXT.md). |
| Schema | `specs/SANITY-SCHEMA.md` | property/zone/agency/lead; `name` inglés / `title` español. |
| Arquitectura | `specs/ARCHITECTURE.md` | Estructura feature-based, data flow, rendering, filtros. |
| Filtros | `specs/FILTERS.md` | searchParam ↔ campo ↔ GROQ ↔ control. Precio/moneda/operación. |
| Design tokens | `specs/DESIGN.md` | Color, tipografía, radius, motion, breakpoints. |
| Layout | `specs/LAYOUT.md` | Anatomía de páginas (wireframe-level). |
| SEO/a11y | `specs/SEO.md` | Metadata, JSON-LD, sitemap, a11y 100% Lighthouse. |
| Testing | `specs/TESTING.md` | Pirámide determinista + bypass de previews Vercel. |
| Analytics | `specs/ANALYTICS.md` | PostHog, funnel, consentimiento, sin PII. |
| Issues backlog | `specs/ISSUES.md` | 15 issues por slices verticales (Specs + Skills por issue). |
| Agent config | `specs/agents/` | `tracker.md` (GitHub Issues), `labels.md` (triage), `domain.md` (cómo leer el dominio). |
