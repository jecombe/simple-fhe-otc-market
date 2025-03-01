"use client";
import React, { useState } from "react";

interface OTCOrder {
  tokenA: string;
  tokenB: string;
}

const OTCOrders: React.FC = () => {
  const [orders] = useState<OTCOrder[]>([
    { tokenA: "ETH", tokenB: "USDT"},
    { tokenA: "BTC", tokenB: "ETH"},
    { tokenA: "DAI", tokenB: "USDC" },
  ]);

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">RFQ waiting</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600 text-center">Nothing.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Token A</th>
              <th className="border border-gray-300 px-4 py-2">Token B</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{order.tokenA}</td>
                <td className="border border-gray-300 px-4 py-2">{order.tokenB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OTCOrders;
