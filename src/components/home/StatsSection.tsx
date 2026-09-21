import React from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const stats = [
  {
    value: '01',
    label: 'Connected Platform',
  },
  {
    value: 'MVA',
    label: 'Student Management',
  },
  {
    value: '24/7',
    label: 'Campus Access',
  },
  {
    value: '100%',
    label: 'Centralized Data',
  },
];

export default function StatsSection() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.inner,
          isMobile && styles.innerMobile,
        ]}
      >
        {stats.map((item) => (
          <View
            key={item.label}
            style={[
              styles.stat,
              isMobile && styles.statMobile,
            ]}
          >
            <Text style={styles.number}>
              {item.value}
            </Text>

            <Text style={styles.label}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',

    backgroundColor: '#F2ECDC',

    borderTopWidth: 1,
    borderBottomWidth: 1,

    borderColor: 'rgba(28,51,88,0.14)',
  },

  inner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',

    paddingHorizontal: 32,
    paddingVertical: 30,

    flexDirection: 'row',
    alignItems: 'center',
  },

  innerMobile: {
    flexWrap: 'wrap',
  },

  stat: {
    flex: 1,

    paddingHorizontal: 16,

    borderRightWidth: 1,
    borderRightColor:
      'rgba(28,51,88,0.10)',
  },

  statMobile: {
    flexBasis: '50%',
    flexGrow: 0,

    marginBottom: 22,

    borderRightWidth: 0,
  },

  number: {
    fontSize: 30,
    fontWeight: '900',
    color: '#14253F',
  },

  label: {
    marginTop: 4,

    fontSize: 13,
    color: '#5B5D66',
  },
});