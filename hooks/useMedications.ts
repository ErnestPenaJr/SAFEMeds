import { useState, useEffect } from 'react';
import { openFDAAPI, DrugInfo, formatDrugName, drugSearchCache } from '@/lib/openfda';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  nextDose?: string;
  fdaId?: string; // OpenFDA identifier
  active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface DrugInteraction {
  drugs: string[];
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  recommendation?: string;
  source?: string;
}

export interface ScheduleItem {
  time: string;
  medication: string;
  dosage: string;
  status: 'taken' | 'missed' | 'upcoming' | 'scheduled';
  notes?: string;
  interactions?: string[];
}

export interface SideEffect {
  id: string;
  medicationName: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  description?: string;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

export interface ReactionReport {
  id: string;
  medicationName: string;
  reactionType: 'allergic' | 'adverse' | 'unexpected';
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  description: string;
  timestamp: Date;
  actionTaken?: string;
  resolved?: boolean;
  resolvedAt?: Date;
}

// Common side effects and symptoms
export const COMMON_SYMPTOMS = [
  'Nausea', 'Dizziness', 'Headache', 'Fatigue', 'Drowsiness',
  'Dry mouth', 'Constipation', 'Diarrhea', 'Stomach upset', 'Loss of appetite',
  'Insomnia', 'Anxiety', 'Mood changes', 'Skin rash', 'Itching',
  'Swelling', 'Muscle pain', 'Joint pain', 'Blurred vision', 'Confusion'
];

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      nextDose: '2:00 PM',
      active: true
    },
    {
      name: 'Levothyroxine',
      dosage: '75mcg',
      frequency: 'Once daily',
      notes: 'Take on empty stomach',
      nextDose: '7:00 AM',
      active: true
    }
  ]);

  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [reactionReports, setReactionReports] = useState<ReactionReport[]>([]);
  const [drugSearchResults, setDrugSearchResults] = useState<DrugInfo[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);

  // Check for drug interactions whenever medications change
  useEffect(() => {
    checkDrugInteractions();
  }, [medications]);

  const checkDrugInteractions = async () => {
    const activeMeds = medications.filter(med => med.active !== false);
    
    if (activeMeds.length < 2) {
      setInteractions([]);
      return;
    }

    setIsLoadingInteractions(true);

    try {
      const drugNames = activeMeds.map(med => med.name);
      const fdaInteractions = await openFDAAPI.getDrugInteractions(drugNames);
      
      const processedInteractions: DrugInteraction[] = fdaInteractions.map(interaction => ({
        drugs: [interaction.drug_name, interaction.interacting_drug],
        severity: interaction.severity,
        description: interaction.description,
        source: 'OpenFDA'
      }));

      // Add some common interaction patterns for demo purposes
      const commonInteractions = getCommonInteractions(drugNames);
      
      setInteractions([...processedInteractions, ...commonInteractions]);
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      // Fall back to common interactions only
      const drugNames = activeMeds.map(med => med.name);
      const commonInteractions = getCommonInteractions(drugNames);
      setInteractions(commonInteractions);
    } finally {
      setIsLoadingInteractions(false);
    }
  };

  // Helper function for common drug interactions
  const getCommonInteractions = (drugNames: string[]): DrugInteraction[] => {
    const interactions: DrugInteraction[] = [];
    
    // Common interaction patterns
    const interactionPatterns = [
      {
        drugs: ['warfarin', 'aspirin'],
        severity: 'major' as const,
        description: 'Increased risk of bleeding when warfarin is combined with aspirin.'
      },
      {
        drugs: ['metformin', 'alcohol'],
        severity: 'moderate' as const,
        description: 'Alcohol may increase the risk of lactic acidosis with metformin.'
      },
      {
        drugs: ['levothyroxine', 'calcium'],
        severity: 'moderate' as const,
        description: 'Calcium may reduce the absorption of levothyroxine. Take 4 hours apart.'
      },
      {
        drugs: ['lisinopril', 'potassium'],
        severity: 'moderate' as const,
        description: 'ACE inhibitors like lisinopril may increase potassium levels.'
      }
    ];

    interactionPatterns.forEach(pattern => {
      const matchingDrugs = pattern.drugs.filter(drug => 
        drugNames.some(medName => 
          medName.toLowerCase().includes(drug.toLowerCase())
        )
      );
      
      if (matchingDrugs.length >= 2) {
        interactions.push({
          drugs: matchingDrugs,
          severity: pattern.severity,
          description: pattern.description,
          source: 'Common Interactions Database'
        });
      }
    });

    return interactions;
  };

  const addMedication = async (medication: Medication) => {
    // Try to get FDA ID for the new medication
    try {
      const searchResults = await openFDAAPI.searchDrugs(medication.name, 1);
      const fdaId = searchResults.length > 0 ? searchResults[0].id : undefined;
      const medicationWithFdaId = { ...medication, fdaId };
      setMedications(prev => [...prev, medicationWithFdaId]);
    } catch (error) {
      console.error('Error getting FDA ID for medication:', error);
      setMedications(prev => [...prev, medication]);
    }
  };

  const removeMedication = (medicationName: string) => {
    setMedications(prev => prev.filter(med => med.name !== medicationName));
    // Also remove related side effects and reactions
    setSideEffects(prev => prev.filter(effect => effect.medicationName !== medicationName));
    setReactionReports(prev => prev.filter(report => report.medicationName !== medicationName));
  };

  const updateMedication = (index: number, medication: Medication) => {
    setMedications(prev => {
      const updated = [...prev];
      updated[index] = medication;
      return updated;
    });
  };

  const searchMedications = async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) {
      setDrugSearchResults([]);
      return [];
    }
    
    try {
      // Check cache first
      const cached = drugSearchCache.get(query);
      if (cached) {
        setDrugSearchResults(cached);
        return cached.map(drug => formatDrugName(drug));
      }

      // Search using OpenFDA API
      const results = await openFDAAPI.searchDrugs(query, 20);
      
      // Cache the results
      drugSearchCache.set(query, results);
      setDrugSearchResults(results);
      
      return results.map(drug => formatDrugName(drug));
    } catch (error) {
      console.error('Error searching medications:', error);
      
      // Fall back to local suggestions if API fails
      const fallbackMedications = [
        'Acetaminophen', 'Advil', 'Albuterol', 'Amoxicillin', 'Aspirin',
        'Atorvastatin', 'Azithromycin', 'Benadryl', 'Calcium', 'Cephalexin',
        'Claritin', 'Crestor', 'Cymbalta', 'Flomax', 'Gabapentin',
        'Hydrochlorothiazide', 'Ibuprofen', 'Iron', 'Levothyroxine', 'Lisinopril',
        'Losartan', 'Lyrica', 'Metformin', 'Metoprolol', 'Naproxen',
        'Nexium', 'Norvasc', 'Omeprazole', 'Prednisone', 'Prilosec',
        'Prozac', 'Singulair', 'Synthroid', 'Tylenol', 'Warfarin',
        'Xanax', 'Zantac', 'Zoloft', 'Zyrtec'
      ];
      
      return fallbackMedications.filter(med =>
        med.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
    }
  };

  const getSpellingSuggestions = async (query: string): Promise<string[]> => {
    try {
      return await openFDAAPI.getSpellingSuggestions(query);
    } catch (error) {
      console.error('Error getting spelling suggestions:', error);
      return [];
    }
  };

  const addSideEffect = (sideEffect: Omit<SideEffect, 'id' | 'timestamp'>) => {
    const newSideEffect: SideEffect = {
      ...sideEffect,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setSideEffects(prev => [...prev, newSideEffect]);
  };

  const updateSideEffect = (id: string, updates: Partial<SideEffect>) => {
    setSideEffects(prev => prev.map(effect => 
      effect.id === id ? { ...effect, ...updates } : effect
    ));
  };

  const addReactionReport = (report: Omit<ReactionReport, 'id' | 'timestamp'>) => {
    const newReport: ReactionReport = {
      ...report,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setReactionReports(prev => [...prev, newReport]);
  };

  const updateReactionReport = (id: string, updates: Partial<ReactionReport>) => {
    setReactionReports(prev => prev.map(report => 
      report.id === id ? { ...report, ...updates } : report
    ));
  };

  const getSideEffectsForMedication = (medicationName: string) => {
    return sideEffects.filter(effect => effect.medicationName === medicationName);
  };

  const getReactionReportsForMedication = (medicationName: string) => {
    return reactionReports.filter(report => report.medicationName === medicationName);
  };

  const getRecentSideEffects = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sideEffects.filter(effect => effect.timestamp >= cutoffDate);
  };

  const getRecentReactionReports = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return reactionReports.filter(report => report.timestamp >= cutoffDate);
  };

  const generateSchedule = (date: Date): ScheduleItem[] => {
    const schedule: ScheduleItem[] = [];
    const currentTime = new Date();
    const activeMeds = medications.filter(med => med.active !== false);
    
    activeMeds.forEach(medication => {
      const times = getScheduleTimes(medication.frequency);
      
      times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduleTime = new Date(date);
        scheduleTime.setHours(hours, minutes, 0, 0);
        
        let status: ScheduleItem['status'] = 'scheduled';
        
        // Determine status based on current time
        if (date.toDateString() === currentTime.toDateString()) {
          if (scheduleTime < currentTime) {
            status = Math.random() > 0.3 ? 'taken' : 'missed'; // 70% chance taken
          } else {
            status = 'upcoming';
          }
        } else if (date < currentTime) {
          status = Math.random() > 0.2 ? 'taken' : 'missed'; // 80% chance taken for past days
        }
        
        schedule.push({
          time,
          medication: medication.name,
          dosage: medication.dosage,
          status,
          notes: medication.notes,
          interactions: interactions.filter(i => 
            i.drugs.some(drug => 
              drug.toLowerCase().includes(medication.name.toLowerCase()) ||
              medication.name.toLowerCase().includes(drug.toLowerCase())
            )
          ).map(i => i.description)
        });
      });
    });
    
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getScheduleTimes = (frequency: string): string[] => {
    const freq = frequency.toLowerCase();
    
    if (freq.includes('once') || freq.includes('daily') || freq.includes('qd')) {
      return ['08:00'];
    } else if (freq.includes('twice') || freq.includes('bid')) {
      return ['08:00', '20:00'];
    } else if (freq.includes('three') || freq.includes('tid')) {
      return ['08:00', '14:00', '20:00'];
    } else if (freq.includes('four') || freq.includes('qid')) {
      return ['08:00', '12:00', '16:00', '20:00'];
    } else if (freq.includes('every 4')) {
      return ['06:00', '10:00', '14:00', '18:00', '22:00'];
    } else if (freq.includes('every 6')) {
      return ['06:00', '12:00', '18:00', '24:00'];
    } else if (freq.includes('every 8')) {
      return ['08:00', '16:00', '24:00'];
    } else if (freq.includes('every 12')) {
      return ['08:00', '20:00'];
    } else {
      return ['08:00']; // Default to once daily
    }
  };

  return {
    medications,
    interactions,
    sideEffects,
    reactionReports,
    drugSearchResults,
    isLoadingInteractions,
    addMedication,
    removeMedication,
    updateMedication,
    searchMedications,
    getSpellingSuggestions,
    generateSchedule,
    addSideEffect,
    updateSideEffect,
    addReactionReport,
    updateReactionReport,
    getSideEffectsForMedication,
    getReactionReportsForMedication,
    getRecentSideEffects,
    getRecentReactionReports,
    checkDrugInteractions,
  };
}