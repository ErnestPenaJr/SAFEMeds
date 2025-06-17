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
import { X, Search, Pill, CircleAlert as AlertCircle, Save } from 'lucide-react-native';
import { useMedications, Medication } from '@/hooks/useMedications';

interface EditMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (medication: Medication) => void;
  medication?: Medication;
}

export function EditMedicationModal({ visible, onClose, onUpdate, medication }: EditMedicationModalProps) {
  const { searchMedications, getSpellingSuggestions } = useMedications();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: '',
  });
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [spellingSuggestions, setSpellingSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
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

  // Initialize form data when medication prop changes
  useEffect(() => {
    if (medication && visible) {
      setFormData({
        name: medication.name || '',
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        notes: medication.notes || '',
      });
    }
  }, [medication, visible]);

  const handleNameChange = async (text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
    setSearchError('');
    
    if (text.length >= 2) {
      setIsSearching(true);
      setShowSuggestions(true);
      
      try {
        const results = await searchMedications(text);
        setSearchResults(results);
        
        // If no results found, try spelling suggestions
        if (results.length === 0 && text.length >= 3) {
          const suggestions = await getSpellingSuggestions(text);
          setSpellingSuggestions(suggestions);
        } else {
          setSpellingSuggestions([]);
        }
      } catch (error) {
        setSearchError('Unable to search medications. Please check your connection.');
        setSearchResults([]);
        setSpellingSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSuggestions(false);
      setSearchResults([]);
      setSpellingSuggestions([]);
    }
  };

  const selectMedication = (medicationName: string) => {
    setFormData(prev => ({ ...prev, name: medicationName }));
    setShowSuggestions(false);
    setSearchResults([]);
    setSpellingSuggestions([]);
  };

  const selectFrequency = (frequency: string) => {
    setFormData(prev => ({ ...prev, frequency }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a medication name.');
      return false;
    }
    
    if (!formData.dosage.trim()) {
      Alert.alert('Missing Information', 'Please enter the dosage.');
      return false;
    }
    
    if (!formData.frequency.trim()) {
      Alert.alert('Missing Information', 'Please select a frequency.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedMedication: Medication = {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency.trim(),
        notes: formData.notes.trim() || undefined,
        active: medication?.active ?? true,
        rxcui: medication?.rxcui,
        start_date: medication?.start_date,
        end_date: medication?.end_date,
        nextDose: medication?.nextDose,
      };

      onUpdate(updatedMedication);
      Alert.alert('Success', 'Medication updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', dosage: '', frequency: '', notes: '' });
    setSearchResults([]);
    setSpellingSuggestions([]);
    setShowSuggestions(false);
    setSearchError('');
    onClose();
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
          <Text style={styles.title}>Edit Medication</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Medication Name *</Text>
            <View style={styles.inputContainer}>
              <Search size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Type medication name..."
                value={formData.name}
                onChangeText={handleNameChange}
                placeholderTextColor="#94A3B8"
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#2563EB" />
              )}
            </View>
            
            {searchError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            )}
            
            {showSuggestions && (searchResults.length > 0 || spellingSuggestions.length > 0) && (
              <View style={styles.suggestions}>
                {searchResults.length > 0 && (
                  <>
                    <Text style={styles.suggestionHeader}>Medications</Text>
                    <FlatList
                      data={searchResults.slice(0, 5)}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.suggestionItem}
                          onPress={() => selectMedication(item)}
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
                
                {spellingSuggestions.length > 0 && (
                  <>
                    <Text style={styles.suggestionHeader}>Did you mean?</Text>
                    <FlatList
                      data={spellingSuggestions.slice(0, 3)}
                      keyExtractor={(item) => `spell-${item}`}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.suggestionItem}
                          onPress={() => handleNameChange(item)}
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
              value={formData.dosage}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Frequency *</Text>
            <View style={styles.frequencyGrid}>
              {frequencies.map((frequency) => (
                <TouchableOpacity
                  key={frequency}
                  style={[
                    styles.frequencyChip,
                    formData.frequency === frequency && styles.frequencyChipSelected
                  ]}
                  onPress={() => selectFrequency(frequency)}
                >
                  <Text style={[
                    styles.frequencyText,
                    formData.frequency === frequency && styles.frequencyTextSelected
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
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              💡 Medication information is provided by the National Library of Medicine (NLM) RxNav database. Always verify with your healthcare provider.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
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
  section: {
    marginBottom: 24,
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
    backgroundColor: '#FFFFFF',
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
  notesInput: {
    height: 80,
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
    backgroundColor: '#FFFFFF',
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
  saveButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});