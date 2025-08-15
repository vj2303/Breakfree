'use client'
import Sidebar from './dashboard/Sidebar'
import { usePathname } from 'next/navigation'

export default function AssessorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Determine which sidebar item is selected based on the current path
  let selected = '/assessor/dashboard'
  if (pathname.startsWith('/assessor/assess')) selected = '/assessor/assess'
  else if (pathname.startsWith('/assessor/feedback')) selected = '/assessor/feedback'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar selected={selected} />
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
}


