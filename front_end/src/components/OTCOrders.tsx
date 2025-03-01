"use client";
import React, { useState, useEffect } from "react";

// Interface pour représenter un ordre OTC
interface OTCOrder {
  id: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  expiration: number;
}

const OTCOrders: React.FC = () => {
  // Simule une liste d'ordres (peut être remplacée par un fetch API plus tard)
  const [orders, setOrders] = useState<OTCOrder[]>([
    { id: "1", tokenA: "ETH", tokenB: "USDT", amountA: "1", amountB: "2500", expiration: 3600 },
    { id: "2", tokenA: "BTC", tokenB: "ETH", amountA: "0.05", amountB: "1.5", expiration: 7200 },
    { id: "3", tokenA: "DAI", tokenB: "USDC", amountA: "1000", amountB: "999", expiration: 1800 },
  ]);

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">RFQ in progress</h2>
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
            {orders.map((order) => (
              <tr key={order.id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{order.tokenA}</td>
                <td className="border border-gray-300 px-4 py-2">{order.tokenB}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {Math.round(order.expiration / 60)} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OTCOrders;
