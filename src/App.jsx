import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { QUICKNODE_WS, SOLANA_RPC_PROXY } from './config.js';
import Dashboard from './components/Dashboard.jsx';
import WalletConnect from './components/WalletConnect.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import DisclosuresPage from './pages/DisclosuresPage.jsx';

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
