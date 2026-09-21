import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeFooter() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isMobile = width < 700;

  return (
    <>
      <View
        style={[
          styles.cta,
          isMobile && styles.ctaMobile,
        ]}
      >
        <View style={styles.ctaInner}>
          <View style={styles.ctaText}>
            <Text
              style={[
                styles.ctaTitle,
                isMobile && styles.ctaTitleMobile,
              ]}
            >
              MVA-ONE
            </Text>

            <Text style={styles.ctaDescription}>
              One platform for Macro Vision
              Academy student and campus operations.
            </Text>
          </View>

          <Pressable
            style={styles.ctaButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.ctaButtonText}>
              Student Login
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>
          MVA-ONE
        </Text>

        <Text style={styles.footerSchool}>
          Macro Vision Academy
        </Text>

        <Text style={styles.footerCopyright}>
          © 2026 Macro Vision Academy. All rights reserved.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cta: {
    width: '100%',
    backgroundColor: '#14253F',
  },

  ctaMobile: {
    paddingHorizontal: 0,
  },

  ctaInner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',

    paddingHorizontal: 32,
    paddingVertical: 70,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    gap: 30,
  },

  ctaText: {
    flex: 1,
    maxWidth: 650,
  },

  ctaTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  ctaTitleMobile: {
    fontSize: 29,
  },

  ctaDescription: {
    marginTop: 10,

    fontSize: 16,
    lineHeight: 26,

    color: 'rgba(255,255,255,0.72)',
  },

  ctaButton: {
    paddingHorizontal: 22,
    paddingVertical: 14,

    borderRadius: 10,

    backgroundColor: '#D9922B',
  },

  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  footer: {
    width: '100%',

    backgroundColor: '#14253F',

    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',

    paddingHorizontal: 24,
    paddingVertical: 28,

    alignItems: 'center',
  },

  footerBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  footerSchool: {
    marginTop: 5,

    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.76)',
  },

  footerCopyright: {
    marginTop: 6,

    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
  },
});