# 🌱 E-Kissan — AI-Powered Smart Farming & Decision Support System

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Backend%20Deploy-2496ED?logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Radix_UI-000000)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**E-Kissan (E-Kishaan)** is a state-of-the-art, AI-powered agricultural management platform and decision support system designed to empower farmers with real-time weather analytics, soil health optimization, crop growth lifecycle forecasting, market price predictions, dynamic financial ROI tracking, algorithmic problem-solving tools, and seamless user authentication.

---

## 🚀 Key Modules & Capabilities

### 1. 🌤️ Weather & Climate Intelligence (`WeatherDashboard.tsx` & `weatherService.ts`)
- **Real-Time Environmental Metrics**: Tracks Temperature (28°C, feels like 31°C), Humidity (75%), Wind Speed (12 km/h), and Daily Rainfall (2mm).
- **Automated Weather Alerts**: Detects incoming severe weather (e.g., heavy rainfall warnings) and suggests actionable field precautions.
- **7-Day Interactive Forecast**: Dual line charts powered by Recharts comparing temperature and humidity trends over 7 days.
- **6-Month Climate Planning**: Bar charts plotting long-term monthly temperature averages against expected rainfall to help schedule planting cycles.
- **Actionable Farming Recommendations**: Weekly and monthly localized advice for field management and irrigation adjustments.

### 2. 🌱 Soil Fertility & Nutrient Analytics (`SoilFertility.tsx` & `soilController.ts`)
- **Soil Health Index**: Computes an overall soil health rating (e.g., 85% Excellent), pH level balance (6.5 Optimal), and organic matter percentage (3.2%).
- **NPK Monitoring & Visual Breakdown**: Detailed progress indicators and status badges for Nitrogen (75%), Phosphorus (68%), and Potassium (82%) with interactive NPK distribution pie charts.
- **Fertilizer Application Logging**: Interactive form allowing farmers to record Nitrogen, Phosphorus, and Potassium inputs (kg/acre) along with application dates.
- **Historical Usage & Nutrient Trends**: 5-month historical bar charts of fertilizer applications alongside 5-month line charts tracking soil nutrient recovery.
- **AI Recommendation Engine**: Smart warning system suggesting specific fertilizer applications (e.g., phosphate supplementation) based on soil deficiencies.

### 3. 🌾 Crop Lifecycle & Yield Prediction (`CropGrowth.tsx`)
- **Multi-Crop Management Cards**: Tracks individual crops (Rice - Jyothi variety, Coconut - Dwarf Green, Pepper - Panniyur-1) with progress bars, land area details, and health indicators.
- **Growth Stage Tracker**: Interactive timeline tracking stages (Germination → Seedling → Vegetative → Flowering → Grain Filling → Maturity) calculating exact days from planting.
- **AI Yield Forecasting**: Recharts area charts comparing predicted vs. actual yield percentages with estimated harvest dates (e.g., Dec 15) and AI confidence scores (95%).
- **Crop Care & Pest Control**: Dedicated recommendations for irrigation adjustments, pest management (brown planthopper, stem borer, neem oil treatments), and nutrient application splits.
- **Care Calendar Agenda**: Scheduled task list for upcoming field activities (fertilizer application, pest checks, deep watering sessions).

### 4. 📈 Market Price Analysis & Financial ROI (`MarketAnalysis.tsx` & `marketController.ts`)
- **Real-Time Commodity Tracking**: Live pricing metrics for regional crops (Rice at ₹3,800/quintal, Coconut at ₹42/piece, Pepper at ₹820/kg) with monthly percentage growth indicators.
- **AI Optimal Selling Time Alert**: Evaluates price forecast curves to alert farmers to peak demand periods (e.g., holding harvest until January for 10-15% higher returns).
- **Historical & Forecast Trends**: 10-month historical line charts and 6-month AI-predicted price trend forecasts.
- **Financial Profit Analyzer**: Detailed table calculating total investment, revenue, net profit, and ROI % for each crop.
- **Financial Summary Metrics**: High-level overview displaying Total Investment (₹1,05,000), Total Revenue (₹1,90,000), Net Profit (₹85,000), and Average ROI (81%).

### 5. 🧪 Frankenstein Orb Challenge AI Solver (`FrankensteinSolver.tsx`, `algorithms.ts` & `solverController.ts`)
- **Algorithmic Resource Optimizer**: Built-in dynamic programming engine with memoization (`solveFrankensteinProblem`) that solves ingredient/potion crafting dependency graphs.
- **Custom Input & Target Resolver**: Parses recipe statements (`potion = ingredient1 + ingredient2`) and calculates the minimum magical orbs/resources required to craft a target potion.
- **Step-by-Step Explanation Generator**: Generates human-readable step-by-step crafting breakdowns and mathematical explanations.
- **Interactive Challenge Library**: Presets across Easy, Medium, and Hard difficulty levels offering point rewards (+50, +100, +200 points).
- **Educational Concepts**: Teaches dynamic programming, graph theory, memoization, and their direct applications to real-world agricultural supply chains and crop rotation planning.

