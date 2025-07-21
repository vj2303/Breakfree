'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, LogOut } from 'lucide-react'

interface AITrainerSidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

const AITrainerSidebar: React.FC<AITrainerSidebarProps> = ({ activePage, onPageChange }) => {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'create',
      label: 'Create',
      icon: Plus,
      path: '/dashboard/ai-trainer/create'
    },
    {
      id: 'evaluate',
      label: 'Evaluate',
      icon: BarChart3,
      path: '/dashboard/ai-trainer/evaluate'
    }
  ]

  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem('token')
    // Redirect to login page
    router.push('/login')
  }

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.id === 'home') {
      router.push(item.path)
    } else {
      onPageChange(item.id)
      router.push(item.path)
    }
  }

  return (
    <div className="w-20 h-screen bg-white flex flex-col items-center py-6 fixed left-0 top-0">
      {/* Top Spacing */}
      <div className="h-20"></div>
      
      {/* Menu Items */}
      <div className="flex flex-col items-center space-y-8 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id || pathname.includes(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? ' text-gray-600 hover:text-gray-800 hover:bg-gray-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center space-y-2 p-3 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
      >
        <LogOut size={24} />
        <span className="text-xs font-medium">Log Out</span>
      </button>
    </div>
  )
}

export default AITrainerSidebar 