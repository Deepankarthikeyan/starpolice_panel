# Hosting

## Live site

| | URL |
|---|---|
| **Website** | https://starpolice-panel.netlify.app |
| **Admin login** | https://starpolice-panel.netlify.app/admin/login |
| **Student login** | https://starpolice-panel.netlify.app/student/login |

**Logins** (after running `npm run seed` on the API):

| Panel | Email | Password |
|-------|-------|----------|
| Admin | `superadmin@starpolice.academy` | `superadmin123` |
| Student | `student@starpolice.academy` | `student123` |

> If student login says **Invalid credentials**, the student account may not exist yet. Log in as super admin, create the student in **User Management**, and activate access. After deploying the latest API, `npm run seed` also creates the demo student automatically.

Netlify dashboard: https://app.netlify.com/projects/starpolice-panel

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
