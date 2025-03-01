'use client';
import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useFHEVM } from '@/context/FHEVMContext';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { getInstance } from '@/fhevmjs';

const Swap: React.FC = () => {
  const { account } = useWallet();
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const instance = getInstance();

  const OTC_ADDR = '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68';
  const { isInitialized } = useFHEVM();

  if (!isInitialized) {
    return <p>Loading FHEVM...</p>;
  }

  // Liste des tokens pour la sélection
  const tokenList = [
    { name: 'Token A', address: '0xTokenAddressA' },
    { name: 'Token B', address: '0xTokenAddressB' },
    // Ajoute d'autres tokens si nécessaire
  ];

  const handleCreateRequest = async () => {
    if (!account) {
      alert('Connect MetaMask.');
      return;
    }
    if (!tokenA || !tokenB || !quantity || !price) {
      alert('Error fill.');
      return;
    }
    console.log(instance);

    const encryptQtyA = await instance
      .createEncryptedInput(OTC_ADDR, account)
      .add64(BigInt(quantity))
      .encrypt();

    const encryptQtyB = await instance
      .createEncryptedInput(OTC_ADDR, account)
      .add64(BigInt(price))
      .encrypt();

    console.log('New RFQ OTC :', { tokenA, tokenB, quantity, price });
  };

  const handleSwapTokens = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Create Request For Quest OTC
      </h2>

      <Grid container spacing={2} alignItems="center" className="mb-6">
        <Grid item xs={6}>
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
        </Grid>

        <Grid item xs={6}>
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
        </Grid>
      </Grid>

      <div className="flex justify-center mb-6">
        <IconButton onClick={handleSwapTokens} color="primary">
          <SwapVertIcon />
        </IconButton>
      </div>

      <Grid container spacing={2} alignItems="center" className="mb-6">
        <Grid item xs={6}>
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
        </Grid>

        <Grid item xs={6}>
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
        </Grid>
      </Grid>

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
