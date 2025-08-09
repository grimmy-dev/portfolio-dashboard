# 📊 Portfolio Analytics Dashboard

A **full-stack investment analytics platform** built with FastAPI and Next.js that transforms Excel portfolio data into interactive dashboards.

<img width="1750" height="917" alt="Screenshot 2025-08-09 at 6 36 44 PM" src="https://github.com/user-attachments/assets/f2f72497-6c43-4154-9e8c-eeec7acb0e57" />

## 🚀 Features

- **Real-time Portfolio Analytics** — Track holdings, gains/losses, and performance
- **Performance Benchmarking** — Compare against Nifty 50 & Gold
- **Sector & Market Cap Analysis** — Visual allocation breakdowns
- **Excel Integration** — Reads `.xlsx` files directly
- **Fast API** — Async FastAPI backend with Polars data processing and pandas sa fallback processing
- **Modern Frontend** — Next.js dashboard with interactive charts

## 🗂 Excel File Structure

Your Excel file should contain these sheets:

| Sheet Name | Description |
|------------|-------------|
| **Holdings** | Stock symbols, quantities, prices, sectors |
| **Historical_Performance** | Portfolio performance over time |
| **Sector_Allocation** | Distribution by sectors |
| **Market_Cap** | Market capitalization breakdown |
| **Summary** | Key metrics and totals |
| **Top_Performers** | Best and worst performing stocks |

## 🏃‍♂️ Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- pnpm (recommended)

### 1. Install Dependencies

```bash
# Backend dependencies
pip install fastapi uvicorn polars pandas openpyxl

# Frontend dependencies
pnpm install
```

### 2. Start the Backend

```bash
uvicorn main:app --reload --port 8000
```

API available at: `http://localhost:8000`

### 3. Start the Frontend

```bash
pnpm run dev
```

Dashboard available at: `http://localhost:3000`

### 4. Full Development Mode

```bash
pnpm run dev:full  # Runs both backend and frontend
```

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/portfolio/holdings` | All portfolio holdings |
| `/api/portfolio/allocation` | Sector & market cap breakdown |
| `/api/portfolio/performance` | Historical performance data |
| `/api/portfolio/summary` | Portfolio summary & metrics |


## 🛠 Tech Stack

- **Backend:** FastAPI, Polars, Pandas
- **Frontend:** Next.js, React, TypeScript
- **Data:** Excel integration with OpenPyXL
- **UI:** Tailwind CSS, Recharts

## 📁 Project Structure

```
portfolio-analytics/
├── data/                # Excel portfolio files
├── docs/                # Documentation
├── public/              # Static assets
├── src/
│   ├── api/             # FastAPI backend logic
│   ├── app/             # Next.js app directory
│   ├── components/      # React UI components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions
├── package.json         # Frontend dependencies & scripts
├── requirements.txt     # Python dependencies
└── README.md
```

---

**Ready to turn your Excel portfolio into a powerful analytics dashboard!** 🚀
