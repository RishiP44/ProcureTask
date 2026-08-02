import React, { useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import Layout from './src/components/Layout';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import Employees from './src/pages/Employees';
import Vendors from './src/pages/Vendors';
import Workflows from './src/pages/Workflows';
import Documents from './src/pages/Documents';
import AssignTask from './src/pages/AssignTask';
import OfferLetters from './src/pages/OfferLetters';
import Profile from './src/pages/Profile';
import EmployeeProfile from './src/pages/EmployeeProfile';
import AssignmentDetail from './src/pages/AssignmentDetail';
import VendorBills from './src/pages/VendorBills';
import MyTasks from './src/pages/MyTasks';
import Reports from './src/pages/Reports';
import Alerts from './src/pages/Alerts';
import { useAuth } from './src/context/AuthContext';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [profileBackScreen, setProfileBackScreen] = useState('Employees');
  const [assignmentBackScreen, setAssignmentBackScreen] = useState('Dashboard');

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 12, color: '#94a3b8', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>INITIALIZING SYSTEMS...</Text>
      </View>
    );
  }
  if (!isAuthenticated) return <Login />;

  const openEmployee = (id: string, backTo = 'Employees') => {
    setSelectedEmployee(id);
    setProfileBackScreen(backTo);
    setCurrentScreen('EmployeeProfile');
  };

  const openAssignment = (id: string, backTo = currentScreen === 'EmployeeProfile' ? 'EmployeeProfile' : currentScreen) => {
    setSelectedAssignment(id);
    setAssignmentBackScreen(backTo === 'AssignmentDetail' ? 'Dashboard' : backTo);
    setCurrentScreen('AssignmentDetail');
  };

  return (
    <Layout
      currentScreen={currentScreen}
      setScreen={setCurrentScreen}
      onSelectEmployee={(id) => openEmployee(id, 'Employees')}
      onSelectAssignment={(id) => openAssignment(id, 'Dashboard')}
    >
      {currentScreen === 'Dashboard' && (
        <Dashboard
          onSelectAssignment={(id) => openAssignment(id, 'Dashboard')}
          setScreen={setCurrentScreen}
        />
      )}
      {currentScreen === 'MyTasks' && (
        <MyTasks onSelectAssignment={(id) => openAssignment(id, 'MyTasks')} />
      )}
      {currentScreen === 'Employees' && (
        <Employees
          setScreen={setCurrentScreen}
          onSelectEmployee={(id) => openEmployee(id, 'Employees')}
        />
      )}
      {currentScreen === 'Vendors' && (
        <Vendors
          setScreen={setCurrentScreen}
          onSelectEmployee={(id) => openEmployee(id, 'Vendors')}
        />
      )}
      {currentScreen === 'EmployeeProfile' && (
        <EmployeeProfile
          employeeId={selectedEmployee}
          onBack={() => setCurrentScreen(profileBackScreen)}
          onSelectAssignment={(id) => openAssignment(id, 'EmployeeProfile')}
        />
      )}
      {currentScreen === 'AssignmentDetail' && (
        <AssignmentDetail
          assignmentId={selectedAssignment}
          onBack={() => setCurrentScreen(assignmentBackScreen)}
        />
      )}
      {currentScreen === 'AssignTask' && <AssignTask />}
      {currentScreen === 'OfferLetters' && <OfferLetters />}
      {currentScreen === 'Profile' && <Profile onBack={() => setCurrentScreen('Dashboard')} />}
      {currentScreen === 'Workflows' && <Workflows />}
      {currentScreen === 'Documents' && <Documents />}
      {currentScreen === 'VendorBills' && <VendorBills />}
      {currentScreen === 'Reports' && (
        <Reports onSelectAssignment={(id) => openAssignment(id, 'Reports')} />
      )}
      {currentScreen === 'Alerts' && <Alerts />}
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
