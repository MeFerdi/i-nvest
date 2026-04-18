import React from 'react';
import LegalPageLayout from '../components/ui/LegalPageLayout.jsx';

const sections = [
  {
    title: 'Product Scope',
    paragraphs: [
      'WeSignl provides wallet monitoring, signal generation, and execution preparation tools. The product is informational and operational software, not a custodial wallet or broker.',
      'Users remain solely responsible for reviewing signals, validating execution details, and approving transactions in their wallet.',
    ],
  },
  {
    title: 'User Responsibility',
    paragraphs: [
      'Users should verify wallet addresses, quoted routes, expected outcomes, and network conditions before approving any transaction.',
      'No action should execute without explicit wallet approval from the user.',
    ],
  },
  {
    title: 'Availability',
    paragraphs: [
      'Signals, quotes, and execution routes may depend on third-party infrastructure and protocol availability. WeSignl does not guarantee uninterrupted access to any external protocol or data source.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms"
      description="Use of WeSignl is subject to user review, wallet approval, and the availability of external blockchain and protocol infrastructure."
      sections={sections}
    />
  );
}
