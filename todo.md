# ProcureTrack - Project Todo List

This document breaks down the development of the ProcureTrack MVP (Term 1) into manageable tasks based on the PRD, Design Document, and Tech Rules.

## Phase 1: Project Initialization & Infrastructure
- [ ] **Repository Setup**
    - [ ] Initialize Git repository
    - [ ] Create `.gitignore` (node_modules, .env, build/dist, uploads/, etc.)
    - [ ] Set up branch protection rules (main, dev branches)
- [ ] **Backend Setup**
    - [ ] Initialize Node.js project (`npm init`)
    - [ ] Install dependencies (Express, TypeScript, Mongoose/Prisma, etc.)
    - [ ] Configure TypeScript (`tsconfig.json`)
    - [ ] Set up ESLint and Prettier
    - [ ] Create basic server entry point (`server.ts`)
    - [ ] Configure Environment Variables (`.env`)
- [ ] **Frontend Setup**
    - [ ] Initialize React + TypeScript project (Vite)
    - [ ] Install Tailwind CSS and configure `tailwind.config.js`
    - [ ] Set up project structure (`/src/components`, `/src/pages`, `/src/services`, etc.)
    - [ ] Configure ESLint and Prettier
- [ ] **Database Setup**
    - [ ] Set up local MongoDB or PostgreSQL instance (as per choice)
    - [ ] Configure database connection in backend

## Phase 2: Authentication & User Management (RBAC)
- [ ] **Backend - Auth**
    - [ ] Design User Schema (Name, Email, PasswordHash, Role)
    - [ ] Implement Registration/Seeding (for Admin)
    - [ ] Implement Login API (JWT generation)
    - [ ] Implement Middleware: `authMiddleware` (validate JWT)
    - [ ] Implement Middleware: `roleMiddleware` (RBAC enforcement)
- [ ] **Frontend - Auth**
    - [ ] Create Login Page (Email, Password)
    - [ ] Implement Auth Context/Provider (store token)
    - [ ] Create PrivateRoute component (redirect if not logged in)
    - [ ] Handle login errors and validation

## Phase 3: Core Backend Development (Workflows & Tasks)
- [ ] **Database Modeling**
    - [ ] Define `Workflow` Schema
    - [ ] Define `Task` Schema
    - [ ] Define `Assignment` Schema (links User to Workflow)
    - [ ] Define `Document` Schema
- [ ] **Workflow APIs**
    - [ ] POST `/api/workflows` (Create workflow)
    - [ ] GET `/api/workflows` (List all workflows)
    - [ ] GET `/api/workflows/:id` (Get details)
- [ ] **Task & Assignment APIs**
    - [ ] POST `/api/assignments` (Assign workflow to user)
    - [ ] GET `/api/assignments/my-tasks` (Get tasks for logged-in user)
    - [ ] PUT `/api/tasks/:id/complete` (Mark task as done)

## Phase 4: Frontend - Admin Features
- [ ] **Layout & Navigation**
    - [ ] Create Sidebar/Navbar (Role-based links)
    - [ ] Create Dashboard Layout
- [ ] **Workflow Builder**
    - [ ] Create Workflow List View
    - [ ] Create "New Workflow" Form (Name, Description)
    - [ ] Implement Task Definition UI (Add task, Select type: Checkbox/Upload)
- [ ] **User Assignment**
    - [ ] Create "Assign Workflow" Modal/Page
    - [ ] User Selector & Workflow Selector
- [ ] **Admin Dashboard**
    - [ ] Implement Stats Cards (Active, Completed, Pending)
    - [ ] Implement Active Onboardings Table (Filter by status/role)

## Phase 5: Frontend - Employee & Vendor Features (User Portal)
- [ ] **User Dashboard**
    - [ ] Display assigned workflow progress
    - [ ] Render Task List (Status badges: Pending/Completed)
- [ ] **Task Execution**
    - [ ] Task Detail View
    - [ ] Implement Checkbox task completion
    - [ ] Implement Document Upload UI (File input, progress)

## Phase 6: Document Management & File Storage
- [ ] **Backend - File Storage**
    - [ ] Configure Multer for local file storage (uploads/ directory)
    - [ ] Create API Endpoint for File Upload (`POST /api/upload`)
    - [ ] Secure file access (Check user permission before serving file)
- [ ] **Frontend - Document Handling**
    - [ ] Integrate File Upload API in Task View
    - [ ] View/Download uploaded documents

## Phase 7: Polish & Validation
- [ ] **Testing**
    - [ ] Manual testing of all Roles (Admin, HR, Employee, Vendor)
    - [ ] Test negative scenarios (Unauthorized access, Invalid files)
- [ ] **UI Polish**
    - [ ] Ensure responsiveness (Mobile view for tasks)
    - [ ] Add loading states and toast notifications
    - [ ] Verify accessibility (labels, contrast)
- [ ] **Deployment Prep**
    - [ ] Build verification
    - [ ] Documentation update
