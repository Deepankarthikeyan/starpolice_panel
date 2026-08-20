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

> **Note:** The API no longer runs seed automatically on every deploy (that caused Render health-check timeouts). To seed on boot once, set Render env `SEED_ON_START=true`, deploy, then remove it.

---

## Permanent production setup (fixes 502/503 forever)

The API **must** use **MongoDB Atlas** on Render. Embedded MongoDB inside the container was the main cause of lost accounts, failed signups, and 503 errors after redeploys.

### One-time setup (~5 minutes)

#### 1. Create MongoDB Atlas (free)

1. Sign up at https://www.mongodb.com/cloud/atlas/register  
2. Create a **free M0** cluster (any cloud region close to you)  
3. **Database Access** → Add user (username + password, remember these)  
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)  
5. **Database** → **Connect** → **Drivers** → copy the connection string, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/starpolice_academy?retryWrites=true&w=majority`  
6. Replace `USER`, `PASSWORD`, and set the database name to `starpolice_academy`

#### 2. Add Atlas URI to Render

1. Open [Render → starpolice-api → Environment](https://dashboard.render.com/)  
2. Add or update:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string from step 1 |
| `CLIENT_URL` | `https://starpolice-panel.netlify.app` |

3. **Save** → **Manual Deploy → Deploy latest commit**

#### 3. Verify

Open: `https://starpolice-api.onrender.com/api/health`

You should see:

```json
{"status":"ok","database":"mongodb", ...}
```

If you see `"setupRequired"` or `"database":"missing"`, `MONGODB_URI` is not set correctly on Render.

#### 4. Create Super Admin

1. Open https://starpolice-panel.netlify.app/admin/signup  
2. Create your Super Admin account (only works when `/api/health` shows `"database":"mongodb"`)

If signup shows **“Signup Closed”** because a test `@example.com` super admin exists, deploy the latest API commit on Render (see below). The signup page clears test-only accounts automatically once the new API is live.

### Render stuck on an old build

If `https://starpolice-api.onrender.com/api/health` shows an old `"build"` hash after you push to `master`:

1. Open **Render → starpolice-api → Events** and check for failed deploys  
2. **Manual Deploy → Deploy latest commit** (or connect the service to GitHub with auto-deploy)  
3. Confirm `/api/health` `"build"` matches your latest Git commit (first 7 characters)  
4. Open `/admin/signup` again — test `@example.com` super admins are removed automatically

Optional: add the same `MONGODB_URI` as a GitHub secret and run the **Cleanup test superadmin (production)** workflow to delete test accounts without opening Atlas.

### Keep Render awake (free tier)

Render free tier sleeps after ~15 minutes without traffic. This repo includes a GitHub Action (**Keep Render API awake**) that pings `/api/health` every 14 minutes automatically — no extra setup needed once Actions are enabled.

Optional: upgrade Render to a paid plan to avoid sleep entirely.

---

## Interaction page: "API endpoint not found"

If **Interaction** shows *API endpoint not found. The server may need to be updated*, the live Render API is behind the latest code and is missing `/api/messages/contacts`.

**Fix (one time):**

1. Open [Render Dashboard → starpolice-api](https://dashboard.render.com/)
2. Click **Manual Deploy** → **Deploy latest commit** (branch: `master`)
3. Wait until deploy finishes, then verify:  
   `https://starpolice-api.onrender.com/api/health`  
   should include `"messageContacts": true`
4. Hard-refresh the Netlify site and open Interaction again

**Auto-deploy (recommended):** In Render → **Settings** → **Deploy Hook**, copy the hook URL and add it to GitHub → **Secrets** → `RENDER_DEPLOY_HOOK`. Pushes to `master` that change `server/` will then redeploy the API automatically.
