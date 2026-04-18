import React from 'react';
import LegalPageLayout from '../components/ui/LegalPageLayout.jsx';

const sections = [
  {
    title: 'No Custody',
    paragraphs: [
      'WeSignl is non-custodial. Assets remain in the user wallet unless the user signs a transaction to move them.',
    ],
  },
  {
    title: 'No Guaranteed Returns',
    paragraphs: [
      'Signals and suggested actions are not guarantees of profit, yield, execution quality, or market outcome. Protocol rates, liquidity, slippage, and network conditions may change at any time.',
    ],
  },
  {
    title: 'Protocol And Routing Risk',
    paragraphs: [
      'Suggested actions may rely on third-party protocols and routing systems such as Kamino, Jupiter, DFlow, and Solana RPC providers. Users remain responsible for understanding the risks of interacting with those services.',
    ],
  },
  {
    title: 'Product Positioning',
    paragraphs: [
      'WeSignl should be understood as a wallet intelligence and execution-preparation product. It is not legal, tax, accounting, or investment advice.',
    ],
  },
];

export default function DisclosuresPage() {
  return (
    <LegalPageLayout
      title="Disclosures"
      description="WeSignl helps users monitor wallets and prepare actions, but all outcomes remain subject to market, protocol, and execution risk."
      sections={sections}
    />
  );
}
