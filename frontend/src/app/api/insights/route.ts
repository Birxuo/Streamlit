import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { spendingSummary, income, flaggedCategories, outliers, trends, topTransactions } = body;

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey === "your_openrouter_api_key_here") {
            return NextResponse.json({
                error: "No OpenRouter API key found. Using mock response.",
                insights: dummyInsights(flaggedCategories)
            });
        }

        const client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: apiKey,
        });

        const context = {
            monthly_income: income,
            spending_by_category: spendingSummary,
            budget_violations: flaggedCategories,
            statistical_outliers: (outliers || []).slice(0, 5),
            monthly_trends: (trends || []).slice(-3),
            top_expense_items: (topTransactions || []).slice(0, 10)
        };

        const systemPrompt = `
You are an Elite Financial Intelligence Officer. Your goal is to find 'structural leaks' in financial data.
Analyze the relationships between categories and identifying high-frequency low-value spending vs. anomalous spikes.
Be direct, analytical, and professional.
`;

        const userPrompt = `
Perform a deep-dive analysis on the following financial dataset:
${JSON.stringify(context, null, 2)}

Identify the top 3-4 strategic 'Gaps' (structural leaks). For each:
1. Category Name.
2. Contextualized Overspend (explain WHY it is a leak based on outliers or trends).
3. Strategic, Non-Obvious Action Plan (a specific step to take this week).
4. Long-term Wealth Impact (Annualized savings + 5yr compound interest at 7%).

Format the output strictly as a JSON array of objects. Each object MUST have keys:
"category", "overspend", "recommendation", "annual_savings"

Ensure the 'recommendation' is a deep analysis, not a generic tip.
`;

        const response = await client.chat.completions.create({
            model: "anthropic/claude-3.5-sonnet", // Use a high-reasoning model
            temperature: 0.3,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            extra_headers: {
                "HTTP-Referer": "https://gapfinder.ai",
                "X-Title": "Streamlit Intelligence Engine",
            }
        });

        const content = response.choices[0].message.content || "[]";

        let parsed = [];
        try {
            let clean = content;
            if (clean.includes("```json")) {
                clean = clean.split("```json")[1].split("```")[0];
            } else if (clean.includes("```")) {
                clean = clean.split("```")[1].split("```")[0];
            }
            parsed = JSON.parse(clean.trim());
        } catch (e) {
            console.error("Failed to parse JSON", e, content);
            parsed = [];
        }

        return NextResponse.json({ insights: parsed });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function dummyInsights(flaggedCategories: { category: string; overspend_amount: number }[]) {
    if (!flaggedCategories || flaggedCategories.length === 0) return [];
    return flaggedCategories.slice(0, 3).map(f => ({
        category: f.category,
        overspend: f.overspend_amount.toFixed(2),
        recommendation: `Structural analysis indicates that your ${f.category.toLowerCase()} spending is diverging from your income growth. Consider a 'Zero-Based' audit of this category. (Mock response)`,
        annual_savings: (f.overspend_amount * 12).toFixed(2)
    }));
}
