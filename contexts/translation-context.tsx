'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  translate: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  translate: (key) => key,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
  }, []);

  const translate = useCallback((key: string) => {
    // TODO: Implement actual translation logic
    return key;
  }, []);

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);
