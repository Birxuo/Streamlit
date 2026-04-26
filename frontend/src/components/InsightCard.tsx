import { AlertCircle, ArrowRight, Zap } from "lucide-react";
import { Insight } from "@/context/FinanceContext";

export function InsightCard({ insight }: { insight: Insight }) {
    const isHigh = insight.severity === "high" || insight.severity === "critical";
    
    return (
        <div className={`glass-card p-6 border-l-4 ${isHigh ? 'border-l-red-500' : 'border-l-emerald-500'} hover:translate-x-1 transition-all group`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isHigh ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {isHigh ? <AlertCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{insight.category} Deficiency</h4>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Structural Leak Detected</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">Potential Savings</p>
                    <p className={`text-sm font-black ${isHigh ? 'text-red-400' : 'text-emerald-400'}`}>
                        ${Number(insight.annual_savings).toLocaleString()}
                    </p>
                </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2 italic">
                &quot;{insight.recommendation}&quot;
            </p>

            <div className="space-y-4">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isHigh ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: isHigh ? '85%' : '60%' }} 
                    />
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                    Optimize Now
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
