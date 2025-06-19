import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Crown, CheckCircle, AlertCircle, Calendar } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useStripe, StripeSubscription } from '@/hooks/useStripe';
import { stripeProducts, getProductByPriceId } from '@/src/stripe-config';
import { DesignSystem } from '@/constants/DesignSystem';

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
      <View style={styles.cardContainer}>
        <BlurView intensity={20} tint="light" style={styles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={DesignSystem.colors.primary.blue} />
            <Text style={styles.loadingText}>Loading subscription...</Text>
          </View>
        </BlurView>
      </View>
    );
  }

  const product = getSubscriptionProduct();
  const isActive = isSubscriptionActive(subscription);

  return (
    <View style={[styles.cardContainer, isActive && styles.activeCardContainer]}>
      <BlurView 
        intensity={20} 
        tint="light" 
        style={[styles.card, isActive && styles.activeCard]}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Crown size={24} color={isActive ? '#10B981' : DesignSystem.colors.text.secondary} />
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
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.detailText}>Premium features enabled</Text>
            </View>
            
            {subscription.current_period_end && (
              <View style={styles.detailRow}>
                <Calendar size={20} color={DesignSystem.colors.text.secondary} />
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
                <AlertCircle size={20} color="#F59E0B" />
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
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: DesignSystem.spacing.md,
    ...DesignSystem.shadows.card,
  },
  activeCardContainer: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  card: {
    padding: DesignSystem.spacing.lg,
  },
  activeCard: {
    backgroundColor: 'rgba(240, 253, 244, 0.8)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.lg,
  },
  loadingText: {
    marginLeft: DesignSystem.spacing.sm,
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: DesignSystem.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: DesignSystem.typography.sizes.subtitle,
    fontFamily: DesignSystem.typography.fontFamilies.display,
    color: DesignSystem.colors.text.primary,
    marginLeft: DesignSystem.spacing.sm,
  },
  activeTitle: {
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  statusText: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    textTransform: 'capitalize',
  },
  subscriptionDetails: {
    gap: DesignSystem.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.secondary,
    marginLeft: DesignSystem.spacing.sm,
  },
  paymentMethod: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: DesignSystem.colors.text.secondary,
  },
  cancelNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  cancelText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: '#D97706',
    marginLeft: DesignSystem.spacing.sm,
  },
  upgradeSection: {
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: DesignSystem.spacing.lg,
  },
  featureItem: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  upgradeButton: {
    backgroundColor: DesignSystem.colors.primary.blue,
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    alignItems: 'center',
    minWidth: 160,
    ...DesignSystem.shadows.button,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: DesignSystem.colors.text.onDark,
  },
});