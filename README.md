# damonq-shopify-theme

The Shopify theme for Damon Industries' storefront (Dawn-based). This repo
contains **only the theme** — custom apps, Shopify Functions, and data/ops
scripts live in separate repositories.

AI coding agents: read [`AGENTS.md`](AGENTS.md) before touching anything.

## How environments work

One Shopify store, three themes, three long-lived branches, deployed via the
**Shopify GitHub integration** (a push to a connected branch updates its
theme automatically — no manual `theme push`):

| Branch | Shopify theme      | Purpose                         |
|--------|--------------------|---------------------------------|
| `main` | Published (live)   | Production                      |
| `qa`   | Unpublished "QA"   | Stakeholder review surface      |
| `dev`  | Unpublished "DEV"  | Integration of in-progress work |

Promotion flow: `feature/* → dev → qa → main` (each step by PR/merge).

Two-way sync: marketing edits the live theme in the customizer, and the
Shopify bot commits those changes back to `main` ("Update from Shopify"
commits). This is expected — git is the audit trail and backup for content.

### The rules that make this work

- **Nobody pushes directly to `main`** — it only receives merges from `qa`
  and sync commits from the Shopify bot.
- **Content JSON is owned by prod.** `config/settings_data.json` and
  `templates/*.json` carry marketing's customizer edits. In merge conflicts
  on these files, `main`'s version wins.
- **QA is a review surface, not a workspace.** On the 1st of each month a
  scheduled workflow resets `qa` to an exact copy of `main` via a
  snapshot-merge (no force-push, full history preserved — anything that was
  on `qa` remains recoverable from `git log qa`). Anything worth keeping must
  be merged onward or live on a feature branch before then. The reset can
  also be run on demand from the Actions tab (e.g. right after a release).
- **Sync `dev` from `main` regularly** — always before starting new work —
  so features are built against current prod content. This is the
  developers' responsibility; it is not automated.
- Content edits happen in the customizer **on the live theme only**; edits to
  the QA/DEV themes in the customizer will commit to `qa`/`dev` and surprise
  you during promotion.

## Local development

```bash
shopify theme dev --store <your-store>.myshopify.com   # live-reload preview on an ephemeral dev theme
shopify theme check                                     # lint; CI runs this on every PR
```

Never run `shopify theme push` against connected themes — deploys go through
git.

Optional formatting setup: `npm install -D prettier @shopify/prettier-plugin-liquid`
(config in `.prettierrc.json`).

## One-time setup (new store connection)

1. Pull the current live theme into the repo root:
   `shopify theme pull --store <your-store>.myshopify.com` — commit and push
   to `main`.
2. Create `qa` and `dev` from `main` and push both.
3. Install the [Shopify GitHub app](https://github.com/apps/shopify) and
   grant it this repository.
4. In Shopify admin → Online Store → Themes: **Add theme → Connect from
   GitHub** for `dev` (name it "DEV") and `qa` (name it "QA – do not
   publish").
5. Connect `main` to a theme and publish it (or connect, verify it matches
   live, then publish).

### Branch protection notes

- Protect `qa` and `dev` however you like (PRs into `dev` recommended).
- Do **not** require PRs for all pushes on `main` — that blocks the Shopify
  sync bot and breaks two-way customizer sync. If you protect `main`, add
  the Shopify app as a bypass.

## Releases and rollback

Tag each `qa → main` merge (`vYYYY.MM.DD` or semver). Rollback = revert the
merge commit on `main` (the integration deploys the revert), or republish a
backup theme from the admin in an emergency.

## CI

- **Theme Check** (`.github/workflows/theme-check.yml`) — lints Liquid/JSON
  on every PR.
- **Monthly QA reset** (`.github/workflows/sync-qa-from-main.yml`) — resets
  `qa` to prod on the 1st of each month; manual runs from the Actions tab.
- **Dependabot** keeps the GitHub Actions up to date.
