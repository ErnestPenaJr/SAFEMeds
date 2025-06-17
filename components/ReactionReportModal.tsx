import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, TriangleAlert as AlertTriangle, Phone } from 'lucide-react-native';
import { ReactionReport, COMMON_SYMPTOMS } from '@/hooks/useMedications';

interface ReactionReportModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (report: Omit<ReactionReport, 'id' | 'timestamp'>) => void;
  medications: string[];
}

export function ReactionReportModal({ visible, onClose, onAdd, medications }: ReactionReportModalProps) {
  const [formData, setFormData] = useState({
    medicationName: '',
    reactionType: 'adverse' as 'allergic' | 'adverse' | 'unexpected',
    symptoms: [] as string[],
    severity: 'moderate' as 'mild' | 'moderate' | 'severe' | 'life-threatening',
    description: '',
    actionTaken: '',
  });

  const handleSubmit = () => {
    if (!formData.medicationName.trim() || formData.symptoms.length === 0 || !formData.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (formData.severity === 'life-threatening') {
      Alert.alert(
        'Emergency Situation',
        'For life-threatening reactions, please contact emergency services immediately (911) or go to the nearest emergency room.',
        [
          { text: 'Call 911', onPress: () => {}, style: 'destructive' },
          { text: 'Continue Report', onPress: submitReport }
        ]
      );
      return;
    }

    submitReport();
  };

  const submitReport = () => {
    onAdd({
      medicationName: formData.medicationName,
      reactionType: formData.reactionType,
      symptoms: formData.symptoms,
      severity: formData.severity,
      description: formData.description,
      actionTaken: formData.actionTaken.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      medicationName: '',
      reactionType: 'adverse',
      symptoms: [],
      severity: 'moderate',
      description: '',
      actionTaken: '',
    });
    onClose();
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
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

  const getReactionTypeColor = (type: string) => {
    switch (type) {
      case 'allergic': return '#EF4444';
      case 'adverse': return '#F59E0B';
      case 'unexpected': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.title}>Report Reaction</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.emergencyBanner}>
            <Phone size={16} color="#7C2D12" />
            <Text style={styles.emergencyText}>
              For medical emergencies, call 911 immediately
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Medication *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationScroll}>
              <View style={styles.medicationChips}>
                {medications.map((medication) => (
                  <TouchableOpacity
                    key={medication}
                    style={[
                      styles.medicationChip,
                      formData.medicationName === medication && styles.medicationChipSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, medicationName: medication }))}
                  >
                    <Text style={[
                      styles.medicationChipText,
                      formData.medicationName === medication && styles.medicationChipTextSelected
                    ]}>
                      {medication}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Reaction Type *</Text>
            <View style={styles.reactionTypeContainer}>
              {([
                { key: 'allergic', label: 'Allergic Reaction' },
                { key: 'adverse', label: 'Adverse Effect' },
                { key: 'unexpected', label: 'Unexpected Response' }
              ] as const).map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.reactionTypeChip,
                    formData.reactionType === key && {
                      backgroundColor: `${getReactionTypeColor(key)}20`,
                      borderColor: getReactionTypeColor(key)
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, reactionType: key }))}
                >
                  <Text style={[
                    styles.reactionTypeText,
                    formData.reactionType === key && {
                      color: getReactionTypeColor(key)
                    }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Symptoms * (Select all that apply)</Text>
            <View style={styles.symptomsGrid}>
              {COMMON_SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomChip,
                    formData.symptoms.includes(symptom) && styles.symptomChipSelected
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text style={[
                    styles.symptomText,
                    formData.symptoms.includes(symptom) && styles.symptomTextSelected
                  ]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Severity *</Text>
            <View style={styles.severityContainer}>
              {([
                { key: 'mild', label: 'Mild' },
                { key: 'moderate', label: 'Moderate' },
                { key: 'severe', label: 'Severe' },
                { key: 'life-threatening', label: 'Life-threatening' }
              ] as const).map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.severityChip,
                    formData.severity === key && {
                      backgroundColor: `${getSeverityColor(key)}20`,
                      borderColor: getSeverityColor(key)
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, severity: key }))}
                >
                  <Text style={[
                    styles.severityText,
                    formData.severity === key && {
                      color: getSeverityColor(key)
                    }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Detailed Description *</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Describe the reaction in detail: when it started, how it progressed, duration, etc."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Action Taken (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="What did you do? (e.g., stopped medication, took antihistamine, contacted doctor)"
              value={formData.actionTaken}
              onChangeText={(text) => setFormData(prev => ({ ...prev, actionTaken: text }))}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
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
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#7C2D12',
  },
  emergencyText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7C2D12',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  medicationScroll: {
    marginBottom: 8,
  },
  medicationChips: {
    flexDirection: 'row',
    gap: 8,
  },
  medicationChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicationChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  medicationChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  medicationChipTextSelected: {
    color: '#FFFFFF',
  },
  reactionTypeContainer: {
    gap: 8,
  },
  reactionTypeChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reactionTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textAlign: 'center',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  symptomChipSelected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  symptomText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  symptomTextSelected: {
    color: '#FFFFFF',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  severityChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});