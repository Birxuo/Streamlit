import os
import json
from openai import OpenAI
import streamlit as st

def generate_insights(
    spending_summary: dict, 
    income: float, 
    flagged_categories: list,
    outliers: list = None,
    trends: list = None,
    top_transactions: list = None
) -> str:
    """
    Call OpenRouter to perform deep financial analysis.
    This goes beyond simple summaries to identify psychological spending patterns,
    structural leaks, and long-term wealth impacts.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_openrouter_api_key_here":
        return _generate_dummy_insights(flagged_categories)

    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Prepare rich context for the LLM
        context = {
            "monthly_income": round(income, 2),
            "spending_by_category": spending_summary,
            "budget_violations": flagged_categories,
            "statistical_outliers": (outliers or [])[:5],
            "monthly_trends": (trends or [])[-3:], # Last 3 months
            "top_expense_items": (top_transactions or [])[:10]
        }
        
        system_prompt = """
You are an Elite Financial Intelligence Officer. Your goal is to find 'structural leaks' in financial data.
Do not just repeat the numbers. Analyze the relationships between categories.
Look for:
1. 'Death by a thousand cuts': High frequency, low-value spending.
2. 'Lifestyle Creep': Trends that show expenses growing faster than income.
3. 'Anomalous Spikes': Outliers that aren't just large, but statistically significant.
4. 'Psychological Gaps': Identifying categories that represent impulsive vs. planned spending.

Output your analysis in a structured, institutional format. Use Markdown for clarity.
"""

        user_prompt = f"""
Perform a deep-dive analysis on the following financial dataset:
{json.dumps(context, indent=2)}

Provide your analysis in the following sections:
### 💎 Executive Summary
A 2-sentence high-level assessment of financial health.

### 🔍 Structural Leaks (The 'Gaps')
Identify the 3 most significant financial drains. Explain WHY they are drains (contextualize with outliers and trends).

### 📈 Wealth Impact Projection
If these leaks are plugged, what is the 5-year opportunity cost (assuming 8% market return)?

### 🛠️ Strategic Action Plan
Provide 3 highly specific, non-obvious steps the user should take this week.

Be direct, analytical, and professional. No fluff.
"""

        response = client.chat.completions.create(
            model="anthropic/claude-3.5-sonnet", # Use a high-reasoning model
            temperature=0.3,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            extra_headers={
                "HTTP-Referer": "https://gapfinder.ai",
                "X-Title": "Streamlit Intelligence Engine",
            }
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"### ⚠️ Analysis Error\nCould not perform deep analysis: {str(e)}"

def _generate_dummy_insights(flagged_categories):
    """Fallback generator when API is not available."""
    if not flagged_categories:
         return "### ✅ Financial Health: Excellent\nYou are within your budget benchmarks across all categories. No structural leaks detected."
         
    dummy_output = "### 🔍 Potential Gaps (Mocked)\n\n"
    for gap in flagged_categories[:3]:
        dummy_output += f"**{gap['category']} Leak:** You are over benchmark by ${gap['overspend_amount']:.2f}.\n"
        dummy_output += f"- *Action:* Audit this category for recurring subscriptions or impulsive micro-transactions.\n\n"
        
    return dummy_output
