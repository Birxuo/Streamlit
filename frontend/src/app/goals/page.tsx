"use client";

import { useFinance } from "@/context/FinanceContext";
import { TrendingUp, Plus, Flag, Trophy, Clock } from "lucide-react";
import Link from "next/link";

export default function GoalsPage() {
  const { data } = useFinance();

  const goals = [
    { name: "Emergency Fund", target: 15000, current: 8500, category: "Security", deadline: "Dec 2024" },
    { name: "New Vehicle", target: 45000, current: 12000, category: "Lifestyle", deadline: "Jun 2025" },
    { name: "House Downpayment", target: 120000, current: 45000, category: "Assets", deadline: "Jan 2026" },
  ];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-900 p-6 rounded-3xl mb-6">
          <TrendingUp className="w-12 h-12 text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">No Strategic Goals</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Define your financial milestones and track your progress against real-time bank data.
        </p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-8 rounded-2xl transition-all">
          Connect Statement
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Financial Goals</h1>
          <p className="text-slate-400 font-medium">Tracking progress toward your wealth milestones.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
          <Plus size={18} /> Add New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal, idx) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={idx} className="glass-card p-8 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flag size={80} className="text-white" />
              </div>
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">{goal.category}</span>
                    <h3 className="text-2xl font-black text-white mt-2 tracking-tight">{goal.name}</h3>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Progress</p>
                      <p className="text-2xl font-black text-white">${goal.current.toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-500">{progress.toFixed(0)}%</p>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>$0</span>
                    <span>Target: ${goal.target.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} className="text-slate-500" />
                    <span>Est. completion: {goal.deadline}</span>
                  </div>
                  <Trophy size={18} className={`${progress >= 100 ? 'text-yellow-500' : 'text-slate-700'}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
