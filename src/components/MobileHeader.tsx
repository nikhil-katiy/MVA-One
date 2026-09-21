import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRouter} from 'expo-router';

const menuItems = [
  {label: 'Dashboard', icon: '🏠', route: '/'},
  {label: 'Students', icon: '👨‍🎓', route: '/students'},
  {label: 'Families', icon: '👪', route: '/families'},
  {label: 'Classes', icon: '🏫', route: '/classes'},
  {label: 'Health', icon: '🩺', route: '/health'},
  {label: 'Bank Details', icon: '🏦', route: '/bank-details'},
  {label: 'Staff', icon: '👨‍💼', route: '/staff'},
  {label: 'Academics', icon: '📚', route: '/academics'},
  {label: 'Reports', icon: '📊', route: '/reports'},
  {label: 'Notifications', icon: '🔔', route: '/notifications'},
  {label: 'Settings', icon: '⚙️', route: '/settings'},
];

export default function MobileHeader() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigation = (route: string) => {
    setDrawerOpen(false);
    router.push(route as any);
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setDrawerOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.brand}>
          <Text style={styles.logo}>MVA ONE</Text>
          <Text style={styles.subtitle}>Student Management</Text>
        </View>

        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.overlay}
            onPress={() => setDrawerOpen(false)}
          />

          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerLogo}>MVA ONE</Text>
                <Text style={styles.drawerSubtitle}>
                  Student Management
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setDrawerOpen(false)}
                style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.menu}>
              {menuItems.map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.divider} />

              <View style={styles.admin}>
                <Text style={styles.adminIcon}>👤</Text>

                <View>
                  <Text style={styles.adminName}>Admin</Text>
                  <Text style={styles.adminRole}>Administrator</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.logout}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  menuButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuIcon: {
    fontSize: 22,
  },

  brand: {
    flex: 1,
    marginLeft: 8,
  },

  logo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 19,
  },

  modalContainer: {
  flex: 1,
  position: 'relative',
},

overlay: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  zIndex: 1,
},

drawer: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 285,
  backgroundColor: '#FFFFFF',
  paddingTop: 24,
  paddingHorizontal: 16,
  zIndex: 2,
  elevation: 10,
},

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  drawerLogo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  drawerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: 18,
    color: '#374151',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  menu: {
    flex: 1,
  },

  menuItem: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },


  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  bottomSection: {
    paddingBottom: 20,
  },

  admin: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  adminIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  adminName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  adminRole: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  logout: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  logoutIcon: {
    width: 30,
    fontSize: 17,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});