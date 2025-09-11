'use client';

import { Suspense } from 'react';
import CaseStudyAssessment from './CaseStudyAssessment';

export default function CaseStudyWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-black">Loading...</div>}>
      <CaseStudyAssessment />
    </Suspense>
  );
}
