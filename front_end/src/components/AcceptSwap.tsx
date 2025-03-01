"use client";
import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";

const AcceptSwap: React.FC = () => {
  const { account } = useWallet();
  const [orderId, setOrderId] = useState("");
  
  const handleAcceptSwap = () => {
    if (!account) {
      alert("Veuillez vous connecter avec MetaMask.");
      return;
    }
    console.log("Swap accepté avec l'ID :", orderId);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Accept RFQ OTC</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">ID OTC</label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button onClick={handleAcceptSwap} className="w-full bg-green-500 text-white px-4 py-2 rounded-md mt-4">
        Accept RFQ
      </button>
    </div>
  );
};

export default AcceptSwap;
