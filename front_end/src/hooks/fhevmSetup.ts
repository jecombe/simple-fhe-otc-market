/* eslint-disable @typescript-eslint/no-explicit-any */
import { createInstance, initFhevm } from 'fhevmjs/bundle';
import { useQuery } from '@tanstack/react-query';

// Constantes des contrats et URL
export const TFHE_EXECUTOR_CONTRACT =
  '0x687408ab54661ba0b4aef3a44156c616c6955e07';
export const ACL_CONTRACT = '0xfee8407e2f5e3ee68ad77cae98c434e637f516e5';
export const PAYMENT_CONTRACT = '0xfb03be574d14c256d56f09a198b586bdfc0a9de2';
export const KMS_VERIFIER_CONTRACT =
  '0x9d6891a6240d6130c54ae243d8005063d05fe14b';
export const GATEWAY_CONTRACT = '0x33347831500f1e73f0cccbb95c9f86b94d7b1123';
export const PUBLIC_KEY_ID = '0301c5dd3e2702992b7c12930b7d4defeaaa52cf';
export const GATEWAY_URL = 'https://gateway.sepolia.zama.ai/';

// Initialiser FHEVM uniquement côté client
let fhevmPromise: Promise<any> | null = null;
if (typeof window !== 'undefined') {
  fhevmPromise = initFhevm(); // Assurer que cela ne s'exécute que dans un environnement client
}

// Hook pour suivre le statut d'initialisation
export const useFhevmInitialization = () => {
  return useQuery({
    queryKey: ['fhevm-init'],
    queryFn: () => fhevmPromise,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// Hook pour obtenir l'instance FHEVM pour un réseau spécifique
export const useFhevmInstance = (networkUrl: string) => {
  return useQuery({
    queryKey: ['fhevm', networkUrl],
    queryFn: async () => {
      if (!fhevmPromise) {
        throw new Error('FHEVM is not initialized');
      }

      await fhevmPromise; // Attendre l'initialisation de FHEVM

      if (typeof window === 'undefined' || !window.ethereum) {
        console.error('No Ethereum provider found');
        throw new Error('No Ethereum provider found');
      }

      return await createInstance({
        kmsContractAddress: KMS_VERIFIER_CONTRACT,
        aclContractAddress: ACL_CONTRACT,
        networkUrl,
        gatewayUrl: GATEWAY_URL,
        publicKeyId: PUBLIC_KEY_ID,
      });
    },
  });
};
