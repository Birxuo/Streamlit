"""
Streamlit — FastAPI Intelligence Engine

Provides REST endpoints for the Next.js frontend and any external consumers.
Run with: uvicorn app.api:app --reload --port 8000
"""

import io
import json
import os

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from dotenv import load_dotenv

from categorizer import categorize_transactions
from gap_finder import find_gaps
from processing import (
    normalize_dataframe,
    detect_outliers,
    compute_monthly_trends,
    compute_summary_metrics,
)
from insights import generate_insights

# Load environment variables from root .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(
    title="Streamlit Intelligence Engine",
    description="AI-powered financial analysis API",
    version="2.0.0",
)

# Allow the Next.js frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────

class InsightsRequest(BaseModel):
    spending_summary: Dict[str, float]
    income: float
    flagged_categories: List[Dict]
    outliers: Optional[List[Dict]] = None
    trends: Optional[List[Dict]] = None
    top_transactions: Optional[List[Dict]] = None


class AnalysisResponse(BaseModel):
    metrics: Dict
    category_spending: Dict[str, float]
    gaps: List[Dict]
    outliers: List[Dict]
    monthly_trends: List[Dict]
    transactions: List[Dict]


# ── Health Check ───────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "Streamlit Intelligence Engine",
        "version": "2.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


# ── Core Analysis Endpoint ─────────────────────────────────────────────

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_transactions(file: UploadFile = File(...)):
    """
    Accepts a CSV upload and returns the full analysis:
    metrics, categorized transactions, gaps, outliers, and monthly trends.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        contents = await file.read()
        text = contents.decode("utf-8")
        raw_df = pd.read_csv(io.StringIO(text))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if raw_df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    # 1. Normalize the raw data
    df = normalize_dataframe(raw_df)

    # 2. Categorize
    df = categorize_transactions(df)

    # 3. Compute summary metrics
    metrics = compute_summary_metrics(df)

    # 4. Find gaps
    gaps = find_gaps(metrics["category_spending"], metrics["total_income"])

    # 5. Detect outliers
    outlier_df = detect_outliers(df)
    outliers = []
    if not outlier_df.empty:
        outliers = outlier_df[["date", "description", "amount", "category", "z_score"]].to_dict("records")
        # Convert dates to strings for JSON serialization
        for o in outliers:
            o["date"] = str(o["date"]) if o["date"] is not None else ""

    # 6. Monthly trends
    trends = compute_monthly_trends(df)

    # 7. Prepare transaction list
    tx_list = df.head(200).to_dict("records")
    for tx in tx_list:
        tx["date"] = str(tx["date"]) if tx["date"] is not None else ""

    return AnalysisResponse(
        metrics=metrics,
        category_spending=metrics["category_spending"],
        gaps=gaps,
        outliers=outliers,
        monthly_trends=trends,
        transactions=tx_list,
    )


# ── AI Insights Endpoint ──────────────────────────────────────────────

@app.post("/insights")
async def get_insights(request: InsightsRequest):
    """
    Generates AI-powered financial insights using OpenRouter LLMs.
    """
    try:
        result = generate_insights(
            spending_summary=request.spending_summary,
            income=request.income,
            flagged_categories=request.flagged_categories,
            outliers=request.outliers,
            trends=request.trends,
            top_transactions=request.top_transactions,
        )
        return {"insights": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Quick Analyze from JSON (for frontend integration) ─────────────────

class TransactionBatch(BaseModel):
    transactions: List[Dict]


@app.post("/analyze-json")
async def analyze_json(batch: TransactionBatch):
    """
    Accepts a JSON array of transactions (already parsed client-side)
    and returns analysis results without file upload.
    """
    if not batch.transactions:
        raise HTTPException(status_code=400, detail="No transactions provided.")

    df = pd.DataFrame(batch.transactions)

    # Normalize if needed
    if "amount" in df.columns:
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Categorize
    df = categorize_transactions(df)

    # Metrics
    metrics = compute_summary_metrics(df)
    gaps = find_gaps(metrics["category_spending"], metrics["total_income"])
    outlier_df = detect_outliers(df)
    outliers = []
    if not outlier_df.empty:
        outliers = outlier_df[["date", "description", "amount", "category", "z_score"]].to_dict("records")
        for o in outliers:
            o["date"] = str(o["date"]) if o["date"] is not None else ""

    trends = compute_monthly_trends(df)

    return {
        "metrics": metrics,
        "gaps": gaps,
        "outliers": outliers,
        "monthly_trends": trends,
    }
