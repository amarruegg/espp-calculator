// ESPP Input types
export interface ESPPPurchaseInfo {
  purchaseDate: string; // ISO date string
  purchasePrice: number;
  fairMarketValueAtPurchase: number;
  offeringDate: string; // ISO date string
  fairMarketValueAtOffering: number;
  discountPercentage: number;
}

export interface ESPPSaleInfo {
  saleDate: string; // ISO date string
  salePrice: number;
  sharesSold: number;
}

export interface TaxInfo {
  federalIncomeTaxRate: number;
  stateIncomeTaxRate: number;
  longTermCapitalGainsRate: number;
  shortTermCapitalGainsRate: number;
}

export interface ESPPCalculatorInputs {
  purchaseInfo: ESPPPurchaseInfo;
  saleInfo: ESPPSaleInfo;
  taxInfo: TaxInfo;
}

// ESPP calculation results
export interface ESPPCalculationResult {
  // Basic information
  isQualifyingDisposition: boolean;
  holdingPeriodDays: number;
  
  // Financial calculations
  discount: number;
  discountAmount: number;
  totalProceedsFromSale: number;
  totalCostBasis: number;
  adjustedCostBasis: number;  // Added for tax reporting purposes
  
  // Tax components
  ordinaryIncome: number;
  capitalGain: number;
  capitalGainType: 'short-term' | 'long-term';
  
  // Tax calculations
  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  totalTaxLiability: number;
  
  // Comparison to incorrect method
  incorrectCapitalGain: number;
  incorrectTaxLiability: number;
  taxSavings: number;
}

// Form validation
export interface ValidationErrors {
  [key: string]: string;
}

// Global type augmentation for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
