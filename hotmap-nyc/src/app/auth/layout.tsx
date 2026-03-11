// src/app/auth/layout.tsx
import { Flame } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-lg">
          <Flame className="w-6 h-6 text-accent" />
          <span className="gradient-text">Hot Map NYC</span>
        </Link>
      </div>

      {/* Background effect */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(ellipse at 30% 40%, hsl(28, 100%, 55%, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, hsl(186, 100%, 50%, 0.04) 0%, transparent 50%)`,
        }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        {children}
      </div>
    </div>
  );
}
