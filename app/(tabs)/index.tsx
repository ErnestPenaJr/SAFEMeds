import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, TriangleAlert as AlertTriangle, Clock, TrendingUp, Pill, FileText, Crown } from 'lucide-react-native';
import { useMedications } from '@/hooks/useMedications';
import { router } from 'expo-router';
import { useResponsive, getResponsiveValue } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { SubscriptionCard } from '@/components/SubscriptionCard';

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

  const cardColumns = getResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }, screenSize) || 1;

  const statsColumns = getResponsiveValue({
    mobile: 3,
    tablet: 3,
    desktop: 3,
  }, screenSize) || 3;

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={1400}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
            <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>S.A.F.E. Meds</Text>
            <Text style={[styles.subtitle, screenSize.isDesktop && styles.subtitleDesktop]}>Medication Safety Dashboard</Text>
          </View>

          {/* Subscription Card */}
          <View style={styles.subscriptionSection}>
            <SubscriptionCard onUpgrade={handleUpgradeSubscription} />
          </View>

          {/* Quick Stats */}
          <View style={[
            styles.statsContainer,
            screenSize.isDesktop && styles.statsContainerDesktop,
            { flexDirection: screenSize.isDesktop ? 'row' : 'row' }
          ]}>
            <View style={[styles.statCard, screenSize.isDesktop && styles.statCardDesktop]}>
              <View style={styles.statIconContainer}>
                <Pill size={screenSize.isDesktop ? 28 : 24} color="#2563EB" />
              </View>
              <Text style={[styles.statNumber, screenSize.isDesktop && styles.statNumberDesktop]}>{medications.length}</Text>
              <Text style={[styles.statLabel, screenSize.isDesktop && styles.statLabelDesktop]}>Medications</Text>
            </View>

            <View style={[styles.statCard, screenSize.isDesktop && styles.statCardDesktop]}>
              <View style={styles.statIconContainer}>
                <AlertTriangle size={screenSize.isDesktop ? 28 : 24} color="#F59E0B" />
              </View>
              <Text style={[styles.statNumber, screenSize.isDesktop && styles.statNumberDesktop]}>{stats.total}</Text>
              <Text style={[styles.statLabel, screenSize.isDesktop && styles.statLabelDesktop]}>Interactions</Text>
            </View>

            <View style={[styles.statCard, screenSize.isDesktop && styles.statCardDesktop]}>
              <View style={styles.statIconContainer}>
                <FileText size={screenSize.isDesktop ? 28 : 24} color="#EF4444" />
              </View>
              <Text style={[styles.statNumber, screenSize.isDesktop && styles.statNumberDesktop]}>{recentSideEffects.length + recentReactions.length}</Text>
              <Text style={[styles.statLabel, screenSize.isDesktop && styles.statLabelDesktop]}>Recent Reports</Text>
            </View>
          </View>

          {/* Main Content Grid */}
          <View style={[
            styles.mainContent,
            screenSize.isDesktop && styles.mainContentDesktop
          ]}>
            {/* Safety Status */}
            <View style={[styles.card, screenSize.isDesktop && styles.cardDesktop]}>
              <View style={styles.cardHeader}>
                <Shield size={screenSize.isDesktop ? 24 : 20} color={stats.major > 0 ? '#EF4444' : '#10B981'} />
                <Text style={[styles.cardTitle, screenSize.isDesktop && styles.cardTitleDesktop]}>Safety Status</Text>
              </View>
              
              {stats.major > 0 ? (
                <View style={styles.alertContainer}>
                  <Text style={styles.alertText}>
                    <Text>⚠️ {stats.major} major drug interaction{stats.major > 1 ? 's' : ''} detected</Text>
                  </Text>
                  <Text style={styles.alertSubtext}>
                    Please review your medications and consult your healthcare provider
                  </Text>
                </View>
              ) : (
                <View style={styles.safeContainer}>
                  <Text style={styles.safeText}>
                    <Text>✅ No major interactions detected</Text>
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
                    <Text>📋 {recentSideEffects.length + recentReactions.length} health report{recentSideEffects.length + recentReactions.length > 1 ? 's' : ''} this week</Text>
                  </Text>
                  <TouchableOpacity onPress={handleViewReports}>
                    <Text style={styles.viewReportsLink}>View Details →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Recent Activity */}
            <View style={[styles.card, screenSize.isDesktop && styles.cardDesktop]}>
              <View style={styles.cardHeader}>
                <TrendingUp size={screenSize.isDesktop ? 24 : 20} color="#2563EB" />
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
                        {med.dosage} <Text>•</Text> {med.frequency}
                      </Text>
                    </View>
                  ))}
                  
                  {/* Show recent reports */}
                  {recentSideEffects.slice(0, 2).map((effect, index) => (
                    <View key={`effect-${index}`} style={styles.activityItem}>
                      <Text style={styles.activityTitle}>Side Effect Reported</Text>
                      <Text style={styles.activityTime}>
                        {effect.symptom} <Text>•</Text> {effect.medicationName}
                      </Text>
                    </View>
                  ))}
                  
                  {recentReactions.slice(0, 1).map((reaction, index) => (
                    <View key={`reaction-${index}`} style={styles.activityItem}>
                      <Text style={styles.activityTitle}>Reaction Reported</Text>
                      <Text style={styles.activityTime}>
                        {reaction.reactionType} <Text>•</Text> {reaction.medicationName}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {(recentSideEffects.length > 0 || recentReactions.length > 0) && (
            <TouchableOpacity style={[styles.reportsAction, screenSize.isDesktop && styles.reportsActionDesktop]} onPress={handleViewReports}>
              <FileText size={screenSize.isDesktop ? 24 : 20} color="#F59E0B" />
              <Text style={[styles.reportsActionText, screenSize.isDesktop && styles.reportsActionTextDesktop]}>View Health Reports</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerDesktop: {
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  titleDesktop: {
    fontSize: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  subtitleDesktop: {
    fontSize: 18,
  },
  subscriptionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsContainerDesktop: {
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardDesktop: {
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statNumberDesktop: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  statLabelDesktop: {
    fontSize: 14,
  },
  mainContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  mainContentDesktop: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
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
  },
  cardDesktop: {
    flex: 1,
    borderRadius: 20,
    padding: 28,
    marginBottom: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  cardTitleDesktop: {
    fontSize: 20,
    marginLeft: 12,
  },
  alertContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 4,
  },
  alertSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#991B1B',
  },
  safeContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  safeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginBottom: 4,
  },
  safeSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#047857',
  },
  moderateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  reportsAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportsAlertText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    flex: 1,
  },
  viewReportsLink: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  reportsAction: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginHorizontal: 16,
  },
  reportsActionDesktop: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 40,
  },
  reportsActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  reportsActionTextDesktop: {
    fontSize: 18,
  },
});