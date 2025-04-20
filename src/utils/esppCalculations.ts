import {
  ESPPPurchaseInfo,
  ESPPSaleInfo,
  TaxInfo,
  ESPPCalculationResult
} from '../types';

/**
 * Determines if the disposition is qualifying based on IRS rules
 * A qualifying disposition requires:
 * 1. Holding the stock for at least 1 year after purchase
 * 2. Holding the stock for at least 2 years after the offering date
 */
export const isQualifyingDisposition = (
  purchaseInfo: ESPPPurchaseInfo,
  saleInfo: ESPPSaleInfo
): boolean => {
  const purchaseDate = new Date(purchaseInfo.purchaseDate);
  const offeringDate = new Date(purchaseInfo.offeringDate);
  const saleDate = new Date(saleInfo.saleDate);
  
  // At least 1 year (365 days) from purchase to sale
  const oneYearFromPurchase = new Date(purchaseDate);
  oneYearFromPurchase.setFullYear(oneYearFromPurchase.getFullYear() + 1);
  
  // At least 2 years (730 days) from offering to sale
  const twoYearsFromOffering = new Date(offeringDate);
  twoYearsFromOffering.setFullYear(twoYearsFromOffering.getFullYear() + 2);
  
  return saleDate >= oneYearFromPurchase && saleDate >= twoYearsFromOffering;
};

/**
 * Calculates the holding period in days
 */
export const calculateHoldingPeriodDays = (
  purchaseDate: string,
  saleDate: string
): number => {
  const purchase = new Date(purchaseDate);
  const sale = new Date(saleDate);
  const diffTime = Math.abs(sale.getTime() - purchase.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Determines if the capital gain is long-term (held > 1 year)
 */
export const isLongTermCapitalGain = (
  purchaseDate: string,
  saleDate: string
): boolean => {
  const purchase = new Date(purchaseDate);
  const sale = new Date(saleDate);
  const oneYearFromPurchase = new Date(purchase);
  oneYearFromPurchase.setFullYear(oneYearFromPurchase.getFullYear() + 1);
  
  return sale >= oneYearFromPurchase;
};

/**
 * Calculates detailed ESPP tax information
 */
export const calculateESPPTaxes = (
  purchaseInfo: ESPPPurchaseInfo,
  saleInfo: ESPPSaleInfo,
  taxInfo: TaxInfo
): ESPPCalculationResult => {
  // Basic information
  const qualifying = isQualifyingDisposition(purchaseInfo, saleInfo);
  const holdingPeriodDays = calculateHoldingPeriodDays(
    purchaseInfo.purchaseDate,
    saleInfo.saleDate
  );
  
  // Calculate the actual purchase price with lookback provision
  const discountMultiplier = 1 - (purchaseInfo.discountPercentage / 100);
  const offeringDiscountPrice = purchaseInfo.fairMarketValueAtOffering * discountMultiplier;
  const purchaseDiscountPrice = purchaseInfo.fairMarketValueAtPurchase * discountMultiplier;
  const actualPurchasePrice = Math.min(offeringDiscountPrice, purchaseDiscountPrice);

  // Calculate the reference FMV (whichever was used for the purchase)
  const referenceFMV = offeringDiscountPrice <= purchaseDiscountPrice 
    ? purchaseInfo.fairMarketValueAtOffering 
    : purchaseInfo.fairMarketValueAtPurchase;

  // Calculate actual discount percentage and amount
  const discount = referenceFMV > 0 
    ? (referenceFMV - actualPurchasePrice) / referenceFMV
    : 0;
  const discountAmount = (referenceFMV - actualPurchasePrice) * saleInfo.sharesSold;
  
  // Calculate total proceeds and cost basis using actual purchase price
  const totalProceedsFromSale = saleInfo.salePrice * saleInfo.sharesSold;
  const totalCostBasis = actualPurchasePrice * saleInfo.sharesSold;
  
  let ordinaryIncome = 0;
  let capitalGain = 0;
  
  // Calculate tax components based on disposition type
  if (qualifying) {
    // For qualifying dispositions, ordinary income is the lower of:
    // 1. The actual discount from offering price
    // 2. 15% of FMV at offering date
    const actualDiscount = Math.min(
      (purchaseInfo.fairMarketValueAtOffering - actualPurchasePrice) * saleInfo.sharesSold,
      purchaseInfo.fairMarketValueAtOffering * 0.15 * saleInfo.sharesSold
    );
    
    ordinaryIncome = actualDiscount;
    capitalGain = totalProceedsFromSale - totalCostBasis - ordinaryIncome;
  } else {
    // For disqualifying dispositions, ordinary income is the difference between
    // FMV at purchase and the actual purchase price
    ordinaryIncome = (purchaseInfo.fairMarketValueAtPurchase - actualPurchasePrice) * saleInfo.sharesSold;
    capitalGain = totalProceedsFromSale - totalCostBasis - ordinaryIncome;
  }
  
  // Determine capital gain type
  const capitalGainType = isLongTermCapitalGain(
    purchaseInfo.purchaseDate, 
    saleInfo.saleDate
  ) ? 'long-term' : 'short-term';
  
  // Calculate tax liabilities
  const combinedOrdinaryIncomeTaxRate = taxInfo.federalIncomeTaxRate + taxInfo.stateIncomeTaxRate;
  const ordinaryIncomeTax = ordinaryIncome * combinedOrdinaryIncomeTaxRate;
  
  const capitalGainsRate = capitalGainType === 'long-term' 
    ? taxInfo.longTermCapitalGainsRate 
    : taxInfo.shortTermCapitalGainsRate;
  
  const capitalGainsTax = Math.max(0, capitalGain * capitalGainsRate);
  const totalTaxLiability = ordinaryIncomeTax + capitalGainsTax;
  
  // Calculate incorrect method (where all gain is treated as capital gain)
  const incorrectCapitalGain = totalProceedsFromSale - totalCostBasis;
  const incorrectCapitalGainsTax = Math.max(0, incorrectCapitalGain * capitalGainsRate);
  const incorrectTaxLiability = incorrectCapitalGainsTax;
  
  // Calculate tax savings (could be negative if incorrect method would result in lower taxes)
  const taxSavings = incorrectTaxLiability - totalTaxLiability;
  
  // Calculate adjusted cost basis (original cost basis + ordinary income)
  // This is the value needed for tax reporting to avoid double taxation
  const adjustedCostBasis = totalCostBasis + ordinaryIncome;
  
  return {
    isQualifyingDisposition: qualifying,
    holdingPeriodDays,
    discount,
    discountAmount,
    totalProceedsFromSale,
    totalCostBasis,
    adjustedCostBasis,
    ordinaryIncome,
    capitalGain,
    capitalGainType,
    ordinaryIncomeTax,
    capitalGainsTax,
    totalTaxLiability,
    incorrectCapitalGain,
    incorrectTaxLiability,
    taxSavings
  };
};

/**
 * Formats a number as a currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formats a number as a percentage
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
