import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
      gcTime: 1000 * 60 * 15,   // 15 minutes garbage collection threshold
    },
  },
});

export const App: React.FC = () => {
  const { initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#EDE3C9',
            color: '#1A1612',
            border: '2px solid #3D2B1F',
            boxShadow: '4px 4px 0px rgba(26, 22, 18, 0.25)',
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontSize: '13px',
            borderRadius: '4px',
            letterSpacing: '0.02em',
          },
          success: {
            iconTheme: {
              primary: '#2A4B2A',
              secondary: '#EDE3C9',
            },
          },
          error: {
            iconTheme: {
              primary: '#8B1A1A',
              secondary: '#EDE3C9',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};
