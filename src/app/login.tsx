import React, { useState } from 'react';

import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type LoginResponse = {
  success: boolean;
  message: string;
  student?: Record<string, any>;
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (
    type: 'success' | 'error',
    message: string
  ) => {
    setNotification({
      type,
      message,
    });
  };

  const handleLogin = async () => {
    setNotification(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    if (!cleanEmail) {
      showNotification(
        'error',
        'Please enter your email address.'
      );
      return;
    }

    if (!cleanMobile) {
      showNotification(
        'error',
        'Please enter your mobile number.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showNotification(
        'error',
        'Please enter a valid email address.'
      );
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      showNotification(
        'error',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        'student_login',
        {
          p_email: cleanEmail,
          p_mobile: cleanMobile,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      const loginData = data as LoginResponse;

      // Email/mobile do not match
      if (!loginData.success) {
        showNotification(
          'error',
          loginData.message ||
            'Invalid email or mobile number.'
        );
        return;
      }

      // Login succeeded but no student was returned
      if (!loginData.student) {
        showNotification(
          'error',
          'Student record was not found.'
        );
        return;
      }

      // Store the matched student
      login(loginData.student);

      // Success message
      showNotification(
        'success',
        'Login successful.'
      );

      // Go to dashboard
      router.replace('/dashboard');

    } catch (error) {
      console.error(
        'Student login error:',
        error
      );

      showNotification(
        'error',
        'Unable to connect to the server. Please check Supabase.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <View style={styles.header}>
          <Text style={styles.logo}>
            MVA ONE
          </Text>

          <Text style={styles.title}>
            Student Login
          </Text>

          <Text style={styles.subtitle}>
            Enter your registered email and mobile number
          </Text>
        </View>

        {notification && (
          <View
            style={[
              styles.notification,
              notification.type === 'success'
                ? styles.successNotification
                : styles.errorNotification,
            ]}
          >
            <Text
              style={[
                styles.notificationText,
                notification.type === 'success'
                  ? styles.successText
                  : styles.errorText,
              ]}
            >
              {notification.message}
            </Text>
          </View>
        )}

        <View style={styles.form}>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your registered email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mobile Number
            </Text>

            <TextInput
              value={mobile}
              onChangeText={(value) =>
                setMobile(
                  value.replace(/[^0-9]/g, '')
                )
              }
              placeholder="Enter your 10-digit mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginButton,
              pressed &&
                !loading &&
                styles.loginButtonPressed,
              loading &&
                styles.loginButtonDisabled,
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  Checking...
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                Login
              </Text>
            )}
          </Pressable>

        </View>

        <Text style={styles.footer}>
          MVA ONE • Student Management System
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,

    ...Platform.select({
      web: {
        boxShadow:
          '0px 8px 30px rgba(0, 0, 0, 0.08)',
      },

      default: {
        elevation: 5,
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: {
          width: 0,
          height: 5,
        },
      },
    }),
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#2563EB',
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
  },

  notification: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
  },

  successNotification: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },

  errorNotification: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  notificationText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  successText: {
    color: '#047857',
  },

  errorText: {
    color: '#DC2626',
  },

  form: {
    width: '100%',
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },

  loginButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  loginButtonPressed: {
    opacity: 0.85,
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 28,
  },
});