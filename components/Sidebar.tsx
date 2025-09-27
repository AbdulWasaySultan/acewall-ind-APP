import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { getUserInfo } from '../services/schoolService';

interface UserData {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  pronoun: string;
  gender: string;
  role: string;
  email: string;
  phone: string;
  homeAddress: string;
  mailingAddress: string;
  createdAt: string;
  updatedAt: string;
  profileImg?: { url: string };
}

interface SidebarProps {
  active: string;
  onSelect: (label: string) => void;
  user?: { 
    firstName?: string; 
    middleName?: string; 
    lastName?: string; 
    email?: string;
    role?: string;
    pronoun?: string;
    gender?: string;
    phone?: string;
    homeAddress?: string;
    mailingAddress?: string;
  };
  navigation: DrawerContentComponentProps['navigation'];
  onLogout: () => Promise<void>;
}

const teacherMenuItems = [
  { label: 'Dashboard', icon: require('../assets/jpg.jpg') },
  { label: 'My Courses', icon: require('../assets/jpg.jpg') },
  { label: 'Create Course', icon: require('../assets/jpg.jpg') },
  { label: 'Assessments', icon: require('../assets/jpg.jpg') },
  { label: 'Announcements', icon: require('../assets/jpg.jpg') },
  { label: 'Messages', icon: require('../assets/jpg.jpg') },
  { label: 'Students', icon: require('../assets/jpg.jpg') },
  { label: 'Discussions', icon: require('../assets/jpg.jpg') },
  { label: 'Support', icon: require('../assets/jpg.jpg') },
  { label: 'Account Information', icon: require('../assets/jpg.jpg') },
];

const studentMenuItems = [
  { label: 'Dashboard', icon: require('../assets/jpg.jpg') },
  { label: 'My Courses', icon: require('../assets/jpg.jpg') },
  { label: 'My Assessments', icon: require('../assets/jpg.jpg') },
  { label: 'Announcements', icon: require('../assets/jpg.jpg') },
  { label: 'Messages', icon: require('../assets/jpg.jpg') },
  { label: 'Gradebook', icon: require('../assets/jpg.jpg') },
  { label: 'Discussions', icon: require('../assets/jpg.jpg') },
  { label: 'Account Information', icon: require('../assets/jpg.jpg') },
];

const Sidebar: React.FC<SidebarProps> = ({ active, onSelect, navigation, onLogout }) => {
  const { userRole } = useAuth();
  const { user, setUser } = useUser();

  const menuItems = userRole === 'student' ? studentMenuItems : teacherMenuItems;

  // Fetch latest user info whenever sidebar is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchLatestUserInfo = async () => {
        try {
          const response = await getUserInfo();
          if (response && response.user) {
            setUser(response.user);
          }
        } catch (error) {
          console.error('Error fetching latest user info in sidebar:', error);
          // Don't show error to user as this is a background update
        }
      };

      fetchLatestUserInfo();
    }, [setUser])
  );

  const handleNavigation = (label: string) => {
    onSelect(label);
    let screenName = label.replace(/ /g, '');
    if (label === 'My Assessments') {
      screenName = 'Assessments';
    } else if (label === 'My Courses') {
      screenName = 'MyCourses';
    }
    if (label === 'Discussions') {
      screenName = 'Discussions';
    }
    if (label === 'Support') {
      screenName = 'Support';
    }
    navigation.navigate(screenName);
    navigation.closeDrawer();
  };

  const getFullName = (userObj: any) => {
    if (!userObj) return 'No Name';
    const parts = [userObj.firstName, userObj.middleName, userObj.lastName].filter(Boolean);
    return parts.join(' ') || 'No Name';
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.userSection}>
            <TouchableOpacity onPress={() => handleNavigation('Account Information')}>
              <Image source={user && user.profileImg && user.profileImg.url ? { uri: user.profileImg.url } : require('../assets/placeholder.png')} style={styles.avatar} />
            </TouchableOpacity>
            <Text style={styles.username}>{getFullName(user)}</Text>
            <Text style={styles.email}>{user?.email || 'No Email'}</Text>
            <Text style={styles.role}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, active === item.label && styles.activeMenuItem]}
              onPress={() => handleNavigation(item.label)}
            >
              <Text style={[styles.menuText, active === item.label && styles.activeMenuText]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutButton]}
        onPress={onLogout}
      >
        <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 50,
    marginBottom: 16,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  email: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  menu: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  activeMenuItem: {
    backgroundColor: '#10B144',
  },
  menuText: {
    fontSize: 18,
    color: '#10B144',
    marginLeft: 8,
  },
  activeMenuText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#ff4444',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});

export default Sidebar; 