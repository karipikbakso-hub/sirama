'use client'
import ThemeToggle from './ThemeToggle'
export default function Navbar(){
return (
<header className="flex items-center justify-between p-4 border-b" style={{background:'var(--sirama-primary)'}}>
<div className="flex items-center gap-3 text-white">
<div className="font-bold">SIRAMA</div>
<div className="text-sm opacity-90">Demo Fase 1</div>
</div>
<div className="flex items-center gap-4 text-white">
<ThemeToggle />
</div>
</header>
)
}
