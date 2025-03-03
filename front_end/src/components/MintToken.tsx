'use client';

import React, { useState } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { ethers } from 'ethers';

const MintTokens: React.FC = () => {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isMintingTokenA, setIsMintingTokenA] = useState(false);
  const [isMintingTokenB, setIsMintingTokenB] = useState(false);

  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint64', name: 'amount', type: 'uint64' },
      ],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const { writeContract, data: mintHash } = useWriteContract();

  const { isLoading: isWaitingForTxA } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const { isLoading: isWaitingForTxB } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const mintTokenA = async () => {
    if (!address) {
      setError('No account connected');
      return;
    }

    try {
      setIsMintingTokenA(true); // Start minting Token A
      await writeContract({
        address: '0x3f03CE1164071722328c14d46a53092aebc8a8B0', // Replace with your contract address
        abi: abi,
        functionName: 'mint',
        args: [address, ethers.parseUnits('100', 6)], // Amount and recipient
      });

      setError(null);
      console.log('Transaction initiated. Waiting for receipt...');
    } catch (err) {
      setError('Failed to mint: ' + (err as Error).message);
      console.error(err);
      setIsMintingTokenA(false);
    }
  };

  const mintTokenB = async () => {
    if (!address) {
      setError('No account connected');
      return;
    }

    try {
      setIsMintingTokenB(true); // Start minting Token B
      await writeContract({
        address: '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68',
        abi: abi,
        functionName: 'mint',
        args: [address, ethers.parseUnits('100', 6)],
      });

      setError(null);
      console.log('Transaction initiated. Waiting for receipt...');
    } catch (err) {
      setError('Failed to mint: ' + (err as Error).message);
      console.error(err);
      setIsMintingTokenB(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl text-white">Mint Tokens</h2>
      <div className="flex flex-col items-center gap-4">
        {/* Token A */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl text-white">Token A</h3>
            <button
              onClick={mintTokenA}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              disabled={isMintingTokenA || isWaitingForTxA} // Disable button during minting or waiting
            >
              {isMintingTokenA || isWaitingForTxA
                ? 'Minting...'
                : 'Mint 100 Token A'}
            </button>
          </div>
        </div>

        {/* Token B */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl text-white">Token B</h3>
            <button
              onClick={mintTokenB}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              disabled={isMintingTokenB || isWaitingForTxB} // Disable button during minting or waiting
            >
              {isMintingTokenB || isWaitingForTxB
                ? 'Minting...'
                : 'Mint 100 Token B'}
            </button>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}{' '}
      {/* Display error message */}
    </div>
  );
};

export default MintTokens;
