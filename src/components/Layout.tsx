import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '@/store'
import { Bell, Search } from 'lucide-react'

export default function Layout() {
  const currentUser = useStore(s => s.currentUser)

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <div className="ml-[220px] transition-all duration-300">
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-surface-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" />
              <input
                type="text"
                placeholder="搜索申请单、目的地..."
                className="pl-9 pr-4 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none w-72 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-surface-300 hover:text-navy-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy-500 text-white flex items-center justify-center text-sm font-medium">
                {currentUser.avatar}
              </div>
              <div className="text-sm">
                <span className="text-navy-500 font-medium">{currentUser.name}</span>
                <span className="text-surface-300 ml-2">{currentUser.level}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
