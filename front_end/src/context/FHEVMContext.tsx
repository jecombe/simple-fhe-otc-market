"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { init } from "@/fhevmjs"; // Assure-toi que le chemin est correct

// Interface du contexte
interface FHEVMContextType {
  isInitialized: boolean;
}

// Création du contexte
const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useFHEVM = () => {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error("useFHEVM doit être utilisé dans un FHEVMProvider");
  }
  return context;
};

// Provider qui englobe l'application
export const FHEVMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Évite une double initialisation à cause de HMR (Hot Module Replacement)
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
