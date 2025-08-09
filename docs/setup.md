# Portfolio Analytics API

A comprehensive FastAPI backend for portfolio management and analytics, designed for WealthManager.online.

## Features

- **4 Core Endpoints**: Holdings, Allocation, Performance, Summary
- **Async Operations**: Non-blocking API calls with asyncio
- **Data Processing**: Polars for efficient data manipulation
- **Type Safety**: Pydantic models for request/response validation
- **CORS Enabled**: Ready for frontend integration
- **Error Handling**: Comprehensive error responses

## Quick Start

### 1. Installation

```bash
# Clone or create the project directory
mkdir portfolio-api
cd portfolio-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the API

```bash
# Development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## API Endpoints

### 1. Portfolio Holdings

```
GET /api/portfolio/holdings
```

Returns complete list of user's stock investments with current values and gains/losses.

**Response Example:**

```json
[
  {
    "symbol": "RELIANCE",
    "name": "Reliance Industries Limited",
    "quantity": 50,
    "avgPrice": 2450.0,
    "currentPrice": 2680.5,
    "sector": "Energy",
    "marketCap": "Large",
    "value": 134025.0,
    "gainLoss": 11525.0,
    "gainLossPercent": 9.39
  }
]
```

### 2. Portfolio Allocation

```
GET /api/portfolio/allocation
```

Returns asset distribution by sectors and market capitalization.

**Response Example:**

```json
{
  "bySector": {
    "Technology": { "value": 459843.75, "percentage": 26.0 },
    "Energy": { "value": 134025.0, "percentage": 7.6 }
  },
  "byMarketCap": {
    "Large": { "value": 1766551.75, "percentage": 100.0 }
  }
}
```

### 3. Performance Comparison

```
GET /api/portfolio/performance
```

Returns historical performance vs benchmarks (Nifty 50, Gold).

**Response Example:**

```json
{
  "timeline": [
    {
      "date": "2024-08-08",
      "portfolio": 1766551,
      "nifty50": 25000,
      "gold": 72500
    }
  ],
  "returns": {
    "portfolio": { "month1": 2.7, "months3": 7.3, "year1": 17.8 },
    "nifty50": { "month1": 1.6, "months3": 5.0, "year1": 19.0 },
    "gold": { "month1": 1.0, "months3": 5.1, "year1": 16.9 }
  }
}
```

### 4. Portfolio Summary

```
GET /api/portfolio/summary
```

Returns key portfolio metrics and insights.

**Response Example:**

```json
{
  "totalValue": 1766551.75,
  "totalInvested": 1592500.0,
  "totalGainLoss": 174051.75,
  "totalGainLossPercent": 10.93,
  "topPerformer": {
    "symbol": "ICICIBANK",
    "name": "ICICI Bank Limited",
    "gainPercent": 12.34
  },
  "worstPerformer": {
    "symbol": "HDFCBANK",
    "name": "HDFC Bank Limited",
    "gainPercent": -4.22
  },
  "diversificationScore": 7.0,
  "riskLevel": "Moderate"
}
```

## Architecture

### Key Components

1. **FastAPI Application**: Modern async web framework
2. **Pydantic Models**: Type-safe request/response validation
3. **Async Utilities**: Non-blocking calculation functions
4. **CORS Middleware**: Cross-origin requests support
5. **Error Handling**: Comprehensive exception management

### Data Processing

- **Real-time Calculations**: Values computed on-demand
- **Concurrent Operations**: Multiple calculations using asyncio
- **Data Validation**: Input sanitization and type checking
- **Performance Optimization**: Efficient algorithms for metrics

### Sample Data Structure

The API uses structured sample data representing:

- 7 Indian stock holdings (RELIANCE, INFY, TCS, etc.)
- Historical performance data over 9 months
- Sector diversification across Technology, Banking, Energy, etc.
- Market cap distribution (primarily Large Cap)

## Development Notes

### Async Operations

All calculation functions are async to prevent blocking:

- Portfolio allocation calculations
- Performance return computations
- Risk assessment algorithms
- Diversification scoring

### Error Handling

Comprehensive error responses with:

- HTTP status codes (500 for server errors)
- Detailed error messages
- Exception context for debugging

### Extensibility

Easy to extend with:

- Database integration (replace SAMPLE_DATA)
- Additional endpoints
- Authentication/authorization
- Real-time market data feeds
- Advanced analytics features

## Next Steps for Frontend Integration

1. **CORS Configuration**: Update allowed origins for production
2. **Environment Variables**: Configure for different environments
3. **Database Integration**: Replace sample data with real database
4. **Authentication**: Add user authentication if required
5. **Rate Limiting**: Implement API rate limiting
6. **Monitoring**: Add logging and monitoring

## Testing the API

```bash
# Test all endpoints
curl http://localhost:8000/api/portfolio/holdings
curl http://localhost:8000/api/portfolio/allocation
curl http://localhost:8000/api/portfolio/performance
curl http://localhost:8000/api/portfolio/summary
```

The API is now ready for integration with your Next.js frontend!
