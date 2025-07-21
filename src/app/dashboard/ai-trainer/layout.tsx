'use client'

import React, { useState, useEffect } from 'react'
import AITrainerSidebar from '@/components/AITrainerSidebar'
import Navbar from '@/components/Navbar'
import { usePathname } from 'next/navigation'

export default function AITrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [activePage, setActivePage] = useState('create')

  useEffect(() => {
    // Set active page based on current path
    if (pathname.includes('/create')) {
      setActivePage('create')
    } else if (pathname.includes('/evaluate')) {
      setActivePage('evaluate')
    } else {
      setActivePage('home')
    }
  }, [pathname])

  return (
    <div className="flex h-screen bg-[#F9FBFF]">
      {/* Sidebar */}
      <AITrainerSidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-20 flex flex-col">
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 