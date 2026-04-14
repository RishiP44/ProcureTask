import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import Workflows from './src/pages/Workflows';
import AssignWorkflow from './src/pages/AssignWorkflow';
import Documents from './src/pages/Documents';
import AssignmentDetail from './src/pages/AssignmentDetail';
import Employees from './src/pages/Employees';
import OfferLetters from './src/pages/OfferLetters';
import EmployeeProfile from './src/pages/EmployeeProfile';
import Layout from './src/components/Layout';
import { View, ActivityIndicator } from 'react-native';

import "./global.css";

const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();
    const [currentScreen, setCurrentScreen] = useState('Dashboard');
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!isAuthenticated) return <Login />;

    if (selectedAssignmentId) {
        return (
            <AssignmentDetail 
                assignmentId={selectedAssignmentId} 
                onBack={() => setSelectedAssignmentId(null)} 
            />
        );
    }

    if (selectedEmployeeId) {
        return (
            <EmployeeProfile 
                employeeId={selectedEmployeeId} 
                onBack={() => setSelectedEmployeeId(null)} 
            />
        );
    }

    return (
        <Layout currentScreen={currentScreen} setScreen={setCurrentScreen}>
            {currentScreen === 'Dashboard' && <Dashboard onSelectAssignment={setSelectedAssignmentId} />}
            {currentScreen === 'Workflows' && <Workflows />}
            {currentScreen === 'Employees' && <Employees onSelectEmployee={setSelectedEmployeeId} />}
            {currentScreen === 'Offers' && <OfferLetters />}
            {currentScreen === 'Assign' && <AssignWorkflow />}
            {currentScreen === 'Documents' && <Documents />}
        </Layout>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <StatusBar style="auto" />
            <AppContent />
        </AuthProvider>
    );
}
