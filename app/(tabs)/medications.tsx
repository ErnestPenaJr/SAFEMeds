import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, TriangleAlert as AlertTriangle, Clock, Trash2, Share2, CreditCard as Edit3 } from 'lucide-react-native';
import { useMedications } from '@/hooks/useMedications';
import { AddMedicationModal } from '@/components/AddMedicationModal';
import { EditMedicationModal } from '../../components/EditMedicationModal';
import { ShareScheduleModal } from '@/components/ShareScheduleModal';
import { useResponsive, getResponsiveValue } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function MedicationsScreen() {
  const { medications, interactions, addMedication, removeMedication, updateMedication } = useMedications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<{ index: number; medication: any } | null>(null);
  const screenSize = useResponsive();

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMedicationInteractions = (medName: string) => {
    return interactions.filter(interaction =>
      interaction.drugs.some(drug => 
        drug.toLowerCase().includes(medName.toLowerCase()) ||
        medName.toLowerCase().includes(drug.toLowerCase())
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'minor': return '#10B981';
      default: return '#64748B';
    }
  };

  const handleDeleteMedication = (medName: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to remove ${medName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeMedication(medName) }
      ]
    );
  };

  const handleEditMedication = (index: number, medication: any) => {
    setEditingMedication({ index, medication });
    setShowEditModal(true);
  };

  const handleUpdateMedication = (updatedMedication: any) => {
    if (editingMedication) {
      updateMedication(editingMedication.index, updatedMedication);
      setEditingMedication(null);
      setShowEditModal(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditingMedication(null);
    setShowEditModal(false);
  };

  const medicationColumns = getResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }, screenSize) || 1;

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveContainer maxWidth={1400}>
        <View style={[styles.header, screenSize.isDesktop && styles.headerDesktop]}>
          <Text style={[styles.title, screenSize.isDesktop && styles.titleDesktop]}>My Medications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.shareButton, screenSize.isDesktop && styles.shareButtonDesktop]}
              onPress={() => setShowShareModal(true)}
            >
              <Share2 size={screenSize.isDesktop ? 24 : 20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, screenSize.isDesktop && styles.addButtonDesktop]}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={screenSize.isDesktop ? 24 : 20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchContainer, screenSize.isDesktop && styles.searchContainerDesktop]}>
          <Search size={screenSize.isDesktop ? 24 : 20} color="#64748B" />
          <TextInput
            style={[styles.searchInput, screenSize.isDesktop && styles.searchInputDesktop]}
            placeholder="Search medications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredMedications.length === 0 ? (
            <View style={[styles.emptyContainer, screenSize.isDesktop && styles.emptyContainerDesktop]}>
              <Text style={[styles.emptyTitle, screenSize.isDesktop && styles.emptyTitleDesktop]}>No medications added yet</Text>
              <Text style={[styles.emptySubtitle, screenSize.isDesktop && styles.emptySubtitleDesktop]}>
                Tap the + button to add your first medication
              </Text>
            </View>
          ) : (
            <View style={[
              styles.medicationsList,
              screenSize.isDesktop && styles.medicationsListDesktop,
              { 
                flexDirection: screenSize.isDesktop ? 'row' : 'column',
                flexWrap: screenSize.isDesktop ? 'wrap' : 'nowrap',
              }
            ]}>
              {filteredMedications.map((medication, index) => {
                const medInteractions = getMedicationInteractions(medication.name);
                const hasInteractions = medInteractions.length > 0;
                const severestInteraction = medInteractions.reduce((prev, current) => {
                  const severityOrder = { major: 3, moderate: 2, minor: 1 };
                  return severityOrder[current.severity] > severityOrder[prev?.severity || 'minor'] 
                    ? current : prev;
                }, null as any);

                return (
                  <View 
                    key={index} 
                    style={[
                      styles.medicationCard,
                      screenSize.isDesktop && styles.medicationCardDesktop,
                      screenSize.isDesktop && { 
                        width: `${100 / medicationColumns - 2}%`,
                        marginRight: '2%',
                      }
                    ]}
                  >
                    <View style={styles.medicationHeader}>
                      <View style={styles.medicationInfo}>
                        <Text style={[styles.medicationName, screenSize.isDesktop && styles.medicationNameDesktop]}>{medication.name}</Text>
                        <Text style={[styles.medicationDosage, screenSize.isDesktop && styles.medicationDosageDesktop]}>
                          {medication.dosage}<Text> • </Text>{medication.frequency}
                        </Text>
                        {medication.notes && (
                          <Text style={[styles.medicationNotes, screenSize.isDesktop && styles.medicationNotesDesktop]}>{medication.notes}</Text>
                        )}
                      </View>
                      <View style={styles.medicationActions}>
                        <TouchableOpacity
                          style={[styles.editButton, screenSize.isDesktop && styles.editButtonDesktop]}
                          onPress={() => handleEditMedication(index, medication)}
                        >
                          <Edit3 size={screenSize.isDesktop ? 18 : 16} color="#2563EB" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deleteButton, screenSize.isDesktop && styles.deleteButtonDesktop]}
                          onPress={() => handleDeleteMedication(medication.name)}
                        >
                          <Trash2 size={screenSize.isDesktop ? 18 : 16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {hasInteractions && (
                      <View style={styles.interactionAlert}>
                        <View style={styles.interactionHeader}>
                          <AlertTriangle 
                            size={16} 
                            color={getSeverityColor(severestInteraction.severity)} 
                          />
                          <Text style={[
                            styles.interactionText,
                            { color: getSeverityColor(severestInteraction.severity) }
                          ]}>
                            {medInteractions.length} interaction{medInteractions.length > 1 ? 's' : ''} detected
                          </Text>
                        </View>
                        {medInteractions.map((interaction, idx) => (
                          <View key={idx} style={styles.interactionItem}>
                            <Text style={styles.interactionDescription}>
                              {interaction.description}
                            </Text>
                            <Text style={styles.interactionSeverity}>
                              Severity: {interaction.severity.toUpperCase()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {medication.nextDose && (
                      <View style={styles.nextDoseContainer}>
                        <Clock size={14} color="#10B981" />
                        <Text style={styles.nextDoseText}>
                          Next dose: {medication.nextDose}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <AddMedicationModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addMedication}
        />

        <EditMedicationModal
          visible={showEditModal}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateMedication}
          medication={editingMedication?.medication}
        />

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDesktop: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchContainerDesktop: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 0,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  searchInputDesktop: {
    fontSize: 18,
    marginLeft: 16,
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
    marginBottom: 8,
  },
  emptyTitleDesktop: {
    fontSize: 24,
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
  medicationsList: {
    gap: 16,
    paddingBottom: 32,
  },
  medicationsListDesktop: {
    gap: 20,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medicationCardDesktop: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    marginBottom: 20,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  medicationNameDesktop: {
    fontSize: 20,
    marginBottom: 6,
  },
  medicationDosage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  medicationDosageDesktop: {
    fontSize: 16,
    marginBottom: 6,
  },
  medicationNotes: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  medicationNotesDesktop: {
    fontSize: 14,
  },
  medicationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  editButtonDesktop: {
    padding: 10,
    borderRadius: 10,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  deleteButtonDesktop: {
    padding: 10,
    borderRadius: 10,
  },
  interactionAlert: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  interactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interactionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  interactionItem: {
    marginBottom: 6,
  },
  interactionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginBottom: 2,
  },
  interactionSeverity: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  nextDoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  nextDoseText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginLeft: 6,
  },
});