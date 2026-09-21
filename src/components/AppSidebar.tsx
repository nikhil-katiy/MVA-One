import React from 'react';
import {
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

export default function AppSidebar() {
  const router = useRouter();

  return (
    <View style={styles.sidebar}>
      <View>
        <View style={styles.brand}>
          <Text style={styles.logo}>MVA ONE</Text>
          <Text style={styles.subtitle}>Student Management</Text>
        </View>

        <View style={styles.divider} />

        {menuItems.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View>
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
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },

  brand: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },

  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  menuItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },

  icon: {
    width: 28,
    fontSize: 18,
  },

  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  admin: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },

  logout: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  logoutIcon: {
    width: 28,
    fontSize: 17,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});