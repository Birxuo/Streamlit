"use client";
import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  TrendingUp,
  ShieldAlert,
  FileText,
  Settings,
  Bell,
  Search
} from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 p-6 hidden lg:flex flex-col z-[60]">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-white">Streamlit</span>
      </div>

      <nav className="space-y-2 flex-1">
        <div className="sidebar-item sidebar-item-active">
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </div>
        <div className="sidebar-item">
          <Wallet className="w-5 h-5" />
          <span>Accounts</span>
        </div>
        <div className="sidebar-item">
          <PieChart className="w-5 h-5" />
          <span>Budgeting</span>
        </div>
        <div className="sidebar-item flex justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Gaps</span>
          </div>
          <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20">2 alerts</span>
        </div>
        <div className="sidebar-item">
          <TrendingUp className="w-5 h-5" />
          <span>Goals</span>
        </div>
        <div className="sidebar-item">
          <FileText className="w-5 h-5" />
          <span>Reports</span>
        </div>
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <div className="sidebar-item">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ onReset }: { onReset?: () => void }) {
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
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
          >
            Reset Data
          </button>
        )}
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">Sarah Jones</p>
            <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Premium Member</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px]">
            <div className="w-full h-full rounded-[9px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image src="https://i.pravatar.cc/100?u=sarah" alt="avatar" width={40} height={40} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
