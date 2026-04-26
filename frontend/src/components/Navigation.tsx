"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  TrendingUp,
  ShieldAlert,
  FileText,
  Settings,
  Bell,
  Search,
  Download,
  Loader2
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Accounts', icon: Wallet, path: '/accounts' },
    { name: 'Budgeting', icon: PieChart, path: '/budgeting' },
    { name: 'Gaps', icon: ShieldAlert, path: '/gaps', alert: '2 alerts' },
    { name: 'Goals', icon: TrendingUp, path: '/goals' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 p-6 hidden lg:flex flex-col z-[60]">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-white">Streamlit</span>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item flex justify-between items-center ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.name === 'Gaps' && !isActive ? 'text-red-400' : ''}`} />
                <span>{item.name}</span>
              </div>
              {item.alert && (
                <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20">
                  {item.alert}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <Link href="/settings" className={`sidebar-item ${pathname === '/settings' ? 'sidebar-item-active' : ''}`}>
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function TopBar({ onReset, onExport, exporting }: { onReset?: () => void, onExport?: () => void, exporting?: boolean }) {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search financial metrics..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {onExport && (
            <button
              onClick={onExport}
              disabled={exporting}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={14} />}
              {exporting ? "Generating..." : "Export"}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
            >
              Reset Data
            </button>
          )}
        </div>
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">USER</p>
            <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Premium Member</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 p-[2px]">
            <div className="w-full h-full rounded-[9px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image src="https://i.pravatar.cc/100?u=sarah" alt="avatar" width={40} height={40} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
