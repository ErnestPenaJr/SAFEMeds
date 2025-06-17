// OpenFDA API integration for drug information
// Documentation: https://open.fda.gov/apis/

const OPENFDA_BASE_URL = 'https://api.fda.gov';

export interface DrugInfo {
  id: string;
  brand_name?: string;
  generic_name?: string;
  active_ingredient?: string;
  manufacturer_name?: string;
  dosage_form?: string;
  route?: string[];
  strength?: string;
  ndc?: string;
  application_number?: string;
  product_type?: string;
}

export interface DrugInteraction {
  drug_name: string;
  interacting_drug: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  mechanism?: string;
  management?: string;
  source: 'OpenFDA' | 'FDA_Orange_Book';
}

export interface DrugLabel {
  brand_name?: string[];
  generic_name?: string[];
  active_ingredient?: string[];
  warnings?: string[];
  contraindications?: string[];
  adverse_reactions?: string[];
  drug_interactions?: string[];
  dosage_and_administration?: string[];
  indications_and_usage?: string[];
  manufacturer_name?: string[];
}

export interface OrangBookEntry {
  ingredient: string;
  df: string; // dosage form
  route: string;
  trade_name: string;
  applicant: string;
  strength: string;
  appl_type: string;
  appl_no: string;
  product_no: string;
  te_code: string; // therapeutic equivalence code
  approval_date: string;
  rld: string; // reference listed drug
  type: string;
}

class OpenFDAAPI {
  private baseUrl = OPENFDA_BASE_URL;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT = 240; // requests per minute
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

  private async rateLimit() {
    const now = Date.now();
    
    // Reset counter if a minute has passed
    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    // Check if we've hit the rate limit
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.RATE_LIMIT_WINDOW - (now - this.lastRequestTime);
      if (waitTime > 0) {
        console.warn(`Rate limit reached. Waiting ${waitTime}ms before next request.`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
      }
    }
    
    this.requestCount++;
  }

