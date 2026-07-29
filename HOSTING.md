# Hosting

## Live site (Netlify)

| | URL |
|---|---|
| **Website** | https://starpolice-panel.netlify.app |
| **Admin login** | https://starpolice-panel.netlify.app/admin/login |
| **Staff login** | https://starpolice-panel.netlify.app/staff/login |
| **Student login** | https://starpolice-panel.netlify.app/student/login |

## Cloudflare quick tunnel links

Use these when running the app through a Cloudflare tunnel (temporary URL — changes each time you restart the tunnel).

| Panel | Path | Example |
|-------|------|---------|
| **Admin** | `/admin/login` | `https://<your-tunnel>.trycloudflare.com/admin/login` |
| **Staff** | `/staff/login` | `https://<your-tunnel>.trycloudflare.com/staff/login` |
| **Student** | `/student/login` | `https://<your-tunnel>.trycloudflare.com/student/login` |

> **Note:** Staff and admin use the same backend panel after login. Staff sign in at `/staff/login` with an admin account; super admin uses `/admin/login`.

### Start a Cloudflare tunnel (local)

From the project root:

```bash
bash scripts/deploy-live.sh
```

The script prints the live **Website** and **API** Cloudflare URLs. Then open:

- Admin: `<website-url>/admin/login`
- Staff: `<website-url>/staff/login`
- Student: `<website-url>/student/login`

**API (Render — permanent):** https://starpolice-api.onrender.com

**Logins** (after running `npm run seed` on the API):

| Panel | Email | Password |
|-------|-------|----------|
| Admin / Super Admin | `superadmin@starpolice.academy` | `superadmin123` |
| Staff (admin role) | `staff@starpolice.academy` | `staff123` |
| Student | `student@starpolice.academy` | `student123` |

> If student login says **Invalid credentials**, the student account may not exist yet. Log in as super admin, create the student in **User Management**, and activate access. After deploying the latest API, `npm run seed` also creates the demo student automatically.

Netlify dashboard: https://app.netlify.com/projects/starpolice-panel

---

## Auto-deploy from GitHub (recommended)

Every push to `master` deploys automatically via GitHub Actions once you add **one** secret:

1. Create a Netlify personal access token:  
   https://app.netlify.com/user/applications#personal-access-tokens
2. In GitHub → **Settings** → **Secrets and variables** → **Actions**, add:
   - Name: `NETLIFY_AUTH_TOKEN`
   - Value: your Netlify token
3. Push to `master` (or run **Deploy frontend to Netlify** workflow manually).

Manual CLI deploy (same site):

```bash
export NETLIFY_AUTH_TOKEN="your-token"
bash scripts/deploy-to-netlify.sh
```

Optional: link the repo in Netlify (**Project configuration** → **Build & deploy** → **Link repository**) to enable **Trigger deploy** in the Netlify UI. GitHub Actions deploy works without linking.

---

## Deploy frontend to Netlify (one click)

**Click here to deploy:**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Deepankarthikeyan/starpolice_panel)

Or open this link directly:

**https://app.netlify.com/start/deploy?repository=https://github.com/Deepankarthikeyan/starpolice_panel**

After deploy, your site will be at:

`https://<random-name>.netlify.app`

You can change the site name in Netlify → **Site configuration** → **Domain management** → **Options** → **Edit site name** (e.g. `starpolice-panel.netlify.app`).

---

## Connect the API (required for login)

The frontend needs a backend. Deploy the API on Render:

**https://dashboard.render.com/deploy?repo=https://github.com/Deepankarthikeyan/starpolice_panel**

Then in **Netlify → Environment variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render API URL, e.g. `https://starpolice-api.onrender.com` |

Redeploy the Netlify site after adding the variable.

In **Render**, set `CLIENT_URL` to your Netlify URL (e.g. `https://starpolice-panel.netlify.app`).

Run `npm run seed` in Render Shell, then log in at `/admin/login` or `/student/login` with the credentials above.
