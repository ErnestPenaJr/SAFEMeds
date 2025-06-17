// Advanced medication scheduling engine
// Considers drug interactions, food timing, absorption, and safety

export interface MedicationTiming {
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  
  // Timing requirements
  withFood?: boolean; // true = with food, false = empty stomach, undefined = doesn't matter
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'any';
  separationRequired?: number; // minutes to separate from other medications
  
  // Food interactions
  avoidFoods?: string[]; // foods to avoid
  requireFoods?: string[]; // foods that help absorption
  
  // Special timing
  beforeMeals?: number; // minutes before meals
  afterMeals?: number; // minutes after meals
  
  // Absorption factors
  acidicEnvironment?: boolean; // needs stomach acid
  fatSoluble?: boolean; // needs fat for absorption
  
  // Safety considerations
  drowsiness?: boolean;
  photosensitivity?: boolean;
  alcoholInteraction?: boolean;
}

export interface ScheduleSlot {
  time: string; // HH:MM format
  medications: {
    name: string;
    dosage: string;
    notes?: string;
    warnings?: string[];
  }[];
  mealTiming?: 'before' | 'with' | 'after' | 'between';
  instructions?: string[];
  warnings?: string[];
}

export interface DailySchedule {
  date: Date;
  slots: ScheduleSlot[];
  generalInstructions: string[];
  warnings: string[];
  mealPlan?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string[];
  };
}

// Common medication timing data
const MEDICATION_TIMING_DATABASE: Record<string, Partial<MedicationTiming>> = {
  // Thyroid medications
  'levothyroxine': {
    withFood: false,
    timeOfDay: 'morning',
    beforeMeals: 60,
    separationRequired: 240, // 4 hours from calcium, iron
    avoidFoods: ['calcium', 'iron', 'coffee', 'soy'],
    acidicEnvironment: true
  },
  'synthroid': {
    withFood: false,
    timeOfDay: 'morning',
    beforeMeals: 60,
    separationRequired: 240,
    avoidFoods: ['calcium', 'iron', 'coffee', 'soy'],
    acidicEnvironment: true
  },
  
  // Diabetes medications
  'metformin': {
    withFood: true,
    timeOfDay: 'any',
    afterMeals: 0,
    avoidFoods: ['alcohol'],
    alcoholInteraction: true
  },
  'insulin': {
    beforeMeals: 15,
    timeOfDay: 'any'
  },
  
  // Blood pressure medications
  'lisinopril': {
    withFood: false,
    timeOfDay: 'morning',
    avoidFoods: ['potassium supplements', 'salt substitutes']
  },
  'amlodipine': {
    withFood: false,
    timeOfDay: 'any',
    avoidFoods: ['grapefruit']
  },
  'losartan': {
    withFood: false,
    timeOfDay: 'any'
  },
  
  // Cholesterol medications
  'atorvastatin': {
    withFood: false,
    timeOfDay: 'evening',
    avoidFoods: ['grapefruit'],
    fatSoluble: true
  },
  'simvastatin': {
    withFood: false,
    timeOfDay: 'evening',
    avoidFoods: ['grapefruit'],
    fatSoluble: true
  },
  
  // Antibiotics
  'amoxicillin': {
    withFood: true,
    separationRequired: 120,
    avoidFoods: ['dairy']
  },
  'doxycycline': {
    withFood: true,
    separationRequired: 120,
    avoidFoods: ['dairy', 'calcium', 'iron'],
    photosensitivity: true
  },
  'ciprofloxacin': {
    withFood: false,
    separationRequired: 120,
    avoidFoods: ['dairy', 'calcium', 'caffeine']
  },
  
  // Pain medications
  'ibuprofen': {
    withFood: true,
    afterMeals: 0,
    alcoholInteraction: true
  },
  'acetaminophen': {
    withFood: false,
    timeOfDay: 'any',
    alcoholInteraction: true
  },
  
  // Heart medications
  'warfarin': {
    withFood: false,
    timeOfDay: 'evening',
    avoidFoods: ['vitamin k foods', 'alcohol', 'cranberry'],
    alcoholInteraction: true
  },
  'digoxin': {
    withFood: false,
    separationRequired: 120,
    avoidFoods: ['high fiber foods']
  },
  
  // Mental health medications
  'sertraline': {
    withFood: true,
    timeOfDay: 'morning',
    alcoholInteraction: true
  },
  'fluoxetine': {
    withFood: true,
    timeOfDay: 'morning',
    alcoholInteraction: true
  },
  'lorazepam': {
    withFood: false,
    timeOfDay: 'evening',
    drowsiness: true,
    alcoholInteraction: true
  },
  
  // Supplements
  'calcium': {
    withFood: true,
    separationRequired: 240, // from thyroid meds
    requireFoods: ['vitamin d'],
    acidicEnvironment: true
  },
  'iron': {
    withFood: false,
    separationRequired: 120,
    avoidFoods: ['calcium', 'coffee', 'tea'],
    requireFoods: ['vitamin c']
  },
  'vitamin d': {
    withFood: true,
    fatSoluble: true,
    requireFoods: ['fat']
  }
};

