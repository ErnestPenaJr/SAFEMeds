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
import { X, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { SideEffect, COMMON_SYMPTOMS } from '@/hooks/useMedications';

interface SideEffectModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sideEffect: Omit<SideEffect, 'id' | 'timestamp'>) => void;
  medications: string[];
}

export function SideEffectModal({ visible, onClose, onAdd, medications }: SideEffectModalProps) {
  const [formData, setFormData] = useState({
    medicationName: '',
    symptom: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.medicationName.trim() || !formData.symptom.trim()) {
      Alert.alert('Missing Information', 'Please select a medication and symptom.');
      return;
    }

    onAdd({
      medicationName: formData.medicationName,
      symptom: formData.symptom,
      severity: formData.severity,
      description: formData.description.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      medicationName: '',
      symptom: '',
      severity: 'mild',
      description: '',
    });
    onClose();
  };

  const selectSymptom = (symptom: string) => {
    setFormData(prev => ({ ...prev, symptom }));
  };

  const selectSeverity = (severity: 'mild' | 'moderate' | 'severe') => {
    setFormData(prev => ({ ...prev, severity }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'severe': return '#EF4444';
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
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.title}>Report Side Effect</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.label}>Symptom *</Text>
            <View style={styles.symptomsGrid}>
              {COMMON_SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomChip,
                    formData.symptom === symptom && styles.symptomChipSelected
                  ]}
                  onPress={() => selectSymptom(symptom)}
                >
                  <Text style={[
                    styles.symptomText,
                    formData.symptom === symptom && styles.symptomTextSelected
                  ]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.orText}>Or enter custom symptom:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your symptom..."
              value={formData.symptom.includes(COMMON_SYMPTOMS.join('|')) ? '' : formData.symptom}
              onChangeText={(text) => setFormData(prev => ({ ...prev, symptom: text }))}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Severity *</Text>
            <View style={styles.severityContainer}>
              {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.severityChip,
                    formData.severity === severity && {
                      backgroundColor: `${getSeverityColor(severity)}20`,
                      borderColor: getSeverityColor(severity)
                    }
                  ]}
                  onPress={() => selectSeverity(severity)}
                >
                  <Text style={[
                    styles.severityText,
                    formData.severity === severity && {
                      color: getSeverityColor(severity)
                    }
                  ]}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Additional Details (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Describe when it started, how long it lasted, what helped, etc."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ If you're experiencing severe symptoms or a medical emergency, contact your healthcare provider or emergency services immediately.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Report Side Effect</Text>
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
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  symptomText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  symptomTextSelected: {
    color: '#FFFFFF',
  },
  orText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
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
  severityContainer: {
    flexDirection: 'row',
    gap: 12,
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
    lineHeight: 18,
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
    backgroundColor: '#F59E0B',
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