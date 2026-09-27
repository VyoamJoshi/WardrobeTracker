# Personal Wardrobe Tracker

A modern, fashion-focused personal digital wardrobe management web application. Digitally catalog your clothes, track wear counts and laundry thresholds in real time, view activity timelines, and explore usage analytics.

---

## 🌟 Highlights & Features

- **Personal Digital Closet**: Catalog clothing with images, categories, fit, color, material, and custom wear limits.
- **Dynamic Wash Status System**:
  - 🟢 **Clean**: Wear count $< \text{threshold} \times 0.75$
  - 🟡 **Wash Soon**: Wear count $\ge \text{threshold} \times 0.75$ and $< \text{threshold}$
  - 🔴 **Wash Required**: Wear count $\ge \text{threshold}$
- **One-Click Wear Tracking ("I WORE THIS")**:
  - Increments current wear count & lifetime wear count.
  - Automatically updates `last_worn` timestamp.
  - Adds an immutable timestamped log to `wear_history`.
  - Recalculates status in real time without refreshing.
- **One-Click Washing ("MARK AS WASHED")**:
  - Resets current wear count to `0`.
  - Preserves lifetime wear count.
  - Updates `last_washed` timestamp.
  - Appends record to `wash_history` and switches status to 🟢 Clean.
- **Interactive Wardrobe Grid**:
  - Responsive layout (1–2 cards on mobile, 2–3 on tablet, 4–5 on desktop).
  - Multi-attribute search across garment name, category, color, fit, and material.
  - Filtering by category (T-Shirts, Shirts, Jeans, Cargos, Chinos, Hoodies, Sweatshirts, Jackets, Shoes) and status.
  - Sorting by Recently Added, Recently Worn, Least Recently Worn, Most Worn, Category, and Name.
- **Side Drawer / Detail Modal**:
  - High-resolution garment view.
  - Full wear & wash history logs.
  - Edit and delete actions with confirmation dialogs.
- **Real-Time Dashboard**:
  - Dynamic time-of-day greeting ("Good morning", "Good afternoon", "Good evening").
  - Live statistics: Total Items, Clean, Wash Soon, Wash Required.
  - Actionable Laundry Reminders and Recently Worn / Washed galleries.
- **Analytics & Utilization**:
  - Total pieces, lifetime outfit wears, total laundry cycles, and pending wash counts.
  - Visual category breakdown percentages.
  - Most worn garments, neglected/least recently worn pieces, and most washed items.
- **Strict User Isolation & Security**:
  - Secure bcrypt password hashing.
  - JWT session authorization with isolated SQL schemas.
  - Prevention against unauthorized access across accounts.
- **Modular Image Service**:
  - Fast local storage with `/uploads/` static hosting for dev.
  - Clean abstraction ready for Cloudinary production deployment.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons |
| **Backend** | Node.js, Express.js (ES Modules), Multer, JWT, Bcrypt.js |
| **Database** | PostgreSQL (with built-in zero-friction in-memory PostgreSQL engine fallback) |
| **Styling** | Modern editorial palette, glassmorphism, responsive grid |

---

## 📁 Project Structure

