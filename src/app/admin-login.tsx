import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import AdminHeader from '../components/admin/AdminHeader';
// import AdminInfoPanel from '../components/admin/AdminInfoPanel';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import {
  AdminAuthError,
  loginAdmin,
} from '../services/adminAuthService';

export default function AdminLoginScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const isAndroid = Platform.OS === 'android';

  const handleAdminLogin = async (
    email: string,
    password: string
  ) => {
    setNotification(null);

    if (!email.trim()) {
      setNotification({
        type: 'error',
        title: 'Admin Login',
        message: 'Please enter your admin email.',
      });
      return;
    }

    if (!password) {
      setNotification({
        type: 'error',
        title: 'Admin Login',
        message: 'Please enter your password.',
      });
      return;
    }

    try {
      setLoading(true);

      const result = await loginAdmin(
        email.trim(),
        password
      );

      setNotification({
        type: 'success',
        title: 'Login Successful',
        message:
          'Admin login successful. Opening dashboard...',
      });

      setTimeout(() => {
        router.replace('/admin-dashboard');
      }, 700);
    } catch (error) {
      let title = 'Admin Login Failed';
      let message =
        'Unable to login. Please try again.';

      if (error instanceof AdminAuthError) {
        message = error.message;

        if (error.code === 'ROLE_NOT_ALLOWED') {
          title = 'Access Denied';
        } else if (
          error.code === 'ROLE_NOT_DEFINED'
        ) {
          title = 'Role Not Defined';
        } else if (
          error.code === 'PROFILE_NOT_FOUND'
        ) {
          title = 'Profile Not Found';
        } else if (
          error.code === 'INVALID_CREDENTIALS'
        ) {
          title = 'Login Failed';
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      setNotification({
        type: 'error',
        title,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isTablet && styles.contentTablet,
            isMobile && styles.contentMobile,
            isAndroid && styles.contentAndroid,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {notification && (
            <View
              accessibilityRole="alert"
              style={[
                styles.notification,
                isAndroid && styles.notificationAndroid,
                notification.type === 'success'
                  ? styles.notificationSuccess
                  : styles.notificationError,
              ]}
            >
              <Text style={styles.notificationTitle}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.loginLayout,
              isTablet &&
                styles.loginLayoutTablet,
              isMobile &&
                styles.loginLayoutMobile,
              isAndroid && styles.loginLayoutAndroid,
            ]}
          >
            {/*
             * AdminInfoPanel is temporarily disabled.
             * Keep the component file commented so it can be restored later.
             */}

            <View style={styles.formWrapper}>
              <AdminLoginForm
                loading={loading}
                onSubmit={handleAdminLogin}
                onForgotPassword={() =>
                  router.push(
                    '/admin-forgot-password'
                  )
                }
                onBack={() =>
                  router.replace('/')
                }
              />
            </View>
          </View>

          <Text
            style={[
              styles.footerNote,
              isMobile &&
                styles.footerNoteMobile,
            ]}
          >
            Secure MVA-ONE Administration Portal
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  keyboard: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 28,
    paddingVertical: 26,
  },

  contentTablet: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  contentAndroid: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  contentMobile: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  loginLayout: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',

    minHeight: 550,

    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    borderRadius: 20,

    overflow: 'hidden',
  },

  loginLayoutTablet: {
    maxWidth: 980,
    minHeight: 500,
  },

  loginLayoutMobile: {
    maxWidth: 520,
    minHeight: 0,

    flexDirection: 'column',

    borderRadius: 16,
  },

  loginLayoutAndroid: {
    minHeight: 0,
    flexDirection: 'column',
    borderRadius: 14,
  },

  infoWrapper: {
    flex: 1,
    minWidth: 0,
  },

  formWrapper: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
  },

  notification: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
  },

  notificationAndroid: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  notificationSuccess: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
  },

  notificationError: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },

  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 3,
  },

  notificationMessage: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },

  footerNote: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',

    marginTop: 10,

    textAlign: 'center',

    fontSize: 11,
    color: '#9CA3AF',

    fontWeight: '600',
  },

  footerNoteMobile: {
    marginTop: 8,
    marginBottom: 4,
  },
});