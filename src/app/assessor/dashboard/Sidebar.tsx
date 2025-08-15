import Link from 'next/link'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  { label: 'Home', href: '/assessor/dashboard' },
  { label: 'Assess', href: '/assessor/assess' },
  { label: 'Feedback', href: '/assessor/feedback' },
]

export default function Sidebar({ selected }: { selected: string }) {
  const router = useRouter()
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col p-6 min-h-screen">
      <div className="mb-10 text-2xl font-bold text-blue-700">Assessor</div>
      <nav className="flex flex-col gap-4 flex-1">
        {sidebarItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${selected === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => router.push('/assessor/login')}
          className="mt-auto px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          Logout
        </button>
      </nav>
    </aside>
  )
}


