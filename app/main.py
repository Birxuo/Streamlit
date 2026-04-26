import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dotenv import load_dotenv
import os

from categorizer import categorize_transactions
from gap_finder import find_gaps
from processing import normalize_dataframe, detect_outliers, compute_monthly_trends, compute_summary_metrics
from insights import generate_insights

# Load environment variables
load_dotenv()

st.set_page_config(page_title="Gap Finder Intelligence Terminal", layout="wide", page_icon="💸")

st.title("💸 Gap Finder — Intelligence Terminal")
st.caption("Upload a bank statement to uncover hidden financial leaks with AI-powered analysis.")

# Sidebar - Controls
st.sidebar.header("Data Ingestion")
uploaded_file = st.sidebar.file_uploader("Upload CSV", type=["csv"])


def process_data(raw_df: pd.DataFrame):
    """Full pipeline: normalize → categorize → metrics → gaps → outliers → trends."""
    # Normalize the raw CSV to a standard schema
    df = normalize_dataframe(raw_df)

    # Categorize transactions
    df = categorize_transactions(df)

    # Compute summary metrics
    metrics = compute_summary_metrics(df)

    # Find gaps
    gaps = find_gaps(metrics["category_spending"], metrics["total_income"])

    # Detect outliers
    outlier_df = detect_outliers(df)

    # Monthly trends
    trends = compute_monthly_trends(df)

    return df, metrics, gaps, outlier_df, trends


# Load data based on user actions
data = None
if uploaded_file is not None:
    data = pd.read_csv(uploaded_file)
elif st.sidebar.button("Load Sample Data"):
    sample_path = os.path.join(os.path.dirname(__file__), "sample_data.csv")
    if os.path.exists(sample_path):
        data = pd.read_csv(sample_path)
    else:
        st.sidebar.error("Sample data file not found.")

