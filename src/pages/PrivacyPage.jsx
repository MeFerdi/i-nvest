import React from 'react';
import LegalPageLayout from '../components/ui/LegalPageLayout.jsx';

const sections = [
  {
    title: 'What We Read',
    paragraphs: [
      'WeSignl reads public onchain wallet data such as balances, token positions, and transaction activity in order to generate signals and prepare execution flows.',
      'Wallet monitoring is limited to wallets that the user explicitly connects or chooses to track.',
    ],
  },
  {
    title: 'What We Do Not Collect',
    paragraphs: [
      'WeSignl does not take custody of assets and does not access private keys, seed phrases, or wallet secrets.',
      'The product should not require personal identity data such as full name, government ID, or email in order to provide core wallet intelligence functions.',
    ],
  },
  {
    title: 'Data Handling',
    paragraphs: [
      'Where backend services are used, they should retain only the minimum wallet-derived data required to support monitoring, signal generation, execution preparation, and service reliability.',
      'User settings and tracked wallet state should be scoped to the product experience and should not be repurposed for unrelated profiling or resale.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy"
      description="WeSignl is designed to be non-custodial and privacy-conscious. Monitoring uses public blockchain data, while execution remains user-approved."
      sections={sections}
    />
  );
}
