# 🛒 POS & Inventory Management System

A full-stack Point of Sale (POS) and Real-Time Inventory Management System with atomic stock reservation, role-based access control, and automated order expiry.

---

## 🌐 1. Live Deployment Links

- **Frontend**: https://pos-order-inventory-system-47plt6nnf.vercel.app
- **Backend API**: https://pos-order-inventory-system-oep8.vercel.app/
- **GitHub Repository**: [https://github.com/Praveenmkl/POS-Order-Inventory-System](https://github.com/Praveenmkl/POS-Order-Inventory-System)

---

## 🛠️ 2. Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Radix UI / Shadcn, Axios, Sonner, React Router v7
- **Backend**: Node.js, Express 5, JWT, Bcrypt.js, Zod, CORS
- **Database**: MongoDB Atlas & Mongoose 9
- **Deployment**: Vercel (Frontend SPA & Serverless API with Cron Jobs)

---

## ⚙️ 3. Setup Steps

### Prerequisites
- **Node.js**: v18+
- **MongoDB Atlas** database URI

### 1. Clone & Install
```bash
git clone https://github.com/Praveenmkl/POS-Order-Inventory-System.git
cd "POS-Order-Inventory-System"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xf2zatw.mongodb.net/pos_inventory?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```

Run backend:
```bash
npm run dev
# Running at http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm run dev
# Running at http://localhost:5173
```

---

## 🧪 4. How to Test Each Feature

### **1. Authentication & Roles (Admin vs. Cashier)**
1. Go to `/register` and create an **Admin** account (`role: admin`).
2. Create a second **Cashier** account (`role: cashier`).
3. Log in as **Cashier**: Verify you can only access the POS terminal (`/pos`).
4. Log in as **Admin**: Verify full access to `/`, `/products`, `/orders`, and `/users`.

---

### **2. Products & Inventory Management**
1. Go to **Products** (`/products`) as Admin.
2. Click **Add Product** (e.g., Name: `Wireless Mouse`, SKU: `MOU-01`, Price: `25.00`, Stock: `10`).
3. Edit or delete products and verify stock numbers update immediately.

---

### **3. POS Terminal & Cart**
1. Go to **POS** (`/pos`).
2. Search products or filter by category.
3. Click items to add to cart; adjust quantities and check subtotal calculation.
4. Verify you cannot add more items than available stock `(stock - reservedStock)`.

---

### **4. Atomic Stock Reservation (Concurrency Safe)**
1. On POS, add `2` units of a product to cart and click **Checkout**.
2. Check the **Products** page in another tab:
   - Physical stock remains `10`, but **Reserved Stock** becomes `2`.
   - Available stock for other cashiers is now `8`.

---

### **5. Payment Flow (Success / Failure)**
1. In checkout modal, select **Success**:
   - Order becomes `completed`.
   - Physical stock decreases from `10` to `8` and reserved stock clears.
2. *(Alternative)* Select **Failed**:
   - Order becomes `cancelled`.
   - Reserved stock is immediately returned to available inventory.

---

### **6. Automated Order Expiry (5-Min Release)**
1. Checkout an order and leave it pending (unpaid).
2. The order auto-expires after 5 minutes.
3. Trigger release manually:
   ```bash
   curl http://localhost:5000/api/orders/release-expired
   ```
4. Verify order changes to `cancelled` and reserved stock returns to available pool.

---

### **7. Order Status Updates & Refunds**
1. Go to **Orders** (`/orders`) as Admin.
2. Filter by status (`pending`, `completed`, `cancelled`, `refunded`).
3. Click a completed order and select **Refund**:
   - Status changes to `refunded`.
   - Physical stock is automatically restored.

---

### **8. Dashboard Analytics**
1. Go to **Dashboard** (`/`) as Admin.
2. Verify live metrics: Total Sales, Today's Orders, Low Stock Alerts ($\le 5$), Out of Stock ($= 0$), and Active Reserved Stock.

---

### **9. User Management**
1. Go to **Users** (`/users`) as Admin.
2. Add, update, or remove cashier/admin accounts.

