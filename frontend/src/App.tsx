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

import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" reverseOrder={false} />
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/workflows" element={<Workflows />} />
                            <Route path="/workflows/create" element={<CreateWorkflow />} />
                            <Route path="/assign" element={<AssignWorkflow />} />
                            <Route path="/assignments/:id" element={<AssignmentDetail />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
