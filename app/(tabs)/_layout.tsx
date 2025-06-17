import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, Pill, Calendar, User, FileText, Crown, Users } from 'lucide-react-native';
import { AuthGuard } from '@/components/AuthGuard';
import { OfflineNotice } from '@/components/OfflineNotice';
import { View } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { isDesktop } = useResponsive();
  const { user } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <AuthGuard>
      <View style={{ flex: 1 }}>
        <OfflineNotice />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#64748B',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E2E8F0',
              height: isDesktop ? 72 : Platform.OS === 'ios' ? 88 : 64,
              paddingBottom: isDesktop ? 12 : Platform.OS === 'ios' ? 20 : 8,
              paddingTop: isDesktop ? 12 : 8,
              paddingHorizontal: isDesktop ? 24 : 0,
            },
            tabBarLabelStyle: {
              fontFamily: 'Inter-Medium',
              fontSize: isDesktop ? 14 : 12,
              marginTop: isDesktop ? 4 : 0,
            },
            tabBarIconStyle: {
              marginBottom: isDesktop ? 4 : 0,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ size, color }) => (
                <Home size={isDesktop ? 24 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="medications"
            options={{
              title: 'Medications',
              tabBarIcon: ({ size, color }) => (
                <Pill size={isDesktop ? 24 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="schedule"
            options={{
              title: 'Schedule',
              tabBarIcon: ({ size, color }) => (
                <Calendar size={isDesktop ? 24 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="reports"
            options={{
              title: 'Reports',
              tabBarIcon: ({ size, color }) => (
                <FileText size={isDesktop ? 24 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="subscription"
            options={{
              title: 'Premium',
              tabBarIcon: ({ size, color }) => (
                <Crown size={isDesktop ? 24 : size} color={color} />
              ),
            }}
          />
          {isAdmin && (
            <Tabs.Screen
              name="users"
              options={{
                title: 'Users',
                tabBarIcon: ({ size, color }) => (
                  <Users size={isDesktop ? 24 : size} color={color} />
                ),
              }}
            />
          )}
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ size, color }) => (
                <User size={isDesktop ? 24 : size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </AuthGuard>
  );
}