class MedicationScheduler {
  private mealTimes = {
    breakfast: '07:30',
    lunch: '12:30',
    dinner: '18:30'
  };

  generateOptimalSchedule(medications: MedicationTiming[], date: Date = new Date()): DailySchedule {
    const enhancedMedications = this.enhanceMedicationsWithDatabase(medications);
    const timeSlots = this.createTimeSlots();
    const scheduledSlots: ScheduleSlot[] = [];
    const generalInstructions: string[] = [];
    const warnings: string[] = [];

    // Group medications by timing requirements
    const medicationGroups = this.groupMedicationsByTiming(enhancedMedications);

    // Schedule each group
    Object.entries(medicationGroups).forEach(([timingType, meds]) => {
      const slots = this.scheduleMedicationGroup(meds, timingType, timeSlots);
      scheduledSlots.push(...slots);
    });

    // Sort slots by time
    scheduledSlots.sort((a, b) => a.time.localeCompare(b.time));

    // Add interaction warnings
    const interactionWarnings = this.checkInteractions(enhancedMedications);
    warnings.push(...interactionWarnings);

    // Add general instructions
    generalInstructions.push(
      'Take medications at the same time each day for best results',
      'Keep a medication diary to track effectiveness and side effects',
      'Never stop medications abruptly without consulting your doctor'
    );

    // Add food-specific instructions
    const foodInstructions = this.generateFoodInstructions(enhancedMedications);
    generalInstructions.push(...foodInstructions);

    return {
      date,
      slots: scheduledSlots,
      generalInstructions,
      warnings,
      mealPlan: this.generateMealPlan(enhancedMedications)
    };
  }

  private enhanceMedicationsWithDatabase(medications: MedicationTiming[]): MedicationTiming[] {
    return medications.map(med => {
      const dbData = this.findMedicationInDatabase(med.name);
      return { ...med, ...dbData };
    });
  }

  private findMedicationInDatabase(medicationName: string): Partial<MedicationTiming> {
    const name = medicationName.toLowerCase();
    
    // Direct match
    if (MEDICATION_TIMING_DATABASE[name]) {
      return MEDICATION_TIMING_DATABASE[name];
    }

    // Partial match
    for (const [dbName, data] of Object.entries(MEDICATION_TIMING_DATABASE)) {
      if (name.includes(dbName) || dbName.includes(name)) {
        return data;
      }
    }

    return {};
  }

  private createTimeSlots(): string[] {
    const slots: string[] = [];
    
    // Create slots every 30 minutes from 6 AM to 10 PM
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    
    return slots;
  }

  private groupMedicationsByTiming(medications: MedicationTiming[]): Record<string, MedicationTiming[]> {
    const groups: Record<string, MedicationTiming[]> = {
      morning_empty: [],
      morning_with_food: [],
      afternoon: [],
      evening: [],
      bedtime: [],
      with_meals: [],
      between_meals: []
    };

    medications.forEach(med => {
      if (med.timeOfDay === 'morning' && med.withFood === false) {
        groups.morning_empty.push(med);
      } else if (med.timeOfDay === 'morning' && med.withFood === true) {
        groups.morning_with_food.push(med);
      } else if (med.timeOfDay === 'afternoon') {
        groups.afternoon.push(med);
      } else if (med.timeOfDay === 'evening') {
        groups.evening.push(med);
      } else if (med.timeOfDay === 'bedtime') {
        groups.bedtime.push(med);
      } else if (med.withFood === true || med.afterMeals !== undefined) {
        groups.with_meals.push(med);
      } else {
        groups.between_meals.push(med);
      }
    });

    return groups;
  }

