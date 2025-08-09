"""
Portfolio Analytics API - FastAPI Backend
A comprehensive portfolio management API that reads data from Excel files using Polars
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import asyncio
from datetime import datetime
import polars as pl
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="Portfolio Analytics API",
    description="A comprehensive portfolio management API for WealthManager.online",
    version="1.0.0",
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API responses
class HoldingItem(BaseModel):
    symbol: str
    name: str
    quantity: int
    avgPrice: float
    currentPrice: float
    sector: str
    marketCap: str
    value: float
    gainLoss: float
    gainLossPercent: float


class AllocationItem(BaseModel):
    value: float
    percentage: float


class PerformanceTimeline(BaseModel):
    date: str
    portfolio: float
    nifty50: float
    gold: float


class PerformanceReturns(BaseModel):
    month1: float
    months3: float
    year1: float


class PerformanceData(BaseModel):
    timeline: List[PerformanceTimeline]
    returns: Dict[str, PerformanceReturns]


class TopPerformer(BaseModel):
    symbol: str
    name: str
    gainPercent: Optional[float] = None
    value: Optional[float] = None


class PortfolioSummary(BaseModel):
    totalValue: float
    totalInvested: float
    totalGainLoss: float
    totalGainLossPercent: float
    topPerformer: TopPerformer
    worstPerformer: TopPerformer
    highestValue: TopPerformer
    lowestValue: TopPerformer
    diversificationScore: float
    riskLevel: str


class MarketCapItem(BaseModel):
    marketCap: str
    value: float
    percentage: float


# Global data cache - will be loaded from Excel on startup
DATA_CACHE = {
    "holdings": None,
    "historical_performance": None,
    "sector_allocation": None,
    "market_cap": None,
    "top_performers": None,
    "summary": None,
}

# File path for the Excel data
EXCEL_FILE_PATH = "../data/Sample Portfolio Dataset for Assignment.xlsx"


async def load_excel_data():
    """Load all data from Excel file using Polars"""
    try:
        # Check if file exists first
        if not Path(EXCEL_FILE_PATH).exists():
            print(f"❌ Excel file not found at: {EXCEL_FILE_PATH}")
            return False

        print(f"📁 Loading data from: {EXCEL_FILE_PATH}")

        # Load Holdings sheet with error handling
        try:
            holdings_df = pl.read_excel(
                EXCEL_FILE_PATH,
                sheet_name="Holdings",
                has_header=True,
                engine="openpyxl",  # Specify engine explicitly
            )
            print("✅ Holdings sheet loaded successfully")
        except Exception as e:
            print(f"❌ Error loading Holdings sheet: {e}")
            # Try alternative approach using pandas as fallback
            try:
                import pandas as pd

                holdings_pd = pd.read_excel(EXCEL_FILE_PATH, sheet_name="Holdings")
                holdings_df = pl.from_pandas(holdings_pd)
                print("✅ Holdings sheet loaded using pandas fallback")
            except Exception as e2:
                print(f"❌ Pandas fallback also failed: {e2}")
                return False

        # Clean column names (remove special characters, spaces)
        holdings_columns = holdings_df.columns
        print(f"📋 Holdings columns found: {holdings_columns}")

        # Create a mapping for column names (handle variations)
        column_mapping = {}
        for col in holdings_columns:
            col_lower = col.lower().strip()
            if "avg" in col_lower and "price" in col_lower:
                column_mapping[col] = "avg_price"
            elif "current" in col_lower and "price" in col_lower:
                column_mapping[col] = "current_price"
            elif "value" in col_lower and "₹" in col:
                column_mapping[col] = "value"
            elif "gain" in col_lower and "loss" in col_lower and "₹" in col:
                column_mapping[col] = "gain_loss"
            elif "gain" in col_lower and "loss" in col_lower and "%" in col:
                column_mapping[col] = "gain_loss_percent"
            elif "company" in col_lower and "name" in col_lower:
                column_mapping[col] = "company_name"
            elif "market" in col_lower and "cap" in col_lower:
                column_mapping[col] = "market_cap"

        # Apply column renaming
        for old_name, new_name in column_mapping.items():
            holdings_df = holdings_df.rename({old_name: new_name})

        print(f"🔄 Column mapping applied: {column_mapping}")

        # Convert to list of dictionaries for API responses
        holdings_data = []
        for row in holdings_df.iter_rows(named=True):
            try:
                # Skip empty rows
                symbol = row.get("Symbol") or row.get("symbol")
                if not symbol:
                    continue

                # Extract values with fallbacks
                company_name = (
                    row.get("company_name")
                    or row.get("Company Name")
                    or row.get("name", "")
                )
                quantity = row.get("Quantity") or row.get("quantity", 0)
                avg_price = row.get("avg_price") or row.get("avgPrice", 0)
                current_price = row.get("current_price") or row.get("currentPrice", 0)
                sector = row.get("Sector") or row.get("sector", "")
                market_cap = row.get("market_cap") or row.get("Market Cap", "")
                value = row.get("value") or row.get("Value", 0)
                gain_loss = row.get("gain_loss") or row.get("gainLoss", 0)
                gain_loss_percent = row.get("gain_loss_percent") or row.get(
                    "gainLossPercent", 0
                )

                # Convert and validate data types
                holdings_data.append(
                    {
                        "symbol": str(symbol),
                        "name": str(company_name),
                        "quantity": int(float(quantity)) if quantity else 0,
                        "avgPrice": float(avg_price) if avg_price else 0.0,
                        "currentPrice": float(current_price) if current_price else 0.0,
                        "sector": str(sector),
                        "marketCap": str(market_cap),
                        "value": float(value) if value else 0.0,
                        "gainLoss": float(gain_loss) if gain_loss else 0.0,
                        "gainLossPercent": (
                            float(gain_loss_percent) * 100
                            if gain_loss_percent and abs(gain_loss_percent) <= 1
                            else float(gain_loss_percent) if gain_loss_percent else 0.0
                        ),
                    }
                )

            except Exception as row_error:
                print(f"⚠️ Error processing row {row}: {row_error}")
                continue

        print(f"✅ Processed {len(holdings_data)} holdings records")
        DATA_CACHE["holdings"] = holdings_data

        # Load Historical Performance sheet
        performance_df = pl.read_excel(
            EXCEL_FILE_PATH, sheet_name="Historical_Performance", has_header=True
        )

        # Clean column names
        performance_df = performance_df.rename(
            {
                "Portfolio Value (₹)": "portfolio_value",
                "Nifty 50": "nifty50",
                "Gold (₹/10g)": "gold",
            }
        )

        performance_data = []
        for row in performance_df.iter_rows(named=True):
            date_val = row.get("Date") or row.get("date")
            if date_val:
                date_str = (
                    date_val.strftime("%Y-%m-%d")
                    if hasattr(date_val, "strftime")
                    else str(date_val)[:10]
                )
                performance_data.append(
                    {
                        "date": date_str,
                        "portfolio": (
                            float(row.get("portfolio_value", 0))
                            if row.get("portfolio_value")
                            else 0.0
                        ),
                        "nifty50": (
                            float(row.get("nifty50", 0)) if row.get("nifty50") else 0.0
                        ),
                        "gold": float(row.get("gold", 0)) if row.get("gold") else 0.0,
                    }
                )

        print("▶ Historical performance loaded. Rows:", len(performance_data))
        DATA_CACHE["historical_performance"] = performance_data

        # Load Sector Allocation sheet
        sector_df = pl.read_excel(
            EXCEL_FILE_PATH, sheet_name="Sector_Allocation", has_header=True
        )

        sector_df = sector_df.rename({"Value (₹)": "value"})

        sector_data = {}
        for row in sector_df.iter_rows(named=True):
            if row["Sector"]:
                sector_data[row["Sector"]] = {
                    "value": float(row["value"]) if row["value"] else 0.0,
                    "percentage": (
                        float(row["Percentage"]) * 100 if row["Percentage"] else 0.0
                    ),
                }

        DATA_CACHE["sector_allocation"] = sector_data

        # Load Market Cap sheet
        market_cap_df = pl.read_excel(
            EXCEL_FILE_PATH, sheet_name="Market_Cap", has_header=True
        )

        market_cap_df = market_cap_df.rename(
            {"Market Cap": "market_cap", "Value (₹)": "value"}
        )

        market_cap_data = {}
        for row in market_cap_df.iter_rows(named=True):
            if row["market_cap"]:
                # Handle the string value format from Excel
                value_str = str(row["value"]).replace(",", "").replace("₹", "").strip()
                try:
                    value = float(value_str) if value_str and value_str != "0" else 0.0
                except:
                    value = 0.0

                market_cap_data[row["market_cap"]] = {
                    "value": value,
                    "percentage": (
                        float(row["Percentage"]) * 100 if row["Percentage"] else 0.0
                    ),
                }

        DATA_CACHE["market_cap"] = market_cap_data

        # Load Summary sheet
        summary_df = pl.read_excel(
            EXCEL_FILE_PATH, sheet_name="Summary", has_header=True
        )

        summary_data = {}
        for row in summary_df.iter_rows(named=True):
            if row["Metric"]:
                metric_name = row["Metric"]
                value = row["Value"]

                # Clean up value formatting
                if isinstance(value, str):
                    value = value.replace(",", "").replace("₹", "").strip()
                    try:
                        value = float(value)
                    except:
                        pass

                summary_data[metric_name] = value

        DATA_CACHE["summary"] = summary_data

        # Load Top Performers sheet
        top_performers_df = pl.read_excel(
            EXCEL_FILE_PATH, sheet_name="Top_Performers", has_header=True
        )

        top_performers_data = {}
        for row in top_performers_df.iter_rows(named=True):
            if row["Metric"]:
                metric = row["Metric"]
                perf = row["Performance"]

                # Clean numeric strings with commas
                if isinstance(perf, str):
                    perf_clean = perf.replace(",", "").replace("₹", "").strip()
                    try:
                        perf = float(perf_clean)
                    except:
                        pass  # keep as string if not convertible

                top_performers_data[metric] = {
                    "symbol": row["Symbol"],
                    "name": row["Company Name"],
                    "performance": perf,
                }

        DATA_CACHE["top_performers"] = top_performers_data

        print("✅ Successfully loaded data from Excel file")
        return True

    except Exception as e:
        print(f"❌ Error loading Excel data: {str(e)}")
        return False


async def ensure_data_loaded():
    """Ensure data is loaded from Excel file"""
    if DATA_CACHE["holdings"] is None:
        success = await load_excel_data()
        if not success:
            raise HTTPException(
                status_code=500, detail="Failed to load data from Excel file"
            )


# Utility functions
async def calculate_allocation_by_sector() -> Dict[str, AllocationItem]:
    """Calculate portfolio allocation by sector using loaded data"""
    if DATA_CACHE["sector_allocation"]:
        return {
            sector: AllocationItem(
                value=data["value"], percentage=round(data["percentage"], 1)
            )
            for sector, data in DATA_CACHE["sector_allocation"].items()
        }

    # Fallback: calculate from holdings data
    holdings_data = DATA_CACHE["holdings"]
    if not holdings_data:
        return {}

    sector_totals = {}
    total_value = sum(holding["value"] for holding in holdings_data)

    for holding in holdings_data:
        sector = holding["sector"]
        if sector not in sector_totals:
            sector_totals[sector] = 0
        sector_totals[sector] += holding["value"]

    return {
        sector: AllocationItem(
            value=value, percentage=round((value / total_value) * 100, 1)
        )
        for sector, value in sector_totals.items()
    }


async def calculate_allocation_by_market_cap() -> Dict[str, AllocationItem]:
    """Calculate portfolio allocation by market cap using loaded data"""
    if DATA_CACHE["market_cap"]:
        return {
            cap: AllocationItem(
                value=data["value"], percentage=round(data["percentage"], 1)
            )
            for cap, data in DATA_CACHE["market_cap"].items()
            if data["value"] > 0  # Only include non-zero allocations
        }

    # Fallback: calculate from holdings data
    holdings_data = DATA_CACHE["holdings"]
    if not holdings_data:
        return {}

    cap_totals = {}
    total_value = sum(holding["value"] for holding in holdings_data)

    for holding in holdings_data:
        market_cap = holding["marketCap"]
        if market_cap not in cap_totals:
            cap_totals[market_cap] = 0
        cap_totals[market_cap] += holding["value"]

    return {
        cap: AllocationItem(
            value=value, percentage=round((value / total_value) * 100, 1)
        )
        for cap, value in cap_totals.items()
    }


async def calculate_performance_returns() -> Dict[str, PerformanceReturns]:
    """Calculate performance returns for different time periods using loaded data"""
    timeline_data = DATA_CACHE["historical_performance"]
    if not timeline_data or len(timeline_data) < 2:
        return {}

    current = timeline_data[-1]

    # Find data points for different periods (approximated)
    month1_data = timeline_data[-2] if len(timeline_data) >= 2 else timeline_data[0]
    months3_data = (
        timeline_data[max(0, len(timeline_data) - 4)]
        if len(timeline_data) >= 4
        else timeline_data[0]
    )
    year1_data = timeline_data[0]

    def calculate_return(current_val: float, past_val: float) -> float:
        return (
            round(((current_val - past_val) / past_val) * 100, 1) if past_val > 0 else 0
        )

    return {
        "portfolio": PerformanceReturns(
            month1=calculate_return(current["portfolio"], month1_data["portfolio"]),
            months3=calculate_return(current["portfolio"], months3_data["portfolio"]),
            year1=calculate_return(current["portfolio"], year1_data["portfolio"]),
        ),
        "nifty50": PerformanceReturns(
            month1=calculate_return(current["nifty50"], month1_data["nifty50"]),
            months3=calculate_return(current["nifty50"], months3_data["nifty50"]),
            year1=calculate_return(current["nifty50"], year1_data["nifty50"]),
        ),
        "gold": PerformanceReturns(
            month1=calculate_return(current["gold"], month1_data["gold"]),
            months3=calculate_return(current["gold"], months3_data["gold"]),
            year1=calculate_return(current["gold"], year1_data["gold"]),
        ),
    }


async def calculate_diversification_score() -> float:
    """Calculate diversification score based on sector distribution from loaded data"""
    holdings_data = DATA_CACHE["holdings"]
    if not holdings_data:
        return 5.0

    sectors = set(holding["sector"] for holding in holdings_data)
    num_sectors = len(sectors)
    num_holdings = len(holdings_data)

    # Simple diversification score: more sectors and more even distribution = higher score
    base_score = min(num_sectors * 2, 10)  # Max 10 for having 5+ sectors

    # Adjust based on concentration (penalize if too concentrated in few stocks)
    concentration_penalty = (
        max(0, (num_holdings - 10) * 0.1) if num_holdings > 10 else 0
    )

    return min(10.0, max(1.0, base_score - concentration_penalty))


async def determine_risk_level(diversification_score: float) -> str:
    """Determine portfolio risk level based on loaded data"""
    holdings_data = DATA_CACHE["holdings"]
    if not holdings_data:
        return "Moderate"

    # Count sectors
    sectors = set(holding["sector"] for holding in holdings_data)

    # Check volatility based on sector mix
    high_risk_sectors = {"Technology", "Small Cap Stocks"}
    safe_sectors = {"Banking", "Healthcare", "FMCG"}

    high_risk_exposure = sum(
        holding["value"]
        for holding in holdings_data
        if holding["sector"] in high_risk_sectors
    )
    total_value = sum(holding["value"] for holding in holdings_data)
    high_risk_ratio = high_risk_exposure / total_value if total_value > 0 else 0

    if diversification_score >= 8 and high_risk_ratio < 0.3:
        return "Conservative"
    elif diversification_score >= 6 and high_risk_ratio < 0.5:
        return "Moderate"
    else:
        return "Aggressive"


# API Endpoints


@app.on_event("startup")
async def startup_event():
    """Load data from Excel file on startup"""
    await load_excel_data()


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Portfolio Analytics API - Reading from Excel file",
        "version": "1.0.0",
        "data_source": "Sample Portfolio Dataset for Assignment.xlsx",
        "endpoints": [
            "/api/portfolio/holdings",
            "/api/portfolio/allocation",
            "/api/portfolio/performance",
            "/api/portfolio/summary",
        ],
    }


@app.get("/api/portfolio/holdings", response_model=List[HoldingItem])
async def get_portfolio_holdings():
    """
    Get complete list of user's stock investments from Excel file
    Returns detailed information about each holding including gains/losses
    """
    try:
        await ensure_data_loaded()
        holdings_data = DATA_CACHE["holdings"]

        if not holdings_data:
            raise HTTPException(status_code=404, detail="No holdings data found")

        # Convert to Pydantic models
        holdings = []
        for holding in holdings_data:
            holdings.append(
                HoldingItem(
                    symbol=holding["symbol"],
                    name=holding["name"],
                    quantity=holding["quantity"],
                    avgPrice=holding["avgPrice"],
                    currentPrice=holding["currentPrice"],
                    sector=holding["sector"],
                    marketCap=holding["marketCap"],
                    value=holding["value"],
                    gainLoss=holding["gainLoss"],
                    gainLossPercent=round(holding["gainLossPercent"], 2),
                )
            )

        return holdings

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching holdings: {str(e)}"
        )


@app.get("/api/portfolio/allocation")
async def get_portfolio_allocation():
    """
    Get asset distribution by sectors and market cap from Excel file
    Returns percentage breakdown of portfolio allocation
    """
    try:
        await ensure_data_loaded()

        # Calculate allocations concurrently
        sector_allocation, market_cap_allocation = await asyncio.gather(
            calculate_allocation_by_sector(), calculate_allocation_by_market_cap()
        )

        return {"bySector": sector_allocation, "byMarketCap": market_cap_allocation}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating allocation: {str(e)}"
        )


@app.get("/api/portfolio/performance", response_model=PerformanceData)
async def get_portfolio_performance():
    """
    Get historical performance vs benchmarks from Excel file
    Returns timeline data and performance comparison with Nifty 50 and Gold
    """
    try:
        await ensure_data_loaded()
        timeline_data = DATA_CACHE["historical_performance"]

        if not timeline_data:
            raise HTTPException(status_code=404, detail="No performance data found")

        # Convert to proper format
        timeline = [
            PerformanceTimeline(
                date=item["date"],
                portfolio=item["portfolio"],
                nifty50=item["nifty50"],
                gold=item["gold"],
            )
            for item in timeline_data
        ]

        # Calculate returns
        returns = await calculate_performance_returns()

        return PerformanceData(timeline=timeline, returns=returns)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching performance data: {str(e)}"
        )


@app.get("/api/portfolio/summary", response_model=PortfolioSummary)
async def get_portfolio_summary():
    """
    Get key portfolio metrics and insights from Excel file
    Returns overview with total values, top performers, and risk analysis
    """
    try:
        await ensure_data_loaded()

        # Use summary data from Excel if available
        summary_data = DATA_CACHE["summary"]
        holdings_data = DATA_CACHE["holdings"]
        top_performers_data = DATA_CACHE["top_performers"]

        if not holdings_data:
            raise HTTPException(status_code=404, detail="No portfolio data found")

        # Get totals from summary sheet or calculate from holdings
        if summary_data:
            total_value = float(summary_data.get("Total Portfolio Value", 0))
            total_invested = float(summary_data.get("Total Invested Amount", 0))
            total_gain_loss = float(summary_data.get("Total Gain/Loss", 0))
            total_gain_loss_percent = (
                float(summary_data.get("Total Gain/Loss %", 0)) * 100
            )
        else:
            # Fallback calculation
            total_value = sum(holding["value"] for holding in holdings_data)
            total_invested = sum(
                holding["quantity"] * holding["avgPrice"] for holding in holdings_data
            )
            total_gain_loss = total_value - total_invested
            total_gain_loss_percent = (
                (total_gain_loss / total_invested) * 100 if total_invested > 0 else 0
            )

        # Get top/worst performers and highest/lowest values from Excel or calculate
        if top_performers_data:
            top_performer_data = top_performers_data.get("Best Performer", {})
            worst_performer_data = top_performers_data.get("Worst Performer", {})
            highest_value_data = top_performers_data.get("Highest Value", {})
            lowest_value_data = top_performers_data.get("Lowest Value", {})

            top_performer = TopPerformer(
                symbol=top_performer_data.get("symbol", ""),
                name=top_performer_data.get("name", ""),
                gainPercent=float(top_performer_data.get("performance", 0)) * 100,
            )
            worst_performer = TopPerformer(
                symbol=worst_performer_data.get("symbol", ""),
                name=worst_performer_data.get("name", ""),
                gainPercent=float(worst_performer_data.get("performance", 0)) * 100,
            )

            # Highest Value
            highest_value_perf = highest_value_data.get("performance", 0)
            if isinstance(highest_value_perf, str):
                highest_value_perf = float(highest_value_perf.replace(",", "").strip())

            highest_value = TopPerformer(
                symbol=highest_value_data.get("symbol", ""),
                name=highest_value_data.get("name", ""),
                value=highest_value_perf,
            )

            # Lowest Value
            lowest_value_perf = lowest_value_data.get("performance", 0)
            if isinstance(lowest_value_perf, str):
                lowest_value_perf = float(lowest_value_perf.replace(",", "").strip())

            lowest_value = TopPerformer(
                symbol=lowest_value_data.get("symbol", ""),
                name=lowest_value_data.get("name", ""),
                value=lowest_value_perf,
            )

        else:
            # Fallback calculation
            sorted_by_performance = sorted(
                holdings_data, key=lambda x: x["gainLossPercent"], reverse=True
            )
            sorted_by_value = sorted(
                holdings_data, key=lambda x: x["value"], reverse=True
            )

            top_holding = sorted_by_performance[0]
            worst_holding = sorted_by_performance[-1]
            highest_value_holding = sorted_by_value[0]
            lowest_value_holding = sorted_by_value[-1]

            top_performer = TopPerformer(
                symbol=top_holding["symbol"],
                name=top_holding["name"],
                gainPercent=top_holding["gainLossPercent"],
            )
            worst_performer = TopPerformer(
                symbol=worst_holding["symbol"],
                name=worst_holding["name"],
                gainPercent=worst_holding["gainLossPercent"],
            )
            highest_value = TopPerformer(
                symbol=highest_value_holding["symbol"],
                name=highest_value_holding["name"],
                value=highest_value_holding["value"],
            )
            lowest_value = TopPerformer(
                symbol=lowest_value_holding["symbol"],
                name=lowest_value_holding["name"],
                value=lowest_value_holding["value"],
            )

        # Calculate diversification and risk
        diversification_score = await calculate_diversification_score()
        risk_level = await determine_risk_level(diversification_score)

        return PortfolioSummary(
            totalValue=round(total_value, 2),
            totalInvested=round(total_invested, 2),
            totalGainLoss=round(total_gain_loss, 2),
            totalGainLossPercent=round(total_gain_loss_percent, 2),
            topPerformer=top_performer,
            worstPerformer=worst_performer,
            highestValue=highest_value,
            lowestValue=lowest_value,
            diversificationScore=round(diversification_score, 1),
            riskLevel=risk_level,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating summary: {str(e)}"
        )


@app.get("/api/portfolio/marketcap", response_model=List[MarketCapItem])
async def get_market_cap_info():
    """
    Get market cap allocation info from Excel
    """
    try:
        await ensure_data_loaded()
        market_cap_data = DATA_CACHE["market_cap"]
        if not market_cap_data:
            raise HTTPException(status_code=404, detail="No market cap data found")
        # Format for frontend
        result = [
            MarketCapItem(
                marketCap=cap,
                value=data["value"],
                percentage=round(data["percentage"], 1),
            )
            for cap, data in market_cap_data.items()
            
        ]
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching market cap info: {str(e)}"
        )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    data_loaded = all(
        v is not None
        for v in [DATA_CACHE["holdings"], DATA_CACHE["historical_performance"]]
    )
    return {
        "status": "healthy" if data_loaded else "degraded",
        "data_loaded": data_loaded,
        "timestamp": datetime.now().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
