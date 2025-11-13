'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
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
  const router = useRouter();
  const { user, logout, assignments } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/participant/login');
  };

  // Use real user data from AuthContext and participant data from assignments
  const displayUser = {
    name: assignments?.participant?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Participant"),
    email: assignments?.participant?.email || user?.email || 'participant@example.com',
    avatar: '/logo.png',
  };

  return (
    <div className="min-h-screen flex bg-[#F7F9FC] m-0 p-0">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r flex flex-col justify-between min-h-screen m-0 p-0">
        <div className="pt-8">
          <div className="mb-12 flex items-center justify-center px-4">
            <Image src="/logo.png" alt="Breakfree Consulting" width={60} height={60} />
          </div>
          <nav className="flex flex-col gap-2 px-4">
            {sidebarLinks.map(link => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="mb-8 px-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen m-0 p-0">
        {/* Navbar */}
        <header className="w-full flex items-center justify-between px-8 py-6 bg-white shadow-sm m-0">
          <div className="flex items-center gap-2">
            {/* Logo (optional, already in sidebar) */}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-black">{displayUser.name}</div>
              <div className="text-xs text-gray-500">{displayUser.email}</div>
            </div>
            <Image
              src={displayUser.avatar}
              alt={displayUser.name}
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
        <main className="flex-1 p-8 bg-[#F7F9FC] min-h-[calc(100vh-80px)] m-0">
          {children}
        </main>
      </div>
    </div>
  );
}