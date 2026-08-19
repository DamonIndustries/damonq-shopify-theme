# Agent Instructions — damonq-shopify-theme

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, etc.)
working in this repository. Humans should read `README.md`; this file is the
contract for automated contributors.

## What this repo is

The Shopify **theme** for Damon Industries' storefront — a Dawn-based theme.
This repo contains ONLY the theme. Custom apps, Shopify Functions, data
scripts, and anything using the Admin API live in separate repositories.
Theme code is publicly served: **never add API keys, tokens, store
credentials, or any secret to this repo.**

## Environments and branches

One Shopify store, three themes, three long-lived branches. Deploys happen
exclusively through the Shopify GitHub integration — a push to a connected
branch updates its theme automatically.

| Branch | Shopify theme        | Purpose                          |
|--------|----------------------|----------------------------------|
| `main` | Published (live)     | Production                       |
| `qa`   | Unpublished "QA"     | Stakeholder review surface       |
| `dev`  | Unpublished "DEV"    | Integration of in-progress work  |

Promotion flow: `feature/* → dev → qa → main`.

## Hard rules

1. **Never push directly to `main`.** It receives merges from `qa` and
   automatic sync commits from the Shopify bot (marketing's theme-customizer
   edits). Nothing else. Never rewrite history on any connected branch.
2. **Never run `shopify theme push` against the live theme** (or any
   connected theme). Deploys go through git. `shopify theme dev` (ephemeral
   development theme) is the only way you preview changes.
3. **Content JSON is owned by production.** `config/settings_data.json`,
   `templates/*.json`, and section-group JSON in `sections/*.json` carry
   marketing's customizer edits. Do not reformat, "clean up", re-key, or
   hand-edit content values in these files. In any merge conflict on these
   files, `main`'s version wins.
4. **QA is a review surface, not a workspace.** `qa` is reset to an exact
   copy of `main` on the 1st of each month (snapshot-merge, history
   preserved — see `.github/workflows/sync-qa-from-main.yml`). Never base a
   branch on `qa`; never leave work only on `qa`.
5. **Do not modify `.github/workflows/`** unless the task is explicitly
   about CI.

## Workflow for making changes

1. Sync first: `git fetch origin && git merge origin/main` into `dev` (or
   rebase your feature branch) so you carry current prod content.
2. Branch from `dev`: `feature/<short-description>`.
3. Develop with `shopify theme dev --store <store>.myshopify.com` for live
   preview. Run `shopify theme check` before committing; CI runs Theme Check
   on every PR and failures block merge.
4. Open a PR into `dev`. Fill out the PR template — especially the question
   about whether content JSON files are touched (they normally should not be).
5. Promotion `dev → qa` and `qa → main` is done by maintainers via PR/merge.
   Do not perform these merges unless explicitly asked.

## Committing and pushing

**Where you may commit:** feature branches (`feature/*`, `fix/*`) only,
branched from `dev`. Never commit directly on `main`, `qa`, or `dev` — even
for "trivial" changes. `dev` receives changes via PR; `qa` and `main` via
maintainer promotion merges; `main` additionally receives Shopify bot sync
commits.

**When to commit:** in small, logical units — one concern per commit (a
section, a bug fix, a style change), not one giant commit per task. Before
every commit: `shopify theme check` passes, and `git status` shows no
unintended files (especially no `config/settings_data.json` or
`templates/*.json` changes you didn't deliberately make — if they appear
modified, restore them: `git checkout -- <file>`).

**Version bump on every commit:** each commit must increment the patch
(third) component of `theme_version` in `config/settings_schema.json`
(`theme_info` block) — one commit, one bump, included in that same commit
(e.g. `1.0.142 → 1.0.143`). Merge commits and Shopify bot sync commits are
exempt. On a merge/rebase conflict over `theme_version`, resolve to the
highest version either side has seen, plus one.

**Commit messages:** imperative subject line under 72 chars, e.g.
`Add announcement bar section with schedule settings`. Add a body when the
"why" isn't obvious. If your tooling adds a `Co-Authored-By` trailer,
keep it — commits should be attributable to agent vs. human.

**When to push:** push your feature branch to `origin` whenever the work is
in a shareable state, and always before opening the PR into `dev`. Do not
push to `main`, `qa`, or `dev` directly — remember every push to a connected
branch deploys to its Shopify theme immediately. **Never force-push any
long-lived branch** (`main`/`qa`/`dev`); force-pushing your own unshared
feature branch is acceptable.

**Never:** commit secrets or tokens; commit generated noise (`node_modules/`,
`.shopify/`, `.DS_Store`); rewrite history on connected branches; merge
`dev → qa` or `qa → main` unless explicitly instructed.

## Conventions

- Dawn architecture: sections in `sections/`, reusable blocks in `blocks/`
  (if present) and `snippets/`, assets in `assets/`, settings schema in
  `config/settings_schema.json`.
- New functionality should be a section or block with settings exposed in the
  schema, so marketing can manage it in the customizer — avoid hard-coding
  copy or images when a setting is reasonable.
- Match existing code style; Prettier with `@shopify/prettier-plugin-liquid`
  and `.editorconfig` define formatting. Do not introduce build tooling
  (bundlers, transpilers) — this is a vanilla Dawn-style theme.
- Keep JS dependency-free and small; theme performance is a hard requirement.
- Translations/customer-facing strings go in `locales/` files, not inline.

## Docs access

`.mcp.json` configures Shopify's Dev MCP server (`@shopify/dev-mcp`), which
provides current Liquid, theme, and Shopify API documentation. Prefer it over
memory when unsure about Liquid filters, section schema options, or theme
requirements.
