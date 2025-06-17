import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  Bell,
  Eye,
  Lock,
  Database,
  Download,
  Trash2,
  Settings as SettingsIcon,
  Users,
  Mail,
  Globe,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function UserSettingsScreen() {
  const { user, profile } = useAuth();
  const screenSize = useResponsive();
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    dataSharing: false,
    publicProfile: false,
    twoFactorAuth: false,
    sessionTimeout: true,
    auditLogging: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend
  };

  const handleExportData = () => {
    Alert.alert(
      'Export User Data',
      'This will generate a comprehensive report of all user data in the system.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Success', 'Data export has been initiated. You will receive an email when ready.');
        }},
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached user data and may improve performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => {
          Alert.alert('Success', 'Cache cleared successfully.');
        }},
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all user management settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          setSettings({
            emailNotifications: true,
            pushNotifications: true,
            securityAlerts: true,
            dataSharing: false,
            publicProfile: false,
            twoFactorAuth: false,
            sessionTimeout: true,
            auditLogging: true,
          });
          Alert.alert('Success', 'Settings reset to defaults.');
        }},
      ]
    );
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          subtitle: 'Receive email updates about user activities',
          value: settings.emailNotifications,
        },
        {
          key: 'pushNotifications',
          title: 'Push Notifications',
          subtitle: 'Get real-time notifications for important events',
          value: settings.pushNotifications,
        },
        {
          key: 'securityAlerts',
          title: 'Security Alerts',
          subtitle: 'Immediate alerts for security-related events',
          value: settings.securityAlerts,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      settings: [
        {
          key: 'twoFactorAuth',
          title: 'Two-Factor Authentication',
          subtitle: 'Require 2FA for admin actions',
          value: settings.twoFactorAuth,
        },
        {
          key: 'sessionTimeout',
          title: 'Session Timeout',
          subtitle: 'Automatically log out inactive sessions',
          value: settings.sessionTimeout,
        },
        {
          key: 'auditLogging',
          title: 'Audit Logging',
          subtitle: 'Log all administrative actions',
          value: settings.auditLogging,
        },
      ],
    },
    {
      title: 'Data Management',
      icon: Database,
      settings: [
        {
          key: 'dataSharing',
          title: 'Anonymous Data Sharing',
          subtitle: 'Share anonymized usage data for improvements',
          value: settings.dataSharing,
        },
        {
          key: 'publicProfile',
          title: 'Public User Profiles',
          subtitle: 'Allow users to make their profiles public',
          value: settings.publicProfile,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={800}>
        {/* Header */}
        <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, screenSize.isDesktop && styles.headerTitleDesktop]}>
            User Management Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Settings Sections */}
          {settingSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            
            return (
              <View key={sectionIndex} style={[styles.section, screenSize.isDesktop && styles.sectionDesktop]}>
                <View style={styles.sectionHeader}>
                  <SectionIcon size={20} color="#2563EB" />
                  <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
                    {section.title}
                  </Text>
                </View>

                <View style={styles.settingsContainer}>
                  {section.settings.map((setting, settingIndex) => (
                    <View key={setting.key} style={styles.settingItem}>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, screenSize.isDesktop && styles.settingTitleDesktop]}>
                          {setting.title}
                        </Text>
                        <Text style={[styles.settingSubtitle, screenSize.isDesktop && styles.settingSubtitleDesktop]}>
                          {setting.subtitle}
                        </Text>
                      </View>
                      <Switch
                        value={setting.value}
                        onValueChange={(value) => handleSettingChange(setting.key, value)}
                        trackColor={{ false: '#F1F5F9', true: '#DBEAFE' }}
                        thumbColor={setting.value ? '#2563EB' : '#94A3B8'}
                      />
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {/* System Actions */}
          <View style={[styles.section, screenSize.isDesktop && styles.sectionDesktop]}>
            <View style={styles.sectionHeader}>
              <SettingsIcon size={20} color="#2563EB" />
              <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
                System Actions
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
                <Download size={20} color="#10B981" />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Export User Data</Text>
                  <Text style={styles.actionSubtitle}>Download comprehensive user data report</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
                <Database size={20} color="#F59E0B" />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Clear Cache</Text>
                  <Text style={styles.actionSubtitle}>Clear cached user data and improve performance</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleResetSettings}>
                <Trash2 size={20} color="#EF4444" />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Reset Settings</Text>
                  <Text style={styles.actionSubtitle}>Reset all settings to default values</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Information */}
          <View style={[styles.section, screenSize.isDesktop && styles.sectionDesktop]}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color="#2563EB" />
              <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
                System Information
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>System Version</Text>
                <Text style={styles.infoValue}>v2.1.0</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Database Version</Text>
                <Text style={styles.infoValue}>PostgreSQL 15.3</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Backup</Text>
                <Text style={styles.infoValue}>2 hours ago</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Uptime</Text>
                <Text style={styles.infoValue}>15 days, 4 hours</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              User management settings control how the system handles user data, notifications, and security policies.
            </Text>
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerDesktop: {
    paddingVertical: 24,
    paddingHorizontal: 0,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  headerTitleDesktop: {
    fontSize: 24,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionDesktop: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  sectionTitleDesktop: {
    fontSize: 20,
    marginLeft: 12,
  },
  settingsContainer: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingTitleDesktop: {
    fontSize: 18,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  settingSubtitleDesktop: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});