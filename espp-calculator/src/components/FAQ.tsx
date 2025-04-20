import React, { useState } from 'react';

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

const faqData: FAQItem[] = [
  {
    question: 'What is an Employee Stock Purchase Plan (ESPP)?',
    answer: (
      <>
        <p>
          An Employee Stock Purchase Plan (ESPP) is a company-sponsored program that allows employees
          to purchase company stock at a discounted price, typically 5-15% below market value. ESPPs are
          regulated under Section 423 of the Internal Revenue Code and provide a valuable benefit to employees
          of public companies.
        </p>
      </>
    ),
  },
  {
    question: 'How are ESPP shares taxed?',
    answer: (
      <>
        <p>
          ESPP taxation involves two potential tax events:
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            <strong>Ordinary Income:</strong> The discount you received when purchasing shares (and potentially
            any additional bargain element) is taxed as ordinary income.
          </li>
          <li>
            <strong>Capital Gains/Losses:</strong> Any additional appreciation (or depreciation) in the stock
            price after purchase is taxed as capital gains or losses when you sell the shares.
          </li>
        </ol>
        <p className="mt-2">
          The specific tax treatment depends on whether your sale is a qualifying or disqualifying disposition.
        </p>
      </>
    ),
  },
  {
    question: 'What is a qualifying disposition for ESPP shares?',
    answer: (
      <>
        <p>
          A qualifying disposition occurs when you sell your ESPP shares after meeting <strong>both</strong> of these holding periods:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>At least 1 year after the purchase date</li>
          <li>At least 2 years after the offering date (when the ESPP offering period began)</li>
        </ul>
        <p className="mt-2">
          Qualifying dispositions typically receive more favorable tax treatment, with a smaller portion of your
          gains being taxed as ordinary income and more as capital gains (which are often taxed at lower rates).
        </p>
      </>
    ),
  },
  {
    question: 'What is a disqualifying disposition for ESPP shares?',
    answer: (
      <>
        <p>
          A disqualifying disposition occurs when you sell ESPP shares without meeting the holding period requirements
          for a qualifying disposition. Specifically, if you sell:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Before 1 year after the purchase date, or</li>
          <li>Before 2 years after the offering date</li>
        </ul>
        <p className="mt-2">
          With disqualifying dispositions, the discount you received (and potentially any additional bargain element)
          is reported as ordinary income on your W-2 for the year of the sale.
        </p>
      </>
    ),
  },
  {
    question: 'How do I determine my cost basis for ESPP shares?',
    answer: (
      <>
        <p>
          Determining your adjusted cost basis for ESPP shares is crucial for accurate tax reporting:
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>Start with the actual price you paid for the shares (discounted purchase price)</li>
          <li>Add any amount reported as ordinary income on your W-2 related to these shares</li>
        </ol>
        <p className="mt-2">
          This adjusted cost basis prevents double taxation by ensuring that the discount amount
          is only taxed once as ordinary income, not again as a capital gain.
        </p>
      </>
    ),
  },
  {
    question: 'What are the common mistakes people make with ESPP taxes?',
    answer: (
      <>
        <p>
          Common ESPP tax reporting mistakes include:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Double taxation:</strong> Not adjusting cost basis for the discount already taxed as ordinary income
          </li>
          <li>
            <strong>Incorrect holding period calculations:</strong> Miscalculating the qualifying disposition requirements
          </li>
          <li>
            <strong>Missing Form 3922:</strong> Not reconciling information from this form which employers must provide for ESPP purchases
          </li>
          <li>
            <strong>Overlooking wash sale rules:</strong> Not considering these rules when selling ESPP shares at a loss and purchasing additional company stock
          </li>
        </ul>
        <p className="mt-2">
          These mistakes can result in overpaying taxes or potential IRS audits.
        </p>
      </>
    ),
  },
  {
    question: 'Do I need to report ESPP information on my tax return?',
    answer: (
      <>
        <p>
          Yes, you must report ESPP transactions on your tax return when you sell the shares. You'll need:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Form 3922 (provided by your employer) which contains purchase information</li>
          <li>Form 1099-B (provided by your broker) which reports the sale</li>
        </ul>
        <p className="mt-2">
          When you sell ESPP shares, you'll report the transaction on Form 8949 and Schedule D of your federal tax return.
          For disqualifying dispositions, your employer typically includes the ordinary income portion on your W-2.
        </p>
      </>
    ),
  },
  {
    question: 'How does the lookback provision affect my ESPP taxes?',
    answer: (
      <>
        <p>
          The lookback provision allows you to purchase shares at a discount from the lower of:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>The stock price at the beginning of the offering period (offering date)</li>
          <li>The stock price at the end of the offering period (purchase date)</li>
        </ul>
        <p className="mt-2">
          For tax purposes, this can create an additional "bargain element" beyond the explicit discount percentage. 
          If the stock price increased during the offering period, your effective discount (and therefore potential 
          ordinary income) will be larger than the stated discount percentage.
        </p>
      </>
    ),
  },
  {
    question: 'Can I use this calculator for RSUs or stock options?',
    answer: (
      <>
        <p>
          No, this calculator is specifically designed for Employee Stock Purchase Plans (ESPPs) under Section 423 
          of the Internal Revenue Code. Restricted Stock Units (RSUs), Incentive Stock Options (ISOs), and Non-qualified 
          Stock Options (NSOs) have different tax rules and would require separate calculation methods.
        </p>
      </>
    ),
  },
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container-custom my-8">
      <div className="neu-element p-6">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div 
              key={index}
              className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
            >
              <button
                className="flex justify-between items-center w-full text-left font-medium py-2 focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
              >
                <span className="text-lg">{item.question}</span>
                <svg 
                  className={`w-5 h-5 transform transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`mt-2 transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="text-gray-600 dark:text-gray-400 pb-2">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
