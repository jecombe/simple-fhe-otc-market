"use client";
import React from "react";
import { useWallet } from "@/context/WalletContext";

const Navbar: React.FC = () => {
  const { account, connectWallet } = useWallet();

  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between">
      <h1 className="text-lg font-bold">OTC Market</h1>
      {account ? (
        <p className="text-sm">
          Connecté : {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navbar;
