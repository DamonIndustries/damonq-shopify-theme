# What & why

<!-- One or two sentences: what changes and why. Link any ticket/issue. -->

## Checklist

- [ ] Target branch is `dev` (promotions `dev → qa → main` are maintainer merges)
- [ ] Previewed with `shopify theme dev`
- [ ] `shopify theme check` passes locally
- [ ] Branch was synced from `main` before this work (carries current prod content)

## Content JSON

Does this PR touch `config/settings_data.json`, `templates/*.json`, or
section-group JSON?

- [ ] No
- [ ] Yes — explain why (these files are owned by prod/marketing; code PRs
      normally must not change them):

<!-- explanation here -->

## Screenshots / preview link

<!-- For visual changes: before/after screenshots or the theme preview URL. -->
