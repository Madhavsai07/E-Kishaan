# Project Summary
The project is an AI-powered web platform designed to assist farmers in Kerala with crop forecasting, soil fertility analysis, market price predictions, and real-time advisory tools. It also features a gamified problem-solving module, allowing users to tackle algorithmic challenges related to farming.

# Project Module Description
## Core Functionalities
1. **Agriculture Support System**
   - **Weather Data & Forecasting**: Provides real-time weather updates and forecasts.
   - **Soil Fertility & Input Tracking**: Tracks soil health and fertilizer usage.
   - **Crop Growth Prediction**: Offers growth timelines and smart recommendations.
   - **Price & Yield Forecasting**: Analyzes historical prices to suggest optimal selling times.
   - **Profit & ROI Dashboard**: Visualizes net profit, ROI, and break-even points.

2. **Gamified Problem-Solving (Frankenstein Challenge)**
   - **Potion Recipe Solver**: Users input recipes to calculate the minimum magical orbs required.
   - **Interactive Learning**: Engages users in algorithmic logic through challenges and leaderboards.

# Directory Tree
```
shadcn-ui/
├── README.md               # Project overview and setup instructions
├── components.json         # Component definitions
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── public/                 # Public assets
│   ├── favicon.svg         # Favicon for the website
│   ├── images/             # Images used in the project
│   └── robots.txt          # Robots.txt file for SEO
├── src/                    # Source code for the application
│   ├── App.css             # Global styles
│   ├── App.tsx             # Main application component
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions and algorithms
│   ├── pages/              # Application pages
│   ├── index.css           # Application styles
│   └── vite-env.d.ts       # Vite environment types
├── tailwind.config.ts      # Tailwind CSS configuration
├── template_config.json     # Template configurations
├── todo.md                 # TODOs for the project
├── tsconfig.*.json         # TypeScript configuration files
└── vite.config.ts          # Vite configuration
```

# File Description Inventory
- **README.md**: Provides an overview of the project, setup instructions, and usage guidelines.
- **components.json**: Contains definitions for reusable components.
- **eslint.config.js**: Configuration file for linting JavaScript and TypeScript code.
- **index.html**: The entry point for the application, linking the main JavaScript file.
- **package.json**: Lists dependencies and scripts for building and running the application.
- **postcss.config.js**: Configuration for PostCSS processing.
- **public/**: Contains static files like images and the favicon.
- **src/**: Houses the application's source code, including components, styles, and pages.
- **tailwind.config.ts**: Configuration for Tailwind CSS.
- **template_config.json**: Holds template configurations for the project.
- **todo.md**: Lists tasks and features to be implemented.
- **tsconfig.*.json**: TypeScript configuration files for different environments.
- **vite.config.ts**: Configuration file for Vite, the build tool used.

# Technology Stack
- **Frontend**: React.js / Next.js, TypeScript, TailwindCSS, Shadcn-UI components
- **Backend**: Node.js / Express or Flask/FastAPI for machine learning models
- **Database**: PostgreSQL / MongoDB / Firebase
- **APIs**: Integration with weather and market data APIs
- **Data Visualization**: Recharts for charting and graphs

# Usage
1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Build the Project**:
   ```bash
   pnpm run build
   ```
3. **Run the Application**:
   ```bash
   pnpm run start
   ```
