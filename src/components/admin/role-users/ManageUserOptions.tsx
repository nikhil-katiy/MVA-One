import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type UserType = 'teacher' | 'staff' | 'parent';

type Props = {
  onSelect: (type: UserType) => void;
};

export default function ManageUserOptions({
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Manage Users
        </Text>

        <Text style={styles.subtitle}>
          Select a user type to add and manage records.
        </Text>
      </View>

      <View style={styles.grid}>

        {/* TEACHERS */}

        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
          onPress={() => onSelect('teacher')}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              T
            </Text>
          </View>

          <Text style={styles.cardTitle}>
            Teachers
          </Text>

          <Text style={styles.cardText}>
            Add and manage teacher accounts,
            subjects, departments and academic
            information.
          </Text>

          <Text style={styles.openText}>
            Open →
          </Text>
        </Pressable>

        {/* STAFF */}

        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
          onPress={() => onSelect('staff')}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              S
            </Text>
          </View>

          <Text style={styles.cardTitle}>
            Staff
          </Text>

          <Text style={styles.cardText}>
            Manage non-teaching staff,
            departments, designation,
            shifts and contact information.
          </Text>

          <Text style={styles.openText}>
            Open →
          </Text>
        </Pressable>

        {/* PARENTS */}

        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
          onPress={() => onSelect('parent')}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              P
            </Text>
          </View>

          <Text style={styles.cardTitle}>
            Parents
          </Text>

          <Text style={styles.cardText}>
            Manage parent information,
            relationship, occupation,
            contact and linked student details.
          </Text>

          <Text style={styles.openText}>
            Open →
          </Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C3358',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  card: {
    flexGrow: 1,
    flexBasis: 250,
    minHeight: 220,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E8EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  icon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C3358',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },

  cardText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 19,
    color: '#6B7280',
  },

  openText: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});