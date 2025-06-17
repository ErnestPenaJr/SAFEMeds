import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, Chrome as Home, Crown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function SubscriptionSuccessScreen() {
  const screenSize = useResponsive();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleViewSubscription = () => {
    router.replace('/(tabs)/subscription');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={800}>
        <View style={[styles.content, screenSize.isDesktop && styles.contentDesktop]}>
          <View style={styles.iconContainer}>
            <CheckCircle size={screenSize.isDesktop ? 80 : 64} color="#10B981" />
          </View>

          <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>
            Welcome to S.A.F.E. Meds Premium!
          </Text>

          <Text style={[styles.subtitle, screenSize.isDesktop && styles.subtitleDesktop]}>
            Your subscription has been activated successfully. You now have access to all premium features.
          </Text>

          <View style={[styles.featuresCard, screenSize.isDesktop && styles.featuresCardDesktop]}>
            <View style={styles.featuresHeader}>
              <Crown size={24} color="#2563EB" />
              <Text style={[styles.featuresTitle, screenSize.isDesktop && styles.featuresTitleDesktop]}>
                Premium Features Unlocked
              </Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Advanced drug interaction checking</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Smart medication scheduling</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Detailed health reports and analytics</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Priority customer support</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Enhanced medication safety alerts</Text>
              </View>
            </View>
          </View>

          <View style={[styles.actions, screenSize.isDesktop && styles.actionsDesktop]}>
            <TouchableOpacity
              style={[styles.primaryButton, screenSize.isDesktop && styles.primaryButtonDesktop]}
              onPress={handleGoHome}
            >
              <Home size={20} color="#FFFFFF" />
              <Text style={[styles.primaryButtonText, screenSize.isDesktop && styles.primaryButtonTextDesktop]}>
                Go to Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, screenSize.isDesktop && styles.secondaryButtonDesktop]}
              onPress={handleViewSubscription}
            >
              <Text style={[styles.secondaryButtonText, screenSize.isDesktop && styles.secondaryButtonTextDesktop]}>
                View Subscription
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.autoRedirect, screenSize.isDesktop && styles.autoRedirectDesktop]}>
            You'll be automatically redirected to the dashboard in a few seconds...
          </Text>
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  contentDesktop: {
    paddingVertical: 80,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  titleDesktop: {
    fontSize: 36,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 500,
  },
  subtitleDesktop: {
    fontSize: 18,
    marginBottom: 48,
    maxWidth: 600,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 500,
  },
  featuresCardDesktop: {
    borderRadius: 20,
    padding: 32,
    marginBottom: 48,
    maxWidth: 600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  featuresTitleDesktop: {
    fontSize: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 8,
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  actionsDesktop: {
    flexDirection: 'row',
    maxWidth: 500,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonDesktop: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  primaryButtonTextDesktop: {
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonDesktop: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  secondaryButtonTextDesktop: {
    fontSize: 18,
  },
  autoRedirect: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
  autoRedirectDesktop: {
    fontSize: 14,
    marginTop: 32,
  },
});