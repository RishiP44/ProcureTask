import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import CreateWorkflow from './pages/CreateWorkflow';
import AssignWorkflow from './pages/AssignWorkflow';
import AssignmentDetail from './pages/AssignmentDetail';
import Documents from './pages/Documents';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import OfferLetters from './pages/OfferLetters';
import OfferLetterAccept from './pages/OfferLetterAccept';
import MyTasks from './pages/MyTasks';
import Profile from './pages/Profile';

import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />

                {/* Public offer letter page (no auth needed) */}
                <Route path="/offer-letter/:token" element={<OfferLetterAccept />} />

                {/* Protected routes */}
                <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* HR / Admin routes */}
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/employees/:id" element={<EmployeeProfile />} />
                        <Route path="/assign" element={<AssignWorkflow />} />
                        <Route path="/offer-letters" element={<OfferLetters />} />
                        <Route path="/workflows" element={<Workflows />} />
                        <Route path="/workflows/create" element={<CreateWorkflow />} />
                        <Route path="/documents" element={<Documents />} />

                        {/* Employee routes */}
                        <Route path="/my-tasks" element={<MyTasks />} />

                        {/* Shared */}
                        <Route path="/assignments/:id" element={<AssignmentDetail />} />
                        <Route path="/profile" element={<Profile />} />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Route>
                </Route>
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        },
                        success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
                <AnimatedRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
