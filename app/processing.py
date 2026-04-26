import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional


def clean_amount(raw: str) -> float:
    """Parses a numeric amount from a string, handling currency symbols and negatives.

    Args:
        raw: The raw string from a CSV cell (e.g., "$1,234.56", "(500.00)", "20-").

    Returns:
        The parsed float value. Expenses are always returned as negative floats, 
        and income as positive floats.
    """
    s = str(raw).strip()
    if not s or s.lower() in ("nan", "none", ""):
        return 0.0

    is_negative = False
    # Parenthetical negatives: (500.00)
    if s.startswith("(") and s.endswith(")"):
        s = s[1:-1]
        is_negative = True

    # Strip common currency prefixes/suffixes
    s = s.replace("$", "").replace("£", "").replace("€", "").replace("¥", "")
    s = s.replace(",", "").strip()

    # Check for trailing minus like "500.00-"
    if s.endswith("-"):
        s = s[:-1]
        is_negative = True

    try:
        val = float(s)
    except ValueError:
        return 0.0

    return -abs(val) if is_negative else val


def auto_detect_columns(df: pd.DataFrame) -> Dict[str, str]:
    """Heuristically maps raw DataFrame columns to standard names: date, description, amount.

    Args:
        df: The raw pandas DataFrame from a CSV.

    Returns:
        A dictionary mapping standard keys ('date', 'description', 'amount') 
        to the actual column names found in the DataFrame.
    """
    import re
    columns = list(df.columns)
    mapping: Dict[str, Optional[str]] = {"date": None, "description": None, "amount": None}

    date_pattern = re.compile(r"date|time|period|year|month|day|when|trans.*date", re.IGNORECASE)
    desc_pattern = re.compile(r"desc|memo|name|payee|merchant|store|particulars|narration|detail|reference", re.IGNORECASE)
    amount_pattern = re.compile(r"amount|total|expenditure|cost|price|value|debit|credit|revenue|income|balance|sum", re.IGNORECASE)

    for col in columns:
        if not mapping["date"] and date_pattern.search(col):
            mapping["date"] = col
        elif not mapping["description"] and desc_pattern.search(col):
            mapping["description"] = col
        elif not mapping["amount"] and amount_pattern.search(col):
            mapping["amount"] = col

    # Fallback to positional columns
    if not mapping["date"] and len(columns) > 0:
        mapping["date"] = columns[0]
    if not mapping["description"] and len(columns) > 1:
        mapping["description"] = columns[1]
    if not mapping["amount"] and len(columns) > 2:
        mapping["amount"] = columns[2]

    return {k: v for k, v in mapping.items() if v is not None}


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalizes an arbitrary bank CSV into a standard schema:
    [date, description, amount]
    """
    col_map = auto_detect_columns(df)

    normalized = pd.DataFrame()
    normalized["date"] = pd.to_datetime(df[col_map.get("date", df.columns[0])], errors="coerce")
    normalized["description"] = df[col_map.get("description", df.columns[1])].astype(str).str.strip()

    raw_amounts = df[col_map.get("amount", df.columns[2])]
    normalized["amount"] = raw_amounts.apply(clean_amount)

    # If the column name suggests it's always an expense, flip sign
    amt_col_name = col_map.get("amount", "").lower()
    if any(kw in amt_col_name for kw in ("expenditure", "debit", "cost", "expense")):
        normalized["amount"] = normalized["amount"].apply(lambda x: -abs(x) if x > 0 else x)

    # Drop rows with zero amount
    normalized = normalized[normalized["amount"] != 0].reset_index(drop=True)
    return normalized


def detect_outliers(df: pd.DataFrame, column: str = "amount", threshold: float = 2.5) -> pd.DataFrame:
    """
    Detects outlier transactions using a modified Z-score method.
    Only evaluates expenses (negative amounts).
    Returns a dataframe of flagged transactions with their z-scores.
    """
    expenses = df[df[column] < 0].copy()
    if len(expenses) < 3:
        return pd.DataFrame()

    abs_amounts = expenses[column].abs()
    median = abs_amounts.median()
    # Median Absolute Deviation (MAD)
    mad = np.median(np.abs(abs_amounts - median))

    if mad == 0:
        # Fallback to standard deviation if MAD is zero
        std = abs_amounts.std()
        if std == 0:
            return pd.DataFrame()
        z_scores = (abs_amounts - abs_amounts.mean()) / std
    else:
        # Modified Z-score
        z_scores = 0.6745 * (abs_amounts - median) / mad

    expenses["z_score"] = z_scores.round(2)
    outliers = expenses[expenses["z_score"].abs() > threshold].copy()
    outliers = outliers.sort_values("z_score", ascending=False)

    return outliers


def compute_monthly_trends(df: pd.DataFrame) -> List[Dict]:
    """
    Groups transactions by month and returns a time series of
    monthly income, expenses, and net savings.
    """
    if "date" not in df.columns:
        return []

    df_copy = df.copy()
    df_copy["month"] = df_copy["date"].dt.to_period("M")

    trends = []
    for period, group in df_copy.groupby("month"):
        income = group[group["amount"] > 0]["amount"].sum()
        expenses = group[group["amount"] < 0]["amount"].abs().sum()
        trends.append({
            "month": str(period),
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "net": round(income - expenses, 2),
        })

    return sorted(trends, key=lambda x: x["month"])


def compute_summary_metrics(df: pd.DataFrame) -> Dict:
    """
    Computes high-level financial metrics from the transaction dataframe.
    """
    income_df = df[df["amount"] > 0]
    expenses_df = df[df["amount"] < 0]

    total_income = income_df["amount"].sum()
    total_expenses = expenses_df["amount"].abs().sum()
    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    # Category breakdown
    category_spending = (
        expenses_df.groupby("category")["amount"]
        .apply(lambda x: abs(x).sum())
        .sort_values(ascending=False)
        .to_dict()
    )

    # Average transaction size
    avg_expense = expenses_df["amount"].abs().mean() if len(expenses_df) > 0 else 0

    # Transaction count by category
    category_counts = expenses_df["category"].value_counts().to_dict()

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": round(savings_rate, 1),
        "category_spending": category_spending,
        "category_counts": category_counts,
        "avg_expense": round(avg_expense, 2),
        "transaction_count": len(df),
        "expense_count": len(expenses_df),
        "income_count": len(income_df),
    }
