'use client';

import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';



export default function AdminLayout({ children }) {
  const isMobile = useIsMobile();
  return (
    <div className="admin-layout">
      <Sidebar />
      <main
        className={`overflow-y-auto bg-dark-300 text-white ${isMobile ? 'max-h-[calc(100vh-60px)]' : ''}`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
