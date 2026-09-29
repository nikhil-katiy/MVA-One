import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  AuthServiceError,
  loginUser,
} from '../services/authService';

export default function PortalLoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isMobile = width < 700;

  const showError = (
    title: string,
    message: string,
  ) => {
    Alert.alert(title, message);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      showError(
        'Login Required',
        'Please enter your email address.',
      );
      return;
    }

    if (!password) {
      showError(
        'Login Required',
        'Please enter your password.',
      );
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(
        email.trim(),
        password,
      );

      /*
       * Role-based navigation
       */
      if (result.role === 'ADMIN') {
        router.replace('/admin-dashboard');
        return;
      }

      if (
        result.role === 'PARENT' ||
        result.role === 'FAMILY'
      ) {
        router.replace('/parent-dashboard');
        return;
      }

      /*
       * Current common login is only being used
       * for Admin and Parent/Family.
       */

      showError(
        'Access Denied',
        `Your account role is ${
          result.profile.role ?? 'undefined'
        }. This login currently supports Admin and Parent accounts.`,
      );
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      if (error instanceof AuthServiceError) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            showError(
              'Login Failed',
              error.message,
            );
            break;

          case 'PROFILE_NOT_FOUND':
            showError(
              'Profile Not Found',
              error.message,
            );
            break;

          case 'ROLE_NOT_DEFINED':
            showError(
              'Role Not Defined',
              error.message,
            );
            break;

          default:
            showError(
              'Login Failed',
              error.message,
            );
        }

        return;
      }

      showError(
        'Login Failed',
        error instanceof Error
          ? error.message
          : 'Unable to login. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isMobile && styles.mobileScrollContent,
        ]}
        keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.loginCard,
            isMobile && styles.mobileLoginCard,
          ]}>

          {/* ================= HEADER ================= */}

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                MVA
              </Text>
            </View>

            <Text style={styles.brandName}>
              MVA-ONE
            </Text>

            <Text style={styles.brandSubtitle}>
              Academy Management System
            </Text>
          </View>

          {/* ================= TITLE ================= */}

          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Login to continue to MVA-ONE
            </Text>
          </View>

          {/* ================= EMAIL ================= */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
              style={styles.input}
            />
          </View>

          {/* ================= PASSWORD ================= */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.passwordWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={[
                  styles.input,
                  styles.passwordInput,
                ]}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(
                    previous => !previous,
                  )
                }
                disabled={loading}
                style={styles.showButton}>
                <Text style={styles.showButtonText}>
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ================= FORGOT PASSWORD ================= */}

          <Pressable
            disabled={loading}
            onPress={() =>
              router.push(
                '/admin-forgot-password',
              )
            }
            style={styles.forgotButton}>
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </Pressable>

          {/* ================= LOGIN BUTTON ================= */}

          <Pressable
            disabled={loading}
            onPress={handleLogin}
            style={[
              styles.loginButton,
              loading && styles.loginButtonDisabled,
            ]}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.loginButtonText}>
                  Signing in...
                </Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>
                LOGIN
              </Text>
            )}
          </Pressable>

          {/* ================= INFO ================= */}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This login is used for authorized
              MVA-ONE users.
            </Text>

            <Text style={styles.infoSubText}>
              Admin and Parent accounts are
              automatically redirected to their
              respective dashboard.
            </Text>
          </View>

          {/* ================= BACK ================= */}

          <Pressable
            disabled={loading}
            onPress={() => router.replace('/')}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>
              ← Back
            </Text>
          </Pressable>

          {/* ================= FOOTER ================= */}

          <Text style={styles.footer}>
            Secure MVA-ONE Portal
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  mobileScrollContent: {
    padding: 18,
  },

  loginCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,

    elevation: 5,
  },

  mobileLoginCard: {
    padding: 22,
    borderRadius: 14,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  brandName: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
  },

  brandSubtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 13,
  },

  titleContainer: {
    marginBottom: 26,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },

  passwordWrapper: {
    position: 'relative',
  },

  passwordInput: {
    paddingRight: 70,
  },

  showButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 50,
    justifyContent: 'center',
  },

  showButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },

  forgotText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  loginButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoBox: {
    marginTop: 22,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },

  infoText: {
    color: '#1E3A8A',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },

  infoSubText: {
    marginTop: 5,
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },

  backButton: {
    alignSelf: 'center',
    marginTop: 22,
  },

  backButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    marginTop: 24,
    color: '#9CA3AF',
    fontSize: 11,
  },
});