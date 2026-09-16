import React, {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type AdminDashboardProps = {
  onLogout: () => void;
  onStudentsPress: () => void;
  onAddStudent: () => void;
};

const menuItems = [
  {key: 'dashboard', label: 'Dashboard', icon: '⌂'},
  {key: 'students', label: 'Students', icon: '👨‍🎓'},
  {key: 'teachers', label: 'Teachers', icon: '👨‍🏫'},
  {key: 'attendance', label: 'Attendance', icon: '✓'},
  {key: 'fees', label: 'Fees', icon: '₹'},
  {key: 'reports', label: 'Reports', icon: '▤'},
  {key: 'settings', label: 'Settings', icon: '⚙'},
];

const AdminDashboard = ({
  onLogout,
  onStudentsPress,
  onAddStudent,
}: AdminDashboardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const {width} = Dimensions.get('window');

  // Landscape tablet / large screen
  const isLargeScreen = width >= 900;

  const handleMenuPress = (key: string) => {
    if (key === 'students') {
      setMenuOpen(false);
      onStudentsPress();
      return;
    }

    setMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={styles.container}>
        {/* =========================
            DESKTOP / TABLET SIDEBAR
           ========================= */}
        {isLargeScreen && (
          <View style={styles.sidebar}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>MVA ONE</Text>
              <Text style={styles.logoSubText}>Academy Management</Text>
            </View>

            <ScrollView
              style={styles.sidebarMenu}
              showsVerticalScrollIndicator={false}>
              {menuItems.map(item => {
                const active = item.key === 'dashboard';

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.sidebarItem,
                      active && styles.sidebarItemActive,
                    ]}
                    onPress={() => handleMenuPress(item.key)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.sidebarIcon,
                        active && styles.sidebarIconActive,
                      ]}>
                      {item.icon}
                    </Text>

                    <Text
                      style={[
                        styles.sidebarItemText,
                        active && styles.sidebarItemTextActive,
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={onLogout}
              activeOpacity={0.7}>
              <Text style={styles.logoutIcon}>↪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================
               MAIN CONTENT
           ========================= */}
        <View style={styles.mainContent}>
          {/* HEADER */}
          <View style={styles.header}>
            {!isLargeScreen && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuOpen(true)}
                activeOpacity={0.7}>
                <Text style={styles.menuButtonText}>☰</Text>
              </TouchableOpacity>
            )}

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>
                Academy Management System
              </Text>
            </View>

            <View style={styles.adminContainer}>
              <View style={styles.adminAvatar}>
                <Text style={styles.adminAvatarText}>A</Text>
              </View>

              <View style={styles.adminInfo}>
                <Text style={styles.adminName}>Admin</Text>
                <Text style={styles.adminRole}>Administrator</Text>
              </View>
            </View>
          </View>

          {/* CONTENT */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {/* WELCOME */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back, Admin 👋</Text>
              <Text style={styles.welcomeText}>
                Here's what's happening in your academy today.
              </Text>
            </View>

            {/* STAT CARDS */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.statCardMargin]}>
                <Text style={styles.statIcon}>👨‍🎓</Text>
                <Text style={styles.statValue}>120</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>

              <View style={[styles.statCard, styles.statCardMargin]}>
                <Text style={styles.statIcon}>👨‍🏫</Text>
                <Text style={styles.statValue}>15</Text>
                <Text style={styles.statLabel}>Total Teachers</Text>
              </View>

              <View style={[styles.statCard, styles.statCardMargin]}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Classes Today</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>✓</Text>
                <Text style={styles.statValue}>92%</Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
            </View>

            {/* QUICK ACTIONS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <View style={styles.quickActionsContainer}>
                {/* ADD STUDENT */}
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={onAddStudent}
                  activeOpacity={0.75}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>＋</Text>
                  </View>

                  <View>
                    <Text style={styles.actionTitle}>Add Student</Text>
                    <Text style={styles.actionSubtitle}>
                      Register a new student
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* MANAGE STUDENTS */}
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={onStudentsPress}
                  activeOpacity={0.75}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>👨‍🎓</Text>
                  </View>

                  <View>
                    <Text style={styles.actionTitle}>Manage Students</Text>
                    <Text style={styles.actionSubtitle}>
                      View and manage students
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* ATTENDANCE */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.75}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>✓</Text>
                  </View>

                  <View>
                    <Text style={styles.actionTitle}>Attendance</Text>
                    <Text style={styles.actionSubtitle}>
                      Manage today's attendance
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* RECENT ACTIVITY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>

              <View style={styles.activityCard}>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text>👨‍🎓</Text>
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      New student registered
                    </Text>
                    <Text style={styles.activityDescription}>
                      A new student was added to the academy.
                    </Text>
                  </View>

                  <Text style={styles.activityTime}>Today</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text>✓</Text>
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      Attendance updated
                    </Text>
                    <Text style={styles.activityDescription}>
                      Today's attendance has been updated.
                    </Text>
                  </View>

                  <Text style={styles.activityTime}>Today</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text>₹</Text>
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      Fee record updated
                    </Text>
                    <Text style={styles.activityDescription}>
                      Student fee information was updated.
                    </Text>
                  </View>

                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* =========================
             MOBILE/TABLET DRAWER
           ========================= */}
        {!isLargeScreen && menuOpen && (
          <View style={styles.drawerOverlay}>
            {/* Outside area */}
            <TouchableOpacity
              style={styles.drawerBackground}
              activeOpacity={1}
              onPress={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <View style={styles.drawer}>
              <View style={styles.drawerHeader}>
                <View>
                  <Text style={styles.drawerLogo}>MVA ONE</Text>
                  <Text style={styles.drawerSubLogo}>
                    Academy Management
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setMenuOpen(false)}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.drawerMenu}
                showsVerticalScrollIndicator={false}>
                {menuItems.map(item => {
                  const active = item.key === 'dashboard';

                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.drawerItem,
                        active && styles.drawerItemActive,
                      ]}
                      onPress={() => handleMenuPress(item.key)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.drawerIcon,
                          active && styles.drawerIconActive,
                        ]}>
                        {item.icon}
                      </Text>

                      <Text
                        style={[
                          styles.drawerItemText,
                          active && styles.drawerItemTextActive,
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* LOGOUT ALWAYS VISIBLE */}
              <TouchableOpacity
                style={styles.drawerLogout}
                onPress={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                activeOpacity={0.7}>
                <Text style={styles.drawerLogoutIcon}>↪</Text>
                <Text style={styles.drawerLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },

  /* SIDEBAR */

  sidebar: {
    width: 250,
    backgroundColor: '#111827',
    paddingTop: 25,
    paddingBottom: 20,
  },

  logoContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },

  logoSubText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },

  sidebarMenu: {
    flex: 1,
    paddingHorizontal: 12,
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 5,
  },

  sidebarItemActive: {
    backgroundColor: '#374151',
  },

  sidebarIcon: {
    width: 30,
    fontSize: 20,
    color: '#9ca3af',
    textAlign: 'center',
  },

  sidebarIconActive: {
    color: '#ffffff',
  },

  sidebarItemText: {
    fontSize: 15,
    color: '#9ca3af',
    marginLeft: 10,
    fontWeight: '500',
  },

  sidebarItemTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  logoutIcon: {
    fontSize: 21,
    color: '#fca5a5',
    width: 30,
    textAlign: 'center',
  },

  logoutText: {
    color: '#fca5a5',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },

  /* MAIN */

  mainContent: {
    flex: 1,
  },

  header: {
    height: 75,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  menuButton: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuButtonText: {
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 28,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },

  adminContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  adminAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminAvatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },

  adminInfo: {
    marginLeft: 10,
  },

  adminName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  adminRole: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },

  /* CONTENT */

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  welcomeSection: {
    marginBottom: 20,
  },

  welcomeTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },

  /* STATS */

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  statCardMargin: {
    marginRight: 10,
  },

  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },

  /* SECTIONS */

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },

  /* QUICK ACTIONS */

  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  actionCard: {
    flex: 1,
    minWidth: 230,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  actionIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  actionIcon: {
    fontSize: 21,
    color: '#111827',
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  actionSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 3,
  },

  /* ACTIVITY */

  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityContent: {
    flex: 1,
    marginLeft: 12,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  activityDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 3,
  },

  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  /* MOBILE DRAWER */

  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },

  drawerBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  drawer: {
    width: 285,
    backgroundColor: '#111827',
    paddingTop: 25,
    paddingBottom: 20,
  },

  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  drawerLogo: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },

  drawerSubLogo: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '300',
  },

  drawerMenu: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 15,
  },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 5,
  },

  drawerItemActive: {
    backgroundColor: '#374151',
  },

  drawerIcon: {
    width: 32,
    fontSize: 20,
    color: '#9ca3af',
    textAlign: 'center',
  },

  drawerIconActive: {
    color: '#ffffff',
  },

  drawerItemText: {
    fontSize: 15,
    color: '#9ca3af',
    marginLeft: 10,
    fontWeight: '500',
  },

  drawerItemTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  drawerLogout: {
    marginHorizontal: 12,
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },

  drawerLogoutIcon: {
    width: 32,
    fontSize: 21,
    color: '#fca5a5',
    textAlign: 'center',
  },

  drawerLogoutText: {
    fontSize: 15,
    color: '#fca5a5',
    fontWeight: '700',
    marginLeft: 10,
  },
});

export default AdminDashboard;