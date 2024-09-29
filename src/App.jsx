import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Ensure to import ethers
import './App.css';

// Helper function to map network chainId to network names
const getNetworkName = (chainId) => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 84531:
      return 'Base';
    default:
      return 'Unknown Network';
  }
};

// Custom hook to handle wallet connection logic
function useWalletConnection() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(null);

  // Effect to connect the wallet when the component is initiated
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const provider = window.ethereum;
        setProvider(provider);

        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);

          const chainId = await provider.request({ method: 'eth_chainId' });
          setNetwork(parseInt(chainId, 16));

          // Handling event for account changes
          const handleAccountsChange = (accounts) => {
            setAccount(accounts.length > 0 ? accounts[0] : null);
          };

          // Handling event for network changes
          const handleChainChange = (chainId) => {
            setNetwork(parseInt(chainId, 16));
          };

          if (window.ethereum) {
          provider.on('accountsChanged', handleAccountsChange);
          provider.on('chainChanged', handleChainChange);
        } else {
        console.error('Ethereum provider not found!');
       }
          // Cleanup function to remove event listeners
          return () => {
            provider.removeListener('accountsChanged', handleAccountsChange);
            provider.removeListener('chainChanged', handleChainChange);
          };
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      } else {
        console.error('Please install a wallet provider!');
      }
    };

    connectWallet();
  }, []);

  return { account, network, provider };
}

function App() {
  const { account, network, provider } = useWalletConnection();
  const [inputAddress, setInputAddress] = useState('');
  const [inputBalance, setInputBalance] = useState(null);

  // Handling changes in the address input field
  const handleInputChange = (e) => {
    setInputAddress(e.target.value);
  };

  // Function to fetch balance of entered address
  const fetchBalance = async (address) => {
    if (provider && address) {
      try {
        const balance = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        return ethers.formatEther(balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
    return null;
  };

  // Handling input address 
  const handleCheckBalance = async () => {
    if (inputAddress) {
      const balance = await fetchBalance(inputAddress);
      setInputBalance(balance);
    }
  };

  return (
    <>
      <div>
        <h1>Wallet Connection</h1>

        {/* Input field for entering an address */}
        <input
          type="text"
          value={inputAddress}
          onChange={handleInputChange}
          placeholder="Enter address"
        />
        <button onClick={handleCheckBalance}>Check Balance</button>

        {/* Display the balance of entered address only after clicking the button */}
        {inputBalance !== null && (
          <p>Balance for {inputAddress}: {inputBalance} ETH</p>
        )}

        {/* Display connected account */}
        <p>Connected Account: {account || 'Not connected'}</p>

        {/* Display the network */}
        <p>Network: {network ? getNetworkName(network) : 'Loading...'}</p>
      </div>
    </>
  );
}

export default App;
