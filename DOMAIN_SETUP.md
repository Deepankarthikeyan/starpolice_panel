# Custom domain: starpoliceacademy-panel.in

Your panel will be available at:

| Service | URL |
|---------|-----|
| **Website** | https://starpoliceacademy-panel.in |
| **WWW** | https://www.starpoliceacademy-panel.in |
| **API** | https://api.starpoliceacademy-panel.in |

> Domain names cannot contain underscores (`_`). Use **starpoliceacademy-panel.in** (with a hyphen).

---

## Step 1 — Buy the domain (.in)

Register **starpoliceacademy-panel.in** at any Indian registrar:

- [GoDaddy India](https://www.godaddy.com/en-in)
- [Hostinger India](https://www.hostinger.in)
- [BigRock](https://www.bigrock.in)
- [Namecheap](https://www.namecheap.com)

Cost is usually **₹500–₹900 per year** for a `.in` domain.

---

## Step 2 — Deploy frontend on Netlify

1. Go to [app.netlify.com](https://app.netlify.com/) → import your GitHub repo.
2. Netlify reads `netlify.toml` automatically (builds from `package/`).
3. Under **Domain management** → **Add a domain** → enter:
   - `starpoliceacademy-panel.in`
   - `www.starpoliceacademy-panel.in`
4. Netlify shows the DNS records you need (see Step 4).

---

## Step 3 — Deploy API on Render

1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) → connect repo.
2. Set environment variables:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `CLIENT_URL` — `https://starpoliceacademy-panel.in`
3. After deploy, go to **Settings → Custom Domains** → add:
   - `api.starpoliceacademy-panel.in`
4. Render shows a CNAME target (e.g. `starpolice-api.onrender.com`).

Run seed once in Render Shell:

```bash
npm run seed
```

---

## Step 4 — DNS records (at your domain registrar)

Add these records in your registrar’s DNS panel:

| Type | Name / Host | Value | Purpose |
|------|-------------|-------|---------|
| **A** | `@` | `75.2.60.5` | Main site → Netlify |
| **CNAME** | `www` | `starpoliceacademy-panel.netlify.app` | WWW → Netlify |
| **CNAME** | `api` | `starpolice-api.onrender.com` | API → Render |

> Netlify may show different A/CNAME values after you add the domain — **use the values Netlify gives you** for `@` and `www`. The `api` CNAME should point to your Render service hostname.

DNS can take **15 minutes to 48 hours** to propagate.

---

## Step 5 — SSL (HTTPS)

Both Netlify and Render issue **free SSL certificates** automatically once DNS is correct. No extra setup needed.

---

## Step 6 — Verify

1. https://api.starpoliceacademy-panel.in/api/health → `{"status":"ok","database":"mongodb"}`
2. https://starpoliceacademy-panel.in/admin/login → login page loads
3. Login: `superadmin@starpolice.academy` / `superadmin123`

---

## Environment variables summary

| Where | Variable | Value |
|-------|----------|-------|
| Netlify | `VITE_API_URL` | `https://api.starpoliceacademy-panel.in` |
| Render | `CLIENT_URL` | `https://starpoliceacademy-panel.in` |
| Render | `MONGODB_URI` | Your Atlas connection string |
| Render | `JWT_SECRET` | Long random string |

`netlify.toml` already sets `VITE_API_URL` for production builds.

---

## GitHub Actions (optional auto-deploy)

Add these repository secrets:

| Secret | Value |
|--------|-------|
| `NETLIFY_AUTH_TOKEN` | From Netlify → User settings → Applications |
| `NETLIFY_SITE_ID` | From Netlify site → Site configuration |
| `VITE_API_URL` | `https://api.starpoliceacademy-panel.in` |
