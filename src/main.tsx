import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/Utility/ErrorBoundary';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('Environment check:', {
  PUBLISHABLE_KEY: PUBLISHABLE_KEY ? 'Present' : 'Missing',
  PUBLISHABLE_KEY_VALUE: PUBLISHABLE_KEY ? PUBLISHABLE_KEY.substring(0, 20) + '...' : 'None',
  NODE_ENV: import.meta.env.MODE
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {PUBLISHABLE_KEY ? (
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY} 
          afterSignOutUrl="/"
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#2563eb'
            }
          }}
        >
          <App />
        </ClerkProvider>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
            <p className="text-gray-700 mb-4">
              Missing Clerk Publishable Key. Please add your key to .env.local:
            </p>
            <code className="bg-gray-100 p-2 rounded text-sm block">
              VITE_CLERK_PUBLISHABLE_KEY=your_key_here
            </code>
            <p className="text-sm text-gray-500 mt-4">
              Get your key from <a href="https://dashboard.clerk.com" className="text-blue-600 underline">Clerk Dashboard</a>
            </p>
          </div>
        </div>
      )}
    </ErrorBoundary>
  </StrictMode>
);