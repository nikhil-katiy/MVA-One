import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type Props = {
  onBack?: () => void;
  onOpenRecords?: () => void;
  onAddStudent?: () => void;
};

export default function StudentRecordsHome({
  onBack,
  onOpenRecords,
  onAddStudent,
}: Props) {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  return (
    <View style={styles.container}>
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>S</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Student Records
            </Text>

            <Text style={styles.subtitle}>
              Manage student information and records
            </Text>
          </View>
        </View>

        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* OPTIONS */}
      <View
        style={[
          styles.optionsContainer,
          isMobile && styles.optionsContainerMobile,
        ]}
      >
        {/* STUDENT DETAILS */}
        <Pressable
          onPress={onOpenRecords}
          style={({ pressed }) => [
            styles.optionCard,
            pressed && styles.optionPressed,
          ]}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>
              ≡
            </Text>
          </View>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              Student Details
            </Text>

            <Text style={styles.optionDescription}>
              View all student records, search students,
              filter data and open student profiles.
            </Text>

            <View style={styles.optionAction}>
              <Text style={styles.optionActionText}>
                View Records →
              </Text>
            </View>
          </View>
        </Pressable>

        {/* ADD STUDENT */}
        <Pressable
          onPress={onAddStudent}
          style={({ pressed }) => [
            styles.optionCard,
            pressed && styles.optionPressed,
          ]}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>
              +
            </Text>
          </View>

          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              Add Student
            </Text>

            <Text style={styles.optionDescription}>
              Create a new student record and enter
              complete student information.
            </Text>

            <View style={styles.optionAction}>
              <Text style={styles.optionActionText}>
                Add Student →
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* INFORMATION */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          Student Management
        </Text>

        <Text style={styles.infoText}>
          Use Student Details to view existing students.
          Use Add Student to create a new student record.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: '#F5F7FB',
  },

  /* =========================
     HEADER
  ========================= */

  headerCard: {
    minHeight: 92,
    paddingHorizontal: 22,
    paddingVertical: 18,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBox: {
    width: 48,
    height: 48,

    borderRadius: 12,

    backgroundColor: '#EAF0F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  iconText: {
    color: '#1C3358',
    fontSize: 22,
    fontWeight: '900',
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#172033',
    fontSize: 22,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },

  backButton: {
    minHeight: 40,
    paddingHorizontal: 15,

    borderRadius: 8,

    backgroundColor: '#1C3358',

    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  /* =========================
     OPTIONS
  ========================= */

  optionsContainer: {
    marginTop: 20,

    flexDirection: 'row',
    gap: 18,
  },

  optionsContainerMobile: {
    flexDirection: 'column',
  },

  optionCard: {
    flex: 1,

    minHeight: 190,

    padding: 22,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 14,

    flexDirection: 'row',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  optionPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.99 }],
  },

  optionIcon: {
    width: 48,
    height: 48,

    borderRadius: 12,

    backgroundColor: '#1C3358',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  optionIconText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '900',
  },

  optionDescription: {
    marginTop: 8,

    color: '#64748B',

    fontSize: 13,
    lineHeight: 20,
  },

  optionAction: {
    marginTop: 18,
  },

  optionActionText: {
    color: '#1C3358',
    fontSize: 13,
    fontWeight: '900',
  },

  /* =========================
     INFORMATION
  ========================= */

  infoCard: {
    marginTop: 20,

    padding: 20,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 14,
  },

  infoTitle: {
    color: '#1C3358',
    fontSize: 15,
    fontWeight: '900',
  },

  infoText: {
    marginTop: 7,

    color: '#64748B',

    fontSize: 13,
    lineHeight: 20,
  },
});