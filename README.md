# Personal Website

A static portfolio site — plain HTML, CSS, and JavaScript. No framework, no build step.
Vite is here purely as a local dev server with hot reload; it plays no part in the deploy.
Deployed on Cloudflare Pages straight from this GitHub repo.

## Files

| File          | What it holds                                                        |
| ------------- | -------------------------------------------------------------------- |
| `index.html`  | All page content — hero, About, Work, Experience, Contact             |
| `styles.css`  | Design tokens at the top, then sections in the same order as the HTML |
| `main.js`     | Mobile nav, scroll-spy nav highlighting, fade-in on scroll, footer year |
| `404.html`    | Not-found page (Cloudflare Pages serves this automatically)           |
| `package.json`| Just the `dev` script and Vite — no build, not used in deployment     |

## Working on it locally

```sh
npm install   # first time only
npm run dev   # → http://localhost:5173
```

That's Vite, serving the files with hot reload — save any file and the browser updates
on its own. Vite is a **dev-only** dependency: it doesn't compile or bundle anything here,
it just serves the same plain files you wrote. Ctrl-C stops it.

You can still skip it entirely and open `index.html` in a browser directly. Everything
uses relative paths, so it works straight off the filesystem.

## Deploying to Cloudflare Pages

One-time setup:

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick this repo, then set:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. **Save and Deploy.**

Vite is not involved in any of this — Cloudflare serves the raw files, so there is no
build to configure or break.

After that, every push to `main` redeploys automatically. Pull requests get their own
preview URL. To use your own domain, go to the project's **Custom domains** tab.

## Making it yours

Search `index.html` for `TODO` and placeholder copy, then:

- **Name and metadata** — `<title>`, `<meta name="description">`, and the `og:` tags in `<head>`.
  These are what show up in search results and link previews.
- **Colors** — the `--accent` variable at the top of `styles.css`. It drives buttons, links,
  section numbers, and the hero glow. Change that one value to reskin the site.
- **Photo** — save one to `assets/portrait.jpg` and replace the `.portrait` placeholder div
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
