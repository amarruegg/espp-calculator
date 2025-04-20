import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import {
  ESPPPurchaseInfo,
  ESPPSaleInfo,
  TaxInfo,
  ESPPCalculationResult,
  ValidationErrors,
  ESPPCalculatorInputs
} from '../types';
import { calculateESPPTaxes, formatCurrency, formatPercentage } from '../utils/esppCalculations';

const initialPurchaseInfo: ESPPPurchaseInfo = {
  purchaseDate: '',
  purchasePrice: 0,
  fairMarketValueAtPurchase: 0,
  offeringDate: '',
  fairMarketValueAtOffering: 0,
  discountPercentage: 15, // Default is often 15%
};

const initialSaleInfo: ESPPSaleInfo = {
  saleDate: '',
  salePrice: 0,
  sharesSold: 0,
};

const initialTaxInfo: TaxInfo = {
  federalIncomeTaxRate: 0.24, // Default to 24% federal
  stateIncomeTaxRate: 0.05, // Default to 5% state
  longTermCapitalGainsRate: 0.15, // Default to 15% for long term
  shortTermCapitalGainsRate: 0.24, // Default matches federal for short term
};

/**
 * Parses Form 3922 data from pasted text
 * Expected format: 
 * "ID_NUMBER MM/DD/YYYY MM/DD/YYYY $XX.XXXX $XX.XXXX $XX.XXXX X,XXX.XXXX"
 * 
 * Box 1: Date Option Granted (Offering Date)
 * Box 2: Date Option Exercised (Purchase Date)
 * Box 3: Fair Market Value per Share on Grant Date
 * Box 4: Fair Market Value per Share on Exercise Date
 * Box 5: Exercise price paid per share
 * Box 6: No. of shares transferred
 */
/**
 * Format a date string from MM/DD/YYYY to YYYY-MM-DD for HTML date input
 */
const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  
  // Convert from MM/DD/YYYY to YYYY-MM-DD
  return `${parts[2]}-${parts[0]}-${parts[1]}`;
};

