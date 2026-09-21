import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeHeader() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isMobile = width < 700;

  const goToAdminLogin = () => {
    router.push('/admin-login');
  };

  const goHome = () => {
    router.replace('/');
  };

  return (
    <View style={styles.header}>
      <View
        style={[
          styles.headerInner,
          isMobile && styles.headerInnerMobile,
        ]}
      >
        {/* ================= BRAND ================= */}

        <Pressable
          style={styles.brand}
          onPress={goHome}
        >
          <View
            style={[
              styles.brandMark,
              isMobile && styles.brandMarkMobile,
            ]}
          >
            <Text
              style={[
                styles.brandMarkText,
                isMobile &&
                  styles.brandMarkTextMobile,
              ]}
            >
              M
            </Text>
          </View>

          <View style={styles.brandText}>
            <Text
              style={[
                styles.brandName,
                isMobile &&
                  styles.brandNameMobile,
              ]}
              numberOfLines={1}
            >
              MVA-ONE
            </Text>

            <Text
              style={[
                styles.brandTag,
                isMobile &&
                  styles.brandTagMobile,
              ]}
              numberOfLines={1}
            >
              Macro Vision Academy
            </Text>
          </View>
        </Pressable>

        {/* ================= DESKTOP / TABLET ================= */}

        {!isMobile && (
          <View style={styles.nav}>
            {/* HOME */}

            <Pressable
              style={styles.navItem}
              onPress={goHome}
            >
              <Text style={styles.navText}>
                Home
              </Text>
            </Pressable>

            {/* PLATFORM */}

            <Pressable
              style={styles.navItem}
            >
              <Text style={styles.navText}>
                Platform
              </Text>
            </Pressable>

            {/* SUPPORT */}

            <Pressable
              style={styles.navItem}
            >
              <Text style={styles.navText}>
                Support
              </Text>
            </Pressable>

            {/* ================= ADMIN LOGIN ================= */}

            <Pressable
              style={({ pressed }) => [
                styles.adminButton,
                pressed &&
                  styles.adminButtonPressed,
              ]}
              onPress={goToAdminLogin}
            >
              <Text style={styles.adminButtonText}>
                Admin Login
              </Text>
            </Pressable>
          </View>
        )}

        {/* ================= MOBILE ================= */}

        {isMobile && (
          <Pressable
            style={({ pressed }) => [
              styles.mobileLoginButton,
              pressed &&
                styles.mobileLoginButtonPressed,
            ]}
            onPress={goToAdminLogin}
          >
            <Text style={styles.mobileLoginText}>
              Admin Login
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    width: '100%',
    backgroundColor: '#FAF6ED',

    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(28,51,88,0.14)',

    zIndex: 100,

    ...(Platform.OS === 'web'
      ? {
          position: 'sticky' as any,
          top: 0,
        }
      : {}),
  },

  headerInner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',

    minHeight: 82,

    paddingHorizontal: 32,
    paddingVertical: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerInnerMobile: {
    minHeight: 64,

    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  /* =====================================================
     BRAND
  ===================================================== */

  brand: {
    flexDirection: 'row',
    alignItems: 'center',

    flexShrink: 1,
    minWidth: 0,
  },

  brandMark: {
    width: 44,
    height: 44,

    borderRadius: 10,

    backgroundColor: '#1C3358',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    flexShrink: 0,
  },

  brandMarkMobile: {
    width: 38,
    height: 38,

    borderRadius: 9,

    marginRight: 9,
  },

  brandMarkText: {
    color: '#FAF6ED',
    fontSize: 24,
    fontWeight: '900',
  },

  brandMarkTextMobile: {
    fontSize: 20,
  },

  brandText: {
    flexShrink: 1,
    justifyContent: 'center',
  },

  brandName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#14253F',
  },

  brandNameMobile: {
    fontSize: 17,
  },

  brandTag: {
    marginTop: 2,

    fontSize: 11,
    color: '#5B5D66',

    letterSpacing: 0.2,
  },

  brandTagMobile: {
    fontSize: 9,
    marginTop: 1,
  },

  /* =====================================================
     DESKTOP / TABLET NAV
  ===================================================== */

  nav: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 18,
  },

  navItem: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  navText: {
    fontSize: 14,
    fontWeight: '500',

    color: '#22242B',
  },

  /* =====================================================
     ADMIN LOGIN BUTTON
  ===================================================== */

  adminButton: {
    backgroundColor: '#1C3358',

    paddingHorizontal: 18,
    paddingVertical: 11,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',
  },

  adminButtonPressed: {
    opacity: 0.82,
  },

  adminButtonText: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '700',
  },

  /* =====================================================
     MOBILE LOGIN
  ===================================================== */

  mobileLoginButton: {
    minHeight: 40,

    paddingHorizontal: 15,

    borderRadius: 9,

    backgroundColor: '#1C3358',

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,

    marginLeft: 12,
  },

  mobileLoginButtonPressed: {
    opacity: 0.82,
  },

  mobileLoginText: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '800',
  },
});