'use client';
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar: React.FC = () => {
  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between">
      <h1 className="text-lg font-bold">OTC Market</h1>
      <ConnectButton />
    </nav>
  );
};

export default Navbar;
