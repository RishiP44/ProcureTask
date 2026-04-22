# 🌌 ProcureTask — Enterprise Workforce Automation

ProcureTask is a premium, state-of-the-art workflow automation platform designed to streamline onboarding, personnel management, and organizational streams with a focus on speed, clarity, and "Deep Space" aesthetics.

---

## 🚀 Quick Start (Monorepo)

The project is structured as an NPM workspace monorepo. You can manage all components from the root directory.

### 1. Prerequisite Setup
- **Node.js**: v18+ recommended.
- **MongoDB**: Ensure a local instance is running on `27017` or update the `.env` in `backend/`.

### 2. Installations
Run this at the **root** folder:
```bash
npm install
```

### 3. Database Seeding
Initialize the registry with Admin and Employee credentials:
```bash
cd backend
npx ts-node src/seed.ts
cd ..
```

---

## ▶️ Running the Platform

You need **two** terminal sessions running simultaneously:

### Terminal 1: Core Engine (Backend)
```bash
cd backend
npm run dev
```
*Server: http://localhost:5000*

### Terminal 2: Visual Hub (Frontend)
```bash
npm run web
```
*Standard Port: http://localhost:5173 (The system may shift to 5174+ if occupied)*

---

## 📖 Access Credentials (Demo)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `password123` |
| **Employee** | `employee@example.com` | `password123` |

---

## ✨ Phase 1.5 Highlights: "Deep Space" Overhaul
The platform recently underwent a massive structural and visual transformation:

- **Premium Glassmorphism**: High-impact UI using the `pt-glass-card` system.
- **Motion Engine**: Ultra-smooth interactions powered by `framer-motion`.
- **Skeleton Architecture**: Zero-flash loading states for a seamless data experience.
- **Technical Excellence**: 100% Type-safe codebase with a verified production build.

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (Vanilla), Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.
- **Shared**: Modular @procuretrack/shared package for cross-app data logic.

---

## 🆘 Troubleshooting
- **White Screen**: Ensure you are accessing the correct port (check terminal output for `5173`, `5174`, or `5175`).
- **500 Error**: Verify the backend is running and MongoDB connection is established.
- **Missing Data**: Re-run the seed script in the `backend` directory.

---
