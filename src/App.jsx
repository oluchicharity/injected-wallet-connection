import { useState, useEffect } from 'react';
import './App.css';

function useWalletConnection() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const provider = window.ethereum;
        setProvider(provider);
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        provider.on('accountsChanged', (accounts) => {
          setAccount(accounts[0]);
        });

        provider.on('chainChanged', (chainId) => {
          setNetwork(chainId);
        });
      } else {
        console.error('Please install MetaMask!');
      }
    };
    

    connectWallet();
    //setBalance();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && provider) {
        const balance = await provider.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        });
        setBalance(parseFloat(balance) / Math.pow(10, 18)); 
      }
    };

    fetchBalance();
  }, [account, provider]);

  return { account, balance, network };
}

function App() {
  const { account, balance, network } = useWalletConnection();
  const [inputAddress, setInputAddress] = useState('');

  const handleInputChange = (e) => {
    setInputAddress(e.target.value);
  };

  return (
    <>
      <div>
        <h1>Wallet Connection</h1>
        <input
          type="text"
          value={inputAddress}
          onChange={handleInputChange}
          placeholder="Enter address"
        />
        <p>Connected Account: {account}</p>
        <p>Balance: {balance !== null ? `${balance} ETH` : 'Loading...'}</p>
        <p>Network: {network}</p>
      </div>
    </>
  );
}

export default App;
