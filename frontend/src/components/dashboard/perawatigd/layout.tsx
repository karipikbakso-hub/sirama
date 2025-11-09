import RoleLayout from '@/components/dash/DashboardShell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="perawatigd">{children}</RoleLayout>;
}