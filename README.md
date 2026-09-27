# Personal Website

A static portfolio site — plain HTML, CSS, and JavaScript. No framework, no build step.
Deployed to Cloudflare Workers as static assets, straight from this GitHub repo.
Vite is a local dev server only.

## Files

| Path             | What it holds                                                       |
| ---------------- | ------------------------------------------------------------------- |
| `index.html`     | All page content — hero, About, Work, Experience, Contact            |
| `404.html`       | Not-found page                                                       |
| `styles.css`     | Design tokens at the top, then sections in HTML order                |
| `main.js`        | Mobile nav, scroll-spy, fade-in on scroll, footer year               |
| `public/`        | Static files copied to `dist/` untouched — images, favicon, etc.     |
| `vite.config.js` | Declares both HTML pages as build entries                            |
| `wrangler.jsonc` | Deploy config                                                        |
| `dist/`          | Build output. Generated, gitignored — never edit by hand.            |

## Working on it locally

```sh
npm install   # first time only
npm run dev   # → http://localhost:5173, hot reload
npm run build # → writes dist/
```

`index.html` is a real Vite entry, so `styles.css` and `main.js` get bundled and
content-hashed into `dist/assets/` at build time.

**The `<script>` tag must keep `type="module"`.** Without it Vite refuses to bundle
`main.js` and silently drops it from `dist/` — the page then loads with no JavaScript,
and because `.reveal` elements start at `opacity: 0`, most of the page renders blank.

## Deploying

Cloudflare builds and deploys on every push to `main`.

**The deploy command in the Cloudflare dashboard must be `npm run deploy`**,
not `npx wrangler deploy`. Wrangler only uploads; it does not build. With the bare
wrangler command the deploy fails with:

```
The directory specified by the "assets.directory" field does not exist: /opt/buildhome/repo/dist
```

because nothing created `dist/`. The `deploy` script runs `vite build` first, which
is required now that `main.js` imports GSAP and has to be bundled.

To rehearse the exact CI sequence locally:

```sh
rm -rf dist
npx vite build
npx wrangler deploy --dry-run   # should report ~35 files from dist/
```

To use your own domain: Cloudflare dashboard -> the Worker -> **Settings** ->
**Domains & Routes**.

## Making it yours

All the content lives in `index.html`:

- **Name and metadata** — `<title>`, `<meta name="description">`, and the `og:` tags in `<head>`.
  These are what show up in search results and link previews.
- **Colors** — the `--accent` variable at the top of `styles.css`. It drives buttons, links,
  section numbers, and the hero glow. Change that one value to reskin the site.
- **Photo** — save one to `public/portrait.jpg` and replace the `.portrait` placeholder div
  in the About section with `<img src="/portrait.jpg" alt="Carter Lin">`.
- **Projects** — each project is one `<article class="card">`. Copy an existing one and edit it.
- **Experience** — same idea with `<li class="timeline-item">`.
- **Links** — the `href="#"` placeholders in the Work cards and the Contact social list.

New elements fade in on scroll if you give them `class="reveal"`.

## Notes

- Dark mode follows the visitor's OS setting via `prefers-color-scheme` — no toggle to wire up.
- Respects `prefers-reduced-motion`; animations are skipped for visitors who ask for that.
- Inter is loaded from Google Fonts with a system-font fallback stack, so the page still
  looks right if that request fails.