### 6. 👤 User Profile, Authentication & Gamification (`UserProfile.tsx`, `AuthContext.tsx` & `userController.ts`)
- **User Authentication**: Secure Login & Signup flows powered by a MongoDB + JWT auth system (access + refresh tokens, bcrypt password hashing) with route protection (`RequireAuth.tsx`).
- **Farmer Profile Dashboard**: Displays user details (Ravi Kumar, Kottayam, Kerala), land size (4.0 acres), farming experience (12 years), and rank ("Advanced Farmer").
- **Interactive Profile Editing**: Live toggle mode allowing users to edit personal, contact, and land information.
- **Achievement & Rewards System**: 8 milestone badges (First Harvest, Soil Master, Weather Warrior, Profit Maximizer, Problem Solver, etc.) managed via `UserStatsContext`.
- **Environmental Impact Metrics**: Tracks sustainability achievements including Carbon Saved (2.4 tons CO2) and Water Saved (15,000 L).

---

## 📁 Repository Directory Structure

```
E-Kishaan/
├── README.md                          # Main project documentation
├── package-lock.json                  # Root lockfile
└── HACKATHON/
    ├── frontend/                      # React + Vite Frontend Application
    │   ├── index.html                 # HTML Entry Point
    │   ├── package.json               # Frontend Dependencies & Scripts
    │   ├── tsconfig.json              # TypeScript Base Configuration
    │   ├── tsconfig.app.json          # TypeScript App Configuration
    │   ├── tsconfig.node.json         # TypeScript Node Configuration
    │   ├── vite.config.ts             # Vite Build & Path Alias Config
    │   ├── tailwind.config.ts         # Tailwind CSS Custom Configuration
    │   ├── postcss.config.js          # PostCSS Configuration
    │   ├── eslint.config.js           # ESLint Configuration
    │   ├── components.json            # Shadcn UI Configuration
    │   ├── .env.local                 # Frontend Environment Variables
    │   ├── public/                    # Static Assets & Icons
    │   └── src/
    │       ├── main.tsx               # Application Entrypoint
    │       ├── App.tsx                # Router & App Providers Setup
    │       ├── App.css                # Base App Styles
    │       ├── index.css              # Global Tailwind Styles & Theme Tokens
    │       ├── vite-env.d.ts          # Vite Environment Declarations
    │       ├── pages/                 # Full Page Views
    │       │   ├── Landing.tsx        # Public Hero & Feature Overview Page
    │       │   ├── Login.tsx          # User Login Page
    │       │   ├── Signup.tsx         # User Registration Page
    │       │   ├── Index.tsx          # Main Application Dashboard Hub & Tabs
    │       │   └── NotFound.tsx       # 404 Fallback Page
    │       ├── components/            # Core Dashboard & UI Components
    │       │   ├── WeatherDashboard.tsx  # Weather & Climate Module
    │       │   ├── SoilFertility.tsx     # Soil Health & NPK Module
    │       │   ├── CropGrowth.tsx        # Crop Lifecycle & Yield Module
    │       │   ├── MarketAnalysis.tsx    # Commodity Prices & ROI Module
    │       │   ├── FrankensteinSolver.tsx# Algorithmic Puzzle Solver Module
    │       │   ├── UserProfile.tsx       # User Profile & Gamification Module
    │       │   ├── RequireAuth.tsx       # Authentication Route Guard Component
    │       │   └── ui/                   # Pre-built Shadcn UI primitives
    │       ├── contexts/              # Global React Contexts
    │       │   ├── AuthContext.tsx       # JWT Authentication State & Session Provider
    │       │   └── UserStatsContext.tsx  # Farmer Level, Achievements & Sustainability Points Provider
    │       ├── services/              # API Integration Services
    │       │   └── weatherService.ts     # Weather API & OpenWeather Fetcher
    │       └── lib/                   # Utility Libraries & Engines
    │           ├── algorithms.ts      # Core Dynamic Programming & Agri Math Engine
    │           ├── apiClient.ts       # Shared fetch wrapper (auth header + silent refresh)
    │           ├── env.ts             # Env var validation (VITE_API_URL, ...)
    │           └── utils.ts           # Styling Utility (clsx + tailwind-merge)
    ├── docker/                        # docker-compose.yml + README for local dev
    ├── docs/                          # Deployment / architecture / env var / migration docs
    └── backend/                       # Node.js + Express Backend API (deploys as a Docker container)
        ├── Dockerfile                 # Multi-stage production image
        ├── package.json               # Backend Dependencies & Scripts
        ├── tsconfig.json              # Backend TypeScript Configuration
        ├── .env                       # Backend Environment Variables
        ├── scripts/
        │   └── migrateSupabaseToMongo.ts # One-time Supabase -> MongoDB auth migration
        └── src/
            ├── server.ts              # Express Server Entry Point (helmet/cors/rate-limit/morgan)
            ├── config/                # env validation + MongoDB connection
            ├── models/                # Mongoose schemas (User, RefreshToken, PasswordSetupToken)
            ├── middleware/            # authenticate, authorize, validate, errorHandler
            ├── routes/                # API Route Handlers
            │   ├── api.ts             # Express Router with /api endpoints
            │   └── authRoutes.ts      # /api/auth/* (signup/login/refresh/logout/...)
            └── controllers/           # Business Logic Controllers
                ├── authController.ts    # JWT auth endpoints
                ├── weatherController.ts # Weather API Endpoints
                ├── soilController.ts    # Soil Fertility & Fertilizer Logs
                ├── marketController.ts  # Commodity Market Price Data
                ├── solverController.ts  # Algorithmic Solver Engine Endpoint
                └── userController.ts    # User Stats & Profile Sync
```

