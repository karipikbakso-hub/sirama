'use client'
import Link from 'next/link'
export default function Sidebar(){
return (
<aside className="w-64 p-4 border-r h-screen sticky top-0">
<nav className="flex flex-col gap-3">
<Link href="/">Dashboard</Link>
<Link href="/pasien">Pasien</Link>
<Link href="/rekam-medis">Rekam Medis</Link>
<Link href="/kasir">Kasir</Link>
<Link href="/antrian">Antrian</Link>
<Link href="/audit">Audit</Link>
<Link href="/settings">Settings</Link>
</nav>
</aside>
)
}
