# FreeHub

A directory of free assets, tools, and open-source resources for designers and developers.

## Run it

```bash
npm install
npm run dev
```

## Add a resource

Add one line to `data/manual.json`, then rebuild the catalog. Resources don't need an image.

```json
{ "title": "Site name", "url": "https://example.com", "category": "fonts", "section": "Font libraries", "description": "One short sentence." }
```

`category` is the category's URL name, such as `fonts`, `ui-kits`, or `game-dev`. Resources in this file are listed first in their category.

## Update the catalog

```bash
npm run resources
```

This fetches the open lists again and writes `src/assets/db/assets-*.json`. Don't edit those files by hand, because the next run replaces them.

```bash
npm run resources:check
```

This also tests new links and removes the dead ones. Results are cached in `data/link-status.json`.

## Sources

Only lists with a license that allows reuse are imported. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
