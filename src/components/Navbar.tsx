'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'

export default function Navbar({ userData }) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Default user data if not provided
  const defaultUserData = {
    name: 'User',
    email: 'user@example.com',
    avatar: ''
  }

  const user = userData || defaultUserData

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...')
    // Clear authentication tokens, localStorage, etc.
    router.push('/login')
  }

  const handleProfileClick = () => {
    setShowUserMenu(false)
    router.push('/profile')
  }

  const handleSettingsClick = () => {
    setShowUserMenu(false)
    router.push('/settings')
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleLogoClick = () => {
    router.push('/dashboard')
  }

  return (
    <>
      <header className="bg-white  border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <Image
                src="/logo.png"
                alt="Breakfree Consulting"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="text-lg font-semibold text-gray-900">
                Breakfree Consulting
              </span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  
                  <button 
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  
                  <hr className="my-1 border-gray-200" />
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay to close dropdown when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  )
}