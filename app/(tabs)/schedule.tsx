import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Pill, ChevronLeft, ChevronRight, Share2 } from 'lucide-react-native';
import { useMedications } from '@/hooks/useMedications';
import { ShareScheduleModal } from '@/components/ShareScheduleModal';
import { useResponsive, getResponsiveValue } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function ScheduleScreen() {
  const { medications, generateSchedule } = useMedications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showShareModal, setShowShareModal] = useState(false);
  const screenSize = useResponsive();
  
  const schedule = generateSchedule(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#10B981';
      case 'missed': return '#EF4444';
      case 'upcoming': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken': return '✓ Taken';
      case 'missed': return '✗ Missed';
      case 'upcoming': return '○ Upcoming';
      default: return '○ Scheduled';
    }
  };

  const scheduleColumns = getResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }, screenSize) || 1;

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={1400}>
        <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
          <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>Medication Schedule</Text>
          <TouchableOpacity
            style={[styles.shareButton, screenSize.isDesktop && styles.shareButtonDesktop]}
            onPress={() => setShowShareModal(true)}
          >
            <Share2 size={screenSize.isDesktop ? 24 : 20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View style={[styles.dateNavigation, screenSize.isDesktop && styles.dateNavigationDesktop]}>
          <TouchableOpacity
            style={[styles.dateButton, screenSize.isDesktop && styles.dateButtonDesktop]}
            onPress={() => changeDate('prev')}
          >
            <ChevronLeft size={screenSize.isDesktop ? 24 : 20} color="#2563EB" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, screenSize.isDesktop && styles.dateTextDesktop]}>{formatDate(selectedDate)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.dateButton, screenSize.isDesktop && styles.dateButtonDesktop]}
            onPress={() => changeDate('next')}
          >
            <ChevronRight size={screenSize.isDesktop ? 24 : 20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {schedule.length === 0 ? (
            <View style={[styles.emptyContainer, screenSize.isDesktop && styles.emptyContainerDesktop]}>
              <Calendar size={screenSize.isDesktop ? 64 : 48} color="#94A3B8" />
              <Text style={[styles.emptyTitle, screenSize.isDesktop && styles.emptyTitleDesktop]}>No medications scheduled</Text>
              <Text style={[styles.emptySubtitle, screenSize.isDesktop && styles.emptySubtitleDesktop]}>
                Add medications to see your personalized schedule
              </Text>
            </View>
          ) : (
            <View style={[
              styles.scheduleList,
              screenSize.isDesktop && styles.scheduleListDesktop,
              {
                flexDirection: screenSize.isDesktop ? 'row' : 'column',
                flexWrap: screenSize.isDesktop ? 'wrap' : 'nowrap',
              }
            ]}>
              {schedule.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.scheduleCard,
                    screenSize.isDesktop && styles.scheduleCardDesktop,
                    screenSize.isDesktop && {
                      width: `${100 / scheduleColumns - 2}%`,
                      marginRight: '2%',
                    }
                  ]}
                >
                  <View style={[styles.timeContainer, screenSize.isDesktop && styles.timeContainerDesktop]}>
                    <View style={[styles.timeCircle, screenSize.isDesktop && styles.timeCircleDesktop]}>
                      <Clock size={screenSize.isDesktop ? 20 : 16} color="#2563EB" />
                    </View>
                    <Text style={[styles.timeText, screenSize.isDesktop && styles.timeTextDesktop]}>{formatTime(item.time)}</Text>
                  </View>

                  <View style={styles.medicationContainer}>
                    <View style={styles.medicationHeader}>
                      <View style={styles.medicationInfo}>
                        <Text style={[styles.medicationName, screenSize.isDesktop && styles.medicationNameDesktop]}>{item.medication}</Text>
                        <Text style={[styles.medicationDosage, screenSize.isDesktop && styles.medicationDosageDesktop]}>{item.dosage}</Text>
                      </View>
                      
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(item.status)}20` }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                          screenSize.isDesktop && styles.statusTextDesktop
                        ]}>
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    </View>

                    {item.notes && (
                      <Text style={[styles.scheduleNotes, screenSize.isDesktop && styles.scheduleNotesDesktop]}>{item.notes}</Text>
                    )}

                    {item.interactions && item.interactions.length > 0 && (
                      <View style={styles.interactionWarning}>
                        <Text style={[styles.interactionText, screenSize.isDesktop && styles.interactionTextDesktop]}>
                          ⚠️ Take 2 hours apart from other medications
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {medications.length > 0 && (
            <View style={[styles.summaryCard, screenSize.isDesktop && styles.summaryCardDesktop]}>
              <Text style={[styles.summaryTitle, screenSize.isDesktop && styles.summaryTitleDesktop]}>Daily Summary</Text>
              <View style={[styles.summaryStats, screenSize.isDesktop && styles.summaryStatsDesktop]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, screenSize.isDesktop && styles.summaryNumberDesktop]}>
                    {schedule.filter(s => s.status === 'taken').length}
                  </Text>
                  <Text style={[styles.summaryLabel, screenSize.isDesktop && styles.summaryLabelDesktop]}>Taken</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, screenSize.isDesktop && styles.summaryNumberDesktop]}>
                    {schedule.filter(s => s.status === 'upcoming').length}
                  </Text>
                  <Text style={[styles.summaryLabel, screenSize.isDesktop && styles.summaryLabelDesktop]}>Upcoming</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, screenSize.isDesktop && styles.summaryNumberDesktop]}>
                    {schedule.filter(s => s.status === 'missed').length}
                  </Text>
                  <Text style={[styles.summaryLabel, screenSize.isDesktop && styles.summaryLabelDesktop]}>Missed</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <ShareScheduleModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  titleDesktop: {
    fontSize: 32,
  },
  shareButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonDesktop: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dateNavigationDesktop: {
    paddingHorizontal: 0,
    marginBottom: 32,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateButtonDesktop: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    textAlign: 'center',
  },
  dateTextDesktop: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainerDesktop: {
    paddingVertical: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTitleDesktop: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptySubtitleDesktop: {
    fontSize: 16,
  },
  scheduleList: {
    gap: 16,
    paddingBottom: 32,
  },
  scheduleListDesktop: {
    gap: 20,
    paddingBottom: 40,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleCardDesktop: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    marginBottom: 20,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  timeContainerDesktop: {
    marginRight: 20,
    minWidth: 100,
  },
  timeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeCircleDesktop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    textAlign: 'center',
  },
  timeTextDesktop: {
    fontSize: 14,
  },
  medicationContainer: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  medicationNameDesktop: {
    fontSize: 18,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  medicationDosageDesktop: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statusTextDesktop: {
    fontSize: 14,
  },
  scheduleNotes: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  scheduleNotesDesktop: {
    fontSize: 14,
  },
  interactionWarning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  interactionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
  },
  interactionTextDesktop: {
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCardDesktop: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    maxWidth: 600,
    alignSelf: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryTitleDesktop: {
    fontSize: 22,
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatsDesktop: {
    gap: 40,
    justifyContent: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  summaryNumberDesktop: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  summaryLabelDesktop: {
    fontSize: 14,
  },
});