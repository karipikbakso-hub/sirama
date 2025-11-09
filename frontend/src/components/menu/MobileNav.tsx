'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { menuByRole, Role } from '@/lib/menuByRole';
import { MdHome } from 'react-icons/md';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const segments = pathname?.split('/') || [];
  const role = segments[2] as Role;
  const navItems = menuByRole[role] ?? [];

  const normalize = (url: string) => url.replace(/\/$/, '');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && (buttonRef.current || linkRef.current)) {
      const activeElement = buttonRef.current || linkRef.current;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [hasMounted, pathname, searchParams]);

  // Modular navigation for all roles
  const handleMenuClick = (href: string) => {
    const moduleName = href?.split('/').pop() || 'dashboard';
    const currentParams = searchParams ? new URLSearchParams(searchParams) : new URLSearchParams();
    currentParams.set('module', moduleName);
    router.replace(`/dashboard/${role}?${currentParams.toString()}`, { scroll: false });
  };

  if (!hasMounted || !role) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-2 px-2 py-3 min-w-max">
          {/* Menu Items - All roles use modular navigation */}
          {navItems.map(({ label, icon: Icon, href }) => {
            const moduleName = href?.split('/').pop() || 'dashboard';
            const currentModule = searchParams?.get('module') || 'dashboard';
            const isActive = currentModule === moduleName;

            return (
              <button
                key={href}
                onClick={() => handleMenuClick(href || '')}
                ref={isActive ? buttonRef : null}
                className={`flex flex-col items-center text-xs min-w-[60px] p-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 font-semibold shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {Icon && <Icon className="text-xl mb-1" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
