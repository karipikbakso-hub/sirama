'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { menuByRole, Role } from './menuByRole'

export default function MobileNav() {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const role = segments[2] as Role
  const navItems = menuByRole[role] ?? []

  const normalize = (url: string) => url.replace(/\/$/, '')
  const activeRef = useRef<HTMLAnchorElement>(null)

  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [hasMounted, pathname])

  if (!hasMounted) return null

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card text-muted-foreground border-t border-border shadow-sm"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 py-2 min-w-max">
          {navItems.map(({ label, icon: Icon, path }) => {
            const href = `/dashboard/${role}/${path}`
            const isActive = normalize(pathname) === normalize(href)

            return (
              <a
                key={href}
                href={href}
                ref={isActive ? activeRef : null}
                className={`flex flex-col items-center text-xs min-w-[60px] transition ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'hover:text-primary'
                }`}
              >
                <Icon className="text-xl" />
                <span>{label}</span>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}