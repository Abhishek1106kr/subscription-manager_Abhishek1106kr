# Subscription Management System

## 1. Project Description
The **Subscription Management System** is a comprehensive full-stack web application designed to help users track, analyze, and manage their recurring expenses and subscriptions. In an increasingly subscription-based digital economy, users often lose track of their active services, leading to unwanted charges and poor financial management. 

This platform solves that problem by providing a centralized dashboard where users can aggregate all their subscriptions. Furthermore, it features robust multi-currency support backed by real-time exchange rate integrations, ensuring users can accurately track their international spending precisely in their preferred local currency.

## 2. Features
- **Subscription Tracking**: Intuitively add, edit, and organize active subscriptions alongside their continuous billing cycles.
- **Currency Conversion**: Seamlessly track expenses across different global currencies (e.g., USD, EUR, CNY, GBP).
- **Exchange Rate API Integration**: Automatically fetches real-time exchange rates (via open-source APIs like exchangerate-api.com) to provide up-to-date cost estimations without requiring manual input.
- **Dashboard Analytics**: Visualize monthly and yearly spending trends, categorized cost breakdowns, and upcoming renewal timelines through interactive charts.
- **Notifications**: Automated alerts and reminders for upcoming renewals to prevent accidental or unwanted charges.
- **Data Persistence**: Securely stores user preferences, comprehensive subscription data, and localized exchange rate histories in a robust database.

## 3. Tech Stack
This project leverages a modern, decoupled full-stack architecture:
- **Frontend**: React (orchestrated with Vite, TypeScript, and highly customized modern CSS/Tailwind for a premium, glassmorphic UI)
- **Backend**: Node.js / Express.js
- **Database**: SQLite (lightweight, zero-configuration SQL database engine for robust local data handling)
- **Architecture**: REST API design principles

## 4. Installation Steps

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.x (optional, for AI assistant features)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/agam263/subscription-manager.git
   cd subscription-manager
   ```

2. **Install dependencies**
   First, install the frontend dependencies in the root directory:
   ```bash
   npm install
   ```
   Next, install the backend dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Run the Backend**
   Open a terminal window and start the Express server:
   ```bash
   cd server
   npm start
   ```
   *The backend will typically run on `http://localhost:3001`.*

4. **Run the Frontend**
   Open a second terminal window in the project root and start the React Vite server:
   ```bash
   npm run dev
   ```
   *The frontend will compile and typically run on `http://localhost:3000` or `http://localhost:5173`. Access this URL in your browser to view the application.*

## 5. Folder Structure
```text
subscription-manager/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components and system layout
│   ├── pages/              # Primary application views (Dashboard, Settings, etc.)
│   ├── store/              # Client-side state management (Zustand)
│   ├── utils/              # Helper functions, formatters, and API clients
│   └── App.tsx             # Main React application routing and entry point
├── server/                 # Backend Node.js/Express application
│   ├── controllers/        # Request handling logic mapping
│   ├── routes/             # REST API endpoint routing definitions
│   ├── services/           # Core business logic (exchange rate fetching, schedulers)
│   └── server.js           # Main Express server configuration and entry point
├── docs/                   # Documentation and architecture references
├── public/                 # Static assets (images, icons)
└── package.json            # Project dependencies and scripts
```

## 6. Future Improvements
- **Bank API Synchronization**: Direct integration with financial institutions via Plaid or similar services to auto-sync bank transactions.
- **Automated Email Receipt Parsing**: Implementation of email scanning to automatically discover, categorize, and add new subscriptions from digital receipts.
- **Machine Learning Categorization**: AI-driven predictive insights on subscription usage, highlighting potential waste and unused services.
- **Multi-tenant Authentication**: Expanding the system for multi-user enterprise or household accounts with fine-grained role-based access control.
- **Advanced Exporting**: Capability to export financial data to CSV, PDF, and popular accounting software formats (QuickBooks, Xero).
