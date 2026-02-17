'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UserCog,
  Sliders,
  Network,
  TrendingUp,
  BookOpen,
  Heart,
  Moon,
  Sun,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: UserCog },
  { href: '/what-if', label: 'What-If', icon: Sliders },
  { href: '/knowledge-graph', label: 'KG Viewer', icon: Network },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/about', label: 'About', icon: BookOpen },
]

export default function Navigation() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ncd-dark-mode')
    if (stored === 'true') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('ncd-dark-mode', String(next))
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-navy-100 bg-white/80 backdrop-blur-lg dark:border-navy-700 dark:bg-navy-900/80">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-navy-800 dark:text-white">NCD</span>
              <span className="text-lg font-bold text-teal-500">Health+</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                      : 'text-navy-500 hover:bg-navy-50 hover:text-navy-700 dark:text-navy-300 dark:hover:bg-navy-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="rounded-lg p-2 text-navy-500 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden gap-1 overflow-x-auto pb-2 -mx-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                    : 'text-navy-400 hover:text-navy-600 dark:text-navy-400'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
