'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function SidebarItem({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const segments = pathname?.split('/') || [];
  const role = segments[2];

  // Modular navigation - use query parameters for content switching
  const handleClick = () => {
    if (role) {
      const moduleName = href?.split('/').pop() || 'dashboard';
      const currentParams = searchParams ? new URLSearchParams(searchParams) : new URLSearchParams();
      currentParams.set('module', moduleName);
      router.replace(`/dashboard/${role}?${currentParams.toString()}`, { scroll: false });
    }
  };

  const moduleName = href?.split('/').pop() || 'dashboard';
  const currentModule = searchParams?.get('module') || 'dashboard';
  const isActive = currentModule === moduleName;

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left ${
        isActive
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold'
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      <Icon className="text-lg text-inherit" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
