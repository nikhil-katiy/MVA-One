import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { supabase } from '../lib/supabase';

export default function AdminUpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null
  );
  const [error, setError] = useState(false);

  const handleUpdate = async () => {
    setMessage(null);

    if (password.length < 6) {
      setError(true);
      setMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setError(false);
      setMessage('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (updateError) {
      setError(true);
      setMessage(
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>SECURE ACCESS</Text>
        <Text style={styles.title}>Update Password</Text>
        <Text style={styles.subtitle}>
          Create a new password for your admin account.
        </Text>

        {message && (
          <View
            accessibilityRole="alert"
            style={[
              styles.message,
              error ? styles.errorMessage : styles.successMessage,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <Text style={styles.label}>New Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter new password"
          secureTextEntry
          editable={!loading}
          style={styles.input}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
          editable={!loading}
          style={styles.input}
        />

        <Pressable
          disabled={loading}
          onPress={handleUpdate}
          style={[styles.button, loading && styles.disabledButton]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() => router.replace('/admin-login')}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back to Admin Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F6F8FC',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: '#2563EB',
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    color: '#64748B',
  },
  message: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  successMessage: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
  },
  messageText: {
    color: '#334155',
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    color: '#172B4D',
  },
  button: {
    minHeight: 48,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1E3A63',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 18,
  },
  backText: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
