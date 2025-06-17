import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Activity as ActivityIcon, Clock, User, Shield, LogIn, LogOut, Settings, Trash2, CreditCard as Edit, Plus, Filter, Calendar } from 'lucide-react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function UserActivityScreen() {
  const screenSize = useResponsive();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'security' | 'admin' | 'user'>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          action: 'user.login',
          description: 'User logged in successfully',
          ip_address: '192.168.1.100',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          severity: 'low',
        },
        {
          id: '2',
          user_id: 'admin1',
          user_name: 'Admin User',
          user_email: 'admin@example.com',
          action: 'user.role_changed',
          description: 'Changed user role from user to premium',
          ip_address: '192.168.1.101',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          severity: 'medium',
        },
        {
          id: '3',
          user_id: 'user2',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          action: 'user.profile_updated',
          description: 'Updated profile information',
          ip_address: '192.168.1.102',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          severity: 'low',
        },
        {
          id: '4',
          user_id: 'admin1',
          user_name: 'Admin User',
          user_email: 'admin@example.com',
          action: 'user.deleted',
          description: 'Deleted user account: test@example.com',
          ip_address: '192.168.1.101',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          severity: 'high',
        },
        {
          id: '5',
          user_id: 'user3',
          user_name: 'Bob Wilson',
          user_email: 'bob@example.com',
          action: 'security.failed_login',
          description: 'Failed login attempt (invalid password)',
          ip_address: '192.168.1.103',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          severity: 'medium',
        },
        {
          id: '6',
          user_id: 'system',
          user_name: 'System',
          user_email: 'system@safemeds.app',
          action: 'system.backup',
          description: 'Automated database backup completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          severity: 'low',
        },
      ];

      // Apply filter
      let filteredActivities = mockActivities;
      if (filter !== 'all') {
        filteredActivities = mockActivities.filter(activity => {
          switch (filter) {
            case 'security':
              return activity.action.startsWith('security.') || activity.severity === 'high' || activity.severity === 'critical';
            case 'admin':
              return activity.action.includes('role_changed') || activity.action.includes('deleted') || activity.action.includes('created');
            case 'user':
              return activity.action.startsWith('user.') && !activity.action.includes('role_changed') && !activity.action.includes('deleted');
            default:
              return true;
          }
        });
      }

      setActivities(filteredActivities);
      setLoading(false);
    }, 1000);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return LogIn;
    if (action.includes('logout')) return LogOut;
    if (action.includes('role_changed') || action.includes('admin')) return Shield;
    if (action.includes('profile') || action.includes('updated')) return Edit;
    if (action.includes('created')) return Plus;
    if (action.includes('deleted')) return Trash2;
    if (action.includes('settings')) return Settings;
    return User;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#7C2D12';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filters = [
    { key: 'all', label: 'All Activity' },
    { key: 'security', label: 'Security' },
    { key: 'admin', label: 'Admin Actions' },
    { key: 'user', label: 'User Actions' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={1000}>
        {/* Header */}
        <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, screenSize.isDesktop && styles.headerTitleDesktop]}>
            User Activity Log
          </Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterTab,
                filter === filterOption.key && styles.filterTabActive,
                screenSize.isDesktop && styles.filterTabDesktop
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                filter === filterOption.key && styles.filterTabTextActive,
                screenSize.isDesktop && styles.filterTabTextDesktop
              ]}>
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading activity log...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIcon size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No activity found</Text>
              <Text style={styles.emptySubtitle}>
                No activities match the selected filter
              </Text>
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {activities.map((activity) => {
                const ActionIcon = getActionIcon(activity.action);
                
                return (
                  <View key={activity.id} style={[styles.activityCard, screenSize.isDesktop && styles.activityCardDesktop]}>
                    <View style={styles.activityHeader}>
                      <View style={styles.activityIconContainer}>
                        <ActionIcon size={20} color="#2563EB" />
                      </View>
                      
                      <View style={styles.activityInfo}>
                        <Text style={[styles.activityDescription, screenSize.isDesktop && styles.activityDescriptionDesktop]}>
                          {activity.description}
                        </Text>
                        <View style={styles.activityMeta}>
                          <Text style={styles.activityUser}>
                            {activity.user_name} ({activity.user_email})
                          </Text>
                          {activity.ip_address && (
                            <Text style={styles.activityIP}>
                              • {activity.ip_address}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.activityRight}>
                        <View style={[
                          styles.severityBadge,
                          { backgroundColor: `${getSeverityColor(activity.severity)}20` }
                        ]}>
                          <Text style={[
                            styles.severityText,
                            { color: getSeverityColor(activity.severity) }
                          ]}>
                            {activity.severity}
                          </Text>
                        </View>
                        
                        <View style={styles.timeContainer}>
                          <Clock size={12} color="#94A3B8" />
                          <Text style={styles.timeText}>
                            {formatTimeAgo(activity.timestamp)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
  calendarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabDesktop: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  filterTabTextDesktop: {
    fontSize: 16,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  activitiesList: {
    gap: 12,
    paddingBottom: 32,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityCardDesktop: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
    marginRight: 12,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityDescriptionDesktop: {
    fontSize: 16,
    marginBottom: 6,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activityUser: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  activityIP: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 4,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  severityText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 4,
  },
});