import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '../components/home/HomeHeader';
// import MarqueeRibbon from '../components/home/MarqueeRibbon';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import FeatureSection from '../components/home/FeatureSection';
import HomeFooter from '../components/home/HomeFooter';

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isMobile && styles.mobileContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader />
          {/* <MarqueeRibbon /> */}
          <HeroSection />
          <StatsSection />
          <FeatureSection />
          <HomeFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },

  container: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 0,
  },

  mobileContent: {
    paddingBottom: 0,
  },
});