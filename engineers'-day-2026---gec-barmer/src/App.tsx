import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Activities } from './components/Activities';
import { Coordinators } from './components/Coordinators';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { ArrowUp } from 'lucide-react';

export function App() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  React.useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToActivities = () => {
    const element = document.getElementById('activities');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Main Navigation Bar */}
      <Navbar onRegisterClick={scrollToActivities} />

      <main id="main-content">
        {/* 2. Hero Section */}
        <Hero
          onRegisterClick={scrollToActivities}
          onViewActivitiesClick={scrollToActivities}
        />

        {/* 3. Activities Section with Dedicated Registration on each Activity Card */}
        <Activities />

        {/* 4. Faculty Coordinators & Contact Section */}
        <Coordinators />
      </main>

      {/* 5. Official College Footer */}
      <Footer onOpenAdmin={() => setShowAdminModal(true)} />

      {/* Admin Dashboard Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      {/* Floating Action Button: Back to Top */}
      {showBackToTop && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={scrollToTop}
            className="p-3 rounded-full bg-white text-slate-700 hover:text-blue-700 shadow-lg border border-slate-200 transition-all hover:scale-110 cursor-pointer"
            aria-label="Back to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

