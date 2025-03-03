'use client';
import React, { useState } from 'react';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useFhevmInstance } from '@/hooks/fhevmSetup';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { ethers } from 'ethers';
import OTC_ABI from '../abi/SimpleOTC.json';
import TOKEN from '../abi/Token.json';

import { bytesToHex } from 'viem';

const Swap: React.FC = () => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const { chain, address } = useAccount();

  const { data: fhevmInstance } = useFhevmInstance(
    chain?.rpcUrls.default.http[0] as string
  );
  const OTC_ADDR = '0x83Db0145D35ac108cE60107c1FAbb58f3dE6648A';

  const tokenList = [
    { name: 'Token A', address: '0x3f03CE1164071722328c14d46a53092aebc8a8B0' },
    { name: 'Token B', address: '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68' },
  ];

  const {
    writeContract: swapRFQ,
    data: bidHash,
    isPending: isBidding,
  } = useWriteContract();

  const { isLoading: isWaitingForBid, isSuccess: bidSuccess } =
    useWaitForTransactionReceipt({
      hash: bidHash,
    });

  const handleCreateRequest = async () => {
    try {
      console.log(fhevmInstance);
      if (!fhevmInstance) return;

      // const inputs = await fhevmInstance
      //   .createEncryptedInput(OTC_ADDR, address)
      //   .add64(Number(quantity))
      //   .add64(Number(price))
      //   .encrypt();

      const inputsApprove = await fhevmInstance
        .createEncryptedInput(
          '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68',
          address
        )
        .add64(Number(price))
        .encrypt();

      swapRFQ({
        address: '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68', // Replace with your contract address
        abi: TOKEN,
        functionName: 'approve',
        args: [
          OTC_ADDR,
          bytesToHex(inputsApprove.handles[0]),
          bytesToHex(inputsApprove.inputProof),
        ], // Amount and recipient
      });

      const inputs = await fhevmInstance
        .createEncryptedInput(OTC_ADDR, address)
        .add64(Number(quantity))
        .add64(Number(price))
        .encrypt();

      swapRFQ({
        address: OTC_ADDR, // Replace with your contract address
        abi: OTC_ABI,
        functionName: 'createRFQ',
        args: [
          '0x3f03CE1164071722328c14d46a53092aebc8a8B0',
          '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68',
          bytesToHex(inputs.handles[0]),
          bytesToHex(inputs.handles[1]),
          bytesToHex(inputs.inputProof),
        ], // Amount and recipient
      });

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

      console.log('New RFQ OTC :', { tokenA, tokenB, quantity, price });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwapTokens = async () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Create Request For Quest OTC
      </h2>

      {/* Formulaire Token A */}
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gap={2}
        className="mb-6"
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel>Token to Sell</InputLabel>
          <Select
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            label="Token to Sell"
          >
            {tokenList.map((token) => (
              <MenuItem key={token.address} value={token.address}>
                {token.name} ({token.address})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">Qty</InputAdornment>
            ),
          }}
          placeholder="Ex: 1.5"
        />
      </Box>

      {/* Bouton Swap */}
      <div className="flex justify-center mb-6">
        <IconButton onClick={handleSwapTokens} color="primary">
          <SwapVertIcon />
        </IconButton>
      </div>

      {/* Formulaire Token B */}
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gap={2}
        className="mb-6"
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel>Token to Receive</InputLabel>
          <Select
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            label="Token to Receive"
          >
            {tokenList.map((token) => (
              <MenuItem key={token.address} value={token.address}>
                {token.name} ({token.address})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Quantity"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">Qty</InputAdornment>
            ),
          }}
          placeholder="Ex: 30"
        />
      </Box>

      {/* Bouton Submit */}
      <Button
        onClick={handleCreateRequest}
        fullWidth
        variant="contained"
        color="primary"
        size="large"
      >
        Submit OTC Request
      </Button>
    </div>
  );
};

export default Swap;
