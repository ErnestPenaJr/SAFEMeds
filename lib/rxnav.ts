// RxNav API integration for drug information
// Documentation: https://lhncbc.nlm.nih.gov/RxNav/APIs/index.html

const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export interface DrugInfo {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string; // Term type
}

export interface DrugInteraction {
  minConceptItem: {
    rxcui: string;
    name: string;
    tty: string;
  };
  interactionPair: Array<{
    interactionConcept: Array<{
      minConceptItem: {
        rxcui: string;
        name: string;
        tty: string;
      };
      sourceConceptItem: {
        id: string;
        name: string;
        url: string;
      };
    }>;
    severity: string;
    description: string;
  }>;
}

export interface RxNavSearchResult {
  drugGroup: {
    name?: string;
    conceptGroup?: Array<{
      tty: string;
      conceptProperties: Array<{
        rxcui: string;
        name: string;
        synonym: string;
        tty: string;
        language: string;
        suppress: string;
        umlscui: string;
      }>;
    }>;
  };
}

export interface InteractionResult {
  nlmDisclaimer: string;
  userInput: {
    sources: string[];
    rxcuis: string[];
  };
  interactions: DrugInteraction[];
}

class RxNavAPI {
  private baseUrl = RXNAV_BASE_URL;

  // Search for drugs by name
  async searchDrugs(query: string): Promise<DrugInfo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/drugs.json?name=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RxNavSearchResult = await response.json();
      
      if (!data.drugGroup?.conceptGroup) {
        return [];
      }

      const drugs: DrugInfo[] = [];
      
      data.drugGroup.conceptGroup.forEach(group => {
        if (group.conceptProperties) {
          group.conceptProperties.forEach(concept => {
            // Filter for branded and generic names
            if (['BN', 'IN', 'PIN', 'MIN'].includes(concept.tty)) {
              drugs.push({
                rxcui: concept.rxcui,
                name: concept.name,
                synonym: concept.synonym,
                tty: concept.tty
              });
            }
          });
        }
      });

      // Remove duplicates and sort by relevance
      const uniqueDrugs = drugs.filter((drug, index, self) => 
        index === self.findIndex(d => d.name.toLowerCase() === drug.name.toLowerCase())
      );

      return uniqueDrugs.slice(0, 20); // Limit to 20 results
    } catch (error) {
      console.error('Error searching drugs:', error);
      return [];
    }
  }

  // Get drug interactions for a list of RXCUIs
  async getDrugInteractions(rxcuis: string[]): Promise<DrugInteraction[]> {
    try {
      if (rxcuis.length < 2) {
        return [];
      }

      const rxcuiList = rxcuis.join('+');
      const response = await fetch(
        `${this.baseUrl}/interaction/list.json?rxcuis=${rxcuiList}`
      );
      
      // Handle 404 as a normal case (no interactions found)
      if (response.status === 404) {
        console.warn('No drug interactions found for the provided RXCUIs:', rxcuis);
        return [];
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: InteractionResult = await response.json();
      
      return data.interactions || [];
    } catch (error) {
      console.error('Error fetching drug interactions:', error);
      return [];
    }
  }

  // Get RxCUI for a drug name
  async getRxcuiByName(drugName: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/rxcui.json?name=${encodeURIComponent(drugName)}&search=2`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.idGroup?.rxnormId && data.idGroup.rxnormId.length > 0) {
        return data.idGroup.rxnormId[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting RxCUI:', error);
      return null;
    }
  }

  // Get drug properties by RxCUI
  async getDrugProperties(rxcui: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/rxcui/${rxcui}/properties.json`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.properties;
    } catch (error) {
      console.error('Error getting drug properties:', error);
      return null;
    }
  }

  // Get related drugs (generic/brand equivalents)
  async getRelatedDrugs(rxcui: string): Promise<DrugInfo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/rxcui/${rxcui}/related.json?tty=IN+PIN+MIN+BN`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.relatedGroup?.conceptGroup) {
        return [];
      }

      const relatedDrugs: DrugInfo[] = [];
      
      data.relatedGroup.conceptGroup.forEach((group: any) => {
        if (group.conceptProperties) {
          group.conceptProperties.forEach((concept: any) => {
            relatedDrugs.push({
              rxcui: concept.rxcui,
              name: concept.name,
              synonym: concept.synonym,
              tty: concept.tty
            });
          });
        }
      });

      return relatedDrugs;
    } catch (error) {
      console.error('Error getting related drugs:', error);
      return [];
    }
  }

  // Get spelling suggestions for drug names
  async getSpellingSuggestions(drugName: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/spellingsuggestions.json?name=${encodeURIComponent(drugName)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.suggestionGroup?.suggestionList?.suggestion || [];
    } catch (error) {
      console.error('Error getting spelling suggestions:', error);
      return [];
    }
  }
}

export const rxNavAPI = new RxNavAPI();

// Helper functions for processing RxNav data
export const processInteractionSeverity = (severity: string): 'major' | 'moderate' | 'minor' => {
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('high') || severityLower.includes('major') || severityLower.includes('contraindicated')) {
    return 'major';
  } else if (severityLower.includes('moderate') || severityLower.includes('significant')) {
    return 'moderate';
  } else {
    return 'minor';
  }
};

export const formatDrugName = (drugInfo: DrugInfo): string => {
  // Prefer branded names (BN) over ingredient names (IN)
  if (drugInfo.tty === 'BN') {
    return drugInfo.name;
  }
  
  // For ingredient names, capitalize properly
  return drugInfo.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Cache for drug searches to improve performance
class DrugSearchCache {
  private cache = new Map<string, { data: DrugInfo[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  get(query: string): DrugInfo[] | null {
    const cached = this.cache.get(query.toLowerCase());
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    return null;
  }

  set(query: string, data: DrugInfo[]): void {
    this.cache.set(query.toLowerCase(), {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const drugSearchCache = new DrugSearchCache();