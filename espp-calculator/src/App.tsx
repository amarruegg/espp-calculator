import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Calculator from './components/Calculator';
import FAQ from './components/FAQ';

// Layout components
const Header = () => {
  return (
    <header className="py-4 border-b border-gray-200">
      <div className="container-custom flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
          ESPP Calculator
        </Link>
        
        <div className="flex items-center">
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/calculator" className="text-gray-700 hover:text-blue-600">
                  Calculator
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-700 hover:text-blue-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
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
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-600 hover:text-blue-600">
                  Calculator
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-blue-600">
                  FAQ
                </Link>
              </li>
            </ul>
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

// Home page component with call-to-action
const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/calculator');
  };

  return (
    <main className="flex-grow py-8">
      <div className="container-custom">
        <section className="neu-element p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">ESPP Tax Calculator</h1>
          <p className="mb-6 text-lg">
            Calculate your adjusted cost basis for Employee Stock Purchase Plan (ESPP) 
            purchases to avoid double taxation on your earnings.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
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
          <button onClick={handleGetStarted} className="btn btn-primary">
            Get Started
          </button>
        </section>

        <section className="neu-element p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Enter your ESPP purchase information (dates, prices, discount)</li>
            <li>Add your sale information and income tax bracket</li>
            <li>Get detailed breakdown of ordinary income and capital gains</li>
            <li>Save or print your calculation for tax filing purposes</li>
          </ol>
        </section>
        
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

function App() {
  // Initialize dark mode based on user preference
  useEffect(() => {
    // Set meta tags for SEO
    document.title = "ESPP Calculator - Calculate Your ESPP Tax Liability";
    
    // Create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 
      'Free calculator for determining your ESPP tax liability. Avoid double taxation by correctly calculating ordinary income and capital gains on your Employee Stock Purchase Plan shares.');
    
    // Create schema markup for calculator
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ESPP Tax Calculator",
      "applicationCategory": "FinanceApplication",
      "description": "Calculate tax liability on Employee Stock Purchase Plan (ESPP) shares",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    });
    document.head.appendChild(schemaScript);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
