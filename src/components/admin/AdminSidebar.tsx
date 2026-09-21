import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type MenuItem = {
  key: string;
  label: string;
};

type Props = {
  activeKey: string;
  onNavigate: (key: string) => void;
  onLogout: () => void;

  // Mobile drawer control
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
  },
  {
    key: 'student-records',
    label: 'Student Records',
  },
  {
    key: 'manage-students',
    label: 'Manage Students',
  },
  {
    key: 'manage-users',
    label: 'Manage Users',
  },
  {
    key: 'settings',
    label: 'Settings',
  },
  {
    key: 'support',
    label: 'Support',
  },
];

export default function AdminSidebar({
  activeKey,
  onNavigate,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}: Props) {
  const { width } = useWindowDimensions();

  // Android MOBILE only
  const isAndroidMobile =
    Platform.OS === 'android' && width < 700;

  /*
   * Android mobile:
   * Sidebar is hidden until hamburger is clicked.
   */
  if (isAndroidMobile && !mobileOpen) {
    return null;
  }

  /*
   * Android mobile drawer
   */
  if (isAndroidMobile) {
    return (
      <View style={styles.mobileLayer}>
        {/* DARK OVERLAY */}
        <Pressable
          style={styles.mobileOverlay}
          onPress={onCloseMobile}
        />

        {/* DRAWER */}
        <View style={styles.mobileSidebar}>
          <View style={styles.mobileBrand}>
            <View>
              <Text style={styles.brandTitle}>
                MVA-ONE
              </Text>

              <Text style={styles.brandSubtitle}>
                ADMIN PORTAL
              </Text>
            </View>

            {/* CLOSE */}
            <Pressable
              onPress={onCloseMobile}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={
              styles.menuScrollContent
            }
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>
              MAIN MENU
            </Text>

            {menuItems.map((item) => {
              const active =
                activeKey === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    onNavigate(item.key);
                    onCloseMobile?.();
                  }}
                  style={[
                    styles.menuItem,
                    active &&
                      styles.menuItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.menuText,
                      active &&
                        styles.menuTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* LOGOUT */}
          <View style={styles.bottomSection}>
            <View style={styles.divider} />

            <Pressable
              onPress={() => {
                onCloseMobile?.();
                onLogout();
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed &&
                  styles.logoutPressed,
              ]}
            >
              <Text style={styles.logoutText}>
                Logout
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  /*
   * WEB + TABLET
   * Existing sidebar style remains.
   */
  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Text style={styles.brandTitle}>
          MVA-ONE
        </Text>

        <Text style={styles.brandSubtitle}>
          ADMIN PORTAL
        </Text>
      </View>

      <ScrollView
        style={styles.menuScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          MAIN MENU
        </Text>

        {menuItems.map((item) => {
          const active =
            activeKey === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() =>
                onNavigate(item.key)
              }
              style={[
                styles.menuItem,
                active &&
                  styles.menuItemActive,
              ]}
            >
              <Text
                style={[
                  styles.menuText,
                  active &&
                    styles.menuTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.divider} />

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed &&
              styles.logoutPressed,
          ]}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =========================
     DESKTOP / TABLET
  ========================= */

  sidebar: {
    width: 250,
    backgroundColor: '#1C3358',
    paddingTop: 28,
    paddingBottom: 20,
  },

  brand: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  brandSubtitle: {
    marginTop: 5,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  menuScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },

  menuScrollContent: {
    paddingBottom: 20,
  },

  sectionTitle: {
    marginHorizontal: 10,
    marginBottom: 8,

    color: '#AFC0D8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  menuItem: {
    minHeight: 46,

    paddingHorizontal: 14,
    marginBottom: 5,

    borderRadius: 8,

    justifyContent: 'center',
  },

  menuItemActive: {
    backgroundColor: '#FFFFFF',
  },

  menuText: {
    color: '#E5EDF7',
    fontSize: 13,
    fontWeight: '700',
  },

  menuTextActive: {
    color: '#1C3358',
  },

  bottomSection: {
    paddingHorizontal: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#3C5270',
    marginBottom: 10,
  },

  logoutButton: {
    minHeight: 44,

    paddingHorizontal: 14,

    borderRadius: 8,

    justifyContent: 'center',
  },

  logoutPressed: {
    backgroundColor: '#294565',
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* =========================
     MOBILE DRAWER
  ========================= */

  mobileLayer: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 999,
    elevation: 999,
  },

  mobileOverlay: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  mobileSidebar: {
    width: '82%',
    maxWidth: 330,

    height: '100%',

    backgroundColor: '#1C3358',

    paddingTop: 45,
    paddingBottom: 20,

    elevation: 20,

    shadowOffset: {
      width: 4,
      height: 0,
    },

    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  mobileBrand: {
    paddingHorizontal: 20,
    paddingBottom: 24,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeButton: {
    width: 38,
    height: 38,

    borderRadius: 8,

    backgroundColor: '#294565',

    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '300',
    lineHeight: 30,
  },
});