  private scheduleMedicationGroup(medications: MedicationTiming[], timingType: string, availableSlots: string[]): ScheduleSlot[] {
    const slots: ScheduleSlot[] = [];

    switch (timingType) {
      case 'morning_empty':
        slots.push(this.createSlot('06:30', medications, 'before', [
          'Take on empty stomach',
          'Wait 1 hour before eating'
        ]));
        break;

      case 'morning_with_food':
        slots.push(this.createSlot('07:45', medications, 'with', [
          'Take with breakfast',
          'Ensure adequate food intake'
        ]));
        break;

      case 'afternoon':
        slots.push(this.createSlot('14:00', medications, 'between'));
        break;

      case 'evening':
        slots.push(this.createSlot('19:00', medications, 'after', [
          'Take after dinner',
          'Allow 2 hours before bedtime'
        ]));
        break;

      case 'bedtime':
        slots.push(this.createSlot('21:30', medications, 'between', [
          'Take before bed',
          'Ensure you can sleep for 7-8 hours'
        ]));
        break;

      case 'with_meals':
        // Distribute across meals
        const mealsPerDay = this.getFrequencyCount(medications[0]?.frequency || 'once daily');
        if (mealsPerDay >= 3) {
          slots.push(this.createSlot('07:45', [medications[0]], 'with', ['Take with breakfast']));
          slots.push(this.createSlot('12:45', [medications[0]], 'with', ['Take with lunch']));
          slots.push(this.createSlot('18:45', [medications[0]], 'with', ['Take with dinner']));
        } else if (mealsPerDay === 2) {
          slots.push(this.createSlot('07:45', [medications[0]], 'with', ['Take with breakfast']));
          slots.push(this.createSlot('18:45', [medications[0]], 'with', ['Take with dinner']));
        } else {
          slots.push(this.createSlot('07:45', medications, 'with', ['Take with breakfast']));
        }
        break;

      case 'between_meals':
        slots.push(this.createSlot('10:00', medications, 'between', [
          'Take between meals',
          'Maintain consistent timing'
        ]));
        break;
    }

    return slots;
  }

