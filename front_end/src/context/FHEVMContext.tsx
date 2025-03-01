'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { init } from '@/fhevmjs';

interface FHEVMContextType {
  isInitialized: boolean;
}

const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

export const useFHEVM = () => {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error('useFHEVM doit être utilisé dans un FHEVMProvider');
  }
  return context;
};

export const FHEVMProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (window.fhevmjsInitialized) return;
    window.fhevmjsInitialized = true;

    init()
      .then(() => setIsInitialized(true))
      .catch((e) => {
        console.error("Erreur d'initialisation de FHEVM:", e);
        setIsInitialized(false);
      });
  }, []);

  return (
    <FHEVMContext.Provider value={{ isInitialized }}>
      {isInitialized ? children : <p>Chargement de FHEVM...</p>}
    </FHEVMContext.Provider>
  );
};
