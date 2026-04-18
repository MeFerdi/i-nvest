import React from 'react';
import BrandLockup from './BrandLockup.jsx';
import AppFooter from './AppFooter.jsx';
import SectionHeader from './SectionHeader.jsx';
import SurfaceCard from './SurfaceCard.jsx';

export default function LegalPageLayout({ title, description, sections }) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <main className="flex-1 px-4 py-8 lg:px-6 lg:py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <BrandLockup size="header" className="mb-2" />
          <SurfaceCard className="p-6 lg:p-8" tone="soft">
            <SectionHeader title={title} description={description} className="mb-8" />
            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-brand-text text-base font-semibold mb-2">{section.title}</h2>
                  <div className="space-y-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed text-brand-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
