"use client";
import React, { useState, useMemo } from "react";
import { Wallet, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { FlaggedCategory } from "@/lib/finance-utils";

interface MiniTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
}

const MiniTooltip = ({ active, payload, label }: MiniTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 shadow-2xl rounded-xl text-white text-[10px]">
        <p className="font-bold text-slate-500 uppercase tracking-widest mb-1">Year {label}</p>
        <p className="font-black text-emerald-400 text-sm">
          ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

export function SavingsSimulator({
  categories,
  fallbackVal,
}: {
  categories: FlaggedCategory[];
  fallbackVal: number;
}) {
  const [percent, setPercent] = useState(20);
  const [selectedCat, setSelectedCat] = useState(
    categories[0]?.category || ""
  );

  const target = categories.find((c) => c.category === selectedCat);
  const amount = target ? target.actual_amount : fallbackVal || 0;

  const monthlySavings = amount * (percent / 100);
  const annualSavings = monthlySavings * 12;

  const projectionData = useMemo(() => {
    const rate = 0.07;
    const data = [];
    let cumulative = 0;
    for (let year = 0; year <= 10; year++) {
      cumulative = cumulative * (1 + rate) + annualSavings;
      data.push({
        year,
        value: Math.round(year === 0 ? annualSavings : cumulative),
      });
    }
    return data;
  }, [annualSavings]);

  const fiveYearValue = projectionData[5]?.value || 0;
  const tenYearValue = projectionData[10]?.value || 0;

  return (
    <div className="glass-card p-8 border-slate-800/50">
      <h3 className="flex items-center gap-3 font-bold text-xl mb-8 text-white tracking-tight">
        <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
          <Wallet className="w-5 h-5 text-emerald-500" />
        </div>
        Future Projection
      </h3>

      <div className="mb-6">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2">
          Target Category
        </label>
        <select
          className="w-full bg-slate-900/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none transition-all cursor-pointer"
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          {categories.map((c, i) => (
            <option key={i} value={c.category}>
              {c.category} (${c.actual_amount.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <label className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4">
          <span>Optimization Target</span>
          <span className="text-emerald-500 font-black bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {percent}%
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={percent}
          onChange={(e) => setPercent(parseInt(e.target.value))}
          className="w-full h-1.5"
        />
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center mb-8">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
          Potential Savings
        </p>
        <div className="text-4xl font-black text-emerald-500 tracking-tighter">
          ${monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
        </div>
        <p className="text-xs font-bold text-slate-400 mt-2">
          Estimated <span className="text-white">${annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> annually
        </p>
      </div>

      {annualSavings > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-bold text-white">
              Compounded Wealth <span className="text-slate-500 font-medium tracking-tight">(7% Return)</span>
            </p>
          </div>

          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGradMini" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) => `Y${v}`}
                />
                <YAxis hide />
                <Tooltip content={<MiniTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#savingsGradMini)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">5 Year</p>
              <p className="text-lg font-black text-white">
                ${fiveYearValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-xl text-center border border-emerald-500/20">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">10 Year</p>
              <p className="text-lg font-black text-emerald-400">
                ${tenYearValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
