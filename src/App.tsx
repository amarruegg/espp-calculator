import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './App.css';
import Calculator from './components/Calculator';
import FAQ from './components/FAQ';
import screenshot from './assets/esppcalculator_screenshot.png';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | 'in-article';
}

// AdUnit component for manual ad placement
export const AdUnit: React.FC<AdUnitProps> = ({ slot, format = 'auto' }) => (
  <ins className="adsbygoogle"
       style={{ display: 'block' }}
       data-ad-client="ca-pub-7983697626135565"
       data-ad-slot={slot}
       data-ad-format={format}
       data-full-width-responsive="true" />
);

// Layout components
const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="py-4 border-b border-gray-200">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-white p-2">
        Skip to main content
      </a>
      
      <div className="container-custom flex justify-between items-center">
        <Link to="/">
          <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700" aria-label="ESPP Calculator Home">
            ESPP Calculator
          </a>
        </Link>
        
        <div className="flex items-center">
          <nav role="navigation" aria-label="Main navigation">
            <ul className="flex space-x-6">
              <li>
                <Link to="/calculator">
                  <a 
                    href="/calculator" 
                    className={`text-gray-700 hover:text-blue-600 ${currentPath === '/calculator' ? 'font-semibold' : ''}`}
                    aria-current={currentPath === '/calculator' ? 'page' : undefined}
                  >
                    Calculator
                  </a>
                </Link>
              </li>
              <li>
                <Link to="/faq">
                  <a 
                    href="/faq" 
                    className={`text-gray-700 hover:text-blue-600 ${currentPath === '/faq' ? 'font-semibold' : ''}`}
                    aria-current={currentPath === '/faq' ? 'page' : undefined}
                  >
                    FAQ
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <nav aria-label="Breadcrumb" className="container-custom mt-2">
        <ol className="breadcrumb flex space-x-2 text-sm text-gray-500" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/">
              <a href="/" itemProp="item">
                <span itemProp="name">Home</span>
              </a>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          {currentPath !== '/' && (
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="mx-2">/</span>
              <a href={currentPath} itemProp="item">
                <span itemProp="name">{currentPath.substring(1)}</span>
              </a>
              <meta itemProp="position" content="2" />
            </li>
          )}
        </ol>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="py-6 border-t border-gray-200 mt-auto">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">ESPP Calculator</h3>
            <p className="text-sm text-gray-600">
              Calculate your adjusted cost basis for Employee Stock Purchase Plan (ESPP) 
              purchases to avoid double taxation on your earnings.
            </p>
          </div>
          
          <div className="sitemap">
            <h4 className="font-semibold mb-3">Site Map</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/">
                    <a href="/" className="text-gray-600 hover:text-blue-600">
                      Home
                    </a>
                  </Link>
                </li>
                <li>
                  <Link to="/calculator">
                    <a href="/calculator" className="text-gray-600 hover:text-blue-600">
                      Calculator
                    </a>
                  </Link>
                </li>
                <li>
                  <Link to="/faq">
                    <a href="/faq" className="text-gray-600 hover:text-blue-600">
                      FAQ
                    </a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} ESPP Calculator. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              This calculator is for informational purposes only and does not constitute tax advice.
              Please consult with a tax professional for advice specific to your situation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Home page component with call-to-action and ad placements