if data is not None:
    df, metrics, gaps, outlier_df, trends = process_data(data)

    # ── Overview Metrics ───────────────────────────────────────────────
    st.subheader("Overview")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Income", f"${metrics['total_income']:,.2f}")
    col2.metric("Total Expenses", f"${metrics['total_expenses']:,.2f}")

    net = metrics["net_savings"]
    col3.metric("Net Savings", f"${net:,.2f}",
                delta=f"${net:,.2f}",
                delta_color="normal" if net >= 0 else "inverse")
    col4.metric("Savings Rate", f"{metrics['savings_rate']}%")

    st.markdown("---")

    # ── Charts ─────────────────────────────────────────────────────────
    st.subheader("Spending Visualization")
    chart_col1, chart_col2 = st.columns(2)

    spending = metrics["category_spending"]

    with chart_col1:
        st.write("**Spending by Category**")
        if spending:
            pie_df = pd.DataFrame(list(spending.items()), columns=["Category", "Amount"])
            pie_chart = px.pie(pie_df, values="Amount", names="Category", hole=0.4,
                               color_discrete_sequence=px.colors.qualitative.Set2)
            st.plotly_chart(pie_chart, use_container_width=True)

    with chart_col2:
        st.write("**Top 10 Expense Transactions**")
        expenses_df = df[df["amount"] < 0].copy()
        expenses_df["amount_abs"] = expenses_df["amount"].abs()
        top_tx = expenses_df.sort_values(by="amount_abs", ascending=False).head(10)
        if not top_tx.empty:
            bar_chart = px.bar(
                top_tx, x="description", y="amount_abs", color="category",
                labels={"amount_abs": "Amount ($)", "description": "Merchant"},
                color_discrete_sequence=px.colors.qualitative.Set2,
            )
            bar_chart.update_layout(xaxis_title=None)
            st.plotly_chart(bar_chart, use_container_width=True)

    st.markdown("---")

    # ── Monthly Trends ─────────────────────────────────────────────────
    if trends:
        st.subheader("Monthly Trends")
        trend_df = pd.DataFrame(trends)
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=trend_df["month"], y=trend_df["income"],
                                 mode="lines+markers", name="Income",
                                 line=dict(color="#10b981", width=3)))
        fig.add_trace(go.Scatter(x=trend_df["month"], y=trend_df["expenses"],
                                 mode="lines+markers", name="Expenses",
                                 line=dict(color="#ef4444", width=3)))
        fig.add_trace(go.Bar(x=trend_df["month"], y=trend_df["net"],
                             name="Net Savings", marker_color="#3b82f6", opacity=0.4))
        fig.update_layout(
            xaxis_title="Month", yaxis_title="Amount ($)",
            template="plotly_white", height=350,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        )
        st.plotly_chart(fig, use_container_width=True)
        st.markdown("---")

    # ── Outlier Alerts ─────────────────────────────────────────────────
    if not outlier_df.empty:
        st.subheader("⚠️ Outlier Transactions")
        st.caption("These transactions are statistically unusual compared to your normal spending patterns.")
        display_df = outlier_df[["date", "description", "amount", "category", "z_score"]].copy()
        display_df["amount"] = display_df["amount"].apply(lambda x: f"${abs(x):,.2f}")
        display_df.columns = ["Date", "Description", "Amount", "Category", "Anomaly Score"]
        st.dataframe(display_df, use_container_width=True, hide_index=True)
        st.markdown("---")

    # ── Gap Finder & AI Insights ───────────────────────────────────────
    st.subheader("Financial Gaps & AI Insights")

    if not gaps:
        st.success("You are within your budget benchmarks across all tracked categories!")
    else:
        for gap in gaps:
            severity_color = {"critical": "🔴", "high": "🟠", "moderate": "🟡"}.get(gap.get("severity", ""), "⚪")
            st.warning(
                f"{severity_color} **{gap['category']}** — "
                f"Spending ${gap['actual_amount']:,.2f} ({gap['actual_pct']}% of income) "
                f"vs benchmark of ${gap['benchmark_amount']:,.2f} ({gap['target_pct']}%). "
                f"Overspend: **${gap['overspend_amount']:,.2f}**"
            )

        with st.spinner("Generating AI insights..."):
            # Prepare top transactions for context
            expenses_df = df[df["amount"] < 0].copy()
            expenses_df["amount_abs"] = expenses_df["amount"].abs()
            top_tx = expenses_df.sort_values(by="amount_abs", ascending=False).head(15).to_dict("records")
            
            insights_md = generate_insights(
                spending_summary=spending, 
                income=metrics["total_income"], 
                flagged_categories=gaps,
                outliers=outlier_df.head(10).to_dict("records") if not outlier_df.empty else [],
                trends=trends,
                top_transactions=top_tx
            )
        st.info("AI-Powered Recommendations:")
        st.markdown(insights_md)

    st.markdown("---")

    # ── Savings Simulator ──────────────────────────────────────────────
    st.subheader("Savings Simulator")
    st.write("See how cutting back on your top spending category impacts your finances over a year.")

    if gaps:
        top_category = gaps[0]["category"]
        top_spend = gaps[0]["actual_amount"]

        st.write(f"Your top drain is **{top_category}** (${top_spend:.2f} this month).")

        cut_percent = st.slider(f"Cut {top_category} spending by:", min_value=0, max_value=100, value=20, format="%d%%")

        monthly_savings = top_spend * (cut_percent / 100.0)
        annual_savings = monthly_savings * 12
        # Compound growth at 7% annual return
        compound_5yr = sum(monthly_savings * 12 * (1.07 ** i) for i in range(5))

        scol1, scol2, scol3 = st.columns(3)
        scol1.metric("Monthly Savings", f"${monthly_savings:,.2f}")
        scol2.metric("Annual Savings", f"${annual_savings:,.2f}")
        scol3.metric("5-Year (7% return)", f"${compound_5yr:,.2f}")
    else:
        st.write("Select a category to simulate savings.")
        if spending:
            cat_list = list(spending.keys())
            sim_category = st.selectbox("Category", cat_list)
            cat_spend = spending[sim_category]
            cut_percent = st.slider(f"Cut {sim_category} spending by:", min_value=0, max_value=100, value=20, format="%d%%")
            monthly_savings = cat_spend * (cut_percent / 100.0)
            annual_savings = monthly_savings * 12
            compound_5yr = sum(monthly_savings * 12 * (1.07 ** i) for i in range(5))

            scol1, scol2, scol3 = st.columns(3)
            scol1.metric("Monthly Savings", f"${monthly_savings:,.2f}")
            scol2.metric("Annual Savings", f"${annual_savings:,.2f}")
            scol3.metric("5-Year (7% return)", f"${compound_5yr:,.2f}")
else:
    st.info("Upload a CSV file in the sidebar or click 'Load Sample Data' to begin.")
