import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import StudentList from './src/components/students/StudentList';

type Screen = 'login' | 'dashboard' | 'students';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('login');

  const handleLoginSuccess = () => {
    console.log('LOGIN SUCCESS → DASHBOARD');
    setScreen('dashboard');
  };

  const handleManageStudents = () => {
    console.log('MANAGE STUDENTS → STUDENT LIST');
    setScreen('students');
  };

  const handleBackToDashboard = () => {
    console.log('STUDENT LIST → DASHBOARD');
    setScreen('dashboard');
  };

  if (screen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (screen === 'students') {
    return (
      <StudentList
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={() => setScreen('login')}
      onStudentsPress={handleManageStudents}
    />
  );
}

export default App;