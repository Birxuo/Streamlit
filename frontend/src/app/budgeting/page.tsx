"use client";

import { useFinance } from "@/context/FinanceContext";
import { PieChart, Target, Zap, TrendingDown } from "lucide-react";
import Link from "next/link";
import { SpendingPieChart } from "@/components/Charts";

export default function BudgetingPage() {
  const { data } = useFinance();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-900 p-6 rounded-3xl mb-6">
          <PieChart className="w-12 h-12 text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Budget Model Missing</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Upload your transactions to generate an AI-powered spending model and budget limits.
        </p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-8 rounded-2xl transition-all">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Budgeting</h1>
        <p className="text-slate-400 font-medium">Strategic allocation and spending limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-8 mb-8">
            <h3 className="font-bold text-white mb-8 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Category Allocation
            </h3>
            <SpendingPieChart data={data.categoryGroup} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.categoryGroup.sort((a, b) => b.value - a.value).map((cat, idx) => {
              const percentage = (cat.value / data.expenses) * 100;
              return (
                <div key={idx} className="glass-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat.name}</p>
                      <p className="text-2xl font-black text-white tracking-tight">${cat.value.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              AI Proposed Limits
            </h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Based on your monthly income of <span className="text-white font-bold">${data.income.toLocaleString()}</span>, our model suggests the following caps to maximize wealth building.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Essential Caps</span>
                  <span className="text-xs font-bold text-emerald-500">50% Max</span>
                </div>
                <div className="text-lg font-black text-white">${(data.income * 0.5).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Discretionary Caps</span>
                  <span className="text-xs font-bold text-emerald-500">30% Max</span>
                </div>
                <div className="text-lg font-black text-white">${(data.income * 0.3).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-indigo-400" />
              Efficiency Tips
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-slate-400 leading-snug">
                <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
                Your <span className="text-white font-bold">Subscription</span> category is 15% higher than peers. Audit recurring charges.
              </li>
              <li className="flex gap-3 text-sm text-slate-400 leading-snug">
                <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
                Automating <span className="text-white font-bold">10%</span> of income directly to savings would increase your 5-year wealth by $12k.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
