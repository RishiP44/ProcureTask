import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
                            borderRadius: '4px',
                            border: '1px solid #dbeafe',
                            boxShadow: 'none',
                        },
                        success: { iconTheme: { primary: '#1e40af', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
                    }}
                />
                <Routes>
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
            </AuthProvider>
        </Router>
    );
}

export default App;
