import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ManageUserOptions from '../components/admin/role-users/ManageUserOptions';
import TeacherManagement from '../components/admin/role-users/TeacherManagement';
import StaffManagement from '../components/admin/role-users/StaffManagement';
import ParentManagement from '../components/admin/role-users/ParentManagement';

import AdminSidebar from '../components/admin/AdminSidebar';
import StudentRecordsScreen from '../components/admin/student-records/StudentRecordsScreen';
import StudentRecordsHome from '../components/admin/student-records/StudentRecordsHome';
import AddStudentScreen from '../components/admin/student-records/AddStudentScreen';
import StudentDetailsScreen from '../components/admin/student-records/StudentDetailsScreen';
import {
  getAdminSession,
  logoutAdmin,
} from '../services/adminAuthService';

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [studentRecordsView, setStudentRecordsView] =
  useState<'home' | 'add' | 'details'>('home');

  const [activeKey, setActiveKey] =
    useState('dashboard');

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  useEffect(() => {
    let active = true;

    getAdminSession()
      .then((session) => {
        if (active && !session) {
          router.replace('/admin-login');
        }
      })
      .catch(() => {
        if (active) {
          router.replace('/admin-login');
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  const isMobile = width < 900;
  const isAndroidMobile =
    Platform.OS === 'android' && width < 700;

  const handleNavigate = (key: string) => {
  setActiveKey(key);

  if (key === 'manage-users') {
    setManageUserScreen('options');
  }
};

  const [manageUserScreen, setManageUserScreen] =
  useState<'options' | 'teacher' | 'staff' | 'parent'>(
    'options'
  );

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logoutAdmin();

      router.replace('/admin-login');
    } catch (error) {
      console.error(
        'ADMIN LOGOUT ERROR:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to logout. Please try again.';

      Alert.alert(
        'Logout Failed',
        message
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeKey) {
      case 'student-records':
       
  if (studentRecordsView === 'add') {
    return (
      <AddStudentScreen
        onBack={() =>
          setStudentRecordsView('home')
        }
      />
    );
  }
   if (studentRecordsView === 'details') {
    return (
      <StudentDetailsScreen
        onBack={() =>
          setStudentRecordsView('home')
        }
      />
    );
  }
  return (
   <StudentRecordsHome
  onBack={() =>
    setActiveKey('dashboard')
  }
  onAddStudent={() =>
    setStudentRecordsView('add')
  }
  onOpenRecords={() =>
    setStudentRecordsView('details')
  }
/>
  );

      case 'manage-students':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>
              Manage Students
            </Text>

            <Text style={styles.contentText}>
              Add, edit, view and manage
              students from here.
            </Text>
          </View>
        );

     case 'manage-users':
  return (
    <>
      {manageUserScreen === 'options' && (
        <ManageUserOptions
          onSelect={(type) => {
            setManageUserScreen(type);
          }}
        />
      )}

      {manageUserScreen === 'teacher' && (
        <TeacherManagement
          onBack={() => {
            setManageUserScreen('options');
          }}
        />
      )}

      {manageUserScreen === 'staff' && (
        <StaffManagement
          onBack={() => {
            setManageUserScreen('options');
          }}
        />
      )}

      {manageUserScreen === 'parent' && (
        <ParentManagement
          onBack={() => {
            setManageUserScreen('options');
          }}
        />
      )}
    </>
  );

      case 'settings':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>
              Settings
            </Text>

            <Text style={styles.contentText}>
              Admin and system settings will
              be added here.
            </Text>
          </View>
        );

      case 'support':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>
              Support
            </Text>

            <Text style={styles.contentText}>
              MVA-ONE support information will
              be available here.
            </Text>
          </View>
        );

      default:
        return (
          <>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>
                Welcome to MVA-ONE
              </Text>

              <Text style={styles.welcomeText}>
                Admin Administration Portal
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  —
                </Text>

                <Text style={styles.statLabel}>
                  Students
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  —
                </Text>

                <Text style={styles.statLabel}>
                  Teachers
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  —
                </Text>

                <Text style={styles.statLabel}>
                  Staff
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  —
                </Text>

                <Text style={styles.statLabel}>
                  Parents
                </Text>
              </View>
            </View>

            <View style={styles.quickAccessCard}>
              <Text style={styles.sectionTitle}>
                QUICK ACCESS
              </Text>

              <View
                style={[
                  styles.quickRow,
                  isMobile &&
                    styles.quickRowMobile,
                ]}
              >
                <Pressable
                  style={styles.quickButton}
                  onPress={() =>
                    handleNavigate(
                      'manage-students'
                    )
                  }
                >
                  <Text
                    style={styles.quickButtonText}
                  >
                    Manage Students
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.quickButton}
                  onPress={() =>
                    handleNavigate(
                      'manage-users'
                    )
                  }
                >
                  <Text
                    style={styles.quickButtonText}
                  >
                    Manage Users
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.quickButton}
                  onPress={() =>
                    handleNavigate(
                      'settings'
                    )
                  }
                >
                  <Text
                    style={styles.quickButtonText}
                  >
                    Profile / Settings
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      {isAndroidMobile ? (
        <View
          style={[
            styles.mobileTopBar,
            {
              paddingTop: insets.top + 8,
              minHeight: 70 + insets.top,
            },
          ]}
        >
          <View style={styles.mobileHeaderLeft}>
            <Pressable
              accessibilityLabel="Open admin menu"
              onPress={() =>
                setMobileSidebarOpen(true)
              }
              style={styles.mobileMenuButton}
              hitSlop={8}
            >
              <View style={styles.mobileMenuLine} />
              <View style={styles.mobileMenuLine} />
              <View style={styles.mobileMenuLine} />
            </Pressable>

            <View>
            <Text style={styles.mobileBrand}>
              MVA-ONE
            </Text>

            <Text style={styles.mobilePortal}>
              ADMIN PORTAL
            </Text>
            </View>
          </View>

          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={styles.mobileLogout}
          >
            {loggingOut ? (
              <ActivityIndicator
                color="#FFFFFF"
                size="small"
              />
            ) : (
              <Text
                style={styles.mobileLogoutText}
              >
                Logout
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {isAndroidMobile ? (
        <AdminSidebar
          activeKey={activeKey}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() =>
            setMobileSidebarOpen(false)
          }
        />
      ) : null}

      <View style={styles.body}>
        {!isAndroidMobile ? (
          <AdminSidebar
            activeKey={activeKey}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        ) : null}

       <View style={styles.main}>
  <View style={styles.topHeader}>

    {/* MOBILE MENU BUTTON */}
    {/* {isMobile ? (
      <Pressable
        style={styles.mobileMenuButton}
        onPress={() => setMobileSidebarOpen(true)}
      >
        <Text style={styles.mobileMenuIcon}>☰</Text>
      </Pressable>
    ) : null} */}

    {/* PAGE TITLE */}
    <View style={styles.headerTitleContainer}>
      <Text
        style={[
          styles.pageTitle,
          isMobile && styles.pageTitleMobile,
        ]}
        numberOfLines={1}
      >
        {activeKey === 'dashboard'
          ? 'Dashboard'
          : activeKey === 'student-records'
          ? 'Student Records'
          : activeKey === 'manage-students'
          ? 'Manage Students'
          : activeKey === 'manage-users'
          ? 'Manage Users'
          : activeKey === 'settings'
          ? 'Settings'
          : 'Support'}
      </Text>

      <Text
        style={[
          styles.pageSubtitle,
          isMobile && styles.pageSubtitleMobile,
        ]}
        numberOfLines={1}
      >
        MVA-ONE Administration
      </Text>
    </View>

    {/* ADMIN BADGE */}
    {!isMobile ? (
      <View style={styles.adminBadge}>
        <Text style={styles.adminBadgeText}>
          ADMIN
        </Text>
      </View>
    ) : null}

  </View>

  <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {renderContent()}
  </ScrollView>
</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  body: {
    flex: 1,
    flexDirection: 'row',
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  topHeader: {
    minHeight: 82,
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  adminBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: '#E8EEF7',
  },

  adminBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1C3358',
    letterSpacing: 1,
  },

  scroll: {
    flex: 1,
  },

 scrollContent: {
  padding: 20,
  paddingBottom: 40,
  width: '100%',
},

  welcomeCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C3358',
  },

  welcomeText: {
    marginTop: 7,
    fontSize: 13,
    color: '#6B7280',
  },

  statsGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statCard: {
    flexGrow: 1,
    minWidth: 150,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1C3358',
  },

  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  quickAccessCard: {
    marginTop: 18,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.8,
  },

  quickRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  quickRowMobile: {
    flexDirection: 'column',
  },

  quickButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#1C3358',
    justifyContent: 'center',
  },

  quickButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  contentCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },

  contentTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C3358',
  },

  contentText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  mobileTopBar: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C3358',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  mobileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  mobileMenuButton: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#294565',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileMenuLine: {
    width: 19,
    height: 2,
    marginVertical: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },

  mobileBrand: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  mobilePortal: {
    marginTop: 2,
    color: '#C9D5E6',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  mobileLogout: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 7,
    justifyContent: 'center',
    backgroundColor: '#294565',
  },

  mobileLogoutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
mobileMenuIcon: {
  color: '#FFFFFF',
  fontSize: 23,
  fontWeight: '700',
},

headerTitleContainer: {
  flex: 1,
  minWidth: 0,
},

pageTitleMobile: {
  fontSize: 20,
  lineHeight: 25,
},

pageSubtitleMobile: {
  fontSize: 10,
  lineHeight: 15,
},
});