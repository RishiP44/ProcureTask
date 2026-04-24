# ProcureTask — Setup & Run Guide

ProcureTask is a workflow automation platform for onboarding, vendor procurement, and process management. It includes a **web app** (React + Vite frontend + Node.js backend) and a **mobile app** (React Native via Expo).

---

## What You Need Before Starting

Install these on your machine before anything else:

| Tool | Version | Download |
|:---|:---|:---|
| **Node.js** | v18 or higher | https://nodejs.org |
| **MongoDB Community Server** | Any recent version | https://www.mongodb.com/try/download/community |
| **Expo Go** (mobile only) | Latest | App Store / Google Play |

> **MongoDB must be running** before you start the backend. After installing, MongoDB runs automatically as a background service on most systems. If not, start it manually with `mongod`.

---

## Step 1 — Extract the ZIP

1. Right-click the ZIP file → **Extract All** (Windows) or double-click (Mac)
2. Open the extracted folder — it should be named `ProcureTask`
3. Open the folder in your IDE (e.g. VS Code: **File → Open Folder → select ProcureTask**)

---

## Step 2 — Open a Terminal in the Project Root

In VS Code: press **Ctrl + `** (backtick) to open the integrated terminal.
Make sure the terminal path ends with `\ProcureTask` — that is the project root.

---

## Step 3 — Install All Dependencies

Run this **once** from the project root. It installs frontend, backend, and shared packages all at once:

```bash
npm install
```

---

## Step 4 — Set Up the Environment File

```bash
cd backend
copy .env.example .env
cd ..
```

> **Mac/Linux:** use `cp .env.example .env` instead of `copy`.

The default `.env` values work out of the box for a local MongoDB setup. No changes needed.

The `.env` file contains:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/procuretrack
JWT_SECRET=your_jwt_secret_key_here
```

---

## Step 5 — Seed the Database

This creates the default Admin and Employee accounts:

```bash
cd backend
npx ts-node src/seed.ts
cd ..
```

Expected output:
```
✅ Admin user created/updated
✅ Employee user created
✅ Database seeding complete
```

> Already seeded? Re-running is safe — it will reset the admin password and skip duplicates.

---

## Step 6 — Start the Backend

Open a new terminal tab (**Terminal 1**) and run:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

Backend is now running at **http://localhost:5000**

---

## Step 7 — Start the Frontend

Open another new terminal tab (**Terminal 2**) in the project root and run:

```bash
npm run web
```

Frontend is now running at **http://localhost:5173**

> If port 5173 is busy, Vite will automatically move to 5174 or 5175 — check your terminal output for the exact URL.

---

## Step 8 — Open the App & Log In

Open your browser and go to: **http://localhost:5173**

Use these credentials to log in:

| Role | Email | Password |
|:---|:---|:---|
| **Admin** | `admin@example.com` | `password123` |
| **Employee** | `employee@example.com` | `password123` |

---

## Step 9 — Start the Mobile App *(Expo Go required)*

Open a third terminal tab (**Terminal 3**):

```bash
cd mobile
npm run mobile
```

A QR code will appear in the terminal. Open the **Expo Go** app on your phone, scan the QR code, and the app will load.

> Make sure your phone and computer are on the **same Wi-Fi network**.

---

## What You Can Do in the App

### As Admin (`admin@example.com`)

| Feature | How to Access |
|:---|:---|
| Performance Dashboard | Sidebar → Dashboard |
| Create Workflows | Sidebar → Workflows → Create New Workflow |
| Assign Workflow to Employee | Sidebar → Assign |
| Staff Directory | Sidebar → Employees |
| Offer Letters | Sidebar → Offer Letters |
| Document Repository | Sidebar → Documents |
| Notifications | Bell icon in the top nav bar |

#### Offer Letter Flow
1. Go to **Offer Letters** → click **Generate Offer**
2. Fill in candidate name, email, role, department, start date, salary
3. Click **Initiate Delivery** — a unique link is generated
4. Share the link with the candidate (e.g. `/offer-letter/<token>`)
5. Candidate opens the link — **no login required** — and accepts or declines
6. Status updates in real time on the Admin dashboard

### As Employee (`employee@example.com`)

| Feature | How to Access |
|:---|:---|
| My Tasks | Sidebar → My Tasks |
| Complete a Task | My Tasks → click assignment → mark done or upload file |
| Assignment Detail | Click any assignment row |
| Profile | User avatar (top right) → Profile |

### Task Types

| Type | How it Works |
|:---|:---|
| **Checkbox** | Click "Mark Done" to complete |
| **Document Upload** | Upload a PDF, PNG, JPG, or DOC file |

---

## Database & External Services

- **Database:** MongoDB (local) — no cloud account needed
- **Port:** `27017` (MongoDB default)
- **Setup:** Fully automated by the seed script in Step 5
- **File Uploads:** Stored locally in `backend/uploads/` — auto-created on first upload
- **External APIs:** None required — everything runs locally

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT |
| **Mobile** | React Native (Expo) |
| **Shared** | `@procuretrack/shared` NPM workspace package |

---

## Troubleshooting

| Problem | Fix |
|:---|:---|
| Login fails / no data | Re-run the seed script: `cd backend && npx ts-node src/seed.ts` |
| Backend won't start | Check that MongoDB is running on port 27017 |
| White screen or wrong port | Check terminal — Vite may be on 5174 or 5175 |
| `Cannot find module '@procuretrack/shared'` | Run `npm install` from the **project root** |
| File uploads not working | The `backend/uploads/` folder will be auto-created — check backend is running |
| Offer letter says "Invalid token" | Offer was deleted or expired — re-generate from Admin → Offer Letters |
| Mobile app can't connect | Ensure phone and computer are on the same Wi-Fi; check backend is running |
