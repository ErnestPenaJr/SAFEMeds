import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Bell, CircleHelp as HelpCircle, Settings, FileText, Heart, LogOut, CreditCard as Edit, Mail, Zap, Crown, Calendar, ExternalLink } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useStripe } from '@/hooks/useStripe';
import { stripeProducts } from '@/src/stripe-config';
import { EditProfileModal } from '@/components/EditProfileModal';
import { EmailTestModal } from '@/components/EmailTestModal';
import { ResendTestModal } from '@/components/ResendTestModal';
import { SubscriptionCard } from '@/components/SubscriptionCard';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { createCheckoutSession, getSubscription, isSubscriptionActive, loading } = useStripe();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailTestModal, setShowEmailTestModal] = useState(false);
  const [showResendTestModal, setShowResendTestModal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleUpgrade = async () => {
    const product = stripeProducts[0];
    if (!product) {
      Alert.alert('Error', 'No subscription plans available');
      return;
    }

    try {
      const successUrl = `${window.location.origin}/(tabs)/profile`;
      const cancelUrl = `${window.location.origin}/(tabs)/profile`;
      
      const checkoutUrl = await createCheckoutSession(product, successUrl, cancelUrl);
      
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', 'Failed to start checkout process. Please try again.');
    }
  };

  const handleSettingPress = (setting: string) => {
    Alert.alert('Feature Coming Soon', `${setting} feature will be available in a future update.`);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User confirmed sign out');
              await signOut();
              console.log('Sign out completed');
              
              // The signOut function now handles navigation automatically
            } catch (error) {
              console.error('Error during sign out process:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleTestEmail = () => {
    setShowEmailTestModal(true);
  };

  const handleTestResend = () => {
    setShowResendTestModal(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isActive = isSubscriptionActive(subscription);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#2563EB" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.full_name || 'S.A.F.E. User'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || 'Taking medications safely'}
              </Text>
              {profile?.updated_at && (
                <Text style={styles.profileUpdated}>
                  Updated {new Date(profile.updated_at).toLocaleDateString()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          {loadingSubscription ? (
            <View style={styles.subscriptionCard}>
              <Text style={styles.loadingText}>Loading subscription...</Text>
            </View>
          ) : (
            <View style={[styles.subscriptionCard, isActive && styles.activeSubscriptionCard]}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionTitleContainer}>
                  <Crown size={20} color={isActive ? '#10B981' : '#64748B'} />
                  <Text style={[styles.subscriptionTitle, isActive && styles.activeSubscriptionTitle]}>
                    {isActive ? 'S.A.F.E. Meds Premium' : 'S.A.F.E. Meds Free'}
                  </Text>
                </View>
                
                {subscription && (
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${isActive ? '#10B981' : '#64748B'}20` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: isActive ? '#10B981' : '#64748B' }
                    ]}>
                      {isActive ? 'Active' : subscription.subscription_status}
                    </Text>
                  </View>
                )}
              </View>

              {isActive && subscription ? (
                <View style={styles.subscriptionDetails}>
                  {subscription.current_period_end && (
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#64748B" />
                      <Text style={styles.detailText}>
                        Renews on {formatDate(subscription.current_period_end)}
                      </Text>
                    </View>
                  )}

                  {subscription.payment_method_brand && subscription.payment_method_last4 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.paymentMethod}>
                        {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                      </Text>
                    </View>
                  )}

                  {subscription.cancel_at_period_end && (
                    <View style={styles.cancelNotice}>
                      <Text style={styles.cancelText}>
                        ⚠️ Subscription will cancel at period end
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.upgradeSection}>
                  <Text style={styles.upgradeText}>
                    Upgrade to unlock premium medication safety features
                  </Text>
                  
                  <View style={styles.features}>
                    <Text style={styles.featureItem}>• Advanced drug interaction checking</Text>
                    <Text style={styles.featureItem}>• Personalized medication schedules</Text>
                    <Text style={styles.featureItem}>• Detailed health reports</Text>
                    <Text style={styles.featureItem}>• Priority support</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.upgradeButton, loading && styles.upgradeButtonDisabled]}
                    onPress={handleUpgrade}
                    disabled={loading}
                  >
                    <ExternalLink size={16} color="#FFFFFF" />
                    <Text style={styles.upgradeButtonText}>
                      {loading ? 'Processing...' : 'Upgrade to Premium'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress('Interaction Alerts')}
          >
            <View style={styles.settingIcon}>
              <Shield size={20} color="#2563EB" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Interaction Alerts</Text>
              <Text style={styles.settingSubtitle}>Manage drug interaction notifications</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress('Medication Reminders')}
          >
            <View style={styles.settingIcon}>
              <Bell size={20} color="#2563EB" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Medication Reminders</Text>
              <Text style={styles.settingSubtitle}>Set up dose timing notifications</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress('Health Reports')}
          >
            <View style={styles.settingIcon}>
              <FileText size={20} color="#2563EB" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Health Reports</Text>
              <Text style={styles.settingSubtitle}>Export medication schedules and reports</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEditProfile}
          >
            <View style={styles.settingIcon}>
              <User size={20} color="#64748B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingSubtitle}>Update your personal information</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress('App Settings')}
          >
            <View style={styles.settingIcon}>
              <Settings size={20} color="#64748B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>App Settings</Text>
              <Text style={styles.settingSubtitle}>Customize your app experience</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress('Help & Support')}
          >
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color="#64748B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingSubtitle}>Get help with using the app</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Testing</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleTestResend}
          >
            <View style={styles.settingIcon}>
              <Zap size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Test Resend Integration</Text>
              <Text style={styles.settingSubtitle}>Send test email directly via Resend API</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleTestEmail}
          >
            <View style={styles.settingIcon}>
              <Mail size={20} color="#8B5CF6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Test Supabase Email Flow</Text>
              <Text style={styles.settingSubtitle}>Test complete email pipeline via edge function</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Heart size={20} color="#EF4444" />
              <Text style={styles.infoTitle}>S.A.F.E. Meds Mission</Text>
            </View>
            <Text style={styles.infoText}>
              Our mission is to help you take your medications safely by identifying potential 
              drug interactions and creating personalized schedules that minimize risks and 
              maximize therapeutic benefits.
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              This app is for informational purposes only and should not replace professional 
              medical advice. Always consult with your healthcare provider before making any 
              changes to your medication regimen.
            </Text>
          </View>
        </View>

        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 S.A.F.E. Meds</Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      <EmailTestModal
        visible={showEmailTestModal}
        onClose={() => setShowEmailTestModal(false)}
      />

      <ResendTestModal
        visible={showResendTestModal}
        onClose={() => setShowResendTestModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  profileUpdated: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  editButton: {
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeSubscriptionCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subscriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  activeSubscriptionTitle: {
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 8,
  },
  paymentMethod: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  cancelNotice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
  },
  upgradeSection: {
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  upgradeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 18,
  },
  signOutSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginBottom: 4,
  },
});