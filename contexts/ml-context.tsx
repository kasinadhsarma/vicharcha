'use client';

import React, { createContext, useContext, useState } from 'react';

interface MLContextType {
  isProcessing: boolean;
  setProcessing: (status: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const MLContext = createContext<MLContextType>({
  isProcessing: false,
  setProcessing: () => {},
  error: null,
  setError: () => {},
});

export function MLProvider({ children }: { children: React.ReactNode }) {
  const [isProcessing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <MLContext.Provider
      value={{
        isProcessing,
        setProcessing,
        error,
        setError,
      }}
    >
      {children}
    </MLContext.Provider>
  );
}

export const useML = () => useContext(MLContext);
