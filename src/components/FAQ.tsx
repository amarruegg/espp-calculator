import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AdUnit } from '../App';

type FAQItem = {
  id: string;
  topic: 'basics' | 'taxation' | 'reporting' | 'advanced';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  quickAnswer: string;
  answer: React.ReactNode;
  relatedQuestions: string[];
  keyTakeaways?: string[];
};

const faqData: FAQItem[] = [
  {
    id: 'what-is-espp',
    topic: 'basics',
    difficulty: 'basic',
    question: 'What is an Employee Stock Purchase Plan (ESPP)?',
    quickAnswer: 'An ESPP is a company benefit that lets employees buy company stock at a discount, usually 5-15% below market value.',
    answer: (
      <>
        <p>
          An Employee Stock Purchase Plan (ESPP) is a company-sponsored program that allows employees
          to purchase company stock at a discounted price, typically 5-15% below market value. ESPPs are
          regulated under Section 423 of the Internal Revenue Code and provide a valuable benefit to employees
          of public companies.
        </p>
        <div className="mt-4">
          <Link to="/calculator" className="text-blue-600 hover:text-blue-800">
            Calculate your ESPP tax liability →
          </Link>
        </div>
      </>
    ),
    relatedQuestions: ['how-are-espp-taxed', 'what-is-lookback'],
  },
  {
    id: 'how-are-espp-taxed',
    topic: 'taxation',
    difficulty: 'intermediate',
    question: 'How are ESPP shares taxed?',
    quickAnswer: 'ESPP shares are taxed in two ways: the discount as ordinary income and any additional gains/losses as capital gains/losses.',
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
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Key Takeaways:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>ESPP discounts are always taxed as ordinary income</li>
            <li>Additional gains may qualify for lower capital gains rates</li>
            <li>Proper tax reporting is crucial to avoid double taxation</li>
          </ul>
        </div>
      </>
    ),
    relatedQuestions: ['qualifying-disposition', 'disqualifying-disposition', 'cost-basis']
  },
  {
    id: 'qualifying-disposition',
    topic: 'taxation',
    difficulty: 'intermediate',
    question: 'What is a qualifying disposition for ESPP shares?',
    quickAnswer: 'A qualifying disposition occurs when you hold ESPP shares for at least 1 year after purchase and 2 years after the offering date.',
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
        <div className="mt-4">
          <Link to="/calculator" className="text-blue-600 hover:text-blue-800">
            Calculate your potential tax savings →
          </Link>
        </div>
      </>
    ),
    relatedQuestions: ['disqualifying-disposition', 'how-are-espp-taxed', 'cost-basis']
  },
  {
    id: 'disqualifying-disposition',
    topic: 'taxation',
    difficulty: 'intermediate',
    question: 'What is a disqualifying disposition for ESPP shares?',
    quickAnswer: 'A disqualifying disposition occurs when you sell ESPP shares before meeting the minimum holding periods.',
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
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium mb-2">Important Note:</h4>
          <p className="text-sm">
            While disqualifying dispositions may result in higher taxes, they might be appropriate in certain situations,
            such as when you need the funds or want to diversify your portfolio.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['qualifying-disposition', 'how-are-espp-taxed', 'cost-basis']
  },
  {
    id: 'cost-basis',
    topic: 'reporting',
    difficulty: 'advanced',
    question: 'How do I determine my cost basis for ESPP shares?',
    quickAnswer: 'Your cost basis is the purchase price plus any amount reported as ordinary income on your W-2.',
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
        <div className="mt-4">
          <Link to="/calculator" className="text-blue-600 hover:text-blue-800">
            Calculate your adjusted cost basis →
          </Link>
        </div>
      </>
    ),
    relatedQuestions: ['common-mistakes', 'tax-reporting', 'how-are-espp-taxed']
  },
  {
    id: 'common-mistakes',
    topic: 'reporting',
    difficulty: 'intermediate',
    question: 'What are the common mistakes people make with ESPP taxes?',
    quickAnswer: 'Common mistakes include double taxation, incorrect holding period calculations, and missing Form 3922 information.',
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
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Avoid These Mistakes:</h4>
          <p className="text-sm">
            Use our <Link to="/calculator" className="text-blue-600 hover:text-blue-800">ESPP Calculator</Link> to ensure
            accurate cost basis calculations and proper tax treatment of your ESPP shares.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['tax-reporting', 'cost-basis', 'how-are-espp-taxed']
  },
  {
    id: 'tax-reporting',
    topic: 'reporting',
    difficulty: 'advanced',
    question: 'Do I need to report ESPP information on my tax return?',
    quickAnswer: 'Yes, you must report ESPP sales on Form 8949 and Schedule D, using information from Forms 3922 and 1099-B.',
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
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium mb-2">Pro Tip:</h4>
          <p className="text-sm">
            Keep all your ESPP-related documents organized throughout the year to make tax reporting easier.
            Consider using our calculator to maintain accurate records of your transactions.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['common-mistakes', 'cost-basis', 'how-are-espp-taxed']
  },
  {
    id: 'what-is-lookback',
    topic: 'advanced',
    difficulty: 'advanced',
    question: 'How does the lookback provision affect my ESPP taxes?',
    quickAnswer: 'The lookback provision allows purchase at a discount from the lower price between offering and purchase dates, potentially increasing your tax liability.',
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
        <div className="mt-4">
          <Link to="/calculator" className="text-blue-600 hover:text-blue-800">
            Calculate your lookback benefit →
          </Link>
        </div>
      </>
    ),
    relatedQuestions: ['how-are-espp-taxed', 'cost-basis', 'common-mistakes']
  },
  {
    id: 'leaving-company',
    topic: 'basics',
    difficulty: 'basic',
    question: 'What happens to my ESPP shares if I leave the company?',
    quickAnswer: 'Your purchased ESPP shares remain yours after leaving the company, but you can\'t participate in future offering periods.',
    answer: (
      <>
        <p>
          When you leave your company:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Any ESPP shares you've already purchased remain yours</li>
          <li>Your participation in the current offering period ends</li>
          <li>Any accumulated payroll deductions are refunded to you</li>
          <li>You can't participate in future offering periods</li>
        </ul>
        <p className="mt-2">
          The tax treatment of your shares remains the same - your holding periods continue to run from
          your original purchase and offering dates, regardless of your employment status.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium mb-2">Important Note:</h4>
          <p className="text-sm">
            Review your company's ESPP plan document for specific details about what happens to your
            accumulated payroll deductions if you leave mid-offering period.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['what-is-espp', 'qualifying-disposition', 'tax-reporting']
  },
  {
    id: 'multiple-periods',
    topic: 'basics',
    difficulty: 'intermediate',
    question: 'Can I participate in multiple ESPP offering periods?',
    quickAnswer: 'Yes, most companies allow continuous participation in consecutive offering periods as long as you remain eligible.',
    answer: (
      <>
        <p>
          Most companies allow and encourage continuous participation in ESPP offering periods:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>You can enroll in each new offering period as they begin</li>
          <li>Each offering period is treated separately for tax purposes</li>
          <li>You can have different purchase dates and holding periods for shares from different offering periods</li>
        </ul>
        <p className="mt-2">
          However, there are usually limits on how much you can purchase across all offering periods in a calendar year,
          typically $25,000 worth of stock (based on the fair market value at the start of each offering period).
        </p>
      </>
    ),
    relatedQuestions: ['what-is-espp', 'how-are-espp-taxed']
  },
  {
    id: 'espp-vs-rsu',
    topic: 'basics',
    difficulty: 'intermediate',
    question: 'What\'s the difference between ESPP and RSU taxation?',
    quickAnswer: 'ESPPs are taxed on the discount at purchase and any capital gains, while RSUs are taxed as ordinary income when they vest.',
    answer: (
      <>
        <p>
          ESPP and RSU taxation differ significantly:
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">ESPP Taxation:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>You pay for shares at a discount</li>
            <li>The discount is taxed as ordinary income</li>
            <li>Additional gains/losses are taxed as capital gains/losses</li>
            <li>Timing of taxation depends on qualifying vs disqualifying disposition</li>
          </ul>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium mb-2">RSU Taxation:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>You receive shares for free</li>
            <li>Full value is taxed as ordinary income at vesting</li>
            <li>Only post-vesting gains/losses are capital gains/losses</li>
            <li>No special holding period requirements</li>
          </ul>
        </div>
      </>
    ),
    relatedQuestions: ['calculator-scope', 'how-are-espp-taxed']
  },
  {
    id: 'wash-sale-rules',
    topic: 'advanced',
    difficulty: 'advanced',
    question: 'How do wash sale rules apply to ESPP shares?',
    quickAnswer: 'Wash sale rules apply when you sell ESPP shares at a loss and acquire substantially identical stock within 30 days before or after the sale.',
    answer: (
      <>
        <p>
          Wash sale rules can affect your ESPP transactions in several ways:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Selling ESPP shares at a loss and purchasing new shares through your ESPP within 30 days can trigger wash sale rules</li>
          <li>Regular payroll deductions that purchase shares within the wash sale period may be affected</li>
          <li>The rules apply across all your accounts, including 401(k) investments in company stock</li>
        </ul>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium mb-2">Important Consideration:</h4>
          <p className="text-sm">
            If you're planning to sell ESPP shares at a loss, consider temporarily suspending new ESPP purchases
            or consulting with a tax advisor to avoid wash sale complications.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['common-mistakes', 'tax-reporting', 'how-are-espp-taxed']
  },
  {
    id: 'espp-risks',
    topic: 'basics',
    difficulty: 'intermediate',
    question: 'What are the risks of participating in an ESPP?',
    quickAnswer: 'Key risks include stock price decline, concentration in company stock, and complex tax implications that could lead to unexpected tax bills.',
    answer: (
      <>
        <p>
          While ESPPs offer valuable benefits, they come with several risks:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Market Risk:</strong> The stock price could fall below your purchase price, resulting in losses despite the discount
          </li>
          <li>
            <strong>Concentration Risk:</strong> Having too much of your wealth tied to your employer's stock
          </li>
          <li>
            <strong>Tax Complexity:</strong> Incorrect tax handling could result in penalties or double taxation
          </li>
          <li>
            <strong>Opportunity Cost:</strong> Money tied up in payroll deductions isn't earning interest or invested elsewhere
          </li>
        </ul>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Risk Management:</h4>
          <p className="text-sm">
            Consider selling some shares soon after purchase to lock in the discount benefit,
            and diversifying your investments across different assets and companies.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['what-is-espp', 'how-are-espp-taxed', 'common-mistakes']
  },
  {
    id: 'calculator-scope',
    topic: 'basics',
    difficulty: 'basic',
    question: 'Can I use this calculator for RSUs or stock options?',
    quickAnswer: 'No, this calculator is specifically for ESPPs under Section 423. RSUs and stock options have different tax rules.',
    answer: (
      <>
        <p>
          No, this calculator is specifically designed for Employee Stock Purchase Plans (ESPPs) under Section 423 
          of the Internal Revenue Code. Restricted Stock Units (RSUs), Incentive Stock Options (ISOs), and Non-qualified 
          Stock Options (NSOs) have different tax rules and would require separate calculation methods.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium mb-2">Important Note:</h4>
          <p className="text-sm">
            While some tax principles may be similar, each type of equity compensation has unique rules and requirements.
            Always consult with a tax professional for guidance on other types of equity compensation.
          </p>
        </div>
      </>
    ),
    relatedQuestions: ['what-is-espp', 'how-are-espp-taxed']
  },
];

const FAQ: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

  const topics = {
    all: 'All Topics',
    basics: 'ESPP Basics',
    taxation: 'Tax Treatment',
    reporting: 'Tax Reporting',
    advanced: 'Advanced Topics'
  };

  const filteredFAQs = selectedTopic === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.topic === selectedTopic);

  const handleFeedback = (id: string, helpful: boolean) => {
    setFeedbackGiven(prev => ({ ...prev, [id]: helpful }));
    // Here you could also send the feedback to an analytics service
  };

  const copyQuestionLink = (id: string) => {
    const url = `${window.location.origin}/faq#${id}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  return (
    <>
      <Helmet>
        <title>ESPP Tax Calculator FAQ - Common Questions About Employee Stock Purchase Plans</title>
        <meta name="description" content="Find answers to common questions about ESPP taxation, qualifying dispositions, cost basis calculations, and tax reporting requirements." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.quickAnswer
              }
            }))
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://esppcalculator.org"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "FAQ",
                "item": "https://esppcalculator.org/faq"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="w-full px-4 py-8">
        {/* Center container for all content */}
        <div className="max-w-[1400px] mx-auto">
          {/* Top ad placement */}
          <div className="mb-8 max-w-[728px] mx-auto">
            <AdUnit slot="faq-top" />
          </div>

          {/* Main content container */}
          <div className="relative max-w-[1200px] mx-auto">
            {/* Left sidebar ad */}
            <div className="hidden lg:block absolute right-full mr-8 w-full max-w-[336px] min-w-[300px] space-y-4">
              <div className="sticky top-4">
                <AdUnit slot="faq-sidebar-left-top" />
              </div>
              <div className="sticky top-[336px]">
                <AdUnit slot="faq-sidebar-left-bottom" />
              </div>
            </div>

            {/* Right sidebar ad */}
            <div className="hidden lg:block absolute left-full ml-8 w-full max-w-[336px] min-w-[300px] space-y-4">
              <div className="sticky top-4">
                <AdUnit slot="faq-sidebar-right-top" />
              </div>
              <div className="sticky top-[336px]">
                <AdUnit slot="faq-sidebar-right-bottom" />
              </div>
            </div>

              <div className="neu-element p-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold mb-4">Frequently Asked Questions</h1>
                  <p className="text-gray-600">
                    Find answers to common questions about ESPP taxation, calculations, and reporting requirements.
                  </p>
                </div>

                <AdUnit slot="faq-top" />

                {/* Topic Navigation */}
                <nav className="mb-8" aria-label="FAQ Topics">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(topics).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTopic(key)}
                        className={`px-4 py-2 rounded-full text-sm ${
                          selectedTopic === key
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-current={selectedTopic === key ? 'page' : undefined}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </nav>

                {/* Table of Contents */}
                <nav className="mb-8" aria-label="Table of Contents">
                  <h2 className="text-lg font-medium mb-3">Quick Navigation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[...filteredFAQs]
                      .sort((a, b) => a.question.length - b.question.length)
                      .map(faq => (
                      <a
                        key={faq.id}
                        href={`#${faq.id}`}
                        className="block py-2 px-3 bg-gray-50 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded shadow-sm hover:shadow transition-all duration-200 text-sm"
                      >
                        {faq.question}
                      </a>
                    ))}
                  </div>
                </nav>

                {/* FAQ Content */}
                <div className="space-y-8">
                  {filteredFAQs.map((faq, index) => (
                    <div
                      key={faq.id}
                      id={faq.id}
                      className="faq-item scroll-mt-16 border-b border-gray-200 pb-8 last:border-b-0 last:pb-0"
                    >
                      {/* Question */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h2 className="text-xl font-medium">{faq.question}</h2>
                        <button
                          onClick={() => copyQuestionLink(faq.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Copy link to question"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                            {/* Answer */}
                      <div className="text-gray-600">
                        {faq.answer}
                      </div>

                      {/* Key Takeaways */}
                      {faq.keyTakeaways && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium mb-2">Key Takeaways:</h3>
                          <ul className="list-disc pl-4 space-y-1">
                            {faq.keyTakeaways.map((takeaway, i) => (
                              <li key={i}>{takeaway}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Related Questions */}
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">Related Questions:</h3>
                        <ul className="space-y-1">
                          {faq.relatedQuestions.map(relatedId => {
                            const related = faqData.find(f => f.id === relatedId);
                            return related ? (
                              <li key={relatedId}>
                                <a
                                  href={`#${relatedId}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {related.question}
                                </a>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>

                      {/* Feedback Section */}
                      <div className="mt-6">
                        {!feedbackGiven[faq.id] ? (
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Was this helpful?</span>
                            <button
                              onClick={() => handleFeedback(faq.id, true)}
                              className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleFeedback(faq.id, false)}
                              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Thank you for your feedback!
                          </p>
                        )}
                      </div>

                      {/* Insert ads at strategic positions */}
                      {(index + 1) % 3 === 0 && <AdUnit slot={`faq-content-${index}`} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Ad */}
              <div className="mt-8">
                <AdUnit slot="faq-bottom" />
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default FAQ;
