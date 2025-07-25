'use client';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';



const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/super-admin',
  },
  {
    icon: Users,
    label: 'Customers',
    href: '/super-admin/customers',
  },
  {
    icon: Lock,
    label: 'Change Password',
    href: '/super-admin/change-password',
  },
    {
      icon: Settings,
      label: 'Settings',
      href: '/super-admin/settings',
    },
];

export default function Sidebar() {
  const pathname = usePathname();
  console.log('Sidebar pathname:', pathname);
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [pathname, isMobile]);

  const isActiveRoute = (href) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed left-4 top-4 z-50 rounded-md bg-dark-400 p-2 text-white"
        >
          <Menu size={24} />
        </button>
      )}

      <aside
        className={cn(
          'flex h-screen flex-col border-r border-dark-100 bg-dark-400 text-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          isMobile && !mobileMenuOpen && 'hidden',
          isMobile && mobileMenuOpen && 'fixed z-40 w-64'
        )}
      >
        <div className="flex items-center justify-between border-b border-dark-100 p-4">
          {!collapsed && <span className="text-xl font-bold text-white">VoiceAgent</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1 text-gray-400 hover:bg-dark-200"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
                    isActiveRoute(item.href)
                      ? 'bg-blue-accent bg-opacity-20 text-blue-accent'
                      : 'text-gray-400 hover:bg-dark-200 hover:text-white'
                  )}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-dark-100 p-4">
          <button className="flex cursor-pointer w-full items-center gap-2 text-gray-400 transition-colors hover:text-white bg-transparent border-none border-t border-gray-300 py-3 px-4">
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Dark overlay for mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
