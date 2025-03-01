"use client";
import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useFHEVM } from "@/context/FHEVMContext";

const Swap: React.FC = () => {
  const { account } = useWallet();
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");




  const { isInitialized } = useFHEVM();

  if (!isInitialized) {
    return <p>Chargement de FHEVM...</p>;
  }

  const handleCreateRequest = () => {
    if (!account) {
      alert("Veuillez vous connecter avec MetaMask.");
      return;
    }
    if (!tokenA || !tokenB || !quantity || !price) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    console.log("Nouvelle demande OTC :", { tokenA, tokenB, quantity, price });

    // Ici, on pourra envoyer la demande vers un smart contract ou une API backend
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create RFQ OTC</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Token to sell</label>
        <input
          type="text"
          value={tokenA}
          onChange={(e) => setTokenA(e.target.value)}
          placeholder="Ex: ETH"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Token to receive</label>
        <input
          type="text"
          value={tokenB}
          onChange={(e) => setTokenB(e.target.value)}
          placeholder="Ex: USDT"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Quantity token to sell</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ex: 1.5"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Quantity token to receive</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ex: 3000 (pour USDT)"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <button 
        onClick={handleCreateRequest} 
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
      >
        Submit RFQ OTC
      </button>
    </div>
  );
};

export default Swap;