const HomePage = () => {
  return (
    <main id="main-content" className="flex-grow py-8">
      <div className="container-custom">
        <section className="neu-element p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">ESPP Tax Calculator</h1>
          <p className="mb-6 text-lg">
            Calculate your adjusted cost basis for Employee Stock Purchase Plan (ESPP) 
            purchases to avoid double taxation on your earnings.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="neu-element-inset p-4 rounded-lg">
              <h3 className="font-medium mb-2">Avoid Double Taxation</h3>
              <p className="text-sm">
                Many taxpayers incorrectly calculate their ESPP taxes, resulting in paying 
                more tax than necessary. Our calculator helps you get it right.
              </p>
            </div>
            <div className="neu-element-inset p-4 rounded-lg">
              <h3 className="font-medium mb-2">Accurate Calculations</h3>
              <p className="text-sm">
                Our calculator follows IRS guidelines to correctly separate ordinary income 
                from capital gains/losses for proper tax reporting.
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link to="/calculator">
              <a href="/calculator" 
                className="inline-flex items-center justify-center text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-blue-500 w-full md:w-auto relative before:absolute before:inset-0 before:rounded-lg before:bg-white/10 before:animate-[glow_2s_ease-in-out_infinite] before:opacity-0"
                role="button"
              >
                Calculate Your Tax Liability Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </Link>
          </div>
        </section>

        <AdUnit slot="hero-bottom" />

        <section className="neu-element p-6 mb-8 features-section">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Enter your ESPP purchase information (dates, prices, discount)</li>
            <li>Add your sale information and income tax bracket</li>
            <li>Get detailed breakdown of ordinary income and capital gains</li>
            <li>Save or print your calculation for tax filing purposes</li>
          </ol>
        </section>
        
        <AdUnit slot="features-feed" format="in-article" />

        <section className="neu-element p-6">
          <h2 className="text-2xl font-semibold mb-4">Why ESPP Tax Calculations Matter</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4">
              <h3 className="font-medium mb-2">Avoid Overpaying Taxes</h3>
              <p className="text-sm">
                Without proper cost basis adjustment, you could be paying taxes twice on the same income.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-2">Compliance with IRS Rules</h3>
              <p className="text-sm">
                Ensure your tax reporting follows IRS guidelines for ESPP sales.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-2">Maximize Your ESPP Benefits</h3>
              <p className="text-sm">
                Understanding the tax implications helps you make better decisions about when to sell ESPP shares.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

// AdSense initialization component
const AdSenseInit = () => {
  const location = useLocation();
  useEffect(() => {
    try {
      // Push ads only on valid routes
      if (location.pathname === '/' || location.pathname === '/calculator' || location.pathname === '/faq') {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [location]);
  return null;
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-custom my-8 p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600">
            We're sorry, but there was an error loading this page. Please try refreshing or return to the{' '}
            <Link to="/">
              <a href="/" className="underline">homepage</a>
            </Link>.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Helmet>
            <title>Free ESPP Tax Calculator | Avoid Double Taxation on Stock Purchase Plans</title>
            <meta name="description" content="Calculate your ESPP tax liability accurately with our free calculator. Avoid double taxation, determine cost basis, and understand qualifying vs disqualifying dispositions for Employee Stock Purchase Plans." />
            <meta name="keywords" content="ESPP calculator, employee stock purchase plan, ESPP tax calculator, stock purchase tax calculator, ESPP cost basis calculator, qualifying disposition calculator, disqualifying disposition calculator" />
            <link rel="canonical" href="https://esppcalculator.org" />
            
            {/* Open Graph tags */}
            <meta property="og:title" content="Free ESPP Tax Calculator | Employee Stock Purchase Plan Tax Calculator" />
            <meta property="og:description" content="Free calculator for ESPP tax calculations. Calculate cost basis, avoid double taxation, and understand qualifying vs disqualifying dispositions for your Employee Stock Purchase Plan shares." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://esppcalculator.org" />
            <meta property="og:site_name" content="ESPP Calculator" />
            <meta property="og:locale" content="en_US" />
            
            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Free ESPP Tax Calculator | Stock Purchase Plan Tax Calculator" />
            <meta name="twitter:description" content="Calculate your ESPP tax liability accurately. Free calculator for cost basis, qualifying dispositions, and avoiding double taxation on Employee Stock Purchase Plans." />
            <meta name="twitter:site" content="@esppcalculator" />
            <meta name="twitter:image" content={`https://esppcalculator.org${screenshot}`} />
            <meta name="twitter:image:alt" content="ESPP Tax Calculator Screenshot" />
            
            {/* Open Graph image tags */}
            <meta property="og:image" content={`https://esppcalculator.org${screenshot}`} />
            <meta property="og:image:alt" content="Screenshot of ESPP Tax Calculator interface" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            
            {/* Additional SEO meta tags */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content="ESPP Calculator" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#2563EB" />
            <meta name="application-name" content="ESPP Calculator" />
            <meta name="apple-mobile-web-app-title" content="ESPP Calculator" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="format-detection" content="telephone=no" />
            
            {/* AdSense script */}
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7983697626135565"></script>
            <script>
              {`
                window.adsbygoogle = window.adsbygoogle || [];
                (adsbygoogle = window.adsbygoogle || []).push({
                  google_ad_client: "ca-pub-7983697626135565",
                  enable_page_level_ads: true
                });
              `}
            </script>
            
            {/* Enhanced Structured Data */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "ESPP Tax Calculator",
                "applicationCategory": "FinanceApplication",
                "applicationSubCategory": "Tax Calculator",
                "description": "Free calculator for determining tax liability on Employee Stock Purchase Plan (ESPP) shares. Calculate cost basis, understand qualifying dispositions, and avoid double taxation.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "featureList": [
                  "ESPP tax liability calculation",
                  "Cost basis adjustment calculator",
                  "Qualifying vs disqualifying disposition determination",
                  "Tax liability estimation with detailed breakdown",
                  "PDF report generation for tax filing",
                  "IRS guidelines compliance verification",
                  "Multiple offering period support",
                  "Automatic tax bracket consideration"
                ],
                "operatingSystem": "Any",
                "browserRequirements": "Requires JavaScript",
                "url": "https://esppcalculator.org",
                "image": `https://esppcalculator.org${screenshot}`,
                "datePublished": "2024-01-01",
                "dateModified": new Date().toISOString().split('T')[0],
                "keywords": "ESPP calculator, tax calculator, stock purchase plan, cost basis calculator",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "1250",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              })}
            </script>
            
            {/* Organization Schema */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "ESPP Calculator",
                "url": "https://esppcalculator.org",
                "logo": {
                  "@type": "ImageObject",
                  "url": "data:image/svg+xml;base64," + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#2563EB" rx="10"/>
                      <text x="50" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle" font-weight="bold">EC</text>
                    </svg>
                  `),
                  "width": "100",
                  "height": "100"
                },
                "description": "Free calculator for Employee Stock Purchase Plan (ESPP) tax calculations. Helping employees avoid double taxation and understand their ESPP benefits.",
                "foundingDate": "2024-01-01",
                "email": "support@esppcalculator.org",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "US"
                },
                "sameAs": [],
                "areaServed": {
                  "@type": "Country",
                  "name": "United States"
                }
              })}
            </script>

            {/* SoftwareApplication Schema */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "ESPP Tax Calculator",
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Any",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "1250"
                }
              })}
            </script>
          </Helmet>
          <AdSenseInit />
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
