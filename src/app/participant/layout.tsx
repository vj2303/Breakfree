'use client'

import React from 'react';

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
       
        {/* Page Content */}
        <main className="flex-1  bg-[#F7F9FC] min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}