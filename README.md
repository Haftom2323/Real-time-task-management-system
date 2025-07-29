# Real-Time Task Management System

## Goal

The goal of this project is to provide a modern, real-time collaborative task management platform for teams and organizations. It supports role-based access (admin/user), live task updates, notifications, and a clean, responsive UI.

---

## Project Structure

```
real-time-task-management-system/
│
├── backend/      # Node.js + Express + MongoDB API & Socket.IO server
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Express controllers
│   │   ├── middlewares/    # Auth & role middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic & socket events
│   │   └── sockets/        # Socket.IO setup
│   ├── package.json
│   └── ...
│
├── frontend/     # React + TypeScript + Vite client
│   ├── src/
│   │   ├── api/            # API utilities
│   │   ├── app/            # Redux store
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature modules (admin, user, auth, notifications)
│   │   ├── pages/          # Page-level components
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── README.md     # Project documentation
```

---

## Features

- **Real-time task updates** via Socket.IO
- **Role-based access**: Admins manage all tasks/users, users see their own tasks
- **Live notifications** for task creation, updates, and deletions
- **Modern UI** with responsive design (Material UI)
- **Authentication** (JWT-based)
- **User management** (admin only)

---

## Prerequisites

- Node.js
- npm or yarn
- MongoDB (local or cloud)

---

## How to Run

### 1. Clone the repository

```bash
git https://github.com/Haftom2323/Real-time-task-management-system.git
cd Real-time-task-management-system
```

### 2. Start the Backend

```bash
cd backend
npm install
Configure your .env
npm run dev
```
- The backend runs on `http://localhost:5000` by default.

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```
- The frontend runs on `http://localhost:5173` by default.

---

## Environment Variables

- **Backend**: Create a `.env` file in `/backend` with your MongoDB URI and JWT secret. As you can see below

 ```bash 
 PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/Real-Time-Task-Manager # or mongodb atlas
JWT_SECRET=yoursecretkey
JWT_EXPIRES_IN=1d
```
- **Frontend**: Update API base URLs in `/frontend/src/api/axios.ts` if needed.

---

## Default Admin User

If you run the backend for the first time, a default admin user may be seeded (see `/backend/src/scripts/seedAdmin.ts`).  
Check the script or `.env` for default credentials.

