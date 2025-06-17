import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Search, Plus, Filter, MoveVertical as MoreVertical, Shield, Crown, Clock, Mail, Phone, MapPin } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { router } from 'expo-router';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function UsersScreen() {
  const { user: currentUser, profile } = useAuth();
  const { users, loading, searchUsers, getUserStats } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'admin'>('all');
  const [userStats, setUserStats] = useState({ total: 0, active: 0, admin: 0 });
  const screenSize = useResponsive();

  // Check if current user is admin
  const isAdmin = profile?.role === 'admin' || currentUser?.role === 'admin';

  useEffect(() => {
    // Only load data if user is admin
    if (isAdmin) {
      loadUsers();
      loadStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedFilter]);

  const loadUsers = async () => {
    try {
      await searchUsers('');
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(user => user.last_sign_in_at);
        break;
      case 'inactive':
        filtered = filtered.filter(user => !user.last_sign_in_at);
        break;
      case 'admin':
        filtered = filtered.filter(user => user.role === 'admin');
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/(tabs)/users/${userId}`);
  };

  const handleAddUser = () => {
    Alert.alert('Add User', 'This feature would open a user creation form.');
  };

  const formatLastSeen = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'Never';
    
    const date = new Date(lastSignIn);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#EF4444';
      case 'moderator': return '#F59E0B';
      case 'premium': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  const getUserRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'premium': return Crown;
      default: return null;
    }
  };

  const filters = [
    { key: 'all', label: 'All Users', count: userStats.total },
    { key: 'active', label: 'Active', count: userStats.active },
    { key: 'admin', label: 'Admins', count: userStats.admin },
    { key: 'inactive', label: 'Inactive', count: userStats.total - userStats.active },
  ];

  // Show unauthorized message if user is not admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <ResponsiveContainer maxWidth={1400}>
          <View style={styles.unauthorizedContainer}>
            <Shield size={64} color="#EF4444" />
            <Text style={styles.unauthorizedTitle}>Access Denied</Text>
            <Text style={styles.unauthorizedSubtitle}>
              You need administrator privileges to access user management.
            </Text>
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={1400}>
        <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
          <View style={styles.headerLeft}>
            <Users size={screenSize.isDesktop ? 32 : 24} color="#2563EB" />
            <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>
              User Management
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, screenSize.isDesktop && styles.addButtonDesktop]}
            onPress={handleAddUser}
          >
            <Plus size={screenSize.isDesktop ? 24 : 20} color="#FFFFFF" />
            {screenSize.isDesktop && (
              <Text style={styles.addButtonText}>Add User</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, screenSize.isDesktop && styles.searchContainerDesktop]}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={[styles.searchInput, screenSize.isDesktop && styles.searchInputDesktop]}
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive,
                screenSize.isDesktop && styles.filterTabDesktop
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.filterTabTextActive,
                screenSize.isDesktop && styles.filterTabTextDesktop
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                selectedFilter === filter.key && styles.filterCountActive
              ]}>
                <Text style={[
                  styles.filterCountText,
                  selectedFilter === filter.key && styles.filterCountTextActive
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Users List */}
        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search criteria' : 'No users match the selected filter'}
              </Text>
            </View>
          ) : (
            <View style={[
              styles.usersGrid,
              screenSize.isDesktop && styles.usersGridDesktop
            ]}>
              {filteredUsers.map((user) => {
                const RoleIcon = getUserRoleIcon(user.role || 'user');
                
                return (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userCard,
                      screenSize.isDesktop && styles.userCardDesktop
                    ]}
                    onPress={() => handleUserPress(user.id)}
                  >
                    <View style={styles.userCardHeader}>
                      <View style={styles.userAvatar}>
                        {user.avatar_url ? (
                          <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                        ) : (
                          <Text style={styles.avatarText}>
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </Text>
                        )}
                        {user.is_online && <View style={styles.onlineIndicator} />}
                      </View>
                      
                      <TouchableOpacity style={styles.userMenuButton}>
                        <MoreVertical size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={[styles.userName, screenSize.isDesktop && styles.userNameDesktop]}>
                          {user.full_name || 'Unnamed User'}
                        </Text>
                        {RoleIcon && (
                          <RoleIcon size={16} color={getUserRoleColor(user.role || 'user')} />
                        )}
                      </View>
                      
                      <View style={styles.userDetail}>
                        <Mail size={12} color="#64748B" />
                        <Text style={styles.userDetailText}>{user.email}</Text>
                      </View>
                      
                      {user.phone && (
                        <View style={styles.userDetail}>
                          <Phone size={12} color="#64748B" />
                          <Text style={styles.userDetailText}>{user.phone}</Text>
                        </View>
                      )}
                      
                      {user.location && (
                        <View style={styles.userDetail}>
                          <MapPin size={12} color="#64748B" />
                          <Text style={styles.userDetailText}>{user.location}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.userFooter}>
                      <View style={styles.userStatus}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={styles.userStatusText}>
                          {formatLastSeen(user.last_sign_in_at)}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.roleTag,
                        { backgroundColor: `${getUserRoleColor(user.role || 'user')}20` }
                      ]}>
                        <Text style={[
                          styles.roleTagText,
                          { color: getUserRoleColor(user.role || 'user') }
                        ]}>
                          {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
  },
  unauthorizedSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerDesktop: {
    paddingVertical: 32,
    paddingHorizontal: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginLeft: 12,
  },
  titleDesktop: {
    fontSize: 32,
    marginLeft: 16,
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDesktop: {
    width: 'auto',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchContainerDesktop: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 0,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  searchInputDesktop: {
    fontSize: 18,
    marginLeft: 16,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
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
  filterCount: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 16,
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
  usersGrid: {
    gap: 16,
    paddingBottom: 32,
  },
  usersGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCardDesktop: {
    width: 320,
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userAvatar: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userMenuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  userInfo: {
    marginBottom: 16,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  userNameDesktop: {
    fontSize: 18,
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 6,
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 4,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
});