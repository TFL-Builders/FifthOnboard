import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e2535',
            color: '#e8eaf2',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#3b5bdb', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
