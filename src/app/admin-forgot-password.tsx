import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function AdminForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        'Forgot Password',
        'Please enter your admin email.'
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              typeof window !== 'undefined'
                ? `${window.location.origin}/admin-update-password`
                : 'mvaoneexpo://admin-update-password',
          }
        );

      if (error) {
        throw error;
      }

      Alert.alert(
        'Reset Link Sent',
        'Please check your email for the password reset link.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        'PASSWORD RESET ERROR:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to send reset link.';

      Alert.alert(
        'Password Reset Failed',
        message
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
      }
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>
          SECURE ACCESS
        </Text>

        <Text style={styles.title}>
          Forgot Password
        </Text>

        <Text style={styles.subtitle}>
          Enter your Admin email and we will
          send you a password reset link.
        </Text>

        <Text style={styles.label}>
          Admin Email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your admin email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          style={styles.input}
        />

        <Pressable
          disabled={loading}
          onPress={handleReset}
          style={({ pressed }) => [
            styles.button,
            pressed &&
              !loading &&
              styles.buttonPressed,
            loading &&
              styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              Send Reset Link
            </Text>
          )}
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back to Admin Login
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 30,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: '#2563EB',
  },

  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 24,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  label: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  input: {
    width: '100%',
    minHeight: 50,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
  },

  button: {
    width: '100%',
    minHeight: 50,
    marginTop: 22,
    borderRadius: 10,
    backgroundColor: '#1C3358',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  backButton: {
    alignSelf: 'center',
    marginTop: 18,
    paddingVertical: 7,
  },

  backText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});