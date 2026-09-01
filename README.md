# 💰 Personal Finance Tracker (PFT)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61dafb.svg)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-green.svg)](https://nodejs.org)
[![Security: 2FA](https://img.shields.io/badge/Security-2FA_Email_OTP-purple.svg)](https://nodemailer.com)

A full-stack, enterprise-grade **Personal Finance & Wealth Management Application** built with the **MERN** stack (MongoDB, Express, React 18, Node.js) and Vite.

---

## ✨ Features Overview

* 🔐 **Two-Factor Authentication (2FA)**: High-security 6-digit email OTP verification code sent directly to user inbox via **Nodemailer Direct Gmail SMTP**.
* 🔑 **6-Digit Password Reset System**: 2-step OTP verification with terminal fallback logger for dev testing.
* 🔍 **Interactive Spotlight Search**: Real-time topbar search with live dropdown overlay for direct page navigation (`Summary`, `Analytics`, `Reports`, `Savings`, `Transactions`).
* 🎨 **Savings Goals & Category Logos**: Set financial milestones with custom color-coded category badges (✈️ Travel/Dubai, 🚗 Vehicle, 🏠 Home, 🩺 Health, 🛡️ Emergency).
* 📊 **Financial Health Score**: Dynamic credit-style score calculated based on savings rate, budget discipline, and safety reserves.
* 💳 **Transactions Management**: Complete income and expense tracking with category visual badges.
* 📈 **Analytics & Reports**: Visual Chart.js insights with one-click export to **PDF**, **Excel (.xlsx)**, and **CSV** formats.
* 🔁 **Recurring Transactions Automation**: Background scheduler (`node-cron`) automatically generates due monthly bills and income.
* 👥 **Split Expenses & Group Balances**: Shared expense manager for splitting bills among groups and tracking net settlements.
* 🌗 **Customization & Themes**: Full Light / Dark mode toggle and multi-currency formatting (`₹`, `$`, `€`, `£`, `¥`).

---

## 🛠️ Tech Stack

### 💻 **Frontend**
* **Framework**: React 18 + Vite
* **Routing**: React Router DOM v6
* **Data Visualization**: Chart.js + React-Chartjs-2
* **Icons & UI**: Lucide-React & Modern CSS Glassmorphism
* **Exporting**: jsPDF & HTML2Canvas

### ⚙️ **Backend**
* **Runtime**: Node.js & Express 5
* **Database**: MongoDB & Mongoose ODM
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs (256-bit encryption)
* **Email System**: Nodemailer (Direct Gmail SMTP) & EmailJS REST API
* **Automation**: Node-Cron scheduler
* **Document Generation**: ExcelJS, PDFKit, and Json2CSV

---

## 📁 Folder Structure

```text
pft/
├── backend/
│   ├── config/             # Database connection config
│   ├── controllers/        # Auth, Transactions, Budgets, Savings controllers
│   ├── middleware/         # Auth & global error handler middleware
│   ├── models/             # User, Transaction, Budget, Savings Mongoose schemas
│   ├── routes/             # Express API routes
│   ├── utils/              # 2FA Email templates, SMTP transporter, Cron scheduler
│   ├── .env                # Environment variables (Git-ignored)
│   ├── package.json        # Backend dependencies
│   └── server.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Modals, Cards, Charts
│   │   ├── context/        # Auth (2FA), Theme, Currency, Notification contexts
│   │   ├── pages/          # Dashboard, Summary, Transactions, Savings, Analytics, Reports
│   │   ├── services/       # Axios API client configuration
│   │   ├── App.jsx         # Main App wrapper
│   │   ├── main.jsx        # Entry file
│   │   └── routes.jsx      # React Router routes definition
│   ├── index.html
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── .gitignore              # Git ignored files & patterns
├── package.json            # Root workspace scripts (runs client & server concurrently)
└── README.md               # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** or **yarn**
* **MongoDB** (Local instance or MongoDB Atlas connection string)

### 1️⃣ Clone the Repository & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd pft

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 2️⃣ Environment Setup
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your_random_256_bit_secret_key_here
NODE_ENV=development

# Email Notification Configuration (Direct Gmail SMTP Priority #1)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_digit_app_password
```

> **Note**:
> * Generate a secure JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> * Generate a 16-character Gmail App Password at [Google App Passwords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification enabled on your Google account).
> * Never commit your actual `.env` file or paste real secrets into this `README.md`. Keep `.env` listed in `.gitignore`.

### 3️⃣ Run the Application
Start both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

* 🌐 **Frontend**: `http://localhost:5173`
* ⚙️ **Backend API**: `http://localhost:5000/api`

---

## 📤 How to Push this Project to GitHub

Before pushing, confirm your `.env` is ignored:
```bash
git check-ignore -v backend/.env
```
*(If this prints the file path, it's safely ignored and won't be pushed).*

Then initialize and push:
```bash
# 1. Initialize Git repository
git init

# 2. Add all project files
git add .

# 3. Commit your changes
git commit -m "Initial commit: Complete Personal Finance Tracker with 2FA Email Login"

# 4. Set main branch name
git branch -M main

# 5. Connect your local repository to your remote GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push your code to GitHub
git push -u origin main
```

---

## 📄 License
This project is licensed under the **ISC License**.
