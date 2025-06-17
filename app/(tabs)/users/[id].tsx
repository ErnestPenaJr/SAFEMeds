import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Crown, Clock, Activity, Settings, Ban, Trash2, CreditCard as Edit, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useUsers } from '../../../hooks/useUsers';
import { useResponsive } from '../../../hooks/useResponsive';
import { ResponsiveContainer } from '../../../components/ResponsiveContainer';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getUserById, updateUserRole, updateUserStatus, deleteUser } = useUsers();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const screenSize = useResponsive();

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(id as string);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    try {
      setUpdating(true);
      await updateUserRole(id as string, newRole);
      setUser(prev => ({ ...prev, role: newRole }));
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async (isActive: boolean) => {
    try {
      setUpdating(true);
      await updateUserStatus(id as string, isActive);
      setUser(prev => ({ ...prev, is_active: isActive }));
      Alert.alert('Success', `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = () => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(id as string);
              Alert.alert('Success', 'User deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#EF4444';
      case 'moderator': return '#F59E0B';
      case 'premium': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'premium': return Crown;
      default: return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const RoleIcon = getRoleIcon(user.role || 'user');

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
            User Details
          </Text>
          <TouchableOpacity style={styles.menuButton}>
            <MoreVertical size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Profile Card */}
          <View style={[styles.profileCard, screenSize.isDesktop && styles.profileCardDesktop]}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {user.is_online && <View style={styles.onlineIndicator} />}
              </View>

              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, screenSize.isDesktop && styles.userNameDesktop]}>
                    {user.full_name || 'Unnamed User'}
                  </Text>
                  {RoleIcon && (
                    <RoleIcon size={20} color={getRoleColor(user.role || 'user')} />
                  )}
                </View>
                
                <View style={[
                  styles.roleTag,
                  { backgroundColor: `${getRoleColor(user.role || 'user')}20` }
                ]}>
                  <Text style={[
                    styles.roleTagText,
                    { color: getRoleColor(user.role || 'user') }
                  ]}>
                    {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton}>
                <Edit size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <View style={styles.contactItem}>
                <Mail size={16} color="#64748B" />
                <Text style={styles.contactText}>{user.email}</Text>
              </View>
              
              {user.phone && (
                <View style={styles.contactItem}>
                  <Phone size={16} color="#64748B" />
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
              
              {user.location && (
                <View style={styles.contactItem}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.contactText}>{user.location}</Text>
                </View>
              )}
              
              <View style={styles.contactItem}>
                <Calendar size={16} color="#64748B" />
                <Text style={styles.contactText}>
                  Joined {formatDate(user.created_at)}
                </Text>
              </View>
              
              {user.last_sign_in_at && (
                <View style={styles.contactItem}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.contactText}>
                    Last seen {formatDate(user.last_sign_in_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* User Management */}
          <View style={[styles.managementCard, screenSize.isDesktop && styles.managementCardDesktop]}>
            <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
              User Management
            </Text>

            {/* Account Status */}
            <View style={styles.managementItem}>
              <View style={styles.managementItemLeft}>
                <Activity size={20} color="#10B981" />
                <View style={styles.managementItemInfo}>
                  <Text style={styles.managementItemTitle}>Account Status</Text>
                  <Text style={styles.managementItemSubtitle}>
                    {user.is_active ? 'Active account' : 'Inactive account'}
                  </Text>
                </View>
              </View>
              <Switch
                value={user.is_active}
                onValueChange={handleStatusToggle}
                disabled={updating}
                trackColor={{ false: '#F1F5F9', true: '#DBEAFE' }}
                thumbColor={user.is_active ? '#2563EB' : '#94A3B8'}
              />
            </View>

            {/* Role Management */}
            <View style={styles.managementItem}>
              <View style={styles.managementItemLeft}>
                <Shield size={20} color="#F59E0B" />
                <View style={styles.managementItemInfo}>
                  <Text style={styles.managementItemTitle}>User Role</Text>
                  <Text style={styles.managementItemSubtitle}>
                    Current role: {user.role || 'user'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeRoleButton}
                onPress={() => {
                  Alert.alert(
                    'Change Role',
                    'Select a new role for this user',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'User', onPress: () => handleRoleChange('user') },
                      { text: 'Premium', onPress: () => handleRoleChange('premium') },
                      { text: 'Moderator', onPress: () => handleRoleChange('moderator') },
                      { text: 'Admin', onPress: () => handleRoleChange('admin') },
                    ]
                  );
                }}
                disabled={updating}
              >
                <Text style={styles.changeRoleButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity Stats */}
          <View style={[styles.statsCard, screenSize.isDesktop && styles.statsCardDesktop]}>
            <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
              Activity Statistics
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.medication_count || 0}</Text>
                <Text style={styles.statLabel}>Medications</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.login_count || 0}</Text>
                <Text style={styles.statLabel}>Logins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.report_count || 0}</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={[styles.dangerCard, screenSize.isDesktop && styles.dangerCardDesktop]}>
            <Text style={[styles.dangerTitle, screenSize.isDesktop && styles.dangerTitleDesktop]}>
              Danger Zone
            </Text>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => {
                Alert.alert(
                  'Suspend User',
                  'This will temporarily disable the user account.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Suspend', style: 'destructive' },
                  ]
                );
              }}
            >
              <Ban size={20} color="#F59E0B" />
              <Text style={styles.dangerButtonText}>Suspend User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteUser}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.dangerButtonText, { color: '#EF4444' }]}>Delete User</Text>
            </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginBottom: 16,
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
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  headerTitleDesktop: {
    fontSize: 24,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
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
  profileCardDesktop: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginRight: 8,
  },
  userNameDesktop: {
    fontSize: 24,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  editButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  contactSection: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 12,
  },
  managementCard: {
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
  managementCardDesktop: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionTitleDesktop: {
    fontSize: 20,
    marginBottom: 20,
  },
  managementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  managementItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  managementItemInfo: {
    marginLeft: 12,
  },
  managementItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  managementItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  changeRoleButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeRoleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  statsCard: {
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
  statsCardDesktop: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  dangerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerCardDesktop: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginBottom: 16,
  },
  dangerTitleDesktop: {
    fontSize: 20,
    marginBottom: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
    marginLeft: 12,
  },
});