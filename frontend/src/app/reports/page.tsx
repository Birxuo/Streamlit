"use client";

import { useFinance } from "@/context/FinanceContext";
import { FileText, Download, Share2, Calendar, Layout, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { MonthlyTrend } from "@/components/MonthlyTrend";
import { exportToPDF } from "@/lib/pdf-exporter";
import { useState } from "react";

export default function ReportsPage() {
  const { data } = useFinance();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF("report-content", "Financial_Audit_Report.pdf");
    setExporting(false);
  };

  if (!data) {
    // ... (rest of the check)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-900 p-6 rounded-3xl mb-6">
          <FileText className="w-12 h-12 text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">No Reporting Data</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Upload your data to generate comprehensive PDF reports and seasonal financial summaries.
        </p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-8 rounded-2xl transition-all">
          Generate Report
        </Link>
      </div>
    );
  }

  return (
    <div id="report-content" className="max-w-7xl mx-auto animate-slide-up p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Reports</h1>
          <p className="text-slate-400 font-medium">Executive summaries and deep-dive audits.</p>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-slate-900 border border-slate-800 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all">
            <Share2 size={18} /> Share
          </button>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={18} />}
            {exporting ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Performance Metrics (12m)
              </h3>
              <div className="flex gap-2">
                 <span className="px-2 py-1 bg-slate-800 text-[10px] font-bold text-slate-400 rounded">Monthly</span>
                 <span className="px-2 py-1 bg-emerald-500/10 text-[10px] font-bold text-emerald-500 rounded border border-emerald-500/20">Quarterly</span>
              </div>
            </div>
            <div className="h-64 mb-8">
              <MonthlyTrend transactions={data.allTransactions} />
            </div>

            <div className="pt-8 border-t border-slate-800">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Comparative Performance Analytics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Net Savings", value: `$${data.savings.toLocaleString()}`, trend: "+12%", status: "success" },
                   { label: "Burn Rate", value: `${((data.expenses / data.income) * 100).toFixed(1)}%`, trend: "-2.4%", status: "success" },
                   { label: "Gap Frequency", value: data.flagged.length.toString(), trend: "stable", status: "neutral" }
                 ].map((stat, i) => (
                   <div key={i} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <div className="flex items-end justify-between">
                         <p className="text-xl font-black text-white">{stat.value}</p>
                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                           stat.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
                         }`}>
                           {stat.trend}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 group cursor-pointer hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-900 rounded-xl">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
                <Layout className="w-5 h-5 text-slate-700" />
              </div>
              <h4 className="font-bold text-white mb-2">Q1 Wealth Audit</h4>
              <p className="text-xs text-slate-500 mb-4">Structural analysis of Q1 spending and tax planning.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <span>Completed</span>
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Mar 31, 2024</span>
              </div>
            </div>

            <div className="glass-card p-8 group cursor-pointer hover:border-indigo-500/30 transition-all">
               <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-900 rounded-xl">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <Layout className="w-5 h-5 text-slate-700" />
              </div>
              <h4 className="font-bold text-white mb-2">Yearly Efficiency Review</h4>
              <p className="text-xs text-slate-500 mb-4">Comprehensive 2023 financial gap identification.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Draft</span>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span>In Progress</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-8">
              <h4 className="font-bold text-white mb-6">Report Archive</h4>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-slate-500 group-hover:text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-white">Monthly_Audit_0{i}.pdf</p>
                        <p className="text-[10px] text-slate-500">2.4 MB • Oct {10 + i}, 2023</p>
                      </div>
                    </div>
                    <Download size={14} className="text-slate-700 group-hover:text-white" />
                  </div>
                ))}
              </div>
           </div>

           <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border-indigo-500/20">
              <h4 className="font-bold text-white mb-2">Premium Insights</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Upgrade to Enterprise for white-label reports, multi-user accounts, and deep tax-harvesting strategies.
              </p>
              <button className="w-full py-3 bg-white text-slate-950 font-black rounded-xl text-sm hover:bg-slate-200 transition-all">
                Learn More
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
