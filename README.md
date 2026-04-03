# 🚀 ApplyFlow: Job Tracker Pro

A professional full-stack job application tracker built with the **MEAN stack** and **Supabase**. It helps users manage their job search, organize applications, track progress across hiring stages, and authenticate securely.

---

## 📌 Overview

ApplyFlow: Job Tracker Pro is a monorepo project with:

- **Frontend:** Angular application with Tailwind CSS
- **Backend:** Node.js and Express server
- **Database/Auth:** Supabase

The platform is designed for job seekers who want a clean dashboard to manage applications, monitor status updates, and handle authentication workflows securely.

---

## 📂 Project Structure

```text
job-tracker-pro/
├── client/          # Angular frontend
├── server/          # Node.js + Express backend
├── .gitignore       # Global ignore rules
└── README.md        # Project documentation
```

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/job-tracker-pro.git
cd job-tracker-pro
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the backend server:

```bash
node server.js
```

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
ng serve
```

Visit the app at:

```text
http://localhost:4200
```

---

## ✨ Features

- Secure authentication with Google OAuth, email/password login, and OTP-based authentication
- Password recovery flow with reset links handled through Supabase
- Responsive dashboard UI built with Tailwind CSS
- Angular service-based state management using RxJS
- Node.js backend bridge for secure interaction with Supabase

---

## 🏗️ Tech Stack

- **Frontend:** Angular, RxJS, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database/Auth:** Supabase (PostgreSQL)
- **Version Control:** Git, GitHub

---

## 🚀 Running the Project

To run the full project locally:

1. Start the backend from the `server/` folder
2. Start the frontend from the `client/` folder
3. Open `http://localhost:4200` in your browser

---

## 📝 License

This project is created for portfolio and learning purposes. You are welcome to explore and use it as a reference.
