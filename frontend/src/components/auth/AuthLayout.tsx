import React from 'react';
import AuthHeader from './AuthHeader';
import Footer from '../layout/Footer';
import { useLocation, Outlet } from 'react-router-dom';

const widePages = ['/privacy', '/terms', '/contact'];

const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isWide = widePages.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <AuthHeader />
      <main className="flex-1 w-full flex flex-col items-center justify-center p-12">
        {isWide ? (
          <div className="w-full max-w-4xl px-4 py-12">
            <div className="mb-8">
              <button
                type="button"
                onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/login')}
                className="inline-block text-accent-primary font-medium text-base hover:underline transition-colors"
              >
                &larr; Torna indietro
              </button>
            </div>
            <Outlet />
          </div>
        ) : (
          <div className="w-full max-w-md bg-white border border-gray-300 rounded-xl shadow-lg p-12 mx-2">
            <Outlet />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
