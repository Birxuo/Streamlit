"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Transaction, FlaggedCategory } from "@/lib/finance-utils";

interface FinanceData {
  income: number;
  expenses: number;
  savings: number;
  categoryGroup: { name: string; value: number }[];
  topTransactions: (Transaction & { amount: number })[];
  flagged: FlaggedCategory[];
  allTransactions: Transaction[];
}

interface FinanceContextType {
  data: FinanceData | null;
  setData: (data: FinanceData | null) => void;
  insights: any[] | null;
  setInsights: (insights: any[] | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData | null>(null);
  const [insights, setInsights] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <FinanceContext.Provider value={{ data, setData, insights, setInsights, loading, setLoading }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