  // Search for drugs using the drug label endpoint
  async searchDrugs(query: string, limit: number = 20): Promise<DrugInfo[]> {
    try {
      await this.rateLimit();
      
      const searchTerms = query.toLowerCase().trim();
      const encodedQuery = encodeURIComponent(searchTerms);
      
      // Search in brand names, generic names, and active ingredients
      const searchQuery = `(openfda.brand_name:"${encodedQuery}"+openfda.generic_name:"${encodedQuery}"+active_ingredient:"${encodedQuery}")`;
      
      const response = await fetch(
        `${this.baseUrl}/drug/label.json?search=${searchQuery}&limit=${limit}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No results found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results) {
        return [];
      }

      const drugs: DrugInfo[] = [];
      
      data.results.forEach((result: any, index: number) => {
        const openfda = result.openfda || {};
        
        // Extract brand names
        if (openfda.brand_name) {
          openfda.brand_name.forEach((brandName: string) => {
            drugs.push({
              id: `brand_${index}_${brandName.replace(/\s+/g, '_')}`,
              brand_name: brandName,
              generic_name: openfda.generic_name?.[0],
              active_ingredient: result.active_ingredient?.[0],
              manufacturer_name: openfda.manufacturer_name?.[0],
              dosage_form: openfda.dosage_form?.[0],
              route: openfda.route,
              ndc: openfda.product_ndc?.[0],
              application_number: openfda.application_number?.[0],
              product_type: openfda.product_type?.[0],
            });
          });
        }
        
        // Extract generic names
        if (openfda.generic_name) {
          openfda.generic_name.forEach((genericName: string) => {
            // Avoid duplicates
            if (!drugs.some(drug => drug.generic_name === genericName)) {
              drugs.push({
                id: `generic_${index}_${genericName.replace(/\s+/g, '_')}`,
                generic_name: genericName,
                brand_name: openfda.brand_name?.[0],
                active_ingredient: result.active_ingredient?.[0],
                manufacturer_name: openfda.manufacturer_name?.[0],
                dosage_form: openfda.dosage_form?.[0],
                route: openfda.route,
                ndc: openfda.product_ndc?.[0],
                application_number: openfda.application_number?.[0],
                product_type: openfda.product_type?.[0],
              });
            }
          });
        }
      });

      // Remove duplicates and sort by relevance
      const uniqueDrugs = drugs.filter((drug, index, self) => {
        const drugName = drug.brand_name || drug.generic_name || '';
        return index === self.findIndex(d => 
          (d.brand_name || d.generic_name || '') === drugName
        );
      });

      // Sort by relevance (exact matches first, then partial matches)
      return uniqueDrugs.sort((a, b) => {
        const aName = (a.brand_name || a.generic_name || '').toLowerCase();
        const bName = (b.brand_name || b.generic_name || '').toLowerCase();
        const queryLower = query.toLowerCase();
        
        const aExact = aName === queryLower ? 1 : 0;
        const bExact = bName === queryLower ? 1 : 0;
        
        if (aExact !== bExact) return bExact - aExact;
        
        const aStarts = aName.startsWith(queryLower) ? 1 : 0;
        const bStarts = bName.startsWith(queryLower) ? 1 : 0;
        
        if (aStarts !== bStarts) return bStarts - aStarts;
        
        return aName.localeCompare(bName);
      }).slice(0, limit);
      
    } catch (error) {
      console.error('Error searching drugs:', error);
      return [];
    }
  }

  // Get drug label information
  async getDrugLabel(drugName: string): Promise<DrugLabel | null> {
    try {
      await this.rateLimit();
      
      const encodedQuery = encodeURIComponent(drugName);
      const searchQuery = `(openfda.brand_name:"${encodedQuery}"+openfda.generic_name:"${encodedQuery}")`;
      
      const response = await fetch(
        `${this.baseUrl}/drug/label.json?search=${searchQuery}&limit=1`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];
      const openfda = result.openfda || {};
      
      return {
        brand_name: openfda.brand_name,
        generic_name: openfda.generic_name,
        active_ingredient: result.active_ingredient,
        warnings: result.warnings,
        contraindications: result.contraindications,
        adverse_reactions: result.adverse_reactions,
        drug_interactions: result.drug_interactions,
        dosage_and_administration: result.dosage_and_administration,
        indications_and_usage: result.indications_and_usage,
        manufacturer_name: openfda.manufacturer_name,
      };
      
    } catch (error) {
      console.error('Error getting drug label:', error);
      return null;
    }
  }

  // Search FDA Orange Book for therapeutic equivalence
  async searchOrangeBook(ingredient: string): Promise<OrangBookEntry[]> {
    try {
      await this.rateLimit();
      
      const encodedQuery = encodeURIComponent(ingredient);
      
      const response = await fetch(
        `${this.baseUrl}/drug/drugsfda.json?search=active_ingredients:"${encodedQuery}"&limit=50`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results) {
        return [];
      }

      const entries: OrangBookEntry[] = [];
      
      data.results.forEach((result: any) => {
        if (result.products) {
          result.products.forEach((product: any) => {
            entries.push({
              ingredient: result.active_ingredients?.[0] || ingredient,
              df: product.dosage_form || '',
              route: product.route || '',
              trade_name: product.brand_name || '',
              applicant: result.sponsor_name || '',
              strength: product.active_ingredients?.[0]?.strength || '',
              appl_type: result.application_number?.substring(0, 3) || '',
              appl_no: result.application_number || '',
              product_no: product.product_number || '',
              te_code: product.te_code || '',
              approval_date: result.submission_status_date || '',
              rld: product.reference_drug || 'No',
              type: result.submission_type || '',
            });
          });
        }
      });

      return entries;
      
    } catch (error) {
      console.error('Error searching Orange Book:', error);
      return [];
    }
  }

  // Get drug interactions from label data
  async getDrugInteractions(drugNames: string[]): Promise<DrugInteraction[]> {
    if (drugNames.length < 2) {
      return [];
    }

    const interactions: DrugInteraction[] = [];

    try {
      // Get label information for each drug
      for (const drugName of drugNames) {
        const label = await this.getDrugLabel(drugName);
        
        if (label?.drug_interactions) {
          // Parse interaction text for mentions of other drugs in the list
          label.drug_interactions.forEach(interactionText => {
            drugNames.forEach(otherDrug => {
              if (otherDrug !== drugName && 
                  interactionText.toLowerCase().includes(otherDrug.toLowerCase())) {
                
                // Determine severity based on keywords
                const severity = this.determineSeverity(interactionText);
                
                interactions.push({
                  drug_name: drugName,
                  interacting_drug: otherDrug,
                  severity,
                  description: interactionText,
                  source: 'OpenFDA'
                });
              }
            });
          });
        }
      }

      return interactions;
      
    } catch (error) {
      console.error('Error getting drug interactions:', error);
      return [];
    }
  }

  // Get spelling suggestions (basic implementation)
  async getSpellingSuggestions(query: string): Promise<string[]> {
    try {
      // Search for similar drug names
      const results = await this.searchDrugs(query, 10);
      
      const suggestions: string[] = [];
      
      results.forEach(drug => {
        const drugName = drug.brand_name || drug.generic_name;
        if (drugName && !suggestions.includes(drugName)) {
          suggestions.push(drugName);
        }
      });

      return suggestions.slice(0, 5);
      
    } catch (error) {
      console.error('Error getting spelling suggestions:', error);
      return [];
    }
  }

  private determineSeverity(interactionText: string): 'major' | 'moderate' | 'minor' {
    const text = interactionText.toLowerCase();
    
    // Major severity keywords
    if (text.includes('contraindicated') || 
        text.includes('avoid') || 
        text.includes('serious') ||
        text.includes('life-threatening') ||
        text.includes('fatal') ||
        text.includes('severe')) {
      return 'major';
    }
    
    // Moderate severity keywords
    if (text.includes('caution') || 
        text.includes('monitor') || 
        text.includes('adjust') ||
        text.includes('reduce') ||
        text.includes('increase') ||
        text.includes('significant')) {
      return 'moderate';
    }
    
    // Default to minor
    return 'minor';
  }
}

export const openFDAAPI = new OpenFDAAPI();

// Helper functions for processing OpenFDA data
export const formatDrugName = (drugInfo: DrugInfo): string => {
  // Prefer brand names over generic names
  if (drugInfo.brand_name) {
    return drugInfo.brand_name;
  }
  
  if (drugInfo.generic_name) {
    return drugInfo.generic_name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return drugInfo.active_ingredient || 'Unknown Drug';
};

export const getDrugDisplayName = (drugInfo: DrugInfo): string => {
  const brandName = drugInfo.brand_name;
  const genericName = drugInfo.generic_name;
  
  if (brandName && genericName && brandName !== genericName) {
    return `${brandName} (${genericName})`;
  }
  
  return brandName || genericName || drugInfo.active_ingredient || 'Unknown Drug';
};

// Cache for drug searches to improve performance
class DrugSearchCache {
  private cache = new Map<string, { data: DrugInfo[]; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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