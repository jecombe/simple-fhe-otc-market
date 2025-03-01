'use client';
import React from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';

const MintTokens: React.FC = () => {
  // Utiliser le context pour accéder au signer et à l'adresse

  const { account, signer } = useWallet();

  // Fonction pour mint Token A
  const mintTokenA = async () => {
    if (!signer) {
      alert('connect metamask.');
      return;
    }
    const tokenAAddress = '0x3f03CE1164071722328c14d46a53092aebc8a8B0'; // Remplace avec l'adresse de ton contrat Token A
    const abi = ['function mint(address to, uint64 amount) public'];
    const tokenAContract = new ethers.Contract(tokenAAddress, abi, signer);

    try {
      const tx = await tokenAContract.mint(
        account,
        ethers.parseUnits('100', 6)
      );
      await tx.wait();
      alert('Minted 100 Token A!');
    } catch (err) {
      console.error('Error minting Token A:', err);
    }
  };

  // Fonction pour mint Token B
  const mintTokenB = async () => {
    if (!signer) {
      alert('You need to connect your wallet first.');
      return;
    }

    const tokenBAddress = '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68'; // Remplace avec l'adresse de ton contrat Token B
    const abi = [
      // Ajoute l'ABI du contrat ERC-20 avec la fonction mint
      'function mint(address to, uint64 amount) public',
    ];
    const tokenBContract = new ethers.Contract(tokenBAddress, abi, signer);

    try {
      const tx = await tokenBContract.mint(
        await signer.getAddress(),
        ethers.parseUnits('100', 6)
      );
      await tx.wait();
      alert('Minted 100 Token B!');
    } catch (err) {
      console.error('Error minting Token B:', err);
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
            >
              Mint 100 Token A
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
            >
              Mint 100 Token B
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintTokens;
