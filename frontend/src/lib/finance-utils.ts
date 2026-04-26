export const CATEGORIES: Record<string, string[]> = {
    "Food": ["restaurant", "cafe", "mcdonalds", "uber eats", "deliveroo", "supermarket", "grocery", "bistro", "market", "taco", "pizza", "burger", "grill", "coffee", "deli", "bakery", "walmart", "target", "whole foods", "kroger", "trader joe's", "starbucks", "costa", "dunkin", "chipotle", "subway", "dominos", "chick-fil-a", "kfc", "wendy's", "doordash", "grubhub", "postmates", "aldi", "lidl", "publix", "safeway", "costco"],
    "Transport": ["uber", "bolt", "fuel", "parking", "train", "bus", "taxi", "chevron", "shell", "exxon", "mobil", "transit", "lyft", "amtrak", "subway", "station", "tolls", "towing", "airline", "flight", "delta", "united", "southwest", "jetblue", "spirit", "frontier", "bp", "texaco", "marathon"],
    "Subscriptions": ["netflix", "spotify", "amazon prime", "apple", "google", "youtube", "gym", "hbo", "hulu", "disney+", "peleton", "member", "club", "magazine", "patreon", "subscript", "dropbox", "icloud", "adobe", "creative cloud", "canva", "apple music", "tidal", "audible", "paramount", "peacock", "apple tv"],
    "Utilities": ["electricity", "water", "internet", "phone", "telecom", "utility", "bill", "power", "gas", "verizon", "at&t", "t-mobile", "comcast", "centurylink", "sewer", "trash", "waste", "spectrum", "cox", "xfinity", "cricket", "mint mobile", "broadband", "energy"],
    "Shopping": ["amazon", "zara", "h&m", "jumia", "shein", "clothing", "store", "mall", "boutique", "apparel", "shoes", "best buy", "macys", "nordstrom", "ikea", "homedepot", "cvs", "walgreens", "ebay", "etsy", "old navy", "gap", "uniqlo", "wayfair", "lowe's", "newegg", "micro center"],
    "Housing": ["rent", "mortgage", "apartment", "lease", "home", "condo", "hoa", "estate", "realty", "property", "insurance", "taxes", "landlord", "tenant"],
    "Health": ["pharmacy", "doctor", "hospital", "clinic", "dental", "vision", "medical", "health", "fitness", "therapy", "care", "prescription", "urgent care", "copay", "deductible"],
    "Income": ["payroll", "salary", "deposit", "dividend", "interest", "transfer from", "refund", "reimbursement", "paycheck", "direct dep", "bonus", "revenue", "commission", "freelance", "cashback", "rebate"],
    "Entertainment": ["cinema", "movie", "theater", "theatre", "amc", "concert", "ticket", "ticketmaster", "stubhub", "gaming", "steam", "playstation", "xbox", "nintendo", "bar", "pub", "nightclub", "lounge", "brewery", "wine", "beer", "liquor"],
    "Education": ["tuition", "university", "college", "school", "course", "udemy", "coursera", "skillshare", "masterclass", "textbook", "student loan", "scholarship"],
};

export const BENCHMARKS: Record<string, number> = {
    "Food": 0.15,
    "Subscriptions": 0.05,
    "Transport": 0.10,
    "Shopping": 0.10,
    "Utilities": 0.08,
    "Housing": 0.30,
    "Health": 0.05,
    "Entertainment": 0.05,
    "Education": 0.05,
};

export interface Transaction {
    date: string;
    description: string;
    amount: number;
    category: string;
}

export interface Trend {
    month: string;
    income: number;
    expenses: number;
    net: number;
}

export interface Outlier extends Transaction {
    z_score: number;
}

export interface FlaggedCategory {
    category: string;
    actual_amount: number;
    benchmark_amount: number;
    overspend_amount: number;
    actual_pct: number;
    target_pct: number;
    severity: string;
}

function categorizeDesc(desc: string, amountVal: number): string {
    const lowerDesc = desc.toLowerCase();
    let category = "Other";
        
    for (const [catName, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(kw => lowerDesc.includes(kw))) {
            category = catName;
            break;
        }
    }
        
    if (category === "Income" && amountVal < 0) category = "Other";
    return category;
}

