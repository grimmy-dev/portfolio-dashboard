# 📊 Portfolio Analytics Dashboard

A **full-stack investment analytics platform** with:

- **FastAPI** backend for real-time analytics
- **Pandas + Polars** for blazing-fast portfolio data processing
- **Next.js** frontend for rich interactive dashboards
- **Excel integration** so you can upload portfolio files directly
- **Real-time Portfolio Analytics** — Get up-to-date holdings, sector allocation, and risk insights
- **Performance Benchmarking** — Compare portfolio performance with **Nifty 50** & **Gold**
- **Allocation Analysis** — Breakdown by sector & market capitalization
- **Excel Upload Support** — No manual input, just upload your `.xlsx` file
- **Top Performer Tracking** — Spot the best & worst assets instantly
- **Scalable API** — FastAPI async backend optimized for speed
- **Frontend Ready** — Designed to plug directly into any **Next.js / React** app

***

## 🗂 Excel File Structure

Your Excel file (e.g., `Sample Portfolio.xlsx`) should have these sheets:

| Sheet Name             | Data                                                      |
|------------------------|-----------------------------------------------------------|
| **Holdings**           | Stock names, symbols, quantity, buy price, sector         |
| **Historical_Performance** | Date-wise portfolio & benchmark returns              |
| **Sector_Allocation**  | Sector distribution                                       |
| **Market_Cap**         | Market capitalization classification                      |
| **Summary**            | Total invested, total gain/loss, diversification score    |
| **Top_Performers**     | Best & worst performers                                   |

***

## 🚀 Quick Start

### 1️⃣ Prerequisites

- **Python** 3.8+
- **Node.js** 18+
- **pnpm** (recommended) or npm
- Excel `.xlsx` file with portfolio data

***

### 2️⃣ Clone & Setup

```bash
git clone 
cd portfolio-analytics
```

***

### 3️⃣ Backend Setup (FastAPI)

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn polars pandas openpyxl
```

Run backend:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be live at:
- **Base URL:** `http://localhost:8000`
- **Docs:** `http://localhost:8000/docs`

***

### 4️⃣ Frontend Setup (Next.js)

```bash
cd frontend
pnpm install       # or npm install
pnpm run dev
```

Frontend will run at:
- `http://localhost:3000`

***

## 📡 API Endpoints

| Method | Endpoint                          | Description                             |
|--------|-----------------------------------|-----------------------------------------|
| GET    | `/api/portfolio/holdings`         | Get all holdings with current values    |
| GET    | `/api/portfolio/allocation`       | Sector & market cap allocation          |
| GET    | `/api/portfolio/performance`      | Past performance vs benchmarks          |
| GET    | `/api/portfolio/summary`          | Summary with metrics, risk, top picks   |
| GET    | `/api/portfolio/marketcap`        | Market capitalization breakdown         |

***

## 📁 Project Structure

```
portfolio-analytics/
├── 📂 backend/               # FastAPI backend
│   ├── main.py               # API entry point
│   ├── routes/               # All API endpoints
│   ├── services/             # Data processing functions
│   └── data/                 # Excel sample files
│
├── 📂 frontend/              # Next.js frontend
│   ├── components/           # React UI components
│   ├── pages/                # Frontend pages
│   └── styles/               # Styling (CSS/SCSS)
│
├── README.md
└── requirements.txt
```

***

## 🛠 Tech Stack

| Layer         | Technology |
|---------------|------------|
| Backend       | FastAPI, Uvicorn |
| Data          | Pandas, Polars, OpenPyXL |
| Frontend      | Next.js, React, TypeScript |
| Dev Tools     | Node.js, pnpm, Python venv |

***

## 🏭 Deployment

**Backend (Production)**

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

**Frontend (Build & Serve)**

```bash
pnpm build
pnpm start
```

***

## 🤝 Contributing

1. **Fork** this repository
2. **Create** a new branch: `git checkout -b feature/my-feature`
3. **Commit** changes: `git commit -m "Add my feature"`
4. **Push**: `git push origin feature/my-feature`
5. **Open** a Pull Request 🚀

***

## 🧠 Summary

This project helps **investors & developers** turn raw Excel portfolio files into **interactive, real-time analytics dashboards** — powered by Python’s data processing and Next.js's UI capabilities.

***

⭐ If you like this, don’t forget to [start the repo]()

***
