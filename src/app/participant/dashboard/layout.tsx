'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  FileText,
  MessageCircle,
  Calendar,
  LogOut
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Home', icon: Home, href: '/participant/dashboard' },
  { label: 'Assessment', icon: FileText, href: '/participant/dashboard' },
  { label: 'Forum', icon: MessageCircle, href: '/participant/forum' },
  { label: 'Calender', icon: Calendar, href: '/participant/calendar' },
];

export default function ParticipantDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dummy user info (replace with real user context if available)
  const user = {
    name: "Andrea D'souza",
    email: 'andrea45@gmail.com',
    avatar: '/logo.png', // Replace with real avatar if available
  };

  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between py-8 px-4 min-h-screen">
        <div>
          <div className="mb-12 flex items-center justify-center">
            <Image src="/logo.png" alt="Breakfree Consulting" width={120} height={40} />
          </div>
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              // All links get blue highlight
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50'}
                  `}
                  style={{ cursor: 'pointer' }}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="mb-4">
          <a
            href="/logout"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ cursor: 'pointer' }}
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="w-full flex items-center justify-between px-8 py-6 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            {/* Logo (optional, already in sidebar) */}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-black">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full object-cover border"
            />
            <button className="ml-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-8 bg-[#F7F9FC] min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
} 