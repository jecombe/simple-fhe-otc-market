/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});

export function ConnectWalletClient() {
  let transport;
  if (window.ethereum) {
    transport = custom(window.ethereum);
  } else {
    const errorMessage =
      'MetaMask or another web3 wallet is not installed. Please install one to proceed.';
    throw new Error(errorMessage);
  }

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: transport,
  });
  return walletClient;
}

export const getWriteFunction = async (
  abi: any,
  functionName: any,
  args: any,
  account: any
) => {
  return ConnectWalletClient().writeContract({
    abi,
    account,
    functionName,
    address: '0x3f03CE1164071722328c14d46a53092aebc8a8B0',
    args,
  });
};

export function ConnectPublicClient() {
  let transport;
  if (window.ethereum) {
    transport = custom(window.ethereum);
  } else {
    const errorMessage =
      'MetaMask or another web3 wallet is not installed. Please install one to proceed.';
    throw new Error(errorMessage);
  }
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });
  return publicClient;
}

export const waitingTransaction = (hash: any) => {
  return ConnectPublicClient().waitForTransactionReceipt({
    hash,
  });
};
