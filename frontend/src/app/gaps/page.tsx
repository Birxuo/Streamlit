"use client";

import { useFinance } from "@/context/FinanceContext";
import { ShieldAlert, AlertTriangle, CheckCircle2, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { InsightCard } from "@/components/InsightCard";

export default function GapsPage() {
  const { data, insights } = useFinance();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-900 p-6 rounded-3xl mb-6">
          <ShieldAlert className="w-12 h-12 text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">No Security Audit Data</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Upload your data to run a structural gap analysis and identify wealth leaks.
        </p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-8 rounded-2xl transition-all">
          Run Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Efficiency Gaps</h1>
          <p className="text-slate-400 font-medium">Identifying structural wealth leaks and misalignments.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold text-sm">
          <AlertTriangle size={16} /> 2 Critical Gaps Detected
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-red-500 w-5 h-5" />
            Critical Leak Analysis
          </h3>
          {data.flagged.length > 0 ? (
            data.flagged.map((gap, idx) => (
              <div key={idx} className="glass-card p-8 border-red-500/20 bg-red-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-all"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">High Severity</span>
                      <h4 className="text-2xl font-black text-white mt-3 tracking-tight">{gap.category} Overspending</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency Deficit</p>
                      <p className="text-2xl font-black text-red-500">-${(gap.amount - (data.income * (gap.benchmark / 100))).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Your spending in <span className="text-white font-bold">{gap.category}</span> represents <span className="text-white font-bold">{((gap.amount / data.income) * 100).toFixed(1)}%</span> of your total income, which is <span className="text-red-400 font-bold">{(((gap.amount / data.income) * 100) - gap.benchmark).toFixed(1)}%</span> above the institutional benchmark.
                  </p>
                  <div className="flex gap-4">
                    <button className="bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-2 px-6 rounded-xl text-sm transition-all">
                      Fix This Leak
                    </button>
                    <button className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all">
                      View Transactions
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-12 text-center text-emerald-500 font-bold">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
              Structural Alignment 100%
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-emerald-500 w-5 h-5" />
            Strategic Optimizations
          </h3>
          <div className="space-y-4">
            {insights?.map((insight: any, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>

          <div className="glass-card p-8 bg-emerald-500/5 border-emerald-500/20">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h4 className="font-bold text-white">Annual Savings Potential</h4>
                   <p className="text-2xl font-black text-emerald-500">$14,200.00</p>
                </div>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               By addressing the 2 critical gaps and 3 secondary misalignments, your 12-month net worth projection increases by 14.5% before market returns.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
