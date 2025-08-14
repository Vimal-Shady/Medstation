# 🏥 Medstation

**Medstation** is a combined multi-panel healthcare and medicine vending management system built using React, integrating multiple standalone applications (admin, doctor, patient panels, and login systems) into a single platform. (Micro Frontend)

---

## 🩺 Overview
A robust platform for managing hospital operations and medicine vending machines. It allows hospitals and medical institutions to monitor, update, and maintain medicine inventory efficiently, along with managing doctors, patients, and appointments.

---

## 🔑 Features

### General Features
- **Multi-Panel System** – Admin Panel, Doctor Panel, Patient Panel, and Root Login.
- **Role-Based Access** – Secured login system for admins, doctors, and patients.
- **Real-Time Analytics** – Dashboard with database-driven stats.

### Medicine Vending Machine Features
- 🔐 **Admin Login Only** – Secured single-user login with hardcoded credentials (no duplicates).
- 💊 **Medicine Management** – Add, update, delete medicines; manage global + machine-specific stock.
- 🏪 **Vending Machine Control** – Create vending machines with unique IDs; assign medicines, prices, and quantities.
- 👨‍⚕️ **Doctor Overview** – View profiles, track prescriptions, and analyze performance.
- 📉 **Low Stock Alerts** – Email alerts when stock drops below 20%.
- 📧 **Email Notifications** – Built-in mailer (no `.env` files).
- 🗑️ **Notification Center** – Manage past alerts.
- 🛠️ **Full CRUD Support** – Complete control with validation.

---

## ⚙️ Tech Stack
- **Frontend:** React
- **Backend:** Node.js, Express, Next.js
- **Database:** MySQL (phpMyAdmin)

---

## 🛠️ Installation & Build

### 1️⃣ Extract Project
Ensure all files are extracted with **same folder names** (mandatory).

### 2️⃣ Build Commands
Run each block in a **new terminal**:

```bash
# Admin Panel
cd admin-panel
npm install --force
npm run build

# Doctor Panel
cd doctor-panel
npm install --force
npm run build

# Patient Panel Backend
cd patient-panel/backend
npm install --force

# Patient Panel
cd patient-panel
npm install --force
npm run build

# Login Backend
cd login-backend
npm install --force

# Root Login App
cd root-login-app
npm install --force
npm run build
```

Install required dev dependencies:
```bash
npm install --save-dev concurrently cross-env
```

### 3️⃣ Run Application
```bash
npm run medico
```

---

## 📂 Project Structure
```
Medstation/
 ├── admin-panel/
 ├── doctor-panel/
 ├── patient-panel/
 │    ├── backend/
 ├── login-backend/
 ├── root-login-app/
```

---

## ⭐ Contribute
If you find **Medstation** helpful, give this repo a **⭐ Star**  it keeps the code caffeinated ☕🚀
