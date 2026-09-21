import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type Props = {
  loading: boolean;

  onSubmit: (
    email: string,
    password: string
  ) => void;

  onForgotPassword: () => void;

  onBack: () => void;
};

export default function AdminLoginForm({
  loading,
  onSubmit,
  onForgotPassword,
  onBack,
}: Props) {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);

  const handleSubmit = () => {
    onSubmit(email.trim(), password);
  };

  return (
    <View
      style={[
        styles.container,
        isTablet && styles.containerTablet,
        isMobile && styles.containerMobile,
      ]}
    >
      <View style={styles.form}>
        <Text
          style={[
            styles.formEyebrow,
            isMobile && styles.formEyebrowMobile,
          ]}
        >
          SECURE ACCESS
        </Text>

        <Text
          style={[
            styles.title,
            isTablet && styles.titleTablet,
            isMobile && styles.titleMobile,
          ]}
        >
          Admin Login
        </Text>

        <Text
          style={[
            styles.subtitle,
            isTablet && styles.subtitleTablet,
            isMobile && styles.subtitleMobile,
          ]}
        >
          Sign in to access the MVA-ONE
          administration platform.
        </Text>

        {/* ADMIN EMAIL */}

        <View
          style={[
            styles.field,
            isMobile && styles.fieldMobile,
          ]}
        >
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
            style={[
              styles.input,
              isTablet && styles.inputTablet,
              isMobile && styles.inputMobile,
            ]}
          />
        </View>

        {/* PASSWORD */}

        <View
          style={[
            styles.field,
            isMobile && styles.fieldMobile,
          ]}
        >
          <Text style={styles.label}>
            Password
          </Text>

          <View
            style={[
              styles.passwordWrapper,
              isTablet &&
                styles.passwordWrapperTablet,
              isMobile &&
                styles.passwordWrapperMobile,
            ]}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              style={styles.passwordInput}
            />

            <Pressable
              disabled={loading}
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(
                  (value) => !value
                )
              }
            >
              <Text style={styles.eyeText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          {/* FORGOT PASSWORD */}

          <Pressable
            disabled={loading}
            style={styles.forgotButton}
            onPress={onForgotPassword}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {/* LOGIN */}

        <Pressable
          disabled={loading}
          style={({ pressed }) => [
            styles.loginButton,
            isTablet &&
              styles.loginButtonTablet,
            isMobile &&
              styles.loginButtonMobile,
            pressed &&
              !loading &&
              styles.loginButtonPressed,
            loading &&
              styles.loginButtonDisabled,
          ]}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>
              Admin Login
            </Text>
          )}
        </Pressable>

        {/* BACK */}

        <Pressable
          disabled={loading}
          style={styles.backLink}
          onPress={onBack}
        >
          <Text
            style={[
              styles.backText,
              isMobile &&
                styles.backTextMobile,
            ]}
          >
            ← Back to MVA-ONE
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 46,
    paddingVertical: 42,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },

  containerTablet: {
    paddingHorizontal: 32,
    paddingVertical: 28,
  },

  containerMobile: {
    flex: 0,
    paddingHorizontal: 22,
    paddingVertical: 30,
    justifyContent: 'flex-start',
  },

  form: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  formEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: '#2563EB',
  },

  formEyebrowMobile: {
    fontSize: 10,
  },

  title: {
    marginTop: 8,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: '#111827',
  },

  titleTablet: {
    fontSize: 30,
    lineHeight: 36,
  },

  titleMobile: {
    fontSize: 29,
    lineHeight: 35,
  },

  subtitle: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    maxWidth: 420,
  },

  subtitleTablet: {
    fontSize: 12,
    lineHeight: 19,
  },

  subtitleMobile: {
    fontSize: 13,
    lineHeight: 21,
  },

  field: {
    marginTop: 21,
  },

  fieldMobile: {
    marginTop: 19,
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

  inputTablet: {
    minHeight: 48,
  },

  inputMobile: {
    minHeight: 49,
  },

  passwordWrapper: {
    width: '100%',
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
  },

  passwordWrapperTablet: {
    minHeight: 48,
  },

  passwordWrapperMobile: {
    minHeight: 49,
  },

  passwordInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },

  eyeButton: {
    paddingHorizontal: 13,
  },

  eyeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 9,
    paddingVertical: 4,
  },

  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  loginButton: {
    width: '100%',
    minHeight: 50,
    marginTop: 26,
    borderRadius: 10,
    backgroundColor: '#1C3358',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonTablet: {
    minHeight: 48,
    marginTop: 22,
  },

  loginButtonMobile: {
    minHeight: 50,
    marginTop: 24,
  },

  loginButtonPressed: {
    opacity: 0.88,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  backLink: {
    alignSelf: 'center',
    marginTop: 18,
    paddingVertical: 7,
  },

  backText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },

  backTextMobile: {
    fontSize: 12,
  },
});