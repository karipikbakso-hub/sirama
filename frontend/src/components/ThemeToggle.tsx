'use client'
import { useTheme } from 'next-themes'

export default function ThemeToggle(){
const { theme, setTheme, resolvedTheme } = useTheme()
return (
<div className="flex items-center gap-2">
<button onClick={() => setTheme('light')} className="px-2 py-1 rounded border">Light</button>
<button onClick={() => setTheme('dark')} className="px-2 py-1 rounded border">Dark</button>
<button onClick={() => setTheme('system')} className="px-2 py-1 rounded border">Auto</button>
</div>
)
}
