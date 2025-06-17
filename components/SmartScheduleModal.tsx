import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { X, Clock, Calendar, Utensils, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Settings, Zap } from 'lucide-react-native';
import { 
  medicationScheduler, 
  convertMedicationsToTiming, 
  formatScheduleTime,
  DailySchedule,
  ScheduleSlot 
} from '@/lib/medicationScheduling';
import { useMedications } from '@/hooks/useMedications';

interface SmartScheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SmartScheduleModal({ visible, onClose }: SmartScheduleModalProps) {
  const { medications } = useMedications();
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    wakeUpTime: '07:00',
    bedTime: '22:00',
    breakfastTime: '07:30',
    lunchTime: '12:30',
    dinnerTime: '18:30',
    workStart: '09:00',
    workEnd: '17:00',
    includeWeekends: true,
    considerFoodInteractions: true,
    optimizeForCompliance: true,
  });
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (visible && medications.length > 0) {
      generateSchedule();
    }
  }, [visible, medications]);

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const medicationTimings = convertMedicationsToTiming(medications.filter(med => med.active !== false));
      const generatedSchedule = medicationScheduler.generateOptimalSchedule(medicationTimings);
      setSchedule(generatedSchedule);
    } catch (error) {
      console.error('Error generating schedule:', error);
      Alert.alert('Error', 'Failed to generate optimal schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSchedule = () => {
    Alert.alert(
      'Regenerate Schedule',
      'This will create a new optimized schedule based on your current preferences. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', onPress: generateSchedule }
      ]
    );
  };

  const getMealTimingIcon = (mealTiming?: string) => {
    switch (mealTiming) {
      case 'before': return '🍽️ Before meal';
      case 'with': return '🍽️ With meal';
      case 'after': return '🍽️ After meal';
      case 'between': return '⏰ Between meals';
      default: return '💊 Any time';
    }
  };

  const getSeverityColor = (hasWarnings: boolean) => {
    return hasWarnings ? '#F59E0B' : '#10B981';
  };

  const renderScheduleSlot = (slot: ScheduleSlot, index: number) => (
    <View key={index} style={styles.scheduleSlot}>
      <View style={styles.slotHeader}>
        <View style={styles.timeContainer}>
          <Clock size={20} color="#2563EB" />
          <Text style={styles.slotTime}>{formatScheduleTime(slot.time)}</Text>
        </View>
        <View style={styles.mealTimingContainer}>
          <Text style={styles.mealTiming}>{getMealTimingIcon(slot.mealTiming)}</Text>
        </View>
      </View>

      <View style={styles.medicationsContainer}>
        {slot.medications.map((med, medIndex) => (
          <View key={medIndex} style={styles.medicationItem}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationDosage}>{med.dosage}</Text>
              {med.notes && (
                <Text style={styles.medicationNotes}>{med.notes}</Text>
              )}
            </View>
            {med.warnings && med.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                {med.warnings.map((warning, wIndex) => (
                  <Text key={wIndex} style={styles.warningText}>⚠️ {warning}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {slot.instructions && slot.instructions.length > 0 && (
        <View style={styles.instructionsContainer}>
          {slot.instructions.map((instruction, iIndex) => (
            <Text key={iIndex} style={styles.instructionText}>💡 {instruction}</Text>
          ))}
        </View>
      )}

      {slot.warnings && slot.warnings.length > 0 && (
        <View style={styles.slotWarningsContainer}>
          {slot.warnings.map((warning, wIndex) => (
            <Text key={wIndex} style={styles.slotWarningText}>⚠️ {warning}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.preferencesContainer}>
      <Text style={styles.preferencesTitle}>Schedule Preferences</Text>
      
      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Daily Schedule</Text>
        
        <View style={styles.timeInputRow}>
          <Text style={styles.timeLabel}>Wake up time:</Text>
          <TextInput
            style={styles.timeInput}
            value={preferences.wakeUpTime}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, wakeUpTime: text }))}
            placeholder="07:00"
          />
        </View>
        
        <View style={styles.timeInputRow}>
          <Text style={styles.timeLabel}>Bedtime:</Text>
          <TextInput
            style={styles.timeInput}
            value={preferences.bedTime}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, bedTime: text }))}
            placeholder="22:00"
          />
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Meal Times</Text>
        
        <View style={styles.timeInputRow}>
          <Text style={styles.timeLabel}>Breakfast:</Text>
          <TextInput
            style={styles.timeInput}
            value={preferences.breakfastTime}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, breakfastTime: text }))}
            placeholder="07:30"
          />
        </View>
        
        <View style={styles.timeInputRow}>
          <Text style={styles.timeLabel}>Lunch:</Text>
          <TextInput
            style={styles.timeInput}
            value={preferences.lunchTime}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, lunchTime: text }))}
            placeholder="12:30"
          />
        </View>
        
        <View style={styles.timeInputRow}>
          <Text style={styles.timeLabel}>Dinner:</Text>
          <TextInput
            style={styles.timeInput}
            value={preferences.dinnerTime}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, dinnerTime: text }))}
            placeholder="18:30"
          />
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Optimization Options</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Consider food interactions</Text>
          <Switch
            value={preferences.considerFoodInteractions}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, considerFoodInteractions: value }))}
            trackColor={{ false: '#F1F5F9', true: '#DBEAFE' }}
            thumbColor={preferences.considerFoodInteractions ? '#2563EB' : '#94A3B8'}
          />
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Optimize for compliance</Text>
          <Switch
            value={preferences.optimizeForCompliance}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, optimizeForCompliance: value }))}
            trackColor={{ false: '#F1F5F9', true: '#DBEAFE' }}
            thumbColor={preferences.optimizeForCompliance ? '#2563EB' : '#94A3B8'}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={generateSchedule}>
        <Zap size={20} color="#FFFFFF" />
        <Text style={styles.applyButtonText}>Apply & Regenerate</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Calendar size={24} color="#2563EB" />
            <Text style={styles.title}>Smart Medication Schedule</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowPreferences(!showPreferences)}
            >
              <Settings size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {showPreferences ? (
            renderPreferences()
          ) : (
            <>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Generating optimal schedule...</Text>
                  <Text style={styles.loadingSubtext}>
                    Analyzing drug interactions, food requirements, and timing constraints
                  </Text>
                </View>
              ) : schedule ? (
                <>
                  {/* Schedule Overview */}
                  <View style={styles.overviewCard}>
                    <Text style={styles.overviewTitle}>Schedule for {schedule.date.toLocaleDateString()}</Text>
                    <View style={styles.overviewStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{schedule.slots.length}</Text>
                        <Text style={styles.statLabel}>Time Slots</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                          {schedule.slots.reduce((total, slot) => total + slot.medications.length, 0)}
                        </Text>
                        <Text style={styles.statLabel}>Doses</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{schedule.warnings.length}</Text>
                        <Text style={styles.statLabel}>Warnings</Text>
                      </View>
                    </View>
                  </View>

                  {/* General Warnings */}
                  {schedule.warnings.length > 0 && (
                    <View style={styles.warningsCard}>
                      <View style={styles.warningsHeader}>
                        <AlertTriangle size={20} color="#F59E0B" />
                        <Text style={styles.warningsTitle}>Important Warnings</Text>
                      </View>
                      {schedule.warnings.map((warning, index) => (
                        <Text key={index} style={styles.generalWarning}>{warning}</Text>
                      ))}
                    </View>
                  )}

                  {/* Schedule Slots */}
                  <View style={styles.scheduleContainer}>
                    <Text style={styles.scheduleTitle}>Daily Schedule</Text>
                    {schedule.slots.map((slot, index) => renderScheduleSlot(slot, index))}
                  </View>

                  {/* General Instructions */}
                  {schedule.generalInstructions.length > 0 && (
                    <View style={styles.instructionsCard}>
                      <View style={styles.instructionsHeader}>
                        <CheckCircle size={20} color="#10B981" />
                        <Text style={styles.instructionsTitle}>General Instructions</Text>
                      </View>
                      {schedule.generalInstructions.map((instruction, index) => (
                        <Text key={index} style={styles.generalInstruction}>• {instruction}</Text>
                      ))}
                    </View>
                  )}

                  {/* Meal Plan */}
                  {schedule.mealPlan && (
                    <View style={styles.mealPlanCard}>
                      <View style={styles.mealPlanHeader}>
                        <Utensils size={20} color="#8B5CF6" />
                        <Text style={styles.mealPlanTitle}>Recommended Meal Plan</Text>
                      </View>
                      
                      <View style={styles.mealItem}>
                        <Text style={styles.mealName}>🌅 Breakfast</Text>
                        <Text style={styles.mealDescription}>{schedule.mealPlan.breakfast}</Text>
                      </View>
                      
                      <View style={styles.mealItem}>
                        <Text style={styles.mealName}>☀️ Lunch</Text>
                        <Text style={styles.mealDescription}>{schedule.mealPlan.lunch}</Text>
                      </View>
                      
                      <View style={styles.mealItem}>
                        <Text style={styles.mealName}>🌆 Dinner</Text>
                        <Text style={styles.mealDescription}>{schedule.mealPlan.dinner}</Text>
                      </View>

                      {schedule.mealPlan.snacks && (
                        <View style={styles.snacksContainer}>
                          <Text style={styles.snacksTitle}>Additional Notes:</Text>
                          {schedule.mealPlan.snacks.map((snack, index) => (
                            <Text key={index} style={styles.snackItem}>• {snack}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerateSchedule}>
                    <Zap size={20} color="#2563EB" />
                    <Text style={styles.regenerateButtonText}>Regenerate Schedule</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Calendar size={48} color="#94A3B8" />
                  <Text style={styles.emptyTitle}>No medications to schedule</Text>
                  <Text style={styles.emptySubtitle}>
                    Add medications to generate an optimized schedule
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  overviewStats: {
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
  warningsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginLeft: 8,
  },
  generalWarning: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginBottom: 4,
  },
  scheduleContainer: {
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  scheduleSlot: {
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
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 8,
  },
  mealTimingContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mealTiming: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  medicationsContainer: {
    gap: 8,
  },
  medicationItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  medicationInfo: {
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  medicationNotes: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  warningsContainer: {
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
  },
  instructionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
    marginBottom: 2,
  },
  slotWarningsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  slotWarningText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginBottom: 2,
  },
  instructionsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginLeft: 8,
  },
  generalInstruction: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#047857',
    marginBottom: 4,
  },
  mealPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mealPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealPlanTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#7C3AED',
    marginLeft: 8,
  },
  mealItem: {
    marginBottom: 12,
  },
  mealName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  snacksContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  snacksTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  snackItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  regenerateButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  regenerateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  preferencesContainer: {
    paddingBottom: 32,
  },
  preferencesTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 24,
  },
  preferenceSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  timeInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 80,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    flex: 1,
  },
  applyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});