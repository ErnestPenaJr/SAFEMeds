import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, TriangleAlert as AlertTriangle, TrendingUp, Plus, Clock, Filter } from 'lucide-react-native';
import { useMedications } from '@/hooks/useMedications';
import { SideEffectModal } from '@/components/SideEffectModal';
import { ReactionReportModal } from '@/components/ReactionReportModal';

export default function ReportsScreen() {
  const {
    medications,
    sideEffects,
    reactionReports,
    addSideEffect,
    addReactionReport,
    getRecentSideEffects,
    getRecentReactionReports,
  } = useMedications();

  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  const medicationNames = medications.map(med => med.name);
  const recentSideEffects = getRecentSideEffects(timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 365);
  const recentReactions = getRecentReactionReports(timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 365);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'severe': return '#EF4444';
      case 'life-threatening': return '#7C2D12';
      default: return '#64748B';
    }
  };

  const getFilteredData = () => {
    const cutoffDate = new Date();
    if (timeFilter === 'week') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    } else if (timeFilter === 'month') {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    } else {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }

    return {
      sideEffects: sideEffects.filter(effect => effect.timestamp >= cutoffDate),
      reactions: reactionReports.filter(report => report.timestamp >= cutoffDate)
    };
  };

  const filteredData = getFilteredData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Reports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              const filters: ('week' | 'month' | 'all')[] = ['week', 'month', 'all'];
              const currentIndex = filters.indexOf(timeFilter);
              const nextIndex = (currentIndex + 1) % filters.length;
              setTimeFilter(filters[nextIndex]);
            }}
          >
            <Filter size={16} color="#2563EB" />
            <Text style={styles.filterText}>
              {timeFilter === 'week' ? 'Week' : timeFilter === 'month' ? 'Month' : 'All'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <AlertTriangle size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{filteredData.sideEffects.length}</Text>
            <Text style={styles.statLabel}>Side Effects</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <FileText size={20} color="#EF4444" />
            </View>
            <Text style={styles.statNumber}>{filteredData.reactions.length}</Text>
            <Text style={styles.statLabel}>Reactions</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>
              {filteredData.sideEffects.filter(e => e.resolved).length + 
               filteredData.reactions.filter(r => r.resolved).length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => setShowSideEffectModal(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Report Side Effect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => setShowReactionModal(true)}
          >
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.secondaryActionText}>Report Reaction</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Side Effects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Side Effects</Text>
          {filteredData.sideEffects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No side effects reported</Text>
              <Text style={styles.emptySubtext}>
                Track any symptoms you experience while taking medications
              </Text>
            </View>
          ) : (
            <View style={styles.reportsList}>
              {filteredData.sideEffects.map((effect) => (
                <View key={effect.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportMedication}>{effect.medicationName}</Text>
                      <Text style={styles.reportSymptom}>{effect.symptom}</Text>
                    </View>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: `${getSeverityColor(effect.severity)}20` }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: getSeverityColor(effect.severity) }
                      ]}>
                        {effect.severity}
                      </Text>
                    </View>
                  </View>
                  
                  {effect.description && (
                    <Text style={styles.reportDescription}>{effect.description}</Text>
                  )}
                  
                  <View style={styles.reportFooter}>
                    <View style={styles.timestampContainer}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={styles.timestamp}>{formatDate(effect.timestamp)}</Text>
                    </View>
                    {effect.resolved && (
                      <Text style={styles.resolvedText}>✓ Resolved</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Reactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reactions</Text>
          {filteredData.reactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No reactions reported</Text>
              <Text style={styles.emptySubtext}>
                Report any allergic or adverse reactions to medications
              </Text>
            </View>
          ) : (
            <View style={styles.reportsList}>
              {filteredData.reactions.map((reaction) => (
                <View key={reaction.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportMedication}>{reaction.medicationName}</Text>
                      <Text style={styles.reportSymptom}>
                        {reaction.reactionType.charAt(0).toUpperCase() + reaction.reactionType.slice(1)} Reaction
                      </Text>
                    </View>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: `${getSeverityColor(reaction.severity)}20` }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: getSeverityColor(reaction.severity) }
                      ]}>
                        {reaction.severity}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.symptomsText}>
                    Symptoms: {reaction.symptoms.join(', ')}
                  </Text>
                  
                  <Text style={styles.reportDescription}>{reaction.description}</Text>
                  
                  {reaction.actionTaken && (
                    <Text style={styles.actionTaken}>Action: {reaction.actionTaken}</Text>
                  )}
                  
                  <View style={styles.reportFooter}>
                    <View style={styles.timestampContainer}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={styles.timestamp}>{formatDate(reaction.timestamp)}</Text>
                    </View>
                    {reaction.resolved && (
                      <Text style={styles.resolvedText}>✓ Resolved</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Important Note</Text>
          <Text style={styles.disclaimerText}>
            This information is for tracking purposes only. Always consult your healthcare provider 
            about any side effects or reactions you experience. In case of severe reactions or 
            medical emergencies, seek immediate medical attention.
          </Text>
        </View>
      </ScrollView>

      <SideEffectModal
        visible={showSideEffectModal}
        onClose={() => setShowSideEffectModal(false)}
        onAdd={addSideEffect}
        medications={medicationNames}
      />

      <ReactionReportModal
        visible={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        onAdd={addReactionReport}
        medications={medicationNames}
      />
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  secondaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  reportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportMedication: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  reportSymptom: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  reportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  symptomsText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#7C2D12',
    marginBottom: 8,
  },
  actionTaken: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  resolvedText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
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
});