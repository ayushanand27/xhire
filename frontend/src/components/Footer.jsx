import { useState } from 'react';
import { PageContainer } from "./PageShell.jsx";
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import ContactModal from './ContactModal';

export default function Footer() {
  const [modals, setModals] = useState({
    privacy: false,
    terms: false,
    contact: false
  });

  const openModal = (modal) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  return (
    <>
      <footer className="mt-auto border-t border-border/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md">
        <PageContainer className="py-8 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Copyright Section */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
              <p className="text-sm font-medium bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                © {new Date().getFullYear()} xHire. All rights reserved.
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-8">
              <button
                onClick={() => openModal('privacy')}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <span>Privacy</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </button>

              <div className="w-px h-5 bg-border/40"></div>

              <button
                onClick={() => openModal('terms')}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <span>Terms</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>

              <div className="w-px h-5 bg-border/40"></div>

              <button
                onClick={() => openModal('contact')}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <span>Contact</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            </nav>
          </div>

          {/* Decorative Elements */}
          <div className="mt-6 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
            <div>Made with passion for developers</div>
            <div className="flex gap-4">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Status: Active</span>
            </div>
          </div>
        </PageContainer>
      </footer>

      {/* Modals */}
      <PrivacyModal isOpen={modals.privacy} onClose={() => closeModal('privacy')} />
      <TermsModal isOpen={modals.terms} onClose={() => closeModal('terms')} />
      <ContactModal isOpen={modals.contact} onClose={() => closeModal('contact')} />
    </>
  );
}
