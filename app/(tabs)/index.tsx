import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, AlertTriangle, Clock, TrendingUp, Pill, FileText, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMedications } from '@/hooks/useMedications';
import { router } from 'expo-router';
import { useResponsive, getResponsiveValue } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { GlassCard } from '@/components/GlassCard';
import { BentoGrid, BentoItem } from '@/components/BentoGrid';
import { DesignSystem } from '@/constants/DesignSystem';

export default function HomeScreen() {
  const { medications, interactions, sideEffects, reactionReports, getRecentSideEffects, getRecentReactionReports } = useMedications();
  const screenSize = useResponsive();

  const getInteractionStats = () => {
    const total = interactions.length;
    const major = interactions.filter(i => i.severity === 'major').length;
    const moderate = interactions.filter(i => i.severity === 'moderate').length;
    const minor = interactions.filter(i => i.severity === 'minor').length;
    
    return { total, major, moderate, minor };
  };

  const stats = getInteractionStats();
  const recentSideEffects = getRecentSideEffects(7);
  const recentReactions = getRecentReactionReports(7);

  const handleViewReports = () => {
    router.push('/(tabs)/reports');
  };

  const handleUpgradeSubscription = () => {
    router.push('/(tabs)/subscription');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ResponsiveContainer maxWidth={1400}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
              <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>S.A.F.E. Meds</Text>
              <Text style={[styles.subtitle, screenSize.isDesktop && styles.subtitleDesktop]}>Medication Safety Dashboard</Text>
            </View>

            {/* Subscription Card */}
            <View style={styles.subscriptionSection}>
              <SubscriptionCard onUpgrade={handleUpgradeSubscription} />
            </View>

            {/* Bento Grid Layout */}
            <BentoGrid>
              {/* Safety Status - Large Card */}
              <BentoItem size="large">
                <GlassCard style={styles.fullHeight}>
                  <View style={styles.cardHeader}>
                    <Shield size={screenSize.isDesktop ? 28 : 24} color={stats.major > 0 ? '#EF4444' : '#10B981'} />
                    <Text style={[styles.cardTitle, screenSize.isDesktop && styles.cardTitleDesktop]}>Safety Status</Text>
                  </View>
                  
                  {stats.major > 0 ? (
                    <View style={styles.alertContainer}>
                      <Text style={styles.alertText}>
                        ⚠️ {stats.major} major drug interaction{stats.major > 1 ? 's' : ''} detected
                      </Text>
                      <Text style={styles.alertSubtext}>
                        Please review your medications and consult your healthcare provider
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.safeContainer}>
                      <Text style={styles.safeText}>
                        ✅ No major interactions detected
                      </Text>
                      <Text style={styles.safeSubtext}>
                        Your current medications appear safe when taken as prescribed
                      </Text>
                    </View>
                  )}

                  {stats.moderate > 0 && (
                    <Text style={styles.moderateText}>
                      {stats.moderate} moderate interaction{stats.moderate > 1 ? 's' : ''} to monitor
                    </Text>
                  )}

                  {(recentSideEffects.length > 0 || recentReactions.length > 0) && (
                    <View style={styles.reportsAlert}>
                      <Text style={styles.reportsAlertText}>
                        📋 {recentSideEffects.length + recentReactions.length} health report{recentSideEffects.length + recentReactions.length > 1 ? 's' : ''} this week
                      </Text>
                      <TouchableOpacity onPress={handleViewReports}>
                        <Text style={styles.viewReportsLink}>View Details →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassCard>
              </BentoItem>

              {/* Medications Count */}
              <BentoItem size="small">
                <GlassCard style={styles.fullHeight}>
                  <View style={styles.statIconContainer}>
                    <Pill size={screenSize.isDesktop ? 32 : 28} color={DesignSystem.colors.primary.blue} />
                  </View>
                  <Text style={[styles.statNumber, screenSize.isDesktop && styles.statNumberDesktop]}>{medications.length}</Text>
                  <Text style={[styles.statLabel, screenSize.isDesktop && styles.statLabelDesktop]}>Medications</Text>
                </GlassCard>
              </BentoItem>

              {/* Interactions Count */}
              <BentoItem size="small">
                <GlassCard style={styles.fullHeight}>
                  <View style={styles.statIconContainer}>
                    <AlertTriangle size={screenSize.isDesktop ? 32 : 28} color="#F59E0B" />
                  </View>
                  <Text style={[styles.statNumber, screenSize.isDesktop && styles.statNumberDesktop]}>{stats.total}</Text>
                  <Text style={[styles.statLabel, screenSize.isDesktop && styles.statLabelDesktop]}>Interactions</Text>
                </GlassCard>
              </BentoItem>

              {/* Recent Activity - Medium Card */}
              <BentoItem size="medium">
                <GlassCard style={styles.fullHeight}>
                  <View style={styles.cardHeader}>
                    <TrendingUp size={screenSize.isDesktop ? 24 : 20} color={DesignSystem.colors.primary.blue} />
                    <Text style={[styles.cardTitle, screenSize.isDesktop && styles.cardTitleDesktop]}>Recent Activity</Text>
                  </View>
                  
                  {medications.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No medications added yet. Start by adding your first medication.
                    </Text>
                  ) : (
                    <View style={styles.activityList}>
                      {medications.slice(0, 3).map((med, index) => (
                        <View key={index} style={styles.activityItem}>
                          <Text style={styles.activityTitle}>{med.name}</Text>
                          <Text style={styles.activityTime}>
                            {med.dosage} • {med.frequency}
                          </Text>
                        </View>
                      ))}
                      
                      {recentSideEffects.slice(0, 2).map((effect, index) => (
                        <View key={`effect-${index}`} style={styles.activityItem}>
                          <Text style={styles.activityTitle}>Side Effect Reported</Text>
                          <Text style={styles.activityTime}>
                            {effect.symptom} • {effect.medicationName}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </GlassCard>
              </BentoItem>

              {/* Reports Count */}
              <BentoItem size="small">
                <GlassCard style={styles.fullHeight}>
                  <View style={styles.statIconContainer}>
                    <FileText size={screenSize.isDesktop ? 32 : 28} color="#EF4444" />
                  </View>
                  <Text style={[styles.statNumber, screenSize.isDesktop && styles.statNumberDesktop]}>{recentSideEffects.length + recentReactions.length}</Text>
                  <Text style={[styles.statLabel, screenSize.isDesktop && styles.statLabelDesktop]}>Recent Reports</Text>
                </GlassCard>
              </BentoItem>
            </BentoGrid>

            {(recentSideEffects.length > 0 || recentReactions.length > 0) && (
              <View style={styles.actionSection}>
                <TouchableOpacity style={[styles.reportsAction, screenSize.isDesktop && styles.reportsActionDesktop]} onPress={handleViewReports}>
                  <FileText size={screenSize.isDesktop ? 24 : 20} color="#F59E0B" />
                  <Text style={[styles.reportsActionText, screenSize.isDesktop && styles.reportsActionTextDesktop]}>View Health Reports</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </ResponsiveContainer>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: DesignSystem.spacing.xl,
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
  },
  headerDesktop: {
    paddingVertical: DesignSystem.spacing.xxxl,
  },
  title: {
    fontSize: DesignSystem.typography.sizes.hero,
    fontFamily: DesignSystem.typography.fontFamilies.display,
    color: DesignSystem.colors.text.onDark,
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  titleDesktop: {
    fontSize: 36,
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  subtitleDesktop: {
    fontSize: DesignSystem.typography.sizes.subtitle,
  },
  subscriptionSection: {
    paddingHorizontal: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
  },
  fullHeight: {
    flex: 1,
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  cardTitle: {
    fontSize: DesignSystem.typography.sizes.subtitle,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: DesignSystem.colors.text.primary,
    marginLeft: DesignSystem.spacing.sm,
  },
  cardTitleDesktop: {
    fontSize: 20,
    marginLeft: DesignSystem.spacing.md,
  },
  alertContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: '#DC2626',
    marginBottom: DesignSystem.spacing.xs,
  },
  alertSubtext: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: '#991B1B',
  },
  safeContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  safeText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: '#059669',
    marginBottom: DesignSystem.spacing.xs,
  },
  safeSubtext: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: '#047857',
  },
  moderateText: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: '#D97706',
    marginTop: DesignSystem.spacing.sm,
    paddingTop: DesignSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  reportsAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportsAlertText: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: '#D97706',
    flex: 1,
  },
  viewReportsLink: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: '#D97706',
    textDecorationLine: 'underline',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.lg,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.md,
    alignSelf: 'center',
  },
  statNumber: {
    fontSize: DesignSystem.typography.sizes.title,
    fontFamily: DesignSystem.typography.fontFamilies.display,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  statNumberDesktop: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing.sm,
  },
  statLabel: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  statLabelDesktop: {
    fontSize: DesignSystem.typography.sizes.caption,
  },
  emptyText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  activityList: {
    gap: DesignSystem.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  activityTitle: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: DesignSystem.colors.text.primary,
  },
  activityTime: {
    fontSize: DesignSystem.typography.sizes.label,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.secondary,
  },
  actionSection: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.xxxl,
    alignItems: 'center',
  },
  reportsAction: {
    backgroundColor: '#FEF3C7',
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    width: '100%',
    maxWidth: 400,
    ...DesignSystem.shadows.button,
  },
  reportsActionDesktop: {
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.md,
  },
  reportsActionText: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: '#D97706',
  },
  reportsActionTextDesktop: {
    fontSize: DesignSystem.typography.sizes.subtitle,
  },
});