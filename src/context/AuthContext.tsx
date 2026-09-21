import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type Student = Record<string, any>;

type AuthContextType = {
  isAuthenticated: boolean;
  student: Student | null;
  isLoading: boolean;
  login: (student: Student) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreStudent = async () => {
      try {
        const value =
          Platform.OS === 'web'
            ? window.localStorage.getItem('mva_student')
            : await SecureStore.getItemAsync(
                'mva_student'
              );

        if (value) {
          setStudent(JSON.parse(value));
        }
      } catch {
        setStudent(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreStudent();
  }, []);

  const login = async (studentData: Student) => {
    setStudent(studentData);

    const value = JSON.stringify(studentData);

    if (Platform.OS === 'web') {
      window.localStorage.setItem(
        'mva_student',
        value
      );
    } else {
      await SecureStore.setItemAsync(
        'mva_student',
        value
      );
    }
  };

  const logout = async () => {
    setStudent(null);

    if (Platform.OS === 'web') {
      window.localStorage.removeItem('mva_student');
    } else {
      await SecureStore.deleteItemAsync('mva_student');
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated: student !== null,
      student,
      isLoading,
      login,
      logout,
    }),
    [student, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}