cd # ProcureTrack - Startup & Usage Guide

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

## 🆘 Troubleshooting
*   **Login Failed?**: Make sure you ran the seed script (`npx ts-node src/seed.ts`).
*   **Backend Error?**: Check if MongoDB is running.
*   **File Uploads not working?**: Ensure the `backend/uploads` folder exists (it should be auto-created).

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

