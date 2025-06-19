import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Home, Pill, Calendar, User, FileText, Users } from 'lucide-react-native';
import { AuthGuard } from '@/components/AuthGuard';
import { OfflineNotice } from '@/components/OfflineNotice';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/hooks/useAuth';
import { DesignSystem } from '@/constants/DesignSystem';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const { isDesktop } = useResponsive();
  const { isAdmin } = useAuth();

  return (
    <AuthGuard>
      <View style={{ flex: 1 }}>
        <OfflineNotice />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: DesignSystem.colors.primary.blue,
            tabBarInactiveTintColor: DesignSystem.colors.text.secondary,
            tabBarStyle: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderTopWidth: 1,
              borderTopColor: DesignSystem.colors.interactive.border,
              height: isDesktop ? 72 : Platform.OS === 'ios' ? 88 : 64,
              paddingBottom: isDesktop ? 12 : Platform.OS === 'ios' ? 20 : 8,
              paddingTop: isDesktop ? 12 : 8,
              paddingHorizontal: isDesktop ? 24 : 0,
              borderTopLeftRadius: DesignSystem.borderRadius.xl,
              borderTopRightRadius: DesignSystem.borderRadius.xl,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              ...DesignSystem.shadows.card,
            },
            tabBarBackground: () => (
              <BlurView 
                intensity={20} 
                tint="light" 
                style={{ 
                  flex: 1,
                  borderTopLeftRadius: DesignSystem.borderRadius.xl,
                  borderTopRightRadius: DesignSystem.borderRadius.xl,
                  overflow: 'hidden',
                }} 
              />
            ),
            tabBarLabelStyle: {
              fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
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