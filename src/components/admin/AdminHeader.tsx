import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Props = {
  onMenuPress?: () => void;
};

export default function AdminHeader({
  onMenuPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Android MOBILE only
  const isAndroidMobile =
    Platform.OS === 'android' && width < 700;

  return (
    <View
      style={[
        styles.header,

        // Android mobile only
        isAndroidMobile && styles.headerAndroidMobile,

        {
          paddingTop:
            isAndroidMobile
              ? insets.top + 8
              : 12,
        },
      ]}
    >
      {/* LEFT SIDE */}
      <View style={styles.leftSection}>
        {/* HAMBURGER - ANDROID MOBILE ONLY */}
        {isAndroidMobile && (
          <Pressable
            onPress={onMenuPress}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.menuButtonPressed,
            ]}
            hitSlop={8}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>
        )}

        <View style={styles.brandContainer}>
          <Text
            style={[
              styles.brand,
              isAndroidMobile &&
                styles.brandAndroidMobile,
            ]}
          >
            MVA-ONE
          </Text>

          <Text
            style={[
              styles.portal,
              isAndroidMobile &&
                styles.portalAndroidMobile,
            ]}
          >
            ADMIN PORTAL
          </Text>
        </View>
      </View>

      {/* RIGHT SIDE */}
      <Pressable
        style={[
          styles.backButton,
          isAndroidMobile &&
            styles.backButtonAndroidMobile,
        ]}
        onPress={() => router.replace('/')}
      >
        <Text
          style={[
            styles.backText,
            isAndroidMobile &&
              styles.backTextAndroidMobile,
          ]}
        >
          Back
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 70,
    paddingHorizontal: 18,
    paddingBottom: 12,

    backgroundColor: '#1C3358',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerAndroidMobile: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  brandContainer: {
    justifyContent: 'center',
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  brandAndroidMobile: {
    fontSize: 17,
  },

  portal: {
    marginTop: 2,
    color: '#C9D5E6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  portalAndroidMobile: {
    fontSize: 8,
    letterSpacing: 1.2,
  },

  /* =========================
     HAMBURGER
  ========================= */

  menuButton: {
    width: 42,
    height: 42,
    marginRight: 10,

    borderRadius: 9,

    backgroundColor: '#294565',

    alignItems: 'center',
    justifyContent: 'center',
  },

  menuButtonPressed: {
    opacity: 0.7,
  },

  menuLine: {
    width: 21,
    height: 2,
    marginVertical: 2.5,

    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  /* =========================
     BACK BUTTON
  ========================= */

  backButton: {
    minWidth: 52,
    minHeight: 36,

    paddingHorizontal: 11,

    borderRadius: 8,

    backgroundColor: '#294565',

    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonAndroidMobile: {
    minWidth: 50,
    minHeight: 36,
    paddingHorizontal: 10,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  backTextAndroidMobile: {
    fontSize: 11,
  },
});