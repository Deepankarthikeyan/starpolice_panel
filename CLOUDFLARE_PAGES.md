# Free hosting with Cloudflare Pages

Netlify **free** tier can pause **new production deploys** when build credits run out (your site stays online on the old build). Use **Cloudflare Pages** (free) to deploy the latest frontend.

## One-time setup (~5 minutes)

1. Open **https://dash.cloudflare.com** → sign up / log in (free)
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Connect **GitHub** → select repo **`Deepankarthikeyan/starpolice_panel`**
4. **Production branch:** `master`
5. **Build settings:**

| Setting | Value |
|---------|--------|
| Framework preset | None |
| Root directory | `package` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |

6. Click **Save and deploy**
7. When finished, you get a URL like: **`https://starpolice-panel.pages.dev`**

## After first deploy

1. **Render** → `starpolice-api` → **Environment** → set:
   - `CLIENT_URL` = your Cloudflare Pages URL (e.g. `https://starpolice-panel.pages.dev`)
2. **Manual Deploy** on Render (or wait for auto-deploy)
3. Open your new site → **Admin login** → test forgot password / user invite email

## Custom domain (optional, free)

Cloudflare Pages → your project → **Custom domains** → add your domain.

## Netlify

Your old site **https://starpolice-panel.netlify.app** may stay on an old build until Netlify credits reset or you upgrade. You can keep both URLs; use Cloudflare Pages for the latest code.

## API

Frontend calls `/api` — proxied to **https://starpolice-api.onrender.com** via `package/public/_redirects` (works on Cloudflare Pages and Netlify).
