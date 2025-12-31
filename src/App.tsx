"use client"

/**
 * SolGol - AI-powered Solana soccer sports betting tool
 *
 * Styling: Using Tailwind CSS for consistent, utility-first styling
 *
 * Main app component that manages conversation state and coordinates
 * between the chat interface and betting functionality.
 */

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from "react"
import InnerApp from './InnerApp';
import "./App.css";
import './globals.css'

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

function App(){
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  // helius endpoints fail on getProgramAccounts
  const endpoint = useMemo(() => "https://mainnet.helius-rpc.com/?api-key=b1b87176-24d9-41e1-897e-7e821325ccc0", [network]);

  const wallets = useMemo(
    () => [],  // empty array means only show wallets that user has installed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <InnerApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
