# Deploying MindQuest (free)

MindQuest is a static single-page app: `npm run build` produces a `dist/` folder of
HTML, CSS, JS and images. There is no server and no database, so any static host
works and the free tiers are more than enough for a college project.

**Recommended: Vercel.** Netlify is an equally good alternative. Both are covered below.

---

## 0. Before you deploy

Run these locally and make sure both pass:

```bash
npm install
```

```bash
npm run typecheck
```

```bash
npm run build
```

Then preview the real production build (not the dev server):

```bash
npm run preview
```

Open the URL it prints and click through: home → Start Game Quest → breathing →
Level 1 → Level 2 → Level 3 → result. If that works locally, it will work deployed.

### Push to GitHub first

Both hosts deploy from a Git repo. Make sure your latest code is pushed:

```bash
git add -A && git commit -m "Production-ready build" && git push
```

> **Check before pushing:** `.env` must NOT be in the repo. It is listed in
> `.gitignore`, so `git status` should never show it. `.env.example` is the file
> that gets committed — it documents the variable names with empty values.

---

## 1. Environment variables

Only one variable actually affects the build:

| Variable | Required | What it does |
| --- | --- | --- |
| `VITE_ELEVENLABS_AGENT_ID` | For the AI Buddy screen | Identifies your ElevenLabs conversational agent |
| `VITE_API_URL` | No | Reserved for a future backend; nothing reads it |
| `VITE_APP_ENV` | No | Reserved; nothing reads it |
| `VITE_GOOGLE_ANALYTICS_ID` | No | Reserved; nothing reads it |

Everything else in the app runs entirely in the browser. Game results are stored
in the visitor's own `localStorage` and never leave their device.

**Never add an ElevenLabs API key here.** Vite inlines every `VITE_`-prefixed value
directly into the public JavaScript bundle, so anyone can read it with devtools.
The agent id is not a secret; an API key is. The app is built to need only the id.

---

## 2. Deploy on Vercel (recommended)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New… → Project**, then **Import** your `MindQuest` repository.
3. Vercel reads `vercel.json` from the repo, so the build settings fill in
   automatically:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

   Leave them as detected.
4. Expand **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `VITE_ELEVENLABS_AGENT_ID` | your agent id |

   Apply it to **Production**, **Preview**, and **Development**.
5. Click **Deploy** and wait ~1 minute.

You get a URL like `https://mind-quest-xyz.vercel.app`. Every later `git push` to
`main` redeploys automatically.

> If you add or change an environment variable *after* the first deploy, you must
> redeploy for it to take effect — Vite bakes these values in at build time. Use
> **Deployments → ⋯ → Redeploy**.

---

## 3. Deploy on Netlify (alternative)

1. Go to **[netlify.com](https://netlify.com)** and sign in with GitHub.
2. **Add new site → Import an existing project → GitHub**, pick `MindQuest`.
3. `netlify.toml` in the repo already sets the build command (`npm run build`),
   the publish directory (`dist`), and Node 20. Accept the detected settings.
4. Before the first build, open **Site configuration → Environment variables** and
   add `VITE_ELEVENLABS_AGENT_ID`.
5. Click **Deploy site**.

You get a URL like `https://mind-quest-xyz.netlify.app`.

---

## 4. Why the SPA rewrite matters

MindQuest uses `createBrowserRouter`, so `/mindquest/level2` is a client-side route.
There is no `level2.html` on disk. Without a rewrite rule, opening that URL directly
— or just pressing refresh mid-game — returns the host's own 404 page.

The repo ships the rule for both hosts, so this is already handled:

- **Netlify** — `public/_redirects` and the `[[redirects]]` block in `netlify.toml`
- **Vercel** — the `rewrites` block in `vercel.json`

**Test it after deploying:** open `https://your-site/mindquest/level1` directly in a
new tab. If Level 1 loads, rewrites are working. If you see a 404, the config file
did not reach the host.

---

## 5. Wiring up the AI Buddy screen

The AI Buddy voice chat needs two things beyond the environment variable.

1. **The agent must be public.** In the
   [ElevenLabs dashboard](https://elevenlabs.io/app/conversational-ai), open your
   agent → **Security**, and enable unauthenticated / public access. Without it the
   browser cannot open a session without a server-signed URL.
2. **Your deployed domain must be allow-listed.** In the same Security panel, add
   your production origin (for example `https://mind-quest-xyz.vercel.app`).
   This is the single most common reason AI Buddy works on `localhost` but fails
   after deploying.

Microphone access also requires **HTTPS**. Vercel and Netlify both issue TLS
certificates automatically, so this is fine on either. It is only a problem if you
serve the build over plain `http://` from some other machine — browsers block
`getUserMedia` there. (`http://localhost` is specifically exempt, which is why dev
works.)

---

## 6. What about GitHub Pages?

It is free and it works, but it is the fiddliest of the three:

- Pages has no rewrite rules, so deep links 404. The usual workaround is copying
  `dist/index.html` to `dist/404.html` at build time.
- If you deploy to `username.github.io/MindQuest/` rather than a custom domain, you
  must also set `base: '/MindQuest/'` in `vite.config.ts` and pass a matching
  `basename` to `createBrowserRouter`, or every asset path breaks.

Use Vercel or Netlify unless you specifically need Pages.

---

## 7. Post-deploy checklist

Walk through this once on the live URL before you demo it:

- [ ] Home page loads and the favicon appears in the browser tab
- [ ] **Start Game Quest** → breathing → Level 1 → Level 2 → Level 3 → result
- [ ] Refresh the page *during* Level 2 — it should reload, not 404
- [ ] Open `/mindquest/level1` directly in a fresh tab
- [ ] Open a nonsense URL like `/xyz` — you should get the styled 404 screen
- [ ] **Measure Manually** → answer all 16 → report renders
- [ ] Manual assessment: answer everything "Not at all" **except question 9**, set
      that to "Nearly every day" → the report must show the red *"Please reach out
      today"* banner and **HIGH**, even though the totals are low
- [ ] Emergency screen: the `tel:` links open the dialler on a phone
- [ ] AI Buddy: **Start Talking** prompts for the mic and connects
- [ ] Try it on an actual phone, not just a narrow desktop window

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Blank white page, console shows a 404 for `/assets/index-*.js` | Wrong base path | Only set `base` in `vite.config.ts` if deploying to a subpath |
| Deep links 404, home page fine | SPA rewrite missing | Confirm `vercel.json` / `netlify.toml` is committed (§4) |
| AI Buddy: "Missing ElevenLabs agent ID" | Env var absent at build time | Add it in host settings, then **redeploy** |
| AI Buddy connects locally, fails live | Domain not allow-listed | Add your production origin to the agent (§5) |
| Mic prompt never appears | Page not on HTTPS | Use the host's HTTPS URL |
| Build fails on the host, works locally | Node version | Both configs pin Node 20 |
| Old version keeps showing | Browser cache | Hard-reload (Ctrl+Shift+R); hashed assets otherwise handle this |

---

## 9. Cost

Free, permanently, at this scale. Vercel's Hobby and Netlify's Starter tiers both
cover a static site with far more bandwidth than a college project will use. There
is no database and no server, so there is nothing that can run up a bill. The only
paid component is ElevenLabs, which has its own free monthly conversation quota —
if the AI Buddy quota runs out, that screen shows an error while the rest of the
app keeps working.
