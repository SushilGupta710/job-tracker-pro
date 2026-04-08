# 🚀 ApplyFlow: Job Tracker Pro

A complete job application tracker with a modern Angular dashboard, secure Supabase-backed API, and a Chrome extension for saving jobs directly from job listing websites.

---

## 🌟 Project Summary

**ApplyFlow: Job Tracker Pro** is a full-stack monorepo built to help job seekers: 

- track applications,
- manage hiring stages,
- save jobs from anywhere on the web,
- and analyze progress with a clean, responsive dashboard.

This repository includes:

- **Phase 1:** Angular app + Node.js backend + Supabase integration
- **Phase 2:** Chrome extension for auto-detecting and saving job listings

---

## 📌 What’s Included

### Phase 1 — Job Tracker Web App

- Angular frontend (`job-tracker-app`)
- Dashboard with job pipeline and charts
- Secure sign-in, registration, and auth flows
- Profile and job management pages
- Supabase-backed backend API for job CRUD operations

### Phase 2 — Chrome Extension

- Browser extension (`job-tracker-extension`)
- Floating save button on job listing pages
- Auto-filled job details for company, title, location, salary, and description
- Login flow inside extension
- Saves jobs directly to the backend with `source_id: 2`
- Shadow DOM + inline styles for zero CSS conflict

---

## 🏗️ Tech Stack

- **Frontend:** Angular, Tailwind CSS, RxJS
- **Backend:** Node.js, Express.js
- **Database/Auth:** Supabase (PostgreSQL)
- **Chrome Extension:** Manifest V3, Content Scripts, Background Service Worker

---

## 📁 Repository Structure

```text
job-tracker-pro/
├── job-tracker-app/          # Angular frontend application
├── job-tracker-backend/      # Node.js + Express backend server
├── job-tracker-extension/    # Chrome extension for saving jobs
├── README.md                 # This combined documentation file
├── PHASE2_SUMMARY.md         # Phase 2 notes and summary
└── package-lock.json?        # dependency locks (if present)
```

---

## 🚀 Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/job-tracker-pro.git
cd job-tracker-pro
```

### 2. Backend setup

```bash
cd job-tracker-backend
npm install
```

Create a `.env` file in the `job-tracker-backend` folder with:

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the backend:

```bash
node server.js
```

### 3. Frontend setup

Open another terminal:

```bash
cd job-tracker-app
npm install
ng serve
```

Visit the frontend at:

```text
http://localhost:4200
```

### 4. Load the Chrome Extension

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `job-tracker-extension` folder
5. Make sure the extension is enabled

---

## 🔧 API Endpoints

The backend exposes the following primary endpoints:

- `POST /api/auth/signin` — login and receive an auth token
- `POST /api/auth/signup` — create a new user
- `GET /api/jobs` — retrieve user jobs
- `POST /api/jobs/create` — create a new job entry
- `PUT /api/jobs/update/:jobId` — update job details
- `DELETE /api/jobs/:jobId` — delete a job
- `PATCH /api/jobs/status/:jobId` — update job status
- `GET /api/jobs/statuses` — list available statuses
- `GET /api/jobs/timeline/:jobId` — get job history
- `GET /api/jobs/search` — search jobs
- `GET /api/jobs/export` — export saved jobs
- `POST /api/jobs/bulk-import` — bulk import job data

> The Chrome extension uses `POST /api/jobs/create` with `source_id: 2` to mark jobs saved from the browser.

---

## ✨ Key Features

### Web App Features

- Secure authentication with Supabase
- Responsive Angular dashboard
- Job tracking across stages
- Job detail and profile management
- Real-time stats and charts
- Clean Tailwind UI

### Chrome Extension Features

- Floating Save Job button on job pages
- Auto-detects job site or job-related page
- Auto-fills job title, company, location, salary, and description when available
- Save job directly to dashboard from browser
- Secure extension login stored in `chrome.storage.local`
- Zero CSS conflict with Shadow DOM and inline styles
- Supports LinkedIn, Indeed, Lever, Greenhouse, Glassdoor, Monster, Dice, and more

---

## 🧪 Troubleshooting

### Extension not showing?
- Reload the extension from `chrome://extensions/`
- Confirm `job-tracker-extension` is loaded unpacked
- Check if the page is a supported job site or contains job keywords

### Login issues?
- Verify backend is running on `http://localhost:3000`
- Confirm credentials are correct
- Check the browser console for API errors

### Job save appears successful but is missing?
- Ensure `POST /api/jobs/create` is returning a success response
- Verify the backend is mapping `source_id` correctly
- Confirm the job appears in the dashboard after refresh

---

## 📌 Notes

- The web app and extension use separate login flows: the extension authenticates through the same backend but stores tokens locally in Chrome.
- The Chrome extension is designed to work with modern job listing sites and to minimize interference with page content.
- Job data is saved with `source_id: 2` so extension-saved jobs are distinguishable in the dashboard.

---

## 📚 Resources

- Frontend app: `job-tracker-app`
- Backend server: `job-tracker-backend`
- Browser extension: `job-tracker-extension`

---

## 📝 License

This project is created for portfolio and learning purposes. You are welcome to explore and use it as a reference.

---

**Version:** 1.0
**Last Updated:** April 2026

Made with ❤️ for job seekers.

---

## ✨ Key Features

### Web App Features

- Secure authentication with Supabase
- Responsive Angular dashboard
- Job tracking across stages
- Job detail and profile management
- Real-time stats and charts
- Clean Tailwind UI

### Chrome Extension Features

- Floating Save Job button on job pages
- Auto-detects job site or job-related page
- Auto-fills job title, company, location, salary, and description when available
- Save job directly to dashboard from browser
- Secure extension login stored in `chrome.storage.local`
- 