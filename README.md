# Prince Kunal — Portfolio

A pixel-platformer portfolio with two modes:

- **Game mode** (`/#play`): a side-scrolling level. Hit `</>` blocks for skills, open terminals for projects, grab the Kollide power-up, visit the research lab, collect hackathon trophies, reach the flag for contact details.
- **Recruiter mode** (`/#recruiter`): the same content as a fast one-page portfolio. It is linked from every screen, so nobody has to play.

Plain HTML/CSS/JS. No build step, no dependencies.

## Run it locally

```bash
cd portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly also works.

## Edit the content

All text lives in **`js/content.js`**: profile, experience, projects, skills, education, and the 14 skills hidden in the blocks. Both modes read from it.

**To do before launch:** fill in the empty `links` fields with live demos and GitHub repos (`demo`, `repo`, `site`). Empty links are hidden.

## Edit your avatar

The avatar is drawn from text in **`js/sprites.js`**, one letter per pixel. It is a single 32×40 drawing used everywhere: the title screen, recruiter mode and the game, where it is drawn into the player's 16×20 slot.

- `AVATAR_PALETTE` sets the colours: hair, skin, glasses, beard, shirt, watch, trousers, shoes.
- `AVATAR_TOP` is the head and shirt; `AVATAR_LEGS` has the leg rows for each pose (idle, run1, run2, jump). Rows must stay 32 characters wide.

After changing it, regenerate `assets/favicon.png` (head crop), `assets/avatar.png` and `assets/og-image.png`. Alternatively, screenshot the title screen at 1200×630 for the og image.

## Controls

| | Keyboard | Phone |
|---|---|---|
| Move | ← → or A D | ◀ ▶ |
| Jump | Space, ↑, W | A |
| Open terminal | ↓, E, Enter | B |

Sound is off by default; turn it on with the SOUND button.

## Deploy to Cloudflare Pages (free)

1. Push this folder to a GitHub repo.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, then pick the repo.
3. Framework preset: **None**. Build command: *(leave empty)*. Output directory: `/`.
4. Deploy. You get `https://<project>.pages.dev`.
5. Optional custom domain: **Custom domains → Set up a domain**, then follow the DNS steps.

After you have a final URL, change `og:image` in `index.html` to the full absolute URL, for example `https://princekunal.me/assets/og-image.png`. Without that, link previews on LinkedIn and WhatsApp won't show the image.

GitHub Pages also works: Settings → Pages → deploy from the `main` branch, root folder.
