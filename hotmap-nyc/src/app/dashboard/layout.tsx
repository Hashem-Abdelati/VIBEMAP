// src/app/dashboard/layout.tsx
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-14">
        {children}
      </div>
    </AuthProvider>
  );
}