```text
wardrobe-tracker/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AddEditClothingModal.jsx
│   │   │   ├── ClothingCard.jsx
│   │   │   ├── ClothingDetailModal.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # AppLayout (Responsive Shell)
│   │   ├── pages/              # Dashboard, Wardrobe, Analytics, Login, Register
│   │   ├── services/           # API and service adapters
│   │   ├── utils/              # Constants, formatters, and image resolvers
│   │   ├── App.jsx             # Route definitions & guards
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global Tailwind directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express)
│   ├── config/
│   │   └── db.js               # PostgreSQL connection pool & migrations
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clothingController.js
│   │   ├── dashboardController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & isolation
│   │   └── upload.js           # Multer file storage
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clothingRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   └── imageStorageService.js # Local & Cloudinary storage provider
│   ├── test/
│   │   └── testSuite.js        # Automated E2E verification test suite
│   ├── utils/
│   │   ├── seedRunner.js       # Standalone database seeder
│   │   └── statusCalculator.js # Centralized 75% wash status rules
│   ├── uploads/                # Local uploaded garment photos
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── database/
│   ├── schema.sql              # PostgreSQL DDL tables & indexes
│   └── seed.sql                # Seed data with demo user & realistic wardrobe
├── .env.example                # Sample environment configuration
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **PostgreSQL** *(optional for development, as an in-memory PostgreSQL engine runs automatically if a live database is not configured)*

### 2. Installation

Clone or open the project directory:

```bash
cd wardrobe-tracker
```

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

---

## ⚙️ Environment Variables

Copy `.env.example` in the root (or in `server/`):

```bash
cp .env.example server/.env
```

Default variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

JWT_SECRET=super_secret_jwt_key_wardrobe_tracker_2026_change_in_production
JWT_EXPIRES_IN=7d

# PostgreSQL Connection (Optional: if omitted, high-fidelity in-memory PostgreSQL is used)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/wardrobe_db

# Image Storage Provider: 'local' (default) or 'cloudinary'
STORAGE_PROVIDER=local

# Cloudinary Credentials (Optional - for production image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🗄️ Database Setup (PostgreSQL)

If using a native PostgreSQL server:

1. Create a database:
   ```sql
   CREATE DATABASE wardrobe_db;
   ```
2. Run `database/schema.sql`:
   ```bash
   psql -U postgres -d wardrobe_db -f database/schema.sql
   ```
3. Seed sample data (optional):
   ```bash
   psql -U postgres -d wardrobe_db -f database/seed.sql
   ```

*Note: The server automatically runs `schema.sql` and loads realistic initial demo clothes on startup if no external database is connected.*

---

## 🏃 Running the Application

### Start the Backend (Terminal 1)
```bash
cd server
npm start
```
*API runs at `http://localhost:5000`.*

### Start the Frontend (Terminal 2)
```bash
cd client
npm run dev
```
*Client runs at `http://localhost:5173`.*

Open your browser to `http://localhost:5173`.

### 👤 Demo Account Credentials
- **Email**: `demo@wardrobe.me`
- **Password**: `demo1234`
*(Or click the **"Explore with Demo Account"** button on the Login page for 1-click access)*

---

## 🧪 Running Automated Tests

Run the full end-to-end verification test suite:

```bash
cd server
node test/testSuite.js
```

All 35 test assertions test authentication, CRUD, wear tracking, washing, search, filters, sorting, dashboard, analytics, and user isolation.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Create a new user account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Clothes Management
- `GET /api/clothes` — List clothing items with query params: `search`, `category`, `status`, `sort`.
- `GET /api/clothes/:id` — Get item details with wear and wash history logs.
- `POST /api/clothes` — Create new clothing item (supports multipart image upload).
- `PUT /api/clothes/:id` — Update clothing item specifications or photo.
- `DELETE /api/clothes/:id` — Delete clothing item and associated history.

### Wear & Wash Tracking
- `POST /api/clothes/:id/wear` — Log a wear event (+1 current wear, +1 lifetime wear, updates status).
- `POST /api/clothes/:id/wash` — Log a wash event (resets current wear to 0, preserves lifetime wears, sets status to Clean).
- `GET /api/clothes/:id/wear-history` — Retrieve chronological wear events.
- `GET /api/clothes/:id/wash-history` — Retrieve chronological wash events.

### Dashboard & Analytics
- `GET /api/dashboard` — Live counts, reminders, recently worn, and recently washed items.
- `GET /api/analytics` — Wardrobe overview, category distribution, most worn, least worn, and most washed.

---

## 🔮 Future Architecture & AI Expansion

The application structure is decoupled to support future AI features without refactoring:

1. **AI Outfit Recommendations**:
   - Recommend tops + bottoms + shoes combinations based on category, style, fit, color theory, and current clean status.
2. **Computer Vision Auto-Tagging**:
   - Process uploaded images with multimodal models to detect category, primary color, pattern, and fabric style automatically.
3. **Smart Laundry & Weather Integration**:
   - Forecast laundry loads based on weather schedules and wear frequency.
4. **Cost Per Wear (CPW) Metrics**:
   - Add purchase price to calculate real-time cost-per-wear return on investment.
