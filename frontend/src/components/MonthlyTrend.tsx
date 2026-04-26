"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/lib/finance-utils";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

const TrendTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; color: string; value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 shadow-2xl rounded-2xl text-white">
        <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-3">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-8 mb-1.5 last:mb-0">
            <span className="text-xs font-bold text-slate-400">{entry.name}</span>
            <span className="text-sm font-black" style={{ color: entry.color }}>
              ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MonthlyTrend({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) return null;

  const monthMap: Record<string, { income: number; expenses: number }> = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const d = new Date(tx.date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
    if (tx.amount > 0) monthMap[key].income += tx.amount;
    else monthMap[key].expenses += Math.abs(tx.amount);
  });

  const data: MonthlyData[] = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month,
      income: Math.round(vals.income * 100) / 100,
      expenses: Math.round(vals.expenses * 100) / 100,
      net: Math.round((vals.income - vals.expenses) * 100) / 100,
    }));

  if (data.length < 2) return null;

  return (
    <div className="h-72 w-full" style={{ minHeight: "288px" }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#incomeGrad)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f43f5e"
            strokeWidth={3}
            fill="url(#expenseGrad)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
