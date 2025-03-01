// components/MintTokens.tsx

import React from "react";

const MintTokens: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl text-white">Mint Tokens</h2>
      <div className="flex flex-col items-center gap-4">
        {/* Token A */}
        <div className="flex items-center gap-4">
          {/* <img
            src="/tokenA-image.jpg" // Assurez-vous d'ajouter l'image pour Token A dans le dossier public
            alt="Token A"
            className="w-16 h-16 rounded-full"
          /> */}
          <div className="flex items-center gap-4">
            <h3 className="text-xl text-white">Token A</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Mint 100 Token A
            </button>
          </div>
        </div>

        {/* Token B */}
        <div className="flex items-center gap-4">
          {/* <img
            src="/tokenB-image.jpg" // Assurez-vous d'ajouter l'image pour Token B dans le dossier public
            alt="Token B"
            className="w-16 h-16 rounded-full"
          /> */}
          <div className="flex items-center gap-4">
            <h3 className="text-xl text-white">Token B</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Mint 100 Token B
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintTokens;
