'use client'

export default function SidebarGroup({
  title,
  items,
  pathname,
  defaultOpen = true,
}: {
  title: string
  items: [string, string, string][]
  pathname: string
  defaultOpen?: boolean
}) {
  return (
    <div>
      <div className="px-3 py-2 text-xs uppercase tracking-wider text-gray-600">{title}</div>
      <nav className="mt-1 space-y-1">
        {items.map(([label, icon, href]) => (
          <a
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded transition ${
              pathname === href
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-sm">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
