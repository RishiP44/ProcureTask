# ProcureTrack - Startup & Usage Guide

## 👋 Welcome to ProcureTrack
ProcureTrack is an MVP workflow automation tool designed for Onboarding, Vendor Procurement, and Process Management.

---

## 🛠️ Prerequisites
Before starting, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (Version 16 or higher)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Make sure it's running locally on port 27017) or a cloud MongoDB URI.

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ProcureTask
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
Open a second terminal:
```bash
cd frontend
npm install
```

> **💡 Monorepo Shortcut:** You can install all workspaces (frontend, mobile, shared) at once from the root:
> ```bash
> npm install
> ```
> This uses NPM Workspaces to install all packages in a single step.

---

## ⚙️ Configuration & Database Setup

### 1. Environment Variables
Ensure you have a `.env` file in the `backend/` folder with the following:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/procuretrack
JWT_SECRET=your_jwt_secret_key_here
```

### 2. Seed the Database (Important!)
You need to create the initial Admin and Employee users. Run this command in the `backend/` terminal:
```bash
npx ts-node src/seed.ts
```
*   **Result**: This will create an Admin user (`admin@example.com`) and an Employee user (`employee@example.com`).
*   **Already seeded?** Re-running the script is safe — it will reset the Admin password to `password123` and skip creating duplicate users.

---

## ▶️ How to Run
You need to run the Backend and Frontend in separate terminals.

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
*Server runs on: http://localhost:5000*

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
*App runs on: http://localhost:5173* (Open this link in your browser)

> **💡 Monorepo Shortcut:** You can also start the frontend from the **root** directory:
> ```bash
> npm run web
> ```

> **⚠️ Port Note:** If port 5173 is in use, Vite will automatically move to 5174, then 5175. Check your terminal output for the exact URL.

---

## 📖 User Guide

### 1. Admin Features (Login as Admin)
*   **Credentials**: `admin@example.com` / `password123`
*   **Create Workflows**: Go to **Workflows > Create**. Define steps (checkboxes or document uploads).
*   **Assign Workflows**: Go to **Assign**. Select a user (Employee) and a Workflow to assign it.
*   **Document Repository**: Go to **Documents** to view all files uploaded by employees.

### 2. Employee Features (Login as Employee)
*   **Credentials**: `employee@example.com` / `password123`
*   **Dashboard**: View assignments assigned to you.
*   **Complete Tasks**: Click "View Tasks" on an assignment. Upload required documents or check boxes to complete steps.

---

## ✨ Feature Reference

### Admin / HR Features
| Feature | How to Access |
|---|---|
| **Performance Dashboard** | Sidebar → Dashboard — KPI cards, live pie chart, activity feed |
| **Workflow Builder** | Sidebar → Workflows → Create New Workflow |
| **Assign Workflow** | Sidebar → Assign (or "Initiate Flow" button on Dashboard) |
| **Staff Directory** | Sidebar → Employees |
| **Employee Profile** | Employees → click any employee row |
| **Offer Letters** | Sidebar → Offer Letters — generate & track employment proposals |
| **Document Repository** | Sidebar → Documents |
| **Notifications** | Bell icon in the top navigation bar |
| **Profile Settings** | User avatar (top right) → Profile |

### Employee Features
| Feature | How to Access |
|---|---|
| **My Tasks** | Sidebar → My Tasks — view all assigned workflows with filter & search |
| **Task Completion** | My Tasks → click an assignment → mark tasks done or upload documents |
| **Assignment Detail** | Click any assignment row to see step-by-step task progress |
| **Profile** | User avatar (top right) → Profile |

### Offer Letter Flow
1.  Admin goes to **Offer Letters** → clicks **Generate Offer**
2.  Fills in candidate name, email, role, department, start date, and salary
3.  Clicks **Initiate Delivery** — the offer is recorded in the system
4.  The candidate receives a unique tokenized link (e.g. `/offer-letter/<token>`)
5.  Clicking the link opens a **public acceptance page** — no login required
6.  Candidate accepts or declines; status updates in real time on the Admin dashboard

### Task Types
| Type | How it Works |
|---|---|
| **Checkbox** | Employee clicks "Mark Done" to complete |
| **Document Upload** | Employee uploads a file (PDF, PNG, JPG, DOC) — stored securely on the server |

---

## 📱 Mobile App (React Native)

The project includes a companion React Native mobile app for employees to check and complete tasks on the go. It uses the same backend API as the web app.

### Prerequisites for Mobile
*   [Expo CLI](https://docs.expo.dev/get-started/installation/)
*   Android Studio (for Android emulator) or Xcode (for iOS simulator)
*   Or the **Expo Go** app on a physical device

### Running the Mobile App
```bash
# Start the Expo dev server (from root)
npm run mobile

# Or for specific platforms:
npm run android
npm run ios
```

> **Note:** The mobile app connects to the backend at `http://localhost:5000`. If running on a physical device, replace `localhost` with your machine's local IP address in the mobile API service config.

---

## 🆘 Troubleshooting
*   **Login Failed?**: Make sure you ran the seed script (`npx ts-node src/seed.ts`).
*   **Backend Error?**: Check if MongoDB is running.
*   **File Uploads not working?**: Ensure the `backend/uploads` folder exists (it should be auto-created).
*   **White screen / blank page?**: Check your terminal for the correct Vite port — it may have shifted to 5174 or 5175.
*   **`Cannot find module '@procuretrack/shared'`**: Run `npm install` from the **root** directory to link workspace packages.
*   **Seed script fails?**: Confirm your `backend/.env` file exists with a valid `MONGO_URI` and that MongoDB is running on port 27017.
*   **500 errors from backend?**: Restart the backend server (`cd backend && npm run dev`) and verify MongoDB is connected (look for `✅ MongoDB Connected` in terminal output).
*   **Offer letter page shows "Invalid token"**: The token may have expired or the offer was deleted. Re-generate from Admin → Offer Letters.

---

## 🌳 Git Workflow & Rules (TEAM READ THIS)
To prevent breaking the `main` branch, please follow these rules:

### 1. Branching
**NEVER push directly to `main`.** Always work on a new branch.
```bash
# Good: Create a feature branch
git checkout -b feature/add-new-button
```

### 2. Pulling Code
Before starting work, always pull the latest changes to avoid conflicts.
```bash
git checkout main
git pull origin main
```

### 3. Committing
Write clear commit messages.
```bash
git add .
git commit -m "Added submit button to login page"
```

### 4. Merging
When your feature is done:
1.  Push your branch: `git push origin feature/add-new-button`
2.  Go to GitHub and create a **Pull Request (PR)**.
3.  Ask a teammate to review the code.
4.  Merge into `main` only after approval.
