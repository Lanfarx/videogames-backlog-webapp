import React from 'react';
import AuthHeader from './AuthHeader';
import Footer from '../layout/Footer';

function isWidePage(child: React.ReactNode) {
  if (!React.isValidElement(child)) return false;
  const type = child.type as any;
  return (
    type?.displayName === 'PrivacyPage' ||
    type?.displayName === 'ContactPage' ||
    type?.displayName === 'TermsPage' ||
    type?.name === 'TermsPage' ||
    type?.name === 'PrivacyPage' ||
    type?.name === 'ContactPage'
  );
}

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col justify-between bg-gray-50">
    <AuthHeader />
    <main className="flex-1 w-full flex flex-col items-center justify-center p-12">
      {isWidePage(children) ? (
        <div className="w-full max-w-4xl px-4 py-12">
          <div className="mb-8">
            <a
              href="/login"
              className="inline-block text-accent-primary font-medium text-base hover:underline transition-colors"
            >
              &larr; Torna al login
            </a>
          </div>
          {children}
        </div>
      ) : (
        <div className="w-full max-w-md bg-white border border-gray-300 rounded-xl shadow-lg p-12 mx-2">
          {children}
        </div>
      )}
    </main>
    <Footer />
  </div>
);

export default AuthLayout;