---

## 🛠️ Technology Stack & Dependencies

### Frontend Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Frontend User Interface |
| **Language** | [TypeScript 5.5](https://www.typescriptlang.org/) | Type Safety & Developer Experience |
| **Build Tool** | [Vite 5.4](https://vitejs.dev/) | Lightning Fast HMR & Bundling |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Responsive Utility-First Styling |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) | Accessible Component Primitives |
| **Data Visualization** | [Recharts 2.15](https://recharts.org/) | Interactive Responsive Charts |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern Crisp Vector Icons |
| **State & Query** | [@tanstack/react-query 5.56](https://tanstack.com/query) | Async Data & State Management |
| **Routing** | [React Router DOM 6.26](https://reactrouter.com/) | Client-Side Page Routing |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Toast Notifications |
| **i18n** | [react-i18next](https://react.i18next.com/) | Multi-language UI (English/Hindi/Punjabi/Tamil/Telugu) |

### Backend Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime Environment** | [Node.js 20](https://nodejs.org/) | Backend JavaScript Runtime |
| **Deployment** | [Docker](https://www.docker.com/) (multi-stage build) | Runs as an independent container on Render |
| **Framework** | [Express 4.19](https://expressjs.com/) | HTTP REST API Server |
| **Language** | [TypeScript 5.4](https://www.typescriptlang.org/) | Type Safety |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/) | User accounts, refresh tokens |
| **Auth** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Access/refresh JWTs, password hashing |
| **Security** | [helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [cors](https://github.com/expressjs/cors) | Security headers, brute-force protection, CORS |
| **Logging** | [winston](https://github.com/winstonjs/winston) + [morgan](https://github.com/expressjs/morgan) | Structured app logs + HTTP request logs |
| **Validation** | [zod](https://zod.dev/) | Request body & env var validation |
| **Email** | [nodemailer](https://nodemailer.com/) | Password-reset / account-setup emails |
| **Development Server** | [ts-node-dev](https://github.com/wclr/ts-node-dev) | Live Reloading Development Server |

---

## ⚙️ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### 1. 🎨 Frontend Setup (`HACKATHON/frontend`)

1. **Navigate to the Frontend Directory**:
   ```bash
   cd HACKATHON/frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.local.example` to `.env.local`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_ML_BACKEND_URL=http://localhost:8000
   ```

4. **Start Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

5. **Type Check & Build**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

### 2. ⚡ Backend Setup (`HACKATHON/backend`)

1. **Navigate to the Backend Directory**:
   ```bash
   cd HACKATHON/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill it in (needs a MongoDB — see `docker/README.md`
   for a one-command local MongoDB, or use Atlas):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ekishaan
   JWT_ACCESS_SECRET=...            # 32+ random chars
   JWT_REFRESH_SECRET=...           # 32+ random chars, different from the above
   FRONTEND_URL=http://localhost:5173
   ```
   Full reference: `docs/ENVIRONMENT.md`.

4. **Start Backend Development Server**:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000/api`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🚢 Deployment

Production deploys as two independent services — frontend on Vercel, backend on Render
as a Docker container — that talk to each other over env-var-configured URLs.
Full step-by-step instructions: **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)**.

- **Architecture & auth design**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Every environment variable**: [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)
- **Migrating existing Supabase accounts to MongoDB**: [`docs/MIGRATION.md`](docs/MIGRATION.md)
- **Local Docker + MongoDB setup**: [`docker/README.md`](docker/README.md)

## 🌐 GitHub Repositories
- **Main Repo**: [https://github.com/Rama542/E-Kishaan.git](https://github.com/Rama542/E-Kishaan.git)
- **Parent Repo**: [https://github.com/Rama542/AGRI--SMART.git](https://github.com/Rama542/AGRI--SMART.git)

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
