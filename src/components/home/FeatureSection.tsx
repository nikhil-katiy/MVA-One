import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const features = [
  {
    title: 'Student Management',
    description:
      'Manage student profiles, IDs, family relationships and student records.',
    color: '#D9922B',
  },
  {
    title: 'Academic Management',
    description:
      'Classes, sections, academic year and teacher-related student operations.',
    color: '#2E6F5E',
  },
  {
    title: 'Family Management',
    description:
      'Connect siblings through automatic family identification and management.',
    color: '#B84D3E',
  },
  {
    title: 'Hostel Management',
    description:
      'Manage hostel, room, bed and warden information.',
    color: '#D9922B',
  },
  {
    title: 'Booking Services',
    description:
      'Library, restaurant, salon, extra class and campus bookings.',
    color: '#2E6F5E',
  },
  {
    title: 'Request & Permission',
    description:
      'Student requests, home leave, medical requests and permissions.',
    color: '#B84D3E',
  },
  {
    title: 'Gate Pass & Security',
    description:
      'Leave verification, gate passes and security operations.',
    color: '#D9922B',
  },
  {
    title: 'Notifications',
    description:
      'Important student, staff and campus notifications in one place.',
    color: '#2E6F5E',
  },
  {
    title: 'Role-Based Access',
    description:
      'Students, teachers, staff and admins see only what they are allowed to access.',
    color: '#B84D3E',
  },
];

export default function FeatureSection() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>
            MACRO VISION ACADEMY
          </Text>

          <Text
            style={[
              styles.title,
              isMobile && styles.titleMobile,
            ]}
          >
            Everything connected in MVA-ONE
          </Text>

          <Text style={styles.description}>
            MVA-ONE brings student data, academic
            information and campus operations into
            one connected platform.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}
        >
          {features.map((feature) => (
            <View
              key={feature.title}
              style={[
                styles.card,
                isMobile && styles.cardMobile,
              ]}
            >
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor: `${feature.color}22`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.iconText,
                    {
                      color: feature.color,
                    },
                  ]}
                >
                  M
                </Text>
              </View>

              <Text style={styles.cardTitle}>
                {feature.title}
              </Text>

              <Text style={styles.cardText}>
                {feature.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    backgroundColor: '#FAF6ED',
  },

  inner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',

    paddingHorizontal: 32,
    paddingVertical: 90,
  },

  heading: {
    maxWidth: 680,
    marginBottom: 40,
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '800',
    color: '#2E6F5E',
  },

  title: {
    marginTop: 10,

    fontSize: 38,
    lineHeight: 46,

    fontWeight: '900',
    color: '#14253F',
  },

  titleMobile: {
    fontSize: 30,
    lineHeight: 37,
  },

  description: {
    marginTop: 15,

    fontSize: 16,
    lineHeight: 26,

    color: '#5B5D66',
  },

  cards: {
    paddingBottom: 8,
    paddingRight: 20,
  },

  card: {
    width: 295,

    marginRight: 18,
    padding: 28,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: 'rgba(28,51,88,0.14)',

    borderRadius: 16,
  },

  cardMobile: {
    width: 270,
  },

  icon: {
    width: 40,
    height: 40,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,
  },

  iconText: {
    fontSize: 17,
    fontWeight: '900',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14253F',
  },

  cardText: {
    marginTop: 9,

    fontSize: 14,
    lineHeight: 22,

    color: '#5B5D66',
  },
});