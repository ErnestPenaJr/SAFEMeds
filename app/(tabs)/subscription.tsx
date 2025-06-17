import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Star, Shield, Calendar, CreditCard, ExternalLink } from 'lucide-react-native';
import { useStripe } from '@/hooks/useStripe';
import { stripeProducts } from '@/src/stripe-config';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function SubscriptionScreen() {
  const { createCheckoutSession, loading } = useStripe();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const screenSize = useResponsive();

  const handleUpgrade = async (productId: string) => {
    const product = stripeProducts.find(p => p.id === productId);
    if (!product) {
      Alert.alert('Error', 'Product not found');
      return;
    }

    setSelectedProduct(productId);

    try {
      const successUrl = `${window.location.origin}/subscription/success`;
      const cancelUrl = `${window.location.origin}/subscription`;
      
      const checkoutUrl = await createCheckoutSession(product, successUrl, cancelUrl);
      
      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', 'Failed to start checkout process. Please try again.');
    } finally {
      setSelectedProduct(null);
    }
  };

  const formatPrice = (price: number, currency: string, interval?: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
    
    return interval ? `${formatted}/${interval}` : formatted;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={1200}>
        <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
          <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>Subscription</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Current Subscription Status */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
              Current Plan
            </Text>
            <SubscriptionCard onUpgrade={() => handleUpgrade(stripeProducts[0]?.id)} />
          </View>

          {/* Available Plans */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
              Available Plans
            </Text>
            
            <View style={[
              styles.plansContainer,
              screenSize.isDesktop && styles.plansContainerDesktop
            ]}>
              {stripeProducts.map((product) => (
                <View 
                  key={product.id} 
                  style={[
                    styles.planCard,
                    screenSize.isDesktop && styles.planCardDesktop
                  ]}
                >
                  <View style={styles.planHeader}>
                    <Crown size={24} color="#2563EB" />
                    <Text style={[styles.planName, screenSize.isDesktop && styles.planNameDesktop]}>
                      {product.name}
                    </Text>
                  </View>

                  <Text style={[styles.planDescription, screenSize.isDesktop && styles.planDescriptionDesktop]}>
                    {product.description}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, screenSize.isDesktop && styles.priceDesktop]}>
                      {formatPrice(product.price, product.currency, product.interval)}
                    </Text>
                    {product.interval && (
                      <Text style={styles.priceInterval}>per {product.interval}</Text>
                    )}
                  </View>

                  <View style={styles.features}>
                    <View style={styles.featureItem}>
                      <Shield size={16} color="#10B981" />
                      <Text style={styles.featureText}>Advanced drug interaction checking</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Calendar size={16} color="#10B981" />
                      <Text style={styles.featureText}>Smart medication scheduling</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Star size={16} color="#10B981" />
                      <Text style={styles.featureText}>Detailed health reports</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <CreditCard size={16} color="#10B981" />
                      <Text style={styles.featureText}>Priority customer support</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      (loading && selectedProduct === product.id) && styles.subscribeButtonDisabled,
                      screenSize.isDesktop && styles.subscribeButtonDesktop
                    ]}
                    onPress={() => handleUpgrade(product.id)}
                    disabled={loading && selectedProduct === product.id}
                  >
                    <Text style={[styles.subscribeButtonText, screenSize.isDesktop && styles.subscribeButtonTextDesktop]}>
                      {loading && selectedProduct === product.id ? 'Processing...' : 'Subscribe Now'}
                    </Text>
                    <ExternalLink size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, screenSize.isDesktop && styles.sectionTitleDesktop]}>
              Why Upgrade?
            </Text>
            
            <View style={[styles.benefitsCard, screenSize.isDesktop && styles.benefitsCardDesktop]}>
              <Text style={[styles.benefitsTitle, screenSize.isDesktop && styles.benefitsTitleDesktop]}>
                Enhanced Medication Safety
              </Text>
              <Text style={[styles.benefitsDescription, screenSize.isDesktop && styles.benefitsDescriptionDesktop]}>
                Get access to our premium features designed to keep you safe and help you manage 
                your medications more effectively. Our advanced algorithms check for dangerous 
                interactions and provide personalized recommendations.
              </Text>
              
              <View style={styles.benefitsList}>
                <Text style={styles.benefitItem}>✓ Real-time drug interaction alerts</Text>
                <Text style={styles.benefitItem}>✓ Personalized medication schedules</Text>
                <Text style={styles.benefitItem}>✓ Advanced side effect tracking</Text>
                <Text style={styles.benefitItem}>✓ Comprehensive health reports</Text>
                <Text style={styles.benefitItem}>✓ 24/7 priority support</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              All subscriptions are processed securely through Stripe. You can cancel anytime 
              from your account settings. This service is for informational purposes only and 
              should not replace professional medical advice.
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerDesktop: {
    paddingVertical: 32,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  titleDesktop: {
    fontSize: 32,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionTitleDesktop: {
    fontSize: 24,
    marginBottom: 24,
  },
  plansContainer: {
    gap: 16,
  },
  plansContainerDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  planCardDesktop: {
    flex: 1,
    borderRadius: 20,
    padding: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  planNameDesktop: {
    fontSize: 24,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  planDescriptionDesktop: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  priceDesktop: {
    fontSize: 40,
  },
  priceInterval: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  features: {
    gap: 12,
    marginBottom: 24,
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
  subscribeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  subscribeButtonDesktop: {
    borderRadius: 16,
    paddingVertical: 20,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  subscribeButtonTextDesktop: {
    fontSize: 18,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsCardDesktop: {
    borderRadius: 20,
    padding: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  benefitsTitleDesktop: {
    fontSize: 22,
    marginBottom: 16,
  },
  benefitsDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  benefitsDescriptionDesktop: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 18,
  },
});