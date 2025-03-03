import { useFhevmReady } from './fhevmReady';

export const useEvmConnectionReady = () => {
  const fhevmReady = useFhevmReady();
  return fhevmReady;
};
