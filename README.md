# Personal Website

A static portfolio site — plain HTML, CSS, and JavaScript. No framework, no build step.
Deployed to Cloudflare Workers as static assets, straight from this GitHub repo.
Vite is a local dev server only.

## Files

| Path              | What it holds                                                          |
| ----------------- | ---------------------------------------------------------------------- |
| `public/`         | **Everything that gets deployed.** Only these files reach the internet. |
| `public/index.html` | All page content — hero, About, Work, Experience, Contact             |
| `public/styles.css` | Design tokens at the top, then sections in HTML order                 |
| `public/main.js`  | Mobile nav, scroll-spy highlighting, fade-in on scroll, footer year     |
| `public/404.html` | Not-found page                                                          |
| `wrangler.jsonc`  | Deploy config: serve `public/` as static assets, no build               |
| `package.json`    | The `dev` script plus dev-only tooling                                  |

## Working on it locally

```sh
npm install   # first time only
npm run dev   # → http://localhost:5173
```

That's Vite, serving the files with hot reload — save any file and the browser updates
on its own. Vite is a **dev-only** dependency: it doesn't compile or bundle anything here,
it just serves the same plain files you wrote. Ctrl-C stops it.

You can still skip it entirely and open `public/index.html` in a browser directly.
Everything uses relative paths, so it works straight off the filesystem.

## Deploying

Pushing to `main` deploys automatically. Cloudflare runs `npx wrangler deploy`, which
reads `wrangler.jsonc` and uploads the contents of `public/` — nothing is compiled.

**Do not set a build command** in the Cloudflare dashboard, and keep `wrangler.jsonc`
committed. Without that file, Wrangler runs auto-config, sees Vite in `package.json`,
assumes this is a Vite app, and fails the build trying to compile a site that needs no
compiling.

To check the deploy config without shipping anything:

```sh
npx wrangler deploy --dry-run    # should report 4 files from public/
```

If that ever reports `node_modules` or a file count in the hundreds, something is
pointing at the repo root instead of `public/`.

To use your own domain, open the Worker in the Cloudflare dashboard → **Settings** →
**Domains & Routes**.

## Making it yours

All the content lives in `public/index.html`:

- **Name and metadata** — `<title>`, `<meta name="description">`, and the `og:` tags in `<head>`.
  These are what show up in search results and link previews.
- **Colors** — the `--accent` variable at the top of `public/styles.css`. It drives buttons, links,
  section numbers, and the hero glow. Change that one value to reskin the site.
- **Photo** — save one to `public/assets/portrait.jpg` and replace the `.portrait` placeholder div
  in the About section with `<img src="assets/portrait.jpg" alt="Carter Lin">`.
- **Projects** — each project is one `<article class="card">`. Copy an existing one and edit it.
- **Experience** — same idea with `<li class="timeline-item">`.
- **Links** — the `href="#"` placeholders in the Work cards and the Contact social list.

New elements fade in on scroll if you give them `class="reveal"`.

## Notes

- Dark mode follows the visitor's OS setting via `prefers-color-scheme` — no toggle to wire up.
- Respects `prefers-reduced-motion`; animations are skipped for visitors who ask for that.
- Inter is loaded from Google Fonts with a system-font fallback stack, so the page still
  looks right if that request fails.
