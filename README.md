# Site files for abdelkassar.com

Drop-in replacement for the TeXify3 theme. Nothing in `.github/workflows/` or `static/CNAME.txt` changes.

## To publish

1. Copy `layouts/`, `static/`, `data/`, `content/` and `hugo.toml` into the repo root, overwriting what is there.
2. Delete the old theme partials: `layouts/partials/header.html` and `layouts/partials/footer.html`.
3. Delete the committed `public/` folder — the Actions workflow builds it.
4. `git add -A && git commit -m "Redesign" && git push`

GitHub Actions builds and deploys on push to `main`. Give it about a minute.

## To check it first

```
hugo server
```

## Editing afterwards

- **Projects** — `data/projects.yaml`, one entry each. Order in the file is order on the page.
- **Posts** — `content/posts/*.md`. Set `draft = false` to publish. `$$ ... $$` renders as display math.
- **Email** — set `email` under `[params]` in `hugo.toml`; the About section reads it.
- **The header** — `static/js/garden.js`. `DENSITY` and `BLOOM` at the top are the two knobs.
