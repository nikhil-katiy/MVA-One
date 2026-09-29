import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function HeroSection() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isMobile = width < 700;

  return (
    <View style={styles.hero}>
      <View
        style={[
          styles.heroInner,
          isMobile && styles.heroInnerMobile,
        ]}
      >
        <View
          style={[
            styles.copy,
            isMobile && styles.copyMobile,
          ]}
        >
          <Text style={styles.kicker}>
            DIGITAL SCHOOL PLATFORM
          </Text>

          <Text
            style={[
              styles.title,
              isMobile && styles.titleMobile,
            ]}
          >
            One platform for{' '}
            <Text style={styles.highlight}>
              MVA
            </Text>
          </Text>

          <Text
            style={[
              styles.description,
              isMobile &&
                styles.descriptionMobile,
            ]}
          >
            MVA-ONE connects student management,
            academic operations and campus services
            into one clear system.
          </Text>

          <View
            style={[
              styles.actions,
              isMobile && styles.actionsMobile,
            ]}
          >
            <Pressable
              style={[
                styles.primaryButton,
                isMobile && styles.buttonMobile,
              ]}
              onPress={() => router.push('/portal-login')}
            >
              <Text style={styles.primaryButtonText}>
                Portal Login
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryButton,
                isMobile &&
                  styles.buttonMobile,
              ]}
            >
              <Text
                style={styles.secondaryButtonText}
              >
                Explore Platform
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.illustrationWrap,
            isMobile &&
              styles.illustrationWrapMobile,
          ]}
        >
          <View
            style={[
              styles.illustration,
              isMobile &&
                styles.illustrationMobile,
            ]}
          >
            <View style={styles.screenHeader}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            <View style={styles.chartArea}>
              <View
                style={[
                  styles.chartBar,
                  styles.bar1,
                ]}
              />

              <View
                style={[
                  styles.chartBar,
                  styles.bar2,
                ]}
              />

              <View
                style={[
                  styles.chartBar,
                  styles.bar3,
                ]}
              />

              <View
                style={[
                  styles.chartBar,
                  styles.bar4,
                ]}
              />

              <View
                style={[
                  styles.chartBar,
                  styles.bar5,
                ]}
              />
            </View>

            <View style={styles.laptopBase} />
          </View>

          <View
            style={[
              styles.mvaBubble,
              isMobile &&
                styles.mvaBubbleMobile,
            ]}
          >
            <Text
              style={[
                styles.mvaBubbleText,
                isMobile &&
                  styles.mvaBubbleTextMobile,
              ]}
            >
              MVA
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    backgroundColor: '#FAF6ED',
  },

  heroInner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',

    minHeight: 560,

    paddingHorizontal: 32,
    paddingVertical: 80,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    gap: 40,
  },

  heroInnerMobile: {
    minHeight: 0,

    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 48,

    flexDirection: 'column',
    alignItems: 'stretch',

    gap: 12,
  },

  copy: {
    flex: 1,
    maxWidth: 590,
  },

  copyMobile: {
    width: '100%',
    maxWidth: undefined,
  },

  kicker: {
    alignSelf: 'flex-start',

    paddingHorizontal: 13,
    paddingVertical: 7,

    borderRadius: 999,

    backgroundColor:
      'rgba(46,111,94,0.10)',

    color: '#2E6F5E',

    fontSize: 12,
    fontWeight: '800',

    letterSpacing: 1,
  },

  title: {
    marginTop: 22,

    fontSize: 58,
    lineHeight: 64,

    fontWeight: '900',
    color: '#14253F',
  },

  titleMobile: {
    marginTop: 18,

    fontSize: 42,
    lineHeight: 47,
  },

  highlight: {
    color: '#D9922B',
  },

  description: {
    marginTop: 22,

    maxWidth: 560,

    fontSize: 18,
    lineHeight: 29,

    color: '#5B5D66',
  },

  descriptionMobile: {
    marginTop: 18,

    fontSize: 16,
    lineHeight: 25,
  },

  actions: {
    marginTop: 30,

    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 12,
  },

  actionsMobile: {
    marginTop: 24,

    flexDirection: 'row',
    flexWrap: 'nowrap',

    width: '100%',
  },

  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,

    backgroundColor: '#1C3358',

    borderRadius: 10,
  },

  secondaryButton: {
    paddingHorizontal: 22,
    paddingVertical: 13,

    borderRadius: 10,

    borderWidth: 1.5,
    borderColor:
      'rgba(28,51,88,0.14)',
  },

  buttonMobile: {
    flex: 1,

    paddingHorizontal: 10,
    paddingVertical: 14,

    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButtonText: {
    color: '#14253F',
    fontSize: 14,
    fontWeight: '700',
  },

  illustrationWrap: {
    width: 470,
    height: 360,

    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationWrapMobile: {
    width: '100%',
    height: 250,

    marginTop: 20,
  },

  illustration: {
    width: '88%',
    height: 230,

    backgroundColor: '#1C3358',

    borderRadius: 18,

    paddingTop: 13,

    overflow: 'hidden',

    shadowColor: '#14253F',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 8,
  },

  illustrationMobile: {
    width: '90%',
    height: 205,

    borderRadius: 16,
  },

  screenHeader: {
    height: 26,

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255,255,255,0.12)',
  },

  dot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: '#D9922B',

    marginRight: 5,
  },

  chartArea: {
    flex: 1,

    paddingHorizontal: 40,
    paddingBottom: 22,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  chartBar: {
    width: 28,

    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },

  bar1: {
    height: 58,
    backgroundColor: '#D9922B',
  },

  bar2: {
    height: 90,
    backgroundColor: '#2E6F5E',
  },

  bar3: {
    height: 48,
    backgroundColor: '#D9922B',
  },

  bar4: {
    height: 112,
    backgroundColor: '#2E6F5E',
  },

  bar5: {
    height: 145,
    backgroundColor: '#B84D3E',
  },

  laptopBase: {
    height: 14,

    width: '100%',

    backgroundColor: '#14253F',

    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  mvaBubble: {
    width: 94,
    height: 94,

    position: 'absolute',

    right: 18,
    bottom: 18,

    borderRadius: 47,

    backgroundColor: '#D9922B',

    borderWidth: 8,
    borderColor: '#F2ECDC',

    alignItems: 'center',
    justifyContent: 'center',
  },

  mvaBubbleMobile: {
    width: 76,
    height: 76,

    right: 18,
    bottom: 10,

    borderRadius: 38,

    borderWidth: 6,
  },

  mvaBubbleText: {
    color: '#FFFFFF',

    fontSize: 24,
    fontWeight: '900',
  },

  mvaBubbleTextMobile: {
    fontSize: 20,
  },
});