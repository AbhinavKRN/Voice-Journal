import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import logo from '../assets/voice-journal-icon.png';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900 dark:shadow-lg dark:border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <RouterLink to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 transition-all group-hover:scale-105 group-hover:shadow-lg">
                <img src={logo} alt="Voice Journal Logo" className="h-12 w-auto drop-shadow-lg rounded" />
              </div>
            </RouterLink>
            <div className="hidden sm:block h-10 w-px bg-gray-300 dark:bg-gray-700 mx-4" />
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <RouterLink
                  to="/journal"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                >
                  New Entry
                </RouterLink>
                <RouterLink
                  to="/history"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                >
                  History
                </RouterLink>
                <RouterLink
                  to="/insights"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                >
                  Insights
                </RouterLink>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95-7.07l-.71.71M6.34 6.34l-.71-.71" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              )}
            </button>
            {user ? (
              <>
                <span className="text-gray-700 mr-4 dark:text-gray-200">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <RouterLink to="/login" className="btn-primary">
                Sign in
              </RouterLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 