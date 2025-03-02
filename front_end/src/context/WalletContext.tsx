'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { createFhevmInstance } from '@/fhevmjs';

// Création du contexte
interface WalletContextType {
  account: string | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet doit être utilisé dans un WalletProvider');
  }
  return context;
};

// Provider qui englobe l'application
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await createFhevmInstance();

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          const signer = await provider.getSigner();
          setSigner(signer);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
        const signer = await provider.getSigner();
        setSigner(signer);
        await createFhevmInstance();
      } catch (error) {
        console.error('Erreur de connexion:', error);
      }
    } else {
      alert('Veuillez installer MetaMask.');
    }
  };

  return (
    <WalletContext.Provider value={{ account, signer, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
