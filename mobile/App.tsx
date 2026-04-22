import React, { useState } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import Layout from './src/components/Layout';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import Employees from './src/pages/Employees';
import Workflows from './src/pages/Workflows';
import Documents from './src/pages/Documents';
import AssignTask from './src/pages/AssignTask';
import OfferLetters from './src/pages/OfferLetters';
import Profile from './src/pages/Profile';
import EmployeeProfile from './src/pages/EmployeeProfile';
import AssignmentDetail from './src/pages/AssignmentDetail';
import { useAuth } from './src/context/AuthContext';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  
  if (loading) return null;
  if (!isAuthenticated) return <Login />;
  
  return (
    <Layout currentScreen={currentScreen} setScreen={setCurrentScreen}>
      {currentScreen === 'Dashboard' && (
          <Dashboard onSelectAssignment={(id) => { setSelectedAssignment(id); setCurrentScreen('AssignmentDetail'); }} setScreen={setCurrentScreen} />
      )}
      {currentScreen === 'Employees' && <Employees setScreen={setCurrentScreen} onSelectEmployee={setSelectedEmployee} />}
      {currentScreen === 'EmployeeProfile' && (
          <EmployeeProfile employeeId={selectedEmployee} onBack={() => setCurrentScreen('Employees')} onSelectAssignment={(id) => { setSelectedAssignment(id); setCurrentScreen('AssignmentDetail'); }} />
      )}
      {currentScreen === 'AssignmentDetail' && (
          <AssignmentDetail assignmentId={selectedAssignment} onBack={() => setCurrentScreen('Dashboard')} />
      )}
      {currentScreen === 'AssignTask' && <AssignTask />}
      {currentScreen === 'OfferLetters' && <OfferLetters />}
      {currentScreen === 'Profile' && <Profile />}
      {currentScreen === 'Workflows' && <Workflows />}
      {currentScreen === 'Documents' && <Documents />}
    </Layout>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