export function categorizeTransactions(records: Record<string, string | number>[]): Transaction[] {
    if (!records || records.length === 0) return [];
    
    const keys = Object.keys(records[0]);
    // Fuzzy matching for columns to support "real bank data" like finance.csv
    const dateKey = keys.find(k => /date|time|year|period/i.test(k)) || keys[0];
    const descKey = keys.find(k => /desc|memo|name|payee|state|store|merchant|particulars/i.test(k)) || keys[1];
    
    // Find all likely amount columns for potential unpivoting
    const amountKeys = keys.filter(k => /amount|total|expenditure|cost|price|value|debit|revenue|income/i.test(k));
    
    const transactions: Transaction[] = [];

    records.forEach(record => {
        let dateVal = "";
        let baseDesc = "";

        if (descKey) baseDesc = (record[descKey] || "").toString();
        if (dateKey) dateVal = (record[dateKey] || "").toString();
        
        if (amountKeys.length <= 1) {
            // Standard single-amount transaction
            const amtKey = amountKeys[0] || keys[2];
            let amountVal = 0;
            if (amtKey) {
                const rawAmt = (record[amtKey] || "0").toString();
                amountVal = parseFloat(rawAmt.replace(/[^0-9.-]/g, "")) || 0;
            }
            if (/expenditure|debit|cost/i.test(amtKey) && amountVal > 0) amountVal = -amountVal;
            
            if (amountVal !== 0) {
                transactions.push({ date: dateVal, description: baseDesc, amount: amountVal, category: categorizeDesc(baseDesc, amountVal) });
            }
        } else {
            // Unpivot multi-amount columns to handle cross-sectional macro data
            amountKeys.forEach(amtKey => {
                const rawAmt = (record[amtKey] || "0").toString();
                let amountVal = parseFloat(rawAmt.replace(/[^0-9.-]/g, "")) || 0;
                
                if (amountVal !== 0) {
                    if (/expenditure|debit|cost/i.test(amtKey) && amountVal > 0) amountVal = -amountVal;
                    const specificDesc = `${baseDesc} - ${amtKey}`;
                    transactions.push({ date: dateVal, description: specificDesc, amount: amountVal, category: categorizeDesc(specificDesc, amountVal) });
                }
            });
        }
    });

    return transactions;
}

export function findGaps(spendingByCategory: Record<string, number>, monthlyIncome: number): FlaggedCategory[] {
    const flaggedCategories: FlaggedCategory[] = [];
    
    for (const [category, amount] of Object.entries(spendingByCategory)) {
        if (BENCHMARKS[category] && monthlyIncome > 0) {
            const targetPct = BENCHMARKS[category];
            const limitPct = targetPct * 1.5;
            const actualPct = amount / monthlyIncome;
            
            if (actualPct > limitPct) {
                const benchmarkAmount = targetPct * monthlyIncome;
                const severity = actualPct > targetPct * 3 ? "critical" : actualPct > targetPct * 2 ? "high" : "moderate";

                flaggedCategories.push({
                    category,
                    actual_amount: amount,
                    benchmark_amount: benchmarkAmount,
                    overspend_amount: amount - benchmarkAmount,
                    actual_pct: actualPct,
                    target_pct: targetPct,
                    severity,
                });
            }
        }
    }
    
    return flaggedCategories.sort((a, b) => b.overspend_amount - a.overspend_amount);
}

export function computeMonthlyTrends(transactions: Transaction[]): Trend[] {
    const trends: Record<string, { income: number; expenses: number; net: number }> = {};
    
    transactions.forEach(tx => {
        if (!tx.date) return;
        const date = new Date(tx.date);
        if (isNaN(date.getTime())) return;
        
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!trends[month]) {
            trends[month] = { income: 0, expenses: 0, net: 0 };
        }
        
        if (tx.amount > 0) trends[month].income += tx.amount;
        else trends[month].expenses += Math.abs(tx.amount);
        trends[month].net = trends[month].income - trends[month].expenses;
    });
    
    return Object.entries(trends)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));
}

export function detectOutliers(transactions: Transaction[], threshold = 2.5): Outlier[] {
    const expenses = transactions.filter(t => t.amount < 0).map(t => Math.abs(t.amount));
    if (expenses.length < 3) return [];
    
    const sorted = [...expenses].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const mads = expenses.map(e => Math.abs(e - median));
    const sortedMads = [...mads].sort((a, b) => a - b);
    const mad = sortedMads[Math.floor(sortedMads.length / 2)];
    
    if (mad === 0) return [];
    
    return transactions
        .filter(t => t.amount < 0)
        .map(t => {
            const zScore = (0.6745 * (Math.abs(t.amount) - median)) / mad;
            return { ...t, z_score: Number(zScore.toFixed(2)) };
        })
        .filter(t => Math.abs(t.z_score) > threshold)
        .sort((a, b) => b.z_score - a.z_score);
}
