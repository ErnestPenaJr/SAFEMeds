import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Crown, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Calendar } from 'lucide-react-native';
import { useStripe, StripeSubscription } from '@/hooks/useStripe';
import { stripeProducts, getProductByPriceId } from '@/src/stripe-config';

interface SubscriptionCardProps {
  onUpgrade?: () => void;
}

export function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const { getSubscription, isSubscriptionActive, loading } = useStripe();
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
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

  const getSubscriptionProduct = () => {
    if (!subscription?.price_id) return null;
    return getProductByPriceId(subscription.price_id);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return '#10B981';
      case 'past_due':
      case 'unpaid':
        return '#F59E0B';
      case 'canceled':
      case 'incomplete_expired':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'incomplete':
        return 'Incomplete';
      case 'incomplete_expired':
        return 'Expired';
      case 'unpaid':
        return 'Unpaid';
      case 'paused':
        return 'Paused';
      case 'not_started':
        return 'Not Started';
      default:
        return status;
    }
  };

  if (loadingSubscription) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      </View>
    );
  }

  const product = getSubscriptionProduct();
  const isActive = isSubscriptionActive(subscription);

  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Crown size={20} color={isActive ? '#10B981' : '#64748B'} />
          <Text style={[styles.title, isActive && styles.activeTitle]}>
            {product?.name || 'S.A.F.E. Meds'}
          </Text>
        </View>
        
        {subscription && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(subscription.subscription_status)}20` }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(subscription.subscription_status) }
            ]}>
              {getStatusText(subscription.subscription_status)}
            </Text>
          </View>
        )}
      </View>

      {subscription && isActive ? (
        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.detailText}>Premium features enabled</Text>
          </View>
          
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
              <AlertCircle size={16} color="#F59E0B" />
              <Text style={styles.cancelText}>
                Subscription will cancel at period end
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

          {onUpgrade && (
            <TouchableOpacity
              style={[styles.upgradeButton, loading && styles.upgradeButtonDisabled]}
              onPress={onUpgrade}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  activeTitle: {
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 8,
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
    alignItems: 'center',
    minWidth: 120,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});