  private createSlot(
    time: string, 
    medications: MedicationTiming[], 
    mealTiming?: 'before' | 'with' | 'after' | 'between',
    instructions: string[] = []
  ): ScheduleSlot {
    const warnings: string[] = [];
    
    // Check for interactions within this time slot
    if (medications.length > 1) {
      const interactionWarning = this.checkSlotInteractions(medications);
      if (interactionWarning) {
        warnings.push(interactionWarning);
      }
    }

    return {
      time,
      medications: medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        notes: med.notes,
        warnings: this.getMedicationWarnings(med)
      })),
      mealTiming,
      instructions,
      warnings
    };
  }

  private getFrequencyCount(frequency: string): number {
    const freq = frequency.toLowerCase();
    if (freq.includes('three') || freq.includes('tid')) return 3;
    if (freq.includes('twice') || freq.includes('bid')) return 2;
    if (freq.includes('four') || freq.includes('qid')) return 4;
    return 1;
  }

  private checkInteractions(medications: MedicationTiming[]): string[] {
    const warnings: string[] = [];

    // Check for timing conflicts
    const thyroidMeds = medications.filter(med => 
      med.name.toLowerCase().includes('levothyroxine') || 
      med.name.toLowerCase().includes('synthroid')
    );
    
    const calciumMeds = medications.filter(med => 
      med.name.toLowerCase().includes('calcium') ||
      med.avoidFoods?.includes('calcium')
    );

    if (thyroidMeds.length > 0 && calciumMeds.length > 0) {
      warnings.push('⚠️ Separate thyroid medication and calcium by at least 4 hours');
    }

    // Check for alcohol interactions
    const alcoholInteractingMeds = medications.filter(med => med.alcoholInteraction);
    if (alcoholInteractingMeds.length > 0) {
      warnings.push('🚫 Avoid alcohol while taking: ' + 
        alcoholInteractingMeds.map(med => med.name).join(', '));
    }

    // Check for photosensitivity
    const photosensitiveMeds = medications.filter(med => med.photosensitivity);
    if (photosensitiveMeds.length > 0) {
      warnings.push('☀️ Use sunscreen and limit sun exposure while taking: ' + 
        photosensitiveMeds.map(med => med.name).join(', '));
    }

    return warnings;
  }

  private checkSlotInteractions(medications: MedicationTiming[]): string | null {
    // Check if medications in the same slot have separation requirements
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];
        
        if (med1.separationRequired && med1.separationRequired > 30) {
          return `Separate ${med1.name} and ${med2.name} by ${med1.separationRequired} minutes`;
        }
        
        if (med2.separationRequired && med2.separationRequired > 30) {
          return `Separate ${med1.name} and ${med2.name} by ${med2.separationRequired} minutes`;
        }
      }
    }
    
    return null;
  }

  private getMedicationWarnings(medication: MedicationTiming): string[] {
    const warnings: string[] = [];

    if (medication.drowsiness) {
      warnings.push('May cause drowsiness');
    }

    if (medication.avoidFoods && medication.avoidFoods.length > 0) {
      warnings.push(`Avoid: ${medication.avoidFoods.join(', ')}`);
    }

    if (medication.withFood === false) {
      warnings.push('Take on empty stomach');
    }

    if (medication.beforeMeals) {
      warnings.push(`Take ${medication.beforeMeals} minutes before meals`);
    }

    if (medication.afterMeals) {
      warnings.push(`Take ${medication.afterMeals} minutes after meals`);
    }

    return warnings;
  }

  private generateFoodInstructions(medications: MedicationTiming[]): string[] {
    const instructions: string[] = [];
    const avoidFoods = new Set<string>();
    const requireFoods = new Set<string>();

    medications.forEach(med => {
      med.avoidFoods?.forEach(food => avoidFoods.add(food));
      med.requireFoods?.forEach(food => requireFoods.add(food));
    });

    if (avoidFoods.size > 0) {
      instructions.push(`Foods to limit or avoid: ${Array.from(avoidFoods).join(', ')}`);
    }

    if (requireFoods.size > 0) {
      instructions.push(`Include in your diet: ${Array.from(requireFoods).join(', ')}`);
    }

    return instructions;
  }

  private generateMealPlan(medications: MedicationTiming[]) {
    const hasThyroidMed = medications.some(med => 
      med.name.toLowerCase().includes('levothyroxine') || 
      med.name.toLowerCase().includes('synthroid')
    );

    const hasIronSupplement = medications.some(med => 
      med.name.toLowerCase().includes('iron')
    );

    const hasFatSolubleMeds = medications.some(med => med.fatSoluble);

    return {
      breakfast: hasThyroidMed 
        ? 'Light breakfast (avoid coffee for 1 hour after thyroid medication)'
        : hasFatSolubleMeds 
        ? 'Include healthy fats (avocado, nuts, olive oil)'
        : 'Balanced breakfast with protein and complex carbs',
      
      lunch: hasIronSupplement
        ? 'Include vitamin C rich foods (citrus, bell peppers, strawberries)'
        : 'Balanced meal with lean protein and vegetables',
      
      dinner: 'Light dinner if taking evening medications, avoid heavy meals 2 hours before bedtime',
      
      snacks: [
        'Avoid grapefruit if taking statins or blood pressure medications',
        'Stay hydrated throughout the day',
        'Limit caffeine if taking certain medications'
      ]
    };
  }

  // Method to adjust schedule based on user preferences
  adjustScheduleForPreferences(
    schedule: DailySchedule, 
    preferences: {
      wakeUpTime?: string;
      bedTime?: string;
      mealTimes?: { breakfast?: string; lunch?: string; dinner?: string };
      workSchedule?: { start: string; end: string };
    }
  ): DailySchedule {
    // Clone the schedule
    const adjustedSchedule = JSON.parse(JSON.stringify(schedule)) as DailySchedule;

    // Adjust meal times if provided
    if (preferences.mealTimes) {
      this.mealTimes = {
        breakfast: preferences.mealTimes.breakfast || this.mealTimes.breakfast,
        lunch: preferences.mealTimes.lunch || this.mealTimes.lunch,
        dinner: preferences.mealTimes.dinner || this.mealTimes.dinner
      };

      // Regenerate schedule with new meal times
      // This would require re-running the scheduling algorithm
    }

    return adjustedSchedule;
  }
}

export const medicationScheduler = new MedicationScheduler();

// Helper function to convert medication list to timing format
export function convertMedicationsToTiming(medications: any[]): MedicationTiming[] {
  return medications.map(med => ({
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    notes: med.notes
  }));
}

// Helper function to format time for display
export function formatScheduleTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to get next dose time
export function getNextDoseTime(schedule: DailySchedule): string | null {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const upcomingSlot = schedule.slots.find(slot => slot.time > currentTime);
  return upcomingSlot ? formatScheduleTime(upcomingSlot.time) : null;
}