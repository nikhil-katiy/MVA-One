import React, {useState} from 'react';

import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import StudentList from './src/components/students/StudentList';
import StudentForm from './src/components/students/StudentForm';

type Screen =
  | 'login'
  | 'dashboard'
  | 'students'
  | 'addStudent';

function App(): React.JSX.Element {
  const [screen, setScreen] =
    useState<Screen>('login');

  if (screen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={() =>
          setScreen('dashboard')
        }
      />
    );
  }

  if (screen === 'addStudent') {
    return (
      <StudentForm
        onBack={() =>
          setScreen('dashboard')
        }
        onSuccess={() =>
          setScreen('students')
        }
      />
    );
  }

  if (screen === 'students') {
    return (
      <StudentList
        onBack={() =>
          setScreen('dashboard')
        }
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={() =>
        setScreen('login')
      }
      onStudentsPress={() =>
        setScreen('students')
      }
      onAddStudent={() =>
        setScreen('addStudent')
      }
    />
  );
}

export default App;