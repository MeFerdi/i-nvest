import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { QUICKNODE_WS, SOLANA_RPC_PROXY } from './config.js';

function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
}

function WalletConnect() {
  return (
    <main>
      <h1>Connect Wallet</h1>
    </main>
  );
}

function PrivacyPage() {
  return (
    <main>
      <h1>Privacy Policy</h1>
    </main>
  );
}

function TermsPage() {
  return (
    <main>
      <h1>Terms of Service</h1>
    </main>
  );
}

function DisclosuresPage() {
  return (
    <main>
      <h1>Disclosures</h1>
    </main>
  );
}
const endpoint = SOLANA_RPC_PROXY;
const connectionConfig = {
  commitment: 'confirmed',
  wsEndpoint: QUICKNODE_WS,
};

function AppContent() {
  const { connected } = useWallet();
  return connected ? <Dashboard /> : <WalletConnect />;
}

export default function App() {
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
            <WalletProvider wallets={wallets} autoConnect={true}>
              <WalletModalProvider>
                <AppContent />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        )}
      />
      <Route path="/legal/privacy" element={<PrivacyPage />} />
      <Route path="/legal/terms" element={<TermsPage />} />
      <Route path="/legal/disclosures" element={<DisclosuresPage />} />
    </Routes>
  );
}
