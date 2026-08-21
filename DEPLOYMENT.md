# Free Hosting Guide

Deploy the **Star Police Academy** panel for free using:

| Part | Service | Free tier |
|------|---------|-----------|
| Frontend (React) | [Netlify](https://www.netlify.com/) | 100 GB bandwidth/month |
| Backend (Node API) | [Render](https://render.com/) | 750 hours/month (spins down after inactivity) |
| Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | 512 MB storage |

---

## 1. MongoDB Atlas (database)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **free M0 cluster**.
3. Under **Database Access**, add a database user with a password.
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render can connect.
5. Click **Connect** → **Drivers** and copy the connection string, e.g.  
   `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/starpolice_academy`

---

## 2. Backend on Render

### Option A — Blueprint (recommended)

1. Push this repo to GitHub.
2. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
3. Click **New Blueprint Instance** and connect your repo.
4. Render reads `render.yaml` and creates the `starpolice-api` service.
5. Set these environment variables when prompted:
   - `MONGODB_URI` — optional Atlas connection string (embedded MongoDB is used if unset)
   - `CLIENT_URL` — your Netlify URL (set after step 3), e.g. `https://your-app.netlify.app`
6. After deploy, note the API URL, e.g. `https://starpolice-api.onrender.com`.

### Option B — Manual web service

1. [dashboard.render.com](https://dashboard.render.com/) → **New** → **Web Service**.
2. Connect the GitHub repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Environment variables:

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Optional Atlas URI; embedded MongoDB is used if unset |
   | `JWT_SECRET` | Long random string |
   | `CLIENT_URL` | Your Netlify frontend URL |

### Seed default users

After the API is live, open the Render **Shell** (or run locally against Atlas) and run:

```bash
cd server
npm run seed
```

Default logins:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@starpolice.academy | superadmin123 |
| Staff | staff@starpolice.academy | staff123 |
| Student | student@starpolice.academy | student123 |

> **Note:** Render’s free tier uses ephemeral disk. Uploaded files are lost on redeploy. For persistent uploads, use S3/Cloudinary later.

---

## 3. Frontend on Netlify

1. Go to [app.netlify.com](https://app.netlify.com/) → **Add new site** → **Import an existing project**.
2. Connect your GitHub repo.
3. Netlify reads `netlify.toml` automatically:
   - Base directory: `package`
   - Build: `npm ci && npm run build`
   - Publish: `dist`
4. Under **Site configuration → Environment variables**, add:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your Render API URL, e.g. `https://starpolice-api.onrender.com` |

5. Deploy. Your site will be at `https://<name>.netlify.app`.

6. Go back to Render and set `CLIENT_URL` to your Netlify URL, then redeploy the API.

---

## 4. Verify

1. Open `https://your-api.onrender.com/api/health` — should return `{"status":"ok","database":"mongodb"}`.
2. Open your Netlify URL → `/admin/login` or `/student/login`.
3. Log in with the seeded credentials.

---

## Local development

```bash
# Terminal 1 — API
cd server
cp .env.example .env
npm install
npm run seed
npm run dev

# Terminal 2 — Frontend
cd package
npm install
npm run dev
```

Local dev does not need `VITE_API_URL`; Vite proxies `/api` and `/uploads` to `localhost:5000`.

---

## Alternatives

- **Frontend:** [Vercel](https://vercel.com/) or [Cloudflare Pages](https://pages.cloudflare.com/) — same build settings as Netlify (`package` folder, `npm run build`, output `dist`).
- **Backend:** [Railway](https://railway.app/) or [Fly.io](https://fly.io/) — use the same `server` folder and env vars.