const parseForm3922Data = (input: string): ESPPCalculatorInputs | null => {
  // Handle multi-line input (take the first non-empty line)
  const lines = input.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return null;
  
  const firstLine = lines[0].trim();
  
  // Basic regex pattern to match the expected format
  // Allow for flexible whitespace between fields, make account number optional, and handle varying decimal places
  const pattern = /^(?:\d+\s+)?(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+\$(\d+(?:\.\d*)?)\s+\$(\d+(?:\.\d*)?)\s+\$(\d+(?:\.\d*)?)\s+([\d,]+(?:\.\d*)?)$/;
  
  const match = firstLine.match(pattern);
  if (!match) {
    console.error('Invalid Form 3922 data format');
    return null;
  }
  
  // Extract the values
  const [
    ,                  // Skip the full match
    offeringDateRaw,   // Box 1
    purchaseDateRaw,   // Box 2
    fmvAtOffering,     // Box 3
    fmvAtPurchase,     // Box 4
    purchasePrice,     // Box 5
    sharesRaw          // Box 6
  ] = match;
  
  // Convert dates to the format expected by HTML date inputs (YYYY-MM-DD)
  const offeringDate = formatDateForInput(offeringDateRaw);
  const purchaseDate = formatDateForInput(purchaseDateRaw);
  
  // Parse the shares value (remove commas)
  const sharesSold = parseFloat(sharesRaw.replace(/,/g, ''));
  
  // Default to 15% discount or try to calculate it
  let discountPercentage = 15;
  try {
    const fmvValue = parseFloat(fmvAtOffering);
    const priceValue = parseFloat(purchasePrice);
    if (fmvValue > 0 && priceValue > 0) {
      discountPercentage = ((fmvValue - priceValue) / fmvValue) * 100;
    }
  } catch (e) {
    console.warn('Could not calculate discount percentage, using default 15%');
  }
  
  // Construct the purchase and sale info objects
  const purchaseInfo: ESPPPurchaseInfo = {
    offeringDate,
    purchaseDate,
    fairMarketValueAtOffering: parseFloat(fmvAtOffering),
    fairMarketValueAtPurchase: parseFloat(fmvAtPurchase),
    purchasePrice: parseFloat(purchasePrice),
    discountPercentage
  };
  
  const saleInfo: ESPPSaleInfo = {
    saleDate: '', // Do not populate sale date from Form 3922
    salePrice: 0, // Form 3922 doesn't include sale price
    sharesSold
  };
  
  return {
    purchaseInfo,
    saleInfo,
    taxInfo: { ...initialTaxInfo } // Use default tax values
  };
};

// Helper function for form validation
const validateForm = (
  purchaseInfo: ESPPPurchaseInfo,
  saleInfo: ESPPSaleInfo,
  taxInfo: TaxInfo
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Purchase info validation
  if (!purchaseInfo.purchaseDate) errors.purchaseDate = 'Purchase date is required';
  if (!purchaseInfo.offeringDate) errors.offeringDate = 'Offering date is required';
  if (purchaseInfo.purchasePrice <= 0) errors.purchasePrice = 'Purchase price must be greater than 0';
  if (purchaseInfo.fairMarketValueAtPurchase <= 0) errors.fairMarketValueAtPurchase = 'Fair market value must be greater than 0';
  if (purchaseInfo.fairMarketValueAtOffering <= 0) errors.fairMarketValueAtOffering = 'Fair market value must be greater than 0';
  // Remove discount percentage validation since it can be negative when purchase price > FMV

  // Sale info validation - Make sale date and price required
  if (!saleInfo.saleDate) errors.saleDate = 'Sale date is required';
  if (saleInfo.salePrice <= 0) errors.salePrice = 'Sale price must be greater than 0';
  if (saleInfo.sharesSold <= 0) errors.sharesSold = 'Shares purchased must be greater than 0';

  // Tax info validation
  if (taxInfo.federalIncomeTaxRate < 0 || taxInfo.federalIncomeTaxRate >= 1) {
    errors.federalIncomeTaxRate = 'Tax rate must be between 0 and 1 (e.g., 0.24 for 24%)';
  }
  if (taxInfo.stateIncomeTaxRate < 0 || taxInfo.stateIncomeTaxRate >= 1) {
    errors.stateIncomeTaxRate = 'Tax rate must be between 0 and 1 (e.g., 0.05 for 5%)';
  }
  if (taxInfo.longTermCapitalGainsRate < 0 || taxInfo.longTermCapitalGainsRate >= 1) {
    errors.longTermCapitalGainsRate = 'Tax rate must be between 0 and 1 (e.g., 0.15 for 15%)';
  }
  if (taxInfo.shortTermCapitalGainsRate < 0 || taxInfo.shortTermCapitalGainsRate >= 1) {
    errors.shortTermCapitalGainsRate = 'Tax rate must be between 0 and 1 (e.g., 0.24 for 24%)';
  }

  return errors;
};

const Calculator = () => {
  // State for form inputs
  const [purchaseInfo, setPurchaseInfo] = useState<ESPPPurchaseInfo>(initialPurchaseInfo);
  const [saleInfo, setSaleInfo] = useState<ESPPSaleInfo>(initialSaleInfo);
  const [taxInfo, setTaxInfo] = useState<TaxInfo>(initialTaxInfo);
  
  // State for validation and results
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [calculationResult, setCalculationResult] = useState<ESPPCalculationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Input handlers
  const calculateDiscountPercentage = (fmvAtOffering: number, purchasePrice: number): number => {
    if (fmvAtOffering > 0 && purchasePrice > 0) {
      return ((fmvAtOffering - purchasePrice) / fmvAtOffering) * 100;
    }
    return 15; // Default if values are invalid
  };

  const handlePurchaseInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name.includes('Date') ? value : parseFloat(value) || 0;
    
    const updatedInfo = {
      ...purchaseInfo,
      [name]: newValue,
    };

    // Recalculate discount percentage when FMV at offering or purchase price changes
    if (name === 'fairMarketValueAtOffering' || name === 'purchasePrice') {
      const fmvAtOffering = name === 'fairMarketValueAtOffering' 
        ? (parseFloat(value) || 0) 
        : purchaseInfo.fairMarketValueAtOffering;
      const price = name === 'purchasePrice' 
        ? (parseFloat(value) || 0) 
        : purchaseInfo.purchasePrice;
      updatedInfo.discountPercentage = calculateDiscountPercentage(fmvAtOffering, price);
    }

    setPurchaseInfo(updatedInfo);
  };

  const handleSaleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSaleInfo({
      ...saleInfo,
      [name]: name.includes('Date') ? value : parseFloat(value) || 0,
    });
  };

  const handleTaxInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaxInfo({
      ...taxInfo,
      [name]: parseFloat(value) || 0,
    });
  };

  // Calculate results
  // Ref for results section
  const resultsRef = useRef<HTMLDivElement>(null);

  const calculateResults = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(purchaseInfo, saleInfo, taxInfo);
    setErrors(validationErrors);
    
    // If there are errors, don't calculate
    if (Object.keys(validationErrors).length > 0) {
      setShowResults(false);
      return;
    }
    
    // Calculate ESPP taxes
    const results = calculateESPPTaxes(purchaseInfo, saleInfo, taxInfo);
    setCalculationResult(results);
    setShowResults(true);

    // Scroll to results on mobile
    if (window.innerWidth <= 768 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Reset form
  const resetForm = () => {
    setPurchaseInfo(initialPurchaseInfo);
    setSaleInfo(initialSaleInfo);
    setTaxInfo(initialTaxInfo);
    setErrors({});
    setCalculationResult(null);
    setShowResults(false);
  };

  // Export results as PDF
  const exportPDF = () => {
    if (!calculationResult) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('ESPP Tax Calculation Results', 20, 20);
    
    doc.setFontSize(12);
    
    // Input summary
    doc.text('Input Summary:', 20, 35);
    doc.text(`Purchase Date: ${purchaseInfo.purchaseDate}`, 25, 45);
    doc.text(`Purchase Price: ${formatCurrency(purchaseInfo.purchasePrice)}`, 25, 52);
    doc.text(`FMV at Purchase: ${formatCurrency(purchaseInfo.fairMarketValueAtPurchase)}`, 25, 59);
    doc.text(`Offering Date: ${purchaseInfo.offeringDate}`, 25, 66);
    doc.text(`FMV at Offering: ${formatCurrency(purchaseInfo.fairMarketValueAtOffering)}`, 25, 73);
    doc.text(`Discount: ${purchaseInfo.discountPercentage}%`, 25, 80);
    doc.text(`Sale Date: ${saleInfo.saleDate}`, 25, 87);
    doc.text(`Sale Price: ${formatCurrency(saleInfo.salePrice)}`, 25, 94);
    doc.text(`Shares Sold: ${saleInfo.sharesSold}`, 25, 101);
    
    // Results
    doc.text('Calculation Results:', 20, 116);
    doc.text(`Disposition Type: ${calculationResult.isQualifyingDisposition ? 'Qualifying' : 'Disqualifying'}`, 25, 126);
    doc.text(`Holding Period: ${calculationResult.holdingPeriodDays} days`, 25, 133);
    
    // Highlight adjusted cost basis
    doc.setFillColor(230, 255, 230);
    doc.rect(20, 140, 170, 12, 'F');
    doc.setTextColor(0, 100, 0);
    doc.text(`Adjusted Cost Basis: ${formatCurrency(calculationResult.adjustedCostBasis)} (Report this value)`, 25, 147);
    doc.setTextColor(0, 0, 0);
    
    // Highlight gross gain
    doc.setFillColor(245, 230, 255);
    doc.rect(20, 152, 170, 12, 'F');
    doc.setTextColor(100, 0, 100);
    doc.text(`Gross Gain: ${formatCurrency(calculationResult.totalProceedsFromSale - calculationResult.totalCostBasis)}`, 25, 159);
    doc.setTextColor(0, 0, 0);
    
    // Highlight net gain
    doc.setFillColor(230, 230, 255);
    doc.rect(20, 164, 170, 12, 'F');
    doc.setTextColor(0, 0, 100);
    doc.text(`Net Gain: ${formatCurrency(calculationResult.totalProceedsFromSale - calculationResult.totalCostBasis - calculationResult.totalTaxLiability)}`, 25, 171);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Ordinary Income: ${formatCurrency(calculationResult.ordinaryIncome)}`, 25, 182);
    doc.text(`Capital Gain: ${formatCurrency(calculationResult.capitalGain)} (${calculationResult.capitalGainType})`, 25, 189);
    doc.text(`Tax Liability: ${formatCurrency(calculationResult.totalTaxLiability)}`, 25, 196);
    doc.text(`Tax Savings: ${formatCurrency(calculationResult.taxSavings)}`, 25, 203);
    
    // Add footer
    doc.setFontSize(10);
    doc.text('This calculation is for informational purposes only and does not constitute tax advice.', 20, 280);
    
    // Save the PDF
    doc.save('espp-tax-calculation.pdf');
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Form section */}
        <div className="neu-element p-6 shadow-lg">
          
          <form onSubmit={calculateResults} noValidate>
            {/* ESPP Purchase Information - Reordered to match Form 3922 */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-4 text-blue-600 border-b pb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ESPP Information (From Form 3922)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Box 1: Date Option Granted */}
                <div className="mb-4">
                  <label htmlFor="offeringDate" className="block mb-1 font-medium text-sm sm:text-base">
                    Offering Date <span className="text-xs text-gray-500">Box&nbsp;1</span>
                  </label>
                  <input
                    type="date"
                    id="offeringDate"
                    name="offeringDate"
                    value={purchaseInfo.offeringDate}
                    onChange={handlePurchaseInfoChange}
                    className={`form-input ${errors.offeringDate ? 'border-red-500' : ''}`}
                  />
                  {errors.offeringDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.offeringDate}</p>
                  )}
                </div>
                
                {/* Box 2: Date Option Exercised */}
                <div className="mb-4">
                  <label htmlFor="purchaseDate" className="block mb-1 font-medium text-sm sm:text-base">
                    Purchase Date <span className="text-xs text-gray-500">Box&nbsp;2</span>
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={purchaseInfo.purchaseDate}
                    onChange={handlePurchaseInfoChange}
                    className={`form-input ${errors.purchaseDate ? 'border-red-500' : ''}`}
                  />
                  {errors.purchaseDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>
                  )}
                </div>

                {/* Box 3: FMV on Grant Date */}
                <div className="mb-4">
                  <label htmlFor="fairMarketValueAtOffering" className="block mb-1 font-medium text-sm sm:text-base">
                    FMV at Offering <span className="text-xs text-gray-500">Box&nbsp;3</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="fairMarketValueAtOffering"
                      name="fairMarketValueAtOffering"
                      min="0"
                      step="0.01"
                      value={purchaseInfo.fairMarketValueAtOffering || ''}
                      onChange={handlePurchaseInfoChange}
                      className={`form-input pl-7 ${errors.fairMarketValueAtOffering ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.fairMarketValueAtOffering && (
                    <p className="text-red-500 text-sm mt-1">{errors.fairMarketValueAtOffering}</p>
                  )}
                </div>
                
                {/* Box 4: FMV on Exercise Date */}
                <div className="mb-4">
                  <label htmlFor="fairMarketValueAtPurchase" className="block mb-1 font-medium text-sm sm:text-base">
                    FMV at Purchase <span className="text-xs text-gray-500">Box&nbsp;4</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="fairMarketValueAtPurchase"
                      name="fairMarketValueAtPurchase"
                      min="0"
                      step="0.01"
                      value={purchaseInfo.fairMarketValueAtPurchase || ''}
                      onChange={handlePurchaseInfoChange}
                      className={`form-input pl-7 ${errors.fairMarketValueAtPurchase ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.fairMarketValueAtPurchase && (
                    <p className="text-red-500 text-sm mt-1">{errors.fairMarketValueAtPurchase}</p>
                  )}
                </div>

                {/* Box 5: Exercise Price */}
                <div className="mb-4">
                  <label htmlFor="purchasePrice" className="block mb-1 font-medium text-sm sm:text-base">
                    Purchase Price <span className="text-xs text-gray-500">Box&nbsp;5</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="purchasePrice"
                      name="purchasePrice"
                      min="0"
                      step="0.01"
                      value={purchaseInfo.purchasePrice || ''}
                      onChange={handlePurchaseInfoChange}
                      className={`form-input pl-7 ${errors.purchasePrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.purchasePrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>
                  )}
                </div>
                
                {/* Box 6: Shares Transferred */}
                <div className="mb-4">
                  <label htmlFor="sharesSold" className="block mb-1 font-medium text-sm sm:text-base">
                    Shares Sold <span className="text-xs text-gray-500">Box&nbsp;6</span>
                  </label>
                  <input
                    type="number"
                    id="sharesSold"
                    name="sharesSold"
                    min="0"
                    step="1"
                    value={saleInfo.sharesSold || ''}
                    onChange={handleSaleInfoChange}
                    className={`form-input ${errors.sharesSold ? 'border-red-500' : ''}`}
                  />
                  {errors.sharesSold && (
                    <p className="text-red-500 text-sm mt-1">{errors.sharesSold}</p>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium my-4 text-blue-600 border-b pb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Sale Information (From Brokerage)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Sale Date - from brokerage, not Form 3922 */}
                <div className="mb-4">
                  <label htmlFor="saleDate" className="block mb-1 font-medium text-sm sm:text-base">
                    Sale Date
                  </label>
                  <input
                    type="date"
                    id="saleDate"
                    name="saleDate"
                    value={saleInfo.saleDate}
                    onChange={handleSaleInfoChange}
                    className={`form-input ${errors.saleDate ? 'border-red-500' : ''}`}
                  />
                  {errors.saleDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.saleDate}</p>
                  )}
                </div>
                
                {/* Sale Price */}
                <div className="mb-4">
                  <label htmlFor="salePrice" className="block mb-1 font-medium text-sm sm:text-base">
                    Sale Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      min="0"
                      step="0.01"
                      value={saleInfo.salePrice || ''}
                      onChange={handleSaleInfoChange}
                      className={`form-input pl-7 ${errors.salePrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.salePrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.salePrice}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Rate Information */}
            <div className="my-4">
              <h3 className="text-lg font-medium mb-4 text-blue-600 border-b pb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Tax Rate Information
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="mb-4">
                  <label htmlFor="federalIncomeTaxRate" className="block mb-1 font-medium text-sm sm:text-base">
                    Federal Income Tax&nbsp;Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      id="federalIncomeTaxRate"
                      name="federalIncomeTaxRate"
                      value={taxInfo.federalIncomeTaxRate}
                      onChange={handleTaxInfoChange}
                      className={`form-input pr-7 ${errors.federalIncomeTaxRate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.federalIncomeTaxRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.federalIncomeTaxRate}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="stateIncomeTaxRate" className="block mb-1 font-medium text-sm sm:text-base">
                    State Income Tax&nbsp;Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      id="stateIncomeTaxRate"
                      name="stateIncomeTaxRate"
                      value={taxInfo.stateIncomeTaxRate}
                      onChange={handleTaxInfoChange}
                      className={`form-input pr-7 ${errors.stateIncomeTaxRate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.stateIncomeTaxRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.stateIncomeTaxRate}</p>
                  )}
                </div>
              
                <div className="mb-4">
                  <label htmlFor="longTermCapitalGainsRate" className="block mb-1 font-medium text-sm sm:text-base">
                    Long-Term Capital Gains&nbsp;Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      id="longTermCapitalGainsRate"
                      name="longTermCapitalGainsRate"
                      value={taxInfo.longTermCapitalGainsRate}
                      onChange={handleTaxInfoChange}
                      className={`form-input pr-7 ${errors.longTermCapitalGainsRate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.longTermCapitalGainsRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.longTermCapitalGainsRate}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="shortTermCapitalGainsRate" className="block mb-1 font-medium text-sm sm:text-base">
                    Short-Term Capital Gains&nbsp;Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      id="shortTermCapitalGainsRate"
                      name="shortTermCapitalGainsRate"
                      value={taxInfo.shortTermCapitalGainsRate}
                      onChange={handleTaxInfoChange}
                      className={`form-input pr-7 ${errors.shortTermCapitalGainsRate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.shortTermCapitalGainsRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.shortTermCapitalGainsRate}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap gap-4 w-full max-w-md">
                <button type="submit" className="btn btn-primary flex-1 py-3 rounded-full shadow-md transition-transform hover:scale-105">
                  Calculate
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 py-3 rounded-full shadow-md transition-transform hover:scale-105"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Form 3922 Data Paste */}
            <div className="mt-8 bg-blue-50 p-5 rounded-lg shadow-inner">
              <div className="mb-3">
                <h3 className="text-lg font-medium mb-3 text-blue-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Quick Import - Form 3922
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3 bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                    Copy and paste the values in boxes 1-6 from your Form 3922 below to automatically fill the form.
                  </p>
                  <textarea
                    className="form-input w-full font-mono text-sm shadow-inner bg-gray-50"
                    rows={4}
                    placeholder="05/15/2023 05/15/2024 $8.54 $17.08 $7.25 1,000"
                    onChange={(e) => {
                      const parsedData = parseForm3922Data(e.target.value);
                      if (parsedData) {
                        setPurchaseInfo(parsedData.purchaseInfo);
                        setSaleInfo(parsedData.saleInfo);
                      }
                    }}
                  ></textarea>
                </div>
                
                <div className="border border-blue-300 rounded-md p-3 bg-white">
                  
                  {/* Mobile-friendly format - Table style with labels and values in rows */}
                  <div className="block md:hidden">
                    <div className="text-xs mb-3">
                      <div className="grid grid-cols-2 mb-1">
                        <div className="font-medium py-1 px-2 bg-gray-100 rounded-l">Box 1: Offering Date</div>
                        <div className="py-1 px-2 bg-gray-50 border border-gray-200 rounded-r font-mono">05/15/2023</div>
                      </div>
                      <div className="grid grid-cols-2 mb-1">
                        <div className="font-medium py-1 px-2 bg-gray-100 rounded-l">Box 2: Purchase Date</div>
                        <div className="py-1 px-2 bg-gray-50 border border-gray-200 rounded-r font-mono">05/15/2024</div>
                      </div>
                      <div className="grid grid-cols-2 mb-1">
                        <div className="font-medium py-1 px-2 bg-gray-100 rounded-l">Box 3: FMV at Offering</div>
                        <div className="py-1 px-2 bg-gray-50 border border-gray-200 rounded-r font-mono">$8.54</div>
                      </div>
                      <div className="grid grid-cols-2 mb-1">
                        <div className="font-medium py-1 px-2 bg-gray-100 rounded-l">Box 4: FMV at Purchase</div>
                        <div className="py-1 px-2 bg-gray-50 border border-gray-200 rounded-r font-mono">$18.08</div>
                      </div>
                      <div className="grid grid-cols-2 mb-1">
                        <div className="font-medium py-1 px-2 bg-gray-100 rounded-l">Box 5: Purchase Price</div>
                        <div className="py-1 px-2 bg-gray-50 border border-gray-200 rounded-r font-mono">$7.25</div>
                      </div>
                      <div className="grid grid-cols-2 mb-1">
                        <div className="font-medium py-1 px-2 bg-gray-100 rounded-l">Box 6: Shares</div>
                        <div className="py-1 px-2 bg-gray-50 border border-gray-200 rounded-r font-mono">1,000</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop format with more traditional form look */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex flex-col">
                        <div className="font-medium p-1 bg-gray-100 border border-gray-300 rounded-t text-center">Box 1
                          <div className="mt-1 text-[10px] text-gray-500 text-center">Offering Date</div>
                        </div>
                        <div className="p-1 border border-t-0 border-gray-300 rounded-b text-center font-mono">05/15/2023</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium p-1 bg-gray-100 border border-gray-300 rounded-t text-center">Box 2
                          <div className="mt-1 text-[10px] text-gray-500 text-center">Purchase Date</div>
                        </div>
                        <div className="p-1 border border-t-0 border-gray-300 rounded-b text-center font-mono">05/15/2024</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium p-1 bg-gray-100 border border-gray-300 rounded-t text-center">Box 3
                          <div className="mt-1 text-[10px] text-gray-500 text-center">FMV at Offering</div>
                        </div>
                        <div className="p-1 border border-t-0 border-gray-300 rounded-b text-center font-mono">$8.54</div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="font-medium p-1 bg-gray-100 border border-gray-300 rounded-t text-center">Box 4
                          <div className="mt-1 text-[10px] text-gray-500 text-center">FMV at Purchase</div>
                        </div>
                        <div className="p-1 border border-t-0 border-gray-300 rounded-b text-center font-mono">$18.08</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium p-1 bg-gray-100 border border-gray-300 rounded-t text-center">Box 5
                          <div className="mt-1 text-[10px] text-gray-500 text-center">Purchase Price</div>
                        </div>
                        <div className="p-1 border border-t-0 border-gray-300 rounded-b text-center font-mono">$7.25</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium p-1 bg-gray-100 border border-gray-300 rounded-t text-center">Box 6
                          <div className="mt-1 text-[10px] text-gray-500 text-center">Shares Purchased</div>
                        </div>
                        <div className="p-1 border border-t-0 border-gray-300 rounded-b text-center font-mono">1,000</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-600 border-t border-gray-200 pt-2">
                    <div className="font-medium mb-1">Example input:</div>
                    <div className="font-mono bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto whitespace-nowrap">
                      05/15/2023 05/15/2024 $8.54 $18.08 $7.25 1,000
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
          </form>
        </div>
        
        {/* Results section */}
        <div ref={resultsRef}>
          {showResults && calculationResult ? (
            <div className="neu-element p-6 fade-in shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculation Results
                </h2>
                <button 
                  onClick={exportPDF}
                  className="export-button btn bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Export PDF
                </button>
              </div>
              
              {/* Adjusted Cost Basis - Critical for Tax Reporting - Always show */}
              <div className="mb-6">
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500 shadow-md">
                  <h3 className="font-semibold text-green-700 mb-2">
                    Adjusted Cost Basis for Tax Reporting
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-green-800">
                      {formatCurrency(calculationResult.adjustedCostBasis)}
                    </span>
                    <span className="text-sm text-green-600">
                      Per {saleInfo.sharesSold} shares
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>This is the value you should report as your cost basis</strong> on your tax forms to avoid double taxation.
                  </p>
                  <div className="text-xs text-green-600">
                    Original Cost Basis ({formatCurrency(calculationResult.totalCostBasis)}) + Ordinary Income ({formatCurrency(calculationResult.ordinaryIncome)})
                  </div>
                </div>
              </div>
              
              {/* Only show sale-related results if sale information is provided */}
              {saleInfo.saleDate && saleInfo.salePrice > 0 ? (
                <>
                  {/* Total Gain Summary - Only show if shares were sold */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {/* Gross Gain - Before taxes */}
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-400 shadow-md">
                      <h3 className="font-semibold text-purple-700 mb-2 text-center">
                        Gross Gain
                      </h3>
                      <div className="text-center mb-2">
                        <span className="text-2xl font-bold text-purple-800">
                          {formatCurrency(calculationResult.totalProceedsFromSale - calculationResult.totalCostBasis)}
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 text-center">
                        Total gain before taxes
                      </p>
                    </div>
                    
                    {/* Net Profit - After taxes */}
                    <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-400 shadow-md">
                      <h3 className="font-semibold text-indigo-700 mb-2 text-center">
                        Net Gain
                      </h3>
                      <div className="text-center mb-2">
                        <span className="text-2xl font-bold text-indigo-800">
                          {formatCurrency(calculationResult.totalProceedsFromSale - calculationResult.totalCostBasis - calculationResult.totalTaxLiability)}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 text-center">
                        Your actual profit after taxes
                      </p>
                    </div>
                  </div>

                  {/* Disposition Type - Only relevant if shares were sold */}
                  <div className="mb-6">
                    <div className={`text-center p-3 rounded-lg mb-2 ${
                      calculationResult.isQualifyingDisposition 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className="font-medium">
                        {calculationResult.isQualifyingDisposition ? 'Qualifying Disposition' : 'Disqualifying Disposition'}
                      </span>
                      <span className="block text-sm mt-1">
                        Holding Period: {calculationResult.holdingPeriodDays} days
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {calculationResult.isQualifyingDisposition 
                        ? 'Your sale qualifies for preferential tax treatment because you held the shares for at least 1 year after purchase and 2 years after the offering date.'
                        : 'Your sale does not qualify for preferential tax treatment because you did not meet the minimum holding periods required by the IRS.'}
                    </p>
                  </div>
                  
                  {/* ESPP Purchase Information Summary - Always show */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-blue-600 border-b pb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ESPP Purchase Summary
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg shadow-inner">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Purchase Price:</div>
                        <div className="text-right font-medium">{formatCurrency(purchaseInfo.purchasePrice)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">FMV at Purchase:</div>
                        <div className="text-right font-medium">{formatCurrency(purchaseInfo.fairMarketValueAtPurchase)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">FMV at Offering:</div>
                        <div className="text-right font-medium">{formatCurrency(purchaseInfo.fairMarketValueAtOffering)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Shares Purchased:</div>
                        <div className="text-right font-medium">{saleInfo.sharesSold}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Discount Percentage:</div>
                        <div className="text-right font-medium">
                          {purchaseInfo.discountPercentage % 1 > 0.94 
                            ? Math.round(purchaseInfo.discountPercentage) 
                            : purchaseInfo.discountPercentage.toFixed(2).replace(/\.00$/, '')}%
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <div className="text-sm font-medium">
                          <span className="tooltip" title="The difference between FMV at purchase and your purchase price. This amount is treated as ordinary income for disqualifying dispositions.">
                            Market Discount Value:
                          </span>
                        </div>
                        <div className="text-right font-medium">
                          {formatCurrency((purchaseInfo.fairMarketValueAtPurchase - calculationResult.totalCostBasis / saleInfo.sharesSold) * saleInfo.sharesSold)}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: For tax purposes, the IRS considers the difference between Fair Market Value at purchase and 
                      your purchase price as ordinary income for disqualifying dispositions. This value is included in 
                      your adjusted cost basis to avoid double taxation.
                    </p>
                  </div>
                                
                  {/* Financial Summary - Show different info based on whether shares were sold */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-blue-600 border-b pb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Financial Summary
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg shadow-inner">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Total Proceeds:</div>
                        <div className="text-right font-medium">{formatCurrency(calculationResult.totalProceedsFromSale)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Original Cost Basis:</div>
                        <div className="text-right font-medium">-{formatCurrency(calculationResult.totalCostBasis)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2 pt-2 border-t border-gray-200">
                        <div className="text-sm font-medium">Gross Earnings:</div>
                        <div className="text-right font-medium">{formatCurrency(calculationResult.totalProceedsFromSale - calculationResult.totalCostBasis)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Total Tax:</div>
                        <div className="text-right font-medium">-{formatCurrency(calculationResult.totalTaxLiability)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                        <div className="text-sm font-medium">Net Gain:</div>
                        <div className="text-right font-medium">{formatCurrency(calculationResult.totalProceedsFromSale - calculationResult.totalCostBasis - calculationResult.totalTaxLiability)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tax Components */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-blue-600 border-b pb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                      </svg>
                      Tax Components
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="neu-element-inset p-3 rounded-lg">
                        <div className="text-center mb-2">
                          <div className="text-lg font-medium">{formatCurrency(calculationResult.ordinaryIncome)}</div>
                          <div className="text-sm text-gray-600">Ordinary Income</div>
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          Taxed at your marginal income tax rate ({formatPercentage(taxInfo.federalIncomeTaxRate + taxInfo.stateIncomeTaxRate)})
                        </div>
                      </div>
                      
                      <div className="neu-element-inset p-3 rounded-lg">
                        <div className="text-center mb-2">
                          <div className="text-lg font-medium">
                            {calculationResult.capitalGain >= 0 ? '' : '-'}{formatCurrency(Math.abs(calculationResult.capitalGain))}
                          </div>
                          <div className="text-sm text-gray-600">
                            Capital {calculationResult.capitalGain >= 0 ? 'Gain' : 'Loss'} ({calculationResult.capitalGainType})
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          Taxed at {
                            calculationResult.capitalGainType === 'long-term' 
                              ? formatPercentage(taxInfo.longTermCapitalGainsRate)
                              : formatPercentage(taxInfo.shortTermCapitalGainsRate)
                          } rate
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tax Calculation */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-blue-600 border-b pb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Tax Calculation
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg shadow-inner">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Ordinary Income Tax:</div>
                        <div className="text-right font-medium">{formatCurrency(calculationResult.ordinaryIncomeTax)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="text-sm text-gray-600">Capital Gains Tax:</div>
                        <div className="text-right font-medium">{formatCurrency(calculationResult.capitalGainsTax)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                        <div className="text-sm font-medium">Total Tax Liability:</div>
                        <div className="text-right font-medium">{formatCurrency(calculationResult.totalTaxLiability)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Removed Tax Savings Comparison Section */}
                </>
              ) : (
                <>
                  {/* Show this when sale information is not provided */}
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-md">
                    <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Preparation Information
                    </h3>
                    <p className="text-blue-700 mb-3">
                      You have not entered sale information yet. This calculation shows the tax implications
                      of your ESPP purchase, which you'll need for tax reporting.
                    </p>
                  </div>
                </>
              )}
              
            </div>
          ) : (
            <div className="neu-element p-6 h-full flex items-center justify-center shadow-lg">
              <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18ZM8.25 6h7.5v2.25h-7.5V6Z" />
                </svg>
                <p className="text-lg">Enter your ESPP information and click "Calculate" to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
