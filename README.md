# Quiz Project (Frontend + Backend) with Registration (Option B)

This package contains:
- Frontend: `index.html`, `register.html`, `quiz.html`, `admin.html`, `quiz.css`, `quiz.js`
- Backend: Node.js + Express + SQLite (server.js, init_db.js)
- `package.json` with dependencies

## Run locally (recommended)
1. Install Node.js (v14+)
2. In project folder, run:
   ```
   cd backend
   npm install
   node init_db.js
   node server.js
   ```
3. Open `http://localhost:3000/frontend/index.html` in your browser.

## Registering students
- Visit `/frontend/register.html` to create a new student account (Name + Email + Username + Password).
- Only registered students can login.

Default admin:
- Admin: username `admin`, password `admin123`

## Deploying
- For static-only deployment (no backend), deploy frontend files to Vercel/Netlify.
- For full backend, deploy backend to a Node-capable host (Render, Heroku, Railway). Use a proper DB for production.

## Notes
- Change `SECRET` in `server.js` before production.
- SQLite is file-based (quiz.db). Ensure write permissions if deploying.
