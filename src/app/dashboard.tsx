import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { student, logout, isLoading } = useAuth();

  const isMobile = width < 600;

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Loading student information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            Student information not available
          </Text>

          <Text style={styles.errorText}>
            Please login again to continue.
          </Text>

          <TouchableOpacity
            style={styles.loginAgainButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.loginAgainText}>
              Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  const fields = [
    ['Student ID', student.id],
    ['Family ID', student.family_id],
    ['MVA ID', student.mva_id],
    ['First Name', student.first_name],
    ['Middle Name', student.middle_name],
    ['Last Name', student.last_name],
    ['Date of Birth', student.date_of_birth],
    ['Section', student.section],
    ['Gender', student.gender],
    ['Date of Admission', student.date_of_admission],
    ['Joining Academic Year', student.joining_academic_year],
    ['Academic Year', student.academic_year],
    ['Joining Class', student.joining_class],
    ['Home Residential Address', student.home_residential_address],
    ['Pincode', student.pincode],
    ['Aadhaar Number', student.aadhar_number],
    ['Student Type', student.student_type],
    ['Previous School', student.previous_school],
    ['Nationality', student.nationality],
    ['Staff Child', student.staff_child],
    ['Caste Category', student.caste_category],
    ['Caste', student.caste],
    ['Student Email', student.student_email],
    ['Mobile Number', student.mobile_no],
    ['APAAR ID', student.apaar_id],
    ['City', student.city],
    ['State', student.state],
    ['Student Image', student.student_image],
    ['Created At', student.created_at],
    ['Updated At', student.updated_at],
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            isMobile && styles.mobileContent,
          ]}
          showsVerticalScrollIndicator={true}
        >
          {/* HEADER */}
          <View
            style={[
              styles.header,
              isMobile && styles.mobileHeader,
            ]}
          >
            {/* Top row */}
            <View style={styles.headerTopRow}>
              <Text style={styles.logo}>
                MVA ONE
              </Text>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text
              style={[
                styles.title,
                isMobile && styles.mobileTitle,
              ]}
            >
              Student Dashboard
            </Text>

            {/* Welcome */}
            <Text style={styles.subtitle}>
              Welcome, {fullName || 'Student'}
            </Text>
          </View>

          {/* STUDENT RECORD TABLE */}
          <View style={styles.card}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>
                Student Information
              </Text>
            </View>

            {fields.map(([label, value], index) => (
              <View
                key={String(label)}
                style={[
                  styles.row,
                  index % 2 === 0 && styles.rowAlternate,
                ]}
              >
                <View
                  style={[
                    styles.labelCell,
                    isMobile && styles.mobileLabelCell,
                  ]}
                >
                  <Text style={styles.labelText}>
                    {label}
                  </Text>
                </View>

                <View
                  style={[
                    styles.valueCell,
                    isMobile && styles.mobileValueCell,
                  ]}
                >
                  <Text style={styles.valueText}>
                    {value !== null &&
                    value !== undefined &&
                    value !== ''
                      ? String(value)
                      : 'Not available'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: 32,
    paddingTop: 20,
    paddingBottom: 24,
  },

  mobileContent: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  /*
   * Header
   */
  header: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  mobileHeader: {
    padding: 16,
    marginBottom: 20,
  },

  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },

  title: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  mobileTitle: {
    marginTop: 14,
    fontSize: 26,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6B7280',
  },

  logoutButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },

  /*
   * Student information card
   */
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },

  tableHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },

  tableHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 54,
  },

  rowAlternate: {
    backgroundColor: '#F9FAFB',
  },

  labelCell: {
    width: '35%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  mobileLabelCell: {
    width: '40%',
    paddingHorizontal: 12,
  },

  valueCell: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },

  mobileValueCell: {
    paddingHorizontal: 12,
  },

  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  valueText: {
    fontSize: 14,
    color: '#111827',
  },

  /*
   * Empty / error state
   */
  center: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  loginAgainButton: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  loginAgainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});