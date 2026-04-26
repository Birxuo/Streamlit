"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  '#10b981', '#6366f1', '#0ea5e9', '#f43f5e', '#8b5cf6',
  '#f59e0b', '#06b6d4', '#f97316', '#14b8a6', '#d946ef',
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: { value: number; payload: { name?: string; description?: string }; name?: string; color: string }[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 shadow-2xl rounded-2xl text-white">
                <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-1">{label || payload[0].payload.name || payload[0].payload.description}</p>
                <p className="text-emerald-400 font-black text-xl tracking-tighter">
                    ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        );
    }
    return null;
};

const renderCustomLegend = (props: { payload?: readonly { color?: string; value?: string | number }[] }) => {
    const { payload } = props;
    return (
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-6">
            {payload?.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color || '#ccc' }} />
                    <span>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export function SpendingPieChart({ data }: { data: { name: string; value: number }[] }) {
    if (!data || data.length === 0) return null;
    
    return (
        <div className="h-80 w-full" style={{ minHeight: "320px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={6}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                        cornerRadius={8}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={renderCustomLegend} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TopTransactionsChart({ data }: { data: { description: string; amount: number }[] }) {
    if (!data || data.length === 0) return null;
    
    return (
        <div className="h-80 w-full" style={{ minHeight: "320px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                    <XAxis type="number" hide />
                    <YAxis 
                        type="category" 
                        dataKey="description" 
                        width={120} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                    <Bar 
                        dataKey="amount" 
                        radius={[0, 10, 10, 0]} 
                        barSize={20}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
