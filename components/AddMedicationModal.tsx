import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { X, Search, Pill, CircleAlert as AlertCircle, Plus, Trash2, Check } from 'lucide-react-native';
import { useMedications, Medication } from '@/hooks/useMedications';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (medication: Medication) => void;
}

interface MedicationForm {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  searchResults: string[];
  spellingSuggestions: string[];
  showSuggestions: boolean;
  isSearching: boolean;
  searchError: string;
}

export function AddMedicationModal({ visible, onClose, onAdd }: AddMedicationModalProps) {
  const { searchMedications, getSpellingSuggestions } = useMedications();
  const [medications, setMedications] = useState<MedicationForm[]>([
    {
      id: '1',
      name: '',
      dosage: '',
      frequency: '',
      notes: '',
      searchResults: [],
      spellingSuggestions: [],
      showSuggestions: false,
      isSearching: false,
      searchError: '',
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const frequencies = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
  ];

  const addNewMedicationForm = () => {
    const newId = (medications.length + 1).toString();
    setMedications(prev => [...prev, {
      id: newId,
      name: '',
      dosage: '',
      frequency: '',
      notes: '',
      searchResults: [],
      spellingSuggestions: [],
      showSuggestions: false,
      isSearching: false,
      searchError: '',
    }]);
  };

  const removeMedicationForm = (id: string) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, updates: Partial<MedicationForm>) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, ...updates } : med
    ));
  };

  const handleNameChange = async (id: string, text: string) => {
    updateMedication(id, { name: text, searchError: '' });
    
    if (text.length >= 2) {
      updateMedication(id, { isSearching: true, showSuggestions: true });
      
      try {
        const results = await searchMedications(text);
        updateMedication(id, { searchResults: results });
        
        // If no results found, try spelling suggestions
        if (results.length === 0 && text.length >= 3) {
          const suggestions = await getSpellingSuggestions(text);
          updateMedication(id, { spellingSuggestions: suggestions });
        } else {
          updateMedication(id, { spellingSuggestions: [] });
        }
      } catch (error) {
        updateMedication(id, { 
          searchError: 'Unable to search medications. Please check your connection.',
          searchResults: [],
          spellingSuggestions: []
        });
      } finally {
        updateMedication(id, { isSearching: false });
      }
    } else {
      updateMedication(id, { 
        showSuggestions: false,
        searchResults: [],
        spellingSuggestions: []
      });
    }
  };

  const selectMedication = (id: string, medicationName: string) => {
    updateMedication(id, { 
      name: medicationName,
      showSuggestions: false,
      searchResults: [],
      spellingSuggestions: []
    });
  };

  const selectFrequency = (id: string, frequency: string) => {
    updateMedication(id, { frequency });
  };

  const validateMedications = () => {
    const validMedications = medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    );

    if (validMedications.length === 0) {
      Alert.alert('Missing Information', 'Please fill in at least one complete medication (name, dosage, and frequency).');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateMedications()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validMedications = medications.filter(med => 
        med.name.trim() && med.dosage.trim() && med.frequency.trim()
      );

      // Add medications one by one
      for (const med of validMedications) {
        const medication: Medication = {
          name: med.name.trim(),
          dosage: med.dosage.trim(),
          frequency: med.frequency.trim(),
          notes: med.notes.trim() || undefined,
          active: true,
        };

        await onAdd(medication);
      }

      Alert.alert(
        'Success', 
        `${validMedications.length} medication${validMedications.length > 1 ? 's' : ''} added successfully!`
      );
      
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add medications. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMedications([{
      id: '1',
      name: '',
      dosage: '',
      frequency: '',
      notes: '',
      searchResults: [],
      spellingSuggestions: [],
      showSuggestions: false,
      isSearching: false,
      searchError: '',
    }]);
    onClose();
  };

  // Reset search state when modal closes
  useEffect(() => {
    if (!visible) {
      setMedications([{
        id: '1',
        name: '',
        dosage: '',
        frequency: '',
        notes: '',
        searchResults: [],
        spellingSuggestions: [],
        showSuggestions: false,
        isSearching: false,
        searchError: '',
      }]);
    }
  }, [visible]);

  const renderMedicationForm = (medication: MedicationForm, index: number) => (
    <View key={medication.id} style={styles.medicationForm}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          Medication {index + 1}
        </Text>
        {medications.length > 1 && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeMedicationForm(medication.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Medication Name *</Text>
        <View style={styles.inputContainer}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Type medication name..."
            value={medication.name}
            onChangeText={(text) => handleNameChange(medication.id, text)}
            placeholderTextColor="#94A3B8"
          />
          {medication.isSearching && (
            <ActivityIndicator size="small" color="#2563EB" />
          )}
        </View>
        
        {medication.searchError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={styles.errorText}>{medication.searchError}</Text>
          </View>
        )}
        
        {medication.showSuggestions && (medication.searchResults.length > 0 || medication.spellingSuggestions.length > 0) && (
          <View style={styles.suggestions}>
            {medication.searchResults.length > 0 && (
              <>
                <Text style={styles.suggestionHeader}>Medications</Text>
                <FlatList
                  data={medication.searchResults.slice(0, 5)}
                  keyExtractor={(item) => `${medication.id}-${item}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectMedication(medication.id, item)}
                    >
                      <Pill size={16} color="#2563EB" />
                      <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                  nestedScrollEnabled
                />
              </>
            )}
            
            {medication.spellingSuggestions.length > 0 && (
              <>
                <Text style={styles.suggestionHeader}>Did you mean?</Text>
                <FlatList
                  data={medication.spellingSuggestions.slice(0, 3)}
                  keyExtractor={(item) => `${medication.id}-spell-${item}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleNameChange(medication.id, item)}
                    >
                      <Search size={16} color="#F59E0B" />
                      <Text style={[styles.suggestionText, { color: '#F59E0B' }]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                  nestedScrollEnabled
                />
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dosage *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 500mg, 10ml, 2 tablets"
          value={medication.dosage}
          onChangeText={(text) => updateMedication(medication.id, { dosage: text })}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency *</Text>
        <View style={styles.frequencyGrid}>
          {frequencies.map((frequency) => (
            <TouchableOpacity
              key={`${medication.id}-${frequency}`}
              style={[
                styles.frequencyChip,
                medication.frequency === frequency && styles.frequencyChipSelected
              ]}
              onPress={() => selectFrequency(medication.id, frequency)}
            >
              <Text style={[
                styles.frequencyText,
                medication.frequency === frequency && styles.frequencyTextSelected
              ]}>
                {frequency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          placeholder="Additional instructions, warnings, etc."
          value={medication.notes}
          onChangeText={(text) => updateMedication(medication.id, { notes: text })}
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const completedMedications = medications.filter(med => 
    med.name.trim() && med.dosage.trim() && med.frequency.trim()
  ).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Medications</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {medications.map((medication, index) => renderMedicationForm(medication, index))}

          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={addNewMedicationForm}
          >
            <Plus size={20} color="#2563EB" />
            <Text style={styles.addMoreText}>Add Another Medication</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              💡 Medication information is provided by the National Library of Medicine (NLM) RxNav database. Always verify with your healthcare provider.
            </Text>
          </View>

          {completedMedications > 0 && (
            <View style={styles.summaryCard}>
              <Check size={20} color="#10B981" />
              <Text style={styles.summaryText}>
                {completedMedications} medication{completedMedications > 1 ? 's' : ''} ready to add
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.addButton,
              (completedMedications === 0 || isSubmitting) && styles.addButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={completedMedications === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>
                Add {completedMedications > 0 ? `${completedMedications} ` : ''}Medication{completedMedications > 1 ? 's' : ''}
              </Text>
            )}
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  medicationForm: {
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
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    flex: 1,
  },
  suggestions: {
    marginTop: 8,
  },
  suggestionHeader: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  frequencyChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  frequencyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  frequencyTextSelected: {
    color: '#FFFFFF',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
  },
  addMoreText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  disclaimer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 18,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
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
  addButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});