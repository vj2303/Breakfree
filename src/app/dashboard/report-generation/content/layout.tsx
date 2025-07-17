'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const tabs = [
  { label: 'Assessment center', path: '/dashboard/report-generation/content/assessment-center' },
  { label: 'Assessment', path: '/dashboard/report-generation/content/assessment' },
  { label: 'Report Structure', path: '/dashboard/report-generation/content/report-structure' },
  { label: 'AI profile', path: '/dashboard/report-generation/content/ai-profile' },
  { label: 'Competency Mapping', path: '/dashboard/report-generation/content/competency-mapping' },
];

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Hide Content Management layout on case-study and inbox-activity pages
  if (pathname.includes('/assessment/case-study') || pathname.includes('/assessment/inbox-activity') || pathname.includes('/assessment-center/create')  ) {
    return <>{children}</>;
  }

  return (
    <div className=''>
      <div className="bg-white rounded-3xl p-2 m-4 shadow-sm">
        <h1 className="text-4xl font-bold mb-2">Content Management</h1>
        <p className="text-gray-400 mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit,</p>
        <div className="flex gap-6 mb-2">
          {tabs.map(tab => {
            const isActive = pathname === tab.path;
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.path)}
                className={`px-8 py-3 rounded-full border text-base font-semibold transition-all duration-150 ${isActive ? 'bg-[#425375] text-white border-transparent' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                style={{ outline: 'none' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className='ml-6'>
        {children}
      </div>
    </div>
  );
} 