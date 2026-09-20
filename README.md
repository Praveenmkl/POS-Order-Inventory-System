# 🛒 POS & Inventory Management System

A full-stack Point of Sale (POS) and Real-Time Inventory Management System with role-based access control, atomic stock reservation, and automated order expiry.

## 🌐 Live Demo

* **Frontend:** https://pos-order-inventory-system-7zaio6grb.vercel.app
* **Cashier Login:** https://pos-order-inventory-system-7zaio6grb.vercel.app/login
* **Admin Portal:** https://pos-order-inventory-system-7zaio6grb.vercel.app/admin/login
* **Backend API:** https://pos-order-inventory-system-iptq.vercel.app
* **GitHub:** https://github.com/Praveenmkl/POS-Order-Inventory-System

## 🔐 Demo Credentials

### Admin

```text
Email: admin@pos.com
Password: admin12345
```

### Cashier

```text
Email: cashier@test.com
Password: test123
```

> These credentials are for demo/testing purposes only.

## ✨ Features

*  JWT Authentication & Role-Based Access Control
*  Separate Admin & Cashier Portals
*  Product & Inventory Management
*  POS Terminal & Shopping Cart
*  Atomic Stock Reservation
*  Overselling Prevention
*  Automatic 5-Minute Order Expiry
*  Payment Success & Failure Handling
*  Order Management
*  Refund Management
*  User Management
*  Dashboard & Sales Analytics
*  Low Stock & Out-of-Stock Alerts

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* Radix UI / Shadcn
* Axios
* React Router
* Sonner

### Backend

* Node.js
* Express 5
* JWT
* Bcrypt.js
* Zod

### Database

* MongoDB Atlas
* Mongoose

### Deployment

* Vercel

## ⚙️ Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/Praveenmkl/POS-Order-Inventory-System.git
cd POS-Order-Inventory-System
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

## 📁 Project Structure

```text
POS-Order-Inventory-System/
├── frontend/
├── backend/
├── README.md
└── .gitignore
```

## 👨‍💻 Author

**Praveen Kalansooriya**

* GitHub: https://github.com/Praveenmkl
* Portfolio: https://portfolio26-flax.vercel.app
* LinkedIn: https://www.linkedin.com/in/praveen-kalansooriya-219198303/
* Medium: https://medium.com/@kalansooriya615

