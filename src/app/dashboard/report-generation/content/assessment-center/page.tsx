'use client'
import React, { useState } from 'react';
import AssessmentCenterStepper from './AssessmentCenterStepper';
import { useRouter } from 'next/navigation';

const dummyCards = [
  { id: 1, title: 'Assessment Center 1', description: 'Description 1' },
  { id: 2, title: 'Assessment Center 2', description: 'Description 2' },
];

export default function AssessmentCenterPage() {
  const [showStepper, setShowStepper] = useState(false);
  const router = useRouter();

  if (showStepper) {
    return <AssessmentCenterStepper onBack={() => setShowStepper(false)} />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Assessment Centers</h1>
        <button
          className="px-6 py-2 rounded-full bg-gray-900 text-white font-semibold text-lg shadow hover:bg-gray-800 transition"
          onClick={() => router.push('/dashboard/report-generation/content/assessment-center/create')}
        >
          + Create Assessment Center
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyCards.map(card => (
          <div key={card.id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-2">{card.title}</h2>
            <p className="text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
