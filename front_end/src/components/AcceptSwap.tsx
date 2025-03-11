'use client';
import React, { useState } from 'react';
import OTC_ABI from '../abi/SimpleOTC.json';
import TOKEN from '../abi/Token.json';
import { useFhevmInstance } from '@/hooks/fhevmSetup';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

const AcceptSwap: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const { chain, address } = useAccount();

  const { writeContract, data: mintHash } = useWriteContract();

  const { isLoading: isWaitingForTxA } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const { isLoading: isWaitingForTxB } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const handleAcceptSwap = async () => {
    if (!orderId) {
      console.log('Order ID is required');
      return;
    }

    try {
      /*const inputsApprove = await fhevmInstance
        .createEncryptedInput(
          '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68',
          address
        )
        .add64(Number(price))
        .encrypt();*/
    } catch (error) {
      console.error('Error calling getQuantityOTC:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Accept RFQ OTC</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          ID OTC
        </label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button
        onClick={handleAcceptSwap}
        className="w-full bg-green-500 text-white px-4 py-2 rounded-md mt-4"
      >
        Accept RFQ
      </button>
    </div>
  );
};

export default AcceptSwap;
