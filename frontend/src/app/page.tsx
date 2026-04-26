"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Upload, FileText, Activity, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { categorizeTransactions, findGaps, computeMonthlyTrends, detectOutliers, Transaction } from "@/lib/finance-utils";
import { SpendingPieChart, TopTransactionsChart } from "@/components/Charts";
import { InsightCard } from "@/components/InsightCard";
import { SavingsSimulator } from "@/components/SavingsSimulator";
import { MonthlyTrend } from "@/components/MonthlyTrend";
import { useFinance } from "@/context/FinanceContext";
import { exportToPDF } from "@/lib/pdf-exporter";
import { Loader2, Download } from "lucide-react";

export default function Home() {
  const { data, setData, insights, setInsights, loading, setLoading } = useFinance();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF("dashboard-content", "Financial_Dashboard_Report.pdf");
    setExporting(false);
  };

  const processCsvText = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<Record<string, string>>) => {
          const txs = categorizeTransactions(results.data);
          
          let income = 0;
          let expenses = 0;
          const catMap: Record<string, number> = {};
          
          txs.forEach((tx: Transaction) => {
            if (tx.amount > 0) income += tx.amount;
            else if (tx.amount < 0) {
                const absAmount = Math.abs(tx.amount);
                expenses += absAmount;
                catMap[tx.category] = (catMap[tx.category] || 0) + absAmount;
            }
          });

          const categoryGroup = Object.entries(catMap).map(([name, value]) => ({ name, value }));
          const topTransactions = [...txs]
            .filter(t => t.amount < 0)
            .map(t => ({...t, amount: Math.abs(t.amount)}))
            .sort((a, b) => b.amount - a.amount).slice(0, 10);
            
          const flagged = findGaps(catMap, income);
          const trends = computeMonthlyTrends(txs);
          const outliers = detectOutliers(txs);

          setData({
            income,
            expenses,
            savings: income - expenses,
            categoryGroup,
            topTransactions,
            flagged,
            allTransactions: txs,
          });

          if (flagged.length > 0) {
             try {
                const response = await fetch("/api/insights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        spendingSummary: catMap, 
                        income, 
                        flaggedCategories: flagged,
                        outliers: outliers.slice(0, 10),
                        trends,
                        topTransactions: topTransactions.slice(0, 15)
                    })
                });
                const resData = await response.json();
                if (resData.insights) {
                    setInsights(resData.insights);
                }
             } catch(e) {
                console.error(e);
             }
          } else {
             setInsights([]);
          }
          
          setLoading(false);
        },
        error: (err: Error) => {
          setError(err.message);
          setLoading(false);
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      setLoading(false);
    }
  }, [setData, setInsights, setLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => processCsvText(event.target?.result as string);
    reader.readAsText(file);
  };

  const loadSampleData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/sample_data.csv");
      const text = await response.text();
      await processCsvText(text);
    } catch {
      setError("Failed to load sample data.");
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith(".csv")) return;
    const reader = new FileReader();
    reader.onload = (ev) => processCsvText(ev.target?.result as string);
    reader.readAsText(file);
  }, [processCsvText]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="min-h-full"
    >
      {dragging && (
        <div className="fixed inset-0 z-[100] bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl border-2 border-dashed border-emerald-500/50 text-center animate-pulse-glow">
            <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-white">Drop Statement</p>
            <p className="text-sm text-slate-400 mt-1">Ready for structural analysis</p>
          </div>
        </div>
      )}

      {!data ? (
        // ... (rest of the upload view)
        <div className="max-w-4xl mx-auto pt-20 pb-32">
           <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold tracking-widest text-emerald-500 uppercase mb-8">
                <Sparkles className="w-4 h-4" />
                AI Intelligence Platform
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-8">
                Find the <span className="text-emerald-500">Gaps</span> in your wealth.
              </h1>
              <p className="text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Upload your transaction history and let advanced heuristic models uncover structural leaks. Institutional-grade accuracy directly in your browser.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <label className="relative cursor-pointer group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[1.5rem] blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-3 py-5 px-10 rounded-2xl transition-all h-full">
                    <Upload className="w-5 h-5" />
                    <span>Upload CSV Statement</span>
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                </label>

                <button 
                  onClick={loadSampleData}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold py-5 px-10 rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <FileText className="w-5 h-5 text-slate-500" /> Demo Analysis
                </button>
              </div>
              
              {loading && <div className="mt-12 flex flex-col items-center gap-4">
                  <Activity className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Parsing Statement Logic...</p>
              </div>}
              {error && <div className="mt-12 text-red-500 font-bold bg-red-500/10 p-6 rounded-2xl border border-red-500/20 inline-block">{error}</div>}
           </div>
        </div>
      ) : (
        <div id="dashboard-content" className="max-w-7xl mx-auto animate-slide-up p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Your Financial Overview</h2>
              <p className="text-slate-400 font-medium">Real-time gap detection and structural analysis.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-sm"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={16} />}
                {exporting ? "Generating..." : "Export PDF"}
              </button>
              <div className="bg-slate-900/50 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-500">
                May 2024 Analysis
              </div>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 glow-green">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Income</p>
              <p className="text-3xl font-black text-white tracking-tighter">${data.income.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-2">
                <TrendingUp size={12} /> +8.5%
              </div>
            </div>
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Expenses</p>
              <p className="text-3xl font-black text-white tracking-tighter">${data.expenses.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-red-400 text-xs font-bold mt-2">
                <TrendingDown size={12} /> +4.2%
              </div>
            </div>
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Savings</p>
              <p className="text-3xl font-black text-emerald-500 tracking-tighter">${data.savings.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mt-2">
                Net Cash Flow
              </div>
            </div>
            <div className="glass-card p-6 glow-indigo">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Savings Rate</p>
              <p className="text-3xl font-black text-indigo-400 tracking-tighter">
                {data.income > 0 ? ((data.savings / data.income) * 100).toFixed(1) : 0}%
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.max(0, Math.min(100, (data.savings / data.income) * 100))}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visualizations */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-8">
                <h4 className="font-bold text-white mb-8 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Spending Overview
                </h4>
                <SpendingPieChart data={data.categoryGroup} />
              </div>
              
              <div className="glass-card p-8">
                <h4 className="font-bold text-white mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Cash Flow Trends
                </h4>
                <MonthlyTrend transactions={data.allTransactions} />
              </div>

              <div className="glass-card p-8">
                <h4 className="font-bold text-white mb-8 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Top Efficiency Gaps
                </h4>
                <TopTransactionsChart data={data.topTransactions} />
              </div>
            </div>

            {/* AI Insights & Simulator */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="text-emerald-500 w-5 h-5" />
                  Institutional Insights
                </h3>
                
                {!insights ? (
                  <div className="glass-card p-12 text-center">
                    <Activity className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Strategic Audit In Progress</p>
                  </div>
                ) : insights.length === 0 ? (
                  <div className="glass-card p-8 text-center text-emerald-500 font-bold">
                    Structural Alignment Achieved.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.map((insight, idx) => (
                       <InsightCard key={idx} insight={insight} />
                    ))}
                  </div>
                )}
              </div>

              <div className="sticky top-28">
                <SavingsSimulator categories={data.flagged} fallbackVal={0} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
