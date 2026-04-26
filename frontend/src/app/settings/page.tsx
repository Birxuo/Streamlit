"use client";

import { useFinance } from "@/context/FinanceContext";
import { Settings, User, Bell, Shield, Database, Save, Trash2, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function SettingsPage() {
  const { setData, setInsights } = useFinance();
  const [activeTab, setActiveTab] = useState("profile");

  const clearData = () => {
    if (confirm("Are you sure you want to delete all financial data? This cannot be undone.")) {
      setData(null);
      setInsights(null);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "preferences", name: "Preferences", icon: Globe },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "data", name: "Data Management", icon: Database },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Settings</h1>
        <p className="text-slate-400 font-medium">Manage your account and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id 
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card p-8">
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[3px]">
                      <div className="w-full h-full rounded-[21px] bg-slate-950 flex items-center justify-center overflow-hidden">
                        <Image src="https://i.pravatar.cc/100?u=sarah" alt="avatar" width={100} height={100} />
                      </div>
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-emerald-500 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <Save size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Sarah Jones</h3>
                    <p className="text-sm text-slate-500">sarah.jones@institutional.com</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      Premium Member
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">First Name</label>
                    <input type="text" defaultValue="Sarah" className="settings-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Last Name</label>
                    <input type="text" defaultValue="Jones" className="settings-input" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                    <input type="email" defaultValue="sarah.jones@institutional.com" className="settings-input" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white">Financial Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div>
                      <p className="font-bold text-white">Base Currency</p>
                      <p className="text-xs text-slate-500">Global transactions will be normalized to this.</p>
                    </div>
                    <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div>
                      <p className="font-bold text-white">Fiscal Year Start</p>
                      <p className="text-xs text-slate-500">Determines reporting cycles.</p>
                    </div>
                    <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                      <option>January</option>
                      <option>April</option>
                      <option>July</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white">Data Management</h3>
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                  <h4 className="font-bold text-red-500 flex items-center gap-2 mb-2">
                    <Trash2 size={18} /> Danger Zone
                  </h4>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    All financial models, uploaded statements, and AI insights are stored locally in your browser. Clearing this data will permanently remove all strategic analysis.
                  </p>
                  <button 
                    onClick={clearData}
                    className="bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-red-500/20"
                  >
                    Wipe Local Storage
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-4">
               <button className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Discard Changes</button>
               <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-8 rounded-xl text-sm transition-all">
                 Save Settings
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
