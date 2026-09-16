import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {supabase} from '../lib/supabase';

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

const LoginScreen = ({onLoginSuccess}: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const enteredEmail = email.trim().toLowerCase();
    const enteredPhone = phone.trim();

    if (!enteredEmail || !enteredPhone) {
      Alert.alert('Error', 'Please enter email and phone number.');
      return;
    }

    setLoading(true);

    try {
      const {data, error} = await supabase
        .from('students')
        .select('id, first_name, middle_name, last_name, email, mobile')
        .eq('email', enteredEmail)
        .eq('mobile', enteredPhone)
        .maybeSingle();

      if (error) {
        console.log('Supabase Login Error:', error);
        Alert.alert('Error', error.message);
        return;
      }

      if (!data) {
        Alert.alert(
          'Login Failed',
          'Invalid email or phone number.',
        );
        return;
      }

      console.log('Logged in student:', data);

      onLoginSuccess();
    } catch (error) {
      console.log('Login Error:', error);

      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.content}>

          <Text style={styles.title}>MVA_ONE</Text>

          <Text style={styles.subtitle}>
            Academy Management System
          </Text>

          <View style={styles.form}>

            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Phone Number</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}>

              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  Login
                </Text>
              )}

            </TouchableOpacity>

          </View>

          <Text style={styles.demoText}>
            Test: rahul@1234gmail.com / 9876543210
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  title: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
  },

  form: {
    marginTop: 40,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  input: {
    height: 52,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 16,
  },

  loginButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#111827',
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  demoText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default LoginScreen;