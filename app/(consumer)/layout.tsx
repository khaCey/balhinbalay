import BalhinBalay from '@/components/balhinbalay/App';

// This layout survives navigation between consumer App Router pages.
// The admin portal lives outside this route group at /admin.
export default function ConsumerLayout({children}: {children: React.ReactNode}) {
  return <BalhinBalay>{children}</BalhinBalay>;
}
