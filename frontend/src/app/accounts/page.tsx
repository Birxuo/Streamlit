"use client";

import { useFinance } from "@/context/FinanceContext";
import { Wallet, Search, Filter, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AccountsPage() {
  const { data } = useFinance();
  const [search, setSearch] = useState("");

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-900 p-6 rounded-3xl mb-6">
          <Wallet className="w-12 h-12 text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">No Account Data Found</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Upload your transaction statement on the dashboard to view detailed account breakdowns.
        </p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-8 rounded-2xl transition-all">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const filteredTransactions = data.allTransactions.filter(tx => 
    tx.description.toLowerCase().includes(search.toLowerCase()) ||
    tx.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Accounts</h1>
          <p className="text-slate-400 font-medium">Detailed transaction ledger and history.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search ledger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 outline-none focus:border-emerald-500/50"
            />
          </div>
          <button className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredTransactions.slice(0, 100).map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-400">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${tx.amount > 0 ? 'text-emerald-500' : 'text-white'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {tx.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} className="text-slate-500" />}
                      ${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length > 100 && (
          <div className="p-4 text-center border-t border-slate-800 bg-slate-900/20">
            <p className="text-xs text-slate-500 font-medium">Showing first 100 transactions of {filteredTransactions.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
