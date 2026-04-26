import pandas as pd
from typing import Dict, List

# Target maximum percentages per category based on net income (50/30/20 inspired)
BENCHMARKS: Dict[str, float] = {
    "Food": 0.15,
    "Subscriptions": 0.05,
    "Transport": 0.10,
    "Shopping": 0.10,
    "Utilities": 0.08,
    "Housing": 0.30,
    "Health": 0.05,
    "Entertainment": 0.05,
    "Education": 0.05,
}


def find_gaps(spending_by_category, monthly_income: float) -> List[Dict]:
    """
    Compare each category's spending (as a % of income) against benchmarks.
    Flag any category spending more than 1.5x its benchmark.
    Accepts either a pd.Series or a plain dict.
    """
    flagged_categories = []

    if isinstance(spending_by_category, pd.Series):
        items = spending_by_category.items()
    elif isinstance(spending_by_category, dict):
        items = spending_by_category.items()
    else:
        return []

    for category, amount in items:
        if category in BENCHMARKS and monthly_income > 0:
            target_pct = BENCHMARKS[category]
            limit_pct = target_pct * 1.5

            actual_pct = amount / monthly_income

            if actual_pct > limit_pct:
                benchmark_amount = target_pct * monthly_income
                overspend_amount = amount - benchmark_amount
                severity = "critical" if actual_pct > target_pct * 3 else (
                    "high" if actual_pct > target_pct * 2 else "moderate"
                )

                flagged_categories.append({
                    "category": category,
                    "actual_amount": round(amount, 2),
                    "benchmark_amount": round(benchmark_amount, 2),
                    "overspend_amount": round(overspend_amount, 2),
                    "actual_pct": round(actual_pct * 100, 1),
                    "target_pct": round(target_pct * 100, 1),
                    "severity": severity,
                })

    # Sort by overspend amount descending
    flagged_categories.sort(key=lambda x: x["overspend_amount"], reverse=True)
    return flagged_categories
