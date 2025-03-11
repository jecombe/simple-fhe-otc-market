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
  CircularProgress,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useFhevmInstance } from '@/hooks/fhevmSetup';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from 'wagmi';
import OTC_ABI from '../abi/SimpleOTC.json';
import TOKEN from '../abi/Token.json';
import { bytesToHex } from 'viem';

const Swap: React.FC = () => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [otcIds, setOtcIds] = useState<number[]>([]);
  const [loadingIds, setLoadingIds] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const { chain, address } = useAccount();
  const { data: fhevmInstance } = useFhevmInstance(
    chain?.rpcUrls.default.http[0] as string
  );
  const { data: walletClient } = useWalletClient();

  const OTC_ADDR = '0x62B9E5070bC74794c915cf1aC96167D3708e7d17';

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
    useWaitForTransactionReceipt({ hash: bidHash });

  const { data, isLoading } = useReadContract({
    address: OTC_ADDR,
    abi: OTC_ABI,
    functionName: 'getID',
    args: [],
    account: walletClient?.account,
  });

  const handleGetIds = async () => {
    setLoadingIds(true);
    try {
      console.log(data);
      const { publicKey, privateKey } = fhevmInstance?.generateKeypair();
      const eip712 = fhevmInstance?.createEIP712(publicKey, OTC_ADDR);
      const params = [address, JSON.stringify(eip712)];
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params,
      });

      const myIDS = await fhevmInstance.reencrypt(
        data[data.length - 1],
        privateKey,
        publicKey,
        signature,
        OTC_ADDR,
        address
      );
      console.log('RESULT', myIDS.toString());

      setOtcIds([myIDS.toString()]);
    } catch (error) {
      console.log('Erreur lors de la récupération des OTCs:', error);
    }
    setLoadingIds(false);
  };

  const handleCreateRequest = async () => {
    setLoadingRequest(true);
    try {
      if (!fhevmInstance) return;

      const inputs = await fhevmInstance
        .createEncryptedInput(OTC_ADDR, address)
        .add64(Number(quantity))
        .add64(Number(price))
        .encrypt();

      swapRFQ({
        address: OTC_ADDR,
        abi: OTC_ABI,
        functionName: 'createRFQ',
        args: [
          '0x3f03CE1164071722328c14d46a53092aebc8a8B0',
          '0x8E395706B44c4dcc6A2ed88C9b3eA85A79ef8a68',
          bytesToHex(inputs.handles[0]),
          bytesToHex(inputs.handles[1]),
          bytesToHex(inputs.inputProof),
        ],
      });

      console.log('New RFQ OTC :', { tokenA, tokenB, quantity, price });
    } catch (error) {
      console.log(error);
    }
    setLoadingRequest(false);
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

      <div className="flex justify-center mb-6">
        <IconButton onClick={handleSwapTokens} color="primary">
          <SwapVertIcon />
        </IconButton>
      </div>

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

      <Button
        onClick={handleCreateRequest}
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loadingRequest}
      >
        {loadingRequest ? <CircularProgress size={24} /> : 'Submit OTC Request'}
      </Button>

      <Button
        onClick={handleGetIds}
        fullWidth
        variant="outlined"
        color="secondary"
        size="large"
        className="mt-4"
        disabled={loadingIds}
      >
        {loadingIds ? <CircularProgress size={24} /> : 'Get My OTC IDs'}
      </Button>

      <div className="mt-4">
        <h3>My OTC IDs</h3>
        <ul>
          {otcIds.length > 0 ? (
            otcIds.map((id) => <li key={id}>ID: {id}</li>)
          ) : (
            <li>No OTC IDs found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Swap;
