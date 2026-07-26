# Live Hosting

**Target domain:** https://starpoliceacademy-panel.in  
Full setup guide: **`DOMAIN_SETUP.md`**

## Currently live (Cloudflare tunnels — temporary)

| Service | URL |
|---------|-----|
| **Website** | https://marcus-banana-dinner-almost.trycloudflare.com |
| **API** | https://appeared-tariff-glory-flush.trycloudflare.com |

**Login:** https://marcus-banana-dinner-almost.trycloudflare.com/admin/login

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@starpolice.academy | superadmin123 |

> These tunnel URLs stay live while the cloud agent / server is running. For permanent 24/7 hosting, use Netlify + Render + MongoDB Atlas (see `DEPLOYMENT.md`).

---

## Permanent free hosting (one-time setup)

Add these **GitHub repository secrets** (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `NETLIFY_AUTH_TOKEN` | From [Netlify user settings](https://app.netlify.com/user/applications) |
| `NETLIFY_SITE_ID` | From your Netlify site → Site configuration → General |
| `VITE_API_URL` | `https://api.starpoliceacademy-panel.in` |

Then push to `master` — GitHub Actions deploys the frontend automatically.

For the API and database, deploy the `render.yaml` blueprint on [Render](https://dashboard.render.com/blueprints) and set `MONGODB_URI` (MongoDB Atlas free cluster).

---

## Quick local live demo

```bash
chmod +x scripts/deploy-live.sh
./scripts/deploy-live.sh
```
